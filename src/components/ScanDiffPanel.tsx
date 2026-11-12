import React from 'react';
import { AlertCircle, CheckCircle2, GitCompareArrows, MinusCircle, PlusCircle } from 'lucide-react';
import type { ScanResult, ScannerIssue } from '../rules/types';
import type { Language } from '../i18n/translations';
import { getVerifyCopy } from '../i18n/verifyCopy';
import { diffIssues, hasIssueChanges } from '../utils/issueDiff';

interface ScanDiffPanelProps {
  previous: ScanResult;
  current: ScanResult;
  language: Language;
}

type Tone = 'resolved' | 'remaining' | 'added';

const TONE_STYLES: Record<Tone, { box: string; heading: string; icon: string }> = {
  resolved: {
    box: 'border-green-200 bg-green-50/60',
    heading: 'text-green-800',
    icon: 'text-green-600'
  },
  remaining: {
    box: 'border-amber-200 bg-amber-50/50',
    heading: 'text-amber-800',
    icon: 'text-amber-600'
  },
  added: {
    box: 'border-red-200 bg-red-50/50',
    heading: 'text-red-800',
    icon: 'text-red-600'
  }
};

const TONE_ICONS = {
  resolved: CheckCircle2,
  remaining: MinusCircle,
  added: PlusCircle
};

function severityClass(severity: ScannerIssue['severity']): string {
  if (severity === 'High') return 'bg-red-500';
  if (severity === 'Medium') return 'bg-yellow-500';
  return 'bg-gray-400';
}

const IssueGroup: React.FC<{
  tone: Tone;
  title: string;
  items: ScannerIssue[];
  language: Language;
  showAllLabel: (count: number) => string;
}> = ({ tone, title, items, language, showAllLabel }) => {
  const copy = getVerifyCopy(language).diff;
  const styles = TONE_STYLES[tone];
  const Icon = TONE_ICONS[tone];
  if (items.length === 0) return null;

  const renderIssue = (issue: ScannerIssue, index: number) => {
    const device =
      issue.device === 'mobile'
        ? copy.deviceMobile
        : issue.device === 'desktop'
          ? copy.deviceDesktop
          : copy.deviceBoth;
    return (
      <li key={`${issue.title}-${index}`} className="flex gap-2 py-1.5">
        <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${severityClass(issue.severity)}`} />
        <div className="min-w-0">
          <p className="text-sm leading-snug text-gray-800">{issue.title}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-gray-400">
            {issue.category} · {device} · {copy.severity[issue.severity]}
          </p>
        </div>
      </li>
    );
  };

  const visible = items.slice(0, 6);
  const rest = items.slice(6);

  return (
    <div className={`rounded-lg border p-3 ${styles.box}`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${styles.icon}`} />
        <h4 className={`text-xs font-semibold uppercase tracking-wide ${styles.heading}`}>
          {title} <span className="tabular-nums">({items.length})</span>
        </h4>
      </div>
      <ul className="mt-1 divide-y divide-black/5">
        {visible.map(renderIssue)}
        {rest.length > 0 && (
          <li className="pt-2">
            <details>
              <summary className="cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-800">
                {showAllLabel(items.length)}
              </summary>
              <ul className="mt-1 divide-y divide-black/5">{rest.map(renderIssue)}</ul>
            </details>
          </li>
        )}
      </ul>
    </div>
  );
};

const ScanDiffPanel: React.FC<ScanDiffPanelProps> = ({ previous, current, language }) => {
  const copy = getVerifyCopy(language).diff;
  const diff = React.useMemo(
    () => diffIssues(previous.issues, current.issues),
    [previous.issues, current.issues]
  );
  const delta = current.overallScore - previous.overallScore;
  const deltaLabel =
    delta === 0 ? copy.unchanged : `${delta > 0 ? '+' : ''}${delta}`;
  const deltaClass = delta > 0 ? 'text-green-700' : delta < 0 ? 'text-red-700' : 'text-gray-500';
  const allCategories = ['SEO', 'Performance', 'Security', 'Accessibility', 'Code'];
  const allDevices = ['mobile', 'desktop'];
  const previousCategoryList = previous.analysis?.categories?.length
    ? previous.analysis.categories
    : allCategories;
  const previousDeviceList = previous.analysis?.devices?.length
    ? previous.analysis.devices
    : allDevices;
  const currentCategoryList = current.analysis?.categories?.length
    ? current.analysis.categories
    : allCategories;
  const currentDeviceList = current.analysis?.devices?.length ? current.analysis.devices : allDevices;
  const previousCategories = previousCategoryList.length;
  const previousDevices = previousDeviceList.length;
  const currentCategories = currentCategoryList.length;
  const currentDevices = currentDeviceList.length;
  const sameSet = (a: string[], b: string[]) =>
    a.length === b.length && a.every((value) => b.includes(value));
  const scopeChanged =
    !sameSet(previousCategoryList, currentCategoryList) ||
    !sameSet(previousDeviceList, currentDeviceList);

  return (
    <section
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"
      aria-labelledby="scan-diff-title"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a73e8]/10 text-[#1a73e8]">
            <GitCompareArrows className="h-5 w-5" />
          </span>
          <div>
            <h3 id="scan-diff-title" className="text-sm font-medium text-gray-900">
              {copy.title}
            </h3>
            <p className="mt-1 text-xs text-gray-500">{copy.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
          <span>{copy.score}</span>
          <strong className="tabular-nums text-gray-900">{previous.overallScore}</strong>
          <span className="text-gray-400">→</span>
          <strong className="tabular-nums text-gray-900">{current.overallScore}</strong>
          <span className={`font-semibold tabular-nums ${deltaClass}`}>({deltaLabel})</span>
        </div>
      </div>

      {scopeChanged && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
          {copy.scopeChanged(
            previousCategories,
            previousDevices,
            currentCategories,
            currentDevices
          )}
        </p>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2">
          <span className="text-xs font-medium text-green-800">{copy.resolved}</span>
          <strong className="text-lg tabular-nums text-green-800">{diff.resolved.length}</strong>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <span className="text-xs font-medium text-amber-800">{copy.remaining}</span>
          <strong className="text-lg tabular-nums text-amber-800">{diff.remaining.length}</strong>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <span className="text-xs font-medium text-red-800">{copy.added}</span>
          <strong className="text-lg tabular-nums text-red-800">{diff.added.length}</strong>
        </div>
      </div>

      {!hasIssueChanges(diff) && diff.remaining.length === 0 ? (
        <p className="mt-4 flex items-start gap-2 text-sm text-gray-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          {copy.noChanges}
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <IssueGroup
            tone="resolved"
            title={copy.resolved}
            items={diff.resolved}
            language={language}
            showAllLabel={copy.showAll}
          />
          <IssueGroup
            tone="added"
            title={copy.added}
            items={diff.added}
            language={language}
            showAllLabel={copy.showAll}
          />
          <IssueGroup
            tone="remaining"
            title={copy.remaining}
            items={diff.remaining}
            language={language}
            showAllLabel={copy.showAll}
          />
        </div>
      )}

      <p className="mt-3 text-[10px] leading-relaxed text-gray-400">{copy.matching}</p>
    </section>
  );
};

export default ScanDiffPanel;
