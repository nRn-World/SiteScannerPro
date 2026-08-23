import React, { useState, useEffect } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { AnimatePresence } from 'motion/react';
import { Activity, Crown } from 'lucide-react';

import Header from './components/Header';
import Hero from './components/Hero';
import ContactForm from './components/ContactForm';
import Dashboard from './components/Dashboard';
import ScanningState from './components/ScanningState';
import Paywall from './components/Paywall';
import FeatureList from './components/FeatureList';
import HistoryList from './components/HistoryList';
import DataFlowBackground from './components/DataFlowBackground';
import { ScanResult } from './rules/types';
import { getLanguage, LANGUAGE_STORAGE_KEY, Language, normalizeCategory, translations } from './i18n/translations';

interface ScanHistoryItem {
  url: string;
  date: string;
  score: number;
}

export default function App() {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isPremium, setIsPremium] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const [view, setView] = useState<'home' | 'about' | 'contact' | 'api' | 'pricing' | 'terms' | 'privacy' | 'cookies'>('home');
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
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      localStorage.setItem('siteScannerPremium', 'true');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setIsPremium(localStorage.getItem('siteScannerPremium') === 'true');
    setScanCount(parseInt(localStorage.getItem('siteScannerScans') || '0', 10));
    
    const savedHistory = localStorage.getItem('siteScannerHistory');
    if (savedHistory) {
      try {
        setScanHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Could not parse history", e);
      }
    }
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

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    // Note: Paywall logic can be re-enabled here if desired
    // if (!isPremium && scanCount >= 1) {
    //   setShowPaywall(true);
    //   return;
    // }

    let targetUrl = url;
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    setIsScanning(true);
    setError(null);
    setResult(null);
    setSelectedCategory(null);

    try {
      let data: ScanResult;

      if (!isPremium) {
        const res = await fetch('/api/scan-free', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl })
        });
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || t.errors.freeScan);
        }
        
        data = await res.json();
      } else {
        // SECURE: Call our backend instead of direct Gemini API
        const res = await fetch('/api/scan-premium', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || t.errors.premiumScan);
        }
        data = await res.json();
      }

      data.issues = data.issues.map(issue => ({ ...issue, category: normalizeCategory(issue.category) }));
      setResult(data);
      
      const newHistoryItem: ScanHistoryItem = {
        url: targetUrl,
        date: new Date().toISOString(),
        score: data.overallScore
      };
      
      const updatedHistory = [newHistoryItem, ...scanHistory].slice(0, 10);
      setScanHistory(updatedHistory);
      localStorage.setItem('siteScannerHistory', JSON.stringify(updatedHistory));
      
      if (!isPremium) {
        const newCount = scanCount + 1;
        setScanCount(newCount);
        localStorage.setItem('siteScannerScans', newCount.toString());
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || t.errors.scanFailed);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/create-checkout-session', { method: 'POST' });
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

  return (
    <HelmetProvider>
      <div className="min-h-screen flex flex-col selection:bg-accent selection:text-white">
        <Helmet>
          <title>SiteScanner Pro_ | AI-Driven Website Analysis</title>
          <meta name="description" content={t.hero.description} />
          <link rel="canonical" href="https://sitescanner.pro" />
        </Helmet>

        <Header view={view} setView={setView} isPremium={isPremium} language={language} setLanguage={setLanguage} t={t} />
        <DataFlowBackground />

        <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-24 w-full relative z-10">
          <AnimatePresence mode="wait">
            {showPaywall && (
              <Paywall 
                onClose={() => setShowPaywall(false)} 
                onCheckout={handleCheckout} 
                t={t}
              />
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
                  setSelectedCategory={setSelectedCategory} t={t}
                />
              )}

              {!result && !isScanning && (
                <>
                  <FeatureList t={t} />
                  <HistoryList history={scanHistory} t={t} />
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
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-5xl font-display font-bold uppercase">{t.about.title}</h2>
              <p className="font-mono text-lg text-ink/70">
                {t.about.description}
              </p>
            </div>
          )}
        </main>
      </div>
    </HelmetProvider>
  );
}