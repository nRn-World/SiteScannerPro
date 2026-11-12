import React, { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { getCompareCopy } from '../i18n/compareCopy';
import { CategoryKey, Language, TranslationSet } from '../i18n/translations';
import {
  comparisonMetricsForDevice,
  comparisonOverallForDevice,
  type ComparisonResult,
  type ComparisonSite
} from '../rules/comparison';
import { DeviceMode, ScanMetrics } from '../rules/types';
import { getScoreColor } from './ui/ScoreGauge';

interface ComparisonViewProps {
  result: ComparisonResult;
  t: TranslationSet;
  language: Language;
}

const METRIC_ROWS: Array<{ key: keyof ScanMetrics; category: CategoryKey }> = [
  { key: 'seo', category: 'SEO' },
  { key: 'performance', category: 'Performance' },
  { key: 'security', category: 'Security' },
  { key: 'accessibility', category: 'Accessibility' },
  { key: 'code', category: 'Code' }
];

const VITAL_ROWS: Array<{ key: 'lcp' | 'cls' | 'inp' | 'ttfb'; labelKey: 'lcp' | 'cls' | 'inp' | 'ttfb' }> = [
  { key: 'lcp', labelKey: 'lcp' },
  { key: 'cls', labelKey: 'cls' },
  { key: 'inp', labelKey: 'inp' },
  { key: 'ttfb', labelKey: 'ttfb' }
];

function siteLabel(site: ComparisonSite, index: number, result: ComparisonResult, yourSite: string, competitor: string): string {
  return site.url === result.baselineUrl ? yourSite : `${competitor} ${index}`;
}

function deltaLabel(value: number): string {
  if (value === 0) return '';
  return `${value > 0 ? '+' : '−'}${Math.abs(value)}`;
}

function formatVital(key: 'lcp' | 'cls' | 'inp' | 'ttfb', value: number | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '–';
  return key === 'cls' ? value.toFixed(3) : `${Math.round(value)} ms`;
}

function severityLabel(copy: ReturnType<typeof getCompareCopy>, severity: 'High' | 'Medium' | 'Low'): string {
  return severity === 'High' ? copy.high : severity === 'Medium' ? copy.medium : copy.low;
}

function severityBadgeClass(severity: 'High' | 'Medium' | 'Low'): string {
  if (severity === 'High') return 'bg-red-50 text-red-700';
  if (severity === 'Medium') return 'bg-amber-50 text-amber-700';
  return 'bg-slate-100 text-slate-600';
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ result, t, language }) => {
  const [device, setDevice] = useState<DeviceMode>('mobile');
  const copy = getCompareCopy(language);
  const sites = result.sites;
  const baseline = sites[0];

  if (!baseline) return null;

  const overalls = sites.map((site) => comparisonOverallForDevice(site, device));
  const bestOverall = Math.max(...overalls);

  const vitalsRows = VITAL_ROWS.filter(({ key }) =>
    sites.some((site) => {
      const value = site.vitalsByDevice[device]?.[key];
      return typeof value === 'number' && Number.isFinite(value);
    })
  );

  const tabClass = (active: boolean) =>
    `inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      active
        ? 'bg-[#1a73e8] text-white shadow-sm'
        : 'border border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50'
    }`;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-medium text-gray-900">{copy.resultTitle}</h3>
          <p className="mt-1 text-sm text-gray-500">{copy.resultSubtitle}</p>
        </div>
        <div className="flex gap-2" role="tablist" aria-label={copy.title}>
          <button
            type="button"
            role="tab"
            aria-selected={device === 'mobile'}
            onClick={() => setDevice('mobile')}
            className={tabClass(device === 'mobile')}
          >
            <Smartphone className="h-4 w-4" />
            {copy.mobile}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={device === 'desktop'}
            onClick={() => setDevice('desktop')}
            className={tabClass(device === 'desktop')}
          >
            <Monitor className="h-4 w-4" />
            {copy.desktop}
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {sites.map((site, index) => {
          const overall = overalls[index];
          const isBest = sites.length > 1 && overall === bestOverall;
          const delta = overall - overalls[0];

          return (
            <div
              key={`${site.url}-${index}`}
              className={`rounded-xl border bg-white p-4 ${
                isBest ? 'border-green-300 ring-1 ring-green-100' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    {siteLabel(site, index, result, copy.yourSite, copy.competitor)}
                  </p>
                  <p className="mt-1 truncate text-sm font-medium text-gray-900">{site.host}</p>
                </div>
                {isBest && (
                  <span className="shrink-0 rounded-full bg-green-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-green-700">
                    {copy.best}
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-end gap-1.5">
                <span
                  className="text-4xl font-semibold leading-none"
                  style={{ color: getScoreColor(overall) }}
                >
                  {overall}
                </span>
                <span className="pb-0.5 text-xs text-gray-400">/100</span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${overall}%`, backgroundColor: getScoreColor(overall) }}
                />
              </div>

              {index > 0 && delta !== 0 && (
                <p className={`mt-2 text-xs ${delta > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {deltaLabel(delta)} {copy.vsBaseline}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-sm">
            <caption className="sr-only">{copy.resultTitle}</caption>
            <thead>
              <tr className="bg-gray-50">
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {copy.metric}
                </th>
                {sites.map((site, index) => (
                  <th
                    key={`${site.url}-header`}
                    scope="col"
                    className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {siteLabel(site, index, result, copy.yourSite, copy.competitor)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              <tr>
                <th scope="row" className="px-4 py-3 text-left font-medium text-gray-700">
                  {copy.overall}
                </th>
                {sites.map((site, index) => {
                  const value = overalls[index];
                  const isBest = value === bestOverall;
                  return (
                    <td
                      key={`${site.url}-overall`}
                      className={`px-4 py-3 text-right tabular-nums ${
                        isBest ? 'bg-green-50 font-semibold text-green-700' : 'text-gray-700'
                      }`}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
              {METRIC_ROWS.map(({ key, category }) => {
                const values = sites.map(
                  (site) => comparisonMetricsForDevice(site, device)[key]
                );
                const best = Math.max(...values);

                return (
                  <tr key={key}>
                    <th scope="row" className="px-4 py-3 text-left font-medium text-gray-700">
                      {t.dashboard.categories[category]}
                    </th>
                    {sites.map((site, index) => {
                      const value = values[index];
                      const isBest = value === best;
                      return (
                        <td
                          key={`${site.url}-${key}`}
                          className={`px-4 py-3 text-right tabular-nums ${
                            isBest ? 'bg-green-50 font-semibold text-green-700' : 'text-gray-700'
                          }`}
                        >
                          {value}
                          {index > 0 && value !== values[0] && (
                            <span
                              className={`ml-1.5 text-[11px] font-normal ${
                                value > values[0] ? 'text-green-600' : 'text-red-500'
                              }`}
                            >
                              {deltaLabel(value - values[0])}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h4 className="text-sm font-medium text-gray-900">{copy.issues}</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <caption className="sr-only">{copy.issues}</caption>
              <thead>
                <tr className="bg-white">
                  <th scope="col" className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {copy.metric}
                  </th>
                  {sites.map((site, index) => (
                    <th
                      key={`${site.url}-issues-header`}
                      scope="col"
                      className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-400"
                    >
                      {siteLabel(site, index, result, copy.yourSite, copy.competitor)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(['High', 'Medium', 'Low'] as const).map((severity) => {
                  const values = sites.map(
                    (site) => site.issuesByDevice?.[device]?.[severity] ?? 0
                  );
                  const best = Math.min(...values);
                  const label =
                    severity === 'High' ? copy.high : severity === 'Medium' ? copy.medium : copy.low;

                  return (
                    <tr key={severity}>
                      <th scope="row" className="px-4 py-3 text-left font-medium text-gray-700">
                        {label}
                      </th>
                      {sites.map((site, index) => (
                        <td
                          key={`${site.url}-${severity}`}
                          className={`px-4 py-3 text-right tabular-nums ${
                            values[index] === best
                              ? 'bg-green-50 font-semibold text-green-700'
                              : 'text-gray-700'
                          }`}
                        >
                          {values[index]}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {vitalsRows.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
              <h4 className="text-sm font-medium text-gray-900">{copy.vitals}</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-sm">
                <caption className="sr-only">{copy.vitals}</caption>
                <thead>
                  <tr className="bg-white">
                    <th scope="col" className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {copy.metric}
                    </th>
                    {sites.map((site, index) => (
                      <th
                        key={`${site.url}-vitals-header`}
                        scope="col"
                        className="px-4 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-400"
                      >
                        {siteLabel(site, index, result, copy.yourSite, copy.competitor)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vitalsRows.map(({ key, labelKey }) => {
                    const values = sites.map((site) => site.vitalsByDevice[device]?.[key]);
                    const numeric = values.filter(
                      (value): value is number => typeof value === 'number' && Number.isFinite(value)
                    );
                    const best = numeric.length > 0 ? Math.min(...numeric) : null;

                    return (
                      <tr key={key}>
                        <th scope="row" className="px-4 py-3 text-left font-medium text-gray-700">
                          {copy[labelKey]}
                        </th>
                        {sites.map((site, index) => {
                          const value = values[index];
                          return (
                            <td
                              key={`${site.url}-${key}`}
                              className={`px-4 py-3 text-right tabular-nums ${
                                best !== null && value === best
                                  ? 'bg-green-50 font-semibold text-green-700'
                                  : 'text-gray-700'
                              }`}
                            >
                              {formatVital(key, value)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h4 className="text-sm font-medium text-gray-900">{copy.topFindings}</h4>
        </div>
        <div className="grid divide-y divide-gray-100 md:grid-cols-3 md:divide-x md:divide-y-0">
          {sites.map((site, index) => {
            const issue = site.topIssuesByDevice?.[device]?.[0];

            return (
              <div key={`${site.url}-top`} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    {siteLabel(site, index, result, copy.yourSite, copy.competitor)}
                  </p>
                  {issue && (
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${severityBadgeClass(
                        issue.severity
                      )}`}
                    >
                      {severityLabel(copy, issue.severity)}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm font-medium leading-snug text-gray-900">
                  {issue ? issue.title : copy.noIssues}
                </p>
                {issue && (
                  <p className="mt-1 text-xs text-gray-500">{issue.category}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs leading-relaxed text-gray-400">{copy.disclaimer}</p>
    </div>
  );
};

export default ComparisonView;
