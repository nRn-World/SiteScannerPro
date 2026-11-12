import React from 'react';
import { Check, SlidersHorizontal, Smartphone, Monitor, Layers } from 'lucide-react';
import type { Language } from '../i18n/translations';
import { getVerifyCopy } from '../i18n/verifyCopy';
import {
  DEFAULT_SCAN_OPTIONS,
  SCAN_CATEGORIES,
  type ScanCategory,
  type ScanRunOptions
} from '../utils/scanOptions';

interface ScanOptionsPanelProps {
  value: ScanRunOptions;
  onChange: (value: ScanRunOptions) => void;
  language: Language;
}

type DeviceScope = 'both' | 'mobile' | 'desktop';

function scopeOf(value: ScanRunOptions): DeviceScope {
  if (value.devices.length === 1) return value.devices[0];
  return 'both';
}

const DEVICE_LABELS: Record<DeviceScope, 'both' | 'mobile' | 'desktop'> = {
  both: 'both',
  mobile: 'mobile',
  desktop: 'desktop'
};

const ScanOptionsPanel: React.FC<ScanOptionsPanelProps> = ({ value, onChange, language }) => {
  const copy = getVerifyCopy(language).options;
  const scope = scopeOf(value);

  const setScope = (next: DeviceScope) => {
    const devices: ScanRunOptions['devices'] =
      next === 'both' ? [...DEFAULT_SCAN_OPTIONS.devices] : [next];
    onChange({ ...value, devices });
  };

  const toggleCategory = (category: ScanCategory) => {
    const selected = value.categories.includes(category);
    if (selected && value.categories.length === 1) return;
    onChange({
      ...value,
      categories: selected
        ? value.categories.filter((item) => item !== category)
        : [...value.categories, category]
    });
  };

  const deviceButtonClass = (active: boolean) =>
    `inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
      active
        ? 'bg-ink text-paper border-ink'
        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
    }`;

  const categoryLabel = (category: ScanCategory) => {
    switch (category) {
      case 'SEO':
        return 'SEO';
      case 'Performance':
        return language === 'sv' ? 'Prestanda' : 'Performance';
      case 'Security':
        return language === 'sv' ? 'Säkerhet' : 'Security';
      case 'Accessibility':
        return language === 'sv' ? 'Tillgänglighet' : 'Accessibility';
      case 'Code':
        return language === 'sv' ? 'Kod' : 'Code';
    }
  };

  return (
    <section className="mt-6 max-w-3xl bg-white tech-border p-4 md:p-5" aria-labelledby="scan-options-title">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-paper">
          <SlidersHorizontal className="h-4 w-4" />
        </span>
        <div>
          <h2 id="scan-options-title" className="font-display text-base font-bold uppercase tracking-wide">
            {copy.title}
          </h2>
          <p className="mt-1 font-mono text-xs text-ink/60 leading-relaxed">{copy.subtitle}</p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-ink/50">
            {copy.device}
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label={copy.device}>
            {(['both', 'mobile', 'desktop'] as DeviceScope[]).map((option) => {
              const Icon = option === 'mobile' ? Smartphone : option === 'desktop' ? Monitor : Layers;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setScope(option)}
                  aria-pressed={scope === option}
                  className={deviceButtonClass(scope === option)}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {copy[DEVICE_LABELS[option]]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-ink/50">
            {copy.categories}
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label={copy.categories}>
            {SCAN_CATEGORIES.map((category) => {
              const active = value.categories.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    active
                      ? 'bg-accent/10 text-ink border-accent'
                      : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {active && <Check className="h-3.5 w-3.5 text-accent" />}
                  {categoryLabel(category)}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 font-mono text-[10px] text-ink/45">{copy.categoryHint}</p>
        </div>

        <div className="flex items-start justify-between gap-4 border-t border-gray-200 pt-4">
          <div>
            <p className="font-mono text-xs font-bold text-ink">{copy.thorough}</p>
            <p className="mt-0.5 font-mono text-[10px] text-ink/50 leading-relaxed">
              {copy.thoroughHint}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={value.thorough}
            aria-label={copy.thorough}
            onClick={() => onChange({ ...value, thorough: !value.thorough })}
            className={`relative h-6 w-11 shrink-0 rounded-full border-2 transition-colors ${
              value.thorough ? 'bg-accent border-accent' : 'bg-gray-200 border-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-[left] ${
                value.thorough ? 'left-5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        <p className="font-mono text-[10px] uppercase tracking-wider text-ink/40">
          {copy.scope(copy[DEVICE_LABELS[scope]], value.categories.length)}
          {' · '}
          {value.thorough ? copy.thorough : language === 'sv' ? 'Snabb' : 'Fast'}
        </p>
      </div>
    </section>
  );
};

export default ScanOptionsPanel;
