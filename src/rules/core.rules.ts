import * as cheerio from 'cheerio';
import { ScannerRule, ScannerIssue } from './types';

function hasMeaningfulText(value: string | undefined | null): boolean {
  return Boolean(value && value.trim().length > 0);
}

function cspBlocksFraming(csp: string | null): boolean {
  if (!csp) return false;
  const match = csp.match(/(?:^|;)\s*frame-ancestors\s+([^;]+)/i);
  if (!match) return false;
  const value = match[1].trim().toLowerCase();
  return value !== '*' && value.length > 0;
}

function isRenderBlockingScript($: cheerio.CheerioAPI, el: any): boolean {
  const node = $(el);
  const src = node.attr('src');
  if (!src) return false;

  const type = (node.attr('type') || 'text/javascript').trim().toLowerCase();
  // ES modules are deferred by default and are not classic render-blocking scripts.
  if (type === 'module' || type === 'importmap') return false;
  if (type && type !== 'text/javascript' && type !== 'application/javascript') return false;

  if (node.is('[defer], [async], [nomodule]')) return false;
  return true;
}

export const SEO_RULES: ScannerRule[] = [
  {
    name: 'Title Tag Check',
    category: 'SEO',
    run: async (html) => {
      const $ = cheerio.load(html);
      const issues: ScannerIssue[] = [];
      const titleText = $('head title').first().text();
      if (!hasMeaningfulText(titleText)) {
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
      const content = $('head meta[name="description" i]').attr('content');
      if (!hasMeaningfulText(content)) {
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
      const meaningfulH1 = $('h1')
        .toArray()
        .some((el) => hasMeaningfulText($(el).text()));
      if (!meaningfulH1) {
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
      // HSTS applies only to HTTPS responses.
      if (!context.isHttps) return issues;

      const hsts = context.headers.get('strict-transport-security');
      if (!hasMeaningfulText(hsts)) {
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
      const xFrame = context.headers.get('x-frame-options');
      const csp = context.headers.get('content-security-policy');
      const hasFrameProtection = hasMeaningfulText(xFrame) || cspBlocksFraming(csp);
      if (!hasFrameProtection) {
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
      let imagesWithoutAlt = 0;
      let firstImgWithoutAlt: string | null = null;

      $('img').each((_: number, img) => {
        const node = $(img);
        // aria-hidden images are intentionally ignored by assistive tech.
        if ((node.attr('aria-hidden') || '').toLowerCase() === 'true') return;
        // Missing alt attribute is a real WCAG failure. alt="" is valid for decorative images.
        if (node.attr('alt') === undefined) {
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
      const lang = $('html').attr('lang') || $('html').attr('xml:lang');
      if (!hasMeaningfulText(lang)) {
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
      const inlineNodes = $('[style]')
        .toArray()
        .filter((el) => hasMeaningfulText($(el).attr('style')));
      if (inlineNodes.length > 0) {
        issues.push({
          id: 'code.inline-styles',
          category: 'Code',
          severity: 'Low',
          values: { count: inlineNodes.length },
          recommendationAvailable: true,
          codeSnippet: $.html(inlineNodes[0])
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
      const deprecated = $('font, center, strike, marquee');
      if (deprecated.length > 0) {
        issues.push({
          id: 'code.deprecated-tags',
          category: 'Code',
          severity: 'Medium',
          recommendationAvailable: true,
          codeSnippet: $.html(deprecated.first())
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
      const blocking = $('script[src]')
        .toArray()
        .filter((el) => isRenderBlockingScript($, el));

      if (blocking.length > 0) {
        issues.push({
          id: 'code.render-blocking-js',
          category: 'Code',
          severity: 'Medium',
          values: { count: blocking.length },
          recommendationAvailable: true,
          codeSnippet: $.html(blocking[0])
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
