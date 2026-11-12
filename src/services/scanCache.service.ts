import type { ScanResult } from '../rules/types';

const DEFAULT_TTL_SECONDS = 15 * 60;
const MAX_ENTRIES = 20;

interface CachedScan {
  at: number;
  result: ScanResult;
}

const cache = new Map<string, CachedScan>();

function ttlMs(): number {
  const raw = process.env.SCAN_CACHE_TTL_SECONDS;
  const configured = raw === undefined || raw.trim() === '' ? Number.NaN : Number(raw);
  const seconds = Number.isFinite(configured) && configured >= 0 ? configured : DEFAULT_TTL_SECONDS;
  return seconds * 1000;
}

export function scanCacheKey(
  url: string,
  language: string,
  includeVitals: boolean,
  signature = 'full'
): string {
  return `${language}|${includeVitals ? 'vitals' : 'light'}|${signature}|${url}`;
}

export function getCachedScan(key: string): ScanResult | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.at > ttlMs()) {
    cache.delete(key);
    return null;
  }

  return entry.result;
}

export function setCachedScan(key: string, result: ScanResult): void {
  if (ttlMs() <= 0) return;

  if (cache.size >= MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }

  cache.set(key, { at: Date.now(), result });
}
