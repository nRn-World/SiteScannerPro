import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, Crown, KeyRound, Lock } from 'lucide-react';
import { TranslationSet } from '../i18n/translations';

interface PaywallProps {
  onClose: () => void;
  onCheckout: () => void;
  onActivateLicense: () => void;
  licenseInput: string;
  setLicenseInput: (value: string) => void;
  licenseMessage: string | null;
  isActivatingLicense: boolean;
  t: TranslationSet;
}

const Paywall: React.FC<PaywallProps> = ({
  onClose,
  onCheckout,
  onActivateLicense,
  licenseInput,
  setLicenseInput,
  licenseMessage,
  isActivatingLicense,
  t
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-paper/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white tech-border p-8 md:p-12 max-w-lg w-full tech-shadow relative"
      >
        <div className="absolute -top-6 -right-6 w-16 h-16 bg-accent tech-border flex items-center justify-center transform rotate-12">
          <Crown className="w-8 h-8 text-white" />
        </div >
        <h3 className="text-4xl md:text-5xl font-display font-bold uppercase leading-[0.9] mb-6">
          {t.paywall.title.split('\n').map((line, index) => <React.Fragment key={line}>{index > 0 && <br />}{line}</React.Fragment>)}
        </h3>
        <p className="font-mono text-sm mb-8 leading-relaxed">
          {t.paywall.description}
        </p>
        
        <ul className="font-mono text-sm space-y-0 mb-8 tech-border bg-paper">
          <li className="flex items-center gap-4 p-4 border-b-2 border-ink">
            <span className="text-accent">✓</span>
            <span className="font-bold uppercase">{t.paywall.benefits[0]}</span>
          </li >
          <li className="flex items-center gap-4 p-4 border-b-2 border-ink">
            <span className="text-accent">✓</span>
            <span className="font-bold uppercase">{t.paywall.benefits[1]}</span>
          </li >
          <li className="flex items-center gap-4 p-4">
            <span className="text-accent">✓</span>
            <span className="font-bold uppercase">{t.paywall.benefits[2]}</span>
          </li >
        </ul >

        <button
          onClick={onCheckout}
          className="w-full bg-accent text-white py-5 font-display font-bold text-xl uppercase tracking-widest tech-shadow flex items-center justify-center gap-3 hover:bg-ink transition-colors"
        >
          <Coffee className="w-5 h-5" /> {t.paywall.buy}
        </button>

        <div className="mt-8 tech-border bg-paper p-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-ink text-paper flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold uppercase tracking-wide">
                {t.paywall.codeTitle}
              </h4>
              <p className="font-mono text-xs text-ink/60 mt-1 leading-relaxed">
                {t.paywall.afterPurchase}
              </p>
            </div>
          </div>

          <form
            className="flex flex-col sm:flex-row gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              onActivateLicense();
            }}
          >
            <input
              value={licenseInput}
              onChange={(event) => setLicenseInput(event.target.value.toUpperCase())}
              placeholder={t.paywall.codePlaceholder}
              autoComplete="off"
              spellCheck={false}
              className="flex-1 bg-white tech-border px-4 py-3 font-mono text-sm uppercase outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={isActivatingLicense}
              className="bg-ink text-paper px-5 py-3 font-display font-bold uppercase tracking-widest hover:bg-accent transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {isActivatingLicense ? t.paywall.activating : t.paywall.activate}
            </button>
          </form>

          <AnimatePresence>
            {licenseMessage && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="font-mono text-xs mt-3 text-ink/70"
              >
                {licenseMessage}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-6 font-mono text-sm uppercase font-bold hover:underline"
        >
          {t.paywall.cancel}
        </button>
      </motion.div>
    </div>
  );
};

export default Paywall;