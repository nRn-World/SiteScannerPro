import { Request, Response } from 'express';
import { ScannerService } from '../services/scanner.service';
import { ScanResult } from '../rules/types';
import { runBrowserAnalysis } from '../services/browserAnalysis.service';
import { attachIssueScreenshots } from '../services/issueScreenshot.service';
import { parseScanLanguage } from '../services/axeLocale.service';
import { isDevServer } from '../utils/devMode.server';
import type { Language } from '../i18n/translations';
import { apiError } from '../i18n/scanLocale';
import { scanQueue } from '../services/scanQueue.instance';
import { resolveAndValidateTarget, SsrfError } from '../utils/ssrf';
import { createLogger, hostOnly, newCorrelationId } from '../utils/logger';
import { saveReport } from '../services/reportStore.service';
import { getCachedScan, scanCacheKey, setCachedScan } from '../services/scanCache.service';
import { Agent, setGlobalDispatcher, request as undiciRequest } from 'undici';
import {
  DEFAULT_SCAN_OPTIONS,
  parseScanOptions,
  scanOptionsCacheKey,
  type ScanRunOptions
} from '../utils/scanOptions';

/**
 * FAS 1.7: Custom undici Agent som validerar varje anslutnings IP (DNS rebinding-
 * skydd för fetch) och blockerar redirects till privata adresser.
 */
const { isPrivateIp } = await import('../utils/ssrf');
const safeAgent = new Agent({
  connect: {
    lookup(hostname: string, options: unknown, callback: (err: NodeJS.ErrnoException | null, addresses?: Array<{ address: string; family: number }>) => void) {
      import('dns').then((dns) => {
        dns.lookup(hostname, { all: true, verbatim: true }, (err, addresses) => {
          if (err) {
            callback(err);
            return;
          }
          const safe = (addresses ?? []).filter((a) => !isPrivateIp(a.address));
          if (safe.length === 0) {
            const blocked = Object.assign(new Error(`Blocked private address for ${hostname}`), { code: 'ENOTFOUND' });
            callback(blocked as NodeJS.ErrnoException);
            return;
          }
          callback(null, safe.map((a) => ({ address: a.address, family: a.family })));
        });
      });
    }
  }
});
setGlobalDispatcher(safeAgent);

const FETCH_HEADERS = { 'User-Agent': 'Mozilla/5.0 (compatible; SiteScannerBot/2.0)' };

/** Absolute API origin used for saved-report screenshot URLs. */
function getApiOrigin(req: Request): string {
  const configured = process.env.PUBLIC_API_URL || process.env.RENDER_EXTERNAL_URL;
  if (configured) return configured.replace(/\/$/, '');

  const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const protocol = forwardedProto || req.protocol;
  return `${protocol}://${req.get('host') || 'localhost'}`;
}

async function fetchSupplementaryData(baseUrl: string): Promise<{
  robotsTxt: string | null;
  sitemapFound: boolean;
}> {
  const origin = new URL(baseUrl).origin;
  let robotsTxt: string | null = null;
  let sitemapFound = false;

  try {
    const robotsRes = await fetch(`${origin}/robots.txt`, {
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(8000)
    });
    if (robotsRes.ok) {
      robotsTxt = await robotsRes.text();
      sitemapFound = /sitemap:/i.test(robotsTxt);
    }
  } catch {
    // valfritt
  }

  if (!sitemapFound) {
    try {
      const sitemapRes = await fetch(`${origin}/sitemap.xml`, {
        headers: FETCH_HEADERS,
        signal: AbortSignal.timeout(8000)
      });
      sitemapFound = sitemapRes.ok;
    } catch {
      // valfritt
    }
  }

  return { robotsTxt, sitemapFound };
}

async function fetchFallbackHtml(targetUrl: string): Promise<{
  html: string;
  finalUrl: string;
  loadTime: number;
  ttfb: number;
  headers: Headers;
  contentLength: number;
}> {
  const headersStart = Date.now();
  const response = await fetch(targetUrl, {
    headers: FETCH_HEADERS,
    signal: AbortSignal.timeout(30000),
    redirect: 'follow'
  });
  // Node fetch resolves when response headers arrive ≈ TTFB
  const ttfb = Date.now() - headersStart;

  if (!response.ok) {
    throw new Error(`Webbplatsen svarade med status ${response.status}`);
  }

  const html = await response.text();
  return {
    html,
    finalUrl: response.url || targetUrl,
    loadTime: Date.now() - headersStart,
    ttfb: Math.max(1, ttfb),
    headers: response.headers as unknown as Headers,
    contentLength: Number(response.headers.get('content-length')) || Buffer.byteLength(html, 'utf8')
  };
}

export class ScanController {
  private scannerService: ScannerService;

  constructor() {
    this.scannerService = new ScannerService();
  }

  /**
   * FAS 1.7: SSRF – hostname valideras och anslutning sker mot verifierad IP.
   * FAS 1.4/5.2: kör genom den globala kön med begränsad samtidighet.
   */
  private async fetchAndScan(
    targetUrl: string,
    includeVitals: boolean,
    language: Language,
    priority: number,
    log: ReturnType<typeof createLogger>,
    captureScreenshots = true,
    scanOptions: ScanRunOptions = DEFAULT_SCAN_OPTIONS
  ): Promise<ScanResult> {
    // DNS-uppslag + IP-validering före Puppeteer/fetch
    const target = await resolveAndValidateTarget(targetUrl, log);
    log.info('scan start', { host: hostOnly(target.originalUrl), ip: target.resolvedIp, priority });

    const result = await scanQueue.enqueue(priority, async () => {
      const [browserResult, supplementary] = await Promise.all([
        runBrowserAnalysis(target.safeUrl, language, {
          devices: scanOptions.devices,
          categories: scanOptions.categories,
          thorough: scanOptions.thorough
        }),
        fetchSupplementaryData(target.safeUrl)
      ]);

      let html: string;
      let finalUrl: string;
      let loadTime: number;
      let ttfb: number;
      let headers: Headers;
      let contentLength: number;
      let isHttps: boolean;

      if (browserResult) {
        html = browserResult.html;
        finalUrl = browserResult.finalUrl;
        loadTime = browserResult.loadTime;
        ttfb = browserResult.ttfb;
        contentLength = Buffer.byteLength(html, 'utf8');
        isHttps = finalUrl.startsWith('https://');
        headers = new Headers(browserResult.headers);
      } else {
        const fallback = await fetchFallbackHtml(target.safeUrl);
        html = fallback.html;
        finalUrl = fallback.finalUrl;
        loadTime = fallback.loadTime;
        ttfb = fallback.ttfb;
        headers = fallback.headers;
        contentLength = fallback.contentLength;
        isHttps = finalUrl.startsWith('https://');
      }

      // FAS 1.7: blockera omdirigeringar till privata adresser.
      // Undici-agenten filtrerar redan varje anslutning; här re-validerar vi
      // slut-URL:en efterföljande DNS-stillighet.
      if (finalUrl) {
        try {
          const finalCheck = await resolveAndValidateTarget(finalUrl, log);
          void finalCheck;
        } catch (err) {
          if (err instanceof SsrfError || (err as Error)?.name === 'SsrfError') {
            throw err;
          }
          throw new SsrfError('private');
        }
      }

      const context = {
        url: targetUrl,
        finalUrl,
        loadTime,
        ttfb,
        isHttps,
        headers,
        contentLength,
        robotsTxt: supplementary.robotsTxt,
        sitemapFound: supplementary.sitemapFound,
        language
      };

      let scanResult = await this.scannerService.scan(html, context, {
        includeVitals,
        browserResult,
        language,
        categories: scanOptions.categories,
        devices: scanOptions.devices,
        thorough: scanOptions.thorough
      });

      // Issue-annotated screenshots are the strongest proof. Capture them for
      // every thorough scan. LOW_MEMORY=1 disables them.
      const lowMemoryMode = process.env.LOW_MEMORY === '1';
      const shouldCaptureIssueShots =
        captureScreenshots &&
        scanOptions.thorough &&
        !lowMemoryMode;
      scanResult = {
        ...scanResult,
        issues: shouldCaptureIssueShots
          ? await attachIssueScreenshots(finalUrl, scanResult.issues, html)
          : scanResult.issues
      };

      return scanResult;
    });

    log.info('scan done', { host: hostOnly(target.originalUrl), score: result.overallScore });
    return result;
  }

  /**
   * Internal scan used by competitor comparison. It skips the expensive
   * annotated issue screenshots because a comparison only needs scores,
   * counts and titles.
   */
  public async scanForComparison(targetUrl: string, language: Language): Promise<ScanResult> {
    const log = createLogger(newCorrelationId());
    return this.fetchAndScan(targetUrl, true, language, 0, log, false, DEFAULT_SCAN_OPTIONS);
  }

  public scanFree = async (req: Request, res: Response): Promise<void> => {
    const correlationId = newCorrelationId();
    const log = createLogger(correlationId);
    try {
      const { url, language: rawLanguage } = req.body;
      const language = parseScanLanguage(rawLanguage);
      const scanOptions = parseScanOptions(req.body);
      const forceFresh = req.body?.force === true;

      const rawTarget = typeof url === 'string' ? url.trim() : '';
      if (!rawTarget) {
        res.status(400).json({ error: apiError(language, 'invalidUrl'), code: 'invalid_url' });
        return;
      }
      const normalized = /^https?:\/\//i.test(rawTarget) ? rawTarget : `https://${rawTarget}`;
      try {
        // Basvalidering – djupare SSRF-kontroll sker i resolveAndValidateTarget
        new URL(normalized);
      } catch {
        res.status(400).json({ error: apiError(language, 'invalidUrl'), code: 'invalid_url' });
        return;
      }

      // Alla skanningar kör samma djupanalys (headless Chrome) och får samma
      // fullständiga resultat. Stryp vitals om ingen API-nyckel finns.
      const includeVitals = isDevServer() || !!process.env.VITALS_API_KEY;
      const cacheKey = scanCacheKey(
        normalized,
        language,
        includeVitals,
        scanOptionsCacheKey(scanOptions)
      );
      let result = forceFresh ? null : getCachedScan(cacheKey);

      if (forceFresh) {
        log.info('scan cache bypass', { host: hostOnly(normalized) });
      } else if (result) {
        log.info('scan cache hit', { host: hostOnly(normalized) });
      }

      if (!result) {
        result = await this.fetchAndScan(
          normalized,
          includeVitals,
          language,
          0,
          log,
          true,
          scanOptions
        );
      }

      // Spara hela resultatet så rapporten får en permalänk som överlever refresh.
      if (!result.reportId) {
        const saved = saveReport({
          result,
          url: normalized,
          language,
          apiOrigin: getApiOrigin(req)
        });
        if (saved) result = { ...result, reportId: saved.id };
      }

      setCachedScan(cacheKey, result);
      res.json(result);
    } catch (error: any) {
      log.error('Free scan error', { error: error?.message });
      if (error instanceof SsrfError || error?.name === 'SsrfError') {
        res.status(400).json({
          error: apiError(parseScanLanguage(req.body?.language), 'invalidUrl'),
          code: 'blocked'
        });
        return;
      }
      if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
        res.status(504).json({
          error: apiError(parseScanLanguage(req.body?.language), 'timeout'),
          code: 'timeout'
        });
        return;
      }
      res.status(500).json({
        error: apiError(parseScanLanguage(req.body?.language), 'failed', error.message),
        code: 'unavailable'
      });
    }
  };
}
