import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, ArrowLeft, Check, Copy, Loader2, Printer } from 'lucide-react';
import { apiUrl, reportUrl } from '../api';
import { getCompareCopy } from '../i18n/compareCopy';
import { Language, TranslationSet } from '../i18n/translations';
import type { ComparisonResult } from '../rules/comparison';
import ComparisonView from './ComparisonView';

interface ComparisonPageProps {
  comparisonId: string;
  language: Language;
  t: TranslationSet;
}

interface StoredComparisonResponse {
  id: string;
  createdAt: string;
  language: string;
  result: ComparisonResult;
}

function appBaseUrl(): string {
  const base = ((import.meta.env.BASE_URL as string | undefined) || '/').replace(/\/$/, '');
  return `${window.location.origin}${base}/`;
}

const ComparisonPage: React.FC<ComparisonPageProps> = ({ comparisonId, language, t }) => {
  const copy = getCompareCopy(language);
  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState<StoredComparisonResponse | null>(null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setFailed(false);

      try {
        const res = await fetch(apiUrl(`/api/comparisons/${encodeURIComponent(comparisonId)}`), {
          signal: controller.signal
        });
        if (!res.ok) throw new Error(`Comparison request failed (${res.status})`);

        const data = (await res.json()) as StoredComparisonResponse;
        if (!cancelled) {
          setComparison(data);
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
  }, [comparisonId]);

  const copyLink = async () => {
    try {
      await navigator.clipboard?.writeText(reportUrl(`/c/${comparisonId}`));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard access can be denied; the browser still shows the URL.
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-3 py-20 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="font-mono text-sm">{copy.loading}</span>
      </div>
    );
  }

  if (failed || !comparison) {
    return (
      <div className="mx-auto max-w-xl space-y-5 py-20 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-accent" />
        <h1 className="text-3xl font-display font-bold uppercase">{copy.notFoundTitle}</h1>
        <p className="font-mono text-sm leading-relaxed text-gray-600">{copy.notFoundBody}</p>
        <button
          type="button"
          onClick={() => window.location.assign(appBaseUrl())}
          className="inline-flex items-center gap-2 bg-ink px-5 py-3 font-display font-bold uppercase tracking-widest text-paper transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" /> {copy.back}
        </button>
      </div>
    );
  }

  const hosts = comparison.result.sites.map((site) => site.host);
  const title = `${hosts.join(' vs ')} | SiteScanner Pro`;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Helmet>
        <title>{title}</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={reportUrl(`/c/${comparisonId}`)} />
      </Helmet>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {copy.saved} · {new Date(comparison.createdAt).toLocaleString(language)}
            </p>
            <h1 className="mt-1 text-xl font-medium text-gray-900 md:text-2xl">
              {copy.title}
            </h1>
            <p className="mt-1 break-words text-sm text-[#1a73e8]">{hosts.join(' · ')}</p>
            <p className="mt-1 text-xs text-gray-400">
              {copy.ruleset} {comparison.result.rulesetVersion} · SiteScanner Pro
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              {copied ? copy.copied : copy.share}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Printer className="h-4 w-4" /> {copy.print}
            </button>
          </div>
        </div>
      </div>

      <ComparisonView result={comparison.result} t={t} language={language} />

      <p className="text-center text-xs text-gray-400">{copy.expires}</p>

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() => window.location.assign(appBaseUrl())}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" /> {copy.back}
        </button>
      </div>
    </div>
  );
};

export default ComparisonPage;
