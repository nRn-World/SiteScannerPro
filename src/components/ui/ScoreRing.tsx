import React from 'react';

interface ScoreRingProps {
  score: number;
  size?: number;
  stroke?: number;
  className?: string;
}

export function scoreTone(score: number): { stroke: string; text: string; labelKey: 'excellent' | 'good' | 'needsWork' | 'poor' } {
  if (score >= 85) return { stroke: 'var(--color-good)', text: 'text-good', labelKey: 'excellent' };
  if (score >= 70) return { stroke: '#2f9e44', text: 'text-good', labelKey: 'good' };
  if (score >= 50) return { stroke: 'var(--color-warn)', text: 'text-warn', labelKey: 'needsWork' };
  return { stroke: 'var(--color-bad)', text: 'text-bad', labelKey: 'poor' };
}

const ScoreRing: React.FC<ScoreRingProps> = ({ score, size = 168, stroke = 12, className = '' }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;
  const tone = scoreTone(clamped);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={tone.stroke}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-display font-bold tracking-tight leading-none ${tone.text}`} style={{ fontSize: size * 0.32 }}>
          {Math.round(clamped)}
        </span>
      </div>
    </div>
  );
};

export default ScoreRing;
