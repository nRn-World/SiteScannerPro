import { CoreWebVitals, ScannerIssue, ScanMetrics, ScanScreenshots, Severity, DeviceMode } from '../rules/types';
import type { Language } from '../i18n/translations';
import { deviceLabel, localizedIssue } from '../i18n/scanLocale';

interface VitalsAudit {
  score?: number | null;
  displayValue?: string;
  numericValue?: number;
  title?: string;
  description?: string;
  details?: {
    data?: string;
    items?: Array<{ data?: string; screenshot?: { data?: string } }>;
  };
}

interface VitalsApiResponse {
  lighthouseResult?: {
    categories?: Record<string, { score?: number }>;
    audits?: Record<string, VitalsAudit>;
  };
}

function mapAuditSeverity(score: number | null | undefined): Severity {
  if (score === null || score === undefined) return 'Medium';
  if (score < 0.5) return 'High';
  if (score < 0.9) return 'Medium';
  return 'Low';
}

function parseMetric(
  audits: NonNullable<VitalsApiResponse['lighthouseResult']>['audits'],
  id: string
): number | undefined {
  const value = audits?.[id]?.numericValue;
  return value !== undefined ? Math.round(value) : undefined;
}

function toDataUrl(data: string): string {
  return data.startsWith('data:') ? data : `data:image/jpeg;base64,${data}`;
}

function extractScreenshots(
  audits: Record<string, VitalsAudit>,
  strategy: DeviceMode
): ScanScreenshots {
  const screenshots: ScanScreenshots = {};
  const final = audits['final-screenshot']?.details?.data;
  if (final) {
    const url = toDataUrl(final);
    if (strategy === 'mobile') screenshots.mobile = url;
    else screenshots.desktop = url;
  }
  const thumbnails = audits['screenshot-thumbnails']?.details?.items;
  if (thumbnails?.length) {
    screenshots.filmstrip = thumbnails
      .map((item) => item.screenshot?.data ?? item.data)
      .filter((d): d is string => !!d)
      .map(toDataUrl);
  }
  return screenshots;
}

async function fetchStrategy(url: string, strategy: DeviceMode, apiKey: string, language?: Language): Promise<{
  vitals: CoreWebVitals;
  issues: ScannerIssue[];
  metricOverrides: Partial<ScanMetrics>;
  screenshots: ScanScreenshots;
} | null> {
  const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
  const params = new URLSearchParams({ url, key: apiKey, strategy });
  categories.forEach((c) => params.append('category', c));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`,
      { signal: controller.signal }
    );

    if (!res.ok) {
      console.warn(`Vitals API error (${strategy}):`, res.status);
      return null;
    }

    const data = (await res.json()) as VitalsApiResponse;
    const result = data.lighthouseResult;
    if (!result?.categories || !result.audits) return null;

    const score = (cat: string) =>
      result.categories?.[cat]?.score !== undefined
        ? Math.round((result.categories[cat].score ?? 0) * 100)
        : undefined;

    const vitals: CoreWebVitals = {
      performanceScore: score('performance'),
      seoScore: score('seo'),
      accessibilityScore: score('accessibility'),
      bestPracticesScore: score('best-practices'),
      lcp: parseMetric(result.audits, 'largest-contentful-paint'),
      cls: result.audits['cumulative-layout-shift']?.numericValue,
      inp: parseMetric(result.audits, 'interaction-to-next-paint') ?? parseMetric(result.audits, 'max-potential-fid'),
      fcp: parseMetric(result.audits, 'first-contentful-paint'),
      ttfb: parseMetric(result.audits, 'server-response-time'),
      speedIndex: parseMetric(result.audits, 'speed-index')
    };

    const auditIds = [
      'largest-contentful-paint', 'cumulative-layout-shift', 'interaction-to-next-paint',
      'render-blocking-resources', 'unused-javascript', 'unused-css-rules',
      'modern-image-formats', 'uses-responsive-images', 'uses-text-compression',
      'is-on-https', 'redirects-http', 'meta-description', 'document-title',
      'crawlable-anchors', 'hreflang', 'image-alt', 'color-contrast', 'link-name', 'button-name'
    ];

    const issues: ScannerIssue[] = [];
    for (const id of auditIds) {
      const audit = result.audits[id];
      if (!audit || audit.score === null || audit.score === undefined || audit.score >= 0.9) continue;

      const device = deviceLabel(language, strategy);
      const deviceLower = device.toLowerCase();
      const auditTitle = audit.title ?? id;
      const auditDescription = audit.displayValue
        ? `${audit.description ?? ''} (${audit.displayValue})`.trim()
        : (audit.description ?? (language === 'sv'
          ? 'Prestanda- eller kvalitetsproblem upptäckt.'
          : 'Performance or quality issue detected.'));

      issues.push(localizedIssue(language, 'vitals.generic', {
        category: id.includes('meta') || id.includes('title') || id.includes('hreflang') || id.includes('crawlable')
          ? 'SEO'
          : id.includes('contrast') || id.includes('alt') || id.includes('link-name') || id.includes('button-name')
            ? 'Accessibility'
            : id.includes('https') || id.includes('redirects')
              ? 'Security'
              : 'Performance',
        severity: mapAuditSeverity(audit.score),
        source: 'vitals',
        device: strategy,
        params: {
          title: auditTitle,
          description: auditDescription,
          device,
          deviceLower
        }
      }));
    }

    const metricOverrides: Partial<ScanMetrics> = {};
    if (vitals.performanceScore !== undefined) metricOverrides.performance = vitals.performanceScore;
    if (vitals.seoScore !== undefined) metricOverrides.seo = vitals.seoScore;
    if (vitals.accessibilityScore !== undefined) metricOverrides.accessibility = vitals.accessibilityScore;

    return {
      vitals,
      issues,
      metricOverrides,
      screenshots: extractScreenshots(result.audits, strategy)
    };
  } catch (err) {
    console.warn(`Vitals analysis failed (${strategy}):`, err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Hämtar Core Web Vitals för både mobil och desktop via Google PageSpeed API. */
export async function runVitalsAnalysis(url: string, language?: Language): Promise<{
  vitals: CoreWebVitals;
  vitalsByDevice: { mobile?: CoreWebVitals; desktop?: CoreWebVitals };
  issues: ScannerIssue[];
  metricOverrides: Partial<ScanMetrics>;
  screenshots: ScanScreenshots;
} | null> {
  const apiKey = process.env.VITALS_API_KEY;
  if (!apiKey) return null;

  const [mobile, desktop] = await Promise.all([
    fetchStrategy(url, 'mobile', apiKey, language),
    fetchStrategy(url, 'desktop', apiKey, language)
  ]);

  if (!mobile && !desktop) return null;

  const primary = mobile ?? desktop!;
  const screenshots: ScanScreenshots = {
    ...(mobile?.screenshots ?? {}),
    ...(desktop?.screenshots ?? {})
  };
  if (!screenshots.filmstrip?.length && desktop?.screenshots?.filmstrip?.length) {
    screenshots.filmstrip = desktop.screenshots.filmstrip;
  }

  return {
    vitals: primary.vitals,
    vitalsByDevice: {
      mobile: mobile?.vitals,
      desktop: desktop?.vitals
    },
    issues: [...(mobile?.issues ?? []), ...(desktop?.issues ?? [])],
    metricOverrides: primary.metricOverrides,
    screenshots
  };
}
