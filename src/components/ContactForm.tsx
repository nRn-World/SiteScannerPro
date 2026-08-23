import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { TranslationSet } from '../i18n/translations';

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
      const response = await fetch('/api/contact', {
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

  return (
    <div className="bg-white tech-border p-8 md:p-12 tech-shadow">
      {status === 'success' ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div >
          <h3 className="text-3xl font-display font-bold uppercase mb-4">{t.contact.successTitle}</h3>
          <p className="font-mono text-ink/70">{t.contact.successDescription}</p>
          <button 
            onClick={() => setStatus('idle')}
            className="mt-8 font-mono text-sm uppercase font-bold hover:text-accent transition-colors"
          >
            {t.contact.sendAnother}
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="font-mono text-xs font-bold uppercase tracking-widest text-ink/70">{t.contact.name}</label>
              <input 
                type="text" 
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full tech-border bg-paper p-4 font-mono outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                placeholder={t.contact.namePlaceholder}
              />
            </div >
            <div className="space-y-2">
              <label htmlFor="email" className="font-mono text-xs font-bold uppercase tracking-widest text-ink/70">{t.contact.email}</label>
              <input 
                type="email" 
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full tech-border bg-paper p-4 font-mono outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                placeholder={t.contact.emailPlaceholder}
              />
            </div >
          </div >
          
          <div className="space-y-2">
            <label htmlFor="subject" className="font-mono text-xs font-bold uppercase tracking-widest text-ink/70">{t.contact.subject}</label>
            <input 
              type="text" 
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full tech-border bg-paper p-4 font-mono outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              placeholder={t.contact.subjectPlaceholder}
            />
          </div >

          <div className="space-y-2">
            <label htmlFor="message" className="font-mono text-xs font-bold uppercase tracking-widest text-ink/70">{t.contact.message}</label>
            <textarea 
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="w-full tech-border bg-paper p-4 font-mono outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-y"
              placeholder={t.contact.messagePlaceholder}
            />
          </div >

          {status === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 font-mono text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p>{errorMessage}</p>
            </div >
          )}

          <button 
            type="submit" 
            disabled={status === 'submitting'}
            className="w-full bg-ink text-paper py-5 font-display font-bold text-xl uppercase tracking-widest tech-shadow hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {status === 'submitting' ? (
              <><RefreshCw className="w-6 h-6 animate-spin" /> {t.contact.sending}</>
            ) : (
              <><>{t.contact.send} <ArrowRight className="w-6 h-6" /></></>
            )}
          </button>
        </form>
      )}
    </div >
  );
};

export default ContactForm;