import React from 'react';
import { Activity, Crown } from 'lucide-react';

interface HeaderProps {
  view: string;
  setView: (view: any) => void;
  isPremium: boolean;
}

const Header: React.FC<HeaderProps> = ({ view, setView, isPremium }) => {
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
              <Crown className="w-3.5 h-3.5" /> Premium
            </span >
          )}
        </div >
        <nav className="flex items-center gap-8 text-sm font-mono font-bold uppercase">
          <button 
            onClick={() => setView('home')} 
            className={`hover:text-accent transition-colors ${view === 'home' ? 'text-accent' : ''}`}
          >
            Skanner
          </button>
          <button 
            onClick={() => setView('about')} 
            className={`hover:text-accent transition-colors ${view === 'about' ? 'text-accent' : ''}`}
          >
            Om Oss
          </button>
          <button 
            onClick={() => setView('contact')} 
            className={`hover:text-accent transition-colors ${view === 'contact' ? 'text-accent' : ''}`}
          >
            Kontakt
          </button>
        </nav>
      </div >
    </header>
  );
};

export default Header;