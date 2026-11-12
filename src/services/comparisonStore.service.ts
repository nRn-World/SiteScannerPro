import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { ComparisonResult } from '../rules/comparison';
import { getShareTtlSeconds } from './reportShare.service';
import { createLogger } from '../utils/logger';

/**
 * File-based storage for saved competitor comparisons.
 *
 * The comparison is small (scores, issue counts and top titles), so it can be
 * stored as a single JSON document. It shares the report TTL so shared links
 * behave consistently.
 */

const log = createLogger('comparison-store');

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const COMPARISONS_DIR = path.join(DATA_DIR, 'comparisons');
const ID_PATTERN = /^[a-f0-9]{16}$/;

export interface StoredComparison {
  id: string;
  createdAt: string;
  language: string;
  result: ComparisonResult;
}

function comparisonTtlMs(): number {
  return getShareTtlSeconds() * 1000;
}

function comparisonFilePath(id: string): string {
  return path.join(COMPARISONS_DIR, `${id}.json`);
}

function ensureDirectory(): void {
  fs.mkdirSync(COMPARISONS_DIR, { recursive: true });
}

function removeComparison(id: string): void {
  try {
    fs.rmSync(comparisonFilePath(id), { force: true });
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
    for (const entry of fs.readdirSync(COMPARISONS_DIR, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
      const id = entry.name.slice(0, -'.json'.length);
      if (!ID_PATTERN.test(id)) continue;

      const filePath = path.join(COMPARISONS_DIR, entry.name);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > comparisonTtlMs()) {
        removeComparison(id);
      }
    }
  } catch {
    // Missing directory is normal before the first comparison is saved.
  }
}

/** Persist a comparison. Returns null when storage is unavailable. */
export function saveComparison(
  result: ComparisonResult,
  language: string
): StoredComparison | null {
  try {
    ensureDirectory();

    const id = crypto.randomBytes(8).toString('hex');
    const comparison: StoredComparison = {
      id,
      createdAt: new Date().toISOString(),
      language,
      result
    };

    fs.writeFileSync(comparisonFilePath(id), JSON.stringify(comparison), 'utf8');
    cleanupExpired();
    return comparison;
  } catch (error) {
    log.error('save failed', { error: (error as Error)?.message });
    return null;
  }
}

/** Load a stored comparison, or null when unknown/expired. */
export function getComparison(id: string): StoredComparison | null {
  if (!ID_PATTERN.test(id)) return null;

  try {
    const raw = fs.readFileSync(comparisonFilePath(id), 'utf8');
    const comparison = JSON.parse(raw) as StoredComparison;

    if (
      !comparison?.result ||
      !Array.isArray(comparison.result.sites) ||
      typeof comparison.createdAt !== 'string'
    ) {
      return null;
    }

    if (Date.now() - Date.parse(comparison.createdAt) > comparisonTtlMs()) {
      removeComparison(id);
      return null;
    }

    return comparison;
  } catch {
    return null;
  }
}
