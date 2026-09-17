import * as cheerio from 'cheerio';
import { ScannerRule, ScannerIssue, ScannerContext } from './types';
import { localizedIssue } from '../i18n/scanLocale';

export const SEO_RULES: ScannerRule[] = [
  {
    name: 'Title Tag Check',
    category: 'SEO',
    run: async (html, context) => {
      const $ = cheerio.load(html);
      const issues: ScannerIssue[] = [];
      if (!$('title').text()) {
        issues.push(localizedIssue(context.language, 'seo.title.missing', {
          category: 'SEO',
          severity: 'High',
          source: 'rules',
          codeSnippet: '<head>\n  <!-- Missing: <title>Your Page Title</title> -->\n</head>'
        }));
      }
      return issues;
    }
  },
  {
    name: 'Meta Description Check',
    category: 'SEO',
    run: async (html, context) => {
      const $ = cheerio.load(html);
      const issues: ScannerIssue[] = [];
      if (!$('meta[name="description"]').attr('content')) {
        issues.push(localizedIssue(context.language, 'seo.meta.missing', {
          category: 'SEO',
          severity: 'Medium',
          source: 'rules',
          codeSnippet: '<head>\n  <!-- Missing: <meta name="description" content="..."> -->\n</head>'
        }));
      }
      return issues;
    }
  },
  {
    name: 'H1 Header Check',
    category: 'SEO',
    run: async (html, context) => {
      const $ = cheerio.load(html);
      const issues: ScannerIssue[] = [];
      if ($('h1').length === 0) {
        issues.push(localizedIssue(context.language, 'seo.h1.missing', {
          category: 'SEO',
          severity: 'Medium',
          source: 'rules',
          codeSnippet: '<body>\n  <!-- Missing: <h1>Main heading</h1> -->\n</body>'
        }));
      }
      return issues;
    }
  }
];

export const PERFORMANCE_RULES: ScannerRule[] = [
  {
    name: 'Load Time Check',
    category: 'Performance',
    run: async (_, context) => {
      const issues: ScannerIssue[] = [];
      const loadTime = context.loadTime;
      if (loadTime > 2000) {
        issues.push(localizedIssue(context.language, 'perf.load.slow', {
          category: 'Performance',
          severity: 'High',
          source: 'rules',
          params: { ms: loadTime }
        }));
      } else if (loadTime > 1000) {
        issues.push(localizedIssue(context.language, 'perf.load.medium', {
          category: 'Performance',
          severity: 'Medium',
          source: 'rules',
          params: { ms: loadTime }
        }));
      }
      return issues;
    }
  }
];

export const SECURITY_RULES: ScannerRule[] = [
  {
    name: 'HTTPS Check',
    category: 'Security',
    run: async (_, context) => {
      const issues: ScannerIssue[] = [];
      if (!context.isHttps) {
        issues.push(localizedIssue(context.language, 'sec.https.missing', {
          category: 'Security',
          severity: 'High',
          source: 'rules'
        }));
      }
      return issues;
    }
  },
  {
    name: 'HSTS Check',
    category: 'Security',
    run: async (_, context) => {
      const issues: ScannerIssue[] = [];
      if (!context.headers.get('strict-transport-security')) {
        issues.push(localizedIssue(context.language, 'sec.hsts.missing', {
          category: 'Security',
          severity: 'Low',
          source: 'rules',
          codeSnippet: 'Strict-Transport-Security: max-age=31536000; includeSubDomains'
        }));
      }
      return issues;
    }
  },
  {
    name: 'Clickjacking Protection Check',
    category: 'Security',
    run: async (_, context) => {
      const issues: ScannerIssue[] = [];
      const hasXFrame = context.headers.get('x-frame-options');
      const hasCSP = context.headers.get('content-security-policy');
      if (!hasXFrame && !hasCSP) {
        issues.push(localizedIssue(context.language, 'sec.clickjacking', {
          category: 'Security',
          severity: 'Low',
          source: 'rules',
          codeSnippet: "X-Frame-Options: DENY\nContent-Security-Policy: frame-ancestors 'none';"
        }));
      }
      return issues;
    }
  }
];

export const ACCESSIBILITY_RULES: ScannerRule[] = [
  {
    name: 'Alt Text Check',
    category: 'Accessibility',
    run: async (html, context) => {
      const $ = cheerio.load(html);
      const issues: ScannerIssue[] = [];
      const images = $('img');
      let imagesWithoutAlt = 0;
      let firstImgWithoutAlt: string | null = null;

      images.each((_: number, img) => {
        if (!$(img).attr('alt')) {
          imagesWithoutAlt++;
          if (!firstImgWithoutAlt) firstImgWithoutAlt = $.html(img);
        }
      });

      if (imagesWithoutAlt > 0) {
        issues.push(localizedIssue(context.language, 'a11y.alt.missing', {
          category: 'Accessibility',
          severity: 'Medium',
          source: 'rules',
          params: { count: imagesWithoutAlt },
          codeSnippet: firstImgWithoutAlt || undefined
        }));
      }
      return issues;
    }
  },
  {
    name: 'Language Attribute Check',
    category: 'Accessibility',
    run: async (html, context) => {
      const $ = cheerio.load(html);
      const issues: ScannerIssue[] = [];
      if (!$('html').attr('lang')) {
        issues.push(localizedIssue(context.language, 'a11y.lang.missing', {
          category: 'Accessibility',
          severity: 'Low',
          source: 'rules',
          codeSnippet: '<html>\n  <!-- Should be: <html lang="en"> -->\n</html>'
        }));
      }
      return issues;
    }
  }
];

export const CODE_QUALITY_RULES: ScannerRule[] = [
  {
    name: 'Inline Style Check',
    category: 'Code',
    run: async (html, context) => {
      const $ = cheerio.load(html);
      const issues: ScannerIssue[] = [];
      const inlineStyles = $('[style]').length;
      if (inlineStyles > 0) {
        const firstInlineStyle = $.html($('[style]').first());
        issues.push(localizedIssue(context.language, 'code.inline.style', {
          category: 'Code',
          severity: 'Low',
          source: 'rules',
          params: { count: inlineStyles },
          codeSnippet: firstInlineStyle
        }));
      }
      return issues;
    }
  },
  {
    name: 'Deprecated HTML Tags Check',
    category: 'Code',
    run: async (html, context) => {
      const $ = cheerio.load(html);
      const issues: ScannerIssue[] = [];
      const deprecatedTags = $('font, center, strike, marquee').length;
      if (deprecatedTags > 0) {
        const firstDeprecated = $.html($('font, center, strike, marquee').first());
        issues.push(localizedIssue(context.language, 'code.deprecated.tags', {
          category: 'Code',
          severity: 'Medium',
          source: 'rules',
          codeSnippet: firstDeprecated
        }));
      }
      return issues;
    }
  },
  {
    name: 'Render Blocking JS Check',
    category: 'Code',
    run: async (html, context) => {
      const $ = cheerio.load(html);
      const issues: ScannerIssue[] = [];
      const scriptsWithoutDefer = $('script[src]:not([defer]):not([async])').length;
      if (scriptsWithoutDefer > 0) {
        const firstScript = $.html($('script[src]:not([defer]):not([async])').first());
        issues.push(localizedIssue(context.language, 'code.js.blocking', {
          category: 'Code',
          severity: 'Medium',
          source: 'rules',
          params: { count: scriptsWithoutDefer },
          codeSnippet: firstScript
        }));
      }
      return issues;
    }
  }
];

import { EXTENDED_RULES } from './extended.rules';
import { DEEP_ANALYSIS_RULES } from './deep.rules';

export const ALL_RULES = [
  ...SEO_RULES,
  ...PERFORMANCE_RULES,
  ...SECURITY_RULES,
  ...ACCESSIBILITY_RULES,
  ...CODE_QUALITY_RULES,
  ...EXTENDED_RULES,
  ...DEEP_ANALYSIS_RULES
];
