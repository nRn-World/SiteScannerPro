import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity } from 'lucide-react';

interface ScanningStateProps {
  url: string;
  scanStep: number;
  scanSteps: string[];
}

const ScanningState: React.FC<ScanningStateProps> = ({ url, scanStep, scanSteps }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-32"
    >
      {/* 3D Wireframe Cube Scanner */}
      <div className="relative w-32 h-32 mb-24" style={{ perspective: '1000px' }}>
        <motion.div
          animate={{ rotateX: [0, 360], rotateY: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-full h-full relative"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Cube Faces */}
          <div className="absolute inset-0 border-2 border-accent bg-accent/10 flex items-center justify-center backdrop-blur-sm" style={{ transform: 'translateZ(64px)' }}>
            <span className="text-accent opacity-50">🔍</span>
          </div >
          <div className="absolute inset-0 border-2 border-ink bg-ink/5 backdrop-blur-sm" style={{ transform: 'rotateY(180deg) translateZ(64px)' }} />
          <div className="absolute inset-0 border-2 border-ink bg-ink/5 backdrop-blur-sm" style={{ transform: 'rotateY(-90deg) translateZ(64px)' }} />
          <div className="absolute inset-0 border-2 border-accent bg-accent/10 backdrop-blur-sm" style={{ transform: 'rotateY(90deg) translateZ(64px)' }} />
          <div className="absolute inset-0 border-2 border-ink bg-ink/5 backdrop-blur-sm" style={{ transform: 'rotateX(90deg) translateZ(64px)' }} />
          <div className="absolute inset-0 border-2 border-accent bg-accent/10 backdrop-blur-sm" style={{ transform: 'rotateX(-90deg) translateZ(64px)' }} />
        </motion.div>
        
        {/* Floor Grid Reflection */}
        <div className="absolute -bottom-16 -inset-x-16 h-16 bg-gradient-to-t from-transparent to-accent/20 blur-xl transform rotate-x-60" style={{ transform: 'rotateX(75deg)' }}></div >
      </div >
      
      <div className="relative w-full max-w-lg">
        {/* Scanning Laser over text */}
        <motion.div 
          animate={{ top: ['-10%', '110%', '-10%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -inset-x-4 md:-inset-x-12 h-1 bg-accent z-20 shadow-[0_0_20px_rgba(242,125,38,1)] pointer-events-none"
        />
        
        <div className="h-24 md:h-32 overflow-hidden relative w-full text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={scanStep}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              className="font-display font-bold text-2xl md:text-3xl uppercase tracking-widest absolute inset-0 flex items-center justify-center leading-tight px-4"
            >
              {scanSteps[scanStep]}
            </motion.p>
          </AnimatePresence>
        </div >
      </div >
      
      <div className="mt-8 font-mono text-sm uppercase tracking-widest text-ink/50 flex items-center gap-2">
        <Activity className="w-4 h-4 animate-pulse text-accent" />
        Mål: {url}
      </div >
    </motion.div>
  );
};

export default ScanningState;