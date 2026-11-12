const API_BASE: string = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ?? '';

/**
 * Where saved-report pages live. Defaults to the API origin because the Node
 * server also serves the SPA build (and therefore report-specific metadata).
 */
const REPORT_BASE: string =
  (import.meta.env.VITE_REPORT_BASE as string | undefined)?.replace(/\/$/, '') || API_BASE;

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

/** Absolute (or same-origin relative) URL for a saved report. */
export function reportUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (REPORT_BASE) return `${REPORT_BASE}${path}`;
  // Same-origin deployment (dev server or Render serving the SPA): clipboard
  // and links still need an absolute URL.
  if (typeof window !== 'undefined') return `${window.location.origin}${path}`;
  return path;
}
