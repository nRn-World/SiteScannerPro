import React from 'react';
import { History, Globe } from 'lucide-react';
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

const HistoryList: React.FC<HistoryListProps> = ({ history, t }) => {
  if (history.length === 0) return null;

  return (
    <div className="mt-32 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <History className="w-6 h-6 text-accent" />
        <h2 className="text-2xl md:text-3xl font-display font-bold uppercase">{t.history.title}</h2>
      </div >
      <div className="bg-white tech-border overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-paper border-b-2 border-ink font-mono text-xs font-bold uppercase">
          <div className="col-span-6 md:col-span-8">{t.history.target}</div >
          <div className="col-span-3 md:col-span-2 text-right">{t.history.score}</div >
          <div className="col-span-3 md:col-span-2 text-right">{t.history.date}</div >
        </div >
        {history.map((item, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-4 p-4 border-b border-paper/50 font-mono text-sm hover:bg-paper/30 transition-colors items-center">
            <div className="col-span-6 md:col-span-8 truncate flex items-center gap-2">
              <Globe className="w-4 h-4 text-ink/40 shrink-0" />
              <span className="truncate">{item.url}</span>
            </div >
            <div className="col-span-3 md:col-span-2 text-right font-bold">
              <span className={`${
                item.score >= 80 ? 'text-green-600' : 
                item.score >= 50 ? 'text-yellow-600' : 'text-accent'
              }`}>
                {item.score}/100
              </span >
            </div >
            <div className="col-span-3 md:col-span-2 text-right text-xs text-ink/50">
              {new Date(item.date).toLocaleDateString('sv-SE')}
            </div >
          </div >
        ))}
      </div >
    </div >
  );
};

export default HistoryList;