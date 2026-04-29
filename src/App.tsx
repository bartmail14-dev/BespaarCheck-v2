import { lazy, Suspense, useEffect, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { useLanguage } from './context/LanguageContext';

const SavingsSection = lazy(() =>
  import('./components/SavingsSection').then((module) => ({ default: module.SavingsSection }))
);
const CalculatorSection = lazy(() =>
  import('./components/CalculatorSection').then((module) => ({ default: module.CalculatorSection }))
);
const RegulationsSection = lazy(() =>
  import('./components/RegulationsSection').then((module) => ({ default: module.RegulationsSection }))
);
const FAQSection = lazy(() =>
  import('./components/FAQSection').then((module) => ({ default: module.FAQSection }))
);
const Footer = lazy(() =>
  import('./components/Footer').then((module) => ({ default: module.Footer }))
);
const BespaarChatbot = lazy(() =>
  import('./components/BespaarChatbot').then((module) => ({ default: module.BespaarChatbot }))
);

function SkipLink() {
  const { isEnglish } = useLanguage();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-emerald-800 focus:shadow-xl"
    >
      {isEnglish ? 'Skip to content' : 'Direct naar inhoud'}
    </a>
  );
}

function SectionFallback() {
  return (
    <div className="bg-white px-5 py-10 dark:bg-gray-900 sm:px-6">
      <div className="mx-auto h-24 max-w-5xl animate-pulse rounded-lg bg-gray-100 dark:bg-slate-800" />
    </div>
  );
}

function DeferredChatbot() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const idle = window.requestIdleCallback || ((callback: IdleRequestCallback) => window.setTimeout(callback, 1200));
    const cancelIdle = window.cancelIdleCallback || window.clearTimeout;
    const handle = idle(() => setIsReady(true));

    return () => cancelIdle(handle);
  }, []);

  if (!isReady) return null;

  return (
    <Suspense fallback={null}>
      <BespaarChatbot />
    </Suspense>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div id="top" className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
          <SkipLink />
          <Navigation />
          <main id="main-content">
            <HeroSection />
            <Suspense fallback={<SectionFallback />}>
              <SavingsSection />
              <CalculatorSection />
              <RegulationsSection />
              <FAQSection />
            </Suspense>
          </main>
          <Suspense fallback={<SectionFallback />}>
            <Footer />
          </Suspense>
          <DeferredChatbot />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
