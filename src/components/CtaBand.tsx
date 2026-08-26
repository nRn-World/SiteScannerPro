import React from 'react';
import { ArrowRight } from 'lucide-react';
import { TranslationSet } from '../i18n/translations';

interface CtaBandProps {
  t: TranslationSet;
  onCheckout: () => void;
}

const CtaBand: React.FC<CtaBandProps> = ({ t, onCheckout }) => {
  return (
    <section className="no-print max-w-7xl mx-auto px-5 sm:px-6 pb-16">
      <div className="relative overflow-hidden rounded-[2rem] bg-ink text-paper px-8 py-12 md:px-14 md:py-16">
        <div className="absolute -end-16 -top-16 w-64 h-64 rounded-full bg-accent/30 blur-3xl pointer-events-none" />
        <div className="absolute -start-10 -bottom-20 w-72 h-72 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            {t.site.ctaBand.title}
          </h2>
          <p className="mt-4 text-paper/70 text-base md:text-lg leading-relaxed">{t.site.ctaBand.body}</p>
          <button
            type="button"
            onClick={onCheckout}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent text-white px-6 py-3.5 font-semibold hover:bg-white hover:text-ink transition-colors"
          >
            {t.site.ctaBand.button} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CtaBand;
