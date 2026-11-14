import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { AgentFix, ScanResult, ScannerIssue } from '../src/rules/types';

// Force production mode: full results must not depend on local development
// behaviour. DATA_DIR is set before importing the store because it reads the
// directory once at module load.
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sitescanner-full-results-'));
const previousNodeEnv = process.env.NODE_ENV;
const previousAppUrl = process.env.APP_URL;
const previousDataDir = process.env.DATA_DIR;
const previousSecret = process.env.LICENSE_SIGNING_SECRET;

process.env.NODE_ENV = 'production';
process.env.APP_URL = 'https://sitescanner.example';
process.env.DATA_DIR = dataDir;
process.env.LICENSE_SIGNING_SECRET = 'test-secret-0123456789abcdef0123456789abcdef';
process.env.SCAN_CACHE_TTL_SECONDS = '0';

const { ScanController } = await import('../src/controllers/scan.controller');
const { ReportShareController } = await import('../src/controllers/reportShare.controller');
const { saveReport } = await import('../src/services/reportStore.service');
const { localizeHardcodedIssue } = await import('../src/i18n/scanLocale');

after(() => {
  fs.rmSync(dataDir, { recursive: true, force: true });

  if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousNodeEnv;
  if (previousAppUrl === undefined) delete process.env.APP_URL;
  else process.env.APP_URL = previousAppUrl;
  if (previousDataDir === undefined) delete process.env.DATA_DIR;
  else process.env.DATA_DIR = previousDataDir;
  if (previousSecret === undefined) delete process.env.LICENSE_SIGNING_SECRET;
  else process.env.LICENSE_SIGNING_SECRET = previousSecret;
});

const metrics = {
  seo: 80,
  performance: 70,
  security: 90,
  accessibility: 75,
  code: 85
};

const agentFix: AgentFix = {
  schema_version: '1.0',
  role: 'coding_agent',
  language: 'en',
  issue: {
    title: 'Missing meta description',
    category: 'SEO',
    severity: 'Medium',
    device: 'both',
    summary: 'The page has no meta description.'
  },
  goal: 'Add a concise meta description',
  priority: 'medium',
  constraints: ['Do not change the page title'],
  steps: [],
  code_changes: [],
  acceptance_criteria: ['The page has a meta description'],
  do_not: ['Do not add hidden text']
};

const issue: ScannerIssue = {
  category: 'SEO',
  severity: 'Medium',
  title: 'Missing meta description',
  description: 'The page has no meta description.',
  recommendation: 'Add a meta description that summarises the page.',
  codeSnippet: '<meta name="description" content="A concise summary.">',
  agentFix
};

function fullResult(): ScanResult {
  return {
    overallScore: 80,
    summary: 'Complete test scan.',
    metrics,
    issues: [{ ...issue }],
    analysis: {
      rulesChecked: 1,
      accessibilityChecks: 0,
      vitalsEnabled: false,
      engines: ['test'],
      rulesetVersion: 'test'
    }
  };
}

function createResponse() {
  const state: { statusCode: number; body: any } = { statusCode: 0, body: null };
  const res = {
    status(code: number) {
      state.statusCode = code;
      return res;
    },
    json(payload: any) {
      state.body = payload;
      return res;
    },
    setHeader() {
      return res;
    },
    type() {
      return res;
    },
    send() {
      return res;
    },
    end() {
      return res;
    }
  };

  return { state, res: res as any };
}

const scanRequest = {
  body: {
    url: 'https://example.com',
    language: 'sv',
    devices: ['mobile'],
    categories: ['SEO'],
    thorough: false,
    force: true
  },
  protocol: 'https',
  get(name: string) {
    return name.toLowerCase() === 'host' ? 'sitescanner.example' : undefined;
  },
  header() {
    return undefined;
  }
} as any;

test('localizing an English issue does not replace its recommendation with the axe fallback', () => {
  const localized = localizeHardcodedIssue('en', { ...issue });

  assert.equal(localized.title, issue.title);
  assert.equal(localized.description, issue.description);
  assert.equal(localized.recommendation, issue.recommendation);
  assert.equal(localized.codeSnippet, issue.codeSnippet);
});

test('localizing a Swedish rule issue still produces English copy', () => {
  const localized = localizeHardcodedIssue('en', {
    ...issue,
    title: 'Saknad Meta Description',
    description: 'Sidan saknar en metabeskrivning.',
    recommendation: 'Lägg till en metabeskrivning.'
  });

  assert.equal(localized.title, 'Missing meta description');
  assert.equal(localized.description, 'The page is missing a meta description.');
  assert.match(localized.recommendation, /meta name="description"/);
});

test('scan returns recommendations, code and agent fixes in production', async () => {
  const controller = new ScanController();
  // Keep the regression test deterministic and offline: the scan controller's
  // network/browser work is not what this test protects.
  (controller as any).fetchAndScan = async () => fullResult();

  const { state, res } = createResponse();
  await controller.scanFree(scanRequest, res);

  assert.equal(state.statusCode, 0);
  assert.ok(state.body, 'scan response is missing');
  assert.equal(state.body.issues.length, 1);
  assert.equal(state.body.issues[0].recommendation, issue.recommendation);
  assert.equal(state.body.issues[0].codeSnippet, issue.codeSnippet);
  assert.equal(state.body.issues[0].agentFix.goal, agentFix.goal);
  assert.equal(state.body.issues[0].agentFix.schema_version, '1.0');
  assert.equal(typeof state.body.reportId, 'string');
});

test('saved reports return complete fields even with an old licence header', async () => {
  const saved = saveReport({
    result: fullResult(),
    url: 'https://example.com',
    language: 'sv',
    apiOrigin: 'https://sitescanner.example'
  });
  assert.ok(saved, 'report should be saved');

  const controller = new ReportShareController();
  const req = {
    params: { id: saved.id },
    header(name: string) {
      return name.toLowerCase() === 'x-license-token' ? 'old-premium-token' : undefined;
    }
  } as any;
  const { state, res } = createResponse();

  await controller.getReport(req, res);

  assert.equal(state.statusCode, 0);
  assert.ok(state.body, 'report response is missing');
  assert.equal(Object.prototype.hasOwnProperty.call(state.body.report, 'unlocked'), false);
  assert.equal(state.body.result.reportId, saved.id);
  assert.equal(state.body.result.issues.length, 1);
  assert.equal(state.body.result.issues[0].recommendation, issue.recommendation);
  assert.equal(state.body.result.issues[0].codeSnippet, issue.codeSnippet);
  assert.equal(state.body.result.issues[0].agentFix.goal, agentFix.goal);
});
