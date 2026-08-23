import React from 'react';
import { Activity, Crown } from 'lucide-react';
import { LANGUAGE_OPTIONS, Language, TranslationSet } from '../i18n/translations';

interface HeaderProps {
  view: string;
  setView: (view: any) => void;
  isPremium: boolean;
  language: Language;
  setLanguage: (language: Language) => void;
  t: TranslationSet;
}

const Header: React.FC<HeaderProps> = ({ view, setView, isPremium, language, setLanguage, t }) => {
  return (
    <header className="tech-border-b bg-paper sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div 
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => setView('home')}
        >
          <div className="w-10 h-10 bg-ink text-paper flex items-center justify-center tech-border">
            <Activity className="w-6 h-6" />
          </div >
          <span className="text-2xl font-display font-bold tracking-tighter uppercase hidden sm:block">
            SiteScanner <span className="text-accent">Pro_</span>
          </span >
          {isPremium && (
            <span className="ml-2 inline-flex items-center gap-1 px-3 py-1 bg-accent text-white text-xs font-mono font-bold uppercase tech-border">
              <Crown className="w-3.5 h-3.5" /> {t.nav.premium}
            </span >
          )}
        </div >
        <nav className="flex items-center gap-8 text-sm font-mono font-bold uppercase">
          <button 
            onClick={() => setView('home')} 
            className={`hover:text-accent transition-colors ${view === 'home' ? 'text-accent' : ''}`}
          >
            {t.nav.scanner}
          </button>
          <select aria-label="Language" value={language} onChange={(event) => setLanguage(event.target.value as Language)} className="bg-paper tech-border px-2 py-2 text-xs font-mono font-bold uppercase">
            {LANGUAGE_OPTIONS.map(option => <option key={option.code} value={option.code}>{option.label}</option>)}
          </select>
          <button 
            onClick={() => setView('about')} 
            className={`hover:text-accent transition-colors ${view === 'about' ? 'text-accent' : ''}`}
          >
            {t.nav.about}
          </button>
          <button 
            onClick={() => setView('contact')} 
            className={`hover:text-accent transition-colors ${view === 'contact' ? 'text-accent' : ''}`}
          >
            {t.nav.contact}
          </button>
        </nav>
      </div >
    </header>
  );
};

export default Header;