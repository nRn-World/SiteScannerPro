import puppeteer, { Browser } from 'puppeteer';
import { createLogger } from '../utils/logger';

const log = createLogger('puppeteer');

let browserInstance: Browser | null = null;
let scansSinceLaunch = 0;

/**
 * Render free tier (~512 MB) eller LOW_MEMORY=1: kör Chromium i single-process-
 * läge med mindre cache så djupanalysen ryms. Lokalt behålls standardläge.
 */
function isLowMemory(): boolean {
  return process.env.NODE_ENV === 'production' || !!process.env.RENDER || process.env.LOW_MEMORY === '1';
}

function launchArgs(): string[] {
  const base = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-sync',
    '--mute-audio',
    '--no-first-run'
  ];
  if (isLowMemory()) {
    base.push(
      '--renderer-process-limit=1',
      '--disable-software-rasterizer',
      '--js-flags=--max-old-space-size=256'
    );
  }
  return base;
}

export async function getSharedBrowser(): Promise<Browser> {
  if (browserInstance?.connected) return browserInstance;
  log.info('launching browser', { lowMemory: isLowMemory() });
  browserInstance = await puppeteer.launch({
    headless: true,
    args: launchArgs()
  });
  scansSinceLaunch = 0;
  return browserInstance;
}

/** Räknar analyskörningar sedan senaste browser-start (för recycling). */
export function registerScanForBrowser(): void {
  scansSinceLaunch += 1;
}

export function shouldRecycleBrowser(maxScans = 8): boolean {
  return scansSinceLaunch >= maxScans;
}

export function memoryPressureRssMb(): number {
  return Math.round(process.memoryUsage().rss / 1024 / 1024);
}

/**
 * Stänger browsern vid minnestryck / efter N körningar, så nästa skanning
 * startar friskt. Skyddar mot minnesläckor på Render free tier.
 */
export async function recycleIfStrained(): Promise<void> {
  const rss = memoryPressureRssMb();
  const cap = Number(process.env.MEMORY_RECYCLE_MB || '') || 420;
  if (shouldRecycleBrowser() || rss > cap) {
    log.info('recycling browser', { reason: shouldRecycleBrowser() ? 'scans' : 'memory', rssMb: rss });
    await closeSharedBrowser();
  }
}

export async function closeSharedBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close().catch(() => {});
    browserInstance = null;
  }
}

process.on('exit', () => { void closeSharedBrowser(); });
