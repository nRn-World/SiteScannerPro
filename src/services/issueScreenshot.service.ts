import * as cheerio from 'cheerio';
import { ElementHandle, Page } from 'puppeteer';
import { ScannerIssue } from '../rules/types';
import { getSharedBrowser } from './puppeteerBrowser';

const RED = '#E53935';

export function resolveIssueSelector(issue: ScannerIssue, html: string): string | null {
  if (issue.selector && issue.selector !== 'head' && issue.selector !== 'html') {
    return issue.selector;
  }

  const $ = cheerio.load(html);
  const title = issue.title.toLowerCase();

  if (title.includes('alt')) {
    const img = $('img:not([alt]), img[alt=""]').first();
    if (img.length) return buildSelector($, img);
  }
  if ((title.includes('h1') && title.includes('saknad')) || (title.includes('h1') && title.includes('missing'))) {
    return null;
  }
  if (title.includes('flera h1') || title.includes('multiple h1')) {
    const h = $('h1').first();
    if (h.length) return buildSelector($, h);
  }
  if (
    title.includes('meta') ||
    title.includes('title') ||
    title.includes('viewport') ||
    title.includes('canonical') ||
    title.includes('open graph') ||
    title.includes('og:') ||
    title.includes('doctype') ||
    title.includes('charset') ||
    title.includes('strukturerad') ||
    title.includes('structured') ||
    title.includes('favicon') ||
    title.includes('noindex') ||
    title.includes('manifest')
  ) {
    return null;
  }
  if (title.includes('formulär') || title.includes('etikett') || title.includes('form field') || title.includes('label')) {
    const input = $('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea')
      .filter((_, el) => {
        const id = $(el).attr('id');
        return !(id && $(`label[for="${id}"]`).length) && !$(el).attr('aria-label');
      })
      .first();
    if (input.length) return buildSelector($, input);
  }
  if (title.includes('knapp') || title.includes('button')) {
    const btn = $('button, [role="button"]')
      .filter((_, el) => !$(el).text().trim() && !$(el).attr('aria-label'))
      .first();
    if (btn.length) return buildSelector($, btn);
  }
  if (title.includes('tomma länkar') || title.includes('empty link')) {
    const a = $('a')
      .filter((_, el) => !$(el).text().trim() && !$(el).attr('aria-label'))
      .first();
    if (a.length) return buildSelector($, a);
  }
  if (title.includes('bild') || title.includes('image')) {
    const img = $('img[src]').first();
    if (img.length) return buildSelector($, img);
  }
  if (title.includes('inline')) {
    const el = $('[style]').first();
    if (el.length) return buildSelector($, el);
  }
  if (title.includes('script') || title.includes('javascript')) {
    const s = $('script[src]:not([defer]):not([async])').first();
    if (s.length) return buildSelector($, s);
  }
  if (title.includes('iframe')) {
    const f = $('iframe:not([title])').first();
    if (f.length) return buildSelector($, f);
  }
  if (title.includes('språk') || title.includes('language')) return 'html';
  if (title.includes('duplicerade id') || title.includes('duplicate id')) {
    const ids = new Map<string, number>();
    $('[id]').each((_, el) => {
      const id = $(el).attr('id')!;
      ids.set(id, (ids.get(id) ?? 0) + 1);
    });
    const dup = [...ids.entries()].find(([, c]) => c > 1);
    if (dup) return `#${dup[0]}`;
  }
  if (title.includes('föråldrade') || title.includes('deprecated')) {
    const d = $('font, center, strike, marquee').first();
    if (d.length) return buildSelector($, d);
  }
  if (title.includes('rubrikhierarki') || title.includes('heading hierarchy')) {
    const h = $('h1, h2, h3, h4, h5, h6').eq(1);
    if (h.length) return buildSelector($, h);
  }

  return null;
}

function buildSelector($: cheerio.CheerioAPI, el: cheerio.Cheerio<any>): string | null {
  const id = el.attr('id');
  if (id && /^[a-zA-Z][\w-]*$/.test(id)) return `#${id}`;
  const tag = (el.prop('tagName') ?? '').toLowerCase();
  if (!tag) return null;
  const cls = (el.attr('class') ?? '').trim().split(/\s+/).filter(Boolean)[0];
  if (cls && /^[a-zA-Z][\w-]*$/.test(cls)) return `${tag}.${cls}`;
  return tag;
}

function snippetTag(issue: ScannerIssue): string | null {
  const match = issue.codeSnippet?.match(/<([a-zA-Z][\w-]*)/);
  return match?.[1]?.toLowerCase() ?? null;
}

/** Avoid tsx/esbuild injecting __name into page.evaluate callbacks. */
function pageFn<Args extends unknown[], R>(
  ...argNamesAndBody: [...string[], string]
): (...args: Args) => R {
  const body = argNamesAndBody[argNamesAndBody.length - 1] as string;
  const argNames = argNamesAndBody.slice(0, -1) as string[];
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  return new Function(...argNames, body) as (...args: Args) => R;
}

const isVisibleFn = pageFn<[Element], boolean>(
  'el',
  `var r = el.getBoundingClientRect();
   var style = window.getComputedStyle(el);
   return r.width > 2 && r.height > 2 && style.visibility !== 'hidden' && style.display !== 'none';`
);

const isSizedFn = pageFn<[Element], boolean>(
  'el',
  `var r = el.getBoundingClientRect();
   return r.width > 2 && r.height > 2;`
);

const findInDomFn = pageFn<[string], Element | null>(
  'title',
  `var t = String(title || '').toLowerCase();
   function pick(sel) {
     try {
       var el = document.querySelector(sel);
       if (!el) return null;
       var r = el.getBoundingClientRect();
       var s = window.getComputedStyle(el);
       if (r.width > 2 && r.height > 2 && s.display !== 'none' && s.visibility !== 'hidden') return el;
     } catch (e) {}
     return null;
   }
   if (t.indexOf('alt') !== -1) {
     var imgs = Array.prototype.slice.call(document.querySelectorAll('img')).filter(function (i) {
       return !i.getAttribute('alt');
     });
     if (imgs[0]) return imgs[0];
   }
   if (t.indexOf('flera h1') !== -1 || t.indexOf('multiple h1') !== -1) return pick('h1');
   if (t.indexOf('formulär') !== -1 || t.indexOf('etikett') !== -1 || t.indexOf('form field') !== -1) {
     var fields = Array.prototype.slice.call(document.querySelectorAll('input, select, textarea')).filter(function (el) {
       var type = (el.getAttribute('type') || '').toLowerCase();
       if (type === 'hidden' || type === 'submit' || type === 'button') return false;
       var id = el.getAttribute('id');
       var hasLabel = id && document.querySelector('label[for=\"' + id + '\"]');
       return !hasLabel && !el.getAttribute('aria-label');
     });
     if (fields[0]) return fields[0];
   }
   if (t.indexOf('knapp') !== -1 || t.indexOf('button') !== -1) {
     var btns = Array.prototype.slice.call(document.querySelectorAll('button, [role=\"button\"]')).filter(function (el) {
       return !(el.textContent || '').trim() && !el.getAttribute('aria-label');
     });
     if (btns[0]) return btns[0];
   }
   if (t.indexOf('tomma länkar') !== -1 || t.indexOf('empty link') !== -1) {
     var links = Array.prototype.slice.call(document.querySelectorAll('a')).filter(function (el) {
       return !(el.textContent || '').trim() && !el.getAttribute('aria-label');
     });
     if (links[0]) return links[0];
   }
   if (t.indexOf('bild') !== -1 || t.indexOf('image') !== -1) return pick('img[src]');
   if (t.indexOf('inline') !== -1) return pick('[style]');
   if (t.indexOf('script') !== -1 || t.indexOf('javascript') !== -1) {
     return pick('script[src]:not([defer]):not([async])');
   }
   if (t.indexOf('iframe') !== -1) return pick('iframe:not([title])');
   if (t.indexOf('duplicerade id') !== -1 || t.indexOf('duplicate id') !== -1) {
     var seen = {};
     var all = document.querySelectorAll('[id]');
     for (var i = 0; i < all.length; i++) {
       var id = all[i].id;
       if (seen[id]) return all[i];
       seen[id] = true;
     }
   }
   if (t.indexOf('föråldrade') !== -1 || t.indexOf('deprecated') !== -1) {
     return pick('font, center, strike, marquee');
   }
   if (t.indexOf('rubrikhierarki') !== -1 || t.indexOf('heading hierarchy') !== -1) {
     return document.querySelector('h2, h3, h4, h5, h6');
   }
   if ((t.indexOf('h1') !== -1) && (t.indexOf('saknad') !== -1 || t.indexOf('missing') !== -1)) {
     return document.querySelector('main, body');
   }
   return null;`
);

const scrollIntoViewFn = pageFn<[Element], void>(
  'el',
  `el.scrollIntoView({ block: 'center', behavior: 'instant' });`
);

const highlightFn = pageFn<[Element, string, string, string], void>(
  'el',
  'errorTitle',
  'errorDesc',
  'red',
  `var existing = document.getElementById('ss-annotator-root');
   if (existing) existing.remove();
   el.setAttribute('data-ss-highlight', '1');
   el.style.setProperty('outline', '5px solid ' + red, 'important');
   el.style.setProperty('outline-offset', '4px', 'important');
   el.style.setProperty('box-shadow', '0 0 0 8px rgba(229,57,53,0.45)', 'important');
   var rect = el.getBoundingClientRect();
   var root = document.createElement('div');
   root.id = 'ss-annotator-root';
   root.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647;';
   var ring = document.createElement('div');
   ring.style.cssText = 'position:fixed;left:' + (rect.left - 8) + 'px;top:' + (rect.top - 8) + 'px;width:' + (rect.width + 16) + 'px;height:' + (rect.height + 16) + 'px;border:4px solid ' + red + ';border-radius:4px;box-shadow:0 0 20px rgba(229,57,53,0.7);';
   var labelTop = Math.max(10, rect.top - 62);
   var label = document.createElement('div');
   label.style.cssText = 'position:fixed;left:' + Math.max(10, Math.min(rect.left, window.innerWidth - 400)) + 'px;top:' + labelTop + 'px;background:' + red + ';color:#fff;font:bold 13px/1.35 system-ui,sans-serif;padding:10px 14px;max-width:min(calc(100vw - 20px),420px);border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,0.4);border:2px solid #fff;';
   var safeTitle = String(errorTitle || '').replace(/</g, '&lt;');
   var safeDesc = String(errorDesc || '').slice(0, 110).replace(/</g, '&lt;');
   label.innerHTML = '<div style="font-size:14px;font-weight:700;margin-bottom:3px">' + safeTitle + '</div><div style="font-size:11px;font-weight:500">' + safeDesc + '</div>';
   root.appendChild(ring);
   root.appendChild(label);
   document.body.appendChild(root);`
);

const cleanupHighlightFn = pageFn<[Element], void>(
  'el',
  `el.removeAttribute('data-ss-highlight');
   el.style.outline = '';
   el.style.outlineOffset = '';
   el.style.boxShadow = '';`
);

async function findElementInLiveDom(page: Page, issue: ScannerIssue): Promise<ElementHandle<Element> | null> {
  const handle = await page.evaluateHandle(findInDomFn, issue.title);
  const el = handle.asElement();
  if (el) return el as ElementHandle<Element>;
  await handle.dispose();
  return null;
}

async function findElement(page: Page, issue: ScannerIssue, html: string): Promise<ElementHandle<Element> | null> {
  const candidates = [issue.selector, resolveIssueSelector(issue, html)].filter(
    (s): s is string => !!s && s !== 'head' && s !== 'html'
  );

  for (const sel of candidates) {
    try {
      const parts = sel.includes('>') ? [sel] : sel.split(',').map((s) => s.trim());
      for (const part of parts) {
        const handle = await page.$(part);
        if (!handle) continue;
        const visible = await handle.evaluate(isVisibleFn);
        if (visible) return handle as ElementHandle<Element>;
        await handle.dispose();
      }
    } catch {
      // next selector
    }
  }

  const live = await findElementInLiveDom(page, issue);
  if (live) return live;

  const tag = snippetTag(issue);
  if (tag) {
    const handles = await page.$$(tag);
    for (const handle of handles.slice(0, 8)) {
      const visible = await handle.evaluate(isSizedFn);
      if (visible) return handle as ElementHandle<Element>;
      await handle.dispose();
    }
  }

  return null;
}

async function highlightElement(
  page: Page,
  handle: ElementHandle<Element>,
  title: string,
  description: string
): Promise<void> {
  await handle.evaluate(scrollIntoViewFn);
  await new Promise((r) => setTimeout(r, 500));
  await handle.evaluate(highlightFn, title, description, RED);
}

async function cleanup(page: Page, handle: ElementHandle<Element> | null): Promise<void> {
  await page.evaluate(`document.getElementById('ss-annotator-root')?.remove()`).catch(() => {});
  if (handle) {
    await handle.evaluate(cleanupHighlightFn).catch(() => {});
  }
}

function isMetaIssue(issue: ScannerIssue, html: string): boolean {
  const sel = issue.selector ?? resolveIssueSelector(issue, html);
  if (sel === 'head' || sel === 'html') return true;
  const t = issue.title.toLowerCase();
  return (
    t.includes('meta') ||
    t.includes('canonical') ||
    t.includes('viewport') ||
    t.includes('open graph') ||
    t.includes('sitemap') ||
    t.includes('robots') ||
    t.includes('strukturerad') ||
    t.includes('structured') ||
    t.includes('hsts') ||
    t.includes('csp') ||
    t.includes('header') ||
    t.includes('https') ||
    t.includes('komprimering') ||
    t.includes('compression') ||
    t.includes('cache') ||
    t.includes('server')
  );
}

/** Annoterade skärmdumpar – röd ram direkt på elementet + feltext. */
export async function attachIssueScreenshots(
  url: string,
  issues: ScannerIssue[],
  html: string
): Promise<ScannerIssue[]> {
  const updated = [...issues];
  let page: Page | null = null;

  try {
    const browser = await getSharedBrowser();
    page = await browser.newPage();
    await page.setViewport({ width: 1350, height: 900, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 40000 });

    const visualCandidates = issues
      .map((issue, index) => ({ issue, index }))
      .filter(({ issue }) => !isMetaIssue(issue, html))
      .sort((a, b) => {
        const score = (i: ScannerIssue) =>
          (i.selector ? 2 : 0) + (i.source === 'axe' ? 1 : 0) + (i.category === 'Accessibility' ? 1 : 0);
        return score(b.issue) - score(a.issue);
      });

    let captured = 0;
    for (const { issue, index } of visualCandidates) {
      if (captured >= 15) break;
      let handle: ElementHandle<Element> | null = null;

      try {
        handle = await findElement(page, issue, html);
        if (!handle) continue;

        await highlightElement(page, handle, issue.title, issue.description);
        await new Promise((r) => setTimeout(r, 600));
        const base64 = await page.screenshot({ encoding: 'base64', type: 'jpeg', quality: 85 });
        updated[index] = { ...updated[index], screenshot: `data:image/jpeg;base64,${base64}` };
        captured++;
      } catch (err) {
        console.warn('Issue screenshot skipped:', issue.title, err);
      } finally {
        await cleanup(page, handle);
        if (handle) await handle.dispose().catch(() => {});
      }
    }
  } catch (err) {
    console.warn('Issue screenshots failed:', err);
  } finally {
    if (page) await page.close().catch(() => {});
  }

  return updated;
}
