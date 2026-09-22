import { Page, HTTPResponse } from 'puppeteer';
import { createRequire } from 'module';
import type { Language } from '../i18n/translations';
import { getAxeLocale, localizeAxeViolation } from './axeLocale.service';
import { ScannerIssue, ScanScreenshots, Severity, IssueDevice } from '../rules/types';
import { getSharedBrowser, closeSharedBrowser, registerScanForBrowser, recycleIfStrained } from './puppeteerBrowser';
import { deviceSuffix, localizedIssue, scanMsg } from '../i18n/scanLocale';
import { acquirePageSlot } from '../utils/puppeteerSemaphore';

/** FAS 5.5: hård övre tidsgräns för hela browseranalysen. */
const ANALYSIS_TIMEOUT_MS = Math.max(30000, Number(process.env.ANALYSIS_TIMEOUT_MS || '') || 120000);

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms).unref?.()
    )
  ]);
}

const require = createRequire(import.meta.url);
const AXE_SCRIPT_PATH = require.resolve('axe-core/axe.min.js');

export interface BrowserAnalysisResult {
  html: string;
  finalUrl: string;
  /** Tid för första dokumentladdningen (goto → networkidle), inte hela analysen */
  loadTime: number;
  /** Riktig Time to First Byte från Navigation Timing */
  ttfb: number;
  axeIssues: ScannerIssue[];
  runtimeIssues: ScannerIssue[];
  screenshots: ScanScreenshots;
  headers: Record<string, string>;
}

function mapImpact(impact: string | null | undefined): Severity {
  switch (impact) {
    case 'critical':
    case 'serious':
      return 'High';
    case 'moderate':
      return 'Medium';
    default:
      return 'Low';
  }
}

function toDataUrl(base64: string): string {
  return `data:image/jpeg;base64,${base64}`;
}

function frameHash(dataUrl: string): string {
  return dataUrl.slice(100, 300);
}

function truncateUrl(url: string, max = 120): string {
  return url.length > max ? `${url.slice(0, max)}…` : url;
}

async function captureFilmstrip(page: Page): Promise<string[]> {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = page.viewport()?.height ?? 900;

  if (height <= vh * 1.1) return [];

  const step = Math.max(Math.floor(vh * 0.85), 500);
  const positions: number[] = [];
  for (let y = 0; y < height - vh; y += step) positions.push(y);
  positions.push(Math.max(0, height - vh));

  const frames: string[] = [];
  const seen = new Set<string>();
  let lastY = -9999;

  for (const y of positions) {
    if (y - lastY < 80 && lastY >= 0) continue;
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    await new Promise((r) => setTimeout(r, 400));
    const shot = toDataUrl(await page.screenshot({ encoding: 'base64', type: 'jpeg', quality: 70 }));
    const hash = frameHash(shot);
    if (seen.has(hash)) continue;
    seen.add(hash);
    frames.push(shot);
    lastY = y;
    if (frames.length >= 5) break;
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  return frames;
}

function axeTargetToSelector(target: string[]): string {
  if (target.length === 1) return target[0];
  return target.join(' ');
}

async function runAxeInBrowser(
  page: Page,
  language?: Language,
  device: IssueDevice = 'both'
): Promise<ScannerIssue[]> {
  await page.addScriptTag({ path: AXE_SCRIPT_PATH });
  const locale = getAxeLocale(language);

  const violations = await page.evaluate(async (localeData) => {
    if (localeData) {
      // @ts-expect-error axe injiceras via script-tag
      axe.configure({ locale: localeData });
    }
    // @ts-expect-error axe injiceras via script-tag
    const results = await axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']
      }
    });
    return results.violations.map((v: {
      id: string;
      help: string;
      description: string;
      impact: string;
      helpUrl: string;
      nodes: Array<{ target: string[]; failureSummary?: string; html?: string }>;
    }) => ({
      id: v.id,
      help: v.help,
      description: v.description,
      impact: v.impact,
      helpUrl: v.helpUrl,
      nodes: v.nodes.slice(0, 5)
    }));
  }, locale ?? null);

  const issues: ScannerIssue[] = [];
  const suffix = device === 'mobile' || device === 'desktop' ? deviceSuffix(language, device) : '';

  for (const v of violations) {
    const localized = localizeAxeViolation(
      v.id,
      v.help,
      v.description,
      undefined,
      language
    );

    const occurrenceLabel =
      language === 'sv'
        ? `${v.nodes.length} förekomst${v.nodes.length === 1 ? '' : 'er'}`
        : `${v.nodes.length} occurrence${v.nodes.length === 1 ? '' : 's'}`;

    issues.push({
      category: 'Accessibility',
      severity: mapImpact(v.impact),
      title: `${localized.title}${suffix}`,
      description: `${localized.description} (${occurrenceLabel}).`,
      recommendation: scanMsg(language, 'a11y.axe.fix', 'recommendation', {
        title: localized.title,
        description: localized.description,
        url: v.helpUrl
      }),
      codeSnippet: v.nodes[0]?.html?.slice(0, 500),
      selector: v.nodes[0]?.target?.length ? axeTargetToSelector(v.nodes[0].target) : undefined,
      source: 'axe',
      device
    });

    for (let i = 1; i < Math.min(v.nodes.length, 3); i++) {
      const node = v.nodes[i];
      const failure = node.failureSummary ?? '';
      const nodeLocalized = localizeAxeViolation(
        v.id,
        v.help,
        v.description,
        failure || undefined,
        language
      );
      issues.push({
        category: 'Accessibility',
        severity: mapImpact(v.impact),
        title: `${nodeLocalized.title}${suffix} (#${i + 1})`,
        description: nodeLocalized.description,
        recommendation: scanMsg(language, 'a11y.axe.fix', 'recommendation', {
          title: nodeLocalized.title,
          description: nodeLocalized.description,
          url: v.helpUrl
        }),
        codeSnippet: node.html?.slice(0, 500),
        selector: node.target?.length ? axeTargetToSelector(node.target) : undefined,
        source: 'axe',
        device
      });
    }
  }

  return issues;
}

function buildRuntimeIssues(
  consoleErrors: string[],
  pageErrors: string[],
  failedResponses: Array<{ url: string; status: number }>,
  failedRequests: string[],
  device: IssueDevice = 'both',
  language?: Language
): ScannerIssue[] {
  const issues: ScannerIssue[] = [];
  const suffix =
    device === 'mobile' || device === 'desktop' ? deviceSuffix(language, device) : '';

  const uniquePageErrors = [...new Set(pageErrors)].slice(0, 8);
  for (const msg of uniquePageErrors) {
    issues.push(localizedIssue(language, 'code.js.exception', {
      category: 'Code',
      severity: 'High',
      source: 'browser',
      device,
      codeSnippet: msg.slice(0, 400),
      params: { suffix, message: msg.slice(0, 280) }
    }));
  }

  const uniqueConsole = [...new Set(consoleErrors)]
    .filter((m) => !/favicon\.ico|Failed to load resource/i.test(m))
    .slice(0, 6);
  if (uniqueConsole.length > 0) {
    issues.push(localizedIssue(language, 'code.console.errors', {
      category: 'Code',
      severity: 'Medium',
      source: 'browser',
      device,
      codeSnippet: uniqueConsole.slice(0, 3).join('\n'),
      params: {
        suffix,
        count: uniqueConsole.length,
        example: uniqueConsole[0].slice(0, 180)
      }
    }));
  }

  const uniqueFailed = new Map<string, number>();
  for (const fr of failedResponses) {
    if (/favicon\.ico/i.test(fr.url)) continue;
    const key = `${fr.status}::${fr.url.split('?')[0]}`;
    if (!uniqueFailed.has(key)) uniqueFailed.set(key, fr.status);
  }

  const failedList = [...uniqueFailed.entries()].slice(0, 15);
  if (failedList.length > 0) {
    const byStatus = new Map<number, string[]>();
    for (const [key, status] of failedList) {
      const url = key.replace(/^\d+::/, '');
      const list = byStatus.get(status) ?? [];
      list.push(url);
      byStatus.set(status, list);
    }

    for (const [status, urls] of byStatus) {
      issues.push(localizedIssue(language, 'perf.network.failed', {
        category: status >= 500 ? 'Performance' : 'Code',
        severity: status >= 500 ? 'High' : 'Medium',
        source: 'browser',
        device,
        codeSnippet: urls[0],
        params: {
          status,
          suffix,
          count: urls.length,
          samples: `${urls.slice(0, 3).map((u) => truncateUrl(u)).join(', ')}${urls.length > 3 ? '…' : ''}`
        }
      }));
    }
  }

  const uniqueReqFails = [...new Set(failedRequests)]
    .filter((u) => !/favicon\.ico/i.test(u))
    .slice(0, 8);
  if (uniqueReqFails.length > 0) {
    issues.push(localizedIssue(language, 'perf.network.incomplete', {
      category: 'Performance',
      severity: 'High',
      source: 'browser',
      device,
      codeSnippet: uniqueReqFails[0],
      params: {
        suffix,
        count: uniqueReqFails.length,
        samples: `${uniqueReqFails.slice(0, 3).map((u) => truncateUrl(u)).join(', ')}${uniqueReqFails.length > 3 ? '…' : ''}`
      }
    }));
  }

  return issues;
}

export async function runBrowserAnalysis(url: string, language?: Language): Promise<BrowserAnalysisResult | null> {
  const analysisStarted = Date.now();
  let page: Page | null = null;
  const releaseSlot = await acquirePageSlot();
  registerScanForBrowser();

  try {
    const browser = await getSharedBrowser();
    page = await browser.newPage();
    // Under free-tier minnesgräns: blockera tunga resurser som inte påverkar
    // DOM/headers-analysen nämnvärt (bilder, video, typsnitt).
    const lowMemory = !!process.env.RENDER || process.env.LOW_MEMORY === '1';
    if (lowMemory) {
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const type = req.resourceType();
        if (type === 'image' || type === 'media' || type === 'font') {
          void req.abort();
        } else {
          void req.continue();
        }
      });
    }
    await page.setUserAgent('Mozilla/5.0 (compatible; SiteScannerBot/2.0)');

    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const failedResponses: Array<{ url: string; status: number }> = [];
    const failedRequests: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      const message = err instanceof Error ? err.message : String(err);
      pageErrors.push(message);
    });
    page.on('response', (response: HTTPResponse) => {
      const status = response.status();
      if (status >= 400) {
        failedResponses.push({ url: response.url(), status });
      }
    });
    page.on('requestfailed', (request) => {
      failedRequests.push(request.url());
    });

    await page.setViewport({ width: 1350, height: 900, deviceScaleFactor: 1 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    );

    const gotoStart = Date.now();
    const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 35000 });
    const documentLoadTime = Date.now() - gotoStart;

    if (!response || !response.ok()) {
      throw new Error(`Webbplatsen svarade med status ${response?.status() ?? 'unknown'}`);
    }

    // Give late async errors a moment to surface
    await new Promise((r) => setTimeout(r, 1200));

    const finalUrl = page.url();
    const html = await page.content();
    const responseHeaders = response.headers();

    // Real TTFB from Navigation Timing (falls back to document load)
    const navTtfbRaw = await page
      .evaluate(`(() => {
        var nav = performance.getEntriesByType('navigation')[0];
        if (!nav || !isFinite(nav.responseStart) || nav.responseStart <= 0) return null;
        var value = nav.responseStart - (nav.requestStart > 0 ? nav.requestStart : nav.fetchStart);
        return value > 0 ? Math.round(value) : null;
      })()`)
      .catch(() => null);
    const navTtfb = typeof navTtfbRaw === 'number' ? navTtfbRaw : null;

    const timing = typeof response.timing === 'function' ? response.timing() : null;
    const headerTtfb =
      timing && timing.receiveHeadersEnd > 0 && timing.sendEnd >= 0
        ? Math.round(timing.receiveHeadersEnd - timing.sendEnd)
        : null;

    const ttfb = Math.max(
      1,
      navTtfb ?? headerTtfb ?? Math.min(documentLoadTime, Date.now() - analysisStarted)
    );

    const desktopShot = toDataUrl(await page.screenshot({ encoding: 'base64', type: 'jpeg', quality: 78 }));
    const filmstrip = await captureFilmstrip(page);
    const desktopAxe = await runAxeInBrowser(page, language, 'desktop');
    const desktopRuntime = buildRuntimeIssues(
      consoleErrors,
      pageErrors,
      failedResponses,
      failedRequests,
      'desktop',
      language
    );

    // Reset runtime collectors before mobile pass
    consoleErrors.length = 0;
    pageErrors.length = 0;
    failedResponses.length = 0;
    failedRequests.length = 0;

    // True mobile viewport + UA for the mobile result mode
    await page.setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    );
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.goto(finalUrl, { waitUntil: 'networkidle2', timeout: 35000 });
    await new Promise((r) => setTimeout(r, 800));
    const mobileShot = toDataUrl(await page.screenshot({ encoding: 'base64', type: 'jpeg', quality: 78 }));
    const mobileAxe = await runAxeInBrowser(page, language, 'mobile');
    const mobileRuntime = buildRuntimeIssues(
      consoleErrors,
      pageErrors,
      failedResponses,
      failedRequests,
      'mobile',
      language
    );

    const uniqueFilmstrip = filmstrip.filter((f) => frameHash(f) !== frameHash(desktopShot));

    // Frigör sidresurser innan resultatet byggs (free-tier-vänligt)
    await page.close().catch(() => {});
    page = null;
    void recycleIfStrained();

    return {
      html,
      finalUrl,
      loadTime: documentLoadTime,
      ttfb,
      axeIssues: [...desktopAxe, ...mobileAxe],
      runtimeIssues: [...desktopRuntime, ...mobileRuntime],
      screenshots: {
        desktop: desktopShot,
        mobile: mobileShot,
        filmstrip: uniqueFilmstrip.length >= 2 ? uniqueFilmstrip : undefined
      },
      headers: responseHeaders
    };
  } catch (err) {
    console.warn('Browser analysis failed:', err);
    // Browsern kan ha hamnat i dåligt tillstånd (t.ex. minne) – recycle så
    // nästa skanning börjar fräscht istället för att ärva felet.
    await closeSharedBrowser().catch(() => {});
    return null;
  } finally {
    if (page) await page.close().catch(() => {});
    releaseSlot();
  }
}

export async function closeBrowser(): Promise<void> {
  await closeSharedBrowser();
}

process.on('exit', () => { void closeBrowser(); });
