import React from 'react';
import { Globe } from 'lucide-react';
import { TranslationSet } from '../i18n/translations';

interface ScanningStateProps {
  url: string;
  scanStep: number;
  scanSteps: string[];
  t: TranslationSet;
}

/** Lätt skannings-UI: CSS-spinner utan 3D/blur/Framer Motion. */
const ScanningState: React.FC<ScanningStateProps> = ({ url, scanStep, scanSteps, t }) => {
  const progress = scanSteps.length > 0 ? (scanStep + 1) / scanSteps.length : 0;

  return (
    <div className="flex flex-col items-center justify-center py-20 md:py-28">
      <div
        className="relative w-20 h-20 mb-10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        aria-label={scanSteps[scanStep]}
      >
        <div className="absolute inset-0 rounded-full border-2 border-ink/10" />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent border-r-accent/40 ss-scan-spin"
          style={{ willChange: 'transform' }}
        />
        <div className="absolute inset-3 rounded-full border border-ink/10" />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(#1a73e8 ${progress * 360}deg, transparent 0deg)`,
            opacity: 0.15,
            mask: 'radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 5px))',
            WebkitMask:
              'radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 5px))'
          }}
        />
      </div>

      <div className="flex justify-center gap-1.5 mb-6">
        {scanSteps.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-[width,background-color] duration-300 ${
              i <= scanStep ? 'bg-accent w-7' : 'bg-ink/10 w-2'
            }`}
          />
        ))}
      </div>

      <p className="font-display font-bold text-xl md:text-2xl uppercase tracking-widest text-center leading-tight px-4 min-h-[2.5rem]">
        {scanSteps[scanStep]}
      </p>

      <div className="mt-6 font-mono text-xs uppercase tracking-widest text-ink/50 flex items-center gap-2 max-w-lg text-center">
        <Globe className="w-4 h-4 text-accent shrink-0" />
        <span className="truncate">
          {t.scanning.target} {url}
        </span>
      </div>

      <style>{`
        @keyframes ss-scan-spin {
          to { transform: rotate(360deg); }
        }
        .ss-scan-spin {
          animation: ss-scan-spin 0.9s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .ss-scan-spin { animation: none; border-top-color: #1a73e8; }
        }
      `}</style>
    </div>
  );
};

export default ScanningState;
