import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricBoxProps {
  score: number;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  isActive: boolean;
}

const MetricBox: React.FC<MetricBoxProps> = ({ score, label, icon: Icon, onClick, isActive }) => {
  const scoreColor = score >= 90 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500';
  const activeClass = isActive ? 'ring-4 ring-accent bg-paper scale-[1.02] z-10' : 'hover:bg-paper/50 hover:scale-[1.02]';
  
  return (
    <button 
      onClick={onClick}
      className={`tech-border bg-white p-6 flex flex-col justify-between aspect-square relative overflow-hidden group text-left transition-all duration-200 ${activeClass}`}
    >
      <div className={`absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity ${scoreColor}`}>
        <Icon className="w-32 h-32" />
      </div >
      <div className="flex justify-between items-start mb-8 relative z-10">
        <span className="font-mono text-xs font-bold uppercase tracking-widest">{label}</span>
        <Icon className={`w-6 h-6 ${scoreColor}`} />
      </div >
      <div className="relative z-10 flex flex-col">
        <span className={`text-6xl md:text-7xl font-display font-bold tracking-tighter ${scoreColor}`}>
          {score}
        </span>
        <span className={`font-mono text-[10px] uppercase mt-2 transition-opacity ${isActive ? 'text-accent font-bold opacity-100' : 'text-ink/40 opacity-0 group-hover:opacity-100'}`}>
          {isActive ? 'Visar detaljer' : 'Klicka för detaljer'}
        </span>
      </div >
    </button>
  );
};

export default MetricBox;