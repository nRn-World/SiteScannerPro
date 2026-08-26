import React from 'react';
import { LucideIcon } from 'lucide-react';
import { TranslationSet } from '../../i18n/translations';
import { scoreTone } from './ScoreRing';

interface MetricBoxProps {
  score: number;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  isActive: boolean;
  t: TranslationSet;
}

const MetricBox: React.FC<MetricBoxProps> = ({ score, label, icon: Icon, onClick, isActive, t }) => {
  const tone = scoreTone(score);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`surface-card p-5 text-start transition-all duration-200 hover:-translate-y-0.5 ${
        isActive ? 'ring-2 ring-accent' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-6">
        <span className="text-xs font-bold tracking-wide text-muted uppercase">{label}</span>
        <Icon className={`w-5 h-5 ${tone.text}`} />
      </div>
      <span className={`font-display text-4xl md:text-5xl font-bold tracking-tight tabular-nums ${tone.text}`}>
        {score}
      </span>
      <div className="mt-4 h-1.5 rounded-full bg-line overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: tone.stroke }} />
      </div>
      <span className={`block mt-3 text-[11px] font-semibold ${isActive ? 'text-accent' : 'text-muted'}`}>
        {isActive ? t.dashboard.details : t.dashboard.clickForDetails}
      </span>
    </button>
  );
};

export default MetricBox;
