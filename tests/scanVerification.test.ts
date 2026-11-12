import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_RULES } from '../src/rules/core.rules';
import { ScannerService } from '../src/services/scanner.service';
import type { ScannerIssue } from '../src/rules/types';
import {
  DEFAULT_SCAN_OPTIONS,
  parseScanOptions,
  scanOptionsCacheKey
} from '../src/utils/scanOptions';
import { diffIssues } from '../src/utils/issueDiff';
import { failureFromResponse } from '../src/utils/scanErrors';

function issue(
  title: string,
  category = 'Accessibility',
  severity: ScannerIssue['severity'] = 'High',
  device: ScannerIssue['device'] = 'both'
): ScannerIssue {
  return {
    title,
    category,
    severity,
    description: 'Test finding',
    device
  };
}

test('scan options default to a full scan and reject unknown values', () => {
  const defaults = parseScanOptions({});
  assert.deepEqual(defaults.devices, DEFAULT_SCAN_OPTIONS.devices);
  assert.deepEqual(defaults.categories, DEFAULT_SCAN_OPTIONS.categories);
  assert.equal(defaults.thorough, true);

  const parsed = parseScanOptions({
    devices: ['mobile', 'both', 'invalid'],
    categories: ['SEO', 'Accessibility', 'Unknown', 'SEO'],
    thorough: false
  });
  assert.deepEqual(parsed.devices, ['mobile', 'desktop']);
  assert.deepEqual(parsed.categories, ['SEO', 'Accessibility']);
  assert.equal(parsed.thorough, false);

  const empty = parseScanOptions({ devices: [], categories: [], thorough: true });
  assert.deepEqual(empty.devices, DEFAULT_SCAN_OPTIONS.devices);
  assert.deepEqual(empty.categories, DEFAULT_SCAN_OPTIONS.categories);
});

test('cache signatures separate partial scans from full scans', () => {
  const full = scanOptionsCacheKey(DEFAULT_SCAN_OPTIONS);
  const fast = scanOptionsCacheKey({ ...DEFAULT_SCAN_OPTIONS, thorough: false });
  const mobile = scanOptionsCacheKey({ ...DEFAULT_SCAN_OPTIONS, devices: ['mobile'] });
  const seoOnly = scanOptionsCacheKey({ ...DEFAULT_SCAN_OPTIONS, categories: ['SEO'] });

  assert.notEqual(full, fast);
  assert.notEqual(full, mobile);
  assert.notEqual(full, seoOnly);
  assert.equal(full, scanOptionsCacheKey({ ...DEFAULT_SCAN_OPTIONS }));
});

test('diff finds resolved, remaining and new issues across device suffixes', () => {
  const previous = [
    issue('Image is missing alt text (Mobil)'),
    issue('Page is missing a meta description', 'SEO', 'Medium'),
    issue('Console error (#2)', 'Code', 'Low')
  ];
  const current = [
    issue('Image is missing alt text', 'Accessibility', 'High', 'mobile'),
    issue('Console error (#2)', 'Code', 'High'),
    issue('New heading order problem', 'Accessibility', 'Medium')
  ];

  const diff = diffIssues(previous, current);
  assert.deepEqual(diff.resolved.map((item) => item.title), [
    'Page is missing a meta description'
  ]);
  assert.deepEqual(diff.remaining.map((item) => item.title), [
    'Image is missing alt text',
    'Console error (#2)'
  ]);
  assert.deepEqual(diff.added.map((item) => item.title), [
    'New heading order problem'
  ]);
  // A severity change is still the same issue.
  assert.equal(diff.remaining[1].severity, 'High');
});

test('scan failures are classified with actionable retry behaviour', async () => {
  const timeout = await failureFromResponse(
    new Response(JSON.stringify({ error: 'timeout', code: 'timeout' }), { status: 504 }),
    'sv'
  );
  assert.equal(timeout.kind, 'timeout');
  assert.equal(timeout.autoRetry, true);

  const blocked = await failureFromResponse(
    new Response(JSON.stringify({ error: 'private', code: 'blocked' }), { status: 400 }),
    'sv'
  );
  assert.equal(blocked.kind, 'blocked');
  assert.equal(blocked.retryable, false);

  const rateLimited = await failureFromResponse(
    new Response(JSON.stringify({ error: 'rate_limit' }), { status: 429 }),
    'sv'
  );
  assert.equal(rateLimited.kind, 'rate_limit');
  assert.equal(rateLimited.retryable, true);
  assert.equal(rateLimited.autoRetry, false);

  const invalid = await failureFromResponse(
    new Response(JSON.stringify({ error: 'invalid' }), { status: 400 }),
    'sv'
  );
  assert.equal(invalid.kind, 'invalid_url');
  assert.equal(invalid.retryable, false);
});

test('category and device scope drive the checks and the overall score', async () => {
  const service = new ScannerService();
  const html = [
    '<!doctype html><html lang="en"><head>',
    '<title>Scope test</title>',
    '<meta name="description" content="A test page for scoped scanning.">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '</head><body><h1>Scope test</h1><img src="/missing.png" alt="">',
    '<a href="/about">About</a></body></html>'
  ].join('');

  const result = await service.scan(
    html,
    {
      url: 'https://example.com',
      finalUrl: 'https://example.com',
      loadTime: 120,
      ttfb: 80,
      isHttps: true,
      headers: new Headers({ 'content-type': 'text/html' }),
      contentLength: Buffer.byteLength(html),
      language: 'en'
    },
    {
      includeVitals: false,
      language: 'en',
      categories: ['SEO'],
      devices: ['desktop'],
      thorough: false
    }
  );

  assert.deepEqual(result.analysis?.categories, ['SEO']);
  assert.deepEqual(result.analysis?.devices, ['desktop']);
  assert.equal(result.analysis?.thorough, false);
  assert.equal(result.analysis?.accessibilityChecks, 0);
  assert.ok((result.analysis?.rulesChecked ?? 0) > 0);
  assert.ok((result.analysis?.rulesChecked ?? 0) < ALL_RULES.length);
  assert.ok(result.issues.every((item) => item.category === 'SEO'));
  assert.equal(result.overallScore, result.metrics.seo);
  assert.equal(result.metricsByDevice?.desktop.seo, result.overallScore);
  assert.equal(result.metrics.performance, 100);
  assert.match(result.summary, /Partial analysis/);
  assert.match(result.summary, /selected scope/);
  assert.doesNotMatch(result.summary, /80\+/);
});
