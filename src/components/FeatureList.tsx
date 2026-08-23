import React from 'react';
import { Layers, Network, ShieldCheck, FileJson, Link, Activity } from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: "Edge-Level SEO Injection",
    description: "Validering av Title, H1, Meta och Canonical-taggar direkt på edge-nivå för maximal indexering."
  },
  {
    icon: Network,
    title: "Instant Network Rendering",
    description: "Sub-millisekunds latensanalys av din renderingskedja (CSR, SSR, SSG) för att identifiera flaskhalsar."
  },
  {
    icon: ShieldCheck,
    title: "High-Integrity Content",
    description: "Nativ injicering av E-E-A-T-signaler. Vi analyserar din sidas auktoritet och trovärdighet strukturellt."
  },
  {
    icon: FileJson,
    title: "JSON-LD Schema Auto-Gen",
    description: "Automatisk detektering och rekommendationer för strukturerad data för att dominera rich snippets."
  },
  {
    icon: Link,
    title: "Autonomous Linking & Sitemap",
    description: "Djupanalys av din interna länkstruktur och sitemap-synkronisering för optimal crawl-budget."
  },
  {
    icon: Activity,
    title: "Zero Core Web Vitals Impact",
    description: "Vår fail-closed arkitektur säkerställer att analysen aldrig påverkar din sidas faktiska prestanda."
  }
];

const FeatureList: React.FC = () => {
  return (
    <div className="mt-32 max-w-5xl">
      <h2 className="text-3xl md:text-4xl font-display font-bold uppercase mb-12 text-center">
        Enterprise-Grade <span className="text-accent">Funktioner</span>
      </h2>
      <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-4">
            <feature.icon className="w-6 h-6 text-accent shrink-0 mt-1" />
            <div>
              <h4 className="font-display font-bold uppercase text-lg mb-2">{feature.title}</h4>
              <p className="font-mono text-xs text-ink/70">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureList;