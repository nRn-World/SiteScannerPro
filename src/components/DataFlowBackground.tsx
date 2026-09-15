import React, { useMemo } from 'react';

interface DataFlowBackgroundProps {
  /** Pausa tunga lager under skanning / när användaren vill ha lugnare UI */
  paused?: boolean;
}

const STREAMS_H = [
  { top: '12%', width: 90, duration: 18, delay: 0 },
  { top: '28%', width: 70, duration: 22, delay: 4 },
  { top: '47%', width: 110, duration: 16, delay: 8 },
  { top: '63%', width: 80, duration: 20, delay: 2 },
  { top: '81%', width: 95, duration: 24, delay: 6 }
];

const STREAMS_V = [
  { left: '18%', height: 140, duration: 14, delay: 1 },
  { left: '42%', height: 180, duration: 17, delay: 5 },
  { left: '67%', height: 120, duration: 12, delay: 3 },
  { left: '88%', height: 160, duration: 15, delay: 7 }
];

/**
 * Lätt bakgrund: statiskt rutnät + få CSS-animationer (ingen Framer Motion / blur).
 */
const DataFlowBackground: React.FC<DataFlowBackgroundProps> = ({ paused = false }) => {
  const reduceMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const animate = !paused && !reduceMotion;

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-30"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(20, 20, 20, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(20, 20, 20, 0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {animate &&
        STREAMS_H.map((s, i) => (
          <div
            key={`h-${i}`}
            className="absolute bg-accent ss-stream-h"
            style={{
              height: 1,
              width: s.width,
              top: s.top,
              left: '-10%',
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`
            }}
          />
        ))}

      {animate &&
        STREAMS_V.map((s, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-gradient-to-b from-transparent via-accent/50 to-transparent ss-stream-v"
            style={{
              height: s.height,
              left: s.left,
              top: '-10%',
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`
            }}
          />
        ))}

      <style>{`
        @keyframes ss-stream-h {
          0% { transform: translateX(0); opacity: 0; }
          10% { opacity: 0.7; }
          90% { opacity: 0.7; }
          100% { transform: translateX(110vw); opacity: 0; }
        }
        @keyframes ss-stream-v {
          0% { transform: translateY(0); opacity: 0; }
          15% { opacity: 0.5; }
          85% { opacity: 0.5; }
          100% { transform: translateY(120vh); opacity: 0; }
        }
        .ss-stream-h { animation-name: ss-stream-h; animation-timing-function: linear; animation-iteration-count: infinite; will-change: transform; }
        .ss-stream-v { animation-name: ss-stream-v; animation-timing-function: linear; animation-iteration-count: infinite; will-change: transform; }
        @media (prefers-reduced-motion: reduce) {
          .ss-stream-h, .ss-stream-v { animation: none !important; }
        }
      `}</style>
    </div>
  );
};

export default React.memo(DataFlowBackground);
