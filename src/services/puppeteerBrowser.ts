import puppeteer, { Browser } from 'puppeteer';

let browserInstance: Browser | null = null;

export async function getSharedBrowser(): Promise<Browser> {
  if (browserInstance?.connected) return browserInstance;
  browserInstance = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  return browserInstance;
}

export async function closeSharedBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close().catch(() => {});
    browserInstance = null;
  }
}

process.on('exit', () => { void closeSharedBrowser(); });
