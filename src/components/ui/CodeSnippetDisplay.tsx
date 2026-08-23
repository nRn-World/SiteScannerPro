import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeSnippetDisplayProps {
  code: string;
}

const CodeSnippetDisplay: React.FC<CodeSnippetDisplayProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 pt-4 border-t border-ink/10">
      <div className="flex justify-between items-center mb-2">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-ink/50 block">Kodexempel</span>
        <button 
          onClick={handleCopy}
          className="text-ink/50 hover:text-ink transition-colors flex items-center gap-1 font-mono text-xs font-bold uppercase"
          title="Kopiera kod"
        >
          {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Kopierad!' : 'Kopiera'}
        </button>
      </div>
      <pre className="bg-ink text-paper p-3 text-xs overflow-x-auto tech-border font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeSnippetDisplay;