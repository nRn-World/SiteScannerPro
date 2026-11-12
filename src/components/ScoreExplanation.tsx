import React from 'react';
import { Calculator, AlertTriangle, Info } from 'lucide-react';
import type { DeviceMode, ScanMetrics, ScanResult } from '../rules/types';
import type { CategoryKey, Language, TranslationSet } from '../i18n/translations';
import { getVerifyCopy } from '../i18n/verifyCopy';

interface ScoreExplanationProps {
  result: ScanResult;
  device: DeviceMode;
  language: Language;
  t: TranslationSet;
}

const CATEGORY_KEYS: CategoryKey[] = ['SEO', 'Performance', 'Security', 'Accessibility', 'Code'];

const METRIC_BY_CATEGORY: Record<CategoryKey, keyof ScanMetrics> = {
  SEO: 'seo',
  Performance: 'performance',
  Security: 'security',
  Accessibility: 'accessibility',
  Code: 'code'
};

function barColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

const ScoreExplanation: React.FC<ScoreExplanationProps> = ({ result, device, language, t }) => {
  const copy = getVerifyCopy(language).score;
  const analysis = result.analysis;

  const selected = (analysis?.categories?.length ? analysis.categories : CATEGORY_KEYS).filter(
    (category): category is CategoryKey => CATEGORY_KEYS.includes(category as CategoryKey)
  );
  const categories = selected.length ? selected : CATEGORY_KEYS;
  const metrics = result.metricsByDevice?.[device] ?? result.metrics;
  const scores = categories.map((category) => ({
    category,
    score: metrics[METRIC_BY_CATEGORY[category]]
  }));
  const overall = Math.round(scores.reduce((sum, item) => sum + item.score, 0) / scores.length);
  const checks = analysis
    ? analysis.rulesChecked + analysis.accessibilityChecks
    : null;
  const deviceCount = analysis?.devices?.length ?? 2;
  const isPartial = categories.length < CATEGORY_KEYS.length || deviceCount < 2;
  const limitedEvidence = checks !== null && checks < 60;
  const low = overall < 70;
  const lowWithLimitedEvidence = low && (isPartial || limitedEvidence);
  const formula = scores.map((item) => `${t.dashboard.categories[item.category]} ${item.score}`).join(' + ');

  return (
    <section
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"
      aria-labelledby="score-explanation-title"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a73e8]/10 text-[#1a73e8]">
          <Calculator className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 id="score-explanation-title" className="text-sm font-medium text-gray-900">
            {copy.title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">{copy.intro}</p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          {copy.formula}
        </p>
        <p className="mt-1 break-words font-mono text-xs text-gray-700">
          ({formula}) / {scores.length} = <strong>{overall}</strong>
        </p>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] uppercase tracking-wider text-gray-500">
              <th className="pb-2 pr-3 font-medium">{copy.category}</th>
              <th className="pb-2 pr-3 font-medium">{copy.total}</th>
              <th className="pb-2 font-medium">{copy.contribution}</th>
            </tr>
          </thead>
          <tbody>
            {scores.map(({ category, score }) => (
              <tr key={category} className="border-b border-gray-100 last:border-0">
                <td className="py-2.5 pr-3 text-gray-700">{t.dashboard.categories[category]}</td>
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 font-medium tabular-nums text-gray-900">{score}</span>
                    <span className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
                      <span
                        className={`block h-full rounded-full ${barColor(score)}`}
                        style={{ width: `${Math.max(2, score)}%` }}
                      />
                    </span>
                  </div>
                </td>
                <td className="py-2.5 text-xs text-gray-500">
                  {copy.points((score / scores.length).toFixed(1).replace('.0', ''))}
                  <span className="ml-1 text-gray-400">
                    ({categories.length === CATEGORY_KEYS.length ? '20%' : `${Math.round(100 / scores.length)}%`})
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
        <span>{copy.scope(categories.length, deviceCount)}</span>
        {checks !== null && <span>{copy.checks(analysis?.rulesChecked ?? 0, analysis?.accessibilityChecks ?? 0)}</span>}
        <span>{device === 'mobile' ? t.dashboard.deviceMode.mobile : t.dashboard.deviceMode.desktop}</span>
      </div>

      {lowWithLimitedEvidence && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{copy.lowEvidence(checks ?? 0, categories.length)}</p>
        </div>
      )}

      {low && !lowWithLimitedEvidence && checks !== null && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{copy.lowFull(checks)}</p>
        </div>
      )}

      {checks === null && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{copy.noEvidence}</p>
        </div>
      )}

      {isPartial && (
        <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-gray-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{copy.partial}</span>
        </p>
      )}

      <p className="mt-3 border-t border-gray-100 pt-3 text-xs leading-relaxed text-gray-400">
        {copy.disclaimer}
      </p>
    </section>
  );
};

export default ScoreExplanation;
