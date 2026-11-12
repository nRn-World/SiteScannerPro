import type { ScanResult } from '../rules/types';

const DESCRIPTION_TEASER_LENGTH = 90;

function truncateDescription(description: string): string {
  if (description.length <= DESCRIPTION_TEASER_LENGTH) return description;

  const cutoff = description.slice(0, DESCRIPTION_TEASER_LENGTH);
  const lastSpace = cutoff.lastIndexOf(' ');
  return `${cutoff.slice(0, lastSpace > 40 ? lastSpace : DESCRIPTION_TEASER_LENGTH).trimEnd()}…`;
}

/**
 * Public (free) projection of a scan result.
 * Removes paid fields, but keeps every measurable finding and its evidence.
 */
export function toPublicResult(result: ScanResult): ScanResult {
  return {
    overallScore: result.overallScore,
    summary: result.summary,
    metrics: result.metrics,
    metricsByDevice: result.metricsByDevice,
    vitals: result.vitals,
    vitalsByDevice: result.vitalsByDevice,
    analysis: result.analysis,
    reportId: result.reportId,
    screenshots: result.screenshots
      ? {
          ...(result.screenshots.desktop ? { desktop: result.screenshots.desktop } : {}),
          ...(result.screenshots.mobile ? { mobile: result.screenshots.mobile } : {}),
          ...(result.screenshots.filmstrip ? { filmstrip: result.screenshots.filmstrip } : {})
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
