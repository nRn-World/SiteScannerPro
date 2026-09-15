import * as cheerio from 'cheerio';
import { ScannerRule, ScannerIssue } from './types';

export const SEO_RULES: ScannerRule[] = [
  {
    name: 'Title Tag Check',
    category: 'SEO',
    run: async (html) => {
      const $ = cheerio.load(html);
      const issues: ScannerIssue[] = [];
      if (!$('title').text()) {
        issues.push({
          id: 'seo.missing-title',
          category: 'SEO',
          severity: 'High',
          recommendationAvailable: true,
          codeSnippetId: 'seo.missing-title'
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
          id: 'seo.missing-meta-description',
          category: 'SEO',
          severity: 'Medium',
          recommendationAvailable: true,
          codeSnippetId: 'seo.missing-meta-description'
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
          id: 'seo.missing-h1',
          category: 'SEO',
          severity: 'Medium',
          recommendationAvailable: true,
          codeSnippetId: 'seo.missing-h1'
        });
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
        issues.push({
          id: 'performance.slow-response-high',
          category: 'Performance',
          severity: 'High',
          values: { loadTime },
          recommendationAvailable: true
        });
      } else if (loadTime > 1000) {
        issues.push({
          id: 'performance.slow-response-medium',
          category: 'Performance',
          severity: 'Medium',
          values: { loadTime },
          recommendationAvailable: true
        });
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
        issues.push({
          id: 'security.insecure-http',
          category: 'Security',
          severity: 'High',
          recommendationAvailable: true
        });
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
        issues.push({
          id: 'security.missing-hsts',
          category: 'Security',
          severity: 'Low',
          recommendationAvailable: true,
          codeSnippet: 'Strict-Transport-Security: max-age=31536000; includeSubDomains'
        });
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
        issues.push({
          id: 'security.clickjacking-risk',
          category: 'Security',
          severity: 'Low',
          recommendationAvailable: true,
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
    category: 'Accessibility',
    run: async (html) => {
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
        issues.push({
          id: 'accessibility.missing-alt-text',
          category: 'Accessibility',
          severity: 'Medium',
          values: { count: imagesWithoutAlt },
          recommendationAvailable: true,
          codeSnippet: firstImgWithoutAlt || undefined
        });
      }
      return issues;
    }
  },
  {
    name: 'Language Attribute Check',
    category: 'Accessibility',
    run: async (html) => {
      const $ = cheerio.load(html);
      const issues: ScannerIssue[] = [];
      if (!$('html').attr('lang')) {
        issues.push({
          id: 'accessibility.missing-language',
          category: 'Accessibility',
          severity: 'Low',
          recommendationAvailable: true,
          codeSnippetId: 'accessibility.missing-language'
        });
      }
      return issues;
    }
  }
];

export const CODE_QUALITY_RULES: ScannerRule[] = [
  {
    name: 'Inline Style Check',
    category: 'Code',
    run: async (html) => {
      const $ = cheerio.load(html);
      const issues: ScannerIssue[] = [];
      const inlineStyles = $('[style]').length;
      if (inlineStyles > 0) {
        const firstInlineStyle = $.html($('[style]').first());
        issues.push({
          id: 'code.inline-styles',
          category: 'Code',
          severity: 'Low',
          values: { count: inlineStyles },
          recommendationAvailable: true,
          codeSnippet: firstInlineStyle
        });
      }
      return issues;
    }
  },
  {
    name: 'Deprecated HTML Tags Check',
    category: 'Code',
    run: async (html) => {
      const $ = cheerio.load(html);
      const issues: ScannerIssue[] = [];
      const deprecatedTags = $('font, center, strike, marquee').length;
      if (deprecatedTags > 0) {
        const firstDeprecated = $.html($('font, center, strike, marquee').first());
        issues.push({
          id: 'code.deprecated-tags',
          category: 'Code',
          severity: 'Medium',
          recommendationAvailable: true,
          codeSnippet: firstDeprecated
        });
      }
      return issues;
    }
  },
  {
    name: 'Render Blocking JS Check',
    category: 'Code',
    run: async (html) => {
      const $ = cheerio.load(html);
      const issues: ScannerIssue[] = [];
      const scriptsWithoutDefer = $('script[src]:not([defer]):not([async])').length;
      if (scriptsWithoutDefer > 0) {
        const firstScript = $.html($('script[src]:not([defer]):not([async])').first());
        issues.push({
          id: 'code.render-blocking-js',
          category: 'Code',
          severity: 'Medium',
          values: { count: scriptsWithoutDefer },
          recommendationAvailable: true,
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