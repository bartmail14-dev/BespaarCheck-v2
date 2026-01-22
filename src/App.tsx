import { ThemeProvider } from './context/ThemeContext';
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { SavingsSection } from './components/SavingsSection';
import { CalculatorSection } from './components/CalculatorSection';
import { RegulationsSection } from './components/RegulationsSection';
import { Footer } from './components/Footer';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <Navigation />
        <main>
          <HeroSection />
          <SavingsSection />
          <CalculatorSection />
          <RegulationsSection />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
