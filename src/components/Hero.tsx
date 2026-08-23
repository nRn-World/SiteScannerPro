import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, ArrowRight, Lock } from 'lucide-react';

interface HeroProps {
  url: string;
  setUrl: (url: string) => void;
  onScan: (e: React.FormEvent) => void;
  error: string | null;
  isScanning: boolean;
}

const Hero: React.FC<HeroProps> = ({ url, setUrl, onScan, error, isScanning }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl"
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white tech-border font-mono text-xs font-bold uppercase mb-8">
        <Lock className="w-4 h-4" />
        <span>Säker & anonym analys</span>
      </div >
      
      <h1 className="text-[12vw] md:text-[7vw] font-display font-bold uppercase leading-[0.85] tracking-tighter mb-8">
        Analysera.<br/>
        <span className="text-accent">Säkra.</span><br/>
        Optimera.
      </h1 >
      
      <p className="font-mono text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
        Ange din webbadress för en heltäckande, AI-driven analys av kodkvalitet, säkerhet, prestanda och SEO.
      </p>

      <form onSubmit={onScan} className="flex flex-col md:flex-row gap-4 max-w-3xl">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Globe className="w-6 h-6 text-ink/50" />
          </div >
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://din-hemsida.se"
            className="w-full tech-border bg-white pl-14 pr-6 py-5 text-xl font-mono outline-none focus:ring-4 focus:ring-accent/20 transition-all"
            required
          />
        </div >
        <button
          type="submit"
          className="bg-ink text-paper px-10 py-5 font-display font-bold text-xl uppercase tracking-widest tech-shadow flex items-center justify-center gap-3 hover:bg-ink/90"
        >
          Skanna <ArrowRight className="w-6 h-6" />
        </button>
      </form>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 bg-white tech-border flex items-start gap-4 max-w-3xl"
        >
          <span className="text-accent">⚠️</span>
          <p className="font-mono text-sm font-bold">{error}</p>
        </motion.div>
      )}

      {/* How it works & Features (simplified for this component) */}
      <div className="mt-32 grid md:grid-cols-3 gap-8 max-w-5xl">
        <div className="bg-white tech-border p-8 tech-shadow">
          <div className="w-12 h-12 bg-ink text-paper flex items-center justify-center tech-border mb-6">
            <span className="font-bold">1</span>
          </div >
          <h3 className="font-display font-bold uppercase text-xl mb-4">Skanna</h3>
          <p className="font-mono text-sm text-ink/70 leading-relaxed">
            Vår motor hämtar din DOM-struktur och analyserar koden i realtid utan att påverka din Core Web Vitals.
          </p>
        </div >
        <div className="bg-white tech-border p-8 tech-shadow">
          <div className="w-12 h-12 bg-accent text-white flex items-center justify-center tech-border mb-6">
            <span className="font-bold">2</span>
          </div >
          <h3 className="font-display font-bold uppercase text-xl mb-4">AI-Analys</h3>
          <p className="font-mono text-sm text-ink/70 leading-relaxed">
            Gemini 3.1 Pro utvärderar säkerhet, prestanda och SEO med sub-millisekunds latens i nätverksrendering.
          </p>
        </div >
        <div className="bg-white tech-border p-8 tech-shadow">
          <div className="w-12 h-12 bg-ink text-paper flex items-center justify-center tech-border mb-6">
            <span className="font-bold">3</span>
          </div >
          <h3 className="font-display font-bold uppercase text-xl mb-4">Åtgärda</h3>
          <p className="font-mono text-sm text-ink/70 leading-relaxed">
            Få en prioriterad lista med exakta kodändringar för att injicera E-E-A-T-signaler och stänga säkerhetshål.
          </p>
        </div >
      </div >
    </motion.div>
  );
};

export default Hero;