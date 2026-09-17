import { ScannerRule, ScannerIssue, ScannerContext } from './types';
import { loadHtml } from '../utils/html.utils';

function issue(partial: Omit<ScannerIssue, 'source'>): ScannerIssue {
  return { source: 'rules', ...partial };
}

async function checkLink(url: string): Promise<number | null> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SiteScannerBot/2.0)' },
      redirect: 'follow'
    });
    // Certain hosts reject HEAD — retry with GET range
    if (res.status === 405 || res.status === 501) {
      const getRes = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(6000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SiteScannerBot/2.0)',
          Range: 'bytes=0-0'
        },
        redirect: 'follow'
      });
      return getRes.status;
    }
    return res.status;
  } catch {
    return null;
  }
}

async function checkLinksBatch(
  urls: string[],
  concurrency = 6
): Promise<Array<{ url: string; status: number | null }>> {
  const results: Array<{ url: string; status: number | null }> = [];
  let index = 0;

  async function worker() {
    while (index < urls.length) {
      const current = urls[index++];
      const status = await checkLink(current);
      results.push({ url: current, status });
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, () => worker()));
  return results;
}

function resolveUrl(href: string, base: URL): string | null {
  try {
    const resolved = new URL(href, base).toString();
    return resolved.startsWith('http') ? resolved : null;
  } catch {
    return null;
  }
}

const SECRET_PATTERNS: Array<{ name: string; re: RegExp }> = [
  { name: 'AWS access key', re: /AKIA[0-9A-Z]{16}/ },
  { name: 'Google API-nyckel', re: /AIza[0-9A-Za-z\-_]{35}/ },
  { name: 'Privat nyckel', re: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: 'Slack-token', re: /xox[baprs]-[0-9A-Za-z-]{10,}/ },
  { name: 'JWT i källkod', re: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  { name: 'Stripe-nyckel', re: /sk_live_[0-9a-zA-Z]{20,}/ },
];

export const DEEP_ANALYSIS_RULES: ScannerRule[] = [
  {
    name: 'Broken Links Deep Sample',
    category: 'SEO',
    run: async (html, context) => {
      const $ = loadHtml(html);
      const base = new URL(context.finalUrl);
      const links = new Set<string>();

      $('a[href]').each((_, el) => {
        const href = $(el).attr('href')?.trim();
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
        const resolved = resolveUrl(href, base);
        if (resolved && resolved !== base.toString()) links.add(resolved);
      });

      const sample = [...links].slice(0, 30);
      if (sample.length === 0) return [];

      const results = await checkLinksBatch(sample);
      const broken = results.filter((r) => r.status === null || r.status >= 400);

      if (broken.length > 0) {
        return [issue({
          category: 'SEO', severity: 'High',
          title: 'Trasiga länkar hittades',
          description: `${broken.length} av ${sample.length} testade länkar svarar med fel (${broken.slice(0, 4).map((b) => b.url).join(', ')}${broken.length > 4 ? '…' : ''}).`,
          recommendation: 'Åtgärda eller ta bort trasiga länkar – de skadar SEO och användarupplevelsen.',
          codeSnippet: broken[0]?.url
        })];
      }
      return [];
    }
  },
  {
    name: 'Broken Images Deep Sample',
    category: 'Code',
    run: async (html, context) => {
      const $ = loadHtml(html);
      const base = new URL(context.finalUrl);
      const images = new Set<string>();

      $('img[src]').each((_, el) => {
        const src = $(el).attr('src')?.trim();
        if (!src || src.startsWith('data:')) return;
        const resolved = resolveUrl(src, base);
        if (resolved) images.add(resolved);
      });

      const sample = [...images].slice(0, 20);
      if (sample.length === 0) return [];

      const results = await checkLinksBatch(sample, 5);
      const broken = results.filter((r) => r.status === null || r.status >= 400);

      if (broken.length > 0) {
        return [issue({
          category: 'Code', severity: 'High',
          title: 'Trasiga bilder hittades',
          description: `${broken.length} av ${sample.length} testade bild-URL:er misslyckades (${broken.slice(0, 3).map((b) => b.url).join(', ')}${broken.length > 3 ? '…' : ''}).`,
          recommendation: 'Uppdatera src-attribut eller ta bort bilder som inte längre finns.',
          codeSnippet: broken[0]?.url
        })];
      }
      return [];
    }
  },
  {
    name: 'Broken Stylesheets And Scripts',
    category: 'Performance',
    run: async (html, context) => {
      const $ = loadHtml(html);
      const base = new URL(context.finalUrl);
      const assets = new Set<string>();

      $('link[rel="stylesheet"][href], script[src]').each((_, el) => {
        const attr = el.tagName === 'link' ? 'href' : 'src';
        const val = $(el).attr(attr)?.trim();
        if (!val || val.startsWith('data:')) return;
        const resolved = resolveUrl(val, base);
        if (resolved) assets.add(resolved);
      });

      const sample = [...assets].slice(0, 20);
      if (sample.length === 0) return [];

      const results = await checkLinksBatch(sample, 5);
      const broken = results.filter((r) => r.status === null || r.status >= 400);

      if (broken.length > 0) {
        return [issue({
          category: 'Performance', severity: 'High',
          title: 'Trasiga CSS/JS-resurser',
          description: `${broken.length} stylesheet- eller script-filer svarar med fel.`,
          recommendation: 'Åtgärda saknade eller felaktiga resurs-URL:er – de bryter layout och funktionalitet.',
          codeSnippet: broken[0]?.url
        })];
      }
      return [];
    }
  },
  {
    name: 'Web App Manifest',
    category: 'SEO',
    run: async (html) => {
      const $ = loadHtml(html);
      if (!$('link[rel="manifest"]').length) {
        return [issue({
          category: 'SEO', severity: 'Low',
          title: 'Saknad web app manifest',
          description: 'Ingen manifest.json – PWA-funktioner och "Lägg till på hemskärmen" saknas.',
          recommendation: 'Skapa manifest.json och länka med <link rel="manifest" href="/manifest.json">.',
          codeSnippet: '<link rel="manifest" href="/manifest.json">'
        })];
      }
      return [];
    }
  },
  {
    name: 'Modern Image Formats',
    category: 'Performance',
    run: async (html) => {
      const $ = loadHtml(html);
      let legacy = 0;
      $('img[src]').each((_, img) => {
        const src = ($(img).attr('src') ?? '').toLowerCase();
        if (/\.(jpg|jpeg|png|bmp|gif)(\?|$)/.test(src) && !src.includes('.webp') && !src.includes('.avif')) legacy++;
      });
      if (legacy > 2) {
        return [issue({
          category: 'Performance', severity: 'Medium',
          title: 'Äldre bildformat används',
          description: `${legacy} bilder använder JPEG/PNG istället för WebP/AVIF – större filstorlek och långsammare laddning.`,
          recommendation: 'Konvertera bilder till WebP eller AVIF och använd <picture> för fallback.'
        })];
      }
      return [];
    }
  },
  {
    name: 'Heading Hierarchy',
    category: 'Accessibility',
    run: async (html) => {
      const $ = loadHtml(html);
      const levels: number[] = [];
      $('h1, h2, h3, h4, h5, h6').each((_, el) => {
        const tag = (el as { tagName?: string }).tagName?.toLowerCase() ?? '';
        const n = parseInt(tag.replace('h', ''), 10);
        if (!Number.isNaN(n)) levels.push(n);
      });
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] - levels[i - 1] > 1) {
          return [issue({
            category: 'Accessibility', severity: 'Medium',
            title: 'Bruten rubrikhierarki',
            description: `Rubriknivå hoppar från H${levels[i - 1]} till H${levels[i]} – svårt för skärmläsare att navigera.`,
            recommendation: 'Använd sekventiella rubriknivåer (H1 → H2 → H3) utan att hoppa över nivåer.'
          })];
        }
      }
      return [];
    }
  },
  {
    name: 'Iframe Title Check',
    category: 'Accessibility',
    run: async (html) => {
      const $ = loadHtml(html);
      let untitled = 0;
      $('iframe').each((_, el) => {
        if (!$(el).attr('title') && !$(el).attr('aria-label')) untitled++;
      });
      if (untitled > 0) {
        return [issue({
          category: 'Accessibility', severity: 'Medium',
          title: 'Iframes utan titel',
          description: `${untitled} iframe(s) saknar title eller aria-label.`,
          recommendation: 'Lägg till beskrivande title på alla inbäddade iframes.',
          codeSnippet: '<iframe title="Beskrivning av innehåll" src="..."></iframe>'
        })];
      }
      return [];
    }
  },
  {
    name: 'Cache Control Headers',
    category: 'Performance',
    run: async (_, context) => {
      const cache = context.headers.get('cache-control') ?? '';
      if (!cache && context.contentLength > 5000) {
        return [issue({
          category: 'Performance', severity: 'Low',
          title: 'Saknad cache-policy',
          description: 'HTML-svaret saknar Cache-Control-header – upprepad laddning blir långsammare.',
          recommendation: 'Sätt Cache-Control med rimlig max-age för statiska resurser.'
        })];
      }
      return [];
    }
  },
  {
    name: 'Subresource Integrity',
    category: 'Security',
    run: async (html) => {
      const $ = loadHtml(html);
      let missing = 0;
      let first: string | undefined;
      $('script[src^="http"], link[rel="stylesheet"][href^="http"]').each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('href') || '';
        const isCdn = /cdn\.|unpkg\.|jsdelivr|cdnjs|googleapis|bootstrapcdn|cloudflare/i.test(src);
        if (isCdn && !$(el).attr('integrity')) {
          missing++;
          if (!first) first = $.html(el).slice(0, 300);
        }
      });
      if (missing > 0) {
        return [issue({
          category: 'Security', severity: 'Medium',
          title: 'CDN-resurser utan Subresource Integrity',
          description: `${missing} externa CDN-script/stylesheets saknar integrity-attribut – risk om CDN komprometteras.`,
          recommendation: 'Lägg till integrity och crossorigin på CDN-resurser.',
          codeSnippet: first
            ? first.replace(/>$/, ' integrity="sha384-..." crossorigin="anonymous">')
            : '<script src="https://cdn.example.com/lib.js" integrity="sha384-..." crossorigin="anonymous"></script>'
        })];
      }
      return [];
    }
  },
  {
    name: 'Inline Event Handlers',
    category: 'Code',
    run: async (html) => {
      const $ = loadHtml(html);
      const handlers = [
        'onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onsubmit',
        'onchange', 'onkeydown', 'onkeyup', 'onmouseenter', 'onmouseleave'
      ];
      let count = 0;
      let first: string | undefined;
      const selector = handlers.map((h) => `[${h}]`).join(',');
      $(selector).each((_, el) => {
        count++;
        if (!first) first = $.html(el).slice(0, 250);
      });
      if (count > 0) {
        return [issue({
          category: 'Code', severity: 'Medium',
          title: 'Inline event handlers i HTML',
          description: `${count} element använder inline-handlers (onclick m.fl.) – svårare att underhålla och sämre CSP-kompatibilitet.`,
          recommendation: 'Flytta händelsehantering till externa script med addEventListener.',
          codeSnippet: first
        })];
      }
      return [];
    }
  },
  {
    name: 'Dangerous JavaScript Patterns',
    category: 'Security',
    run: async (html) => {
      const issues: ScannerIssue[] = [];
      const findings: string[] = [];

      if (/\beval\s*\(/.test(html)) findings.push('eval()');
      if (/\bnew\s+Function\s*\(/.test(html)) findings.push('new Function()');
      if (/\.innerHTML\s*=/.test(html)) findings.push('innerHTML-tilldelning');
      if (/javascript:/i.test(html)) findings.push('javascript:-URL:er');
      if (/document\.cookie\s*=/.test(html)) findings.push('document.cookie-skrivning');

      if (findings.length > 0) {
        issues.push(issue({
          category: 'Security', severity: 'High',
          title: 'Riskabla JavaScript-mönster i källkod',
          description: `Hittade potentiellt osäkra mönster: ${findings.join(', ')}. Dessa ökar XSS-risken.`,
          recommendation: 'Undvik eval/Function, sanera innan innerHTML och använd textContent där möjligt.',
          codeSnippet: findings[0]
        }));
      }
      return issues;
    }
  },
  {
    name: 'Hardcoded Secrets In Source',
    category: 'Security',
    run: async (html) => {
      const found: string[] = [];
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.re.test(html)) found.push(pattern.name);
      }
      if (found.length > 0) {
        return [issue({
          category: 'Security', severity: 'High',
          title: 'Möjliga hemligheter i sidkällan',
          description: `Mönster som liknar hemligheter hittades: ${found.join(', ')}. Om det är riktiga nycklar måste de roteras omedelbart.`,
          recommendation: 'Flytta nycklar till servermiljövariabler. Exponera aldrig privata API-nycklar i frontend.'
        })];
      }
      return [];
    }
  },
  {
    name: 'Debug Code In Production',
    category: 'Code',
    run: async (html) => {
      const $ = loadHtml(html);
      let consoleCount = 0;
      let hasDebugger = false;

      $('script:not([src])').each((_, el) => {
        const code = $(el).html() ?? '';
        const matches = code.match(/console\.(log|debug|info|warn|error)\s*\(/g);
        if (matches) consoleCount += matches.length;
        if (/\bdebugger\b/.test(code)) hasDebugger = true;
      });

      if (consoleCount >= 3 || hasDebugger) {
        return [issue({
          category: 'Code', severity: 'Low',
          title: 'Debugkod kvar i produktion',
          description: `${consoleCount} console.*-anrop${hasDebugger ? ' och debugger-statement' : ''} hittades i inline-script.`,
          recommendation: 'Ta bort console.log/debugger innan publicering, eller strippa dem i build-steget.'
        })];
      }
      return [];
    }
  },
  {
    name: 'Empty Headings',
    category: 'Accessibility',
    run: async (html) => {
      const $ = loadHtml(html);
      let empty = 0;
      let first: string | undefined;
      $('h1, h2, h3, h4, h5, h6').each((_, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        const aria = $(el).attr('aria-label');
        if (!text && !aria) {
          empty++;
          if (!first) first = $.html(el).slice(0, 200);
        }
      });
      if (empty > 0) {
        return [issue({
          category: 'Accessibility', severity: 'Medium',
          title: 'Tomma rubriker',
          description: `${empty} rubriktaggar saknar textinnehåll.`,
          recommendation: 'Fyll i meningsfull rubriktext eller ta bort tomma rubrikelement.',
          codeSnippet: first
        })];
      }
      return [];
    }
  },
  {
    name: 'Generic Link Text',
    category: 'Accessibility',
    run: async (html) => {
      const $ = loadHtml(html);
      const generic = /^(click here|here|read more|läs mer|klicka här|här|more|mer|länk|link)$/i;
      let count = 0;
      let first: string | undefined;
      $('a').each((_, el) => {
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        if (generic.test(text)) {
          count++;
          if (!first) first = $.html(el).slice(0, 200);
        }
      });
      if (count > 0) {
        return [issue({
          category: 'Accessibility', severity: 'Medium',
          title: 'Generisk länktext',
          description: `${count} länkar använder otydlig text som "klicka här" / "läs mer" – skärmläsare får ingen kontext.`,
          recommendation: 'Använd beskrivande länktext som beskriver målsidan.',
          codeSnippet: first
        })];
      }
      return [];
    }
  },
  {
    name: 'Tables Without Headers',
    category: 'Accessibility',
    run: async (html) => {
      const $ = loadHtml(html);
      let bad = 0;
      let first: string | undefined;
      $('table').each((_, el) => {
        const hasTh = $(el).find('th').length > 0;
        const hasScope = $(el).find('[scope]').length > 0;
        const rows = $(el).find('tr').length;
        if (rows > 1 && !hasTh && !hasScope) {
          bad++;
          if (!first) first = $.html(el).slice(0, 300);
        }
      });
      if (bad > 0) {
        return [issue({
          category: 'Accessibility', severity: 'Medium',
          title: 'Tabeller utan rubrikceller',
          description: `${bad} datatabeller saknar <th> eller scope – svårt att tolka för skärmläsare.`,
          recommendation: 'Använd <th scope="col|row"> för tabellrubriker.',
          codeSnippet: first
        })];
      }
      return [];
    }
  },
  {
    name: 'Media Without Captions',
    category: 'Accessibility',
    run: async (html) => {
      const $ = loadHtml(html);
      let missing = 0;
      $('video, audio').each((_, el) => {
        if ($(el).find('track[kind="captions"], track[kind="subtitles"]').length === 0) missing++;
      });
      if (missing > 0) {
        return [issue({
          category: 'Accessibility', severity: 'Medium',
          title: 'Media utan undertexter',
          description: `${missing} video/audio-element saknar <track kind="captions">.`,
          recommendation: 'Lägg till undertexter via WebVTT-track för tillgänglighet.',
          codeSnippet: '<video controls>\n  <source src="film.mp4" type="video/mp4">\n  <track kind="captions" src="captions.vtt" srclang="sv" label="Svenska">\n</video>'
        })];
      }
      return [];
    }
  },
  {
    name: 'Positive Tabindex',
    category: 'Accessibility',
    run: async (html) => {
      const $ = loadHtml(html);
      let count = 0;
      let first: string | undefined;
      $('[tabindex]').each((_, el) => {
        const val = parseInt($(el).attr('tabindex') ?? '', 10);
        if (!Number.isNaN(val) && val > 0) {
          count++;
          if (!first) first = $.html(el).slice(0, 200);
        }
      });
      if (count > 0) {
        return [issue({
          category: 'Accessibility', severity: 'Medium',
          title: 'Positivt tabindex används',
          description: `${count} element har tabindex > 0 vilket stör naturlig fokusordning.`,
          recommendation: 'Använd tabindex="0" eller "-1", och lita på DOM-ordningen för fokus.',
          codeSnippet: first
        })];
      }
      return [];
    }
  },
  {
    name: 'Missing Main Landmark',
    category: 'Accessibility',
    run: async (html) => {
      const $ = loadHtml(html);
      const hasMain = $('main, [role="main"]').length > 0;
      if (!hasMain && $('body').length > 0 && $('*').length > 30) {
        return [issue({
          category: 'Accessibility', severity: 'Low',
          title: 'Saknad main-landmark',
          description: 'Sidan saknar <main> eller role="main" – skärmläsaranvändare får svårare att hoppa till innehållet.',
          recommendation: 'Wrapa huvudinnehållet i <main>.',
          codeSnippet: '<main id="main">\n  <!-- sidans huvudinnehåll -->\n</main>'
        })];
      }
      return [];
    }
  },
  {
    name: 'Placeholder Only Labels',
    category: 'Accessibility',
    run: async (html) => {
      const $ = loadHtml(html);
      let count = 0;
      let first: string | undefined;
      $('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea').each((_, el) => {
        const id = $(el).attr('id');
        const hasLabel = id ? $(`label[for="${id}"]`).length > 0 : false;
        const hasAria = !!$(el).attr('aria-label') || !!$(el).attr('aria-labelledby');
        const hasPlaceholder = !!$(el).attr('placeholder');
        if (hasPlaceholder && !hasLabel && !hasAria) {
          count++;
          if (!first) first = $.html(el).slice(0, 200);
        }
      });
      if (count > 0) {
        return [issue({
          category: 'Accessibility', severity: 'Medium',
          title: 'Placeholder används som etikett',
          description: `${count} fält förlitar sig bara på placeholder – försvinner vid inmatning och är otillgängligt.`,
          recommendation: 'Använd synlig <label> utöver eventuell placeholder.',
          codeSnippet: first
        })];
      }
      return [];
    }
  },
  {
    name: 'Password Autocomplete',
    category: 'Security',
    run: async (html) => {
      const $ = loadHtml(html);
      let missing = 0;
      $('input[type="password"]').each((_, el) => {
        const ac = ($(el).attr('autocomplete') ?? '').toLowerCase();
        if (!ac || (!ac.includes('current-password') && !ac.includes('new-password') && ac !== 'off')) {
          missing++;
        }
      });
      if (missing > 0) {
        return [issue({
          category: 'Security', severity: 'Low',
          title: 'Lösenordsfält utan korrekt autocomplete',
          description: `${missing} lösenordsfält saknar autocomplete="current-password" eller "new-password".`,
          recommendation: 'Ange autocomplete för lösenordsfält så att lösenordshanterare fungerar säkert.',
          codeSnippet: '<input type="password" name="password" autocomplete="current-password">'
        })];
      }
      return [];
    }
  },
  {
    name: 'Meta Refresh',
    category: 'SEO',
    run: async (html) => {
      const $ = loadHtml(html);
      const refresh = $('meta[http-equiv="refresh"]').attr('content');
      if (refresh) {
        return [issue({
          category: 'SEO', severity: 'Medium',
          title: 'Meta refresh-omdirigering',
          description: `Sidan använder meta refresh (${refresh}) – dåligt för SEO och tillgänglighet.`,
          recommendation: 'Använd HTTP 301/302-redirects istället för meta refresh.',
          codeSnippet: `<meta http-equiv="refresh" content="${refresh}">`
        })];
      }
      return [];
    }
  },
  {
    name: 'JSON-LD Validation',
    category: 'SEO',
    run: async (html) => {
      const $ = loadHtml(html);
      const issues: ScannerIssue[] = [];
      let invalid = 0;
      let firstError = '';

      $('script[type="application/ld+json"]').each((_, el) => {
        const raw = ($(el).html() ?? '').trim();
        if (!raw) return;
        try {
          JSON.parse(raw);
        } catch (err) {
          invalid++;
          if (!firstError) firstError = err instanceof Error ? err.message : 'Ogiltig JSON';
        }
      });

      if (invalid > 0) {
        issues.push(issue({
          category: 'SEO', severity: 'Medium',
          title: 'Ogiltig strukturerad data (JSON-LD)',
          description: `${invalid} JSON-LD-block kunde inte parsas (${firstError}). Google ignorerar trasig structured data.`,
          recommendation: 'Validera JSON-LD med Google Rich Results Test och åtgärda syntaxfel.'
        }));
      }
      return issues;
    }
  },
  {
    name: 'Twitter Card Tags',
    category: 'SEO',
    run: async (html) => {
      const $ = loadHtml(html);
      const hasOg = $('meta[property="og:title"]').length > 0;
      const hasTwitter = $('meta[name="twitter:card"], meta[property="twitter:card"]').length > 0;
      if (hasOg && !hasTwitter) {
        return [issue({
          category: 'SEO', severity: 'Low',
          title: 'Saknade Twitter Card-taggar',
          description: 'Open Graph finns men Twitter Card-meta saknas – delningar på X/Twitter kan bli sämre.',
          recommendation: 'Lägg till twitter:card, twitter:title och twitter:image.',
          codeSnippet: '<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="Din titel">'
        })];
      }
      return [];
    }
  },
  {
    name: 'Large Inline Scripts',
    category: 'Performance',
    run: async (html) => {
      const $ = loadHtml(html);
      let large = 0;
      let maxKb = 0;
      $('script:not([src])').each((_, el) => {
        const bytes = Buffer.byteLength($(el).html() ?? '', 'utf8');
        const kb = Math.round(bytes / 1024);
        if (kb > 20) {
          large++;
          maxKb = Math.max(maxKb, kb);
        }
      });
      if (large > 0) {
        return [issue({
          category: 'Performance', severity: 'Medium',
          title: 'Stora inline-script',
          description: `${large} inline-script är över 20 KB (störst ~${maxKb} KB) – ökar HTML-storlek och blockerar caching.`,
          recommendation: 'Flytta stora script till externa filer med defer/async och lång cache.'
        })];
      }
      return [];
    }
  },
  {
    name: 'Base64 Images In HTML',
    category: 'Performance',
    run: async (html) => {
      const $ = loadHtml(html);
      let count = 0;
      let totalKb = 0;
      $('img[src^="data:image"]').each((_, el) => {
        const src = $(el).attr('src') ?? '';
        count++;
        totalKb += Math.round(src.length / 1024);
      });
      if (count > 0 && totalKb > 50) {
        return [issue({
          category: 'Performance', severity: 'Medium',
          title: 'Stora base64-bilder i HTML',
          description: `${count} inline base64-bilder (~${totalKb} KB) blåser upp HTML och förhindrar browser-cache.`,
          recommendation: 'Använd externa bildfiler (WebP/AVIF) istället för data-URI:er för stora bilder.'
        })];
      }
      return [];
    }
  },
  {
    name: 'Deep DOM Nesting',
    category: 'Code',
    run: async (html) => {
      const $ = loadHtml(html);
      let maxDepth = 0;

      function walk(el: Parameters<typeof $>[0], depth: number) {
        maxDepth = Math.max(maxDepth, depth);
        if (depth > 40) return;
        $(el).children().each((_, child) => walk(child, depth + 1));
      }

      $('body').each((_, body) => walk(body, 1));

      if (maxDepth > 25) {
        return [issue({
          category: 'Code', severity: 'Low',
          title: 'Mycket djup DOM-nestning',
          description: `Djupaste nestningen är ${maxDepth} nivåer. Djupa träd gör CSS/JS långsammare och koden svårare att underhålla.`,
          recommendation: 'Förenkla markup och ta bort onödiga wrapper-element.'
        })];
      }
      return [];
    }
  },
  {
    name: 'HTML Comments With Sensitive Hints',
    category: 'Security',
    run: async (html) => {
      const comments = html.match(/<!--[\s\S]*?-->/g) ?? [];
      const sensitive = comments.filter((c) =>
        /(password|passwd|secret|api[_-]?key|token|todo:?\s*fix|credentials|admin)/i.test(c)
      );
      if (sensitive.length > 0) {
        return [issue({
          category: 'Security', severity: 'Medium',
          title: 'Känsliga HTML-kommentarer',
          description: `${sensitive.length} kommentarer nämner lösenord, nycklar eller liknande – synliga i sidkällan.`,
          recommendation: 'Ta bort känsliga kommentarer från produktions-HTML.',
          codeSnippet: sensitive[0].slice(0, 200)
        })];
      }
      return [];
    }
  },
  {
    name: 'Cookie Security Flags',
    category: 'Security',
    run: async (_, context) => {
      const raw = context.headers.get('set-cookie');
      if (!raw) return [];

      const cookies = raw.split(/,(?=\s*[^;=]+=)/);
      const problems: string[] = [];

      for (const cookie of cookies) {
        const lower = cookie.toLowerCase();
        const name = cookie.split('=')[0]?.trim() ?? 'cookie';
        if (!lower.includes('secure') && context.isHttps) problems.push(`${name}: saknar Secure`);
        if (!lower.includes('httponly') && /session|auth|token|sid/i.test(name)) {
          problems.push(`${name}: saknar HttpOnly`);
        }
        if (!lower.includes('samesite')) problems.push(`${name}: saknar SameSite`);
      }

      if (problems.length > 0) {
        return [issue({
          category: 'Security', severity: 'Medium',
          title: 'Osäkra cookie-flaggor',
          description: `Set-Cookie saknar viktiga flaggor: ${problems.slice(0, 4).join('; ')}${problems.length > 4 ? '…' : ''}.`,
          recommendation: 'Sätt Secure; HttpOnly; SameSite=Lax (eller Strict) på sessionscookies.'
        })];
      }
      return [];
    }
  },
  {
    name: 'Robots Disallow All',
    category: 'SEO',
    run: async (_, context) => {
      const robots = context.robotsTxt ?? '';
      if (/User-agent:\s*\*\s*[\r\n]+Disallow:\s*\/\s*($|[\r\n])/im.test(robots)) {
        return [issue({
          category: 'SEO', severity: 'High',
          title: 'robots.txt blockerar hela sajten',
          description: 'robots.txt har Disallow: / för alla user-agents – sökmotorer indexerar inte innehållet.',
          recommendation: 'Justera robots.txt om sajten ska synas i sökresultat.'
        })];
      }
      return [];
    }
  },
  {
    name: 'Deprecated Libraries',
    category: 'Code',
    run: async (html) => {
      const findings: string[] = [];
      if (/jquery[\.-]?(1\.[0-9]|2\.[0-9])/i.test(html)) findings.push('jQuery 1.x/2.x');
      if (/angular\.js[\/\-]?1\./i.test(html)) findings.push('AngularJS 1.x');
      if (/modernizr/i.test(html) && /html5shiv/i.test(html)) findings.push('html5shiv/Modernizr (legacy IE)');
      if (/swfobject|flash\.swf|\.swf/i.test(html)) findings.push('Flash/SWF');

      if (findings.length > 0) {
        return [issue({
          category: 'Code', severity: 'Medium',
          title: 'Föråldrade bibliotek upptäckta',
          description: `Sidan verkar använda: ${findings.join(', ')}. Äldre bibliotek saknar ofta säkerhetsuppdateringar.`,
          recommendation: 'Uppgradera till underhållna versioner eller ersätt med moderna alternativ.'
        })];
      }
      return [];
    }
  },
  {
    name: 'Forms Over HTTP',
    category: 'Security',
    run: async (html, context) => {
      if (context.isHttps) return [];
      const $ = loadHtml(html);
      const hasSensitive = $('input[type="password"], input[name*="card"], input[autocomplete*="cc-"]').length > 0;
      if (hasSensitive) {
        return [issue({
          category: 'Security', severity: 'High',
          title: 'Känsliga formulär över HTTP',
          description: 'Lösenords- eller betalningsfält skickas över okrypterad HTTP.',
          recommendation: 'Tvinga HTTPS innan användare kan skicka känslig data.'
        })];
      }
      return [];
    }
  },
  {
    name: 'Important CSS Abuse',
    category: 'Code',
    run: async (html) => {
      const $ = loadHtml(html);
      let importantCount = 0;
      $('style').each((_, el) => {
        const css = $(el).html() ?? '';
        const matches = css.match(/!important/gi);
        if (matches) importantCount += matches.length;
      });
      if (importantCount >= 15) {
        return [issue({
          category: 'Code', severity: 'Low',
          title: 'Överanvändning av !important',
          description: `${importantCount} !important i inline-<style> – tecken på CSS-specifitetsproblem.`,
          recommendation: 'Refaktorera CSS-hierarkin istället för att förlita dig på !important.'
        })];
      }
      return [];
    }
  },
  {
    name: 'Missing Noscript Fallback',
    category: 'Accessibility',
    run: async (html) => {
      const $ = loadHtml(html);
      const scripts = $('script[src]').length;
      const hasNoscript = $('noscript').length > 0;
      if (scripts > 5 && !hasNoscript) {
        return [issue({
          category: 'Accessibility', severity: 'Low',
          title: 'Saknad noscript-fallback',
          description: 'Många script laddas men ingen <noscript> – användare utan JS får ingen vägledning.',
          recommendation: 'Lägg till en <noscript>-sektion med grundläggande innehåll eller instruktion.',
          codeSnippet: '<noscript>Denna webbplats kräver JavaScript för full funktionalitet.</noscript>'
        })];
      }
      return [];
    }
  },
  {
    name: 'HrefLang Check',
    category: 'SEO',
    run: async (html) => {
      const $ = loadHtml(html);
      const langs = new Set<string>();
      $('html[lang]').each((_, el) => {
        const lang = $(el).attr('lang');
        if (lang) langs.add(lang.toLowerCase().slice(0, 2));
      });
      $('[lang]').each((_, el) => {
        const lang = $(el).attr('lang');
        if (lang) langs.add(lang.toLowerCase().slice(0, 2));
      });
      const hreflang = $('link[rel="alternate"][hreflang]').length;
      if (langs.size > 1 && hreflang === 0) {
        return [issue({
          category: 'SEO', severity: 'Low',
          title: 'Flera språk utan hreflang',
          description: `Sidan blandar språkmarkörer (${[...langs].join(', ')}) men saknar hreflang-länkar.`,
          recommendation: 'Lägg till <link rel="alternate" hreflang="..."> för varje språkversion.'
        })];
      }
      return [];
    }
  }
];
