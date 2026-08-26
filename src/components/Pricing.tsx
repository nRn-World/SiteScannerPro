import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { TranslationSet } from '../i18n/translations';

interface PricingProps {
  t: TranslationSet;
  isPremium: boolean;
  onCheckout: () => void;
  onStartFree: () => void;
}

const Pricing: React.FC<PricingProps> = ({ t, isPremium, onCheckout, onStartFree }) => {
  const p = t.site.pricing;

  return (
    <section className="w-full">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="eyebrow text-accent mb-3">{p.eyebrow}</p>
        <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">{p.title}</h2>
        <p className="text-muted text-base md:text-lg leading-relaxed">{p.subtitle}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <article className="surface-card p-8 flex flex-col">
          <h3 className="font-display text-xl font-bold">{p.freeName}</h3>
          <p className="mt-1 text-sm text-muted">{p.freeNote}</p>
          <p className="mt-6 font-display text-5xl font-bold tracking-tight">{p.freePrice}</p>
          <ul className="mt-8 space-y-3 flex-1">
            {p.freeFeatures.map(feature => (
              <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed">
                <Check className="w-4 h-4 mt-0.5 text-good shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onStartFree}
            className="mt-8 w-full rounded-full border border-line bg-paper py-3.5 font-semibold hover:border-ink/30 transition-colors"
          >
            {p.ctaFree}
          </button>
        </article>

        <article className="relative surface-card p-8 flex flex-col ring-2 ring-accent/80">
          <span className="absolute -top-3 start-6 inline-flex items-center gap-1.5 rounded-full bg-accent text-white px-3 py-1 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> {p.popular}
          </span>
          <h3 className="font-display text-xl font-bold">{p.proName}</h3>
          <p className="mt-1 text-sm text-muted">{p.proNote}</p>
          <p className="mt-6 font-display text-5xl font-bold tracking-tight">{p.proPrice}</p>
          <ul className="mt-8 space-y-3 flex-1">
            {p.proFeatures.map(feature => (
              <li key={feature} className="flex items-start gap-3 text-sm leading-relaxed">
                <Check className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onCheckout}
            disabled={isPremium}
            className="mt-8 w-full rounded-full bg-accent text-white py-3.5 font-semibold hover:bg-ink transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPremium ? t.nav.premium : p.ctaPro}
          </button>
        </article>
      </div>
    </section>
  );
};

export default Pricing;
