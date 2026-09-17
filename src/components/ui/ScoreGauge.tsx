import React from 'react';

export function getScoreColor(score: number): string {
  if (score >= 90) return '#0cce6b';
  if (score >= 50) return '#ffa400';
  return '#ff4e42';
}

interface ScoreGaugeProps {
  score: number;
  label: string;
  size?: number;
  active?: boolean;
  onClick?: () => void;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, label, size = 88, active, onClick }) => {
  const stroke = 5;
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;
  const color = getScoreColor(score);
  const center = size / 2;

  const inner = (
    <>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="block -rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#e8eaed"
            strokeWidth={stroke}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-2xl font-medium tabular-nums"
          style={{ color }}
        >
          {score}
        </span>
      </div>
      <span className="text-xs text-gray-600 font-medium text-center leading-tight max-w-[88px]">{label}</span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${
          active ? 'bg-blue-50 ring-2 ring-blue-500 ring-offset-2' : 'hover:bg-gray-50'
        }`}
      >
        {inner}
      </button>
    );
  }

  return <div className="flex flex-col items-center gap-2 p-2">{inner}</div>;
};

export default ScoreGauge;
