import React from 'react';
import { TranslationSet } from '../../i18n/translations';

interface SeverityBadgeProps {
  severity: string;
  t: TranslationSet;
}

const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, t }) => {
  const styles: Record<string, string> = {
    High: 'bg-bad-soft text-bad',
    Medium: 'bg-warn-soft text-warn',
    Low: 'bg-good-soft text-good',
  };
  const label =
    t.site.severity[severity as keyof typeof t.site.severity] ?? severity;

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ${styles[severity] || styles.Low}`}>
      {label}
    </span>
  );
};

export default SeverityBadge;
