import type { StoredReport } from '../services/reportStore.service';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Replace the generic SPA metadata with report-specific tags.
 * Used by the Express server for /r/:id so shared links get a useful preview
 * and a correct canonical URL without needing a second rendering stack.
 */
export function injectReportMeta(html: string, report: StoredReport, origin: string): string {
  const base = origin.replace(/\/$/, '');
  const host = report.host;
  const score = report.result.overallScore;
  const issueCount = report.result.issues.length;
  const isSwedish = report.language === 'sv';

  const title = `${host} – ${score}/100 | SiteScanner Pro`;
  const description = isSwedish
    ? `Sparad webbplatsanalys av ${host}: ${score}/100 och ${issueCount} fynd inom SEO, prestanda, säkerhet, tillgänglighet och kodkvalitet.`
    : `Saved website analysis for ${host}: ${score}/100 with ${issueCount} findings across SEO, performance, security, accessibility and code quality.`;

  const canonical = `${base}/r/${report.id}`;
  const image = `${base}/og-image.svg`;

  const tags = [
    '<meta name="robots" content="noindex, nofollow" />',
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    '<meta property="og:type" content="article" />',
    '<meta property="og:site_name" content="SiteScanner Pro" />',
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`
  ].join('\n    ');

  let output = html;
  output = output.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  output = output.replace(/<meta\s+name="description"[^>]*>/gi, '');
  output = output.replace(/<meta\s+property="og:[^"]+"[^>]*>/gi, '');
  output = output.replace(/<meta\s+name="twitter:[^"]+"[^>]*>/gi, '');
  output = output.replace(/<link\s+rel="canonical"[^>]*>/gi, '');
  output = output.replace(/<link\s+rel="alternate"[^>]*>/gi, '');
  output = output.replace(/<\/head>/i, `    ${tags}\n  </head>`);

  return output;
}
