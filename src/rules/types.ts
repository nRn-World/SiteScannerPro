export type Severity = 'High' | 'Medium' | 'Low';
export type DeviceMode = 'mobile' | 'desktop';
export type IssueDevice = DeviceMode | 'both';

export type AgentFixAction =
  | 'add'
  | 'replace'
  | 'remove'
  | 'configure'
  | 'optimize'
  | 'verify'
  | 'investigate';

export interface AgentFixStep {
  order: number;
  action: AgentFixAction;
  target: string;
  instruction: string;
  verify?: string;
}

export interface AgentCodeChange {
  type: 'add' | 'replace' | 'remove' | 'config';
  language: string;
  file_hint: string;
  selector?: string;
  before?: string | null;
  after?: string | null;
  notes?: string;
}

/** Maskinläsbar fix för AI-agenter */
export interface AgentFix {
  schema_version: '1.0';
  role: 'coding_agent';
  language: 'sv' | 'en';
  issue: {
    title: string;
    category: string;
    severity: Severity;
    device: IssueDevice;
    summary: string;
    source?: string;
  };
  goal: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  constraints: string[];
  steps: AgentFixStep[];
  code_changes: AgentCodeChange[];
  acceptance_criteria: string[];
  do_not: string[];
}

export interface ScannerIssue {
  category: string;
  severity: Severity;
  title: string;
  description: string;
  /**
   * Rekommendationen är endast inkluderad för Pro-användare -
   * servern strippar fältet helt ur gratis-svar.
   */
  recommendation?: string;
  codeSnippet?: string;
  /** CSS-selector för visuell markering / skärmdump */
  selector?: string;
  /** Base64 data-URL till skärmdump av problemet */
  screenshot?: string;
  source?: 'rules' | 'axe' | 'vitals' | 'browser';
  /** Vilket resultatläge felet hör till */
  device?: IssueDevice;
  /**
   * Strukturerad JSON-fix för AI-agenter (Premium).
   * Ge hela objektet till agenten.
   */
  agentFix?: AgentFix;
}

export interface ScanScreenshots {
  desktop?: string;
  mobile?: string;
  filmstrip?: string[];
}

export interface ScanMetrics {
  seo: number;
  performance: number;
  security: number;
  accessibility: number;
  code: number;
}

export interface CoreWebVitals {
  performanceScore?: number;
  seoScore?: number;
  accessibilityScore?: number;
  bestPracticesScore?: number;
  lcp?: number;
  cls?: number;
  inp?: number;
  fcp?: number;
  ttfb?: number;
  speedIndex?: number;
}

export interface DeviceVitalsMap {
  mobile?: CoreWebVitals;
  desktop?: CoreWebVitals;
}

export interface DeviceMetricsMap {
  mobile: ScanMetrics;
  desktop: ScanMetrics;
}

export interface AnalysisMeta {
  rulesChecked: number;
  accessibilityChecks: number;
  vitalsEnabled: boolean;
  engines: string[];
}

export interface ScanResult {
  overallScore: number;
  summary: string;
  metrics: ScanMetrics;
  /** Separata poäng per enhet */
  metricsByDevice?: DeviceMetricsMap;
  issues: ScannerIssue[];
  vitals?: CoreWebVitals;
  /** Separata vitals per enhet (PageSpeed-stil) */
  vitalsByDevice?: DeviceVitalsMap;
  screenshots?: ScanScreenshots;
  analysis?: AnalysisMeta;
}

export interface ScannerContext {
  url: string;
  finalUrl: string;
  loadTime: number;
  ttfb: number;
  isHttps: boolean;
  headers: Headers;
  contentLength: number;
  robotsTxt?: string | null;
  sitemapFound?: boolean;
  language?: import('../i18n/translations').Language;
}

export interface ScannerRule {
  name: string;
  category: string;
  run: (html: string, context: ScannerContext) => Promise<ScannerIssue[]>;
}
