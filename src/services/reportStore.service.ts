import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { ScanResult } from '../rules/types';
import { RULESET_VERSION } from '../rules/version';
import { getShareTtlSeconds } from './reportShare.service';
import { createLogger } from '../utils/logger';

/**
 * File-based report store for Phase 0.
 *
 * Reports live under DATA_DIR/reports so they survive a process restart and
 * can be served as permanent links. Screenshots are written as files next to
 * the JSON instead of being embedded as base64 in every API response.
 *
 * When accounts and a database arrive this module can be swapped for a
 * repository backed by SQLite without changing callers.
 */

const log = createLogger('report-store');

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const REPORTS_DIR = path.join(DATA_DIR, 'reports');
const ASSETS_DIR = path.join(REPORTS_DIR, 'assets');

const ID_PATTERN = /^[a-f0-9]{16}$/;
const ASSET_PATTERN = /^[a-z0-9_-]+\.(?:jpg|jpeg|png|webp)$/i;
const DATA_URL_PATTERN = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([a-z0-9+/=\s]+)$/i;

export interface StoredReport {
  id: string;
  createdAt: string;
  rulesetVersion: string;
  url: string;
  host: string;
  language?: string;
  result: ScanResult;
}

export interface SaveReportInput {
  result: ScanResult;
  url: string;
  language?: string;
  /** Absolute origin of the API, used for screenshot URLs. */
  apiOrigin: string;
}

function reportTtlMs(): number {
  return getShareTtlSeconds() * 1000;
}

function ensureDirectories(): void {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

function reportFilePath(id: string): string {
  return path.join(REPORTS_DIR, `${id}.json`);
}

function assetDirectory(id: string): string {
  return path.join(ASSETS_DIR, id);
}

function safeHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function extensionFor(mime: string): string {
  const normalized = mime.toLowerCase();
  if (normalized.includes('png')) return 'png';
  if (normalized.includes('webp')) return 'webp';
  return 'jpg';
}

function writeAsset(id: string, name: string, dataUrl: string, apiOrigin: string): string | null {
  const match = dataUrl.match(DATA_URL_PATTERN);
  if (!match || !match[1] || !match[2]) return null;

  const extension = extensionFor(match[1]);
  const directory = assetDirectory(id);
  const fileName = `${name}.${extension}`;

  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(
    path.join(directory, fileName),
    Buffer.from(match[2].replace(/\s/g, ''), 'base64')
  );

  return `${apiOrigin}/api/reports/${id}/assets/${fileName}`;
}

function externalizeScreenshots(result: ScanResult, id: string, apiOrigin: string): void {
  const screenshots = result.screenshots;
  if (screenshots) {
    if (screenshots.desktop?.startsWith('data:')) {
      screenshots.desktop = writeAsset(id, 'desktop', screenshots.desktop, apiOrigin) ?? screenshots.desktop;
    }
    if (screenshots.mobile?.startsWith('data:')) {
      screenshots.mobile = writeAsset(id, 'mobile', screenshots.mobile, apiOrigin) ?? screenshots.mobile;
    }
    if (Array.isArray(screenshots.filmstrip)) {
      screenshots.filmstrip = screenshots.filmstrip.map((frame, index) => {
        if (!frame.startsWith('data:')) return frame;
        return writeAsset(id, `film-${index}`, frame, apiOrigin) ?? frame;
      });
    }
  }

  result.issues = result.issues.map((issue, index) => {
    if (!issue.screenshot?.startsWith('data:')) return issue;
    const assetUrl = writeAsset(id, `issue-${index}`, issue.screenshot, apiOrigin);
    return assetUrl ? { ...issue, screenshot: assetUrl } : issue;
  });
}

function removeReport(id: string): void {
  try {
    fs.rmSync(reportFilePath(id), { force: true });
    fs.rmSync(assetDirectory(id), { recursive: true, force: true });
  } catch (error) {
    log.warn('cleanup failed', { error: (error as Error)?.message });
  }
}

let lastCleanup = 0;

function cleanupExpired(): void {
  const now = Date.now();
  if (now - lastCleanup < 60 * 60 * 1000) return;
  lastCleanup = now;

  try {
    for (const entry of fs.readdirSync(REPORTS_DIR, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
      const id = entry.name.slice(0, -'.json'.length);
      if (!ID_PATTERN.test(id)) continue;

      const filePath = path.join(REPORTS_DIR, entry.name);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > reportTtlMs()) {
        removeReport(id);
      }
    }
  } catch {
    // A missing directory is normal before the first report is written.
  }
}

/** Persist a full result. Returns null when storage is unavailable. */
export function saveReport(input: SaveReportInput): StoredReport | null {
  try {
    ensureDirectories();

    const id = crypto.randomBytes(8).toString('hex');
    externalizeScreenshots(input.result, id, input.apiOrigin.replace(/\/$/, ''));

    const report: StoredReport = {
      id,
      createdAt: new Date().toISOString(),
      rulesetVersion: RULESET_VERSION,
      url: input.url,
      host: safeHost(input.url),
      ...(input.language ? { language: input.language } : {}),
      result: input.result
    };

    fs.writeFileSync(reportFilePath(id), JSON.stringify(report), 'utf8');
    cleanupExpired();
    return report;
  } catch (error) {
    log.error('save failed', { error: (error as Error)?.message });
    return null;
  }
}

/** Load a saved report, or null when it is unknown or expired. */
export function getReport(id: string): StoredReport | null {
  if (!ID_PATTERN.test(id)) return null;

  try {
    const raw = fs.readFileSync(reportFilePath(id), 'utf8');
    const report = JSON.parse(raw) as StoredReport;

    if (!report?.result || typeof report.createdAt !== 'string' || typeof report.url !== 'string') {
      return null;
    }

    if (Date.now() - Date.parse(report.createdAt) > reportTtlMs()) {
      removeReport(id);
      return null;
    }

    return report;
  } catch {
    return null;
  }
}

/** Resolve a screenshot file belonging to a report, with traversal protection. */
export function getReportAsset(
  id: string,
  file: string
): { filePath: string; contentType: string } | null {
  if (!ID_PATTERN.test(id) || !ASSET_PATTERN.test(file)) return null;

  const directory = path.resolve(assetDirectory(id));
  const filePath = path.resolve(directory, file);
  if (!filePath.startsWith(`${directory}${path.sep}`)) return null;
  if (!fs.existsSync(filePath)) return null;

  const extension = path.extname(file).toLowerCase();
  const contentType =
    extension === '.png' ? 'image/png' : extension === '.webp' ? 'image/webp' : 'image/jpeg';

  return { filePath, contentType };
}
