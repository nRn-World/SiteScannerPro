import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Globe, 
  Download, 
  SearchCheck, 
  Zap, 
  ShieldAlert, 
  Globe as GlobeIcon, 
  AlertTriangle,
  Lock
} from 'lucide-react';
import MetricBox from './ui/MetricBox';
import SeverityBadge from './ui/SeverityBadge';
import CodeSnippetDisplay from './ui/CodeSnippetDisplay';
import { ScanResult } from '../rules/types';
import { CategoryKey, TranslationSet } from '../i18n/translations';

interface DashboardProps {
  result: ScanResult;
  url: string;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  onUpgradeClick: () => void;
  t: TranslationSet;
}

const Dashboard: React.FC<DashboardProps> = ({ result, url, selectedCategory, setSelectedCategory, onUpgradeClick, t }) => {
  const filteredIssues = selectedCategory 
    ? result.issues.filter(issue => issue.category === selectedCategory)
    : result.issues;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12"
    >
      {/* Dashboard Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 bg-white tech-border p-8 md:p-12">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-paper tech-border font-mono text-xs font-bold uppercase mb-6">
            <Globe className="w-4 h-4" />
            {url}
          </div >
          <h2 className="text-4xl md:text-6xl font-display font-bold uppercase leading-[0.9] tracking-tighter mb-6">
            {t.dashboard.report}
          </h2>
          <p className="font-mono text-base max-w-2xl leading-relaxed mb-6">
            {result.summary}
          </p>
          <button 
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-paper font-mono text-sm font-bold uppercase tracking-widest hover:bg-accent transition-colors tech-border"
          >
            <Download className="w-4 h-4" /> {t.dashboard.exportPdf}
          </button>
        </div >
        
        <div className="flex flex-col items-center justify-center p-8 bg-paper tech-border min-w-[200px] tech-shadow">
          <span className="font-mono text-xs font-bold uppercase tracking-widest mb-2">{t.dashboard.totalScore}</span>
          <span className={`text-8xl font-display font-bold tracking-tighter ${
            result.overallScore >= 80 ? 'text-ink' : 
            result.overallScore >= 50 ? 'text-yellow-500' : 'text-accent'
          }`}>
            {result.overallScore}
          </span >
        </div>
      </div >

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <MetricBox 
          score={result.metrics.seo} 
          label={t.dashboard.categories.SEO}
          icon={SearchCheck}
          t={t}
          isActive={selectedCategory === 'SEO'}
          onClick={() => setSelectedCategory(selectedCategory === 'SEO' ? null : 'SEO')}
        />
        <MetricBox 
          score={result.metrics.performance} 
          label={t.dashboard.categories.Performance}
          icon={Zap} 
          t={t}
          isActive={selectedCategory === 'Performance'}
          onClick={() => setSelectedCategory(selectedCategory === 'Performance' ? null : 'Performance')}
        />
        <MetricBox 
          score={result.metrics.security} 
          label={t.dashboard.categories.Security}
          icon={ShieldAlert} 
          t={t}
          isActive={selectedCategory === 'Security'}
          onClick={() => setSelectedCategory(selectedCategory === 'Security' ? null : 'Security')}
        />
        <MetricBox 
          score={result.metrics.accessibility} 
          label={t.dashboard.categories.Accessibility}
          icon={GlobeIcon} 
          t={t}
          isActive={selectedCategory === 'Accessibility'}
          onClick={() => setSelectedCategory(selectedCategory === 'Accessibility' ? null : 'Accessibility')}
        />
        <MetricBox 
          score={result.metrics.code} 
          label={t.dashboard.categories.Code}
          icon={SearchCheck} 
          t={t}
          isActive={selectedCategory === 'Code'}
          onClick={() => setSelectedCategory(selectedCategory === 'Code' ? null : 'Code')}
        />
      </div>

       {/* Issues List */}
       <div className="space-y-6">
         <h3 className={`${selectedCategory ? 'text-accent' : 'text-ink'} text-2xl font-display font-bold uppercase`}>
           {selectedCategory ? t.dashboard.categoryIssues.replace('{category}', t.dashboard.categories[selectedCategory as CategoryKey] ?? selectedCategory) : t.dashboard.identifiedIssues}
         </h3>
        
        {filteredIssues.length > 0 ? (
          <div className="grid gap-6">
            {filteredIssues.map((issue, idx) => (
              <div key={idx} className="bg-white tech-border p-6 tech-shadow">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <SeverityBadge severity={issue.severity} />
                    <h4 className="font-display font-bold uppercase text-lg">{issue.title}</h4>
                  </div>
                  <span className="font-mono text-xs text-ink/50 uppercase">{issue.category}</span>
                </div>
                <p className="font-mono text-sm text-ink/80 mb-4">{issue.description}</p>
                {issue.recommendation ? (
                  <div className="p-4 bg-paper tech-border">
                    <span className="font-mono text-xs font-bold uppercase text-ink/50 block mb-2">{t.dashboard.recommendation}</span>
                    <p className="font-mono text-sm">{issue.recommendation}</p>
                  </div>
                ) : (
                  <div className="p-4 md:p-5 bg-paper tech-border flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
                    <div className="flex items-start gap-3">
                      <Lock className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <div>
                        <span className="block font-mono text-xs font-bold uppercase tracking-widest mb-1">{t.dashboard.solutionLocked}</span>
                        <p className="font-mono text-sm text-ink/70 leading-relaxed">{t.dashboard.lockedHint}</p>
                      </div>
                    </div>
                    <button 
                      onClick={onUpgradeClick}
                      className="shrink-0 bg-accent text-white px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest tech-shadow hover:bg-ink transition-colors"
                    >
                      {t.dashboard.unlockCta}
                    </button>
                  </div>
                )}
                {issue.codeSnippet && (
                  <CodeSnippetDisplay code={issue.codeSnippet} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white tech-border font-mono text-ink/50">
            {t.dashboard.noIssues}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;