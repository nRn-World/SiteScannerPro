import React from 'react';
import { Gauge, Zap, Eye, MousePointer, Clock, Activity } from 'lucide-react';
import { CoreWebVitals, DeviceMode } from '../../rules/types';
import { TranslationSet } from '../../i18n/translations';
import { getScoreColor } from './ScoreGauge';

interface VitalsPanelProps {
  vitals: CoreWebVitals;
  t: TranslationSet;
  variant?: 'default' | 'lighthouse';
  device?: DeviceMode;
}

function formatMs(ms?: number): string {
  if (ms === undefined) return '–';
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)} s`;
  return `${Math.round(ms)} ms`;
}

function vitalColor(value: number | undefined, good: number, poor: number, invert = false): string {
  if (value === undefined) return '#9aa0a6';
  const ok = invert ? value <= good : value >= good;
  const bad = invert ? value >= poor : value <= poor;
  if (ok) return '#0cce6b';
  if (bad) return '#ff4e42';
  return '#ffa400';
}

const VitalsPanel: React.FC<VitalsPanelProps> = ({ vitals, t, variant = 'default', device = 'mobile' }) => {
  const v = t.dashboard.vitals;
  const isLh = variant === 'lighthouse';
  const subtitle = device === 'mobile' ? v.subtitleMobile : v.subtitleDesktop;

  const metrics = [
    { key: 'LCP', value: formatMs(vitals.lcp), hint: v.lcpHint, color: vitalColor(vitals.lcp, 2500, 4000, true), icon: Zap },
    { key: 'CLS', value: vitals.cls !== undefined ? vitals.cls.toFixed(3) : '–', hint: v.clsHint, color: vitalColor(vitals.cls !== undefined ? vitals.cls * 100 : undefined, 10, 25, true), icon: Eye },
    { key: 'INP', value: formatMs(vitals.inp), hint: v.inpHint, color: vitalColor(vitals.inp, 200, 500, true), icon: MousePointer },
    { key: 'FCP', value: formatMs(vitals.fcp), hint: 'First Contentful Paint', color: vitalColor(vitals.fcp, 1800, 3000, true), icon: Activity },
    { key: 'TTFB', value: formatMs(vitals.ttfb), hint: 'Time to First Byte', color: vitalColor(vitals.ttfb, 800, 1800, true), icon: Clock },
    { key: 'SI', value: formatMs(vitals.speedIndex), hint: 'Speed Index', color: vitalColor(vitals.speedIndex, 3400, 5800, true), icon: Gauge }
  ];

  if (isLh) {
    return (
      <div className="p-5 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-medium text-gray-900">{v.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          </div>
          {vitals.performanceScore !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">{v.perfScore}:</span>
              <span className="font-semibold tabular-nums" style={{ color: getScoreColor(vitals.performanceScore) }}>
                {vitals.performanceScore}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {metrics.map(({ key, value, hint, color, icon: Icon }) => (
            <div key={key} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-semibold text-gray-600">{key}</span>
              </div>
              <span className="text-lg font-medium tabular-nums" style={{ color }}>{value}</span>
              <p className="text-[10px] text-gray-400 mt-1 leading-tight">{hint}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white tech-border p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-display font-bold uppercase">{v.title}</h3>
          <p className="font-mono text-xs text-ink/60 mt-1">{subtitle}</p>
        </div>
        {vitals.performanceScore !== undefined && (
          <div className="flex items-center gap-3 px-4 py-2 bg-paper tech-border">
            <Gauge className="w-5 h-5 text-accent" />
            <div>
              <span className="font-mono text-xs uppercase text-ink/50 block">{v.perfScore}</span>
              <span className="text-3xl font-display font-bold" style={{ color: getScoreColor(vitals.performanceScore) }}>
                {vitals.performanceScore}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map(({ key, value, hint, color, icon: Icon }) => (
          <div key={key} className="p-4 bg-paper tech-border">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-accent" />
              <span className="font-mono text-xs uppercase font-bold">{key}</span>
            </div>
            <span className="text-xl font-display font-bold" style={{ color }}>{value}</span>
            <p className="font-mono text-[10px] text-ink/50 mt-1">{hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VitalsPanel;
