import React from 'react';
import { Activity, Crown, Radar, UserRound } from 'lucide-react';
import { LANGUAGE_OPTIONS, Language, TranslationSet } from '../i18n/translations';
import { getAccountCopy } from '../i18n/accountCopy';

interface HeaderProps {
  view: string;
  setView: (view: any) => void;
  isPremium: boolean;
  isVip?: boolean;
  language: Language;
  setLanguage: (language: Language) => void;
  t: TranslationSet;
  onOpenVipOwner?: () => void;
  onRemovePremium?: () => void;
  userEmail?: string | null;
  onOpenAccount?: () => void;
  onOpenMonitors?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  view,
  setView,
  isPremium,
  isVip,
  language,
  setLanguage,
  t,
  onOpenVipOwner,
  onRemovePremium,
  userEmail,
  onOpenAccount,
  onOpenMonitors
}) => {
  const account = getAccountCopy(language);

  const goHome = () => {
    // Always return to the app root, even from a saved report permalink.
    const base = ((import.meta.env.BASE_URL as string | undefined) || '/').replace(/\/$/, '');
    window.location.replace(`${window.location.origin}${base}/`);
  };

  return (
    <header className="tech-border-b bg-paper sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <div
          className="flex items-center gap-2 sm:gap-4 cursor-pointer"
          onClick={goHome}
          role="link"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              goHome();
            }
          }}
          aria-label="SiteScanner Pro"
          title="SiteScanner Pro"
        >
          <div className="w-10 h-10 bg-ink text-paper flex items-center justify-center tech-border">
            <Activity className="w-6 h-6" />
          </div>
          <span className="text-2xl font-display font-bold tracking-tighter uppercase hidden sm:block">
            SiteScanner <span className="text-accent">Pro<span className="animate-cursor-blink">_</span></span>
          </span>
          {isPremium && (
            <button
              type="button"
              className="ml-2 inline-flex items-center gap-1 px-3 py-1 bg-accent text-white text-xs font-mono font-bold uppercase tech-border hover:brightness-110 transition-[filter]"
              title={t.nav.removePremium}
              aria-label={t.nav.removePremium}
              onClick={(event) => {
                event.stopPropagation();
                onRemovePremium?.();
              }}
            >
              <Crown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isVip ? 'VIP' : t.nav.premium}</span>
            </button>
          )}
        </div>
        <nav className="flex items-center gap-2 text-sm font-mono font-bold uppercase lg:gap-6">
          <button
            onClick={() => setView('home')}
            aria-label={t.nav.scanner}
            className={`hover:text-accent transition-colors ${view === 'home' ? 'text-accent' : ''}`}
          >
            {t.nav.scanner}
          </button>
          {onOpenMonitors && (
            <button
              type="button"
              onClick={onOpenMonitors}
              aria-label={account.monitors}
              title={account.monitors}
              className={`inline-flex items-center gap-1.5 hover:text-accent transition-colors ${view === 'monitors' ? 'text-accent' : ''}`}
            >
              <Radar className="w-4 h-4" />
              <span className="hidden lg:inline">{account.monitors}</span>
            </button>
          )}
          {onOpenAccount && (
            <button
              type="button"
              onClick={onOpenAccount}
              aria-label={account.account}
              title={userEmail || account.account}
              className="inline-flex min-w-0 items-center gap-1.5 hover:text-accent transition-colors"
            >
              <UserRound className="w-4 h-4 shrink-0" />
              <span className="hidden max-w-[120px] truncate xl:inline">
                {userEmail || account.account}
              </span>
            </button>
          )}
          <select aria-label={t.languageName} value={language} onChange={(event) => setLanguage(event.target.value as Language)} className="bg-paper tech-border px-1.5 py-2 text-xs font-mono font-bold uppercase lg:px-2">
            {LANGUAGE_OPTIONS.map(option => <option key={option.code} value={option.code}>{option.label}</option>)}
          </select>
          <button
            onClick={() => setView('about')}
            className={`hidden lg:inline-block hover:text-accent transition-colors ${view === 'about' ? 'text-accent' : ''}`}
          >
            {t.nav.about}
          </button>
          <button
            onClick={() => setView('contact')}
            className={`hidden lg:inline-block hover:text-accent transition-colors ${view === 'contact' ? 'text-accent' : ''}`}
          >
            {t.nav.contact}
          </button>
          {onOpenVipOwner && (
            <button
              type="button"
              onClick={onOpenVipOwner}
              className="text-ink/25 hover:text-accent transition-colors text-[10px] tracking-widest"
              title={t.vip.ownerTitle}
            >
              VIP
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
