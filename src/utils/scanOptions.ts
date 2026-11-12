import type { DeviceMode } from '../rules/types';

export const SCAN_CATEGORIES = ['SEO', 'Performance', 'Security', 'Accessibility', 'Code'] as const;
export type ScanCategory = (typeof SCAN_CATEGORIES)[number];

export interface ScanRunOptions {
  devices: DeviceMode[];
  categories: ScanCategory[];
  thorough: boolean;
}

export const DEFAULT_SCAN_OPTIONS: ScanRunOptions = {
  devices: ['mobile', 'desktop'],
  categories: [...SCAN_CATEGORIES],
  thorough: true
};

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function parseDevices(raw: unknown): DeviceMode[] {
  if (!Array.isArray(raw)) return [...DEFAULT_SCAN_OPTIONS.devices];

  const values = raw
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim().toLowerCase());

  if (values.includes('both')) return ['mobile', 'desktop'];

  const devices = values.filter(
    (value): value is DeviceMode => value === 'mobile' || value === 'desktop'
  );
  return devices.length ? unique(devices) : [...DEFAULT_SCAN_OPTIONS.devices];
}

function parseCategories(raw: unknown): ScanCategory[] {
  if (!Array.isArray(raw)) return [...SCAN_CATEGORIES];

  const values = raw
    .filter((value): value is string => typeof value === 'string')
    .filter((value): value is ScanCategory =>
      (SCAN_CATEGORIES as readonly string[]).includes(value)
    );

  return values.length ? unique(values) : [...SCAN_CATEGORIES];
}

/** Parse and bound scan preferences from a public request body. */
export function parseScanOptions(body: unknown): ScanRunOptions {
  const source = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  return {
    devices: parseDevices(source.devices),
    categories: parseCategories(source.categories),
    thorough: source.thorough !== false
  };
}

/** Stable cache signature so partial scans never reuse a full-scan result. */
export function scanOptionsCacheKey(options: ScanRunOptions): string {
  if (isFullScan(options)) return 'full';
  return [
    [...options.devices].sort().join('+'),
    [...options.categories].sort().join('+'),
    options.thorough ? 'deep' : 'fast'
  ].join('|');
}

export function isFullScan(options: ScanRunOptions): boolean {
  return (
    options.devices.length === 2 &&
    options.categories.length === SCAN_CATEGORIES.length &&
    options.thorough
  );
}
