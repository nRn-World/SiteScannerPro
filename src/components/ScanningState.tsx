import React from 'react';
import { Globe } from 'lucide-react';
import { TranslationSet } from '../i18n/translations';
import LoadingState, { LoadingStateVariant } from './ui/loading-state';

interface ScanningStateProps {
  url: string;
  scanStep: number;
  scanSteps: string[];
  t: TranslationSet;
}

/** Mappar analyssteg till pixel-loader-variant för tydlig progression. */
function variantForStep(step: number, total: number): LoadingStateVariant {
  const ratio = total > 1 ? step / (total - 1) : 0;
  if (ratio < 0.34) return 'Drive';
  if (ratio < 0.67) return 'Dots';
  return 'Orbit';
}

const ScanningState: React.FC<ScanningStateProps> = ({ url, scanStep, scanSteps, t }) => {
  const progress = scanSteps.length > 0 ? (scanStep + 1) / scanSteps.length : 0;
  const label = (scanSteps[scanStep] ?? '').replace(/\.\.\.$/, '').trim() || 'Analyserar';
  const variant = variantForStep(scanStep, scanSteps.length);

  return (
    <div className="flex flex-col items-center justify-center py-20 md:py-28 px-4">
      <div
        className="w-full max-w-md border-2 border-ink bg-paper tech-shadow px-6 py-8 md:px-8 md:py-10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        aria-label={label}
      >
        <div className="flex items-center justify-between gap-3 mb-8">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink/40">
            SiteScanner
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-accent">
            {Math.round(progress * 100)}%
          </span>
        </div>

        <div className="flex justify-center mb-8">
          <LoadingState
            label={label}
            variant={variant}
            size="lg"
          />
        </div>

        <div className="h-[3px] w-full bg-ink/10 mb-6 overflow-hidden">
          <div
            className="h-full bg-accent transition-[width] duration-500 ease-out"
            style={{ width: `${Math.max(8, progress * 100)}%` }}
          />
        </div>

        <div className="flex justify-center gap-1.5 mb-6">
          {scanSteps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-[width,background-color] duration-300 ${
                i <= scanStep ? 'bg-accent w-6' : 'bg-ink/15 w-2'
              }`}
            />
          ))}
        </div>

        <div className="font-mono text-[11px] uppercase tracking-widest text-ink/45 flex items-center justify-center gap-2 text-center">
          <Globe className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden />
          <span className="truncate max-w-[min(100%,28rem)]">
            {t.scanning.target} {url}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScanningState;
