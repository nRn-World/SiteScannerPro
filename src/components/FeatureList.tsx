import React from 'react';
import { Layers, Network, ShieldCheck, FileJson, Link, Activity } from 'lucide-react';
import { TranslationSet } from '../i18n/translations';

const featureIcons = [
  {
    icon: Layers,
    title: 'Edge-Level SEO Injection'
  },
  {
    icon: Network,
    title: 'Instant Network Rendering'
  },
  {
    icon: ShieldCheck,
    title: 'High-Integrity Content'
  },
  {
    icon: FileJson,
    title: 'JSON-LD Schema Auto-Gen'
  },
  {
    icon: Link,
    title: 'Autonomous Linking & Sitemap'
  },
  {
    icon: Activity,
    title: 'Zero Core Web Vitals Impact'
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