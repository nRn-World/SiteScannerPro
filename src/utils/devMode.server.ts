/** Server-side dev-detektering – används för lokala mätvärden och skärmdumpar. */
export function isDevServer(): boolean {
  if (process.env.SCAN_DEV_MODE === '1' || process.env.SCAN_DEV_MODE === 'true') {
    return true;
  }

  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  const appUrl = (process.env.APP_URL || '').toLowerCase();
  return (
    appUrl.includes('localhost') ||
    appUrl.includes('127.0.0.1') ||
    appUrl.includes('[::1]')
  );
}
