import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildComparison,
  comparisonOverallForDevice,
  overallFromMetrics
} from '../src/rules/comparison';
import type { ScanResult } from '../src/rules/types';

function result(overrides: Partial<ScanResult> = {}): ScanResult {
  return {
    overallScore: 80,
    summary: '',
    metrics: { seo: 80, performance: 70, security: 90, accessibility: 60, code: 100 },
    issues: [
      {
        category: 'SEO',
        severity: 'Medium',
        title: 'Missing meta description',
        description: 'No meta description.',
        device: 'both'
      },
      {
        category: 'Performance',
        severity: 'High',
        title: 'Slow response',
        description: 'Server is slow.',
        device: 'mobile'
      },
      {
        category: 'Code',
        severity: 'Low',
        title: 'Inline styles',
        description: 'Inline CSS found.',
        device: 'desktop'
      }
    ],
    ...overrides
  };
}

test('buildComparison keeps the baseline first and compares device metrics', () => {
  const comparison = buildComparison(
    [
      { url: 'https://example.org', result: result() },
      {
        url: 'https://example.com',
        result: result({
          metricsByDevice: {
            mobile: { seo: 40, performance: 50, security: 60, accessibility: 70, code: 80 },
            desktop: { seo: 90, performance: 90, security: 90, accessibility: 90, code: 90 }
          }
        })
      }
    ],
    'sv'
  );

  assert.equal(comparison.sites.length, 2);
  assert.equal(comparison.baselineUrl, 'https://example.org');
  assert.equal(comparison.language, 'sv');
  assert.equal(comparison.sites[0].host, 'example.org');
  assert.equal(comparisonOverallForDevice(comparison.sites[0], 'mobile'), 80);
  assert.equal(comparisonOverallForDevice(comparison.sites[1], 'mobile'), 60);
  assert.equal(comparisonOverallForDevice(comparison.sites[1], 'desktop'), 90);
});

test('buildComparison counts issues per device and sorts top findings by severity', () => {
  const comparison = buildComparison([{ url: 'https://example.org', result: result() }], 'en');
  const site = comparison.sites[0];

  assert.deepEqual(site.issuesByDevice.mobile, { High: 1, Medium: 1, Low: 0 });
  assert.deepEqual(site.issuesByDevice.desktop, { High: 0, Medium: 1, Low: 1 });
  assert.equal(site.topIssuesByDevice.mobile[0].title, 'Slow response');
  assert.equal(site.topIssuesByDevice.mobile[0].severity, 'High');
});

test('overallFromMetrics rounds the average of the five categories', () => {
  assert.equal(
    overallFromMetrics({ seo: 100, performance: 90, security: 80, accessibility: 70, code: 60 }),
    80
  );
  assert.equal(
    overallFromMetrics({ seo: 1, performance: 2, security: 3, accessibility: 4, code: 5 }),
    3
  );
});
