import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { ScanResult } from '../src/rules/types';

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitescanner-monitor-'));
process.env.DATA_DIR = tempDir;

const {
  createMonitor,
  deleteMonitor,
  listDueMonitors,
  listMonitors,
  normalizeMonitorUrl,
  recordMonitorCheck,
  updateMonitor
} = await import('../src/services/monitorStore.service');

function scanResult(score: number, high = 0, medium = 1, low = 0): ScanResult {
  return {
    overallScore: score,
    summary: '',
    metrics: { seo: 80, performance: 80, security: 80, accessibility: 80, code: 80 },
    issues: [
      ...Array.from({ length: high }, (_, index) => ({
        category: 'Security',
        severity: 'High' as const,
        title: `Critical ${index}`,
        description: '',
        device: 'both' as const
      })),
      ...Array.from({ length: medium }, (_, index) => ({
        category: 'SEO',
        severity: 'Medium' as const,
        title: `Warning ${index}`,
        description: '',
        device: 'both' as const
      })),
      ...Array.from({ length: low }, (_, index) => ({
        category: 'Code',
        severity: 'Low' as const,
        title: `Improvement ${index}`,
        description: '',
        device: 'both' as const
      }))
    ]
  };
}

test('normalizeMonitorUrl normalizes hosts and rejects credentials', () => {
  assert.equal(normalizeMonitorUrl('example.com'), 'https://example.com/');
  assert.equal(normalizeMonitorUrl('http://Example.com/path'), 'http://example.com/path');
  assert.equal(normalizeMonitorUrl('https://user:pass@example.com'), null);
  assert.equal(normalizeMonitorUrl('not a url'), null);
});

test('monitors are owner-scoped, deduplicated and limited', () => {
  const first = createMonitor('user-a', { url: 'https://example.org', language: 'sv' });
  assert.equal(first.ok, true);

  const duplicate = createMonitor('user-a', { url: 'https://example.org/', language: 'sv' });
  assert.equal(duplicate.ok, false);
  if (!duplicate.ok) assert.equal(duplicate.error, 'duplicate');

  assert.equal(createMonitor('user-a', { url: 'https://example.net', language: 'sv' }).ok, true);
  assert.equal(createMonitor('user-a', { url: 'https://example.com', language: 'sv' }).ok, true);

  const limit = createMonitor('user-a', { url: 'https://iana.org', language: 'sv' });
  assert.equal(limit.ok, false);
  if (!limit.ok) assert.equal(limit.error, 'limit');

  assert.equal(listMonitors('user-b').length, 0);
  assert.equal(listMonitors('user-a').length, 3);
});

test('a check records history, severity counts and the next check', () => {
  const monitor = listMonitors('user-a')[0];
  assert.ok(monitor);

  const updated = recordMonitorCheck(monitor.id, scanResult(78, 2, 4, 3), 'report123');
  assert.ok(updated);
  assert.equal(updated.lastScore, 78);
  assert.equal(updated.lastHigh, 2);
  assert.equal(updated.lastMedium, 4);
  assert.equal(updated.lastLow, 3);
  assert.equal(updated.lastReportId, 'report123');
  assert.equal(updated.history.length, 1);
  assert.equal(updated.lastAlert, undefined);
  assert.ok(Date.parse(updated.nextCheckAt) > Date.now());

  const second = recordMonitorCheck(monitor.id, scanResult(70, 2, 4, 3));
  assert.ok(second);
  assert.equal(second.lastDelta, -8);
  assert.equal(second.lastAlert, 'score_down');
});

test('pausing and deleting a monitor works for its owner only', () => {
  const monitor = listMonitors('user-a')[0];
  assert.ok(monitor);

  const paused = updateMonitor('user-a', monitor.id, { enabled: false });
  assert.equal(paused?.enabled, false);
  assert.equal(updateMonitor('user-b', monitor.id, { enabled: true }), null);

  assert.equal(deleteMonitor('user-b', monitor.id), false);
  assert.equal(deleteMonitor('user-a', monitor.id), true);
  assert.equal(listMonitors('user-a').some((item) => item.id === monitor.id), false);
});

test('due monitors only include enabled monitors whose time has arrived', () => {
  const monitor = listMonitors('user-a')[0];
  assert.ok(monitor);

  const dueNow = listDueMonitors(Date.now() + 120_000);
  assert.ok(dueNow.some((item) => item.id === monitor.id));

  updateMonitor('user-a', monitor.id, { enabled: false });
  const dueAfterPause = listDueMonitors(Date.now() + 120_000);
  assert.equal(dueAfterPause.some((item) => item.id === monitor.id), false);
});

after(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});
