import React from 'react';
import { motion } from 'motion/react';
import { Check, LoaderCircle } from 'lucide-react';
import { TranslationSet } from '../i18n/translations';

interface ScanningStateProps {
  url: string;
  scanStep: number;
  scanSteps: string[];
  t: TranslationSet;
}

const ScanningState: React.FC<ScanningStateProps> = ({ url, scanStep, scanSteps, t }) => {
  const progress = Math.round(((scanStep + 1) / scanSteps.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-xl mx-auto py-10 md:py-16"
    >
      <div className="relative mx-auto w-36 h-36 mb-10">
        <span className="absolute inset-3 rounded-full border border-accent/30 animate-pulse-ring" />
        <span className="absolute inset-0 rounded-full border border-accent/20 animate-pulse-ring" style={{ animationDelay: '0.7s' }} />
        <div className="absolute inset-6 rounded-full bg-surface border border-line shadow-inner overflow-hidden flex items-center justify-center">
          <span className="absolute inset-x-3 top-0 h-px bg-accent shadow-[0_0_16px_var(--color-accent)] animate-scan-line" />
          <LoaderCircle className="w-8 h-8 text-accent animate-spin" />
        </div>
      </div>

      <p className="text-center font-mono text-xs text-muted mb-2">{t.scanning.target}</p>
      <p className="text-center font-semibold mb-8 break-all px-4">{url}</p>

      <div className="surface-card p-6">
        <div className="flex items-center justify-between text-xs font-semibold text-muted mb-2">
          <span>{scanSteps[scanStep]}</span>
          <span className="tabular-nums">{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-line overflow-hidden mb-6">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <ol className="space-y-2.5">
          {scanSteps.map((step, index) => {
            const done = index < scanStep;
            const active = index === scanStep;
            return (
              <li
                key={step}
                className={`flex items-center gap-3 text-sm ${
                  active ? 'text-ink font-semibold' : done ? 'text-muted' : 'text-ink/30'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    done
                      ? 'bg-good-soft text-good'
                      : active
                        ? 'bg-accent-soft text-accent'
                        : 'bg-paper border border-line'
                  }`}
                >
                  {done ? <Check className="w-3.5 h-3.5" /> : <span className="text-[10px] font-bold">{index + 1}</span>}
                </span>
                <span className="leading-snug">{step.replace(/\.\.\.$/, '')}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </motion.div>
  );
};

export default ScanningState;
