import { Request, Response } from 'express';
import { ScanController } from './scan.controller';
import { getCompareCopy } from '../i18n/compareCopy';
import { parseScanLanguage } from '../services/axeLocale.service';
import { getCachedScan, scanCacheKey, setCachedScan } from '../services/scanCache.service';
import {
  buildComparison,
  COMPARISON_MAX_COMPETITORS,
  type ComparisonInput
} from '../rules/comparison';
import { getComparison as getStoredComparison, saveComparison } from '../services/comparisonStore.service';
import { SsrfError } from '../utils/ssrf';
import { createLogger } from '../utils/logger';
import type { Language } from '../i18n/translations';

const log = createLogger('comparison');

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function parseTarget(raw: string): URL | null {
  try {
    const url = new URL(normalizeUrl(raw));
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!url.hostname || url.href.length > 2048) return null;
    return url;
  } catch {
    return null;
  }
}

function hostKey(url: URL): string {
  return url.hostname.replace(/^www\./i, '').toLowerCase();
}

export class ComparisonController {
  private scanController = new ScanController();

  /**
   * POST /api/compare
   * Pro-only: scan the base site plus one or two competitors and persist a
   * compact, shareable comparison. Results are reused from the 15-minute scan
   * cache when possible.
   */
  public compare = async (req: Request, res: Response): Promise<void> => {
    const language: Language = parseScanLanguage(req.body?.language);
    const copy = getCompareCopy(language);

    try {
      if (req.license?.kind === 'vip' || req.license?.source === 'vip') {
        res.status(403).json({ error: copy.errorVip });
        return;
      }

      const rawBase = typeof req.body?.url === 'string' ? req.body.url.trim() : '';
      const rawCompetitors = Array.isArray(req.body?.competitors)
        ? req.body.competitors
            .filter((value: unknown): value is string => typeof value === 'string')
            .map((value: string) => value.trim())
            .filter(Boolean)
        : [];

      if (!rawBase) {
        res.status(400).json({ error: copy.errorInvalid });
        return;
      }
      if (rawCompetitors.length === 0) {
        res.status(400).json({ error: copy.needCompetitor });
        return;
      }
      if (rawCompetitors.length > COMPARISON_MAX_COMPETITORS) {
        res.status(400).json({ error: copy.errorTooMany });
        return;
      }

      const parsedBase = parseTarget(rawBase);
      const parsedCompetitors = rawCompetitors.map(parseTarget);
      if (!parsedBase || parsedCompetitors.some((url) => !url)) {
        res.status(400).json({ error: copy.errorInvalid });
        return;
      }

      // Compare hosts, not pages: the same domain cannot appear twice.
      const targets: URL[] = [];
      const seenHosts = new Set<string>();
      for (const url of [parsedBase, ...(parsedCompetitors as URL[])]) {
        const key = hostKey(url);
        if (seenHosts.has(key)) continue;
        seenHosts.add(key);
        targets.push(url);
      }

      if (targets.length !== 1 + parsedCompetitors.length) {
        res.status(400).json({ error: copy.errorDuplicate });
        return;
      }
      if (targets.length < 2) {
        res.status(400).json({ error: copy.needCompetitor });
        return;
      }

      log.info('compare start', { sites: targets.length, language });

      const inputs: ComparisonInput[] = [];
      for (const target of targets) {
        const normalized = target.href;
        const cacheKey = scanCacheKey(normalized, language, true);
        let result = getCachedScan(cacheKey);

        if (result) {
          log.info('compare cache hit', { host: target.host });
        } else {
          result = await this.scanController.scanForComparison(normalized, language);
          setCachedScan(cacheKey, result);
        }

        inputs.push({ url: normalized, result });
      }

      const comparison = buildComparison(inputs, language);
      const stored = saveComparison(comparison, language);
      if (!stored) {
        res.status(500).json({ error: copy.errorFailed });
        return;
      }

      log.info('compare saved', { id: stored.id, sites: targets.length });
      res.setHeader('Cache-Control', 'private, no-store');
      res.json({
        ...stored,
        shareUrlPath: `/c/${stored.id}`
      });
    } catch (error: any) {
      log.error('compare failed', { error: error?.message });

      if (error instanceof SsrfError || error?.name === 'SsrfError') {
        res.status(400).json({ error: copy.errorInvalid });
        return;
      }
      if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
        res.status(504).json({ error: copy.errorTimeout });
        return;
      }
      res.status(500).json({ error: copy.errorFailed });
    }
  };

  /** GET /api/comparisons/:id – public, read-only saved comparison. */
  public getComparison = async (req: Request, res: Response): Promise<void> => {
    const comparison = getStoredComparison(String(req.params.id || ''));
    if (!comparison) {
      res.status(404).json({ error: getCompareCopy('en').notFoundBody });
      return;
    }

    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.json(comparison);
  };
}
