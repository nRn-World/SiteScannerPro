import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Lock } from 'lucide-react';
import { TranslationSet } from '../i18n/translations';

interface PaywallProps {
  onClose: () => void;
  onCheckout: () => void;
  t: TranslationSet;
}

const Paywall: React.FC<PaywallProps> = ({ onClose, onCheckout, t }) => {
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
          <Lock className="w-5 h-5" /> {t.paywall.buy}
        </button>
        
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