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

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div id="top" className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
          <Navigation />
          <main>
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
