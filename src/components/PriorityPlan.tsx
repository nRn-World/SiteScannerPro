import React from 'react';
import { ArrowRight, ListChecks, Lock } from 'lucide-react';
import { CategoryKey, TranslationSet } from '../i18n/translations';
import { ScannerIssue, Severity } from '../rules/types';

interface PriorityPlanProps {
  issues: ScannerIssue[];
  t: TranslationSet;
  isPremium: boolean;
  onUpgradeClick: () => void;
  onShowAll: () => void;
}

const MAX_ITEMS = 3;

const SEVERITY_RANK: Record<Severity, number> = {
  High: 0,
  Medium: 1,
  Low: 2
};

const SEVERITY_STYLES: Record<Severity, string> = {
  High: 'border-[#ff4e42]/30 bg-[#ff4e42]/10 text-[#b3261e]',
  Medium: 'border-[#ffa400]/30 bg-[#ffa400]/10 text-[#8a5a00]',
  Low: 'border-[#1a73e8]/20 bg-[#1a73e8]/10 text-[#1a73e8]'
};

/**
 * Turns the audit list into a short, ordered starting point. The three issues
 * are chosen from the currently selected device/category, so the plan always
 * matches what the user is looking at.
 */
const PriorityPlan: React.FC<PriorityPlanProps> = ({
  issues,
  t,
  isPremium,
  onUpgradeClick,
  onShowAll
}) => {
  const plan = [...issues]
    .sort((a, b) => (SEVERITY_RANK[a.severity] ?? 9) - (SEVERITY_RANK[b.severity] ?? 9))
    .slice(0, MAX_ITEMS);

  if (plan.length === 0) return null;

  return (
    <section
      aria-labelledby="priority-plan-title"
      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="flex flex-col gap-4 border-b border-gray-200 p-5 md:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a73e8]/10 text-[#1a73e8]">
            <ListChecks className="h-5 w-5" />
          </span>
          <div>
            <h3 id="priority-plan-title" className="text-base font-medium text-gray-900">
              {t.dashboard.actionPlan.title}
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-500">
              {t.dashboard.actionPlan.subtitle}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {!isPremium && (
            <button
              type="button"
              onClick={onUpgradeClick}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1a73e8] px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1765cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8] focus-visible:ring-offset-2"
            >
              <Lock className="h-4 w-4" />
              {t.dashboard.unlockCta}
            </button>
          )}
          <button
            type="button"
            onClick={onShowAll}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8] focus-visible:ring-offset-2"
          >
            {t.dashboard.actionPlan.showAll}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ol className="list-none divide-y divide-gray-100">
        {plan.map((issue, index) => {
          const category = issue.category as CategoryKey;
          const impact = t.dashboard.actionPlan.categoryImpact[category];
          // Show the category explanation once; otherwise two SEO findings in a
          // row repeat the same paragraph and bury the actual fixes.
          const showImpact = plan.findIndex((item) => item.category === issue.category) === index;

          return (
            <li key={`${issue.title}-${index}`} className="flex gap-4 p-5 md:p-6">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 font-mono text-xs font-bold text-white">
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${SEVERITY_STYLES[issue.severity]}`}
                  >
                    {t.dashboard.actionPlan.severity[issue.severity]}
                  </span>
                  <span className="text-[11px] uppercase tracking-wide text-gray-500">
                    {t.dashboard.categories[category] ?? issue.category}
                  </span>
                </div>

                <h4 className="mt-2 text-sm font-medium text-gray-900 md:text-base">
                  {issue.title}
                </h4>

                {issue.description && (
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                    {issue.description}
                  </p>
                )}

                {impact && showImpact && (
                  <div className="mt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      {t.dashboard.actionPlan.whyItMatters}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{impact}</p>
                  </div>
                )}

                {issue.recommendation ? (
                  <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                      {t.dashboard.howToFix}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-800">
                      {issue.recommendation}
                    </p>
                  </div>
                ) : !isPremium ? (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <Lock className="h-3.5 w-3.5" />
                    {t.dashboard.actionPlan.locked}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default PriorityPlan;
