/**
 * Global gräns för samtidiga Puppeteer-sidor så processen inte dör
 * av minnesbrist (Render free tier har ~512 MB).
 */

const MAX_PAGES = Math.max(1, Number(process.env.MAX_CONCURRENT_PAGES || '') || 2);

let active = 0;
const waiters: Array<() => void> = [];

export async function acquirePageSlot(): Promise<() => void> {
  if (active < MAX_PAGES) {
    active += 1;
    return release;
  }
  await new Promise<void>((resolve) => waiters.push(resolve));
  active += 1;
  return release;
}

function release(): void {
  active = Math.max(0, active - 1);
  const next = waiters.shift();
  if (next) next();
}

export function activePageCount(): number {
  return active;
}

export function maxPageCount(): number {
  return MAX_PAGES;
}
