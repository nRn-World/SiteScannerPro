import { runDueMonitorChecks } from './monitor.service';
import { createLogger } from '../utils/logger';

const log = createLogger('monitor-scheduler');
const INTERVAL_MS = 5 * 60 * 1000;

let started = false;
let running = false;

async function tick(): Promise<void> {
  if (running) return;
  running = true;

  try {
    const completed = await runDueMonitorChecks();
    if (completed > 0) log.info('scheduled checks complete', { completed });
  } catch (error) {
    log.warn('scheduler pass failed', { error: (error as Error)?.message });
  } finally {
    running = false;
  }
}

/**
 * Start the in-process monitor scheduler. It is deliberately best-effort: the
 * host must be awake for checks to run. This is appropriate for a single Render
 * web service; a future multi-instance deployment should move this to a job
 * runner with a shared lock.
 */
export function startMonitorScheduler(): void {
  if (started || process.env.DISABLE_MONITOR_SCHEDULER === '1') return;
  started = true;

  const initial = setTimeout(() => {
    void tick();
  }, 20_000);
  const interval = setInterval(() => {
    void tick();
  }, INTERVAL_MS);

  // Do not keep a test process alive solely because of the scheduler.
  initial.unref?.();
  interval.unref?.();
  log.info('scheduler started', { intervalMinutes: INTERVAL_MS / 60_000 });
}
