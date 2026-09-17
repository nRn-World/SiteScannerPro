import { ALL_RULES } from '../rules/core.rules';
import type { Language } from '../i18n/translations';
import {
  ScannerContext,
  ScanResult,
  ScanMetrics,
  ScannerIssue,
  ScanScreenshots,
  DeviceMode,
  DeviceMetricsMap,
  CoreWebVitals,
  IssueDevice
} from '../rules/types';
import { runAxeAudit, countAxeRules } from './accessibility.service';
import { runVitalsAnalysis } from './vitalsApi.service';
import { BrowserAnalysisResult } from './browserAnalysis.service';
import { attachAgentFixes } from './agentFix.service';
import { summarizeScan, localizeHardcodedIssues } from '../i18n/scanLocale';

export interface ScanOptions {
  includeVitals?: boolean;
  browserResult?: BrowserAnalysisResult | null;
  language?: Language;
}

/** Rules that mainly affect mobile UX / scoring */
const MOBILE_HEAVY_TITLE =
  /viewport|touch|mobil|lazy loading|bildformat|cls|layout|font|render-block|ttfb|html-sida|dom-element|javascript-filer|cache|komprimering|base64|inline-script|trasiga css|trasiga bild/i;

/** Rules that mainly affect desktop scoring */
const DESKTOP_HEAVY_TITLE =
  /desktop|stor html|många javascript|dom-element|render-blockerande/i;

function inferIssueDevice(issue: ScannerIssue): IssueDevice {
  if (issue.device) return issue.device;
  if (issue.source === 'vitals') {
    if (/\(mobil\)/i.test(issue.title)) return 'mobile';
    if (/\(desktop\)/i.test(issue.title)) return 'desktop';
  }
  if (MOBILE_HEAVY_TITLE.test(issue.title) && !DESKTOP_HEAVY_TITLE.test(issue.title)) {
    return 'mobile';
  }
  return 'both';
}

function issuesForDevice(issues: ScannerIssue[], device: DeviceMode): ScannerIssue[] {
  return issues.filter((issue) => {
    const d = inferIssueDevice(issue);
    return d === 'both' || d === device;
  });
}

export class ScannerService {
  public async scan(
    html: string,
    context: ScannerContext,
    options: ScanOptions = {}
  ): Promise<ScanResult> {
    const engines: string[] = ['SiteScanner Rules'];
    const browser = options.browserResult;

    if (browser) engines.push('Headless Chrome + runtime');

    const [ruleResults, axeFromDom, vitalsResult] = await Promise.all([
      Promise.all(ALL_RULES.map((rule) => rule.run(html, context))),
      browser?.axeIssues?.length
        ? Promise.resolve([] as ScannerIssue[])
        : runAxeAudit(html, context.finalUrl, options.language).catch((err) => {
            console.warn('axe audit failed:', err);
            return [] as ScannerIssue[];
          }),
      options.includeVitals !== false
        ? runVitalsAnalysis(context.finalUrl, options.language)
        : Promise.resolve(null)
    ]);

    const axeIssues = (browser?.axeIssues?.length ? browser.axeIssues : axeFromDom).map((issue) => ({
      ...issue,
      device: issue.device ?? ('both' as IssueDevice)
    }));
    engines.push('axe-core (WCAG 2.x / 2.1 / 2.2)');
    if (browser?.runtimeIssues?.length) engines.push('Browser runtime (console/network)');
    if (vitalsResult) engines.push('Core Web Vitals API');

    const ruleIssues = ruleResults.flat().map((issue) => ({
      ...issue,
      device: issue.device ?? inferIssueDevice(issue)
    }));

    const runtimeIssues = (browser?.runtimeIssues ?? []).map((issue) => ({
      ...issue,
      device: issue.device ?? ('both' as IssueDevice)
    }));

    const vitalsIssues = (vitalsResult?.issues ?? []).map((issue) => ({
      ...issue,
      device: issue.device ?? inferIssueDevice(issue)
    }));

    const allIssues: ScannerIssue[] = [
      ...ruleIssues,
      ...axeIssues,
      ...runtimeIssues,
      ...vitalsIssues
    ];

    const deduped = this.deduplicateIssues(allIssues);
    const localized = localizeHardcodedIssues(options.language, deduped);
    const withAgentFixes = attachAgentFixes(localized, options.language);

    const metricsByDevice = this.buildMetricsByDevice(withAgentFixes, vitalsResult?.vitalsByDevice);
    // Default/public metrics = mobile (PageSpeed default)
    const metrics = metricsByDevice.mobile;
    const overallScore = this.overallFromMetrics(metrics);

    const screenshots: ScanScreenshots = {
      desktop: browser?.screenshots?.desktop ?? vitalsResult?.screenshots?.desktop,
      mobile: browser?.screenshots?.mobile ?? vitalsResult?.screenshots?.mobile,
      filmstrip: browser?.screenshots?.filmstrip?.length
        ? browser.screenshots.filmstrip
        : vitalsResult?.screenshots?.filmstrip
    };

    const cleanedScreenshots = Object.fromEntries(
      Object.entries(screenshots).filter(([, v]) => v !== undefined && !(Array.isArray(v) && v.length === 0))
    ) as ScanScreenshots;

    return {
      overallScore,
      summary: summarizeScan(options.language, overallScore, withAgentFixes.length, !!vitalsResult, !!browser),
      metrics,
      metricsByDevice,
      issues: withAgentFixes,
      vitals: vitalsResult?.vitalsByDevice?.mobile ?? vitalsResult?.vitals,
      vitalsByDevice: vitalsResult?.vitalsByDevice,
      screenshots: Object.keys(cleanedScreenshots).length ? cleanedScreenshots : undefined,
      analysis: {
        rulesChecked: ALL_RULES.length,
        accessibilityChecks: countAxeRules(),
        vitalsEnabled: !!vitalsResult,
        engines
      }
    };
  }

  private overallFromMetrics(metrics: ScanMetrics): number {
    return Math.round(
      (metrics.seo + metrics.performance + metrics.security + metrics.accessibility + metrics.code) / 5
    );
  }

  private buildMetricsByDevice(
    issues: ScannerIssue[],
    vitalsByDevice?: { mobile?: CoreWebVitals; desktop?: CoreWebVitals }
  ): DeviceMetricsMap {
    return {
      mobile: this.finalizeDeviceMetrics(issuesForDevice(issues, 'mobile'), vitalsByDevice?.mobile, 'mobile'),
      desktop: this.finalizeDeviceMetrics(issuesForDevice(issues, 'desktop'), vitalsByDevice?.desktop, 'desktop')
    };
  }

  /**
   * Regelbaserad poäng + valfria vitals.
   * Vitals får styra performance/seo/a11y när de finns, men blandas
   * med regelpoängen så en enstaka PageSpeed-0:a inte nollställer allt.
   */
  private finalizeDeviceMetrics(
    issues: ScannerIssue[],
    vitals: CoreWebVitals | undefined,
    device: DeviceMode
  ): ScanMetrics {
    const fromRules = this.calculateMetrics(issues);

    // Device nuance without vitals: mobile is usually stricter on perf
    if (!vitals) {
      if (device === 'mobile') {
        fromRules.performance = Math.max(0, fromRules.performance - 3);
      } else {
        fromRules.performance = Math.min(100, fromRules.performance + 2);
      }
      return fromRules;
    }

    const blend = (ruleScore: number, vitalScore: number | undefined, vitalWeight = 0.65): number => {
      if (vitalScore === undefined) return ruleScore;
      return Math.round(ruleScore * (1 - vitalWeight) + vitalScore * vitalWeight);
    };

    return {
      seo: blend(fromRules.seo, vitals.seoScore, 0.55),
      performance: blend(fromRules.performance, vitals.performanceScore, 0.7),
      security: fromRules.security,
      accessibility: blend(fromRules.accessibility, vitals.accessibilityScore, 0.55),
      code: fromRules.code
    };
  }

  private deduplicateIssues(issues: ScannerIssue[]): ScannerIssue[] {
    const seen = new Set<string>();
    const result: ScannerIssue[] = [];
    for (const issue of issues) {
      const key = [
        issue.category,
        issue.title.toLowerCase().slice(0, 80),
        issue.selector?.slice(0, 80) ?? '',
        (issue.codeSnippet ?? '').slice(0, 60).toLowerCase(),
        issue.source ?? '',
        issue.device ?? ''
      ].join('::');
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(issue);
    }
    return result;
  }

  /**
   * Diminishing penalties so many findings lower the score
   * realistically without instantly hitting 0.
   */
  private calculateMetrics(issues: ScannerIssue[]): ScanMetrics {
    const metrics: ScanMetrics = {
      seo: 100,
      performance: 100,
      security: 100,
      accessibility: 100,
      code: 100
    };

    const categoryToMetric: Record<string, keyof ScanMetrics> = {
      SEO: 'seo',
      Performance: 'performance',
      Security: 'security',
      Accessibility: 'accessibility',
      Code: 'code'
    };

    const counts: Record<keyof ScanMetrics, number> = {
      seo: 0,
      performance: 0,
      security: 0,
      accessibility: 0,
      code: 0
    };

    const sorted = [...issues].sort((a, b) => this.severityRank(b.severity) - this.severityRank(a.severity));

    for (const issue of sorted) {
      const metricKey = categoryToMetric[issue.category];
      if (!metricKey) continue;

      const n = counts[metricKey];
      const base = this.getPenalty(issue.severity);
      // Each extra finding in the same category counts less
      const dampened = base * Math.pow(0.72, n);
      metrics[metricKey] = Math.max(0, metrics[metricKey] - dampened);
      counts[metricKey] = n + 1;
    }

    // Soft floor: if there are findings but site isn't catastrophic, keep some signal
    (Object.keys(metrics) as Array<keyof ScanMetrics>).forEach((key) => {
      if (counts[key] > 0 && counts[key] < 8) {
        metrics[key] = Math.max(metrics[key], 12);
      }
      metrics[key] = Math.round(metrics[key]);
    });

    return metrics;
  }

  private severityRank(severity: string): number {
    switch (severity) {
      case 'High': return 3;
      case 'Medium': return 2;
      case 'Low': return 1;
      default: return 0;
    }
  }

  private getPenalty(severity: string): number {
    switch (severity) {
      case 'High': return 12;
      case 'Medium': return 6;
      case 'Low': return 2.5;
      default: return 0;
    }
  }
}
