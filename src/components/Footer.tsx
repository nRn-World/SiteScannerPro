import React from 'react';
import { Language } from '../i18n/translations';

export type FooterTarget = 'terms' | 'privacy' | 'cookies' | 'contact' | 'about';

interface FooterProps {
  language: Language;
  onNavigate: (target: FooterTarget) => void;
}

const COPY = {
  sv: {
    product: 'SiteScanner Pro',
    tagline: 'Mätbart, repeterbart och spårbart – webbplatsens hälsa i en rapport.',
    terms: 'Användarvillkor',
    privacy: 'Integritet',
    cookies: 'Cookies',
    contact: 'Kontakt',
    about: 'Om oss',
    rights: '© 2026 nRn World. Alla rättigheter förbehållna.'
  },
  en: {
    product: 'SiteScanner Pro',
    tagline: 'Measurable, repeatable and traceable — your website health in one report.',
    terms: 'Terms',
    privacy: 'Privacy',
    cookies: 'Cookies',
    contact: 'Contact',
    about: 'About',
    rights: '© 2026 nRn World. All rights reserved.'
  }
};

const Footer: React.FC<FooterProps> = ({ language, onNavigate }) => {
  const text = COPY[language === 'sv' ? 'sv' : 'en'];

  return (
    <footer className="relative z-10 border-t-2 border-ink bg-paper mt-16">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <p className="font-display font-bold uppercase tracking-tight text-lg">
            {text.product}
          </p>
          <p className="font-mono text-xs text-ink/55 mt-1 max-w-md">{text.tagline}</p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs font-bold uppercase">
          <button type="button" onClick={() => onNavigate('about')} className="hover:text-accent transition-colors">
            {text.about}
          </button>
          <button type="button" onClick={() => onNavigate('contact')} className="hover:text-accent transition-colors">
            {text.contact}
          </button>
          <button type="button" onClick={() => onNavigate('terms')} className="hover:text-accent transition-colors">
            {text.terms}
          </button>
          <button type="button" onClick={() => onNavigate('privacy')} className="hover:text-accent transition-colors">
            {text.privacy}
          </button>
          <button type="button" onClick={() => onNavigate('cookies')} className="hover:text-accent transition-colors">
            {text.cookies}
          </button>
          <a href="mailto:bynrnworld@gmail.com" className="hover:text-accent transition-colors">
            bynrnworld@gmail.com
          </a>
        </nav>
      </div>
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <p className="font-mono text-[10px] text-ink/40 uppercase tracking-wider">{text.rights}</p>
      </div>
    </footer>
  );
};

export default Footer;
