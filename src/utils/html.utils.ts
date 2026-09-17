import * as cheerio from 'cheerio';

export function loadHtml(html: string) {
  return cheerio.load(html);
}

export function countDomNodes(html: string): number {
  const $ = loadHtml(html);
  return $('*').length;
}

export function getExternalScripts($: cheerio.CheerioAPI): number {
  return $('script[src^="http"]').length;
}

export function hasMixedContent(html: string, isHttps: boolean): string[] {
  if (!isHttps) return [];
  const $ = loadHtml(html);
  const mixed: string[] = [];
  $('img[src^="http://"], script[src^="http://"], link[href^="http://"], iframe[src^="http://"]').each((_, el) => {
    const tag = el.tagName;
    const attr = tag === 'link' ? 'href' : 'src';
    const val = $(el).attr(attr);
    if (val) mixed.push(`<${tag} ${attr}="${val}">`);
  });
  return mixed.slice(0, 3);
}
