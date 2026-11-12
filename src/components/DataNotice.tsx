import React from 'react';
import { Info, ShieldCheck } from 'lucide-react';
import type { Language } from '../i18n/translations';
import { getVerifyCopy } from '../i18n/verifyCopy';

interface DataNoticeProps {
  kind: 'scan' | 'history' | 'monitoring' | 'report';
  language: Language;
  onOpenPrivacy?: () => void;
  className?: string;
}

const DataNotice: React.FC<DataNoticeProps> = ({ kind, language, onOpenPrivacy, className = '' }) => {
  const copy = getVerifyCopy(language).data;

  if (kind === 'history') {
    return (
      <p className={`flex items-start gap-2 font-mono text-[11px] leading-relaxed text-ink/50 ${className}`}>
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>{copy.history}</span>
      </p>
    );
  }

  if (kind === 'report') {
    return (
      <p className={`flex items-start gap-2 text-xs text-gray-500 ${className}`}>
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>{copy.report}</span>
      </p>
    );
  }

  if (kind === 'monitoring') {
    return (
      <div className={`rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs leading-relaxed text-gray-500 ${className}`}>
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          <p>{copy.monitoring}</p>
        </div>
      </div>
    );
  }

  return (
    <aside className={`mt-4 max-w-3xl border border-ink/15 bg-white/70 p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-ink/60">
            {copy.scanTitle}
          </p>
          <ul className="mt-2 space-y-1 font-mono text-[11px] leading-relaxed text-ink/60">
            {copy.scanBullets.map((bullet) => (
              <li key={bullet} className="flex gap-2">
                <span className="text-accent">·</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          {onOpenPrivacy && (
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="mt-2 font-mono text-[10px] uppercase tracking-wider text-accent underline hover:no-underline"
            >
              {copy.privacy}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default DataNotice;
