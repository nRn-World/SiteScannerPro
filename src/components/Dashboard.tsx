import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Globe, 
  Download, 
  SearchCheck, 
  Zap, 
  ShieldAlert, 
  Globe as GlobeIcon, 
  AlertTriangle 
} from 'lucide-react';
import MetricBox from './ui/MetricBox';
import SeverityBadge from './ui/SeverityBadge';
import CodeSnippetDisplay from './ui/CodeSnippetDisplay';
import { ScanResult } from '../rules/types';

interface DashboardProps {
  result: ScanResult;
  url: string;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ result, url, selectedCategory, setSelectedCategory }) => {
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
            Analysrapport
          </h2>
          <p className="font-mono text-base max-w-2xl leading-relaxed mb-6">
            {result.summary}
          </p>
          <button 
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-paper font-mono text-sm font-bold uppercase tracking-widest hover:bg-accent transition-colors tech-border"
          >
            <Download className="w-4 h-4" /> Exportera till PDF
          </button>
        </div >
        
        <div className="flex flex-col items-center justify-center p-8 bg-paper tech-border min-w-[200px] tech-shadow">
          <span className="font-mono text-xs font-bold uppercase tracking-widest mb-2">Total Poäng</span>
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
          label="SEO" 
          icon={SearchCheck} 
          isActive={selectedCategory === 'SEO'}
          onClick={() => setSelectedCategory(selectedCategory === 'SEO' ? null : 'SEO')}
        />
        <MetricBox 
          score={result.metrics.performance} 
          label="Prestanda" 
          icon={Zap} 
          isActive={selectedCategory === 'Prestanda'}
          onClick={() => setSelectedCategory(selectedCategory === 'Prestanda' ? null : 'Prestanda')}
        />
        <MetricBox 
          score={result.metrics.security} 
          label="Säkerhet" 
          icon={ShieldAlert} 
          isActive={selectedCategory === 'Säkerhet'}
          onClick={() => setSelectedCategory(selectedCategory === 'Säkerhet' ? null : 'Säkerhet')}
        />
        <MetricBox 
          score={result.metrics.accessibility} 
          label="Tillgänglighet" 
          icon={GlobeIcon} 
          isActive={selectedCategory === 'Tillgänglighet'}
          onClick={() => setSelectedCategory(selectedCategory === 'Tillgänglighet' ? null : 'Tillgänglighet')}
        />
        <MetricBox 
          score={result.metrics.code} 
          label="Kod" 
          icon={SearchCheck} 
          isActive={selectedCategory === 'Kodfel'}
          onClick={() => setSelectedCategory(selectedCategory === 'Kodfel' ? null : 'Kodfel')}
        />
      </div>

       {/* Issues List */}
       <div className="space-y-6">
         <h3 className={`${selectedCategory ? 'text-accent' : 'text-ink'} text-2xl font-display font-bold uppercase`}>
           {selectedCategory ? `${selectedCategory} Problem` : 'Identifierade Problem'}
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
                <div className="p-4 bg-paper tech-border">
                  <span className="font-mono text-xs font-bold uppercase text-ink/50 block mb-2">Rekommendation</span>
                  <p className="font-mono text-sm">{issue.recommendation}</p>
                </div>
                {issue.codeSnippet && (
                  <CodeSnippetDisplay code={issue.codeSnippet} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white tech-border font-mono text-ink/50">
            Inga problem hittades i denna kategori.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;