import React, { useState } from 'react';
import { Copy, Link2 } from 'lucide-react';
import { TranslationSet } from '../i18n/translations';
import { apiUrl } from '../api';

interface VipOwnerPanelProps {
  t: TranslationSet;
  onClose: () => void;
}

const VipOwnerPanel: React.FC<VipOwnerPanelProps> = ({ t, onClose }) => {
  const [adminSecret, setAdminSecret] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setMessage(null);
    setCreatedUrl(null);
    setCopied(false);

    try {
      const res = await fetch(apiUrl('/api/vip/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminSecret, count: 1 })
      });

      if (!res.ok) {
        throw new Error(t.vip.createError);
      }

      const data = await res.json();
      const url = data?.links?.[0]?.url;
      if (!url || typeof url !== 'string') {
        throw new Error(t.vip.createError);
      }

      setCreatedUrl(url);
      setMessage(t.vip.created);
    } catch {
      setMessage(t.vip.createError);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!createdUrl) return;
    try {
      await navigator.clipboard.writeText(createdUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage(t.vip.createError);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 px-4">
      <div className="w-full max-w-lg bg-paper tech-border p-6 space-y-5 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
              <Link2 className="w-5 h-5 text-accent" />
              {t.vip.ownerTitle}
            </h2>
            <p className="font-mono text-xs text-ink/60 mt-2">{t.vip.ownerHint}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-xs uppercase tech-border px-2 py-1 hover:text-accent"
          >
            {t.paywall.cancel}
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-3">
          <input
            type="password"
            value={adminSecret}
            onChange={(event) => setAdminSecret(event.target.value)}
            placeholder={t.vip.secretPlaceholder}
            className="w-full bg-paper tech-border px-3 py-3 font-mono text-sm"
            autoComplete="off"
            required
          />
          <button
            type="submit"
            disabled={isCreating || !adminSecret.trim()}
            className="w-full tech-border bg-ink text-paper font-mono text-sm font-bold uppercase py-3 hover:bg-accent disabled:opacity-50"
          >
            {isCreating ? t.vip.creating : t.vip.create}
          </button>
        </form>

        {message && (
          <p className="font-mono text-xs text-ink/70">{message}</p>
        )}

        {createdUrl && (
          <div className="space-y-2">
            <code className="block tech-border bg-ink/5 px-3 py-3 font-mono text-xs break-all">
              {createdUrl}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 tech-border px-3 py-2 font-mono text-xs font-bold uppercase hover:text-accent"
            >
              <Copy className="w-3.5 h-3.5" />
              {copied ? t.vip.copied : t.vip.copy}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VipOwnerPanel;
