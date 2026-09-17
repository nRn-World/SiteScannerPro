import React, { memo, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn } from 'lucide-react';
import { TranslationSet } from '../../i18n/translations';

interface IssueScreenshotProps {
  src: string;
  title: string;
  description?: string;
  t: TranslationSet;
}

const IssueScreenshot: React.FC<IssueScreenshotProps> = ({ src, title, description, t }) => {
  const [expanded, setExpanded] = useState(false);

  const open = useCallback(() => setExpanded(true), []);
  const close = useCallback(() => setExpanded(false), []);

  useEffect(() => {
    if (!expanded) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [expanded, close]);

  if (expanded) {
    return createPortal(
      <>
        <div className="fixed inset-0 z-[200] bg-ink/92" onClick={close} aria-hidden="true" />
        <div
          className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="pointer-events-auto relative max-w-5xl w-full tech-border bg-white">
            <div className="bg-[#E53935] text-white px-4 py-3 flex items-start justify-between gap-4">
              <div>
                <p className="font-display font-bold uppercase">{title}</p>
                {description && <p className="font-mono text-xs mt-1 opacity-90">{description}</p>}
              </div>
              <button
                type="button"
                onClick={close}
                className="shrink-0 w-9 h-9 bg-white text-[#E53935] tech-border flex items-center justify-center hover:bg-paper"
                aria-label={t.dashboard.screenshots.close}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={src}
              alt={title}
              decoding="async"
              className="w-full h-auto max-h-[80vh] object-contain bg-paper"
            />
          </div>
        </div>
      </>,
      document.body
    );
  }

  return (
    <div className="tech-border overflow-hidden bg-paper max-w-2xl">
      <div className="bg-[#E53935] text-white px-4 py-3 border-b-2 border-ink">
        <p className="font-display font-bold uppercase text-sm leading-tight">{title}</p>
        {description && (
          <p className="font-mono text-[11px] mt-1 opacity-90 leading-relaxed line-clamp-2">{description}</p>
        )}
      </div>

      <button
        type="button"
        onClick={open}
        className="group relative w-full block text-left"
        aria-label={t.dashboard.screenshots.viewIssue}
      >
        <img src={src} alt={title} decoding="async" className="w-full h-auto block" />
        <span className="absolute bottom-3 right-3 bg-ink/80 text-paper font-mono text-[10px] uppercase px-2 py-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-3 h-3" /> {t.dashboard.screenshots.viewIssue}
        </span>
      </button>

      <p className="font-mono text-[10px] text-ink/40 uppercase px-3 py-2 border-t border-ink/10">
        {t.dashboard.screenshots.annotatedHint}
      </p>
    </div>
  );
};

export default memo(IssueScreenshot);
