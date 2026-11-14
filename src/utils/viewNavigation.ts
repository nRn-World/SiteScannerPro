export type AppView =
  | 'home'
  | 'about'
  | 'contact'
  | 'api'
  | 'pricing'
  | 'terms'
  | 'privacy'
  | 'cookies'
  | 'monitors';

const REPORT_PERMALINK = /\/(?:r|c)\/[a-f0-9]{8,64}\/?$/i;
const MONITORS_PATH = /\/monitors\/?$/i;

/** True for a saved report (/r/<id>) or comparison (/c/<id>) URL. */
export function isPermalinkPath(pathname: string): boolean {
  return REPORT_PERMALINK.test(pathname);
}

/**
 * URL to push before switching views, or null to keep the current URL.
 * Contact/About/Terms and the other footer views are not routes, so leaving a
 * saved report must drop the permalink; otherwise a refresh reopens it.
 */
export function pathForViewChange(
  nextView: AppView,
  currentPathname: string,
  basePath: string
): string | null {
  const base = basePath.replace(/\/+$/, '');

  if (nextView === 'monitors') return `${base}/monitors`;

  // Home normally reloads when a report is open; the path still has to be
  // cleared when leaving /monitors without a reload.
  if (nextView === 'home') {
    return MONITORS_PATH.test(currentPathname) ? `${base}/` : null;
  }

  if (REPORT_PERMALINK.test(currentPathname) || MONITORS_PATH.test(currentPathname)) {
    return `${base}/`;
  }

  return null;
}
