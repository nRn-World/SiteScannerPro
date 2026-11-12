import type {
  DeviceMetricsMap,
  DeviceMode,
  DeviceVitalsMap,
  ScanMetrics,
  ScanResult,
  Severity
} from './types';
import { RULESET_VERSION } from './version';

export const COMPARISON_MAX_COMPETITORS = 2;

export interface ComparisonIssueSummary {
  title: string;
  severity: Severity;
  category: string;
}

export interface ComparisonIssueCounts {
  High: number;
  Medium: number;
  Low: number;
}

export interface ComparisonSite {
  url: string;
  host: string;
  metrics: ScanMetrics;
  metricsByDevice: DeviceMetricsMap;
  issuesByDevice: Record<DeviceMode, ComparisonIssueCounts>;
  topIssuesByDevice: Record<DeviceMode, ComparisonIssueSummary[]>;
  vitalsByDevice: DeviceVitalsMap;
}

export interface ComparisonResult {
  createdAt: string;
  baselineUrl: string;
  language: string;
  rulesetVersion: string;
  sites: ComparisonSite[];
}

export interface ComparisonInput {
  url: string;
  result: ScanResult;
}

const SEVERITY_RANK: Record<Severity, number> = {
  High: 0,
  Medium: 1,
  Low: 2
};

function safeHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export function overallFromMetrics(metrics: ScanMetrics): number {
  return Math.round(
    (metrics.seo + metrics.performance + metrics.security + metrics.accessibility + metrics.code) / 5
  );
}

export function comparisonMetricsForDevice(site: ComparisonSite, device: DeviceMode): ScanMetrics {
  return site.metricsByDevice?.[device] ?? site.metrics;
}

export function comparisonOverallForDevice(site: ComparisonSite, device: DeviceMode): number {
  return overallFromMetrics(comparisonMetricsForDevice(site, device));
}

function issueAppliesToDevice(
  issue: { device?: DeviceMode | 'both' },
  device: DeviceMode
): boolean {
  return !issue.device || issue.device === 'both' || issue.device === device;
}

function countsForDevice(result: ScanResult, device: DeviceMode): ComparisonIssueCounts {
  const counts: ComparisonIssueCounts = { High: 0, Medium: 0, Low: 0 };
  for (const issue of result.issues) {
    if (!issueAppliesToDevice(issue, device)) continue;
    counts[issue.severity] += 1;
  }
  return counts;
}

function topIssuesForDevice(result: ScanResult, device: DeviceMode): ComparisonIssueSummary[] {
  return [...result.issues]
    .filter((issue) => issueAppliesToDevice(issue, device))
    .sort((a, b) => (SEVERITY_RANK[a.severity] ?? 9) - (SEVERITY_RANK[b.severity] ?? 9))
    .slice(0, 3)
    .map((issue) => ({
      title: issue.title,
      severity: issue.severity,
      category: issue.category
    }));
}

function metricsForResult(result: ScanResult): DeviceMetricsMap {
  return {
    mobile: result.metricsByDevice?.mobile ?? result.metrics,
    desktop: result.metricsByDevice?.desktop ?? result.metrics
  };
}

function vitalsForResult(result: ScanResult): DeviceVitalsMap {
  if (result.vitalsByDevice) return result.vitalsByDevice;
  return result.vitals ? { mobile: result.vitals } : {};
}

/**
 * Build a compact comparison from full scan results. Screenshots, descriptions
 * and recommendations are intentionally omitted: the comparison only needs
 * comparable numbers and a short list of top findings.
 */
export function buildComparison(inputs: ComparisonInput[], language: string): ComparisonResult {
  const sites = inputs.map(({ url, result }): ComparisonSite => {
    const metricsByDevice = metricsForResult(result);

    return {
      url,
      host: safeHost(url),
      metrics: metricsByDevice.mobile,
      metricsByDevice,
      issuesByDevice: {
        mobile: countsForDevice(result, 'mobile'),
        desktop: countsForDevice(result, 'desktop')
      },
      topIssuesByDevice: {
        mobile: topIssuesForDevice(result, 'mobile'),
        desktop: topIssuesForDevice(result, 'desktop')
      },
      vitalsByDevice: vitalsForResult(result)
    };
  });

  return {
    createdAt: new Date().toISOString(),
    baselineUrl: inputs[0]?.url ?? '',
    language,
    rulesetVersion: RULESET_VERSION,
    sites
  };
}
