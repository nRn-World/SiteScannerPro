import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, Crown, X } from 'lucide-react';
import { TranslationSet } from '../i18n/translations';

interface PaywallProps {
  onClose: () => void;
  onCheckout: () => void;
  t: TranslationSet;
}

const Paywall: React.FC<PaywallProps> = ({ onClose, onCheckout, t }) => {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm no-print"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        className="bg-surface border border-line rounded-[1.75rem] p-7 md:p-10 max-w-md w-full shadow-2xl relative"
        onClick={event => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 w-9 h-9 rounded-full border border-line flex items-center justify-center hover:bg-paper transition-colors"
          aria-label={t.paywall.cancel}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center mb-5">
          <Crown className="w-6 h-6" />
        </div>

        <h3 id="paywall-title" className="font-display text-3xl font-bold tracking-tight leading-tight mb-3">
          {t.paywall.title.split('\n').map((line, index) => (
            <React.Fragment key={line}>
              {index > 0 && <br />}
              {line}
            </React.Fragment>
          ))}
        </h3>
        <p className="text-muted text-sm leading-relaxed mb-6">{t.paywall.description}</p>

        <ul className="space-y-2.5 mb-8">
          {t.paywall.benefits.map(benefit => (
            <li key={benefit} className="flex items-center gap-3 text-sm font-medium">
              <span className="w-6 h-6 rounded-full bg-accent-soft text-accent flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </span>
              {benefit}
            </li>
          ))}
        </ul>

        <p className="font-display text-4xl font-bold tracking-tight mb-1">99 kr</p>
        <p className="text-xs text-muted mb-6">{t.site.trust.lifetime}</p>

        <button
          type="button"
          onClick={onCheckout}
          className="w-full rounded-full bg-accent text-white py-3.5 font-semibold hover:bg-ink transition-colors"
        >
          {t.paywall.buy}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-3 py-2 text-sm font-semibold text-muted hover:text-ink transition-colors"
        >
          {t.paywall.cancel}
        </button>
      </motion.div>
    </div>
  );
};

export default Paywall;
