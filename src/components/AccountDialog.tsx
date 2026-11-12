import React, { useEffect, useState } from 'react';
import { Loader2, LogOut, Radar, UserRound, X } from 'lucide-react';
import { apiUrl } from '../api';
import { getAccountCopy } from '../i18n/accountCopy';
import type { Language } from '../i18n/translations';
import type { AccountUser } from '../types/account';

interface AccountDialogProps {
  open: boolean;
  language: Language;
  user: AccountUser | null;
  onClose: () => void;
  onAuthed: (user: AccountUser) => void;
  onLoggedOut: () => void;
  onOpenMonitors: () => void;
}

const AccountDialog: React.FC<AccountDialogProps> = ({
  open,
  language,
  user,
  onClose,
  onAuthed,
  onLoggedOut,
  onOpenMonitors
}) => {
  const copy = getAccountCopy(language);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setError(null);
      setPassword('');
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(apiUrl(endpoint), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        const code = payload?.error;
        if (code === 'invalid_credentials') setError(copy.errorInvalid);
        else if (code === 'email_taken') setError(copy.errorEmailTaken);
        else if (code === 'weak_password') setError(copy.errorWeakPassword);
        else if (code === 'invalid_email') setError(copy.errorEmail);
        else if (code === 'storage') setError(copy.errorStorage);
        else setError(copy.errorGeneric);
        return;
      }

      if (!payload?.user?.email) {
        setError(copy.errorGeneric);
        return;
      }

      onAuthed(payload.user as AccountUser);
      onClose();
    } catch {
      setError(copy.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch(apiUrl('/api/auth/logout'), {
        method: 'POST',
        credentials: 'include'
      });
    } catch {
      // The local account state should still be cleared if the network fails.
    } finally {
      onLoggedOut();
      onClose();
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-dialog-title"
        className="w-full max-w-md overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a73e8]/10 text-[#1a73e8]">
              <UserRound className="h-5 w-5" />
            </span>
            <div>
              <h2 id="account-dialog-title" className="text-base font-medium text-gray-900">
                {copy.title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">{copy.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.close}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {user ? (
          <div className="space-y-4 p-5">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {copy.signedInAs}
              </p>
              <p className="mt-1 break-all text-sm font-medium text-gray-900">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={onOpenMonitors}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1a73e8] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1765cc]"
            >
              <Radar className="h-4 w-4" />
              {copy.monitors}
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              {copy.logout}
            </button>
          </div>
        ) : (
          <div className="p-5">
            <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                {copy.signIn}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  mode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                {copy.register}
              </button>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="account-email" className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {copy.email}
                </label>
                <input
                  id="account-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20"
                />
              </div>

              <div>
                <label htmlFor="account-password" className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {copy.password}
                </label>
                <input
                  id="account-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20"
                />
                {mode === 'register' && <p className="mt-1 text-xs text-gray-400">{copy.passwordHint}</p>}
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1a73e8] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1765cc] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading
                  ? copy.loading
                  : mode === 'register'
                    ? copy.submitRegister
                    : copy.submitSignIn}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-gray-400">
              {mode === 'login' ? copy.noAccount : copy.haveAccount}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError(null);
                }}
                className="font-medium text-[#1a73e8] hover:underline"
              >
                {mode === 'login' ? copy.register : copy.signIn}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountDialog;
