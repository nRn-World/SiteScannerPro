import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { ScanResult } from '../rules/types';
import { createLogger } from '../utils/logger';

/**
 * File-based uptime/SEO monitors.
 *
 * A monitor stores compact check results (score + severity counts + the report
 * permalink). Full scan data lives in the report store, so this file stays
 * small and quick to list. The scheduler is intentionally in-process; it works
 * while the Node server is awake and does not require an external cron service.
 */

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const MONITORS_PATH = path.join(DATA_DIR, 'monitors.json');
const ID_PATTERN = /^[a-f0-9]{16}$/;
const log = createLogger('monitor-store');

export const MONITOR_INTERVALS = [24, 72, 168] as const;
export const MAX_MONITORS_PER_USER = 3;
export const DEFAULT_MONITOR_INTERVAL_HOURS = 24;

export type MonitorAlert = 'score_down' | 'new_critical';

export interface MonitorCheck {
  at: string;
  score: number;
  high: number;
  medium: number;
  low: number;
  reportId?: string;
}

export interface MonitorRecord {
  id: string;
  userId: string;
  url: string;
  language: string;
  intervalHours: number;
  enabled: boolean;
  createdAt: string;
  nextCheckAt: string;
  lastCheckedAt?: string;
  lastScore?: number;
  lastDelta?: number;
  lastHigh?: number;
  lastMedium?: number;
  lastLow?: number;
  lastReportId?: string;
  lastError?: string;
  lastAlert?: MonitorAlert;
  history: MonitorCheck[];
}

export type PublicMonitor = Omit<MonitorRecord, 'userId'>;

export type CreateMonitorError = 'invalid_url' | 'invalid_interval' | 'duplicate' | 'limit' | 'storage';

interface MonitorFile {
  monitors: MonitorRecord[];
}

function readMonitors(): MonitorRecord[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(MONITORS_PATH, 'utf8')) as MonitorFile;
    return Array.isArray(parsed?.monitors) ? parsed.monitors : [];
  } catch {
    return [];
  }
}

function writeMonitors(monitors: MonitorRecord[]): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(MONITORS_PATH, `${JSON.stringify({ monitors }, null, 2)}\n`, 'utf8');
}

/** Turn "example.com" into a stable https URL and reject unsafe forms. */
export function normalizeMonitorUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!url.hostname || url.href.length > 2048) return null;
    if (url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function normalizeInterval(value: unknown): number {
  const interval = typeof value === 'number' ? value : Number(value);
  return MONITOR_INTERVALS.includes(interval as (typeof MONITOR_INTERVALS)[number])
    ? interval
    : DEFAULT_MONITOR_INTERVAL_HOURS;
}

function publicMonitor(monitor: MonitorRecord): PublicMonitor {
  const { userId: _userId, ...rest } = monitor;
  return rest;
}

export function listMonitors(userId: string): PublicMonitor[] {
  return readMonitors()
    .filter((monitor) => monitor.userId === userId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .map(publicMonitor);
}

export function getMonitorForUser(userId: string, id: string): PublicMonitor | null {
  if (!ID_PATTERN.test(id)) return null;
  const monitor = readMonitors().find((record) => record.id === id && record.userId === userId);
  return monitor ? publicMonitor(monitor) : null;
}

export function getMonitorById(id: string): MonitorRecord | null {
  if (!ID_PATTERN.test(id)) return null;
  return readMonitors().find((record) => record.id === id) ?? null;
}

export function createMonitor(
  userId: string,
  input: { url: string; language: string; intervalHours?: unknown }
): { ok: true; monitor: PublicMonitor } | { ok: false; error: CreateMonitorError } {
  const url = normalizeMonitorUrl(input.url);
  if (!url) return { ok: false, error: 'invalid_url' };

  const interval = normalizeInterval(input.intervalHours);
  if (typeof input.intervalHours !== 'undefined' && interval !== Number(input.intervalHours)) {
    return { ok: false, error: 'invalid_interval' };
  }

  try {
    const monitors = readMonitors();
    const own = monitors.filter((monitor) => monitor.userId === userId);

    if (own.some((monitor) => monitor.url.toLowerCase() === url.toLowerCase())) {
      return { ok: false, error: 'duplicate' };
    }
    if (own.length >= MAX_MONITORS_PER_USER) {
      return { ok: false, error: 'limit' };
    }

    const now = new Date();
    const monitor: MonitorRecord = {
      id: crypto.randomBytes(8).toString('hex'),
      userId,
      url,
      language: input.language,
      intervalHours: interval,
      enabled: true,
      createdAt: now.toISOString(),
      // Give the user a first result quickly without scanning during the request.
      nextCheckAt: new Date(now.getTime() + 60_000).toISOString(),
      history: []
    };

    monitors.push(monitor);
    writeMonitors(monitors);
    log.info('created', { id: monitor.id, host: new URL(url).host });
    return { ok: true, monitor: publicMonitor(monitor) };
  } catch (error) {
    log.error('create failed', { error: (error as Error)?.message });
    return { ok: false, error: 'storage' };
  }
}

export function updateMonitor(
  userId: string,
  id: string,
  input: { enabled?: boolean; intervalHours?: unknown }
): PublicMonitor | null {
  if (!ID_PATTERN.test(id)) return null;

  try {
    const monitors = readMonitors();
    const monitor = monitors.find((record) => record.id === id && record.userId === userId);
    if (!monitor) return null;

    if (typeof input.enabled === 'boolean') {
      const wasEnabled = monitor.enabled;
      monitor.enabled = input.enabled;
      if (!wasEnabled && input.enabled) {
        monitor.nextCheckAt = new Date(Date.now() + 60_000).toISOString();
      }
    }

    if (typeof input.intervalHours !== 'undefined') {
      const interval = normalizeInterval(input.intervalHours);
      if (interval !== Number(input.intervalHours)) return null;
      monitor.intervalHours = interval;
      monitor.nextCheckAt = new Date(Date.now() + interval * 60 * 60 * 1000).toISOString();
    }

    writeMonitors(monitors);
    return publicMonitor(monitor);
  } catch (error) {
    log.error('update failed', { error: (error as Error)?.message });
    return null;
  }
}

export function deleteMonitor(userId: string, id: string): boolean {
  if (!ID_PATTERN.test(id)) return false;

  try {
    const monitors = readMonitors();
    const next = monitors.filter((record) => !(record.id === id && record.userId === userId));
    if (next.length === monitors.length) return false;
    writeMonitors(next);
    return true;
  } catch (error) {
    log.error('delete failed', { error: (error as Error)?.message });
    return false;
  }
}

function issueCounts(result: ScanResult): { high: number; medium: number; low: number } {
  let high = 0;
  let medium = 0;
  let low = 0;

  for (const issue of result.issues) {
    if (issue.device && issue.device !== 'both' && issue.device !== 'mobile') continue;
    if (issue.severity === 'High') high += 1;
    else if (issue.severity === 'Medium') medium += 1;
    else low += 1;
  }

  return { high, medium, low };
}

export function recordMonitorCheck(
  id: string,
  result: ScanResult,
  reportId?: string
): PublicMonitor | null {
  try {
    const monitors = readMonitors();
    const monitor = monitors.find((record) => record.id === id);
    if (!monitor) return null;

    const counts = issueCounts(result);
    const previousScore = monitor.lastScore;
    const previousHigh = monitor.lastHigh ?? 0;
    const score = result.overallScore;
    const alert: MonitorAlert | undefined =
      typeof previousScore !== 'number'
        ? undefined
        : score < previousScore - 4
          ? 'score_down'
          : counts.high > previousHigh
            ? 'new_critical'
            : undefined;

    const check: MonitorCheck = {
      at: new Date().toISOString(),
      score,
      ...counts,
      ...(reportId ? { reportId } : {})
    };

    monitor.lastCheckedAt = check.at;
    monitor.lastScore = score;
    monitor.lastDelta = typeof previousScore === 'number' ? score - previousScore : undefined;
    monitor.lastHigh = counts.high;
    monitor.lastMedium = counts.medium;
    monitor.lastLow = counts.low;
    if (reportId) monitor.lastReportId = reportId;
    monitor.lastAlert = alert;
    monitor.lastError = undefined;
    monitor.history = [...monitor.history, check].slice(-30);
    monitor.nextCheckAt = new Date(
      Date.now() + monitor.intervalHours * 60 * 60 * 1000
    ).toISOString();

    writeMonitors(monitors);
    log.info('check recorded', { id, score, alert: alert ?? null });
    return publicMonitor(monitor);
  } catch (error) {
    log.error('record failed', { error: (error as Error)?.message });
    return null;
  }
}

export function markMonitorError(id: string, message: string): void {
  try {
    const monitors = readMonitors();
    const monitor = monitors.find((record) => record.id === id);
    if (!monitor) return;

    monitor.lastCheckedAt = new Date().toISOString();
    monitor.lastError = message.slice(0, 300);
    monitor.nextCheckAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    writeMonitors(monitors);
  } catch (error) {
    log.warn('mark error failed', { error: (error as Error)?.message });
  }
}

export function listDueMonitors(now = Date.now()): MonitorRecord[] {
  return readMonitors().filter(
    (monitor) => monitor.enabled && Date.parse(monitor.nextCheckAt) <= now
  );
}
