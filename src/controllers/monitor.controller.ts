import { Request, Response } from 'express';
import { parseScanLanguage } from '../services/axeLocale.service';
import {
  createMonitor,
  deleteMonitor,
  getMonitorForUser,
  listMonitors,
  MAX_MONITORS_PER_USER,
  MONITOR_INTERVALS,
  updateMonitor
} from '../services/monitorStore.service';
import { checkMonitorNow } from '../services/monitor.service';
import { getMonitorCopy } from '../i18n/monitorCopy';
import type { Language } from '../i18n/translations';

function languageFor(req: Request): Language {
  return parseScanLanguage(req.body?.language || req.query?.lang);
}

function errorFor(
  code: 'invalid_url' | 'invalid_interval' | 'duplicate' | 'limit' | 'storage' | 'not_found' | 'scan_failed' | 'running',
  language: Language
): string {
  const copy = getMonitorCopy(language);
  switch (code) {
    case 'invalid_url':
      return copy.invalidUrl;
    case 'invalid_interval':
      return copy.invalidInterval;
    case 'duplicate':
      return copy.duplicate;
    case 'limit':
      return copy.limit.replace('{max}', String(MAX_MONITORS_PER_USER));
    case 'not_found':
      return copy.notFound;
    case 'running':
      return copy.running;
    case 'scan_failed':
      return copy.scanFailed;
    default:
      return copy.storageFailed;
  }
}

export class MonitorController {
  /** GET /api/monitors */
  public list = (req: Request, res: Response): void => {
    res.setHeader('Cache-Control', 'private, no-store');
    res.json({ monitors: listMonitors(req.user!.id) });
  };

  /** POST /api/monitors */
  public create = (req: Request, res: Response): void => {
    const language = languageFor(req);
    const result = createMonitor(req.user!.id, {
      url: typeof req.body?.url === 'string' ? req.body.url : '',
      language,
      intervalHours: req.body?.intervalHours
    });

    res.setHeader('Cache-Control', 'private, no-store');
    if (result.ok === false) {
      const status = result.error === 'duplicate' || result.error === 'limit' ? 409 : 400;
      res.status(status).json({ error: errorFor(result.error, language) });
      return;
    }

    res.status(201).json({ monitor: result.monitor });
  };

  /** PATCH /api/monitors/:id */
  public update = (req: Request, res: Response): void => {
    const language = languageFor(req);

    // Reject an unsupported interval as a validation error (400) instead of
    // letting the store return null, which would be reported as a 404.
    if (typeof req.body?.intervalHours !== 'undefined') {
      const interval = Number(req.body.intervalHours);
      if (!MONITOR_INTERVALS.includes(interval as (typeof MONITOR_INTERVALS)[number])) {
        res.status(400).json({ error: errorFor('invalid_interval', language) });
        return;
      }
    }

    const monitor = updateMonitor(req.user!.id, String(req.params.id || ''), {
      enabled: typeof req.body?.enabled === 'boolean' ? req.body.enabled : undefined,
      intervalHours: req.body?.intervalHours
    });

    res.setHeader('Cache-Control', 'private, no-store');
    if (!monitor) {
      res.status(404).json({ error: errorFor('not_found', language) });
      return;
    }

    res.json({ monitor });
  };

  /** DELETE /api/monitors/:id */
  public remove = (req: Request, res: Response): void => {
    const removed = deleteMonitor(req.user!.id, String(req.params.id || ''));
    res.setHeader('Cache-Control', 'private, no-store');
    if (!removed) {
      res.status(404).json({ error: errorFor('not_found', languageFor(req)) });
      return;
    }
    res.json({ ok: true });
  };

  /** POST /api/monitors/:id/check */
  public check = async (req: Request, res: Response): Promise<void> => {
    const language = languageFor(req);
    const id = String(req.params.id || '');
    if (!getMonitorForUser(req.user!.id, id)) {
      res.status(404).json({ error: errorFor('not_found', language) });
      return;
    }

    const result = await checkMonitorNow(id);
    res.setHeader('Cache-Control', 'private, no-store');
    if (!result.monitor) {
      res.status(502).json({ error: errorFor(result.error === 'running' ? 'running' : 'scan_failed', language) });
      return;
    }

    res.json({
      monitor: result.monitor,
      ...(result.error ? { error: errorFor(result.error === 'running' ? 'running' : 'scan_failed', language) } : {})
    });
  };
}
