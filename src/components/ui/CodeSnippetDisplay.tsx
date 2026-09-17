import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { TranslationSet } from '../../i18n/translations';

interface CodeSnippetDisplayProps {
  code: string;
  t?: TranslationSet;
  label?: string;
  languageHint?: string;
}

const CodeSnippetDisplay: React.FC<CodeSnippetDisplayProps> = ({ code, t, label: labelProp, languageHint }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const label = labelProp ?? t?.dashboard.codeExample ?? 'Code example';
  const copyLabel = t?.dashboard.copy ?? 'Copy';
  const copiedLabel = t?.dashboard.copied ?? 'Copied!';

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {label}{languageHint ? ` · ${languageHint}` : ''}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1 text-xs font-medium"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
      <pre className="bg-[#282828] text-[#e8eaed] p-4 text-xs overflow-x-auto rounded-lg font-mono leading-relaxed max-h-96 overflow-y-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeSnippetDisplay;
