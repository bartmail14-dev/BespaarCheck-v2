import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Building2, Zap, Euro, Users, CheckCircle, Sparkles, TrendingDown, Leaf, ArrowRight, Cpu, Sun, Battery, Car, Thermometer, Settings, ChevronDown, ArrowDownUp, Mail, User, Building, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Energie prijzen interface
interface EnergyPrices {
  electricity: number;
  gas: number;
  feedInTariff: number;
  lastUpdated: Date | null;
  isLive: boolean;
}

// Default prijzen als fallback
const DEFAULT_PRICES: EnergyPrices = {
  electricity: 0.28,
  gas: 1.25,
  feedInTariff: 0.07,
  lastUpdated: null,
  isLive: false,
};

// Functie om energieprijzen op te halen van EnergyZero API
async function fetchEnergyPrices(): Promise<EnergyPrices> {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    // Fetch elektriciteit prijzen (usageType=1 voor elektra)
    const elecResponse = await fetch(
      `https://api.energyzero.nl/v1/energyprices?fromDate=${formatDate(today)}&tillDate=${formatDate(tomorrow)}&interval=4&usageType=1&inclBtw=true`
    );

    // Fetch gas prijzen (usageType=3 voor gas)
    const gasResponse = await fetch(
      `https://api.energyzero.nl/v1/energyprices?fromDate=${formatDate(today)}&tillDate=${formatDate(tomorrow)}&interval=4&usageType=3&inclBtw=true`
    );

    if (!elecResponse.ok || !gasResponse.ok) {
      throw new Error('API response not ok');
    }

    const elecData = await elecResponse.json();
    const gasData = await gasResponse.json();

    // Bereken gemiddelde prijs van vandaag
    const elecPrices = elecData.Prices || [];
    const gasPrices = gasData.Prices || [];

    const avgElec = elecPrices.length > 0
      ? elecPrices.reduce((sum: number, p: { price: number }) => sum + p.price, 0) / elecPrices.length
      : DEFAULT_PRICES.electricity;

    const avgGas = gasPrices.length > 0
      ? gasPrices.reduce((sum: number, p: { price: number }) => sum + p.price, 0) / gasPrices.length
      : DEFAULT_PRICES.gas;

    // Zakelijke tarieven zijn exclusief BTW, dus we moeten BTW eraf halen voor zakelijk
    // en energiebelasting toevoegen (indicatief)
    const zakelijkElec = avgElec * 0.79 + 0.05; // -21% BTW, +€0.05 energiebelasting zakelijk
    const zakelijkGas = avgGas * 0.79 + 0.15; // -21% BTW, +€0.15 energiebelasting zakelijk

    return {
      electricity: Math.round(zakelijkElec * 1000) / 1000,
      gas: Math.round(zakelijkGas * 1000) / 1000,
      feedInTariff: 0.07, // Teruglevertarief is relatief stabiel
      lastUpdated: new Date(),
      isLive: true,
    };
  } catch (error) {
    console.warn('Kon energieprijzen niet ophalen, gebruik defaults:', error);
    return { ...DEFAULT_PRICES, lastUpdated: new Date(), isLive: false };
  }
}

const baseSteps = [
  { id: 1, label: 'Bedrijf', icon: Building2 },
  { id: 2, label: 'Verbruik', icon: Zap },
  { id: 3, label: 'Installaties', icon: Sun },
  { id: 'solar', label: 'Teruglevering', icon: ArrowDownUp, conditional: true },
  { id: 4, label: 'Contract', icon: Euro },
  { id: 5, label: 'Prioriteiten', icon: Users },
  { id: 6, label: 'Contact', icon: Mail },
];

const businessTypes = [
  { value: '', label: 'Selecteer type...' },
  { value: 'retail', label: 'Retail / Winkel' },
  { value: 'office', label: 'Kantoor' },
  { value: 'warehouse', label: 'Magazijn / Logistiek' },
  { value: 'production', label: 'Productie / Industrie' },
  { value: 'hospitality', label: 'Horeca' },
  { value: 'healthcare', label: 'Zorg' },
  { value: 'other', label: 'Anders' },
];

const businessRanges: Record<string, {
  buildingSize: { min: number; max: number; default: number; step: number };
  electricity: { min: number; max: number; default: number; step: number };
  gas: { min: number; max: number; default: number; step: number };
}> = {
  '': { buildingSize: { min: 50, max: 5000, default: 500, step: 50 }, electricity: { min: 2500, max: 500000, default: 25000, step: 2500 }, gas: { min: 0, max: 100000, default: 10000, step: 500 } },
  retail: { buildingSize: { min: 25, max: 2000, default: 150, step: 25 }, electricity: { min: 2500, max: 150000, default: 15000, step: 2500 }, gas: { min: 0, max: 30000, default: 5000, step: 500 } },
  office: { buildingSize: { min: 50, max: 5000, default: 300, step: 50 }, electricity: { min: 2500, max: 300000, default: 25000, step: 2500 }, gas: { min: 0, max: 50000, default: 8000, step: 500 } },
  warehouse: { buildingSize: { min: 200, max: 25000, default: 2000, step: 100 }, electricity: { min: 5000, max: 750000, default: 75000, step: 5000 }, gas: { min: 0, max: 150000, default: 20000, step: 1000 } },
  production: { buildingSize: { min: 500, max: 50000, default: 3000, step: 250 }, electricity: { min: 25000, max: 2000000, default: 250000, step: 10000 }, gas: { min: 5000, max: 500000, default: 50000, step: 2500 } },
  hospitality: { buildingSize: { min: 50, max: 1500, default: 150, step: 25 }, electricity: { min: 5000, max: 200000, default: 30000, step: 2500 }, gas: { min: 2500, max: 75000, default: 15000, step: 500 } },
  healthcare: { buildingSize: { min: 100, max: 15000, default: 1000, step: 100 }, electricity: { min: 25000, max: 1000000, default: 100000, step: 5000 }, gas: { min: 5000, max: 200000, default: 30000, step: 1000 } },
  other: { buildingSize: { min: 25, max: 10000, default: 300, step: 25 }, electricity: { min: 2500, max: 500000, default: 25000, step: 2500 }, gas: { min: 0, max: 100000, default: 10000, step: 500 } },
};

// CO2 emissiefactoren
const CO2_FACTORS = {
  electricity: 0.4, // kg CO2/kWh (NL grid mix)
  gas: 1.8, // kg CO2/m³
};

// Sector-specifieke energieprofielen (% van totaal elektriciteitsverbruik)
const SECTOR_PROFILES: Record<string, {
  lighting: number;
  cooling: number;
  heating: number;
  equipment: number;
  peakLoadFactor: number; // Hoe goed ze kunnen profiteren van dynamische prijzen
}> = {
  retail: { lighting: 0.35, cooling: 0.20, heating: 0.15, equipment: 0.30, peakLoadFactor: 0.6 },
  office: { lighting: 0.30, cooling: 0.25, heating: 0.20, equipment: 0.25, peakLoadFactor: 0.4 },
  warehouse: { lighting: 0.40, cooling: 0.10, heating: 0.25, equipment: 0.25, peakLoadFactor: 0.7 },
  production: { lighting: 0.15, cooling: 0.15, heating: 0.20, equipment: 0.50, peakLoadFactor: 0.5 },
  hospitality: { lighting: 0.25, cooling: 0.30, heating: 0.25, equipment: 0.20, peakLoadFactor: 0.3 },
  healthcare: { lighting: 0.20, cooling: 0.25, heating: 0.30, equipment: 0.25, peakLoadFactor: 0.2 },
  other: { lighting: 0.25, cooling: 0.20, heating: 0.25, equipment: 0.30, peakLoadFactor: 0.5 },
};

// Besparingsmaatregelen met realistische percentages en kosten
const SAVINGS_MEASURES = {
  led: {
    name: 'LED-verlichting',
    savingsPercent: 0.60, // 60% besparing op verlichting
    investmentPerM2: 12, // €/m²
    lifespan: 15,
  },
  solar: {
    name: 'Zonnepanelen',
    kWhPerKwp: 900, // kWh opbrengst per kWp per jaar in NL
    costPerKwp: 1000, // € per kWp geïnstalleerd
    roofFactorPerM2: 0.15, // kWp per m² dakoppervlak (≈ 60% van vloeroppervlak bruikbaar)
    lifespan: 25,
  },
  heatpump: {
    name: 'Warmtepomp',
    cop: 4, // Coefficient of Performance
    gasSavingsPercent: 0.85, // Vervangt 85% van gasverbruik
    electricityIncrease: 0.25, // Maar verhoogt elektriciteit
    baseCost: 15000,
    costPerM2: 30,
    lifespan: 20,
  },
  ems: {
    name: 'Energiemanagementsysteem',
    savingsPercent: 0.12, // 12% totale besparing
    baseCost: 3000,
    costPerM2: 5,
    lifespan: 10,
  },
  insulation: {
    name: 'Isolatie verbetering',
    heatingSavingsPercent: 0.30,
    costPerM2: 45,
    lifespan: 30,
  },
  smartThermostat: {
    name: 'Slimme thermostaat',
    heatingSavingsPercent: 0.12,
    baseCost: 500,
    lifespan: 10,
  },
  dynamicContract: {
    name: 'Dynamisch energiecontract',
    savingsPercent: 0.15, // Basis 15%, aangepast op sector
  },
};

interface Recommendation {
  name: string;
  yearlySavings: number;
  investment: number;
  paybackYears: number;
  co2Reduction: number;
  priority: 'high' | 'medium' | 'low';
}

interface CalculationResult {
  currentCosts: {
    electricity: number;
    gas: number;
    total: number;
  };
  yearlySavings: number;
  co2Reduction: number;
  paybackPeriod: number;
  recommendations: Recommendation[];
  totalInvestment: number;
}

export function CalculatorSection() {
  const { isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState<number | 'solar'>(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationPhase, setCalculationPhase] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [formData, setFormData] = useState({
    businessType: '',
    buildingSize: 500,
    electricityUsage: 50000,
    gasUsage: 15000,
    existingInstallations: [] as string[],
    solarFeedIn: 0, // kWh per year fed back to grid
    contractType: '',
    priorities: [] as string[],
    contactName: '',
    companyName: '',
    email: '',
  });
  const [activeDropdown, setActiveDropdown] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [energyPrices, setEnergyPrices] = useState<EnergyPrices>(DEFAULT_PRICES);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Fetch energy prices on mount
  useEffect(() => {
    const loadPrices = async () => {
      setIsLoadingPrices(true);
      const prices = await fetchEnergyPrices();
      setEnergyPrices(prices);
      setIsLoadingPrices(false);
    };
    loadPrices();
  }, []);

  // Dynamic steps based on solar panel selection
  const hasSolarPanels = formData.existingInstallations.includes('solar');
  const steps = useMemo(() => {
    return baseSteps.filter(step => !step.conditional || (step.id === 'solar' && hasSolarPanels));
  }, [hasSolarPanels]);

  const currentRanges = businessRanges[formData.businessType] || businessRanges[''];

  useEffect(() => {
    if (formData.businessType) {
      const ranges = businessRanges[formData.businessType];
      setFormData(prev => ({
        ...prev,
        buildingSize: ranges.buildingSize.default,
        electricityUsage: ranges.electricity.default,
        gasUsage: ranges.gas.default,
      }));
    }
  }, [formData.businessType]);

  // Calculate progress based on current step position in dynamic steps array
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const progress = currentStepIndex >= 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0;

  useEffect(() => {
    if (isCalculating) {
      const interval = setInterval(() => {
        setCalculationPhase((prev) => prev + 1);
      }, 400);
      return () => clearInterval(interval);
    }
  }, [isCalculating]);

  const calculateResults = useCallback((): CalculationResult => {
    const profile = SECTOR_PROFILES[formData.businessType] || SECTOR_PROFILES.other;

    // Huidige energiekosten berekenen met live prijzen
    const currentCosts = {
      electricity: formData.electricityUsage * energyPrices.electricity,
      gas: formData.gasUsage * energyPrices.gas,
      total: 0,
    };
    currentCosts.total = currentCosts.electricity + currentCosts.gas;

    // Huidige CO2 uitstoot
    const currentCO2 = (formData.electricityUsage * CO2_FACTORS.electricity + formData.gasUsage * CO2_FACTORS.gas) / 1000; // ton

    const recommendations: Recommendation[] = [];
    const hasInstallation = (id: string) => formData.existingInstallations.includes(id);

    // 1. LED-verlichting (als ze het nog niet hebben)
    if (!hasInstallation('led')) {
      const lightingUsage = formData.electricityUsage * profile.lighting;
      const savingsKwh = lightingUsage * SAVINGS_MEASURES.led.savingsPercent;
      const yearlySavings = savingsKwh * energyPrices.electricity;
      const investment = formData.buildingSize * SAVINGS_MEASURES.led.investmentPerM2;
      const co2Reduction = savingsKwh * CO2_FACTORS.electricity / 1000;

      if (yearlySavings > 200) {
        recommendations.push({
          name: 'LED-verlichting',
          yearlySavings: Math.round(yearlySavings),
          investment: Math.round(investment),
          paybackYears: Math.round((investment / yearlySavings) * 10) / 10,
          co2Reduction: Math.round(co2Reduction * 10) / 10,
          priority: yearlySavings > 1000 ? 'high' : 'medium',
        });
      }
    }

    // 2. Zonnepanelen (als ze het nog niet hebben)
    if (!hasInstallation('solar')) {
      // Schat dakoppervlak: ~60% van vloeroppervlak bruikbaar
      const roofArea = formData.buildingSize * 0.6;
      const possibleKwp = roofArea * SAVINGS_MEASURES.solar.roofFactorPerM2;
      const maxKwp = Math.min(possibleKwp, formData.electricityUsage / SAVINGS_MEASURES.solar.kWhPerKwp); // Niet meer dan je verbruikt
      const solarProduction = maxKwp * SAVINGS_MEASURES.solar.kWhPerKwp;

      // Eigen verbruik vs teruglevering (schatting: 70% eigen verbruik voor bedrijven)
      const eigenVerbruik = solarProduction * 0.7;
      const teruglevering = solarProduction * 0.3;

      const yearlySavings = eigenVerbruik * energyPrices.electricity + teruglevering * energyPrices.feedInTariff;
      const investment = maxKwp * SAVINGS_MEASURES.solar.costPerKwp;
      const co2Reduction = solarProduction * CO2_FACTORS.electricity / 1000;

      if (maxKwp > 5 && yearlySavings > 500) {
        recommendations.push({
          name: `Zonnepanelen (${Math.round(maxKwp)} kWp)`,
          yearlySavings: Math.round(yearlySavings),
          investment: Math.round(investment),
          paybackYears: Math.round((investment / yearlySavings) * 10) / 10,
          co2Reduction: Math.round(co2Reduction * 10) / 10,
          priority: 'high',
        });
      }
    }

    // 3. Warmtepomp (als ze gas gebruiken en nog geen warmtepomp hebben)
    if (!hasInstallation('heatpump') && formData.gasUsage > 2000) {
      const gasForHeating = formData.gasUsage * 0.85; // 85% van gas is voor verwarming
      const gasSavings = gasForHeating * SAVINGS_MEASURES.heatpump.gasSavingsPercent;
      const extraElectricity = (gasSavings * 9.77) / SAVINGS_MEASURES.heatpump.cop; // 9.77 kWh/m³ gas equivalent

      const yearlySavings = (gasSavings * energyPrices.gas) - (extraElectricity * energyPrices.electricity);
      const investment = SAVINGS_MEASURES.heatpump.baseCost + (formData.buildingSize * SAVINGS_MEASURES.heatpump.costPerM2);
      const co2Reduction = (gasSavings * CO2_FACTORS.gas - extraElectricity * CO2_FACTORS.electricity) / 1000;

      if (yearlySavings > 500) {
        recommendations.push({
          name: 'Warmtepomp',
          yearlySavings: Math.round(yearlySavings),
          investment: Math.round(investment),
          paybackYears: Math.round((investment / yearlySavings) * 10) / 10,
          co2Reduction: Math.round(co2Reduction * 10) / 10,
          priority: co2Reduction > 5 ? 'high' : 'medium',
        });
      }
    }

    // 4. Energiemanagementsysteem (als ze het nog niet hebben)
    if (!hasInstallation('ems') && currentCosts.total > 10000) {
      const yearlySavings = currentCosts.total * SAVINGS_MEASURES.ems.savingsPercent;
      const investment = SAVINGS_MEASURES.ems.baseCost + (formData.buildingSize * SAVINGS_MEASURES.ems.costPerM2);
      const co2Reduction = currentCO2 * SAVINGS_MEASURES.ems.savingsPercent;

      recommendations.push({
        name: 'Energiemanagementsysteem (EMS)',
        yearlySavings: Math.round(yearlySavings),
        investment: Math.round(investment),
        paybackYears: Math.round((investment / yearlySavings) * 10) / 10,
        co2Reduction: Math.round(co2Reduction * 10) / 10,
        priority: currentCosts.total > 25000 ? 'high' : 'medium',
      });
    }

    // 5. Slimme thermostaat (als ze gas gebruiken)
    if (formData.gasUsage > 1000 && !hasInstallation('heatpump')) {
      const heatingCosts = formData.gasUsage * energyPrices.gas * 0.85;
      const yearlySavings = heatingCosts * SAVINGS_MEASURES.smartThermostat.heatingSavingsPercent;
      const investment = SAVINGS_MEASURES.smartThermostat.baseCost;
      const co2Reduction = (formData.gasUsage * 0.85 * SAVINGS_MEASURES.smartThermostat.heatingSavingsPercent * CO2_FACTORS.gas) / 1000;

      if (yearlySavings > 100) {
        recommendations.push({
          name: 'Slimme thermostaat',
          yearlySavings: Math.round(yearlySavings),
          investment: Math.round(investment),
          paybackYears: Math.round((investment / yearlySavings) * 10) / 10,
          co2Reduction: Math.round(co2Reduction * 10) / 10,
          priority: 'low',
        });
      }
    }

    // 6. Dynamisch contract (als ze dat nog niet hebben)
    if (formData.contractType !== 'dynamic') {
      const potentialSavings = currentCosts.electricity * SAVINGS_MEASURES.dynamicContract.savingsPercent * profile.peakLoadFactor;

      if (potentialSavings > 200) {
        recommendations.push({
          name: 'Overstappen naar dynamisch contract',
          yearlySavings: Math.round(potentialSavings),
          investment: 0,
          paybackYears: 0,
          co2Reduction: 0, // Indirect effect
          priority: potentialSavings > 1000 ? 'high' : 'medium',
        });
      }
    }

    // Sorteer op jaarlijkse besparing (hoogste eerst)
    recommendations.sort((a, b) => b.yearlySavings - a.yearlySavings);

    // Bereken totalen (top 5 maatregelen)
    const topRecommendations = recommendations.slice(0, 5);
    const totalYearlySavings = topRecommendations.reduce((sum, r) => sum + r.yearlySavings, 0);
    const totalInvestment = topRecommendations.reduce((sum, r) => sum + r.investment, 0);
    const totalCO2Reduction = topRecommendations.reduce((sum, r) => sum + r.co2Reduction, 0);
    const avgPayback = totalInvestment > 0 ? totalInvestment / totalYearlySavings : 0;

    return {
      currentCosts,
      yearlySavings: totalYearlySavings,
      co2Reduction: Math.round(totalCO2Reduction * 10) / 10,
      paybackPeriod: Math.round(avgPayback * 10) / 10,
      recommendations: topRecommendations,
      totalInvestment,
    };
  }, [formData, energyPrices]);

  const handleNext = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    const isLastStep = currentIndex === steps.length - 1;

    if (!isLastStep) {
      setTransitionDirection('forward');
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(steps[currentIndex + 1].id as number | 'solar');
        setTimeout(() => setIsTransitioning(false), 50);
      }, 200);
    } else {
      setIsCalculating(true);
      setCalculationPhase(0);
      setTimeout(() => {
        setIsCalculating(false);
        setResults(calculateResults());
        setShowResults(true);
      }, 2800);
    }
  };

  const handlePrevious = () => {
    if (showResults) {
      setShowResults(false);
      setResults(null);
      return;
    }
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setTransitionDirection('backward');
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(steps[currentIndex - 1].id as number | 'solar');
        setTimeout(() => setIsTransitioning(false), 50);
      }, 200);
    }
  };

  const resetCalculator = () => {
    setShowResults(false);
    setResults(null);
    setCurrentStep(1);
    setFormData({ businessType: '', buildingSize: 500, electricityUsage: 50000, gasUsage: 15000, existingInstallations: [], solarFeedIn: 0, contractType: '', priorities: [], contactName: '', companyName: '', email: '' });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${Math.round(num / 1000)}k`;
    return num.toString();
  };

  return (
    <section
      id="calculator"
      ref={containerRef}
      className="py-24 relative overflow-hidden transition-colors duration-300"
      style={{
        background: isDark
          ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
          : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
      }}
    >
      {/* Subtle decorative elements */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(13, 148, 136, 0.3) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Bereken uw besparing
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Vul uw gegevens in en ontdek direct wat u kunt besparen op uw energiekosten
          </p>
        </div>

        {/* Main Calculator Container */}
        <div
          ref={cardRef}
          className="relative"
        >
          {/* Main card */}
          <div
            className="relative rounded-2xl overflow-hidden bg-white dark:bg-gray-800"
            style={{
              boxShadow: isDark
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 20px 50px -12px rgba(0, 0, 0, 0.5)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 20px 50px -12px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* Top accent line */}
            <div
              className="h-1 w-full"
              style={{
                background: 'linear-gradient(90deg, #0d9488 0%, #059669 50%, #16a34a 100%)',
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: isDark
                    ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)'
                    : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                  animation: 'shimmer-line 5s ease-in-out infinite',
                }}
              />
            </div>

            {/* Corner accents */}
            {/* Clean Stepper */}
            <div className="px-4 sm:px-8 pt-8 pb-6">
              <div className="flex items-center justify-between relative">
                {/* Connection line */}
                <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 ease-out bg-emerald-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStepIndex > index;

                  return (
                    <div key={step.id} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isActive
                            ? 'bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-900'
                            : isCompleted
                            ? 'bg-emerald-500'
                            : 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <Icon className={`w-5 h-5 ${isActive || isCompleted ? 'text-white' : 'text-gray-400'}`} />
                        )}
                      </div>
                      <span
                        className={`mt-2 text-xs font-medium transition-all duration-300 ${
                          isActive ? 'text-emerald-600 dark:text-emerald-400' : isCompleted ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Content */}
            <div className="px-4 sm:px-8 pb-6 sm:pb-8">
              <div className="rounded-xl p-4 sm:p-8 min-h-[350px] bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                {/* Calculation Animation */}
                {isCalculating && (
                  <div className="flex flex-col items-center justify-center h-[350px] relative">
                    {/* Simple spinning loader */}
                    <div className="relative w-24 h-24 mb-6">
                      {/* Outer ring */}
                      <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-600" />
                      {/* Spinning ring */}
                      <div
                        className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500"
                        style={{ animation: 'spin 1s linear infinite' }}
                      />
                      {/* Center icon */}
                      <div className="absolute inset-3 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Cpu className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Status text */}
                    <div className="text-center">
                      <p className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        {['Analyseren...', 'Berekenen...', 'Optimaliseren...', 'Afronden...'][calculationPhase % 4]}
                      </p>

                      {/* Progress bar */}
                      <div className="h-2 w-64 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mx-auto">
                        <div
                          className="h-full rounded-full transition-all duration-300 bg-emerald-500"
                          style={{
                            width: `${Math.min((calculationPhase / 6) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Results */}
                {showResults && results && !isCalculating && (
                  <div className="animate-fade-in">
                    {/* Success header */}
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500 mb-3">
                        <CheckCircle className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Uw Besparingsanalyse</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Gebaseerd op actuele energieprijzen en uw bedrijfsprofiel</p>
                    </div>

                    {/* Current costs context */}
                    <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-6">
                      <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
                        Uw geschatte huidige energiekosten: <span className="font-bold text-gray-900 dark:text-white">€{results.currentCosts.total.toLocaleString()}</span>/jaar
                        <span className="text-gray-400 ml-2">(€{results.currentCosts.electricity.toLocaleString()} elektra + €{results.currentCosts.gas.toLocaleString()} gas)</span>
                      </p>
                      <div className="mt-2 flex items-center justify-center gap-2 text-xs">
                        {energyPrices.isLive ? (
                          <>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Live prijzen
                            </span>
                            <span className="text-gray-400 dark:text-gray-500">
                              €{energyPrices.electricity.toFixed(3)}/kWh • €{energyPrices.gas.toFixed(2)}/m³
                            </span>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                            <RefreshCw className="w-3 h-3" />
                            Indicatieve prijzen
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                      {[
                        { label: 'Potentiële besparing', value: `€${results.yearlySavings.toLocaleString()}`, sub: '/jaar', icon: Euro, color: '#0891b2', bg: 'bg-cyan-50 dark:bg-cyan-900/30', border: 'border-cyan-100 dark:border-cyan-800' },
                        { label: 'CO₂ reductie', value: `${results.co2Reduction}`, sub: ' ton/jaar', icon: Leaf, color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-100 dark:border-emerald-800' },
                        { label: 'Gem. terugverdientijd', value: `${results.paybackPeriod}`, sub: ' jaar', icon: TrendingDown, color: '#8b5cf6', bg: 'bg-violet-50 dark:bg-violet-900/30', border: 'border-violet-100 dark:border-violet-800' },
                      ].map((stat, i) => (
                        <div
                          key={i}
                          className={`p-4 rounded-xl ${stat.bg} border ${stat.border}`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: stat.color }}
                            >
                              <stat.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400 text-xs">{stat.label}</p>
                              <p className="text-2xl font-bold" style={{ color: stat.color }}>
                                {stat.value}<span className="text-sm font-normal text-gray-500 dark:text-gray-400">{stat.sub}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Detailed Recommendations */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-500" />
                        Aanbevolen maatregelen
                      </h4>
                      <div className="space-y-2">
                        {results.recommendations.map((rec, i) => (
                          <div
                            key={i}
                            className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  rec.priority === 'high' ? 'bg-emerald-500' : rec.priority === 'medium' ? 'bg-amber-500' : 'bg-gray-400'
                                }`}>
                                  <span className="text-white font-bold text-sm">{i + 1}</span>
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 dark:text-white truncate">{rec.name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {rec.investment > 0 ? `Investering: €${rec.investment.toLocaleString()}` : 'Geen investering nodig'}
                                    {rec.paybackYears > 0 && ` • Terugverdientijd: ${rec.paybackYears} jaar`}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-emerald-600 dark:text-emerald-400">€{rec.yearlySavings.toLocaleString()}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">/jaar</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {results.totalInvestment > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                          Totale geschatte investering: €{results.totalInvestment.toLocaleString()}
                        </p>
                      )}
                    </div>

                    {/* Disclaimer */}
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 mb-6">
                      <p className="text-amber-800 dark:text-amber-200 text-xs text-center">
                        Dit is een indicatieve berekening. Werkelijke besparingen kunnen afwijken en zijn afhankelijk van specifieke omstandigheden.
                      </p>
                    </div>

                    {/* CTA Section */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={resetCalculator}
                        className="px-6 py-3 rounded-xl font-medium border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-all"
                      >
                        <span className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 rotate-180" />
                          Nieuwe berekening
                        </span>
                      </button>
                      <button
                        className="flex-1 px-8 py-4 rounded-xl font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-all hover:shadow-lg"
                      >
                        <span className="flex items-center justify-center gap-2">
                          Vraag gratis adviesgesprek aan
                          <ArrowRight className="w-5 h-5" />
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Form Steps with Slide Transitions */}
                {!showResults && !isCalculating && (
                  <div
                    className={`step-transition ${isTransitioning ? 'transitioning' : ''} ${transitionDirection}`}
                    style={{
                      animation: !isTransitioning ? 'step-slide-in 0.4s ease-out' : 'step-slide-out 0.2s ease-in',
                      animationFillMode: 'both',
                    }}
                  >
                    {/* Step 1: Business Info */}
                    {currentStep === 1 && (
                      <div>
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Vertel ons over uw bedrijf</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">We stemmen de analyse af op uw sector</p>
                          </div>
                        </div>

                        {/* Dropdown */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Bedrijfstype
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setActiveDropdown(!activeDropdown)}
                              className={`w-full px-4 py-3 rounded-lg text-left flex items-center justify-between transition-all bg-white dark:bg-gray-800 border ${
                                activeDropdown ? 'border-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-900' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                              }`}
                            >
                              <span className={`${formData.businessType ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                {businessTypes.find(t => t.value === formData.businessType)?.label || 'Selecteer type...'}
                              </span>
                              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${activeDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {activeDropdown && (
                              <div className="absolute z-50 w-full mt-1 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg">
                                {businessTypes.slice(1).map((type) => (
                                  <button
                                    key={type.value}
                                    onClick={() => {
                                      setFormData({ ...formData, businessType: type.value });
                                      setActiveDropdown(false);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left transition-colors flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                      formData.businessType === type.value ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''
                                    }`}
                                  >
                                    <span className={formData.businessType === type.value ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-gray-700 dark:text-gray-300'}>
                                      {type.label}
                                    </span>
                                    {formData.businessType === type.value && (
                                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Building Size Slider */}
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Bedrijfspand grootte
                          </label>
                          <div className="relative p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                              <span className="text-gray-400 dark:text-gray-400 text-sm">{currentRanges.buildingSize.min.toLocaleString()} m²</span>
                              <div className="px-6 py-2 rounded-full bg-emerald-500">
                                <span className="text-2xl font-bold text-white">{formData.buildingSize.toLocaleString()}</span>
                                <span className="text-sm text-white/80 ml-1">m²</span>
                              </div>
                              <span className="text-gray-400 dark:text-gray-400 text-sm">{currentRanges.buildingSize.max.toLocaleString()} m²</span>
                            </div>
                            <input
                              type="range"
                              min={currentRanges.buildingSize.min}
                              max={currentRanges.buildingSize.max}
                              step={currentRanges.buildingSize.step}
                              value={formData.buildingSize}
                              onChange={(e) => setFormData({ ...formData, buildingSize: parseInt(e.target.value) })}
                              className="premium-slider w-full"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Usage - Premium */}
                    {currentStep === 2 && (
                      <div>
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Uw energieverbruik</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Dit helpt ons de besparing te berekenen</p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {/* Electricity Slider */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Elektriciteitsverbruik
                            </label>
                            <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                              <div className="flex justify-between items-center mb-6">
                                <span className="text-gray-400 dark:text-gray-400 text-sm">{formatNumber(currentRanges.electricity.min)} kWh</span>
                                <div className="px-6 py-2 rounded-full bg-amber-500">
                                  <span className="text-2xl font-bold text-white">{formData.electricityUsage.toLocaleString()}</span>
                                  <span className="text-sm text-white/80 ml-1">kWh/jaar</span>
                                </div>
                                <span className="text-gray-400 dark:text-gray-400 text-sm">{formatNumber(currentRanges.electricity.max)} kWh</span>
                              </div>
                              <input
                                type="range"
                                min={currentRanges.electricity.min}
                                max={currentRanges.electricity.max}
                                step={currentRanges.electricity.step}
                                value={formData.electricityUsage}
                                onChange={(e) => setFormData({ ...formData, electricityUsage: parseInt(e.target.value) })}
                                className="premium-slider premium-slider-yellow w-full"
                              />
                            </div>
                          </div>

                          {/* Gas Slider */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Gasverbruik
                            </label>
                            <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                              <div className="flex justify-between items-center mb-6">
                                <span className="text-gray-400 dark:text-gray-400 text-sm">{formatNumber(currentRanges.gas.min)} m³</span>
                                <div className="px-6 py-2 rounded-full bg-orange-500">
                                  <span className="text-2xl font-bold text-white">{formData.gasUsage.toLocaleString()}</span>
                                  <span className="text-sm text-white/80 ml-1">m³/jaar</span>
                                </div>
                                <span className="text-gray-400 dark:text-gray-400 text-sm">{formatNumber(currentRanges.gas.max)} m³</span>
                              </div>
                              <input
                                type="range"
                                min={currentRanges.gas.min}
                                max={currentRanges.gas.max}
                                step={currentRanges.gas.step}
                                value={formData.gasUsage}
                                onChange={(e) => setFormData({ ...formData, gasUsage: parseInt(e.target.value) })}
                                className="premium-slider premium-slider-orange w-full"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Installations - Premium */}
                    {currentStep === 3 && (
                      <div>
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
                            <Sun className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Huidige installaties</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Selecteer wat u al heeft geïnstalleerd</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            { id: 'solar', label: 'Zonnepanelen', desc: 'Eigen stroomopwekking', icon: Sun, color: '#f59e0b' },
                            { id: 'heatpump', label: 'Warmtepomp', desc: 'Efficiënte verwarming', icon: Thermometer, color: '#ef4444' },
                            { id: 'charging', label: 'Laadpalen', desc: 'Elektrisch rijden', icon: Car, color: '#3b82f6' },
                            { id: 'battery', label: 'Batterijopslag', desc: 'Energie bufferen', icon: Battery, color: '#10b981' },
                            { id: 'ems', label: 'EMS Systeem', desc: 'Slim energiebeheer', icon: Settings, color: '#8b5cf6' },
                          ].map((option) => {
                            const isSelected = formData.existingInstallations.includes(option.id);
                            const Icon = option.icon;
                            return (
                              <button
                                key={option.id}
                                onClick={() => {
                                  const newInstallations = isSelected
                                    ? formData.existingInstallations.filter((i) => i !== option.id)
                                    : [...formData.existingInstallations, option.id];
                                  setFormData({ ...formData, existingInstallations: newInstallations });
                                }}
                                className={`p-4 rounded-xl text-left transition-all border-2 ${
                                  isSelected
                                    ? 'border-current bg-opacity-10'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                                }`}
                                style={{
                                  borderColor: isSelected ? option.color : undefined,
                                  backgroundColor: isSelected ? `${option.color}10` : undefined,
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: option.color }}
                                  >
                                    <Icon className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{option.desc}</p>
                                  </div>
                                  {isSelected && (
                                    <CheckCircle className="w-5 h-5" style={{ color: option.color }} />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-6 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-center">
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Geen installaties? Geen probleem - we analyseren alle mogelijkheden
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step Solar: Feed-in / Teruglevering */}
                    {currentStep === 'solar' && (
                      <div>
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
                            <ArrowDownUp className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Teruglevering zonnepanelen</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Hoeveel levert u terug aan het net?</p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {/* Feed-in slider */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Jaarlijkse teruglevering
                            </label>
                            <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                              <div className="flex justify-between items-center mb-6">
                                <span className="text-gray-400 dark:text-gray-400 text-sm">0 kWh</span>
                                <div className="px-6 py-2 rounded-full bg-amber-500">
                                  <span className="text-2xl font-bold text-white">{formData.solarFeedIn.toLocaleString()}</span>
                                  <span className="text-sm text-white/80 ml-1">kWh/jaar</span>
                                </div>
                                <span className="text-gray-400 dark:text-gray-400 text-sm">{Math.round(formData.electricityUsage * 0.8).toLocaleString()} kWh</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max={Math.round(formData.electricityUsage * 0.8)}
                                step={Math.round(formData.electricityUsage * 0.8 / 100) || 100}
                                value={formData.solarFeedIn}
                                onChange={(e) => setFormData({ ...formData, solarFeedIn: Number(e.target.value) })}
                                className="premium-slider premium-slider-yellow w-full"
                              />
                            </div>
                          </div>

                          {/* Info box */}
                          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800">
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              <span className="text-amber-600 dark:text-amber-400 font-semibold">Tip:</span> Teruglevering is de stroom die uw zonnepanelen produceren maar die u niet zelf verbruikt. Dit wordt teruggeleverd aan het elektriciteitsnet.
                            </p>
                          </div>

                          {/* Quick select buttons */}
                          <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">Snelle selectie:</p>
                            <div className="flex flex-wrap gap-2">
                              {[0, 25, 50, 75].map((percent) => {
                                const value = Math.round(formData.electricityUsage * 0.8 * (percent / 100));
                                const isSelected = formData.solarFeedIn === value;
                                return (
                                  <button
                                    key={percent}
                                    onClick={() => setFormData({ ...formData, solarFeedIn: value })}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all border-2 ${
                                      isSelected
                                        ? 'border-amber-500 bg-amber-500 text-white'
                                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                                    }`}
                                  >
                                    {percent}%
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Contract */}
                    {currentStep === 4 && (
                      <div>
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                            <Euro className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Uw energiecontract</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Selecteer uw huidige contractvorm</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {[
                            { value: 'variable', label: 'Variabel tarief', desc: 'Prijs varieert met de marktomstandigheden', icon: TrendingDown, color: '#f97316' },
                            { value: 'fixed', label: 'Vast tarief', desc: 'Vaste prijs gedurende de contractperiode', icon: Euro, color: '#3b82f6' },
                            { value: 'dynamic', label: 'Dynamisch tarief', desc: 'Realtime uurprijzen - optimaal voor slim verbruik', icon: Zap, color: '#10b981', recommended: true },
                          ].map((option) => {
                            const isSelected = formData.contractType === option.value;
                            const Icon = option.icon;
                            return (
                              <button
                                key={option.value}
                                onClick={() => setFormData({ ...formData, contractType: option.value })}
                                className={`relative w-full p-4 rounded-xl text-left transition-all border-2 ${
                                  isSelected
                                    ? 'bg-white dark:bg-gray-800'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                                }`}
                                style={{
                                  borderColor: isSelected ? option.color : undefined,
                                  backgroundColor: isSelected ? `${option.color}08` : undefined,
                                }}
                              >
                                {/* Recommended badge */}
                                {option.recommended && (
                                  <div
                                    className="absolute -top-2.5 right-4 px-3 py-1 rounded-full text-xs font-bold text-white"
                                    style={{ backgroundColor: option.color }}
                                  >
                                    <span className="flex items-center gap-1">
                                      <Sparkles className="w-3 h-3" />
                                      Aanbevolen
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center gap-4">
                                  {/* Radio button */}
                                  <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all`}
                                    style={{
                                      borderColor: isSelected ? option.color : '#d1d5db',
                                      backgroundColor: isSelected ? option.color : 'transparent',
                                    }}
                                  >
                                    {isSelected && (
                                      <div className="w-2 h-2 rounded-full bg-white" />
                                    )}
                                  </div>

                                  {/* Icon */}
                                  <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: option.color }}
                                  >
                                    <Icon className="w-5 h-5 text-white" />
                                  </div>

                                  {/* Text */}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{option.desc}</p>
                                  </div>

                                  {/* Checkmark */}
                                  {isSelected && (
                                    <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: option.color }} />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
                          <p className="text-gray-600 dark:text-gray-300 text-sm flex items-center gap-2">
                            <Zap className="w-4 h-4 text-blue-500" />
                            <span>Dynamische tarieven kunnen tot <span className="text-blue-600 dark:text-blue-400 font-semibold">30% extra besparing</span> opleveren</span>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Priorities */}
                    {currentStep === 5 && (
                      <div>
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-xl bg-violet-500 flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Wat is belangrijk voor u?</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Selecteer een of meerdere prioriteiten</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'cost', label: 'Kostenbesparing', desc: 'Lagere energierekening', icon: Euro, color: '#f59e0b' },
                            { id: 'sustainability', label: 'Duurzaamheid', desc: 'Groene voetafdruk', icon: Leaf, color: '#10b981' },
                            { id: 'independence', label: 'Onafhankelijkheid', desc: 'Zelf energie opwekken', icon: Battery, color: '#3b82f6' },
                            { id: 'comfort', label: 'Comfort', desc: 'Optimaal klimaat', icon: Thermometer, color: '#8b5cf6' },
                          ].map((option) => {
                            const isSelected = formData.priorities.includes(option.id);
                            const Icon = option.icon;
                            return (
                              <button
                                key={option.id}
                                onClick={() => {
                                  const newPriorities = isSelected
                                    ? formData.priorities.filter((p) => p !== option.id)
                                    : [...formData.priorities, option.id];
                                  setFormData({ ...formData, priorities: newPriorities });
                                }}
                                className={`p-4 rounded-xl text-center transition-all border-2 ${
                                  isSelected
                                    ? 'bg-white dark:bg-gray-800'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                                }`}
                                style={{
                                  borderColor: isSelected ? option.color : undefined,
                                  backgroundColor: isSelected ? `${option.color}10` : undefined,
                                }}
                              >
                                <div className="flex flex-col items-center">
                                  <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                                    style={{ backgroundColor: option.color }}
                                  >
                                    <Icon className="w-6 h-6 text-white" />
                                  </div>

                                  <p className="font-medium text-gray-900 dark:text-white mb-1">{option.label}</p>
                                  <p className="text-gray-500 dark:text-gray-400 text-sm">{option.desc}</p>

                                  {/* Selection indicator */}
                                  {isSelected && (
                                    <div className="mt-3">
                                      <CheckCircle className="w-5 h-5" style={{ color: option.color }} />
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-6 p-4 rounded-xl bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800 text-center">
                          <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center justify-center gap-2">
                            <Cpu className="w-4 h-4 text-violet-500" />
                            <span>We passen de analyse aan op uw voorkeuren</span>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 6: Contact */}
                    {currentStep === 6 && (
                      <div>
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center">
                            <Mail className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Ontvang uw rapport</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Wij sturen de analyse naar uw e-mailadres</p>
                          </div>
                        </div>

                        <div className="p-5 rounded-xl bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 mb-6">
                          <p className="text-gray-700 dark:text-gray-300 text-sm flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                            <span>
                              Na het invullen ontvangt u direct een <strong>persoonlijk besparingsrapport</strong> met
                              concrete aanbevelingen en een indicatie van uw besparingspotentieel.
                              <span className="text-teal-600 dark:text-teal-400 font-medium"> 100% gratis en vrijblijvend.</span>
                            </span>
                          </p>
                        </div>

                        <div className="space-y-4">
                          {/* Name */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Uw naam
                            </label>
                            <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type="text"
                                value={formData.contactName}
                                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                placeholder="Jan Jansen"
                                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                              />
                            </div>
                          </div>

                          {/* Company */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Bedrijfsnaam
                            </label>
                            <div className="relative">
                              <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type="text"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                placeholder="Uw Bedrijf B.V."
                                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                              />
                            </div>
                          </div>

                          {/* Email */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              E-mailadres <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="jan@uwbedrijf.nl"
                                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          <p className="text-gray-500 dark:text-gray-400 text-xs text-center">
                            Door op "Bereken besparing" te klikken gaat u akkoord met onze privacyvoorwaarden.
                            Wij delen uw gegevens nooit met derden.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                      {/* Back Button */}
                      <button
                        onClick={handlePrevious}
                        disabled={currentStepIndex === 0}
                        className={`px-6 py-3 rounded-xl font-medium transition-all border ${
                          currentStepIndex === 0
                            ? 'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 rotate-180" />
                          Vorige
                        </span>
                      </button>

                      {/* Next/Analyze Button */}
                      <button
                        onClick={handleNext}
                        disabled={(currentStep === 1 && !formData.businessType) || (currentStep === 6 && !formData.email)}
                        className={`flex-1 px-8 py-4 rounded-xl font-semibold text-white transition-all ${
                          (currentStep === 1 && !formData.businessType) || (currentStep === 6 && !formData.email)
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-lg'
                        }`}
                      >
                        <span className="flex items-center justify-center gap-2">
                          {currentStepIndex === steps.length - 1 ? (
                            <>
                              Bereken besparing
                              <Sparkles className="w-5 h-5" />
                            </>
                          ) : (
                            <>
                              Volgende
                              <ArrowRight className="w-5 h-5" />
                            </>
                          )}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes shimmer-line {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        @keyframes ping {
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }

        @keyframes pulse-ring {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }

        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 60px rgba(6,182,212,0.6), 0 0 100px rgba(16,185,129,0.3), inset 0 0 30px rgba(255,255,255,0.2); }
          50% { box-shadow: 0 0 80px rgba(6,182,212,0.8), 0 0 120px rgba(16,185,129,0.5), inset 0 0 40px rgba(255,255,255,0.3); }
        }

        @keyframes confetti-burst {
          0% { transform: rotate(var(--rotation, 0deg)) translateY(0) scale(1); opacity: 1; }
          100% { transform: rotate(var(--rotation, 0deg)) translateY(-200px) translateX(var(--x-offset, 0px)) scale(0); opacity: 0; }
        }

        @keyframes animate-gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: animate-gradient-x 3s ease infinite;
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Step Slide Transitions */
        @keyframes step-slide-in {
          0% {
            opacity: 0;
            transform: translateX(40px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes step-slide-in-reverse {
          0% {
            opacity: 0;
            transform: translateX(-40px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes step-slide-out {
          0% {
            opacity: 1;
            transform: translateX(0);
          }
          100% {
            opacity: 0;
            transform: translateX(-40px);
          }
        }

        @keyframes step-slide-out-reverse {
          0% {
            opacity: 1;
            transform: translateX(0);
          }
          100% {
            opacity: 0;
            transform: translateX(40px);
          }
        }

        .step-transition {
          will-change: transform, opacity;
        }

        .step-transition.forward {
          animation-name: step-slide-in;
        }

        .step-transition.forward.transitioning {
          animation-name: step-slide-out;
        }

        .step-transition.backward {
          animation-name: step-slide-in-reverse;
        }

        .step-transition.backward.transitioning {
          animation-name: step-slide-out-reverse;
        }

        /* Staggered item animations */
        @keyframes stagger-fade-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .stagger-item {
          animation: stagger-fade-up 0.5s ease-out forwards;
          opacity: 0;
        }

        .stagger-item:nth-child(1) { animation-delay: 0.1s; }
        .stagger-item:nth-child(2) { animation-delay: 0.15s; }
        .stagger-item:nth-child(3) { animation-delay: 0.2s; }
        .stagger-item:nth-child(4) { animation-delay: 0.25s; }
        .stagger-item:nth-child(5) { animation-delay: 0.3s; }
        .stagger-item:nth-child(6) { animation-delay: 0.35s; }

        /* Micro-interaction hover effects */
        @keyframes button-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        .micro-hover:hover {
          animation: button-pulse 0.6s ease-in-out;
        }

        /* Ripple effect */
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 0.6;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }

        .ripple-effect {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          animation: ripple 0.6s ease-out forwards;
          pointer-events: none;
        }

        /* Floating label animation */
        @keyframes float-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        .float-label:hover {
          animation: float-subtle 2s ease-in-out infinite;
        }

        /* Clean Slider Styles */
        .premium-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          border-radius: 4px;
          background: #e5e7eb;
          outline: none;
          cursor: pointer;
        }

        :root.dark .premium-slider,
        .dark .premium-slider {
          background: #374151;
        }

        .premium-slider::-webkit-slider-runnable-track {
          height: 8px;
          border-radius: 4px;
          background: #10b981;
        }

        .premium-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 3px solid #10b981;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          transition: transform 0.2s, box-shadow 0.2s;
          margin-top: -8px;
        }

        .premium-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        }

        .premium-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 3px solid #10b981;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }

        .premium-slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: #10b981;
        }

        .premium-slider-yellow::-webkit-slider-runnable-track {
          background: #f59e0b;
        }

        .premium-slider-yellow::-webkit-slider-thumb {
          border-color: #f59e0b;
        }

        .premium-slider-yellow::-moz-range-track {
          background: #f59e0b;
        }

        .premium-slider-yellow::-moz-range-thumb {
          border-color: #f59e0b;
        }

        .premium-slider-orange::-webkit-slider-runnable-track {
          background: #f97316;
        }

        .premium-slider-orange::-webkit-slider-thumb {
          border-color: #f97316;
        }

        .premium-slider-orange::-moz-range-track {
          background: #f97316;
        }

        .premium-slider-orange::-moz-range-thumb {
          border-color: #f97316;
        }

        /* Track styling */
        .premium-slider::-webkit-slider-runnable-track {
          height: 8px;
          border-radius: 4px;
        }

        .premium-slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: rgba(255,255,255,0.1);
        }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .premium-slider::-webkit-slider-thumb {
            width: 28px;
            height: 28px;
            margin-top: -10px;
          }

          .premium-slider::-moz-range-thumb {
            width: 28px;
            height: 28px;
          }

          .step-transition {
            animation-duration: 0.3s;
          }

          .stagger-item {
            animation-duration: 0.4s;
          }
        }

        @media (max-width: 640px) {
          .premium-slider::-webkit-slider-thumb {
            width: 24px;
            height: 24px;
            margin-top: -8px;
          }

          .premium-slider::-moz-range-thumb {
            width: 24px;
            height: 24px;
          }
        }

        /* Focus styles for accessibility */
        .premium-slider:focus {
          outline: none;
        }

        .premium-slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 4px rgba(6,182,212,0.3), 0 0 25px rgba(6,182,212,0.6);
        }

        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          .premium-slider::-webkit-slider-thumb {
            width: 36px;
            height: 36px;
            margin-top: -14px;
          }

          .premium-slider::-moz-range-thumb {
            width: 36px;
            height: 36px;
          }
        }

        /* Reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Smooth scroll */
        html {
          scroll-behavior: smooth;
        }

        /* Performance optimizations */
        .animate-gradient-x,
        .step-transition,
        .stagger-item {
          will-change: transform, opacity;
          backface-visibility: hidden;
          perspective: 1000px;
        }

        /* Selection highlight */
        ::selection {
          background: rgba(6, 182, 212, 0.3);
          color: white;
        }

        /* Glow text effect for headers */
        .glow-text {
          text-shadow: 0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.3);
        }

        /* Active button press effect */
        button:active:not(:disabled) {
          transform: scale(0.98);
        }

        /* Floating action effect */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
