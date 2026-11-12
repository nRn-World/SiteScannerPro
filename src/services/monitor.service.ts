import { ScanController } from '../controllers/scan.controller';
import { parseScanLanguage } from './axeLocale.service';
import { saveReport } from './reportStore.service';
import {
  getMonitorById,
  getMonitorForUser,
  listDueMonitors,
  markMonitorError,
  recordMonitorCheck,
  type PublicMonitor
} from './monitorStore.service';
import { createLogger } from '../utils/logger';

const log = createLogger('monitor');
const scanController = new ScanController();
const runningChecks = new Set<string>();

function apiOrigin(): string {
  const configured =
    process.env.PUBLIC_API_URL || process.env.RENDER_EXTERNAL_URL || process.env.APP_URL;
  if (configured) return configured.replace(/\/$/, '');
  return `http://localhost:${Number(process.env.PORT) || 3000}`;
}

/**
 * Run one monitor check. The caller must already have verified ownership when
 * this is triggered from an authenticated endpoint.
 */
export async function checkMonitorNow(
  monitorId: string
): Promise<{ monitor: PublicMonitor | null; error?: string }> {
  const record = getMonitorById(monitorId);
  if (!record) return { monitor: null, error: 'not_found' };

  if (runningChecks.has(monitorId)) {
    return { monitor: getMonitorForUser(record.userId, monitorId), error: 'running' };
  }

  runningChecks.add(monitorId);
  try {
    const result = await scanController.scanForComparison(
      record.url,
      parseScanLanguage(record.language)
    );

    const report = saveReport({
      result,
      url: record.url,
      language: record.language,
      apiOrigin: apiOrigin()
    });

    const monitor = recordMonitorCheck(record.id, result, report?.id);
    if (!monitor) return { monitor: null, error: 'storage' };
    return { monitor };
  } catch (error) {
    const message = (error as Error)?.message || 'scan_failed';
    log.warn('check failed', { id: monitorId, error: message });
    markMonitorError(monitorId, message);
    return { monitor: getMonitorForUser(record.userId, monitorId), error: 'scan_failed' };
  } finally {
    runningChecks.delete(monitorId);
  }
}

/** One scheduler pass: due monitors are checked sequentially to protect Chrome. */
export async function runDueMonitorChecks(): Promise<number> {
  const due = listDueMonitors();
  if (due.length === 0) return 0;

  log.info('scheduler pass', { due: due.length });
  let completed = 0;

  for (const monitor of due) {
    const result = await checkMonitorNow(monitor.id);
    if (result.monitor && !result.error) completed += 1;
  }

  return completed;
}
