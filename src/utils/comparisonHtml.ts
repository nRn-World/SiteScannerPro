import type { StoredComparison } from '../services/comparisonStore.service';
import { comparisonOverallForDevice } from '../rules/comparison';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Replace the generic SPA metadata with comparison-specific tags. The Express
 * server uses this for /c/:id so a shared comparison gets a useful title,
 * description, canonical URL and social preview.
 */
export function injectComparisonMeta(
  html: string,
  comparison: StoredComparison,
  origin: string
): string {
  const base = origin.replace(/\/$/, '');
  const isSwedish = comparison.language === 'sv';
  const sites = comparison.result.sites;
  const hosts = sites.map((site) => site.host);
  const scores = sites.map(
    (site) => `${site.host} ${comparisonOverallForDevice(site, 'mobile')}`
  );

  const title =
    hosts.length > 2
      ? `${hosts[0]} vs ${hosts[1]} +${hosts.length - 2} | SiteScanner Pro`
      : `${hosts.join(' vs ')} | SiteScanner Pro`;
  const description = isSwedish
    ? `Jämförelse av ${hosts.join(', ')} inom SEO, prestanda, säkerhet, tillgänglighet och kodkvalitet. Mobilpoäng: ${scores.join(', ')}.`
    : `Comparison of ${hosts.join(', ')} across SEO, performance, security, accessibility and code quality. Mobile scores: ${scores.join(', ')}.`;

  const canonical = `${base}/c/${comparison.id}`;
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
