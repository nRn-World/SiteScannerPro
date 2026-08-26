import React from 'react';
import { TranslationSet } from '../i18n/translations';
import { AppView } from '../types/view';
import Logo from './Logo';

interface FooterProps {
  t: TranslationSet;
  setView: (view: AppView) => void;
}

const Footer: React.FC<FooterProps> = ({ t, setView }) => {
  const year = new Date().getFullYear();

  const linkBtn = (view: AppView, label: string) => (
    <button
      type="button"
      onClick={() => setView(view)}
      className="text-sm text-paper/65 hover:text-paper transition-colors text-start"
    >
      {label}
    </button>
  );

  return (
    <footer className="no-print border-t border-line bg-ink text-paper mt-auto">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-14 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5 space-y-4">
          <button type="button" onClick={() => setView('home')} className="rounded-xl">
            <Logo inverted alwaysShowWordmark className="flex items-center gap-3" markClassName="w-9 h-9" />
          </button>
          <p className="text-sm text-paper/65 leading-relaxed max-w-sm">{t.site.footer.tagline}</p>
        </div>

        <div className="md:col-span-2 flex flex-col gap-2.5">
          <p className="eyebrow text-paper/40 mb-1">{t.site.footer.product}</p>
          {linkBtn('home', t.nav.scanner)}
          {linkBtn('pricing', t.nav.pricing)}
          {linkBtn('about', t.nav.about)}
        </div>

        <div className="md:col-span-2 flex flex-col gap-2.5">
          <p className="eyebrow text-paper/40 mb-1">{t.site.footer.company}</p>
          {linkBtn('contact', t.nav.contact)}
          <a href="mailto:bynrnworld@gmail.com" className="text-sm text-paper/65 hover:text-paper transition-colors">
            {t.site.footer.support}
          </a>
        </div>

        <div className="md:col-span-3 flex flex-col gap-2.5">
          <p className="eyebrow text-paper/40 mb-1">{t.site.footer.legal}</p>
          {linkBtn('terms', t.site.footer.terms)}
          {linkBtn('privacy', t.site.footer.privacy)}
          {linkBtn('cookies', t.site.footer.cookies)}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 py-5 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-xs text-paper/45">
          <p>© {year} nRn World. {t.site.footer.rights}</p>
          <p>CC BY-NC 4.0</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
