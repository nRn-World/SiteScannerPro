import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ExternalLink,
  Loader2,
  Pause,
  Play,
  Plus,
  Radar,
  RefreshCw,
  Trash2,
  UserRound
} from 'lucide-react';
import { apiUrl, reportUrl } from '../api';
import { getMonitorCopy } from '../i18n/monitorCopy';
import type { Language, TranslationSet } from '../i18n/translations';
import type { AccountUser } from '../types/account';
import DataNotice from './DataNotice';

interface MonitorCheck {
  at: string;
  score: number;
  high: number;
  medium: number;
  low: number;
  reportId?: string;
}

interface Monitor {
  id: string;
  url: string;
  language: string;
  intervalHours: number;
  enabled: boolean;
  createdAt: string;
  nextCheckAt: string;
  lastCheckedAt?: string;
  lastScore?: number;
  lastDelta?: number;
  lastHigh?: number;
  lastMedium?: number;
  lastLow?: number;
  lastReportId?: string;
  lastError?: string;
  lastAlert?: 'score_down' | 'new_critical';
  history: MonitorCheck[];
}

interface MonitoringPageProps {
  user: AccountUser | null;
  language: Language;
  t: TranslationSet;
  onSignIn: () => void;
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function formatDate(value: string | undefined, language: Language): string {
  if (!value) return '–';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '–';
  return date.toLocaleString(language);
}

const MonitoringPage: React.FC<MonitoringPageProps> = ({ user, language, onSignIn }) => {
  const copy = getMonitorCopy(language);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [intervalHours, setIntervalHours] = useState<number>(24);
  const [adding, setAdding] = useState(false);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl('/api/monitors'), {
        credentials: 'include',
        signal
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        if (res.status !== 401) setError(payload?.error || copy.storageFailed);
        return;
      }
      setMonitors(Array.isArray(payload?.monitors) ? payload.monitors : []);
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') setError(copy.storageFailed);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setMonitors([]);
      return;
    }

    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [user?.id]);

  const addMonitor = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError(copy.invalidUrl);
      return;
    }

    setAdding(true);
    try {
      const res = await fetch(apiUrl('/api/monitors'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, intervalHours, language })
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        setError(payload?.error || copy.storageFailed);
        return;
      }
      setUrl('');
      await load();
    } catch {
      setError(copy.storageFailed);
    } finally {
      setAdding(false);
    }
  };

  const toggleMonitor = async (monitor: Monitor) => {
    setError(null);
    try {
      const res = await fetch(apiUrl(`/api/monitors/${encodeURIComponent(monitor.id)}`), {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !monitor.enabled, language })
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        setError(payload?.error || copy.storageFailed);
        return;
      }
      setMonitors((current) =>
        current.map((item) => (item.id === monitor.id ? payload.monitor : item))
      );
    } catch {
      setError(copy.storageFailed);
    }
  };

  const checkMonitor = async (monitor: Monitor) => {
    setCheckingId(monitor.id);
    setError(null);
    try {
      const res = await fetch(apiUrl(`/api/monitors/${encodeURIComponent(monitor.id)}/check`), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language })
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        setError(payload?.error || copy.scanFailed);
        return;
      }
      setMonitors((current) =>
        current.map((item) => (item.id === monitor.id ? payload.monitor : item))
      );
    } catch {
      setError(copy.scanFailed);
    } finally {
      setCheckingId(null);
    }
  };

  const removeMonitor = async (monitor: Monitor) => {
    if (!window.confirm(copy.confirmDelete)) return;
    setDeletingId(monitor.id);
    setError(null);
    try {
      const res = await fetch(apiUrl(`/api/monitors/${encodeURIComponent(monitor.id)}`), {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        setError(payload?.error || copy.storageFailed);
        return;
      }
      setMonitors((current) => current.filter((item) => item.id !== monitor.id));
    } catch {
      setError(copy.storageFailed);
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1a73e8]/10 text-[#1a73e8]">
            <Radar className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-xl font-medium text-gray-900">{copy.accountRequired}</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500">
            {copy.accountBody}
          </p>
          <button
            type="button"
            onClick={onSignIn}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#1a73e8] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1765cc]"
          >
            <UserRound className="h-4 w-4" />
            {copy.signIn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1a73e8]/10 text-[#1a73e8]">
            <Radar className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-medium text-gray-900 md:text-2xl">{copy.title}</h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-500">{copy.subtitle}</p>
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-gray-400">{copy.schedulerNote}</p>
        <DataNotice kind="monitoring" language={language} className="mt-3" />
      </div>

      <form onSubmit={addMonitor} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="text-sm font-medium text-gray-900">{copy.addTitle}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_180px_auto] md:items-end">
          <div>
            <label htmlFor="monitor-url" className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              {copy.urlLabel}
            </label>
            <input
              id="monitor-url"
              type="text"
              inputMode="url"
              autoComplete="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder={copy.urlPlaceholder}
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20"
            />
          </div>
          <div>
            <label htmlFor="monitor-interval" className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
              {copy.intervalLabel}
            </label>
            <select
              id="monitor-interval"
              value={intervalHours}
              onChange={(event) => setIntervalHours(Number(event.target.value))}
              className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20"
            >
              <option value={24}>{copy.interval24}</option>
              <option value={72}>{copy.interval72}</option>
              <option value={168}>{copy.interval168}</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={adding}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1a73e8] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1765cc] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {adding ? copy.adding : copy.add}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </form>

      {loading && monitors.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" /> {copy.loading}
        </div>
      ) : monitors.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <h2 className="text-sm font-medium text-gray-900">{copy.empty}</h2>
          <p className="mt-1 text-sm text-gray-500">{copy.emptyBody}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {monitors.map((monitor) => {
            const host = hostOf(monitor.url);
            const delta = monitor.lastDelta;
            const isChecking = checkingId === monitor.id;
            const isDeleting = deletingId === monitor.id;

            return (
              <div key={monitor.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-medium text-gray-900">{host}</h2>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          monitor.enabled
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {monitor.enabled ? copy.enabled : copy.paused}
                      </span>
                      {monitor.lastAlert && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          <AlertTriangle className="h-3 w-3" />
                          {monitor.lastAlert === 'score_down' ? copy.alertScoreDown : copy.alertNewCritical}
                        </span>
                      )}
                    </div>
                    <a
                      href={monitor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-xs text-gray-400 hover:text-[#1a73e8]"
                    >
                      {monitor.url}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleMonitor(monitor)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      {monitor.enabled ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      {monitor.enabled ? copy.pause : copy.resume}
                    </button>
                    <button
                      type="button"
                      onClick={() => void checkMonitor(monitor)}
                      disabled={isChecking}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isChecking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                      {isChecking ? copy.checking : copy.runNow}
                    </button>
                    {monitor.lastReportId && (
                      <a
                        href={reportUrl(`/r/${monitor.lastReportId}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {copy.report}
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => void removeMonitor(monitor)}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                    >
                      {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      {copy.delete}
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 border-t border-gray-100 bg-gray-50/60 px-5 py-4 sm:grid-cols-[170px_1fr]">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400">{copy.score}</p>
                    <div className="mt-1 flex items-end gap-2">
                      <span className="text-3xl font-semibold leading-none text-gray-900">
                        {typeof monitor.lastScore === 'number' ? monitor.lastScore : '–'}
                      </span>
                      <span className="pb-0.5 text-xs text-gray-400">/100</span>
                      {typeof delta === 'number' && delta !== 0 && (
                        <span className={`pb-0.5 text-xs font-medium ${delta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {delta > 0 ? '+' : '−'}
                          {Math.abs(delta)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 text-xs text-gray-500 sm:grid-cols-3">
                    <div>
                      <p className="uppercase tracking-wide text-gray-400">{copy.lastCheck}</p>
                      <p className="mt-1 text-gray-700">
                        {monitor.lastCheckedAt ? formatDate(monitor.lastCheckedAt, language) : copy.never}
                      </p>
                    </div>
                    <div>
                      <p className="uppercase tracking-wide text-gray-400">{copy.nextCheck}</p>
                      <p className="mt-1 text-gray-700">
                        {monitor.enabled ? formatDate(monitor.nextCheckAt, language) : copy.paused}
                      </p>
                    </div>
                    <div>
                      <p className="uppercase tracking-wide text-gray-400">{copy.history}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {monitor.history.length === 0 ? (
                          <span className="text-gray-400">{copy.firstCheck}</span>
                        ) : (
                          monitor.history.slice(-8).map((check) => (
                            <span
                              key={`${monitor.id}-${check.at}`}
                              title={formatDate(check.at, language)}
                              className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
                                check.score >= 90
                                  ? 'bg-green-100 text-green-700'
                                  : check.score >= 50
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {check.score}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
                  <span>
                    {copy.critical}: <strong className="text-gray-700">{monitor.lastHigh ?? 0}</strong>
                  </span>
                  <span>
                    {copy.warnings}: <strong className="text-gray-700">{monitor.lastMedium ?? 0}</strong>
                  </span>
                  <span>
                    {copy.improvements}: <strong className="text-gray-700">{monitor.lastLow ?? 0}</strong>
                  </span>
                  {monitor.lastError && (
                    <span className="text-red-600">
                      {copy.scanFailed} {monitor.lastError}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MonitoringPage;
