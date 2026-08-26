import React from 'react';
import { Layers, Activity, ShieldCheck, Accessibility, Code, Gauge } from 'lucide-react';
import { TranslationSet } from '../i18n/translations';

const featureIcons = [
  {
    icon: Layers,
    title: 'Core SEO Tags'
  },
  {
    icon: Gauge,
    title: 'Server Response Check'
  },
  {
    icon: ShieldCheck,
    title: 'HTTPS & Security Headers'
  },
  {
    icon: Accessibility,
    title: 'Accessibility Basics'
  },
  {
    icon: Code,
    title: 'Code Quality Checks'
  },
  {
    icon: Activity,
    title: 'Zero Impact On Your Site'
  }
];

const FeatureList: React.FC<{ t: TranslationSet }> = ({ t }) => {
  return (
    <div className="mt-32 max-w-5xl">
      <h2 className="text-3xl md:text-4xl font-display font-bold uppercase mb-12 text-center">
        {t.features.heading} <span className="text-accent">{t.features.headingAccent}</span>
      </h2>
      <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
        {featureIcons.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-4">
            <feature.icon className="w-6 h-6 text-accent shrink-0 mt-1" />
            <div>
              <h4 className="font-display font-bold uppercase text-lg mb-2">{t.features.items[idx].title}</h4>
              <p className="font-mono text-xs text-ink/70">{t.features.items[idx].description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureList;