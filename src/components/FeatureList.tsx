import React from 'react';
import { Accessibility, Activity, Code, Gauge, Layers, ShieldCheck } from 'lucide-react';
import { TranslationSet } from '../i18n/translations';

const featureIcons = [Layers, Gauge, ShieldCheck, Accessibility, Code, Activity];

const FeatureList: React.FC<{ t: TranslationSet }> = ({ t }) => {
  return (
    <section className="mt-24 md:mt-32">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
          {t.features.heading} <span className="text-accent">{t.features.headingAccent}</span>
        </h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {featureIcons.map((Icon, idx) => (
          <article
            key={t.features.items[idx].title}
            className="surface-card p-7 hover:-translate-y-0.5 transition-transform"
          >
            <div className="w-11 h-11 rounded-2xl bg-accent-soft text-accent flex items-center justify-center mb-5">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">{t.features.items[idx].title}</h3>
            <p className="text-sm text-muted leading-relaxed">{t.features.items[idx].description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default FeatureList;
