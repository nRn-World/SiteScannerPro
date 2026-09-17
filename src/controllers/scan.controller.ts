import { Request, Response } from 'express';
import { ScannerService } from '../services/scanner.service';
import { ScanResult } from '../rules/types';
import { runBrowserAnalysis } from '../services/browserAnalysis.service';
import { attachIssueScreenshots } from '../services/issueScreenshot.service';
import { parseScanLanguage } from '../services/axeLocale.service';
import { isDevServer } from '../utils/devMode.server';
import type { Language } from '../i18n/translations';
import { apiError } from '../i18n/scanLocale';

const PRIVATE_HOST_PATTERN = /^(localhost$|.*\.localhost$|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.0\.0\.0$|\[::1?\]?$|::1$)/;
const DESCRIPTION_TEASER_LENGTH = 90;
const FETCH_HEADERS = { 'User-Agent': 'Mozilla/5.0 (compatible; SiteScannerBot/2.0)' };

/** Minsta total tid så att djupanalysen hinner visas i UI */
const MIN_SCAN_MS = { free: 22000, premium: 14000 };

function validateTargetUrl(rawUrl: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return null;
  }

  const hostname = parsed.hostname.toLowerCase();
  if (PRIVATE_HOST_PATTERN.test(hostname)) {
    return null;
  }

  return parsed.toString();
}

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

  constructor() {
    this.scannerService = new ScannerService();
  }

  private async fetchAndScan(targetUrl: string, includeVitals = true, language: Language = 'en'): Promise<ScanResult> {
    const [browserResult, supplementary] = await Promise.all([
      runBrowserAnalysis(targetUrl, language),
      fetchSupplementaryData(targetUrl)
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
      const fallback = await fetchFallbackHtml(targetUrl);
      html = fallback.html;
      finalUrl = fallback.finalUrl;
      loadTime = fallback.loadTime;
      ttfb = fallback.ttfb;
      headers = fallback.headers;
      contentLength = fallback.contentLength;
      isHttps = finalUrl.startsWith('https://');
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

    let result = await this.scannerService.scan(html, context, {
      includeVitals,
      browserResult,
      language
    });

    result = {
      ...result,
      issues: await attachIssueScreenshots(finalUrl, result.issues, html)
    };

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
    try {
      const { url, language: rawLanguage } = req.body;
      const language = parseScanLanguage(rawLanguage);

      const targetUrl = typeof url === 'string' ? validateTargetUrl(url) : null;
      if (!targetUrl) {
        res.status(400).json({ error: apiError(language, 'invalidUrl') });
        return;
      }

      const result = await this.fetchAndScan(
        targetUrl,
        isDevServer() || !!process.env.VITALS_API_KEY,
        language
      );
      await ensureMinDuration(startedAt, isDevServer() ? 'premium' : 'free');
      res.json(isDevServer() ? result : this.toPublicResult(result));
    } catch (error: any) {
      console.error('Free scan error:', error);
      if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
        res.status(504).json({ error: apiError(parseScanLanguage(req.body?.language), 'timeout') });
        return;
      }
      res.status(500).json({ error: apiError(parseScanLanguage(req.body?.language), 'failed', error.message) });
    }
  };

  public scanPremium = async (req: Request, res: Response): Promise<void> => {
    const startedAt = Date.now();
    try {
      const { url, language: rawLanguage } = req.body;
      const language = parseScanLanguage(rawLanguage);

      const targetUrl = typeof url === 'string' ? validateTargetUrl(url) : null;
      if (!targetUrl) {
        res.status(400).json({ error: apiError(language, 'invalidUrl') });
        return;
      }

      const result = await this.fetchAndScan(targetUrl, true, language);
      await ensureMinDuration(startedAt, 'premium');
      res.json(result);
    } catch (error: any) {
      console.error('Premium scan error:', error);
      if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
        res.status(504).json({ error: apiError(parseScanLanguage(req.body?.language), 'timeout') });
        return;
      }
      res.status(500).json({ error: apiError(parseScanLanguage(req.body?.language), 'failed', error.message) });
    }
  };
}
