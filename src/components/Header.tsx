import React, { useEffect, useState } from 'react';
import { Crown, Menu, X } from 'lucide-react';
import { Language, TranslationSet } from '../i18n/translations';
import { AppView } from '../types/view';
import LanguageSelect from './LanguageSelect';
import Logo from './Logo';

interface HeaderProps {
  view: AppView;
  setView: (view: AppView) => void;
  isPremium: boolean;
  language: Language;
  setLanguage: (language: Language) => void;
  t: TranslationSet;
  onUpgradeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  view,
  setView,
  isPremium,
  language,
  setLanguage,
  t,
  onUpgradeClick,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const go = (next: AppView) => {
    setView(next);
    setMenuOpen(false);
  };

  const navItems: Array<{ id: AppView; label: string }> = [
    { id: 'home', label: t.nav.scanner },
    { id: 'pricing', label: t.nav.pricing },
    { id: 'about', label: t.nav.about },
    { id: 'contact', label: t.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-50 no-print border-b border-line/80 bg-paper/80 backdrop-blur-xl">
      <a href="#main-content" className="skip-link">
        {t.site.actions.skipToContent}
      </a>
      <div className="max-w-7xl mx-auto px-5 sm:px-6 h-[4.25rem] flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => go('home')}
          className="rounded-xl"
          aria-label="SiteScanner Pro"
        >
          <Logo />
        </button>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
          {navItems.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              aria-current={view === item.id ? 'page' : undefined}
              className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-colors ${
                view === item.id ? 'bg-ink text-paper' : 'text-ink/70 hover:text-ink hover:bg-white/70'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelect language={language} setLanguage={setLanguage} />
          {isPremium ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-accent-soft text-accent px-3 py-1.5 text-xs font-bold">
              <Crown className="w-3.5 h-3.5" /> {t.nav.premium}
            </span>
          ) : (
            <button
              type="button"
              onClick={onUpgradeClick}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-ink text-paper px-4 py-2 text-sm font-semibold hover:bg-accent transition-colors"
            >
              {t.site.actions.goPro}
            </button>
          )}
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-line bg-surface"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t.site.actions.close : t.site.actions.menu}
            onClick={() => setMenuOpen(open => !open)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-line bg-paper/95 backdrop-blur-xl">
          <nav className="max-w-7xl mx-auto px-5 py-4 flex flex-col gap-1" aria-label="Mobile">
            {navItems.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                className={`text-start rounded-2xl px-4 py-3 text-base font-semibold ${
                  view === item.id ? 'bg-ink text-paper' : 'hover:bg-white'
                }`}
              >
                {item.label}
              </button>
            ))}
            {!isPremium && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onUpgradeClick();
                }}
                className="mt-2 rounded-2xl bg-accent text-white px-4 py-3 text-base font-semibold"
              >
                {t.site.actions.goPro}
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
