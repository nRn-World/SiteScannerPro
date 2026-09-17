/** Returnerar true när appen körs lokalt (dev-server eller localhost). */
export function isLocalDevHost(): boolean {
  if (typeof window === 'undefined') return false;

  if (import.meta.env.DEV) return true;

  const host = window.location.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '[::1]' ||
    host === '::1' ||
    host.endsWith('.local')
  ) {
    return true;
  }

  const port = window.location.port;
  if (port === '3000' || port === '5173') {
    if (/^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) {
      return true;
    }
  }

  return false;
}
