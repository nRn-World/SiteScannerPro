import * as cheerio from 'cheerio';
import { ScannerRule, ScannerIssue } from './types';
import { countDomNodes, getExternalScripts, hasMixedContent, loadHtml } from '../utils/html.utils';

function issue(
  partial: Omit<ScannerIssue, 'source'> & { source?: ScannerIssue['source'] }
): ScannerIssue {
  return { source: 'rules', ...partial };
}

export const EXTENDED_SEO_RULES: ScannerRule[] = [
  {
    name: 'Title Length Check',
    category: 'SEO',
    run: async (html) => {
      const $ = loadHtml(html);
      const title = $('title').text().trim();
      const issues: ScannerIssue[] = [];
      if (title && title.length < 30) {
        issues.push(issue({
          category: 'SEO', severity: 'Medium',
          title: 'För kort sidtitel',
          description: `Title-taggen är bara ${title.length} tecken. Google visar ofta 50–60 tecken.`,
          recommendation: 'Utöka titeln med primärt sökord och varumärke (ca 50–60 tecken).',
          codeSnippet: `<title>${title} – Ditt varumärke</title>`
        }));
      } else if (title.length > 60) {
        issues.push(issue({
          category: 'SEO', severity: 'Low',
          title: 'För lång sidtitel',
          description: `Title-taggen är ${title.length} tecken och kan trunkeras i sökresultat.`,
          recommendation: 'Korta ner titeln till max 60 tecken med de viktigaste orden först.',
          codeSnippet: `<title>${title.slice(0, 57)}…</title>`
        }));
      }
      return issues;
    }
  },
  {
    name: 'Meta Description Length',
    category: 'SEO',
    run: async (html) => {
      const $ = loadHtml(html);
      const desc = $('meta[name="description"]').attr('content')?.trim() ?? '';
      const issues: ScannerIssue[] = [];
      if (desc && desc.length < 70) {
        issues.push(issue({
          category: 'SEO', severity: 'Low',
          title: 'Kort metabeskrivning',
          description: `Meta description är ${desc.length} tecken. Rekommenderat: 120–160.`,
          recommendation: 'Skriv en lockande beskrivning på 120–160 tecken med primärt sökord.',
          codeSnippet: `<meta name="description" content="${desc} – Läs mer om våra tjänster.">`
        }));
      } else if (desc.length > 160) {
        issues.push(issue({
          category: 'SEO', severity: 'Low',
          title: 'För lång metabeskrivning',
          description: `Meta description är ${desc.length} tecken och kan kapas i Google.`,
          recommendation: 'Korta ner till max 160 tecken.',
        }));
      }
      return issues;
    }
  },
  {
    name: 'Multiple H1 Check',
    category: 'SEO',
    run: async (html) => {
      const $ = loadHtml(html);
      const h1Count = $('h1').length;
      if (h1Count > 1) {
        return [issue({
          category: 'SEO', severity: 'Medium',
          title: 'Flera H1-rubriker',
          description: `Sidan har ${h1Count} H1-taggar. Bästa praxis är exakt en per sida.`,
          recommendation: 'Behåll en H1 som huvudrubrik och ändra övriga till H2/H3.',
          codeSnippet: $('h1').first().prop('outerHTML') ?? undefined
        })];
      }
      return [];
    }
  },
  {
    name: 'Viewport Meta Check',
    category: 'SEO',
    run: async (html) => {
      const $ = loadHtml(html);
      if (!$('meta[name="viewport"]').length) {
        return [issue({
          category: 'SEO', severity: 'High',
          title: 'Saknad viewport-meta',
          description: 'Sidan saknar viewport-taggen som krävs för mobilanpassning.',
          recommendation: 'Lägg till viewport-meta i <head> för responsiv design.',
          codeSnippet: '<meta name="viewport" content="width=device-width, initial-scale=1">'
        })];
      }
      return [];
    }
  },
  {
    name: 'Canonical URL Check',
    category: 'SEO',
    run: async (html) => {
      const $ = loadHtml(html);
      if (!$('link[rel="canonical"]').attr('href')) {
        return [issue({
          category: 'SEO', severity: 'Medium',
          title: 'Saknad canonical-URL',
          description: 'Ingen canonical-länk hittades. Det kan orsaka duplicerat innehåll i Google.',
          recommendation: 'Lägg till <link rel="canonical" href="..."> med sidans föredragna URL.',
          codeSnippet: '<link rel="canonical" href="https://example.com/sida">'
        })];
      }
      return [];
    }
  },
  {
    name: 'Open Graph Check',
    category: 'SEO',
    run: async (html) => {
      const $ = loadHtml(html);
      const issues: ScannerIssue[] = [];
      if (!$('meta[property="og:title"]').attr('content')) {
        issues.push(issue({
          category: 'SEO', severity: 'Low',
          title: 'Saknad Open Graph-titel',
          description: 'og:title saknas – delningar på sociala medier får sämre förhandsvisning.',
          recommendation: 'Lägg till Open Graph-taggar för titel, beskrivning och bild.',
          codeSnippet: '<meta property="og:title" content="Din sidtitel">\n<meta property="og:description" content="Beskrivning">\n<meta property="og:image" content="https://example.com/bild.jpg">'
        }));
      }
      if (!$('meta[property="og:image"]').attr('content')) {
        issues.push(issue({
          category: 'SEO', severity: 'Low',
          title: 'Saknad delningsbild (og:image)',
          description: 'Ingen og:image – länkar delade på Facebook/LinkedIn saknar bild.',
          recommendation: 'Lägg till en bild på minst 1200×630 px som og:image.',
          codeSnippet: '<meta property="og:image" content="https://example.com/og-image.jpg">'
        }));
      }
      return issues;
    }
  },
  {
    name: 'Structured Data Check',
    category: 'SEO',
    run: async (html) => {
      const $ = loadHtml(html);
      const hasJsonLd = $('script[type="application/ld+json"]').length > 0;
      const hasMicrodata = $('[itemscope]').length > 0;
      if (!hasJsonLd && !hasMicrodata) {
        return [issue({
          category: 'SEO', severity: 'Low',
          title: 'Ingen strukturerad data',
          description: 'Sidan saknar JSON-LD eller microdata för rich results i Google.',
          recommendation: 'Lägg till schema.org JSON-LD (t.ex. Organization, WebSite, Article).',
          codeSnippet: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebSite",\n  "name": "Din webbplats",\n  "url": "https://example.com"\n}\n</script>`
        })];
      }
      return [];
    }
  },
  {
    name: 'Robots Meta Check',
    category: 'SEO',
    run: async (html) => {
      const $ = loadHtml(html);
      const robots = $('meta[name="robots"]').attr('content')?.toLowerCase() ?? '';
      if (robots.includes('noindex')) {
        return [issue({
          category: 'SEO', severity: 'High',
          title: 'Sidan är noindex',
          description: 'meta robots innehåller "noindex" – sidan indexeras inte av Google.',
          recommendation: 'Ta bort noindex om sidan ska synas i sökresultat.',
          codeSnippet: '<meta name="robots" content="index, follow">'
        })];
      }
      return [];
    }
  },
  {
    name: 'Favicon Check',
    category: 'SEO',
    run: async (html) => {
      const $ = loadHtml(html);
      const hasFavicon = $('link[rel="icon"], link[rel="shortcut icon"]').length > 0;
      if (!hasFavicon) {
        return [issue({
          category: 'SEO', severity: 'Low',
          title: 'Saknad favicon',
          description: 'Ingen favicon hittades – sidan ser oprofessionell ut i flikar och bokmärken.',
          recommendation: 'Lägg till en favicon (32×32 eller SVG).',
          codeSnippet: '<link rel="icon" href="/favicon.ico" sizes="32x32">'
        })];
      }
      return [];
    }
  },
  {
    name: 'External Links Security',
    category: 'SEO',
    run: async (html) => {
      const $ = loadHtml(html);
      let unsafe = 0;
      let firstUnsafe: string | undefined;
      $('a[target="_blank"]').each((_, el) => {
        const rel = ($(el).attr('rel') ?? '').toLowerCase();
        if (!rel.includes('noopener') && !rel.includes('noreferrer')) {
          unsafe++;
          if (!firstUnsafe) firstUnsafe = $.html(el);
        }
      });
      if (unsafe > 0) {
        return [issue({
          category: 'SEO', severity: 'Low',
          title: 'Osäkra externa länkar',
          description: `${unsafe} länkar med target="_blank" saknar rel="noopener".`,
          recommendation: 'Lägg till rel="noopener noreferrer" på alla externa länkar.',
          codeSnippet: firstUnsafe?.replace('target="_blank"', 'target="_blank" rel="noopener noreferrer"')
        })];
      }
      return [];
    }
  },
  {
    name: 'Sitemap Check',
    category: 'SEO',
    run: async (_, context) => {
      if (context.sitemapFound === false) {
        return [issue({
          category: 'SEO', severity: 'Low',
          title: 'Ingen sitemap hittades',
          description: 'Varken /sitemap.xml eller robots.txt-referens till sitemap hittades.',
          recommendation: 'Skapa en sitemap.xml och referera till den i robots.txt.',
          codeSnippet: 'Sitemap: https://example.com/sitemap.xml'
        })];
      }
      return [];
    }
  }
];

export const EXTENDED_PERFORMANCE_RULES: ScannerRule[] = [
  {
    name: 'TTFB Check',
    category: 'Performance',
    run: async (_, context) => {
      const issues: ScannerIssue[] = [];
      if (context.ttfb > 800) {
        issues.push(issue({
          category: 'Performance', severity: 'High',
          title: 'Långsam TTFB (Time to First Byte)',
          description: `Servern svarade på ${context.ttfb}ms innan innehåll började levereras.`,
          recommendation: 'Optimera server, databas och caching. Mål: under 800ms TTFB.'
        }));
      } else if (context.ttfb > 400) {
        issues.push(issue({
          category: 'Performance', severity: 'Medium',
          title: 'Förbättringsbar TTFB',
          description: `TTFB är ${context.ttfb}ms. Google rekommenderar under 800ms.`,
          recommendation: 'Aktivera serverside-caching och CDN för statiska resurser.'
        }));
      }
      return issues;
    }
  },
  {
    name: 'HTML Size Check',
    category: 'Performance',
    run: async (_, context) => {
      const kb = Math.round(context.contentLength / 1024);
      if (kb > 500) {
        return [issue({
          category: 'Performance', severity: 'Medium',
          title: 'Stor HTML-sida',
          description: `HTML-dokumentet är ~${kb} KB. Stora sidor ökar laddtid och parsningstid.`,
          recommendation: 'Minska onödig markup, dela upp innehåll och lazy-loada sektioner.'
        })];
      }
      return [];
    }
  },
  {
    name: 'DOM Size Check',
    category: 'Performance',
    run: async (html) => {
      const nodes = countDomNodes(html);
      if (nodes > 1500) {
        return [issue({
          category: 'Performance', severity: 'Medium',
          title: 'För många DOM-element',
          description: `Sidan har ${nodes} DOM-noder. Rekommenderat: under 1500 noder.`,
          recommendation: 'Förenkla markup, undvik onödiga wrapper-divs och virtualisera långa listor.'
        })];
      }
      return [];
    }
  },
  {
    name: 'Script Count Check',
    category: 'Performance',
    run: async (html) => {
      const $ = loadHtml(html);
      const scripts = $('script[src]').length;
      const external = getExternalScripts($);
      if (scripts > 15) {
        return [issue({
          category: 'Performance', severity: 'Medium',
          title: 'Många JavaScript-filer',
          description: `${scripts} externa script-taggar (${external} tredjepart). Varje fil blockerar eller fördröjer rendering.`,
          recommendation: 'Bundla script, ta bort oanvända bibliotek och ladda tredjepart asynkront.',
          codeSnippet: '<script src="app.js" defer></script>'
        })];
      }
      return [];
    }
  },
  {
    name: 'Image Lazy Loading',
    category: 'Performance',
    run: async (html) => {
      const $ = loadHtml(html);
      let withoutLazy = 0;
      let first: string | undefined;
      $('img[src]').each((_, img) => {
        const loading = $(img).attr('loading');
        if (!loading || loading !== 'lazy') {
          withoutLazy++;
          if (!first) first = $.html(img);
        }
      });
      if (withoutLazy > 3) {
        return [issue({
          category: 'Performance', severity: 'Low',
          title: 'Bilder utan lazy loading',
          description: `${withoutLazy} bilder saknar loading="lazy" – alla laddas direkt.`,
          recommendation: 'Lägg till loading="lazy" på bilder under fold.',
          codeSnippet: first?.replace('<img', '<img loading="lazy"')
        })];
      }
      return [];
    }
  },
  {
    name: 'Image Dimensions CLS',
    category: 'Performance',
    run: async (html) => {
      const $ = loadHtml(html);
      let missing = 0;
      let first: string | undefined;
      $('img[src]').each((_, img) => {
        if (!$(img).attr('width') && !$(img).attr('height')) {
          missing++;
          if (!first) first = $.html(img);
        }
      });
      if (missing > 0) {
        return [issue({
          category: 'Performance', severity: 'Medium',
          title: 'Bilder utan dimensioner (CLS-risk)',
          description: `${missing} bilder saknar width/height – orsakar layoutskift (CLS).`,
          recommendation: 'Ange width och height på alla img-taggar eller använd aspect-ratio i CSS.',
          codeSnippet: first?.replace('<img', '<img width="800" height="600"')
        })];
      }
      return [];
    }
  },
  {
    name: 'Render Blocking CSS',
    category: 'Performance',
    run: async (html) => {
      const $ = loadHtml(html);
      const blocking = $('link[rel="stylesheet"]:not([media="print"])').length;
      if (blocking > 5) {
        return [issue({
          category: 'Performance', severity: 'Medium',
          title: 'Många render-blockerande CSS-filer',
          description: `${blocking} stylesheet-länkar i <head> blockerar första rendering.`,
          recommendation: 'Kombinera CSS-filer, inline kritisk CSS och ladda resten asynkront.',
          codeSnippet: '<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">'
        })];
      }
      return [];
    }
  },
  {
    name: 'Font Preconnect',
    category: 'Performance',
    run: async (html) => {
      const $ = loadHtml(html);
      const usesGoogleFonts = $('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]').length > 0;
      const hasPreconnect = $('link[rel="preconnect"]').length > 0;
      if (usesGoogleFonts && !hasPreconnect) {
        return [issue({
          category: 'Performance', severity: 'Low',
          title: 'Saknad preconnect för webfonts',
          description: 'Google Fonts används utan preconnect – extra DNS/TLS-fördröjning.',
          recommendation: 'Lägg till preconnect till fonts.googleapis.com och fonts.gstatic.com.',
          codeSnippet: '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
        })];
      }
      return [];
    }
  },
  {
    name: 'Compression Header',
    category: 'Performance',
    run: async (_, context) => {
      const encoding = context.headers.get('content-encoding') ?? '';
      if (!encoding.includes('gzip') && !encoding.includes('br') && context.contentLength > 1024) {
        return [issue({
          category: 'Performance', severity: 'Medium',
          title: 'Ingen textkomprimering',
          description: 'Svaret saknar gzip/brotli-komprimering – HTML levereras okomprimerat.',
          recommendation: 'Aktivera gzip eller Brotli på webbservern för HTML, CSS och JS.'
        })];
      }
      return [];
    }
  }
];

export const EXTENDED_SECURITY_RULES: ScannerRule[] = [
  {
    name: 'XContentTypeOptions',
    category: 'Security',
    run: async (_, context) => {
      if (!context.headers.get('x-content-type-options')) {
        return [issue({
          category: 'Security', severity: 'Medium',
          title: 'Saknad X-Content-Type-Options',
          description: 'Headern X-Content-Type-Options saknas – ökar risk för MIME-sniffing.',
          recommendation: 'Lägg till X-Content-Type-Options: nosniff på alla svar.',
          codeSnippet: 'X-Content-Type-Options: nosniff'
        })];
      }
      return [];
    }
  },
  {
    name: 'Referrer Policy',
    category: 'Security',
    run: async (_, context) => {
      if (!context.headers.get('referrer-policy')) {
        return [issue({
          category: 'Security', severity: 'Low',
          title: 'Saknad Referrer-Policy',
          description: 'Ingen Referrer-Policy – URL:er kan läcka till tredjepart.',
          recommendation: 'Sätt Referrer-Policy: strict-origin-when-cross-origin.',
          codeSnippet: 'Referrer-Policy: strict-origin-when-cross-origin'
        })];
      }
      return [];
    }
  },
  {
    name: 'Content Security Policy',
    category: 'Security',
    run: async (_, context) => {
      if (!context.headers.get('content-security-policy')) {
        return [issue({
          category: 'Security', severity: 'Medium',
          title: 'Ingen Content-Security-Policy',
          description: 'CSP saknas – sidan har svagare skydd mot XSS-attacker.',
          recommendation: 'Implementera en CSP-header som begränsar script- och style-källor.',
          codeSnippet: "Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
        })];
      }
      return [];
    }
  },
  {
    name: 'Permissions Policy',
    category: 'Security',
    run: async (_, context) => {
      const hasPerms = context.headers.get('permissions-policy') || context.headers.get('feature-policy');
      if (!hasPerms) {
        return [issue({
          category: 'Security', severity: 'Low',
          title: 'Saknad Permissions-Policy',
          description: 'Ingen Permissions-Policy – webbläsarfunktioner (kamera, mikrofon) är odefinierade.',
          recommendation: 'Begränsa onödiga API:er med Permissions-Policy.',
          codeSnippet: 'Permissions-Policy: camera=(), microphone=(), geolocation=()'
        })];
      }
      return [];
    }
  },
  {
    name: 'Mixed Content',
    category: 'Security',
    run: async (html, context) => {
      const mixed = hasMixedContent(html, context.isHttps);
      if (mixed.length > 0) {
        return [issue({
          category: 'Security', severity: 'High',
          title: 'Mixed content (HTTP på HTTPS-sida)',
          description: `${mixed.length}+ resurser laddas via osäker HTTP på en HTTPS-sida.`,
          recommendation: 'Byt alla http://-URL:er till https:// eller använd protokoll-relativa länkar.',
          codeSnippet: mixed[0]
        })];
      }
      return [];
    }
  },
  {
    name: 'Server Header Exposure',
    category: 'Security',
    run: async (_, context) => {
      const server = context.headers.get('server') ?? '';
      const powered = context.headers.get('x-powered-by') ?? '';
      if (server || powered) {
        return [issue({
          category: 'Security', severity: 'Low',
          title: 'Serverinformation exponeras',
          description: `Headers avslöjar teknikstack: ${[server, powered].filter(Boolean).join(', ')}.`,
          recommendation: 'Ta bort eller maskera Server- och X-Powered-By-headers.',
        })];
      }
      return [];
    }
  }
];

export const EXTENDED_ACCESSIBILITY_RULES: ScannerRule[] = [
  {
    name: 'Form Labels',
    category: 'Accessibility',
    run: async (html) => {
      const $ = loadHtml(html);
      let unlabeled = 0;
      let first: string | undefined;
      $('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea').each((_, el) => {
        const id = $(el).attr('id');
        const hasLabel = id ? $(`label[for="${id}"]`).length > 0 : false;
        const hasAria = !!$(el).attr('aria-label') || !!$(el).attr('aria-labelledby');
        if (!hasLabel && !hasAria) {
          unlabeled++;
          if (!first) first = $.html(el);
        }
      });
      if (unlabeled > 0) {
        return [issue({
          category: 'Accessibility', severity: 'High',
          title: 'Formulärfält utan etikett',
          description: `${unlabeled} fält saknar associerad <label> eller aria-label.`,
          recommendation: 'Koppla varje fält till en <label for="id"> eller aria-label.',
          codeSnippet: first ? `<label for="email">E-post</label>\n${first}` : undefined
        })];
      }
      return [];
    }
  },
  {
    name: 'Button Accessible Name',
    category: 'Accessibility',
    run: async (html) => {
      const $ = loadHtml(html);
      let unnamed = 0;
      $('button, [role="button"]').each((_, el) => {
        const text = $(el).text().trim();
        const aria = $(el).attr('aria-label');
        const hasImgAlt = $(el).find('img[alt]').length > 0;
        if (!text && !aria && !hasImgAlt) unnamed++;
      });
      if (unnamed > 0) {
        return [issue({
          category: 'Accessibility', severity: 'Medium',
          title: 'Knappar utan tillgängligt namn',
          description: `${unnamed} knappar saknar synlig text eller aria-label.`,
          recommendation: 'Lägg till beskrivande text eller aria-label på alla knappar.',
          codeSnippet: '<button aria-label="Stäng meny">×</button>'
        })];
      }
      return [];
    }
  },
  {
    name: 'Skip Link',
    category: 'Accessibility',
    run: async (html) => {
      const $ = loadHtml(html);
      const hasSkip = $('a[href^="#"]').filter((_, el) => {
        const text = $(el).text().toLowerCase();
        return text.includes('skip') || text.includes('hoppa') || text.includes('huvudinnehåll');
      }).length > 0;
      if (!hasSkip && $('nav, header').length > 0) {
        return [issue({
          category: 'Accessibility', severity: 'Low',
          title: 'Saknad skip-länk',
          description: 'Ingen "hoppa till innehåll"-länk för tangentbordsanvändare.',
          recommendation: 'Lägg till en dold skip-länk som första fokuserbara element.',
          codeSnippet: '<a href="#main" class="skip-link">Hoppa till huvudinnehåll</a>'
        })];
      }
      return [];
    }
  },
  {
    name: 'Empty Links',
    category: 'Accessibility',
    run: async (html) => {
      const $ = loadHtml(html);
      let empty = 0;
      $('a').each((_, el) => {
        const text = $(el).text().trim();
        const aria = $(el).attr('aria-label');
        const hasImgAlt = $(el).find('img[alt]').length > 0;
        if (!text && !aria && !hasImgAlt) empty++;
      });
      if (empty > 0) {
        return [issue({
          category: 'Accessibility', severity: 'Medium',
          title: 'Tomma länkar',
          description: `${empty} länkar saknar synlig text – skärmläsare kan inte beskriva dem.`,
          recommendation: 'Lägg till beskrivande länktext eller aria-label.',
        })];
      }
      return [];
    }
  }
];

export const EXTENDED_CODE_RULES: ScannerRule[] = [
  {
    name: 'Duplicate IDs',
    category: 'Code',
    run: async (html) => {
      const $ = loadHtml(html);
      const seen = new Map<string, number>();
      $('[id]').each((_, el) => {
        const id = $(el).attr('id')!;
        seen.set(id, (seen.get(id) ?? 0) + 1);
      });
      const duplicates = [...seen.entries()].filter(([, count]) => count > 1);
      if (duplicates.length > 0) {
        return [issue({
          category: 'Code', severity: 'High',
          title: 'Duplicerade ID-attribut',
          description: `ID:n som förekommer flera gånger: ${duplicates.map(([id]) => id).slice(0, 5).join(', ')}.`,
          recommendation: 'Varje id ska vara unikt i dokumentet.',
        })];
      }
      return [];
    }
  },
  {
    name: 'Document Write',
    category: 'Code',
    run: async (html) => {
      if (/document\.write\s*\(/.test(html)) {
        return [issue({
          category: 'Code', severity: 'Medium',
          title: 'document.write() används',
          description: 'document.write() blockerar parsing och är föråldrat.',
          recommendation: 'Ersätt med DOM-manipulation (createElement/appendChild).',
        })];
      }
      return [];
    }
  },
  {
    name: 'Doctype Check',
    category: 'Code',
    run: async (html) => {
      if (!/<!DOCTYPE\s+html/i.test(html.trimStart().slice(0, 200))) {
        return [issue({
          category: 'Code', severity: 'Medium',
          title: 'Saknad HTML5 doctype',
          description: 'Dokumentet saknar <!DOCTYPE html> – kan orsaka quirks mode.',
          recommendation: 'Lägg till <!DOCTYPE html> som första rad.',
          codeSnippet: '<!DOCTYPE html>\n<html lang="sv">'
        })];
      }
      return [];
    }
  },
  {
    name: 'Charset Meta',
    category: 'Code',
    run: async (html) => {
      const $ = loadHtml(html);
      const hasCharset = $('meta[charset]').length > 0 || $('meta[http-equiv="Content-Type"]').length > 0;
      if (!hasCharset) {
        return [issue({
          category: 'Code', severity: 'Medium',
          title: 'Saknad teckenuppsättning',
          description: 'Ingen charset-meta – specialtecken kan visas fel.',
          recommendation: 'Lägg till <meta charset="UTF-8"> tidigt i <head>.',
          codeSnippet: '<meta charset="UTF-8">'
        })];
      }
      return [];
    }
  }
];

export const EXTENDED_RULES = [
  ...EXTENDED_SEO_RULES,
  ...EXTENDED_PERFORMANCE_RULES,
  ...EXTENDED_SECURITY_RULES,
  ...EXTENDED_ACCESSIBILITY_RULES,
  ...EXTENDED_CODE_RULES
];
