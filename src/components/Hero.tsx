import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Globe, Lock, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { TranslationSet } from '../i18n/translations';

interface HeroProps {
  url: string;
  setUrl: (url: string) => void;
  onScan: (e: React.FormEvent) => void;
  error: string | null;
  isScanning: boolean;
  t: TranslationSet;
}

const Hero: React.FC<HeroProps> = ({ url, setUrl, onScan, error, isScanning, t }) => {
  const metrics = [
    { label: t.dashboard.categories.SEO, score: 92 },
    { label: t.dashboard.categories.Performance, score: 74 },
    { label: t.dashboard.categories.Security, score: 88 },
    { label: t.dashboard.categories.Accessibility, score: 67 },
    { label: t.dashboard.categories.Code, score: 81 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 mb-7 shadow-sm">
            <Lock className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-semibold tracking-wide text-ink/70">{t.hero.secure}</span>
          </div>

          <h1 className="font-display font-bold tracking-tight text-[2.6rem] sm:text-6xl md:text-7xl leading-[0.95] mb-6">
            {t.hero.title[0]}
            <br />
            <span className="text-accent">{t.hero.title[1]}</span>
            <br />
            {t.hero.title[2]}
          </h1>

          <p className="text-muted text-lg md:text-xl max-w-xl leading-relaxed mb-10">{t.hero.description}</p>

          <form id="scan-form" onSubmit={onScan} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none">
                <Globe className="w-5 h-5 text-muted" />
              </div>
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder={t.hero.urlPlaceholder}
                className="w-full rounded-full border border-line bg-surface ps-12 pe-5 py-4 text-base md:text-lg outline-none shadow-sm focus:border-accent/50 focus:ring-4 focus:ring-accent/15 transition-all"
                required
                autoComplete="url"
                inputMode="url"
              />
            </div>
            <button
              type="submit"
              disabled={isScanning}
              className="rounded-full bg-ink text-paper px-7 py-4 font-semibold text-base md:text-lg flex items-center justify-center gap-2 hover:bg-accent transition-colors disabled:opacity-60"
            >
              {t.hero.scan} <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 max-w-2xl rounded-2xl border border-bad/20 bg-bad-soft px-4 py-3 text-sm font-medium text-bad"
              role="alert"
            >
              {error}
            </motion.div>
          )}

          <ul className="mt-8 flex flex-wrap gap-2.5">
            {[t.site.trust.anonymous, t.site.trust.noInstall, t.site.trust.noAccount, t.site.trust.lifetime].map(item => (
              <li
                key={item}
                className="rounded-full bg-white/70 border border-line px-3 py-1.5 text-xs font-medium text-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="absolute -inset-6 rounded-[2rem] bg-accent/10 blur-2xl pointer-events-none" />
          <div className="relative surface-card p-6 md:p-7 animate-float-soft">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="eyebrow mb-1">{t.site.preview.livePreview}</p>
                <p className="font-mono text-sm text-ink/80">{t.site.preview.sampleHost}</p>
              </div>
              <div className="text-end">
                <p className="font-display text-4xl font-bold tracking-tight leading-none">82</p>
                <p className="text-xs font-semibold text-good mt-1">{t.site.score.good}</p>
              </div>
            </div>
            <div className="space-y-3.5">
              {metrics.map(metric => (
                <div key={metric.label}>
                  <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-ink/70">{metric.label}</span>
                    <span className="tabular-nums">{metric.score}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-line overflow-hidden">
                    <div
                      className="h-full rounded-full bg-ink"
                      style={{
                        width: `${metric.score}%`,
                        background:
                          metric.score >= 85 ? 'var(--color-good)' : metric.score >= 70 ? '#2f9e44' : 'var(--color-warn)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between rounded-2xl bg-paper px-4 py-3 text-sm">
              <span className="font-medium">3 {t.site.preview.issues}</span>
              <span className="inline-flex items-center gap-1.5 text-accent font-semibold">
                <Sparkles className="w-4 h-4" /> Premium
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24 grid md:grid-cols-3 gap-5">
        {t.hero.steps.map((step, index) => {
          const Icon = [Globe, ShieldCheck, Zap][index] ?? Globe;
          return (
            <div key={step.title} className="surface-card p-7">
              <div className="flex items-center justify-between mb-6">
                <span className="w-11 h-11 rounded-2xl bg-ink text-paper flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="font-display text-3xl font-bold text-ink/12">0{index + 1}</span>
              </div>
              <h3 className="font-display font-bold text-xl mb-2">{step.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{step.description}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Hero;
