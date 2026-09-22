import { Request, Response } from 'express';
import { ScannerService } from '../services/scanner.service';
import { ScanResult } from '../rules/types';
import { runBrowserAnalysis } from '../services/browserAnalysis.service';
import { attachIssueScreenshots } from '../services/issueScreenshot.service';
import { parseScanLanguage } from '../services/axeLocale.service';
import { isDevServer } from '../utils/devMode.server';
import type { Language } from '../i18n/translations';
import { apiError } from '../i18n/scanLocale';
import { VipService } from '../services/vip.service';
import { scanQueue } from '../services/scanQueue.instance';
import { resolveAndValidateTarget, revalidateHost, SsrfError } from '../utils/ssrf';
import { createLogger, hostOnly, newCorrelationId } from '../utils/logger';
import { Agent, setGlobalDispatcher, request as undiciRequest } from 'undici';

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

const DESCRIPTION_TEASER_LENGTH = 90;
const FETCH_HEADERS = { 'User-Agent': 'Mozilla/5.0 (compatible; SiteScannerBot/2.0)' };

/** Minsta total tid så att djupanalysen hinner visas i UI */
const MIN_SCAN_MS = { free: 22000, premium: 14000 };

function truncateDescription(description: string): string {
  if (description.length <= DESCRIPTION_TEASER_LENGTH) {
    return description;
  }
  const cutoff = description.slice(0, DESCRIPTION_TEASER_LENGTH);
  const lastSpace = cutoff.lastIndexOf(' ');
  return `${cutoff.slice(0, lastSpace > 40 ? lastSpace : DESCRIPTION_TEASER_LENGTH).trimEnd()}…`;
}

async function ensureMinDuration(startedAt: number, tier: 'free' | 'premium'): Promise<void> {
  const elapsed = Date.now() - startedAt;
  const remaining = MIN_SCAN_MS[tier] - elapsed;
  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }
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
  private vipService = new VipService();

  constructor() {
    this.scannerService = new ScannerService();
  }

  /**
   * FAS 1.7: SSRF – hostname valideras och anslutning sker mot verifierad IP.
   * FAS 1.4/5.2: kör genom global kö där Pro prioriteras.
   */
  private async fetchAndScan(
    targetUrl: string,
    includeVitals: boolean,
    language: Language,
    priority: number,
    log: ReturnType<typeof createLogger>
  ): Promise<ScanResult> {
    // DNS-uppslag + IP-validering före Puppeteer/fetch
    const target = await resolveAndValidateTarget(targetUrl, log);
    log.info('scan start', { host: hostOnly(target.originalUrl), ip: target.resolvedIp, priority });

    const result = await scanQueue.enqueue(priority, async () => {
      const [browserResult, supplementary] = await Promise.all([
        runBrowserAnalysis(target.safeUrl, language),
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
        language
      });

      scanResult = {
        ...scanResult,
        issues: await attachIssueScreenshots(finalUrl, scanResult.issues, html)
      };

      return scanResult;
    });

    log.info('scan done', { host: hostOnly(target.originalUrl), score: result.overallScore });
    return result;
  }

  private toPublicResult(result: ScanResult): ScanResult {
    return {
      overallScore: result.overallScore,
      summary: result.summary,
      metrics: result.metrics,
      metricsByDevice: result.metricsByDevice,
      vitals: result.vitals,
      vitalsByDevice: result.vitalsByDevice,
      analysis: result.analysis,
      screenshots: result.screenshots
        ? {
            desktop: result.screenshots.desktop,
            mobile: result.screenshots.mobile,
            filmstrip: result.screenshots.filmstrip
          }
        : undefined,
      issues: result.issues.map((issue) => ({
        category: issue.category,
        severity: issue.severity,
        title: issue.title,
        description: truncateDescription(issue.description),
        source: issue.source,
        device: issue.device,
        screenshot: issue.screenshot
      }))
    };
  }

  public scanFree = async (req: Request, res: Response): Promise<void> => {
    const startedAt = Date.now();
    const correlationId = newCorrelationId();
    const log = createLogger(correlationId);
    try {
      const { url, language: rawLanguage } = req.body;
      const language = parseScanLanguage(rawLanguage);

      const rawTarget = typeof url === 'string' ? url.trim() : '';
      if (!rawTarget) {
        res.status(400).json({ error: apiError(language, 'invalidUrl') });
        return;
      }
      const normalized = /^https?:\/\//i.test(rawTarget) ? rawTarget : `https://${rawTarget}`;
      try {
        // Basvalidering – djupare SSRF-kontroll sker i resolveAndValidateTarget
        new URL(normalized);
      } catch {
        res.status(400).json({ error: apiError(language, 'invalidUrl') });
        return;
      }

      // Gratis-nivån kör samma djupanalys (headless Chrome) som Pro –
      // det som låses bakom Pro är lösningarna (rekommendation/kodfix),
      // inte fynden. Stryp vitals om ingen API-nyckel finns.
      const result = await this.fetchAndScan(
        normalized,
        isDevServer() || !!process.env.VITALS_API_KEY,
        language,
        1, // gratis – lägre prioritet i kön
        log
      );
      await ensureMinDuration(startedAt, isDevServer() ? 'premium' : 'free');
      res.json(isDevServer() ? result : this.toPublicResult(result));
    } catch (error: any) {
      log.error('Free scan error', { error: error?.message });
      if (error instanceof SsrfError || error?.name === 'SsrfError') {
        res.status(400).json({ error: apiError(parseScanLanguage(req.body?.language), 'invalidUrl') });
        return;
      }
      if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
        res.status(504).json({ error: apiError(parseScanLanguage(req.body?.language), 'timeout') });
        return;
      }
      res.status(500).json({ error: apiError(parseScanLanguage(req.body?.language), 'failed', error.message) });
    }
  };

  public scanPremium = async (req: Request, res: Response): Promise<void> => {
    const startedAt = Date.now();
    const correlationId = newCorrelationId();
    const log = createLogger(correlationId);
    try {
      const { url, language: rawLanguage } = req.body;
      const language = parseScanLanguage(rawLanguage);

      const targetUrl = typeof url === 'string' && url ? url.trim() : '';
      if (!targetUrl) {
        res.status(400).json({ error: apiError(language, 'invalidUrl') });
        return;
      }
      const normalized = /^https?:\/\//i.test(targetUrl) ? targetUrl : `https://${targetUrl}`;

      const result = await this.fetchAndScan(normalized, true, language, 0, log);
      await ensureMinDuration(startedAt, 'premium');

      // VIP: förbrukas först efter lyckad skanning så nätverksfel inte bränner länken.
      const license = req.license;
      let vipConsumed = false;
      if ((license?.kind === 'vip' || license?.source === 'vip') && license.vipId) {
        vipConsumed = this.vipService.consumeScan(license.vipId);
        if (!vipConsumed) {
          res.status(403).json({ error: 'VIP-länken är redan använd.' });
          return;
        }
      }

      if (vipConsumed) {
        res.setHeader('X-Vip-Consumed', '1');
      }

      res.json(result);
    } catch (error: any) {
      log.error('Premium scan error', { error: error?.message });
      if (error instanceof SsrfError || error?.name === 'SsrfError') {
        res.status(400).json({ error: apiError(parseScanLanguage(req.body?.language), 'invalidUrl') });
        return;
      }
      if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
        res.status(504).json({ error: apiError(parseScanLanguage(req.body?.language), 'timeout') });
        return;
      }
      res.status(500).json({ error: apiError(parseScanLanguage(req.body?.language), 'failed', error.message) });
    }
  };
}
