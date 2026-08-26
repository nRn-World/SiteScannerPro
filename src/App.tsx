import React, { useEffect, useState } from 'react';
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
import Footer from './components/Footer';
import Pricing from './components/Pricing';
import LegalPage from './components/LegalPage';
import CtaBand from './components/CtaBand';
import { ScanResult } from './rules/types';
import { getLanguage, LANGUAGE_STORAGE_KEY, Language, normalizeCategory, translations } from './i18n/translations';
import { apiUrl } from './api';
import { AppView } from './types/view';

interface ScanHistoryItem {
  url: string;
  date: string;
  score: number;
}

const readErrorMessage = async (res: Response, fallback: string): Promise<string> => {
  try {
    const data = await res.json();
    return data?.error || fallback;
  } catch {
    return fallback;
  }
};

export default function App() {
  const LICENSE_STORAGE_KEY = 'siteScannerLicenseToken';

  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isPremium, setIsPremium] = useState(false);
  const [licenseToken, setLicenseToken] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const [view, setView] = useState<AppView>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [language, setLanguage] = useState<Language>(() => getLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY)));
  const t = translations[language];

  const scanSteps = t.scanSteps;

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  useEffect(() => {
    if (!showPaywall) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowPaywall(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showPaywall]);

  useEffect(() => {
    localStorage.removeItem('siteScannerPremium');

    const savedToken = localStorage.getItem(LICENSE_STORAGE_KEY);
    if (savedToken) {
      setLicenseToken(savedToken);
      setIsPremium(true);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      fetch(apiUrl('/api/verify-session'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
        .then(async res => {
          if (!res.ok) return;
          const data = await res.json();
          if (data.token) {
            localStorage.setItem(LICENSE_STORAGE_KEY, data.token);
            setLicenseToken(data.token);
            setIsPremium(true);
          }
        })
        .catch(() => {})
        .finally(() => {
          window.history.replaceState({}, document.title, window.location.pathname);
        });
    } else if (urlParams.get('canceled') === 'true') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const savedHistory = localStorage.getItem('siteScannerHistory');
    if (savedHistory) {
      try {
        setScanHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Could not parse history', e);
      }
    }
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isScanning) {
      interval = setInterval(() => {
        setScanStep(prev => (prev < scanSteps.length - 1 ? prev + 1 : prev));
      }, 1500);
    } else {
      setScanStep(0);
    }
    return () => clearInterval(interval);
  }, [isScanning, scanSteps]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    let targetUrl = url;
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    setIsScanning(true);
    setError(null);
    setResult(null);
    setSelectedCategory(null);
    setView('home');

    try {
      let data: ScanResult;

      if (!isPremium) {
        const res = await fetch(apiUrl('/api/scan-free'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl }),
        });

        if (!res.ok) {
          throw new Error(await readErrorMessage(res, t.errors.freeScan));
        }

        data = await res.json();
      } else {
        const res = await fetch(apiUrl('/api/scan-premium'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(licenseToken ? { 'x-license-token': licenseToken } : {}),
          },
          body: JSON.stringify({ url: targetUrl }),
        });

        if (res.status === 403 || res.status === 401) {
          localStorage.removeItem(LICENSE_STORAGE_KEY);
          setLicenseToken(null);
          setIsPremium(false);
          throw new Error(t.errors.licenseInvalid);
        }

        if (!res.ok) {
          throw new Error(await readErrorMessage(res, t.errors.premiumScan));
        }
        data = await res.json();
      }

      data.issues = data.issues.map(issue => ({ ...issue, category: normalizeCategory(issue.category) }));
      setResult(data);

      const newHistoryItem: ScanHistoryItem = {
        url: targetUrl,
        date: new Date().toISOString(),
        score: data.overallScore,
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

  const handleCheckout = async () => {
    try {
      const res = await fetch(apiUrl('/api/create-checkout-session'), { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        alert(t.errors.payment + ': ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert(t.errors.payment);
    }
  };

  const handleNewScan = () => {
    setResult(null);
    setError(null);
    setSelectedCategory(null);
    setView('home');
    requestAnimationFrame(() => {
      document.getElementById('scan-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const goToScanner = () => {
    setResult(null);
    setError(null);
    setView('home');
    requestAnimationFrame(() => {
      document.getElementById('scan-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const pageTitle =
    view === 'about'
      ? `${t.about.title} | SiteScanner Pro`
      : view === 'contact'
        ? `${t.site.pages.contactTitle} | SiteScanner Pro`
        : view === 'pricing'
          ? `${t.site.pricing.eyebrow} | SiteScanner Pro`
          : view === 'terms'
            ? `${t.site.legal.termsTitle} | SiteScanner Pro`
            : view === 'privacy'
              ? `${t.site.legal.privacyTitle} | SiteScanner Pro`
              : view === 'cookies'
                ? `${t.site.legal.cookiesTitle} | SiteScanner Pro`
                : 'SiteScanner Pro | Website Health Analysis';

  const showMarketing = view === 'home' && !result && !isScanning;
  const showCta = !isPremium && (showMarketing || view === 'about');

  return (
    <HelmetProvider>
      <div className="min-h-dvh flex flex-col">
        <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={t.hero.description} />
          <link rel="canonical" href="https://sitescanner.pro" />
        </Helmet>

        <Header
          view={view}
          setView={setView}
          isPremium={isPremium}
          language={language}
          setLanguage={setLanguage}
          t={t}
          onUpgradeClick={() => setShowPaywall(true)}
        />
        <DataFlowBackground />

        <main
          id="main-content"
          className={`flex-1 max-w-7xl mx-auto px-5 sm:px-6 w-full relative z-10 ${
            result && view === 'home' ? 'py-8 md:py-12' : 'py-10 md:py-20'
          }`}
        >
          <AnimatePresence>
            {showPaywall && (
              <Paywall key="paywall" onClose={() => setShowPaywall(false)} onCheckout={handleCheckout} t={t} />
            )}
          </AnimatePresence>

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

              {isScanning && <ScanningState url={url} scanStep={scanStep} scanSteps={scanSteps} t={t} />}

              {result && !isScanning && (
                <Dashboard
                  result={result}
                  url={url}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  onUpgradeClick={() => setShowPaywall(true)}
                  onNewScan={handleNewScan}
                  t={t}
                />
              )}

              {showMarketing && (
                <>
                  <FeatureList t={t} />
                  <div className="mt-24 md:mt-32">
                    <Pricing
                      t={t}
                      isPremium={isPremium}
                      onCheckout={handleCheckout}
                      onStartFree={goToScanner}
                    />
                  </div>
                  <HistoryList history={scanHistory} t={t} />
                </>
              )}
            </>
          )}

          {view === 'contact' && (
            <ContactForm
              onSuccess={() => {
                setError(null);
              }}
              onError={msg => setError(msg)}
              t={t}
            />
          )}

          {view === 'about' && (
            <div className="max-w-3xl mx-auto">
              <p className="eyebrow text-accent mb-4">{t.nav.about}</p>
              <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-6">{t.about.title}</h1>
              <p className="text-lg md:text-xl text-muted leading-relaxed mb-12">{t.about.lead}</p>
              <div className="space-y-5">
                {t.about.sections.map((section, index) => (
                  <section key={section.heading} className="surface-card p-6 md:p-8">
                    <div className="flex items-baseline gap-3 mb-3">
                      <span className="font-display text-sm font-bold text-accent">0{index + 1}</span>
                      <h2 className="font-display text-xl font-bold">{section.heading}</h2>
                    </div>
                    <p className="text-muted leading-relaxed">{section.body}</p>
                  </section>
                ))}
              </div>
            </div>
          )}

          {view === 'pricing' && (
            <Pricing t={t} isPremium={isPremium} onCheckout={handleCheckout} onStartFree={goToScanner} />
          )}

          {view === 'terms' && (
            <LegalPage title={t.site.legal.termsTitle} updated={t.site.legal.updated} sections={t.site.legal.terms} />
          )}
          {view === 'privacy' && (
            <LegalPage title={t.site.legal.privacyTitle} updated={t.site.legal.updated} sections={t.site.legal.privacy} />
          )}
          {view === 'cookies' && (
            <LegalPage title={t.site.legal.cookiesTitle} updated={t.site.legal.updated} sections={t.site.legal.cookies} />
          )}
        </main>

        <div className="relative z-10">
          {showCta && <CtaBand t={t} onCheckout={handleCheckout} />}
          <Footer t={t} setView={setView} />
        </div>
      </div>
    </HelmetProvider>
  );
}
