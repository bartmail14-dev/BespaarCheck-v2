import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { SavingsSection } from './components/SavingsSection';
import { CalculatorSection } from './components/CalculatorSection';
import { RegulationsSection } from './components/RegulationsSection';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { BespaarChatbot } from './components/BespaarChatbot';
import { useLanguage } from './context/LanguageContext';

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

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div id="top" className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
          <SkipLink />
          <Navigation />
          <main id="main-content">
            <HeroSection />
            <SavingsSection />
            <CalculatorSection />
            <RegulationsSection />
            <FAQSection />
          </main>
          <Footer />
          <BespaarChatbot />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
