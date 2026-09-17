import React, { useState } from 'react';
import { ChevronDown, AlertTriangle, AlertCircle, Info, Lock } from 'lucide-react';
import { ScannerIssue } from '../../rules/types';
import { CategoryKey, TranslationSet } from '../../i18n/translations';
import CodeSnippetDisplay from './CodeSnippetDisplay';
import IssueScreenshot from './IssueScreenshot';

interface AuditListProps {
  issues: ScannerIssue[];
  t: TranslationSet;
  isPremium?: boolean;
  onUpgradeClick: () => void;
}

function AuditIcon({ severity }: { severity: string }) {
  if (severity === 'High') {
    return <AlertTriangle className="w-4 h-4 text-[#ff4e42] shrink-0 fill-[#ff4e42]" strokeWidth={0} />;
  }
  if (severity === 'Medium') {
    return <AlertCircle className="w-4 h-4 text-[#ffa400] shrink-0" />;
  }
  return <Info className="w-4 h-4 text-gray-400 shrink-0" />;
}

interface AuditRowProps {
  issue: ScannerIssue;
  t: TranslationSet;
  isPremium?: boolean;
  onUpgradeClick: () => void;
  defaultOpen?: boolean;
}

const AuditRow: React.FC<AuditRowProps> = ({ issue, t, isPremium, onUpgradeClick, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const categoryLabel = t.dashboard.categories[issue.category as CategoryKey] ?? issue.category;

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors group"
        aria-expanded={open}
      >
        <AuditIcon severity={issue.severity} />
        <span className="flex-1 text-sm text-gray-900 group-hover:text-gray-950">{issue.title}</span>
        <span className="text-[11px] text-gray-400 uppercase tracking-wide hidden sm:block shrink-0">
          {categoryLabel}
        </span>
        {issue.source && issue.source !== 'rules' && (
          <span className="text-[10px] text-gray-400 hidden md:block shrink-0">{issue.source}</span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-4 pb-5 pt-0 ml-7 space-y-4 border-t border-gray-100 bg-[#fafafa]">
          <p className="text-sm text-gray-600 leading-relaxed pt-3">{issue.description}</p>

          {issue.screenshot && (
            <IssueScreenshot
              src={issue.screenshot}
              title={issue.title}
              description={issue.description}
              t={t}
            />
          )}

          {issue.recommendation ? (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {t.dashboard.howToFix}
              </p>
              <p className="text-sm text-gray-800 leading-relaxed">{issue.recommendation}</p>
            </div>
          ) : !isPremium ? (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.dashboard.solutionLocked}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{t.dashboard.lockedHint}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onUpgradeClick}
                className="shrink-0 px-4 py-2 bg-[#1a73e8] text-white text-xs font-medium rounded-md hover:bg-[#1765cc] transition-colors"
              >
                {t.dashboard.unlockCta}
              </button>
            </div>
          ) : null}

          {issue.agentFix && (
            <div className="rounded-lg border border-[#1a73e8]/20 bg-white p-4 space-y-2">
              <p className="text-xs text-gray-500 leading-relaxed">
                {t.dashboard.agentFixHint}
              </p>
              <CodeSnippetDisplay
                code={JSON.stringify(issue.agentFix, null, 2)}
                t={t}
                label={t.dashboard.agentFixJson}
                languageHint="JSON"
              />
            </div>
          )}

          {issue.codeSnippet && <CodeSnippetDisplay code={issue.codeSnippet} t={t} />}
        </div>
      )}
    </div>
  );
};

const SEVERITY_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

const AuditList: React.FC<AuditListProps> = ({ issues, t, isPremium, onUpgradeClick }) => {
  const sorted = [...issues].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
  );

  const critical = sorted.filter((i) => i.severity === 'High');
  const warnings = sorted.filter((i) => i.severity === 'Medium');
  const improvements = sorted.filter((i) => i.severity === 'Low');

  if (sorted.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 text-sm">{t.dashboard.noIssues}</div>
    );
  }

  const renderSection = (title: string, items: ScannerIssue[], defaultOpenFirst = false) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-6 last:mb-0">
        <h4 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
          {title} ({items.length})
        </h4>
        {items.map((issue, idx) => (
          <AuditRow
            key={`${issue.title}-${idx}`}
            issue={issue}
            t={t}
            isPremium={isPremium}
            onUpgradeClick={onUpgradeClick}
            defaultOpen={defaultOpenFirst && idx === 0}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
      {renderSection(t.dashboard.criticalIssues, critical, true)}
      {renderSection(t.dashboard.warnings, warnings)}
      {renderSection(t.dashboard.improvements, improvements)}
    </div>
  );
};

export default AuditList;
