import React from 'react';

interface SeverityBadgeProps {
  severity: string;
}

const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const colors: Record<string, string> = {
    High: 'bg-accent text-white',
    Medium: 'bg-yellow-400 text-ink',
    Low: 'bg-blue-500 text-white'
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider tech-border ${colors[severity] || colors.Low}`}>
      {severity}
    </span>
  );
};

export default SeverityBadge;