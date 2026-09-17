import React from 'react';
import { motion } from 'motion/react';

interface ScanAnimationProps {
  progress?: number;
}

const CATEGORIES = ['SEO', 'PERF', 'SEC', 'A11Y', 'CODE'];

/** Ny skanning-animation – fokusram, laser, orbiter (inte 3D-kub). */
const ScanAnimation: React.FC<ScanAnimationProps> = ({ progress = 0 }) => {
  return (
    <div
      className="relative w-56 h-56 md:w-64 md:h-64 mb-4 select-none"
      data-scan-animation="v3-orbit-laser"
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border-2 border-[#1a73e8]/25"
          animate={{ scale: [1, 1.35 + i * 0.12], opacity: [0.45, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: i * 0.55 }}
        />
      ))}

      <motion.div
        className="absolute inset-3"
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="1" className="text-ink/10" />
          <motion.circle
            cx="100"
            cy="100"
            r="88"
            fill="none"
            stroke="#1a73e8"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="40 512"
            animate={{ rotate: 360 }}
            style={{ transformOrigin: '100px 100px' }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        </svg>

        {CATEGORIES.map((label, i) => {
          const angle = (i / CATEGORIES.length) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const x = 50 + 44 * Math.cos(rad);
          const y = 50 + 44 * Math.sin(rad);
          return (
            <motion.span
              key={label}
              className="absolute font-mono text-[8px] md:text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-700 shadow-sm"
              style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
              animate={{ opacity: [0.35, 1, 0.35], scale: [0.92, 1, 0.92] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.28 }}
            >
              {label}
            </motion.span>
          );
        })}
      </motion.div>

      <div className="absolute inset-10 md:inset-11 bg-white border-2 border-ink rounded-sm shadow-md overflow-hidden">
        {[
          'top-0 left-0 border-t-2 border-l-2',
          'top-0 right-0 border-t-2 border-r-2',
          'bottom-0 left-0 border-b-2 border-l-2',
          'bottom-0 right-0 border-b-2 border-r-2'
        ].map((pos, i) => (
          <motion.div
            key={pos}
            className={`absolute w-4 h-4 border-[#1a73e8] ${pos}`}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}

        <div className="absolute inset-3 flex flex-col gap-1.5 pt-1">
          <div className="flex gap-1 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#1a73e8]" />
            <span className="w-2 h-2 rounded-full bg-ink/20" />
            <span className="w-2 h-2 rounded-full bg-ink/20" />
          </div>
          {[72, 88, 56, 80, 64].map((w, i) => (
            <motion.div
              key={i}
              className="h-1.5 bg-ink/10 rounded-sm"
              style={{ width: `${w}%` }}
              animate={{ opacity: [0.25, 0.7, 0.25] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.12 }}
            />
          ))}
        </div>

        <motion.div
          className="absolute left-0 right-0 h-[2px] z-10"
          style={{
            background: 'linear-gradient(90deg, transparent, #1a73e8, transparent)',
            boxShadow: '0 0 16px 4px rgba(26, 115, 232, 0.45)'
          }}
          animate={{ top: ['8%', '92%', '8%'] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute left-0 right-0 h-8 bg-gradient-to-b from-[#1a73e8]/20 to-transparent pointer-events-none"
          animate={{ top: ['4%', '88%', '4%'] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        className="absolute inset-6 md:inset-7 rounded-full overflow-hidden pointer-events-none"
        style={{ clipPath: 'circle(50% at 50% 50%)' }}
      >
        <motion.div
          className="absolute inset-0 origin-center"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(26,115,232,0.12) 40deg, transparent 80deg)'
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>

      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink/5" />
        <motion.circle
          cx="100"
          cy="100"
          r="96"
          fill="none"
          stroke="#1a73e8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 96}`}
          initial={{ strokeDashoffset: 2 * Math.PI * 96 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 96 * (1 - progress) }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </svg>
    </div>
  );
};

export default ScanAnimation;
