export type Severity = 'High' | 'Medium' | 'Low';

export const ISSUE_IDS = [
  'seo.missing-title',
  'seo.missing-meta-description',
  'seo.missing-h1',
  'performance.slow-response-high',
  'performance.slow-response-medium',
  'security.insecure-http',
  'security.missing-hsts',
  'security.clickjacking-risk',
  'accessibility.missing-alt-text',
  'accessibility.missing-language',
  'code.inline-styles',
  'code.deprecated-tags',
  'code.render-blocking-js'
] as const;

export type IssueId = typeof ISSUE_IDS[number];
export type IssueValues = Partial<Record<'loadTime' | 'count', number>>;

export interface ScannerIssue {
  id: IssueId;
  category: string;
  severity: Severity;
  values?: IssueValues;
  recommendationAvailable?: true;
  codeSnippet?: string;
  codeSnippetId?: IssueId;
  descriptionTeaser?: true;
}

export interface LocalizedScannerIssue extends ScannerIssue {
  title: string;
  description: string;
  recommendation?: string;
}

export interface ScanMetrics {
  seo: number;
  performance: number;
  security: number;
  accessibility: number;
  code: number;
}

export interface ScanResult {
  overallScore: number;
  metrics: ScanMetrics;
  issues: ScannerIssue[];
}

export interface LocalizedScanResult extends Omit<ScanResult, 'issues'> {
  summary: string;
  issues: LocalizedScannerIssue[];
}

export interface ScannerContext {
  loadTime: number;
  isHttps: boolean;
  headers: Headers;
}

export interface ScannerRule {
  name: string;
  category: string;
  run: (html: string, context: ScannerContext) => Promise<ScannerIssue[]>;
}