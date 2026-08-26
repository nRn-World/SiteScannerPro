import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { TranslationSet } from '../../i18n/translations';

interface CodeSnippetDisplayProps {
  code: string;
  t: TranslationSet;
}

const CodeSnippetDisplay: React.FC<CodeSnippetDisplayProps> = ({ code, t }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-line">
      <div className="flex justify-between items-center mb-2">
        <span className="eyebrow">{t.site.actions.codeExample}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-muted hover:text-ink transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-good" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? t.site.actions.copied : t.site.actions.copy}
        </button>
      </div>
      <pre className="bg-ink text-paper p-4 text-xs overflow-x-auto rounded-2xl font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeSnippetDisplay;
