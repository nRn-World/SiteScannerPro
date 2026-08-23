import * as cheerio from 'cheerio';
import { ScannerRule, ScannerIssue, Severity } from './types';

export const SEO_RULES: ScannerRule[] = [
  {
    name: 'Title Tag Check',
    category: 'SEO',
    run: async (html) => {
      const $ = cheerio.load(html);
      const issues: ScannerIssue[] = [];
      if (!$('title').text()) {
        issues.push({
          category: 'SEO',
          severity: 'High',
          title: 'Saknad Title-tagg',
          description: 'Sidan saknar en <title>-tagg, vilket är kritiskt för sökmotorer.',
          recommendation: 'Lägg till en beskrivande <title> i <head>.',
          codeSnippet: '<head>\n  <!-- Saknas: <title>Din Sidtitel</title> -->\n</head>'
        });
      }
      return issues;
    }
  },
  {
    name: 'Meta Description Check',
    category: 'SEO',
    run: async (html) => {
      const $ = cheerio.load(html);
      const issues: ScannerIssue[] = [];
      if (!$('meta[name="description"]').attr('content')) {
        issues.push({
          category: 'SEO',
          severity: 'Medium',
          title: 'Saknad Meta Description',
          description: 'Sidan saknar en metabeskrivning.',
          recommendation: 'Lägg till <meta name="description" content="...">.',
          codeSnippet: '<head>\n  <!-- Saknas: <meta name="description" content="..."> -->\n</head>'
        });
      }
      return issues;
    }
  },
  {
    name: 'H1 Header Check',
    category: 'SEO',
    run: async (html) => {
      const $ = cheerio.load(html);
      const issues: ScannerIssue[] = [];
      if ($('h1').length === 0) {
        issues.push({
          category: 'SEO',
          severity: 'Medium',
          title: 'Saknad H1-rubrik',
          description: 'Sidan saknar en huvudrubrik (H1).',
          recommendation: 'Se till att varje sida har exakt en H1-rubrik.',
          codeSnippet: '<body>\n  <!-- Saknas: <h1>Huvudrubrik</h1> -->\n</body>'
        });
      }
      return issues;
    }
  }
];

export const PERFORMANCE_RULES: ScannerRule[] = [
  {
    name: 'Load Time Check',
    category: 'Prestanda',
    run: async (_, context) => {
      const issues: ScannerIssue[] = [];
      const loadTime = context.loadTime;
      if (loadTime > 2000) {
        issues.push({
          category: 'Prestanda',
          severity: 'High',
          title: 'Långsam svarstid',
          description: `Servern tog ${loadTime}ms att svara.`,
          recommendation: 'Optimera servern, använd caching eller en CDN.'
        });
      } else if (loadTime > 1000) {
        issues.push({
          category: 'Prestanda',
          severity: 'Medium',
          title: 'Något långsam svarstid',
          description: `Servern tog ${loadTime}ms att svara.`,
          recommendation: 'Optimera TTFB (Time to First Byte).'
        });
      }
      return issues;
    }
  }
];

export const SECURITY_RULES: ScannerRule[] = [
  {
    name: 'HTTPS Check',
    category: 'Säkerhet',
    run: async (_, context) => {
      const issues: ScannerIssue[] = [];
      if (!context.isHttps) {
        issues.push({
          category: 'Säkerhet',
          severity: 'High',
          title: 'Okrypterad anslutning',
          description: 'Sidan använder HTTP istället för HTTPS.',
          recommendation: 'Installera ett SSL-certifikat och tvinga HTTPS.'
        });
      }
      return issues;
    }
  },
  {
    name: 'HSTS Check',
    category: 'Säkerhet',
    run: async (_, context) => {
      const issues: ScannerIssue[] = [];
      if (!context.headers.get('strict-transport-security')) {
        issues.push({
          category: 'Säkerhet',
          severity: 'Low',
          title: 'Saknad HSTS-header',
          description: 'Sidan tvingar inte webbläsare att använda HTTPS (HSTS).',
          recommendation: 'Lägg till Strict-Transport-Security i serverns headers.',
          codeSnippet: 'Strict-Transport-Security: max-age=31536000; includeSubDomains'
        });
      }
      return issues;
    }
  },
  {
    name: 'Clickjacking Protection Check',
    category: 'Säkerhet',
    run: async (_, context) => {
      const issues: ScannerIssue[] = [];
      const hasXFrame = context.headers.get('x-frame-options');
      const hasCSP = context.headers.get('content-security-policy');
      if (!hasXFrame && !hasCSP) {
        issues.push({
          category: 'Säkerhet',
          severity: 'Low',
          title: 'Risk för Clickjacking',
          description: 'Sidan saknar skydd mot att bäddas in i iframes.',
          recommendation: 'Lägg till X-Frame-Options: DENY eller SAMEORIGIN.',
          codeSnippet: 'X-Frame-Options: DENY\nContent-Security-Policy: frame-ancestors \'none\';'
        });
      }
      return issues;
    }
  }
];

export const ACCESSIBILITY_RULES: ScannerRule[] = [
  {
    name: 'Alt Text Check',
    category: 'Tillgänglighet',
    run: async (html) => {
      const $ = cheerio.load(html);
      const issues: ScannerIssue[] = [];
      const images = $('img');
      let imagesWithoutAlt = 0;
      let firstImgWithoutAlt: string | null = null;

      images.each((_: number, img: cheerio.Element) => {
        if (!$(img).attr('alt')) {
          imagesWithoutAlt++;
          if (!firstImgWithoutAlt) firstImgWithoutAlt = $.html(img);
        }
      });

      if (imagesWithoutAlt > 0) {
        issues.push({
          category: 'Tillgänglighet',
          severity: 'Medium',
          title: 'Saknade Alt-texter',
          description: `${imagesWithoutAlt} bilder saknar alt-attribut.`,
          recommendation: 'Lägg till beskrivande alt-texter på alla bilder för skärmläsare.',
          codeSnippet: firstImgWithoutAlt || undefined
        });
      }
      return issues;
    }
  },
  {
    name: 'Language Attribute Check',
    category: 'Tillgänglighet',
    run: async (html) => {
      const $ = cheerio.load(html);
      const issues: ScannerIssue[] = [];
      if (!$('html').attr('lang')) {
        issues.push({
          category: 'Tillgänglighet',
          severity: 'Low',
          title: 'Saknat språkattribut',
          description: 'HTML-taggen saknar lang-attribut.',
          recommendation: 'Lägg till lang="sv" (eller aktuellt språk) i <html>-taggen.',
          codeSnippet: '<html>\n  <!-- Borde vara: <html lang="sv"> -->\n</html>'
        });
      }
      return issues;
    }
  }
];

export const CODE_QUALITY_RULES: ScannerRule[] = [
  {
    name: 'Inline Style Check',
    category: 'Kodfel',
    run: async (html) => {
      const $ = cheerio.load(html);
      const issues: ScannerIssue[] = [];
      const inlineStyles = $('[style]').length;
      if (inlineStyles > 0) {
        const firstInlineStyle = $.html($('[style]').first());
        issues.push({
          category: 'Kodfel',
          severity: 'Low',
          title: 'Inline CSS används',
          description: `Hittade ${inlineStyles} element med inline-styles. Detta gör koden svårare att underhålla och kan leda till sämre formaterad kod.`,
          recommendation: 'Flytta all styling till externa CSS-filer.',
          codeSnippet: firstInlineStyle
        });
      }
      return issues;
    }
  },
  {
    name: 'Deprecated HTML Tags Check',
    category: 'Kodfel',
    run: async (html) => {
      const $ = cheerio.load(html);
      const issues: ScannerIssue[] = [];
      const deprecatedTags = $('font, center, strike, marquee').length;
      if (deprecatedTags > 0) {
        const firstDeprecated = $.html($('font, center, strike, marquee').first());
        issues.push({
          category: 'Kodfel',
          severity: 'Medium',
          title: 'Föråldrade HTML-taggar',
          description: 'Sidan använder föråldrade taggar (t.ex. <font>, <center>). Detta är ett dåligt kodmönster.',
          recommendation: 'Ersätt föråldrade taggar med modern CSS.',
          codeSnippet: firstDeprecated
        });
      }
      return issues;
    }
  },
  {
    name: 'Render Blocking JS Check',
    category: 'Kodfel',
    run: async (html) => {
      const $ = cheerio.load(html);
      const issues: ScannerIssue[] = [];
      const scriptsWithoutDefer = $('script[src]:not([defer]):not([async])').length;
      if (scriptsWithoutDefer > 0) {
        const firstScript = $.html($('script[src]:not([defer]):not([async])').first());
        issues.push({
          category: 'Kodfel',
          severity: 'Medium',
          title: 'Render-blockerande JavaScript',
          description: `Hittade ${scriptsWithoutDefer} script-taggar utan 'defer' eller 'async'. Detta är ett osäkert/ineffektivt kodmönster för prestanda.`,
          recommendation: "Lägg till 'defer' eller 'async' på externa script.",
          codeSnippet: firstScript
        });
      }
      return issues;
    }
  }
];

export const ALL_RULES = [
  ...SEO_RULES,
  ...PERFORMANCE_RULES,
  ...SECURITY_RULES,
  ...ACCESSIBILITY_RULES,
  ...CODE_QUALITY_RULES
];