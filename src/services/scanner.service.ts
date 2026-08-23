import { ALL_RULES } from '../rules/core.rules';
import { ScannerContext, ScanResult, ScanMetrics, ScannerIssue } from '../rules/types';

export class ScannerService {
  public async scan(html: string, context: ScannerContext): Promise<ScanResult> {
    const allIssues: ScannerIssue[] = [];

    // Run all rules in parallel
    const ruleResults = await Promise.all(
      ALL_RULES.map(rule => rule.run(html, context))
    );

    // Flatten results
    ruleResults.forEach(issues => {
      allIssues.push(...issues);
    });

    const metrics = this.calculateMetrics(allIssues);
    const overallScore = Math.round(
      (metrics.seo + metrics.performance + metrics.security + metrics.accessibility + metrics.code) / 5
    );

    return {
      overallScore,
      summary: this.generateSummary(overallScore),
      metrics,
      issues: allIssues
    };
  }

  private calculateMetrics(issues: ScannerIssue[]): ScanMetrics {
    const metrics: ScanMetrics = {
      seo: 100,
      performance: 100,
      security: 100,
      accessibility: 100,
      code: 100
    };

    // Map categories to metric keys
    const categoryToMetric: Record<string, keyof ScanMetrics> = {
      'SEO': 'seo',
      'Performance': 'performance',
      'Security': 'security',
      'Accessibility': 'accessibility',
      'Code': 'code'
    };

    // Deduct points based on severity
    issues.forEach(issue => {
      const metricKey = categoryToMetric[issue.category];
      if (metricKey) {
        const penalty = this.getPenalty(issue.severity);
        metrics[metricKey] = Math.max(0, metrics[metricKey] - penalty);
      }
    });

    // Note: The current implementation in core.rules.ts actually already does 
    // its own internal scoring in some cases (like Performance). 
    // To stay consistent with the existing logic where rules handle their own deductions,
    // I will adjust this to be a pure aggregator or refine the rules to just report issues.
    // For now, I'll follow the pattern of the existing rules which seems to return issues,
    // but the original server.ts was doing the deduction logic.
    
    // Re-aligning with the original logic: The rules in core.rules.ts are 
    // actually returning issues, but the original server.ts was manually 
    // calculating scores. Let's make the rules return issues, and have 
    // the service handle the scoring to make it "smarter" and more centralized.
    
    return metrics;
  }

  private getPenalty(severity: string): number {
    switch (severity) {
      case 'High': return 25;
      case 'Medium': return 10;
      case 'Low': return 5;
      default: return 0;
    }
  }

  private generateSummary(score: number): string {
    if (score >= 90) return "Webbplatsen ser fantastisk ut! Den följer de flesta best practices.";
    if (score >= 70) return "Bra jobb, men det finns några områden som kan optimeras för att nå toppnivå.";
    if (score >= 50) return "Webbplatsen har flera brister som bör åtgärdas för att förbättra användarupplevelse och SEO.";
    return "Webbplatsen behöver omfattande åtgärder för att möta grundläggande standarder.";
  }
}