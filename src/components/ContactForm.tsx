import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle, Mail, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { TranslationSet } from '../i18n/translations';
import { apiUrl } from '../api';

interface ContactFormProps {
  onSuccess: () => void;
  onError: (message: string) => void;
  t: TranslationSet;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSuccess, onError, t }) => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch(apiUrl('/api/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.contact.sendError);
      }

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      onSuccess();
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message);
      onError(error.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const fieldClass =
    'w-full rounded-2xl border border-line bg-paper px-4 py-3.5 outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/15 transition-all';

  return (
    <div className="grid lg:grid-cols-12 gap-10 items-start">
      <div className="lg:col-span-5 space-y-6">
        <p className="eyebrow text-accent">{t.nav.contact}</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">{t.site.pages.contactTitle}</h1>
        <p className="text-muted text-lg leading-relaxed">{t.site.pages.contactLead}</p>
        <div className="surface-card p-5 flex items-start gap-4">
          <span className="w-10 h-10 rounded-2xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1">{t.site.pages.contactEmailLabel}</p>
            <a href="mailto:bynrnworld@gmail.com" className="font-semibold hover:text-accent transition-colors">
              bynrnworld@gmail.com
            </a>
            <p className="text-sm text-muted mt-2">{t.site.pages.contactReply}</p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 surface-card p-6 md:p-10">
        {status === 'success' ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center py-10">
            <div className="w-16 h-16 bg-good-soft text-good rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-display text-2xl font-bold mb-2">{t.contact.successTitle}</h3>
            <p className="text-muted">{t.contact.successDescription}</p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="mt-8 text-sm font-semibold hover:text-accent transition-colors"
            >
              {t.contact.sendAnother}
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted">
                  {t.contact.name}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={fieldClass}
                  placeholder={t.contact.namePlaceholder}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted">
                  {t.contact.email}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={fieldClass}
                  placeholder={t.contact.emailPlaceholder}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-muted">
                {t.contact.subject}
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={fieldClass}
                placeholder={t.contact.subjectPlaceholder}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-muted">
                {t.contact.message}
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className={`${fieldClass} resize-y`}
                placeholder={t.contact.messagePlaceholder}
              />
            </div>

            {status === 'error' && (
              <div className="rounded-2xl bg-bad-soft text-bad p-4 text-sm flex items-start gap-3" role="alert">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full rounded-full bg-ink text-paper py-4 font-semibold hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'submitting' ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" /> {t.contact.sending}
                </>
              ) : (
                <>
                  {t.contact.send} <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactForm;
