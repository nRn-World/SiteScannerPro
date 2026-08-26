import React from 'react';
import { motion } from 'motion/react';
import {
  Accessibility,
  Code2,
  Download,
  Globe,
  Lock,
  RotateCcw,
  SearchCheck,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import MetricBox from './ui/MetricBox';
import SeverityBadge from './ui/SeverityBadge';
import CodeSnippetDisplay from './ui/CodeSnippetDisplay';
import ScoreRing, { scoreTone } from './ui/ScoreRing';
import { ScanResult } from '../rules/types';
import { CategoryKey, TranslationSet } from '../i18n/translations';

interface DashboardProps {
  result: ScanResult;
  url: string;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  onUpgradeClick: () => void;
  onNewScan: () => void;
  t: TranslationSet;
}

const Dashboard: React.FC<DashboardProps> = ({
  result,
  url,
  selectedCategory,
  setSelectedCategory,
  onUpgradeClick,
  onNewScan,
  t,
}) => {
  const filteredIssues = selectedCategory
    ? result.issues.filter(issue => issue.category === selectedCategory)
    : result.issues;
  const tone = scoreTone(result.overallScore);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="surface-card p-6 md:p-10">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 mb-5 max-w-full">
              <Globe className="w-4 h-4 text-muted shrink-0" />
              <span className="font-mono text-xs truncate">{url}</span>
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">
              {t.dashboard.report}
            </h2>
            <p className="text-muted leading-relaxed max-w-2xl mb-6">{result.summary}</p>
            <div className="flex flex-wrap gap-3 no-print">
              <button
                type="button"
                onClick={onNewScan}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold hover:border-ink/25 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> {t.site.actions.newScan}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-full bg-ink text-paper px-5 py-2.5 text-sm font-semibold hover:bg-accent transition-colors"
              >
                <Download className="w-4 h-4" /> {t.dashboard.exportPdf}
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center min-w-[200px]">
            <ScoreRing score={result.overallScore} />
            <p className="eyebrow mt-3">{t.dashboard.totalScore}</p>
            <p className={`mt-1 text-sm font-bold ${tone.text}`}>{t.site.score[tone.labelKey]}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricBox
          score={result.metrics.seo}
          label={t.dashboard.categories.SEO}
          icon={SearchCheck}
          t={t}
          isActive={selectedCategory === 'SEO'}
          onClick={() => setSelectedCategory(selectedCategory === 'SEO' ? null : 'SEO')}
        />
        <MetricBox
          score={result.metrics.performance}
          label={t.dashboard.categories.Performance}
          icon={Zap}
          t={t}
          isActive={selectedCategory === 'Performance'}
          onClick={() => setSelectedCategory(selectedCategory === 'Performance' ? null : 'Performance')}
        />
        <MetricBox
          score={result.metrics.security}
          label={t.dashboard.categories.Security}
          icon={ShieldAlert}
          t={t}
          isActive={selectedCategory === 'Security'}
          onClick={() => setSelectedCategory(selectedCategory === 'Security' ? null : 'Security')}
        />
        <MetricBox
          score={result.metrics.accessibility}
          label={t.dashboard.categories.Accessibility}
          icon={Accessibility}
          t={t}
          isActive={selectedCategory === 'Accessibility'}
          onClick={() => setSelectedCategory(selectedCategory === 'Accessibility' ? null : 'Accessibility')}
        />
        <MetricBox
          score={result.metrics.code}
          label={t.dashboard.categories.Code}
          icon={Code2}
          t={t}
          isActive={selectedCategory === 'Code'}
          onClick={() => setSelectedCategory(selectedCategory === 'Code' ? null : 'Code')}
        />
      </div>

      <div className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <h3 className="font-display text-2xl font-bold tracking-tight">
            {selectedCategory
              ? t.dashboard.categoryIssues.replace(
                  '{category}',
                  t.dashboard.categories[selectedCategory as CategoryKey] ?? selectedCategory
                )
              : t.dashboard.identifiedIssues}
          </h3>
          <span className="text-sm text-muted tabular-nums">{filteredIssues.length}</span>
        </div>

        {filteredIssues.length > 0 ? (
          <div className="grid gap-4">
            {filteredIssues.map((issue, idx) => {
              const bar =
                issue.severity === 'High'
                  ? 'bg-bad'
                  : issue.severity === 'Medium'
                    ? 'bg-warn'
                    : 'bg-good';
              return (
                <article key={`${issue.title}-${idx}`} className="surface-card p-5 md:p-6 relative overflow-hidden">
                  <span className={`absolute inset-y-0 start-0 w-1 ${bar}`} />
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <SeverityBadge severity={issue.severity} t={t} />
                      <h4 className="font-display font-bold text-lg leading-snug">{issue.title}</h4>
                    </div>
                    <span className="text-xs font-semibold text-muted">
                      {t.dashboard.categories[issue.category as CategoryKey] ?? issue.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted leading-relaxed mb-4">{issue.description}</p>
                  {issue.recommendation ? (
                    <div className="rounded-2xl bg-paper border border-line p-4">
                      <span className="eyebrow block mb-2">{t.dashboard.recommendation}</span>
                      <p className="text-sm leading-relaxed">{issue.recommendation}</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-paper border border-line p-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between no-print">
                      <div className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <div>
                          <span className="block text-sm font-bold mb-1">{t.dashboard.solutionLocked}</span>
                          <p className="text-sm text-muted leading-relaxed">{t.dashboard.lockedHint}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={onUpgradeClick}
                        className="shrink-0 rounded-full bg-accent text-white px-5 py-2.5 text-sm font-semibold hover:bg-ink transition-colors"
                      >
                        {t.dashboard.unlockCta}
                      </button>
                    </div>
                  )}
                  {issue.codeSnippet && <CodeSnippetDisplay code={issue.codeSnippet} t={t} />}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="surface-card py-14 text-center text-muted">{t.dashboard.noIssues}</div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
