import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Lock } from 'lucide-react';

interface PaywallProps {
  onClose: () => void;
  onCheckout: () => void;
}

const Paywall: React.FC<PaywallProps> = ({ onClose, onCheckout }) => {
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
          Premium<br/>Krävs.
        </h3>
        <p className="font-mono text-sm mb-8 leading-relaxed">
          Du har förbrukat din kostnadsfria analys. Lås upp obegränsad tillgång för att fortsätta säkra dina webbplatser.
        </p>
        
        <ul className="font-mono text-sm space-y-0 mb-8 tech-border bg-paper">
          <li className="flex items-center gap-4 p-4 border-b-2 border-ink">
            <span className="text-accent">✓</span>
            <span className="font-bold uppercase">Obegränsade analyser</span>
          </li >
          <li className="flex items-center gap-4 p-4 border-b-2 border-ink">
            <span className="text-accent">✓</span>
            <span className="font-bold uppercase">Avancerad säkerhet</span>
          </li >
          <li className="flex items-center gap-4 p-4">
            <span className="text-accent">✓</span>
            <span className="font-bold uppercase">Prioriterad AI-modell</span>
          </li >
        </ul >

        <button
          onClick={onCheckout}
          className="w-full bg-accent text-white py-5 font-display font-bold text-xl uppercase tracking-widest tech-shadow flex items-center justify-center gap-3 hover:bg-ink transition-colors"
        >
          <Lock className="w-5 h-5" /> Köp (499 kr)
        </button>
        
        <button
          onClick={onClose}
          className="w-full mt-6 font-mono text-sm uppercase font-bold hover:underline"
        >
          Avbryt
        </button>
      </motion.div>
    </div>
  );
};

export default Paywall;