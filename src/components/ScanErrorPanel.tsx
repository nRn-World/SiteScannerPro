import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import type { Language } from '../i18n/translations';
import { getVerifyCopy } from '../i18n/verifyCopy';
import type { ScanFailure } from '../utils/scanErrors';

interface ScanErrorPanelProps {
  failure: ScanFailure;
  language: Language;
  onRetry: () => void;
  onDismiss?: () => void;
  retrying?: boolean;
  hasPreviousResult?: boolean;
}

const ScanErrorPanel: React.FC<ScanErrorPanelProps> = ({
  failure,
  language,
  onRetry,
  onDismiss,
  retrying = false,
  hasPreviousResult = false
}) => {
  const copy = getVerifyCopy(language);
  const showDetail = failure.detail && failure.detail !== failure.message;

  return (
    <section
      className="mx-auto mb-6 max-w-5xl border-2 border-ink bg-white p-5 md:p-6 tech-shadow"
      role="alert"
      aria-labelledby="scan-error-title"
    >
      <div className="flex items-start gap-4">
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink/40">
                {failure.status ? `HTTP ${failure.status} · ` : ''}
                {failure.kind}
              </p>
              <h2 id="scan-error-title" className="mt-1 font-display text-xl font-bold uppercase">
                {failure.title}
              </h2>
            </div>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-ink/40 hover:text-accent"
                aria-label={copy.dismiss}
              >
                <X className="h-3.5 w-3.5" />
                {copy.dismiss}
              </button>
            )}
          </div>

          <p className="mt-2 font-mono text-sm text-ink/70 leading-relaxed">{failure.message}</p>

          {hasPreviousResult && (
            <p className="mt-2 font-mono text-xs text-ink/50">{copy.previousKept}</p>
          )}

          <div className="mt-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink/45">
              {language === 'sv' ? 'Nästa steg' : 'Next steps'}
            </p>
            <ol className="mt-2 space-y-1.5 font-mono text-xs text-ink/70">
              {failure.steps.map((step, index) => (
                <li key={step} className="flex gap-2">
                  <span className="shrink-0 text-accent">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {showDetail && (
            <details className="mt-4 border-t border-gray-200 pt-3">
              <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-ink/40 hover:text-ink/70">
                {copy.technical}
              </summary>
              <p className="mt-2 break-words font-mono text-[11px] text-ink/50">{failure.detail}</p>
            </details>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {failure.retryable && (
              <button
                type="button"
                onClick={onRetry}
                disabled={retrying}
                className="inline-flex items-center gap-2 bg-ink px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wider text-paper transition-colors hover:bg-accent disabled:cursor-wait disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
                {retrying ? copy.retrying : copy.retry}
              </button>
            )}
            {!failure.retryable && onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="inline-flex items-center gap-2 border-2 border-ink px-4 py-2 font-display text-sm font-bold uppercase tracking-wider text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                {copy.dismiss}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScanErrorPanel;
