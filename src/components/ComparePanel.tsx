import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, ExternalLink, Loader2, Printer, RefreshCw, Trophy } from 'lucide-react';
import { apiUrl, reportUrl } from '../api';
import { getCompareCopy } from '../i18n/compareCopy';
import { Language, TranslationSet } from '../i18n/translations';
import type { ComparisonResult } from '../rules/comparison';
import ComparisonView from './ComparisonView';

interface ComparePanelProps {
  baseUrl: string;
  language: Language;
  t: TranslationSet;
}

interface CompareResultState {
  id: string;
  createdAt: string;
  result: ComparisonResult;
}

const ComparePanel: React.FC<ComparePanelProps> = ({
  baseUrl,
  language,
  t
}) => {
  const copy = getCompareCopy(language);
  const [competitors, setCompetitors] = useState<string[]>(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompareResultState | null>(null);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) {
      resultRef.current?.scrollIntoView({ block: 'start' });
    }
  }, [result]);

  const runComparison = async (event: React.FormEvent) => {
    event.preventDefault();
    const competitorsToScan = competitors.map((value) => value.trim()).filter(Boolean);

    if (competitorsToScan.length === 0) {
      setError(copy.needCompetitor);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(apiUrl('/api/compare'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: baseUrl,
          competitors: competitorsToScan,
          language
        }),
        signal: AbortSignal.timeout(120000)
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 504) {
          setError(copy.errorTimeout);
        } else {
          setError(payload?.error || copy.error);
        }
        return;
      }

      if (!payload?.result?.sites || typeof payload.id !== 'string') {
        setError(copy.errorFailed);
        return;
      }

      setResult({
        id: payload.id,
        createdAt: payload.createdAt,
        result: payload.result
      });
      setCopied(false);
    } catch (err) {
      if ((err as Error)?.name === 'TimeoutError' || (err as Error)?.name === 'AbortError') {
        setError(copy.errorTimeout);
      } else {
        setError(copy.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!result) return;
    try {
      await navigator.clipboard?.writeText(reportUrl(`/c/${result.id}`));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard access can be denied; the link remains available in the browser.
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setCopied(false);
    setCompetitors(['', '']);
  };

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-5 md:p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a73e8]/10 text-[#1a73e8]">
            <Trophy className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-medium text-gray-900">{copy.title}</h3>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-500">{copy.subtitle}</p>
          </div>
        </div>

        {result && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              {copied ? copy.copied : copy.share}
            </button>
            <a
              href={reportUrl(`/c/${result.id}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <ExternalLink className="h-4 w-4" />
              {copy.openShare}
            </a>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Printer className="h-4 w-4" />
              {copy.print}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              {copy.newComparison}
            </button>
          </div>
        )}
      </div>

      {!result && !loading && (
        <form onSubmit={runComparison} className="border-t border-gray-200 bg-gray-50 p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                {copy.yourSite}
              </label>
              <input
                type="text"
                value={baseUrl}
                readOnly
                className="mt-1.5 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
              />
            </div>

            {[0, 1].map((index) => (
              <div key={index}>
                <label
                  htmlFor={`competitor-${index}`}
                  className="block text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {copy.competitor} {index + 1}{' '}
                  {index === 1 && <span className="font-normal normal-case text-gray-400">({copy.optional})</span>}
                </label>
                <input
                  id={`competitor-${index}`}
                  type="text"
                  value={competitors[index]}
                  onChange={(event) => {
                    const next = [...competitors];
                    next[index] = event.target.value;
                    setCompetitors(next);
                  }}
                  placeholder={copy.competitorPlaceholder}
                  inputMode="url"
                  autoComplete="url"
                  className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20"
                />
              </div>
            ))}
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-[#1a73e8] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1765cc] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trophy className="h-4 w-4" />
              {copy.run}
            </button>
            <p className="text-xs text-gray-500">{copy.runningHint}</p>
          </div>
        </form>
      )}

      {!result && loading && (
        <div className="border-t border-gray-200 bg-gray-50 p-8 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#1a73e8]" />
          <p className="mt-3 text-sm font-medium text-gray-900">{copy.running}</p>
          <p className="mt-1 text-xs text-gray-500">{copy.runningHint}</p>
        </div>
      )}

      {result && (
        <div ref={resultRef} className="border-t border-gray-200 p-5 md:p-6">
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <ComparisonView result={result.result} t={t} language={language} />
          <p className="mt-4 text-xs text-gray-400">{copy.expires}</p>
        </div>
      )}
    </section>
  );
};

export default ComparePanel;
