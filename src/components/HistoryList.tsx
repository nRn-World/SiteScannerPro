import React from 'react';
import { Globe, History } from 'lucide-react';
import { TranslationSet } from '../i18n/translations';

interface HistoryItem {
  url: string;
  date: string;
  score: number;
}

interface HistoryListProps {
  history: HistoryItem[];
  t: TranslationSet;
}

const scoreClass = (score: number) => {
  if (score >= 80) return 'bg-good-soft text-good';
  if (score >= 50) return 'bg-warn-soft text-warn';
  return 'bg-bad-soft text-bad';
};

const HistoryList: React.FC<HistoryListProps> = ({ history, t }) => {
  if (history.length === 0) return null;

  return (
    <section className="mt-24 md:mt-32">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-10 h-10 rounded-2xl bg-surface border border-line flex items-center justify-center">
          <History className="w-5 h-5 text-accent" />
        </span>
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight">{t.history.title}</h2>
      </div>
      <div className="surface-card overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-line eyebrow">
          <div className="col-span-8">{t.history.target}</div>
          <div className="col-span-2 text-end">{t.history.score}</div>
          <div className="col-span-2 text-end">{t.history.date}</div>
        </div>
        {history.map((item, idx) => (
          <div
            key={`${item.url}-${item.date}-${idx}`}
            className="grid grid-cols-12 gap-3 px-5 py-4 border-b border-line last:border-b-0 items-center hover:bg-paper/50 transition-colors"
          >
            <div className="col-span-8 md:col-span-8 truncate flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-muted shrink-0" />
              <span className="truncate text-sm font-medium">{item.url}</span>
            </div>
            <div className="col-span-4 md:col-span-2 flex justify-end">
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${scoreClass(item.score)}`}>
                {item.score}
              </span>
            </div>
            <div className="hidden md:block col-span-2 text-end text-xs text-muted">
              {new Date(item.date).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HistoryList;
