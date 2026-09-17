import type { ScannerIssue, Severity, AgentFix } from '../rules/types';

export type { AgentFix };

function priorityFromSeverity(severity: Severity): AgentFix['priority'] {
  switch (severity) {
    case 'High': return 'critical';
    case 'Medium': return 'high';
    default: return 'medium';
  }
}

function extractMs(text: string): number | null {
  const m = text.match(/(\d+)\s*ms/i);
  return m ? Number(m[1]) : null;
}

function extractCount(text: string): number | null {
  const m = text.match(/(\d+)\s+(?:DOM|bilder|images|fält|fields|länkar|links|förekomst|noder|nodes|script|element)/i)
    ?? text.match(/^(\d+)\s/);
  return m ? Number(m[1]) : null;
}

type FixBuilder = (issue: ScannerIssue) => Partial<Pick<AgentFix, 'goal' | 'steps' | 'code_changes' | 'acceptance_criteria' | 'do_not'>>;

/** All agent-fix copy is English so coding agents get a stable language. */
const BUILDERS: Array<{ match: RegExp; build: FixBuilder }> = [
  {
    match: /långsam svarstid|slow response time|långsam ttfb|slow ttfb|ttfb can be improved|förbättringsbar ttfb/i,
    build: (issue) => {
      const ms = extractMs(issue.description) ?? 0;
      return {
        goal: `Reduce server response time (TTFB/load) to under 800 ms (currently ~${ms || '?'} ms).`,
        steps: [
          {
            order: 1,
            action: 'investigate',
            target: 'server/network',
            instruction: 'Measure TTFB with curl: curl -o /dev/null -s -w "ttfb:%{time_starttransfer}\\n" URL',
            verify: 'Confirm current TTFB in ms'
          },
          {
            order: 2,
            action: 'configure',
            target: 'cache/CDN',
            instruction: 'Enable HTTP cache (Cache-Control) for static assets and HTML where safe. Put a CDN (Cloudflare/Fastly/Vercel Edge) in front of origin.',
            verify: 'Cache-Control appears in response headers for static files'
          },
          {
            order: 3,
            action: 'optimize',
            target: 'backend',
            instruction: 'Optimize slow DB queries, avoid N+1, add server-side caching (Redis/in-memory) for heavy endpoints, and ensure SSR/SSG is not blocking unnecessarily.',
            verify: 'TTFB < 800 ms on repeated requests'
          },
          {
            order: 4,
            action: 'verify',
            target: 'site',
            instruction: 'Re-run SiteScanner / PageSpeed and compare TTFB before/after.',
            verify: 'TTFB under 800 ms and Slow response / Slow TTFB issues are gone'
          }
        ],
        code_changes: [
          {
            type: 'config',
            language: 'nginx',
            file_hint: 'nginx.conf or host platform cache settings',
            after: 'location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {\n  expires 30d;\n  add_header Cache-Control "public, max-age=2592000, immutable";\n}',
            notes: 'Adapt to your web server (Nginx, Apache, Vercel headers, Cloudflare Cache Rules).'
          },
          {
            type: 'config',
            language: 'http',
            file_hint: 'response headers for HTML if caching is OK',
            after: 'Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=86400'
          }
        ],
        acceptance_criteria: [
          `TTFB under 800 ms (was ~${ms || 'high'} ms)`,
          'No High-severity "Slow response time" / "Slow TTFB" left in a new scan'
        ],
        do_not: [
          'Cache personalized/auth pages publicly',
          'Hide the problem by only raising timeouts'
        ]
      };
    }
  },
  {
    match: /för många dom-element|too many dom elements/i,
    build: (issue) => {
      const nodes = extractCount(issue.description) ?? 0;
      return {
        goal: `Reduce DOM size to under 1500 nodes (currently ${nodes || '?'}).`,
        steps: [
          {
            order: 1,
            action: 'investigate',
            target: 'DOM',
            instruction: 'Open DevTools → Elements and identify deep wrapper divs, repeated lists, and hidden sections that still render.',
            verify: `document.querySelectorAll('*').length should drop from ${nodes || 'current'} toward < 1500`
          },
          {
            order: 2,
            action: 'replace',
            target: 'lists/grids',
            instruction: 'Virtualize long lists (e.g. react-window / tanstack-virtual) so only visible rows exist in the DOM.',
            verify: 'Long lists render only visible items'
          },
          {
            order: 3,
            action: 'remove',
            target: 'markup',
            instruction: 'Remove unnecessary wrapper elements (<div> in <div> in <div>) and avoid mounting hidden tabs/modals until opened.',
            verify: 'DOM node count < 1500 on the home page'
          }
        ],
        code_changes: [
          {
            type: 'replace',
            language: 'tsx',
            file_hint: 'Components that render long lists',
            before: '{items.map(item => <Row key={item.id} ... />)}',
            after: '<VirtualList items={items} rowHeight={48} renderRow={(item) => <Row ... />} />',
            notes: 'Use the project’s existing virtualization library if one exists.'
          }
        ],
        acceptance_criteria: [
          'DOM nodes < 1500 on the scanned page',
          'No visual regressions in lists/navigation'
        ],
        do_not: ['Hide content with display:none without removing it from the DOM if the goal is node reduction']
      };
    }
  },
  {
    match: /bilder utan dimensioner|images without dimensions|cls-risk|cls risk/i,
    build: (issue) => ({
      goal: 'Give all <img> explicit width/height (or CSS aspect-ratio) to avoid CLS.',
      steps: [
        {
          order: 1,
          action: 'investigate',
          target: 'img',
          instruction: 'Find all img without width/height: document.querySelectorAll("img:not([width]), img:not([height]").',
          verify: 'List affected images'
        },
        {
          order: 2,
          action: 'add',
          target: 'img attributes',
          instruction: 'Set width and height to the image’s intrinsic pixel size, or aspect-ratio in CSS.',
          verify: 'No img missing dimensions; CLS improves'
        }
      ],
      code_changes: [
        {
          type: 'replace',
          language: 'html',
          file_hint: 'Templates/components with <img>',
          selector: issue.selector,
          before: issue.codeSnippet ?? '<img src="hero.jpg" alt="...">',
          after: '<img src="hero.jpg" alt="..." width="1200" height="630" loading="lazy">'
        }
      ],
      acceptance_criteria: [
        'All content images have width+height or aspect-ratio',
        'CLS warning is gone or clearly improved'
      ],
      do_not: ['Set incorrect proportions that stretch the image']
    })
  },
  {
    match: /äldre bildformat|legacy image formats/i,
    build: () => ({
      goal: 'Convert JPEG/PNG to WebP/AVIF with fallback via <picture>.',
      steps: [
        {
          order: 1,
          action: 'optimize',
          target: 'image assets',
          instruction: 'Convert large JPEG/PNG to AVIF + WebP (e.g. sharp, squoosh, CDN image transform).',
          verify: 'New .webp/.avif files exist and are smaller'
        },
        {
          order: 2,
          action: 'replace',
          target: 'img markup',
          instruction: 'Switch to <picture> with AVIF/WebP source and JPEG/PNG fallback.',
          verify: 'Network panel shows modern format where the browser supports it'
        }
      ],
      code_changes: [
        {
          type: 'replace',
          language: 'html',
          file_hint: 'Image components / HTML',
          before: '<img src="/images/hero.jpg" alt="Hero">',
          after: '<picture>\n  <source srcset="/images/hero.avif" type="image/avif">\n  <source srcset="/images/hero.webp" type="image/webp">\n  <img src="/images/hero.jpg" alt="Hero" width="1200" height="630" loading="lazy">\n</picture>'
        }
      ],
      acceptance_criteria: [
        'Most content images are served as WebP/AVIF',
        'Fallback works in older browsers'
      ],
      do_not: ['Remove fallback entirely if you still support older browsers']
    })
  },
  {
    match: /trasiga css\/js|broken css\/js|trasiga länkar|broken links|trasiga bilder|broken images|misslyckade nätverks|failed network|aldrig slutfördes|never completed/i,
    build: (issue) => ({
      goal: 'Fix or remove broken resource URLs so all critical requests return 2xx.',
      steps: [
        {
          order: 1,
          action: 'investigate',
          target: issue.codeSnippet ?? 'broken URL',
          instruction: `Open/verify the broken URL: ${issue.codeSnippet ?? '(see description)'}. Check status code, CORS, and whether the file moved.`,
          verify: 'Status code and root cause known'
        },
        {
          order: 2,
          action: 'replace',
          target: 'href/src',
          instruction: 'Update src/href to the correct path, or remove the reference if the resource is unused.',
          verify: 'Request returns 200/304 in the Network tab'
        },
        {
          order: 3,
          action: 'verify',
          target: 'site',
          instruction: 'Reload the page in mobile and desktop view and confirm no failed requests remain for critical assets.',
          verify: 'No red failed requests for CSS/JS/images in Network'
        }
      ],
      code_changes: [
        {
          type: 'replace',
          language: 'html',
          file_hint: 'Template/component that references the resource',
          before: issue.codeSnippet ?? null,
          after: null,
          notes: 'Replace with the correct absolute or relative URL, or remove the tag.'
        }
      ],
      acceptance_criteria: [
        'No 4xx/5xx for CSS/JS/critical images',
        'Layout and functionality intact after the fix'
      ],
      do_not: ['Ignore 404 by catching errors in JS without fixing the URL']
    })
  },
  {
    match: /saknad title|missing title|för kort sidtitel|title too short|för lång sidtitel|title too long/i,
    build: (issue) => ({
      goal: 'Set a unique, descriptive <title> of 50–60 characters.',
      steps: [
        {
          order: 1,
          action: 'replace',
          target: 'head > title',
          instruction: 'Update <title> with primary keyword + brand, 50–60 characters.',
          verify: 'document.title length 50–60'
        }
      ],
      code_changes: [
        {
          type: 'replace',
          language: 'html',
          file_hint: '<head> in layout/template',
          before: null,
          after: issue.codeSnippet ?? '<title>Primary keyword – Brand</title>'
        }
      ],
      acceptance_criteria: ['Title exists and is 50–60 characters'],
      do_not: ['Duplicate the same title on every page']
    })
  },
  {
    match: /meta description|metabeskrivning/i,
    build: (issue) => ({
      goal: 'Set a unique meta description of 120–160 characters.',
      steps: [
        {
          order: 1,
          action: 'add',
          target: 'head meta[name=description]',
          instruction: 'Add or update meta description with compelling copy and keywords.',
          verify: 'Meta description length 120–160'
        }
      ],
      code_changes: [
        {
          type: /saknad|missing/i.test(issue.title) ? 'add' : 'replace',
          language: 'html',
          file_hint: '<head>',
          after: issue.codeSnippet ?? '<meta name="description" content="Description of 120–160 characters.">'
        }
      ],
      acceptance_criteria: ['Meta description exists and is 120–160 characters'],
      do_not: ['Keyword-stuff the description']
    })
  },
  {
    match: /viewport/i,
    build: (issue) => ({
      goal: 'Add viewport meta for responsive mobile layout.',
      steps: [
        {
          order: 1,
          action: 'add',
          target: 'head',
          instruction: 'Insert viewport meta early in <head>.',
          verify: 'meta[name=viewport] exists'
        }
      ],
      code_changes: [
        {
          type: 'add',
          language: 'html',
          file_hint: '<head>',
          after: issue.codeSnippet ?? '<meta name="viewport" content="width=device-width, initial-scale=1">'
        }
      ],
      acceptance_criteria: ['Viewport meta exists', 'Mobile layout scales correctly'],
      do_not: ['Use user-scalable=no without a strong reason']
    })
  },
  {
    match: /alt-text|saknade alt|missing alt/i,
    build: (issue) => ({
      goal: 'Add descriptive alt on all meaningful images (empty alt="" only for decorative).',
      steps: [
        {
          order: 1,
          action: 'add',
          target: 'img[alt]',
          instruction: 'Go through img without alt and set descriptive text, or alt="" for purely decorative images.',
          verify: 'No img missing an alt attribute'
        }
      ],
      code_changes: [
        {
          type: 'replace',
          language: 'html',
          file_hint: 'Image components',
          selector: issue.selector,
          before: issue.codeSnippet ?? '<img src="...">',
          after: '<img src="..." alt="Short description of the image">'
        }
      ],
      acceptance_criteria: ['All img have an alt attribute'],
      do_not: ['Set meaningless alt like "image" or the filename']
    })
  },
  {
    match: /content-security-policy|csp/i,
    build: (issue) => ({
      goal: 'Introduce a Content-Security-Policy that restricts script/style sources.',
      steps: [
        {
          order: 1,
          action: 'configure',
          target: 'HTTP headers',
          instruction: 'Add a CSP header on the server/CDN. Start in Report-Only if you want to test.',
          verify: 'content-security-policy appears in response headers'
        }
      ],
      code_changes: [
        {
          type: 'config',
          language: 'http',
          file_hint: 'Server/CDN response headers',
          after: issue.codeSnippet ?? "Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
        }
      ],
      acceptance_criteria: ['CSP header exists', 'Page works without console blocks (or only expected reports)'],
      do_not: ["Leave script-src 'unsafe-inline' 'unsafe-eval' permanently without a plan"]
    })
  },
  {
    match: /x-content-type-options|content-type-options|nosniff/i,
    build: (issue) => ({
      goal: 'Add X-Content-Type-Options: nosniff on all responses.',
      steps: [
        {
          order: 1,
          action: 'investigate',
          target: 'HTTP headers',
          instruction: `Read the issue: "${issue.description}". Find where response headers are set (server, CDN, middleware, framework).`,
          verify: 'Root cause identified'
        },
        {
          order: 2,
          action: 'configure',
          target: 'response headers',
          instruction: 'Add X-Content-Type-Options: nosniff on all responses.',
          verify: 'Header present on HTML and static asset responses'
        },
        {
          order: 3,
          action: 'verify',
          target: 'site',
          instruction: 'Verify in the browser and re-run SiteScanner so the same issue does not remain.',
          verify: `Issue "${issue.title}" gone or clearly improved`
        }
      ],
      code_changes: [
        {
          type: 'config',
          language: 'http',
          file_hint: 'Server/CDN/middleware response headers',
          after: issue.codeSnippet ?? 'X-Content-Type-Options: nosniff',
          notes: 'Use the snippet as the concrete target / reference.'
        }
      ],
      acceptance_criteria: [
        `Issue "${issue.title}" is fixed`,
        'No new regression in the same category'
      ],
      do_not: [
        'Ignore acceptance_criteria',
        'Do broad refactors outside this issue scope'
      ]
    })
  },
  {
    match: /render-blockerande javascript|render-blocking javascript|defer|async/i,
    build: (issue) => ({
      goal: 'Make external scripts non-blocking with defer or async.',
      steps: [
        {
          order: 1,
          action: 'replace',
          target: 'script[src]',
          instruction: 'Add defer on app scripts (preserve order) or async on independent third-party scripts.',
          verify: 'No script[src] in <head> without defer/async (except critical exceptions)'
        }
      ],
      code_changes: [
        {
          type: 'replace',
          language: 'html',
          file_hint: 'Layout / index.html',
          before: issue.codeSnippet ?? '<script src="app.js"></script>',
          after: '<script src="app.js" defer></script>'
        }
      ],
      acceptance_criteria: ['Critical scripts use defer/async', 'No regression in app init'],
      do_not: ['Set async on scripts that must run in order']
    })
  }
];

function defaultBuilder(issue: ScannerIssue): ReturnType<FixBuilder> {
  const hasSnippet = !!issue.codeSnippet;
  return {
    goal: issue.recommendation ?? `Fix the issue: ${issue.title}`,
    steps: [
      {
        order: 1,
        action: 'investigate',
        target: issue.selector ?? issue.category,
        instruction: `Read the issue: "${issue.description}". Locate the root cause in the codebase${issue.selector ? ` via selector ${issue.selector}` : ''}.`,
        verify: 'Root cause identified'
      },
      {
        order: 2,
        action: hasSnippet ? 'replace' : 'optimize',
        target: issue.selector ?? 'relevant file',
        instruction: issue.recommendation ?? 'Apply the recommended fix in the code.',
        verify: 'Change is implemented'
      },
      {
        order: 3,
        action: 'verify',
        target: 'site',
        instruction: 'Verify in the browser and re-run SiteScanner so the same issue does not remain.',
        verify: `Issue "${issue.title}" gone or clearly improved`
      }
    ],
    code_changes: hasSnippet
      ? [
          {
            type: 'replace',
            language: guessLanguage(issue.codeSnippet!),
            file_hint: issue.selector ? `Element: ${issue.selector}` : 'Relevant template/component',
            selector: issue.selector,
            before: null,
            after: issue.codeSnippet!,
            notes: 'Use the snippet as the concrete target code / reference.'
          }
        ]
      : [],
    acceptance_criteria: [
      `Issue "${issue.title}" is fixed`,
      'No new regression in the same category'
    ],
    do_not: [
      'Ignore acceptance_criteria',
      'Do broad refactors outside this issue scope'
    ]
  };
}

function guessLanguage(snippet: string): string {
  if (/^\s*</.test(snippet)) return 'html';
  if (/Cache-Control|Content-Security|Strict-Transport|X-Frame|X-Content-Type/i.test(snippet)) return 'http';
  if (/^\s*{/.test(snippet) || /"@context"/.test(snippet)) return 'json';
  if (/function|const |let |=>/.test(snippet)) return 'javascript';
  return 'text';
}

/**
 * Agent-fix JSON is always English (for coding agents),
 * regardless of the UI scan language.
 */
export function buildAgentFix(issue: ScannerIssue): AgentFix {
  const builder = BUILDERS.find((b) => b.match.test(issue.title))?.build ?? defaultBuilder;
  const partial = builder(issue);

  return {
    schema_version: '1.0',
    role: 'coding_agent',
    language: 'en',
    issue: {
      title: issue.title,
      category: issue.category,
      severity: issue.severity,
      device: issue.device ?? 'both',
      summary: issue.description,
      source: issue.source
    },
    goal: partial.goal ?? issue.recommendation ?? issue.title,
    priority: priorityFromSeverity(issue.severity),
    constraints: [
      'Make the smallest change that fixes this exact issue',
      'Keep existing design/UX unless the issue requires otherwise',
      'Follow steps in order and stop when acceptance_criteria are met',
      'If code_changes.after exists: treat it as the concrete target code'
    ],
    steps: partial.steps ?? [],
    code_changes: partial.code_changes ?? [],
    acceptance_criteria: partial.acceptance_criteria ?? [],
    do_not: partial.do_not ?? []
  };
}

export function attachAgentFixes(issues: ScannerIssue[]): ScannerIssue[] {
  return issues.map((issue) => ({
    ...issue,
    agentFix: buildAgentFix(issue)
  }));
}

export function agentFixToJson(fix: AgentFix): string {
  return JSON.stringify(fix, null, 2);
}
