import React, { useState } from 'react';
import { Monitor, Smartphone, ChevronLeft, ChevronRight } from 'lucide-react';
import { DeviceMode, ScanScreenshots } from '../../rules/types';
import { TranslationSet } from '../../i18n/translations';

interface ScreenshotPanelProps {
  screenshots: ScanScreenshots;
  t: TranslationSet;
  variant?: 'default' | 'lighthouse';
  /** Controlled device mode (synced with dashboard toggle) */
  view?: DeviceMode;
  onViewChange?: (view: DeviceMode) => void;
  /** Hide internal tabs when parent already shows device switcher */
  hideTabs?: boolean;
}

const ScreenshotPanel: React.FC<ScreenshotPanelProps> = ({
  screenshots,
  t,
  variant = 'default',
  view: controlledView,
  onViewChange,
  hideTabs = false
}) => {
  const [internalView, setInternalView] = useState<DeviceMode>('mobile');
  const [filmIndex, setFilmIndex] = useState(0);

  const view = controlledView ?? internalView;
  const setView = (next: DeviceMode) => {
    onViewChange?.(next);
    if (controlledView === undefined) setInternalView(next);
  };

  const mainShot = view === 'desktop' ? screenshots.desktop : screenshots.mobile;
  const filmstrip = screenshots.filmstrip ?? [];
  const isLh = variant === 'lighthouse';

  if (!mainShot && !filmstrip.length && !screenshots.desktop && !screenshots.mobile) return null;

  const s = t.dashboard.screenshots;
  const missingLabel = view === 'mobile' ? s.mobileMissing : s.desktopMissing;

  const tabClass = (active: boolean) =>
    isLh
      ? `px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
          active
            ? 'border-[#1a73e8] text-[#1a73e8] bg-white'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        }`
      : `flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold uppercase tech-border transition-colors ${
          active ? 'bg-accent text-white' : 'bg-paper hover:bg-ink/5'
        }`;

  return (
    <div className={isLh ? 'p-5 md:p-6 space-y-4' : 'bg-white tech-border p-6 md:p-8 space-y-6'}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className={isLh ? 'text-base font-medium text-gray-900' : 'text-2xl font-display font-bold uppercase'}>
            {s.title}
          </h3>
          <p className={isLh ? 'text-xs text-gray-500 mt-0.5' : 'font-mono text-xs text-ink/60 mt-1'}>
            {view === 'mobile' ? s.subtitleMobile : s.subtitleDesktop}
          </p>
        </div>
        {!hideTabs && (screenshots.desktop || screenshots.mobile) && (
          <div className={`flex gap-0 ${isLh ? 'border-b border-gray-200' : 'gap-2'}`}>
            <button type="button" onClick={() => setView('mobile')} className={tabClass(view === 'mobile')}>
              {!isLh && <Smartphone className="w-4 h-4" />} {s.mobile}
            </button>
            <button type="button" onClick={() => setView('desktop')} className={tabClass(view === 'desktop')}>
              {!isLh && <Monitor className="w-4 h-4" />} {s.desktop}
            </button>
          </div>
        )}
      </div>

      {mainShot ? (
        <div
          className={
            isLh
              ? `mx-auto overflow-hidden bg-gray-100 rounded-lg border border-gray-200 ${view === 'mobile' ? 'max-w-[390px]' : 'w-full'}`
              : `mx-auto tech-border tech-shadow overflow-hidden bg-paper ${view === 'mobile' ? 'max-w-[390px]' : 'w-full'}`
          }
        >
          <img
            src={mainShot}
            alt={view === 'mobile' ? s.mobilePreview : s.desktopPreview}
            className="w-full h-auto block"
            decoding="async"
          />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
          {missingLabel}
        </div>
      )}

      {filmstrip.length > 1 && view === 'desktop' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={isLh ? 'text-xs font-medium text-gray-500' : 'font-mono text-xs font-bold uppercase tracking-widest text-ink/50'}>
              {s.filmstrip}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFilmIndex((i) => Math.max(0, i - 1))}
                disabled={filmIndex === 0}
                className={isLh ? 'p-1.5 rounded hover:bg-gray-100 disabled:opacity-30' : 'p-2 tech-border bg-paper disabled:opacity-30 hover:bg-ink/5'}
                aria-label={s.prev}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs self-center text-gray-500">{filmIndex + 1} / {filmstrip.length}</span>
              <button
                type="button"
                onClick={() => setFilmIndex((i) => Math.min(filmstrip.length - 1, i + 1))}
                disabled={filmIndex >= filmstrip.length - 1}
                className={isLh ? 'p-1.5 rounded hover:bg-gray-100 disabled:opacity-30' : 'p-2 tech-border bg-paper disabled:opacity-30 hover:bg-ink/5'}
                aria-label={s.next}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className={isLh ? 'overflow-hidden bg-gray-100 rounded-lg border border-gray-200' : 'tech-border overflow-hidden bg-paper'}>
            <img
              src={filmstrip[filmIndex]}
              alt={`${s.filmstrip} ${filmIndex + 1}`}
              className="w-full h-auto block max-h-64 object-cover object-top"
              decoding="async"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenshotPanel;
