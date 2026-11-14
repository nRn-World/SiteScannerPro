import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Globe, Download, ExternalLink, Monitor, Smartphone, RefreshCw } from 'lucide-react';
import ScoreGauge from './ui/ScoreGauge';
import AuditList from './ui/AuditList';
import VitalsPanel from './ui/VitalsPanel';
import ScreenshotPanel from './ui/ScreenshotPanel';
import PriorityPlan from './PriorityPlan';
import ComparePanel from './ComparePanel';
import ScoreExplanation from './ScoreExplanation';
import ScanDiffPanel from './ScanDiffPanel';
import { DeviceMode, IssueDevice, ScanMetrics, ScanResult } from '../rules/types';
import { CategoryKey, Language, TranslationSet } from '../i18n/translations';
import { getVerifyCopy } from '../i18n/verifyCopy';

interface DashboardProps {
  result: ScanResult;
  url: string;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  language: Language;
  t: TranslationSet;
  onRescan?: () => void;
  previousResult?: ScanResult | null;
}

const CATEGORIES: CategoryKey[] = ['SEO', 'Performance', 'Security', 'Accessibility', 'Code'];

const METRIC_BY_CATEGORY: Record<CategoryKey, keyof ScanMetrics> = {
  SEO: 'seo',
  Performance: 'performance',
  Security: 'security',
  Accessibility: 'accessibility',
  Code: 'code'
};

function issueAppliesToDevice(deviceHint: IssueDevice | undefined, mode: DeviceMode): boolean {
  const d = deviceHint ?? 'both';
  return d === 'both' || d === mode;
}

function metricsForDevice(
  result: ScanResult,
  device: DeviceMode,
  categories: CategoryKey[]
): { metrics: ScanMetrics; overall: number } {
  const metrics = result.metricsByDevice?.[device] ?? result.metrics;
  const selected = categories.length ? categories : CATEGORIES;
  const overall = Math.round(
    selected.reduce((sum, category) => sum + metrics[METRIC_BY_CATEGORY[category]], 0) /
      selected.length
  );
  return { metrics, overall };
}

function filterIssuesForDevice(result: ScanResult, device: DeviceMode, category: string | null) {
  return result.issues.filter((issue) => {
    if (!issueAppliesToDevice(issue.device, device)) return false;
    if (category && issue.category !== category) return false;
    return true;
  });
}

const Dashboard: React.FC<DashboardProps> = ({
  result,
  url,
  selectedCategory,
  setSelectedCategory,
  language,
  t,
  onRescan,
  previousResult
}) => {
  const copy = getVerifyCopy(language);
  const scopeCategories = useMemo(() => {
    const fromAnalysis = (result.analysis?.categories ?? []).filter(
      (category): category is CategoryKey => CATEGORIES.includes(category as CategoryKey)
    );
    return fromAnalysis.length ? fromAnalysis : CATEGORIES;
  }, [result.analysis?.categories]);
  const availableDevices = useMemo<DeviceMode[]>(() => {
    const devices = result.analysis?.devices?.filter(
      (item): item is DeviceMode => item === 'mobile' || item === 'desktop'
    );
    return devices?.length ? devices : (['mobile', 'desktop'] as DeviceMode[]);
  }, [result.analysis?.devices]);
  const deviceScopeKey = availableDevices.join('|');

  const [device, setDevice] = useState<DeviceMode>(() =>
    availableDevices.includes('mobile') ? 'mobile' : 'desktop'
  );
  const auditsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!availableDevices.includes(device)) {
      setDevice(availableDevices[0]);
    }
  }, [deviceScopeKey, device]);

  useEffect(() => {
    if (selectedCategory && !scopeCategories.includes(selectedCategory as CategoryKey)) {
      setSelectedCategory(null);
    }
  }, [scopeCategories, selectedCategory, setSelectedCategory]);

  const { metrics: deviceMetrics, overall: deviceOverall } = useMemo(
    () => metricsForDevice(result, device, scopeCategories),
    [result, device, scopeCategories]
  );

  const activeVitals = result.vitalsByDevice?.[device] ?? (device === 'mobile' ? result.vitals : undefined);

  const filteredIssues = filterIssuesForDevice(result, device, selectedCategory);

  const categoryScores: Record<CategoryKey, number> = {
    SEO: deviceMetrics.seo,
    Performance: deviceMetrics.performance,
    Security: deviceMetrics.security,
    Accessibility: deviceMetrics.accessibility,
    Code: deviceMetrics.code
  };

  const toggleCategory = (cat: CategoryKey) => {
    setSelectedCategory(selectedCategory === cat ? null : cat);
  };

  const showAllFindings = () => {
    // "Show all" should always reveal the complete list, even when a category
    // filter is active. Scroll and move focus so keyboard users land there too.
    setSelectedCategory(null);
    const target = auditsRef.current;
    if (!target) return;
    // Focus first: focusing after a scroll can move it again. The state update
    // above also re-renders the audit list, so an instant scroll is reliable.
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'start' });
  };

  const deviceTabClass = (active: boolean) =>
    `flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full transition-colors ${
      active
        ? 'bg-[#1a73e8] text-white shadow-sm'
        : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
    }`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* URL header – PageSpeed-stil */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Globe className="w-4 h-4 shrink-0" />
              <span>{t.dashboard.reportGenerated}</span>
            </div>
            <a
              href={url.startsWith('http') ? url : `https://${url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg md:text-xl text-[#1a73e8] hover:underline font-medium truncate flex items-center gap-1.5"
            >
              {url}
              <ExternalLink className="w-4 h-4 shrink-0 opacity-60" />
            </a>
            {result.summary && (
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{result.summary}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onRescan && (
              <button
                type="button"
                onClick={onRescan}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1a73e8] rounded-lg hover:bg-[#1765cc] transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {copy.rescan}
              </button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              {t.dashboard.exportPdf}
            </button>
          </div>
        </div>
        {onRescan && <p className="mt-3 text-xs text-gray-500">{copy.rescanHint}</p>}
      </div>

      {/* Mobil / Dator – två resultatlägen */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-gray-900">{t.dashboard.deviceMode.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {availableDevices.length > 1
                ? t.dashboard.deviceMode.subtitle
                : language === 'sv'
                  ? 'Den här skanningen analyserade bara en enhet.'
                  : 'This scan analysed a single device.'}
            </p>
          </div>
          {availableDevices.length > 1 ? (
            <div className="flex gap-2 w-full sm:w-auto" role="tablist" aria-label={t.dashboard.deviceMode.title}>
              {availableDevices.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  role="tab"
                  aria-selected={device === mode}
                  onClick={() => setDevice(mode)}
                  className={deviceTabClass(device === mode)}
                >
                  {mode === 'mobile' ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                  {mode === 'mobile' ? t.dashboard.deviceMode.mobile : t.dashboard.deviceMode.desktop}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs font-medium text-gray-500">
              {availableDevices[0] === 'mobile' ? copy.options.mobile : copy.options.desktop}
            </p>
          )}
        </div>
        <p className="text-xs text-[#1a73e8] mt-3">
          {device === 'mobile' ? t.dashboard.deviceMode.showingMobile : t.dashboard.deviceMode.showingDesktop}
        </p>
      </div>

      {/* Poäng – cirkulära gauges som Lighthouse */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 md:p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">
          {t.dashboard.scoreOverview}
          <span className="text-gray-400 font-normal">
            {' · '}
            {device === 'mobile' ? t.dashboard.deviceMode.mobile : t.dashboard.deviceMode.desktop}
          </span>
        </h3>
        <div className="flex flex-wrap justify-center gap-2 md:gap-4">
          <ScoreGauge score={deviceOverall} label={t.dashboard.totalScore} size={96} />
          {scopeCategories.map((cat) => (
            <ScoreGauge
              key={cat}
              score={categoryScores[cat]}
              label={t.dashboard.categories[cat]}
              size={88}
              active={selectedCategory === cat}
              onClick={() => toggleCategory(cat)}
            />
          ))}
        </div>
        {selectedCategory && (
          <p className="text-center text-xs text-[#1a73e8] mt-4">
            {t.dashboard.filterActive.replace('{category}', t.dashboard.categories[selectedCategory as CategoryKey])}
            {' · '}
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="underline hover:no-underline"
            >
              {t.dashboard.showAll}
            </button>
          </p>
        )}
      </div>

      <ScoreExplanation result={result} device={device} language={language} t={t} />

      {previousResult && (
        <ScanDiffPanel previous={previousResult} current={result} language={language} />
      )}

      <PriorityPlan
        issues={filteredIssues}
        t={t}
        onShowAll={showAllFindings}
      />

      <ComparePanel
        baseUrl={url}
        language={language}
        t={t}
      />

      {/* Skärmdumpar för aktiv enhet */}
      {result.screenshots && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <ScreenshotPanel
            screenshots={result.screenshots}
            t={t}
            variant="lighthouse"
            view={device}
            onViewChange={setDevice}
            hideTabs
          />
        </div>
      )}

      {/* Core Web Vitals för aktiv enhet */}
      {activeVitals && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <VitalsPanel
            vitals={activeVitals}
            t={t}
            variant="lighthouse"
            device={device}
          />
        </div>
      )}

      {result.analysis && (
        <p className="text-xs text-gray-400 text-center">
          {t.dashboard.analysisDepth
            .replace('{rules}', String(result.analysis.rulesChecked))
            .replace('{axe}', String(result.analysis.accessibilityChecks))
            .replace('{engines}', result.analysis.engines.join(' · '))}
        </p>
      )}

      {/* Granskningar – Lighthouse-lista */}
      <div ref={auditsRef} tabIndex={-1} className="scroll-mt-24 outline-none">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-base font-medium text-gray-900">
            {selectedCategory
              ? t.dashboard.categoryIssues.replace(
                  '{category}',
                  t.dashboard.categories[selectedCategory as CategoryKey] ?? selectedCategory
                )
              : t.dashboard.audits}
          </h3>
          <span className="text-xs text-gray-500">
            {filteredIssues.length} {filteredIssues.length === 1 ? t.dashboard.auditSingular : t.dashboard.auditPlural}
          </span>
        </div>

        {/* Kategori-filter chips */}
        <div className="flex flex-wrap gap-2 mb-4 px-1">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              !selectedCategory
                ? 'bg-[#1a73e8] text-white border-[#1a73e8]'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
            }`}
          >
            {t.dashboard.filterAll}
          </button>
          {scopeCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#1a73e8] text-white border-[#1a73e8]'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }`}
            >
              {t.dashboard.categories[cat]}
            </button>
          ))}
        </div>

        <AuditList
          issues={filteredIssues}
          t={t}
        />
      </div>
    </motion.div>
  );
};

export default Dashboard;
