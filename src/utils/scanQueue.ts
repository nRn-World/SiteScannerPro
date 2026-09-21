import { createLogger } from './logger';

/**
 * Kö med prioritet: Pro-skanningar prioriteras framför gratis.
 * Global gräns för samtidiga Puppeteer-jobb skyddar minnesgränsen på Render.
 */

const log = createLogger('scan-queue');

interface QueueJob<T> {
  run: () => Promise<T>;
  priority: number; // lägre = körs först
  resolve: (value: T) => void;
  reject: (err: unknown) => void;
}

export class ScanQueue {
  private queue: QueueJob<unknown>[] = [];
  private active = 0;

  constructor(private readonly concurrency: number) {}

  get waiting(): number {
    return this.queue.length;
  }

  get running(): number {
    return this.active;
  }

  /** priority: 0 = premium/pro, 1 = gratis */
  public enqueue<T>(priority: number, run: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const job: QueueJob<unknown> = { run: run as () => Promise<unknown>, priority, resolve: resolve as (v: unknown) => void, reject };
      this.queue.push(job);
      // Stabil prioritering: prioritet först, sedan FIFO
      this.queue.sort((a, b) => a.priority - b.priority);
      log.debug('Job enqueued', { priority, waiting: this.queue.length, active: this.active });
      this.pump();
    });
  }

  private pump(): void {
    while (this.active < this.concurrency && this.queue.length > 0) {
      const job = this.queue.shift()!;
      this.active += 1;
      void (async () => {
        try {
          const value = await job.run();
          job.resolve(value);
        } catch (err) {
          job.reject(err);
        } finally {
          this.active -= 1;
          this.pump();
        }
      })();
    }
  }
}

/** Konfigurerbar via MAX_CONCURRENT_SCANS (default 2 – Puppeteer är minnestungt). */
export function getScanConcurrency(): number {
  const raw = Number(process.env.MAX_CONCURRENT_SCANS || '');
  if (Number.isInteger(raw) && raw >= 1 && raw <= 8) return raw;
  return 2;
}
