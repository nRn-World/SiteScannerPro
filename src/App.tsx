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
import { ScanResult } from './rules/types';
import { getLanguage, LANGUAGE_STORAGE_KEY, Language, translations } from './i18n/translations';
import { apiUrl } from './api';

interface ScanHistoryItem {
  url: string;
  date: string;
  score: number;
}

const readErrorMessage = async (res: Response, fallback: string): Promise<string> => {
  try {
    await res.json();
  } catch {}
  return fallback;
};

const stripVipParam = () => {
  const url = new URL(window.location.href);
  if (!url.searchParams.has('vip')) return;
  url.searchParams.delete('vip');
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, document.title, next || url.pathname);
};

export default function App() {
  const LICENSE_STORAGE_KEY = 'siteScannerLicenseToken';
  const VIP_FLAG_KEY = 'siteScannerVipSession';

  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
  
  const [view, setView] = useState<'home' | 'about' | 'contact' | 'api' | 'pricing' | 'terms' | 'privacy' | 'cookies'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [language, setLanguage] = useState<Language>(() => getLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY)));
  const t = translations[language];
  const scanSteps = t.scanSteps;

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

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    // Results are language-specific – clear stale mixed-language reports
    setResult(null);
    setSelectedCategory(null);
    setError(null);
    setLicenseMessage(null);
  }, [language]);

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

  const runScan = async (targetUrl: string, activeToken?: string | null) => {
    const storedToken = localStorage.getItem(LICENSE_STORAGE_KEY);
    const token =
      activeToken !== undefined
        ? activeToken
        : storedToken || (isPremium ? licenseToken : null);

    setIsScanning(true);
    setError(null);
    setResult(null);
    setSelectedCategory(null);

    try {
      let data: ScanResult;

      if (!token) {
        setIsPremium(false);
        setIsVip(false);
        const res = await fetch(apiUrl('/api/scan-free'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl, language })
        });
        
        if (!res.ok) {
          throw new Error(await readErrorMessage(res, t.errors.freeScan));
        }
        
        data = await res.json();
      } else {
        // Pro-djupläge: kräver giltig licens-token
        const res = await fetch(apiUrl('/api/scan-premium'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-license-token': token
          },
          body: JSON.stringify({ url: targetUrl, language })
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
          throw new Error(wasVip ? (t.errors.vipUsed ?? t.vip.used) : t.errors.licenseInvalid);
        }

        if (!res.ok) {
          throw new Error(await readErrorMessage(res, t.errors.premiumScan));
        }
        data = await res.json();
        setIsPremium(true);

        const vipConsumed =
          (isVip || localStorage.getItem(VIP_FLAG_KEY) === '1') ||
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

      setResult(data);
      
      const newHistoryItem: ScanHistoryItem = {
        url: targetUrl,
        date: new Date().toISOString(),
        score: data.overallScore
      };
      
      const updatedHistory = [newHistoryItem, ...scanHistory].slice(0, 10);
      setScanHistory(updatedHistory);
      localStorage.setItem('siteScannerHistory', JSON.stringify(updatedHistory));
    } catch (err: any) {
      console.error(err);
      setError(err.message || t.errors.scanFailed);
    } finally {
      setIsScanning(false);
    }
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
          <link rel="canonical" href="https://sitescanner.pro" />
        </Helmet>

        <Header
          view={view}
          setView={setView}
          isPremium={isPremium}
          isVip={isVip}
          language={language}
          setLanguage={setLanguage}
          t={t}
          onOpenVipOwner={
            typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' ||
              window.location.hostname === '127.0.0.1')
              ? () => setShowVipOwner(true)
              : undefined
          }
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

          {view === 'home' && (
            <>
              {!result && !isScanning && (
                <Hero 
                  url={url} 
                  setUrl={setUrl} 
                  onScan={handleScan} 
                  error={error} 
                  isScanning={isScanning} 
                  t={t}
                />
              )}

              {isScanning && (
                <ScanningState 
                  url={url} 
                  scanStep={scanStep} 
                  scanSteps={scanSteps} t={t}
                />
              )}

              {result && !isScanning && (
                <Dashboard 
                  result={result}
                  url={url} 
                  selectedCategory={selectedCategory} 
                  setSelectedCategory={setSelectedCategory}
                  onUpgradeClick={() => setShowPaywall(true)}
                  isPremium={isPremium}
                  t={t}
                />
              )}

              {!result && !isScanning && (
                <>
                  <FeatureList t={t} />
                  <HistoryList history={scanHistory} language={language} t={t} />
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
        </main>
      </div>
    </HelmetProvider>
  );
}
