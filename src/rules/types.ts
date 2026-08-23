export type Severity = 'High' | 'Medium' | 'Low';

export interface ScannerIssue {
  category: string;
  severity: Severity;
  title: string;
  description: string;
  recommendation: string;
  codeSnippet?: string;
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
  summary: string;
  metrics: ScanMetrics;
  issues: ScannerIssue[];
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