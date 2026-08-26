import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { LANGUAGE_OPTIONS, Language } from '../i18n/translations';

interface LanguageSelectProps {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageSelect: React.FC<LanguageSelectProps> = ({ language, setLanguage }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = LANGUAGE_OPTIONS.find(option => option.code === language) ?? LANGUAGE_OPTIONS[0];

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language"
        onClick={() => setOpen(value => !value)}
        className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-2 text-sm font-medium text-ink/80 hover:border-ink/20 hover:text-ink transition-colors"
      >
        <Globe className="w-4 h-4 text-muted" />
        <span className="hidden md:inline">{current.label}</span>
        <span className="md:hidden uppercase font-mono text-xs">{current.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute end-0 mt-2 w-44 rounded-2xl border border-line bg-surface p-1.5 shadow-xl z-50"
        >
          {LANGUAGE_OPTIONS.map(option => {
            const selected = option.code === language;
            return (
              <li key={option.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setLanguage(option.code);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                    selected ? 'bg-accent-soft text-ink font-semibold' : 'hover:bg-paper text-ink/80'
                  }`}
                >
                  {option.label}
                  {selected && <Check className="w-4 h-4 text-accent" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LanguageSelect;
