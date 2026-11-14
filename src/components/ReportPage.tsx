import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, ArrowLeft, Check, Download, Link2, Loader2, RefreshCw } from 'lucide-react';
import Dashboard from './Dashboard';
import DataNotice from './DataNotice';
import { ScanResult } from '../rules/types';
import { Language, TranslationSet } from '../i18n/translations';
import { apiUrl } from '../api';

interface SharedReportMeta {
  id: string;
  createdAt: string;
  rulesetVersion: string;
  url: string;
  host: string;
}

interface ReportResponse {
  report: SharedReportMeta;
  result: ScanResult;
}

interface ReportPageProps {
  reportId: string;
  language: Language;
  t: TranslationSet;
  onRescan?: (result: ScanResult, url: string) => void;
  onOpenPrivacy?: () => void;
}

const COPY = {
  sv: {
    loading: 'Laddar sparad rapport…',
    missingTitle: 'Rapporten kunde inte hittas',
    missingBody: 'Länken är felaktig eller så har rapporten gått ut. Sparade rapporter finns i 30 dagar.',
    back: 'Skanna din egen sajt',
    saved: 'Sparad rapport',
    version: 'Regelversion',
    copy: 'Kopiera länk',
    copied: 'Länk kopierad',
    print: 'Skriv ut / PDF',
    retry: 'Försök igen',
    rescan: 'Skanna om'
  },
  en: {
    loading: 'Loading saved report…',
    missingTitle: 'Report not found',
    missingBody: 'The link is incorrect or the report has expired. Saved reports are kept for 30 days.',
    back: 'Scan your own site',
    saved: 'Saved report',
    version: 'Ruleset version',
    copy: 'Copy link',
    copied: 'Link copied',
    print: 'Print / PDF',
    retry: 'Try again',
    rescan: 'Rescan'
  }
};

function appBaseUrl(): string {
  const base = ((import.meta.env.BASE_URL as string | undefined) || '/').replace(/\/$/, '');
  return `${window.location.origin}${base}/`;
}

const ReportPage: React.FC<ReportPageProps> = ({
  reportId,
  language,
  t,
  onRescan,
  onOpenPrivacy
}) => {
  const text = COPY[language === 'sv' ? 'sv' : 'en'];
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportResponse | null>(null);
  const [failed, setFailed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setFailed(false);

      try {
        const res = await fetch(apiUrl(`/api/reports/${encodeURIComponent(reportId)}`), {
          signal: controller.signal
        });

        if (!res.ok) throw new Error(`Report request failed (${res.status})`);

        const payload = (await res.json()) as ReportResponse;
        if (!cancelled) {
          setData(payload);
          setLoading(false);
        }
      } catch (error) {
        if (!cancelled && (error as Error)?.name !== 'AbortError') {
          setFailed(true);
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [reportId]);

  const copyLink = async () => {
    try {
      await navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard access can be denied; the URL is still visible in the browser.
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-20 flex items-center justify-center gap-3 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="font-mono text-sm">{text.loading}</span>
      </div>
    );
  }

  if (failed || !data) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 space-y-5">
        <AlertTriangle className="w-10 h-10 text-accent mx-auto" />
        <h1 className="text-3xl font-display font-bold uppercase">{text.missingTitle}</h1>
        <p className="font-mono text-sm text-gray-600 leading-relaxed">{text.missingBody}</p>
        <button
          type="button"
          onClick={() => window.location.assign(appBaseUrl())}
          className="inline-flex items-center gap-2 px-5 py-3 bg-ink text-paper font-display font-bold uppercase tracking-widest hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {text.back}
        </button>
      </div>
    );
  }

  const { report, result } = data;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Helmet>
        <title>{report.host} – SiteScanner Pro</title>
      </Helmet>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {text.saved} · {new Date(report.createdAt).toLocaleString(language)}
            </p>
            <h1 className="text-xl md:text-2xl font-medium text-gray-900 mt-1 truncate">
              {report.host}
            </h1>
            <a
              href={report.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#1a73e8] hover:underline break-all"
            >
              {report.url}
            </a>
            <p className="text-xs text-gray-400 mt-1">
              {text.version} {report.rulesetVersion} · SiteScanner Pro
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            {onRescan && (
              <button
                type="button"
                onClick={() => onRescan(result, report.url)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#1a73e8] rounded-lg hover:bg-[#1765cc] transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> {text.rescan}
              </button>
            )}
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
              {copied ? text.copied : text.copy}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" /> {text.print}
            </button>
          </div>
        </div>
        <DataNotice kind="report" language={language} onOpenPrivacy={onOpenPrivacy} className="mt-3" />
      </div>

      <Dashboard
        result={result}
        url={report.url}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        language={language}
        t={t}
        onRescan={onRescan ? () => onRescan(result, report.url) : undefined}
      />

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => window.location.assign(appBaseUrl())}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {text.back}
        </button>
      </div>
    </div>
  );
};

export default ReportPage;
