import React, { useState, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { AnimatePresence } from 'motion/react';

import Header from './components/Header';
import Hero from './components/Hero';
import ContactForm from './components/ContactForm';
import Dashboard from './components/Dashboard';
import ScanningState from './components/ScanningState';
import Paywall from './components/Paywall';
import FeatureList from './components/FeatureList';
import HistoryList from './components/HistoryList';
import DataFlowBackground from './components/DataFlowBackground';
import VipOwnerPanel from './components/VipOwnerPanel';
import Footer from './components/Footer';
import LegalPage from './components/LegalPage';
import ReportPage from './components/ReportPage';
import ComparisonPage from './components/ComparisonPage';
import AccountDialog from './components/AccountDialog';
import MonitoringPage from './components/MonitoringPage';
import ScanErrorPanel from './components/ScanErrorPanel';
import { ScanResult } from './rules/types';
import type { AccountUser } from './types/account';
import { getLanguage, LANGUAGE_OPTIONS, LANGUAGE_STORAGE_KEY, Language, translations } from './i18n/translations';
import { getVerifyCopy } from './i18n/verifyCopy';
import { apiUrl, reportUrl } from './api';
import {
  DEFAULT_SCAN_OPTIONS,
  SCAN_CATEGORIES,
  type ScanCategory,
  type ScanRunOptions
} from './utils/scanOptions';
import {
  ScanFailureError,
  createScanFailure,
  failureFromException,
  failureFromResponse,
  type ScanFailure
} from './utils/scanErrors';

/** FAS 2.3: canonical sätts dynamiskt utifrån faktisk driftsättningsadress. */
function getCanonicalOrigin(): string {
  if (typeof window === 'undefined') return 'https://nrn-world.github.io';
  const { protocol, hostname, port } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  }
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
}

function getCanonicalBase(): string {
  const origin = getCanonicalOrigin();
  const pathBase = (import.meta.env.VITE_PUBLIC_BASE as string | undefined)?.replace(/\/$/, '') || '';
  return `${origin}${pathBase}`;
}

/** Saved-report permalink: /r/<16 hex chars> */
function getReportIdFromLocation(): string | null {
  if (typeof window === 'undefined') return null;
  const match = window.location.pathname.match(/\/r\/([a-f0-9]{8,64})\/?$/i);
  return match ? match[1] : null;
}

/** Saved competitor comparison permalink: /c/<16 hex chars> */
function getComparisonIdFromLocation(): string | null {
  if (typeof window === 'undefined') return null;
  const match = window.location.pathname.match(/\/c\/([a-f0-9]{8,64})\/?$/i);
  return match ? match[1] : null;
}

/** App base path without trailing slash (empty on the dev server). */
function getAppBasePath(): string {
  const base = (import.meta.env.BASE_URL as string | undefined) || '/';
  return base.replace(/\/$/, '');
}

type AppView = 'home' | 'about' | 'contact' | 'api' | 'pricing' | 'terms' | 'privacy' | 'cookies' | 'monitors';

/** Direct /monitors visits should open the monitoring page, not the scanner. */
function getInitialView(): AppView {
  if (typeof window === 'undefined') return 'home';
  return /\/monitors\/?$/i.test(window.location.pathname) ? 'monitors' : 'home';
}

/** hreflang URLs carry ?lang=xx; honour them on first load. */
function getInitialLanguage(): Language {
  if (typeof window !== 'undefined') {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (fromUrl && LANGUAGE_OPTIONS.some((option) => option.code === fromUrl)) {
      return fromUrl as Language;
    }
  }
  return getLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY));
}

interface ScanHistoryItem {
  url: string;
  date: string;
  score: number;
}

interface ShareInfo {
  shareUrlPath: string;
  expiresAt: string;
  badgeUrlPath?: string;
}

const readErrorMessage = async (res: Response, fallback: string): Promise<string> => {
  try {
    const payload = await res.json();
    if (typeof payload?.error === 'string' && payload.error.trim()) return payload.error;
  } catch {
    // Non-JSON errors still get the local fallback.
  }
  return fallback;
};

const stripVipParam = () => {
  const url = new URL(window.location.href);
  if (!url.searchParams.has('vip')) return;
  url.searchParams.delete('vip');
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, document.title, next || url.pathname);
};

/** A rescan should compare like with like: reuse the previous scan's scope. */
function optionsFromResult(result: ScanResult | null): ScanRunOptions | null {
  if (!result?.analysis) return null;

  const devices = (result.analysis.devices ?? []).filter(
    (device): device is 'mobile' | 'desktop' => device === 'mobile' || device === 'desktop'
  );
  const categories = (result.analysis.categories ?? []).filter(
    (category): category is ScanCategory =>
      SCAN_CATEGORIES.includes(category as ScanCategory)
  );

  if (!devices.length || !categories.length) return null;
  return {
    devices,
    categories,
    thorough: result.analysis.thorough !== false
  };
}

export default function App() {
  const LICENSE_STORAGE_KEY = 'siteScannerLicenseToken';
  const VIP_FLAG_KEY = 'siteScannerVipSession';

  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanFailure, setScanFailure] = useState<ScanFailure | null>(null);
  const [retryNotice, setRetryNotice] = useState<string | null>(null);
  const [previousResult, setPreviousResult] = useState<ScanResult | null>(null);
  const [diffVisible, setDiffVisible] = useState(false);
  const [scanOptions, setScanOptions] = useState<ScanRunOptions>(DEFAULT_SCAN_OPTIONS);
  const [reportId, setReportId] = useState<string | null>(() => getReportIdFromLocation());
  const [comparisonId] = useState<string | null>(() => getComparisonIdFromLocation());
  const [reportRefreshKey, setReportRefreshKey] = useState(0);

  const [isPremium, setIsPremium] = useState(false);
  const [isVip, setIsVip] = useState(false);
  const [vipBanner, setVipBanner] = useState<string | null>(null);
  const [licenseToken, setLicenseToken] = useState<string | null>(null);
  const [licenseInput, setLicenseInput] = useState('');
  const [licenseMessage, setLicenseMessage] = useState<string | null>(null);
  const [isActivatingLicense, setIsActivatingLicense] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showVipOwner, setShowVipOwner] = useState(false);
  const [vipBootstrapping, setVipBootstrapping] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).has('vip');
  });
  
  const [view, setView] = useState<AppView>(getInitialView);
  const [user, setUser] = useState<AccountUser | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const t = translations[language];
  const verifyCopy = getVerifyCopy(language);
  const scanSteps = t.scanSteps;
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  /** FAS 3.4: föregående skanning av samma URL ur historiken. */
  const previousScanForCurrentUrl = (() => {
    const target = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    return scanHistory.find((h) => h.url === target && h.score !== result?.overallScore) ?? null;
  })();

  const clearVipSession = (message?: string) => {
    localStorage.removeItem(LICENSE_STORAGE_KEY);
    localStorage.removeItem(VIP_FLAG_KEY);
    setLicenseToken(null);
    setIsPremium(false);
    setIsVip(false);
    if (message) {
      setVipBanner(message);
    }
  };

  const handleRemovePremium = () => {
    if (!window.confirm(t.nav.removePremiumConfirm)) return;

    localStorage.removeItem(LICENSE_STORAGE_KEY);
    localStorage.removeItem(VIP_FLAG_KEY);
    setLicenseToken(null);
    setIsPremium(false);
    setIsVip(false);
    setLicenseMessage(null);
    setVipBanner(null);
    setShareInfo(null);
    if (reportId) setReportRefreshKey((value) => value + 1);
    // Strip Pro-only fields so solutions do not remain after removing Premium.
    setResult((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        issues: prev.issues.map(({ recommendation: _r, codeSnippet: _c, agentFix: _a, ...issue }) => issue)
      };
    });
  };

  useEffect(() => {
    // Keep ?lang= as an entry point, but do not leave it in the address bar
    // after the language has been applied and stored.
    const currentUrl = new URL(window.location.href);
    if (currentUrl.searchParams.has('lang')) {
      currentUrl.searchParams.delete('lang');
      window.history.replaceState(
        {},
        document.title,
        `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`
      );
    }

    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    // Results are language-specific – clear stale mixed-language reports
    setResult(null);
    setSelectedCategory(null);
    setError(null);
    setLicenseMessage(null);
    setScanFailure(null);
    setRetryNotice(null);
    setPreviousResult(null);
    setDiffVisible(false);
  }, [language]);

  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;
      if (/\/monitors\/?$/i.test(path)) {
        setView('monitors');
        return;
      }
      if (/\/(?:r|c)\/[a-f0-9]{8,64}\/?$/i.test(path)) {
        // Report and comparison state is initialized from the URL at mount.
        window.location.reload();
        return;
      }
      setView('home');
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch(apiUrl('/api/auth/me'), { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.user?.email) setUser(data.user as AccountUser);
      } catch {
        // Accounts are optional; a network failure must not break scanning.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    localStorage.removeItem('siteScannerPremium');

    const urlParams = new URLSearchParams(window.location.search);
    const vipCode = urlParams.get('vip')?.trim();

    const savedToken = localStorage.getItem(LICENSE_STORAGE_KEY);
    const savedVip = localStorage.getItem(VIP_FLAG_KEY) === '1';
    const isLocalHost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (urlParams.get('canceled') === 'true') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const savedHistory = localStorage.getItem('siteScannerHistory');
    if (savedHistory) {
      try {
        setScanHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Could not parse history", e);
      }
    }

    // VIP redeem takes precedence over localhost auto-pro when ?vip= is present
    if (vipCode) {
      setVipBootstrapping(true);
      void (async () => {
        try {
          const res = await fetch(apiUrl('/api/vip/redeem'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: vipCode })
          });

          stripVipParam();

          if (res.status === 403) {
            clearVipSession(t.errors.vipUsed ?? t.vip.used);
            return;
          }

          if (!res.ok) {
            setVipBanner(t.errors.vipInvalid ?? t.vip.used);
            return;
          }

          const data = await res.json();
          if (!data?.token) {
            setVipBanner(t.errors.vipInvalid ?? t.vip.used);
            return;
          }

          localStorage.setItem(LICENSE_STORAGE_KEY, data.token);
          localStorage.setItem(VIP_FLAG_KEY, '1');
          setLicenseToken(data.token);
          setIsPremium(true);
          setIsVip(true);
          setVipBanner(t.vip.banner);
        } catch (e) {
          console.error('VIP redeem failed', e);
          stripVipParam();
          setVipBanner(t.errors.vipInvalid ?? t.vip.used);
        } finally {
          setVipBootstrapping(false);
        }
      })();
      return;
    }

    setVipBootstrapping(false);

    if (savedVip && savedToken) {
      setLicenseToken(savedToken);
      setIsPremium(true);
      setIsVip(true);
      setVipBanner(t.vip.banner);
      return;
    }

    if (isLocalHost) {
      void (async () => {
        try {
          const res = await fetch(apiUrl('/api/dev-activate-pro'), { method: 'POST' });
          if (!res.ok) return;
          const data = await res.json();
          if (!data?.token) return;
          localStorage.setItem(LICENSE_STORAGE_KEY, data.token);
          localStorage.removeItem(VIP_FLAG_KEY);
          setLicenseToken(data.token);
          setIsPremium(true);
          setIsVip(false);
        } catch (e) {
          console.error('Local Pro auto-activate failed', e);
        }
      })();
    } else if (savedToken) {
      setLicenseToken(savedToken);
      setIsPremium(true);
      setIsVip(false);
    }
  // Intentionally run once on mount; language strings for VIP banner refresh via later renders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning) {
      interval = setInterval(() => {
        setScanStep((prev) => (prev < scanSteps.length - 1 ? prev + 1 : prev));
      }, 1500);
    } else {
      setScanStep(0);
    }
    return () => clearInterval(interval);
  }, [isScanning, scanSteps]);

  const runScan = async (
    targetUrl: string,
    activeToken?: string | null,
    priorResult?: ScanResult | null
  ) => {
    const storedToken = localStorage.getItem(LICENSE_STORAGE_KEY);
    const token =
      activeToken !== undefined
        ? activeToken
        : storedToken || (isPremium ? licenseToken : null);
    const rescanBase = priorResult ?? null;
    const rescanOptions = optionsFromResult(rescanBase);
    const activeScanOptions = rescanOptions ?? scanOptions;
    if (rescanOptions) setScanOptions(rescanOptions);

    setIsScanning(true);
    setError(null);
    setScanFailure(null);
    setRetryNotice(null);
    setSelectedCategory(null);
    setShareInfo(null);
    setShareCopied(false);
    setPreviousResult(rescanBase);
    setDiffVisible(false);
    // A rescan keeps the previous result visible until the new one replaces it.
    setResult(rescanBase);

    let data: ScanResult | null = null;
    let failure: ScanFailure | null = null;

    try {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        data = null;
        try {
          if (!token) {
            const res = await fetch(apiUrl('/api/scan-free'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                url: targetUrl,
                language,
                ...activeScanOptions,
                force: Boolean(rescanBase)
              }),
              signal: AbortSignal.timeout(130000)
            });

            if (!res.ok) {
              throw new ScanFailureError(await failureFromResponse(res, language));
            }

            data = (await res.json()) as ScanResult;
            setIsPremium(false);
            setIsVip(false);
          } else {
            // Pro-djupläge: kräver giltig licens-token
            const res = await fetch(apiUrl('/api/scan-premium'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-license-token': token
              },
              body: JSON.stringify({
                url: targetUrl,
                language,
                ...activeScanOptions,
                force: Boolean(rescanBase)
              }),
              signal: AbortSignal.timeout(130000)
            });

            if (res.status === 403 || res.status === 401) {
              const wasVip = isVip || localStorage.getItem(VIP_FLAG_KEY) === '1';
              if (wasVip) {
                clearVipSession(t.vip.used);
              } else {
                localStorage.removeItem(LICENSE_STORAGE_KEY);
                setLicenseToken(null);
                setIsPremium(false);
              }
              throw new ScanFailureError(
                createScanFailure(
                  'license',
                  language,
                  wasVip ? (t.errors.vipUsed ?? t.vip.used) : t.errors.licenseInvalid
                )
              );
            }

            if (!res.ok) {
              throw new ScanFailureError(await failureFromResponse(res, language));
            }

            data = (await res.json()) as ScanResult;
            setIsPremium(true);

            const vipConsumed =
              isVip ||
              localStorage.getItem(VIP_FLAG_KEY) === '1' ||
              res.headers.get('X-Vip-Consumed') === '1';
            if (vipConsumed) {
              localStorage.removeItem(LICENSE_STORAGE_KEY);
              localStorage.removeItem(VIP_FLAG_KEY);
              setLicenseToken(null);
              setIsVip(false);
              // Keep isPremium so this report stays unlocked; next scan without token goes free.
              setVipBanner(t.vip.used);
            }
          }
          break;
        } catch (err) {
          const nextFailure = failureFromException(err, language);
          if (nextFailure.autoRetry && attempt === 0) {
            setRetryNotice(verifyCopy.autoRetry);
            await new Promise((resolve) => window.setTimeout(resolve, 1800));
            continue;
          }
          failure = nextFailure;
          break;
        }
      }

      if (!data) {
        if (rescanBase) setResult(rescanBase);
        setRetryNotice(null);
        setScanFailure(failure ?? createScanFailure('server', language));
        return;
      }

      setResult(data);
      setDiffVisible(Boolean(rescanBase));
      setRetryNotice(null);

      const scannedReportId = typeof data.reportId === 'string' ? data.reportId : null;
      if (scannedReportId) {
        // Keep the scan in the URL so a refresh lands on the saved report.
        window.history.replaceState({}, document.title, `${getAppBasePath()}/r/${scannedReportId}`);
      }

      const newHistoryItem: ScanHistoryItem = {
        url: targetUrl,
        date: new Date().toISOString(),
        score: data.overallScore
      };

      const updatedHistory = [newHistoryItem, ...scanHistory].slice(0, 10);
      setScanHistory(updatedHistory);
      try {
        localStorage.setItem('siteScannerHistory', JSON.stringify(updatedHistory));
      } catch {
        // Private mode / full storage must not hide a completed scan.
      }

      // FAS 3.1/3.2: delbar permalänk till den serverlagrade rapporten.
      if (scannedReportId) {
        void (async () => {
          try {
            const shareRes = await fetch(apiUrl(`/api/reports/${scannedReportId}/share`), {
              method: 'POST'
            });
            if (shareRes.ok) {
              const shareData = await shareRes.json();
              if (shareData?.shareUrlPath) {
                setShareInfo(shareData);
                setShareCopied(false);
                return;
              }
            }
          } catch (e) {
            console.error('Share link failed', e);
          }

          setShareInfo({ shareUrlPath: `/r/${scannedReportId}`, expiresAt: '' });
          setShareCopied(false);
        })();
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleRescanCurrent = () => {
    if (!result) return;
    const targetUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    void runScan(targetUrl, undefined, result);
  };

  const handleRescanFromReport = (prior: ScanResult, targetUrl: string) => {
    setReportId(null);
    setUrl(targetUrl);
    window.history.replaceState({}, document.title, `${getAppBasePath()}/`);
    void runScan(targetUrl, undefined, prior);
  };

  const handleClearHistory = () => {
    if (!window.confirm(verifyCopy.data.clearConfirm)) return;
    localStorage.removeItem('siteScannerHistory');
    setScanHistory([]);
  };

  const handleSetView = (nextView: AppView) => {
    if (nextView === 'home' && (reportId || comparisonId)) {
      window.location.assign(`${getCanonicalBase()}/`);
      return;
    }

    const base = getAppBasePath();
    if (nextView === 'monitors') {
      setView('monitors');
      const target = `${base}/monitors`;
      if (window.location.pathname !== target) {
        window.history.pushState({}, document.title, target);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (/\/monitors\/?$/i.test(window.location.pathname)) {
      window.history.pushState({}, document.title, `${base}/`);
    }
    setView(nextView);
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    if (vipBootstrapping) {
      setError(t.vip.banner);
      return;
    }

    const targetUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    await runScan(targetUrl);
  };

  const handleCheckout = async () => {
    try {
      const res = await fetch(apiUrl('/api/create-checkout-session'), { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(t.errors.payment);
      }
    } catch (err) {
      console.error(err);
      alert(t.errors.payment);
    }
  };

  const handleActivateLicense = async () => {
    const licenseKey = licenseInput.trim();
    if (!licenseKey) {
      setLicenseMessage(t.errors.licenseInvalid);
      return;
    }

    setIsActivatingLicense(true);
    setLicenseMessage(null);

    try {
      const res = await fetch(apiUrl('/api/verify-license'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey })
      });

      if (!res.ok) {
        throw new Error(await readErrorMessage(res, t.errors.licenseInvalid));
      }

      const data = await res.json();
      if (!data?.token) {
        throw new Error(t.errors.licenseInvalid);
      }

      localStorage.setItem(LICENSE_STORAGE_KEY, data.token);
      localStorage.removeItem(VIP_FLAG_KEY);
      setLicenseToken(data.token);
      setIsPremium(true);
      setIsVip(false);
      setVipBanner(null);
      setLicenseInput('');
      setLicenseMessage(t.paywall.activated ?? 'Pro activated.');
      setShowPaywall(false);
      if (reportId) setReportRefreshKey((value) => value + 1);

      if (result && url) {
        const targetUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
        await runScan(targetUrl, data.token);
      }
    } catch (err: any) {
      setLicenseMessage(err.message || t.errors.licenseInvalid);
    } finally {
      setIsActivatingLicense(false);
    }
  };

  return (
    <HelmetProvider>
      <div className="min-h-screen flex flex-col selection:bg-accent selection:text-white">
        <Helmet>
          <title>SiteScanner Pro | {t.nav.scanner}</title>
          <meta name="description" content={t.hero.description} />
          <link rel="canonical" href={getCanonicalBase()} />
          {/* FAS 2.2: OG + Twitter-kort så delningar får förhandsvisning */}
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="SiteScanner Pro" />
          <meta property="og:title" content="SiteScanner Pro – See what is holding your website back" />
          <meta property="og:description" content={t.hero.description} />
          <meta property="og:url" content={getCanonicalBase()} />
          <meta property="og:image" content={`${getCanonicalBase()}/og-image.svg`} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="SiteScanner Pro – See what is holding your website back" />
          <meta name="twitter:description" content={t.hero.description} />
          <meta name="twitter:image" content={`${getCanonicalBase()}/og-image.svg`} />
          {/* FAS 2.3: hreflang för alla sex språken */}
          {(['en', 'sv', 'tr', 'es', 'fr', 'ar'] as Language[]).map((lang) => (
            <link key={lang} rel="alternate" hrefLang={lang} href={`${getCanonicalBase()}/?lang=${lang}`} />
          ))}
          <link rel="alternate" hrefLang="x-default" href={getCanonicalBase()} />
          <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%230A0A0A'/%3E%3Cpath d='M6 20l5-8 4 5 4-9 7 12' stroke='%23FF4E00' stroke-width='2.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E" />
          {/* FAS 2.5: strukturerad data – SoftwareApplication med pris */}
          <script type="application/ld+json">{JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'SiteScanner Pro',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            description: t.hero.description,
            offers: {
              '@type': 'Offer',
              price: '10.99',
              priceCurrency: 'EUR'
            },
            aggregateRating: undefined
          })}</script>
        </Helmet>

        <Header
          view={view}
          setView={handleSetView}
          isPremium={isPremium}
          isVip={isVip}
          language={language}
          setLanguage={setLanguage}
          t={t}
          onRemovePremium={handleRemovePremium}
          onOpenVipOwner={
            typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' ||
              window.location.hostname === '127.0.0.1')
              ? () => setShowVipOwner(true)
              : undefined
          }
          userEmail={user?.email}
          onOpenAccount={() => setAccountOpen(true)}
          onOpenMonitors={() => handleSetView('monitors')}
        />
        <DataFlowBackground paused={isScanning} />

        <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-24 w-full relative z-10">
          {vipBanner && (
            <div className="mb-8 tech-border bg-ink/5 px-4 py-3 font-mono text-xs md:text-sm text-ink/80 flex items-start justify-between gap-4">
              <span>{vipBanner}</span>
              <button
                type="button"
                onClick={() => setVipBanner(null)}
                className="uppercase text-[10px] tracking-wider text-ink/50 hover:text-accent shrink-0"
              >
                OK
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {showPaywall && (
              <Paywall 
                onClose={() => setShowPaywall(false)} 
                onCheckout={handleCheckout} 
                onActivateLicense={handleActivateLicense}
                licenseInput={licenseInput}
                setLicenseInput={setLicenseInput}
                licenseMessage={licenseMessage}
                isActivatingLicense={isActivatingLicense}
                t={t}
              />
            )}
          </AnimatePresence>

          {showVipOwner && (
            <VipOwnerPanel t={t} onClose={() => setShowVipOwner(false)} />
          )}

          <AccountDialog
            open={accountOpen}
            language={language}
            user={user}
            onClose={() => setAccountOpen(false)}
            onAuthed={setUser}
            onLoggedOut={() => setUser(null)}
            onOpenMonitors={() => {
              setAccountOpen(false);
              handleSetView('monitors');
            }}
          />

          {view === 'monitors' && (
            <MonitoringPage
              user={user}
              language={language}
              t={t}
              onSignIn={() => setAccountOpen(true)}
            />
          )}

          {view === 'home' && comparisonId && (
            <ComparisonPage
              comparisonId={comparisonId}
              language={language}
              t={t}
            />
          )}

          {view === 'home' && reportId && !comparisonId && (
            <ReportPage
              reportId={reportId}
              language={language}
              t={t}
              licenseToken={licenseToken}
              refreshKey={reportRefreshKey}
              onUpgradeClick={() => setShowPaywall(true)}
              onRescan={handleRescanFromReport}
              onOpenPrivacy={() => handleSetView('privacy')}
            />
          )}

          {view === 'home' && !reportId && !comparisonId && (
            <>
              {scanFailure && !isScanning && (
                <ScanErrorPanel
                  failure={scanFailure}
                  language={language}
                  hasPreviousResult={Boolean(result)}
                  onRetry={() => {
                    const targetUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
                    void runScan(targetUrl, undefined, result ?? undefined);
                  }}
                  onDismiss={() => setScanFailure(null)}
                />
              )}

              {!result && !isScanning && (
                <Hero 
                  url={url} 
                  setUrl={setUrl} 
                  onScan={handleScan} 
                  error={scanFailure ? null : error}
                  isScanning={isScanning} 
                  t={t}
                  language={language}
                  scanOptions={scanOptions}
                  setScanOptions={setScanOptions}
                  onOpenPrivacy={() => handleSetView('privacy')}
                />
              )}

              {isScanning && (
                <ScanningState 
                  url={url} 
                  scanStep={scanStep} 
                  scanSteps={scanSteps} t={t}
                  retryNotice={retryNotice}
                />
              )}

              {result && !isScanning && (
                <>
                  {shareInfo && (
                    <div className="max-w-5xl mx-auto mb-4 tech-border bg-white px-4 py-3 font-mono text-xs md:text-sm flex flex-wrap items-center justify-between gap-3">
                      <span className="text-ink/70">{t.share.ready}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const full = reportUrl(shareInfo.shareUrlPath);
                            void navigator.clipboard?.writeText(full).then(() => {
                              setShareCopied(true);
                              setTimeout(() => setShareCopied(false), 2500);
                            });
                          }}
                          className="uppercase text-[10px] tracking-wider px-3 py-1.5 bg-ink text-paper hover:bg-accent transition-colors"
                        >
                          {shareCopied ? t.share.copied : t.share.copy}
                        </button>
                        <a
                          href={reportUrl(shareInfo.shareUrlPath)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="uppercase text-[10px] tracking-wider px-3 py-1.5 border-2 border-ink hover:bg-ink hover:text-paper transition-colors"
                        >
                          {t.share.open}
                        </a>
                      </div>
                      <p className="w-full border-t border-ink/10 pt-2 font-mono text-[10px] leading-relaxed text-ink/45">
                        {verifyCopy.data.share}
                      </p>
                    </div>
                  )}
                  {!diffVisible && !scanFailure && previousScanForCurrentUrl && (
                    <div className="max-w-5xl mx-auto mb-4 tech-border bg-white px-4 py-3 font-mono text-xs md:text-sm text-ink/80 flex flex-wrap items-center gap-2">
                      <span>{t.share.compare}</span>
                      <strong className="text-ink">{previousScanForCurrentUrl.score}/100</strong>
                      <span>→</span>
                      <strong className={
                        result.overallScore > previousScanForCurrentUrl.score ? 'text-green-600' :
                        result.overallScore < previousScanForCurrentUrl.score ? 'text-accent' : 'text-ink'
                      }>
                        {result.overallScore}/100
                      </strong>
                      <span className="text-ink/50">
                        ({new Date(previousScanForCurrentUrl.date).toLocaleDateString(language)})
                      </span>
                    </div>
                  )}
                  <Dashboard 
                    result={result}
                    url={url} 
                    selectedCategory={selectedCategory} 
                    setSelectedCategory={setSelectedCategory}
                    onUpgradeClick={() => setShowPaywall(true)}
                    isPremium={isPremium}
                    language={language}
                    licenseToken={licenseToken}
                    t={t}
                    onRescan={handleRescanCurrent}
                    previousResult={diffVisible ? previousResult : null}
                  />
                </>
              )}

              {!result && !isScanning && (
                <>
                  <FeatureList t={t} />
                  <HistoryList
                    history={scanHistory}
                    language={language}
                    t={t}
                    onClear={handleClearHistory}
                  />
                </>
              )}
            </>
          )}

          {view === 'contact' && (
            <ContactForm 
              onSuccess={() => { setError(null); }} 
              onError={(msg) => setError(msg)} t={t}
            />
          )}

          {view === 'about' && (
            <div className="max-w-3xl mx-auto space-y-10">
              <h2 className="text-5xl font-display font-bold uppercase text-center">{t.about.title}</h2>
              <p className="font-mono text-lg text-ink/70 leading-relaxed text-center">
                {t.about.lead}
              </p>
              {t.about.sections.map((section) => (
                <div key={section.heading} className="space-y-3">
                  <h3 className="text-xl font-display font-bold uppercase tracking-wide border-b-2 border-ink pb-2">
                    {section.heading}
                  </h3>
                  <p className="font-mono text-sm text-ink/70 leading-relaxed">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          )}

          {view === 'terms' && <LegalPage kind="terms" language={language} />}
          {view === 'privacy' && <LegalPage kind="privacy" language={language} />}
          {view === 'cookies' && <LegalPage kind="cookies" language={language} />}
        </main>

        <Footer
          language={language}
          onNavigate={(target) => {
            setView(target);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      </div>
    </HelmetProvider>
  );
}
