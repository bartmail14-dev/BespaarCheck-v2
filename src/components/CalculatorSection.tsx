import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Building2, Zap, Euro, Users, CheckCircle, Sparkles, TrendingDown, Leaf, ArrowRight, Cpu, Sun, Battery, Thermometer, Settings, ChevronDown, ArrowDownUp, Mail, User, Building, AlertCircle, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { resolveCalculatorInsightEndpoint, resolveContactEndpoint } from '../lib/apiEndpoints';

// Energie prijzen interface
interface EnergyPrices {
  electricity: number;
  gas: number;
  feedInTariff: number;
  lastUpdated: Date | null;
  isLive: boolean;
}

// Indicatieve zakelijke prijzen als fallback (ex btw, inclusief grove opslag voor levering en energiebelasting).
const DEFAULT_PRICES: EnergyPrices = {
  electricity: 0.18, // EUR/kWh zakelijk MKB kleinverbruik, indicatief en ex btw.
  gas: 0.85, // EUR/m3 zakelijk MKB kleinverbruik, indicatief en ex btw.
  feedInTariff: 0.04,
  lastUpdated: null,
  isLive: false,
};

// Functie om energieprijzen op te halen van EnergyZero API
async function fetchEnergyPrices(): Promise<EnergyPrices> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const formatDate = (d: Date) => encodeURIComponent(d.toISOString());

    // EnergyZero API levert marktprijzen. We halen zonder btw op en voegen daarna een grove zakelijke opslag toe.
    const elecResponse = await fetch(
      `https://api.energyzero.nl/v1/energyprices?fromDate=${formatDate(today)}&tillDate=${formatDate(tomorrow)}&interval=4&usageType=1&inclBtw=false`
    );

    const gasResponse = await fetch(
      `https://api.energyzero.nl/v1/energyprices?fromDate=${formatDate(today)}&tillDate=${formatDate(tomorrow)}&interval=4&usageType=3&inclBtw=false`
    );

    if (!elecResponse.ok || !gasResponse.ok) {
      throw new Error('API response not ok');
    }

    const elecData = await elecResponse.json();
    const gasData = await gasResponse.json();

    const elecPrices = elecData.Prices || [];
    const gasPrices = gasData.Prices || [];

    if (elecPrices.length === 0 && gasPrices.length === 0) {
      throw new Error('Geen prijsdata beschikbaar');
    }

    // Marktprijs ex btw, aangevuld met indicatieve zakelijke opslagen.
    const avgElecSpot = elecPrices.length > 0
      ?elecPrices.reduce((sum: number, p: { price: number }) => sum + p.price, 0) / elecPrices.length
      : null;

    const avgGasSpot = gasPrices.length > 0
      ?gasPrices.reduce((sum: number, p: { price: number }) => sum + p.price, 0) / gasPrices.length
      : null;

    // Dit is geen offerte of volledig tarief. Netbeheer, belastingschijven en contractvoorwaarden verschillen per situatie.
    const zakelijkElec = avgElecSpot !== null
      ?Math.max(avgElecSpot + 0.12, 0.14)
      : DEFAULT_PRICES.electricity;

    const zakelijkGas = avgGasSpot !== null
      ?Math.max(avgGasSpot + 0.72, 0.65)
      : DEFAULT_PRICES.gas;

    return {
      electricity: Math.round(zakelijkElec * 1000) / 1000,
      gas: Math.round(zakelijkGas * 1000) / 1000,
      feedInTariff: DEFAULT_PRICES.feedInTariff,
      lastUpdated: new Date(),
      isLive: avgElecSpot !== null || avgGasSpot !== null,
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

const baseStepsEn = [
  { id: 1, label: 'Business', icon: Building2 },
  { id: 2, label: 'Usage', icon: Zap },
  { id: 3, label: 'Systems', icon: Sun },
  { id: 'solar', label: 'Feed-in', icon: ArrowDownUp, conditional: true },
  { id: 4, label: 'Contract', icon: Euro },
  { id: 5, label: 'Priorities', icon: Users },
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

const businessTypesEn = [
  { value: '', label: 'Select type...' },
  { value: 'retail', label: 'Retail / shop' },
  { value: 'office', label: 'Office' },
  { value: 'warehouse', label: 'Warehouse / logistics' },
  { value: 'production', label: 'Production / industry' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'other', label: 'Other' },
];

const businessRanges: Record<string, {
  buildingSize: { min: number; max: number; default: number; step: number };
  electricity: { min: number; max: number; default: number; step: number };
  gas: { min: number; max: number; default: number; step: number };
}> = {
  '': { buildingSize: { min: 50, max: 5000, default: 500, step: 50 }, electricity: { min: 2500, max: 500000, default: 25000, step: 2500 }, gas: { min: 0, max: 100000, default: 10000, step: 500 } },
  retail: { buildingSize: { min: 25, max: 2000, default: 150, step: 25 }, electricity: { min: 2500, max: 150000, default: 15000, step: 2500 }, gas: { min: 0, max: 30000, default: 5000, step: 500 } },
  office: { buildingSize: { min: 50, max: 5000, default: 300, step: 50 }, electricity: { min: 2500, max: 300000, default: 25000, step: 2500 }, gas: { min: 0, max: 50000, default: 8000, step: 500 } },
  warehouse: { buildingSize: { min: 200, max: 10000, default: 2000, step: 100 }, electricity: { min: 5000, max: 500000, default: 75000, step: 5000 }, gas: { min: 0, max: 100000, default: 20000, step: 1000 } },
  production: { buildingSize: { min: 500, max: 15000, default: 3000, step: 250 }, electricity: { min: 25000, max: 1000000, default: 250000, step: 10000 }, gas: { min: 5000, max: 250000, default: 50000, step: 2500 } },
  hospitality: { buildingSize: { min: 50, max: 1500, default: 150, step: 25 }, electricity: { min: 5000, max: 200000, default: 30000, step: 2500 }, gas: { min: 2500, max: 75000, default: 15000, step: 500 } },
  healthcare: { buildingSize: { min: 100, max: 5000, default: 500, step: 100 }, electricity: { min: 5000, max: 500000, default: 50000, step: 5000 }, gas: { min: 2500, max: 100000, default: 15000, step: 1000 } },
  other: { buildingSize: { min: 25, max: 10000, default: 300, step: 25 }, electricity: { min: 2500, max: 500000, default: 25000, step: 2500 }, gas: { min: 0, max: 100000, default: 10000, step: 500 } },
};

// CO2 emissiefactoren (bron: RVO/CBS 2025)
const CO2_FACTORS = {
  electricity: 0.30, // kg CO2/kWh (NL grid mix 2025, meer wind/zon)
  gas: 1.79, // kg CO2/m³ (standaard emissiefactor aardgas)
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
  office: { lighting: 0.30, cooling: 0.20, heating: 0.20, equipment: 0.30, peakLoadFactor: 0.4 },
  warehouse: { lighting: 0.25, cooling: 0.10, heating: 0.25, equipment: 0.40, peakLoadFactor: 0.7 },
  production: { lighting: 0.15, cooling: 0.15, heating: 0.20, equipment: 0.50, peakLoadFactor: 0.5 },
  hospitality: { lighting: 0.20, cooling: 0.25, heating: 0.20, equipment: 0.35, peakLoadFactor: 0.3 },
  healthcare: { lighting: 0.20, cooling: 0.25, heating: 0.25, equipment: 0.30, peakLoadFactor: 0.2 },
  other: { lighting: 0.25, cooling: 0.20, heating: 0.25, equipment: 0.30, peakLoadFactor: 0.5 },
};

const SPACE_HEATING_FRACTION: Record<string, number> = {
  retail: 0.70,
  office: 0.82,
  warehouse: 0.75,
  production: 0.30,
  hospitality: 0.42,
  healthcare: 0.62,
  other: 0.65,
};

const MAX_SPACE_HEATING_GAS_PER_M2: Record<string, number> = {
  retail: 24,
  office: 22,
  warehouse: 18,
  production: 12,
  hospitality: 24,
  healthcare: 30,
  other: 24,
};

const EMS_SAVINGS_RATE: Record<string, number> = {
  retail: 0.04,
  office: 0.035,
  warehouse: 0.05,
  production: 0.06,
  hospitality: 0.04,
  healthcare: 0.035,
  other: 0.04,
};

// Besparingsmaatregelen met realistische percentages en kosten
const SAVINGS_MEASURES = {
  led: {
    name: 'LED-verlichting',
    savingsPercent: 0.45, // 45% besparing op verlichting (conservatief voor gemengde TL → LED retrofit)
    investmentPerM2: 18, // €/m² (zakelijke retrofit, marktconform; vaak €15-25/m²)
    lifespan: 15,
  },
  solar: {
    name: 'Zonnepanelen',
    kWhPerKwp: 860, // kWh opbrengst per kWp per jaar in NL (rekening houdend met degradatie)
    costPerKwp: 1050, // € per kWp geïnstalleerd (zakelijk, inc montage) - referentie voor grote systemen
    roofFactorPerM2: 0.115, // kWp per m² dakoppervlak (≈ 50% van vloer bruikbaar, niet elk dak geschikt)
    lifespan: 25,
  },
  heatpump: {
    name: 'Warmtepomp of hybride oplossing',
    cop: 3.1,
    gasSavingsPercent: 0.55, // Conservatief voor warmtepomp/hybride (vaak 50-60% op ruimteverwarmingsgas)
    boilerEfficiency: 0.9,
    baseCost: 26000,
    costPerM2: 48,
    maxInvestment: 180000, // Cap: grotere panden hebben complexere maar niet lineair duurdere systemen
    maxBuildingSize: 3000, // Boven 3000m² is een enkele warmtepomp niet realistisch
    lifespan: 20,
  },
  ems: {
    name: 'Energiemanagementsysteem',
    baseCost: 5000,
    costPerM2: 5,
    maxInvestment: 40000, // Cap voor EMS
    lifespan: 10,
  },
  smartThermostat: {
    name: 'Slimme klimaatregeling',
    heatingSavingsPercent: 0.08,
    baseCost: 900,
    costPerM2: 2.5, // Schaalt mee met gebouwgrootte (meer zones = meer thermostaten)
    maxInvestment: 7000,
    lifespan: 10,
  },
  dynamicContract: {
    name: 'Contractoptimalisatie en vraagsturing',
    savingsPercent: 0.035, // 10% basis, afhankelijk van flexibiliteit
  },
};

function getSpaceHeatingGasM3(businessType: string, buildingSize: number, remainingGasM3: number) {
  const fraction = SPACE_HEATING_FRACTION[businessType] ?? SPACE_HEATING_FRACTION.other;
  const maxPerM2 = MAX_SPACE_HEATING_GAS_PER_M2[businessType] ?? MAX_SPACE_HEATING_GAS_PER_M2.other;
  return Math.max(0, Math.min(remainingGasM3 * fraction, buildingSize * maxPerM2));
}

function getSolarSelfConsumptionRate(businessType: string, solarProduction: number, annualDemand: number) {
  const baseRates: Record<string, number> = {
    retail: 0.62,
    office: 0.68,
    warehouse: 0.70,
    production: 0.76,
    hospitality: 0.66,
    healthcare: 0.78,
    other: 0.66,
  };
  const base = baseRates[businessType] ?? baseRates.other;
  const generationShare = annualDemand > 0 ? solarProduction / annualDemand : 1;

  if (generationShare <= 0.35) return Math.min(0.90, base + 0.14);
  if (generationShare <= 0.70) return base;
  return Math.max(0.45, base - 0.12);
}

// Kleine zonne-installaties zijn duurder per kWp dan grote (vaste kosten, montage, aansluiting).
function getSolarCostPerKwp(kwp: number) {
  if (kwp < 15) return 1400;
  if (kwp < 30) return 1300;
  if (kwp < 100) return 1150;
  return SAVINGS_MEASURES.solar.costPerKwp; // 1050 referentie voor grote systemen
}

interface Recommendation {
  name: string;
  yearlySavings: number;
  investment: number;
  paybackYears: number;
  co2Reduction: number;
  priority: 'high' | 'medium' | 'low';
  countsInTotals?: boolean;
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

interface CalculatorInsight {
  summary: string;
  nextSteps: string[];
  attentionPoints: string[];
  sanityLevel: string;
  sanitySummary: string;
  sanityChecks: string[];
  confidenceNote: string;
}

export function CalculatorSection() {
  const { isDark } = useTheme();
  const { isEnglish } = useLanguage();
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
    privacyAccepted: false,
    honeypot: '',
  });
  const [activeDropdown, setActiveDropdown] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [energyPrices, setEnergyPrices] = useState<EnergyPrices>(DEFAULT_PRICES);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [calculatorInsight, setCalculatorInsight] = useState<CalculatorInsight | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const businessOptions = isEnglish ? businessTypesEn : businessTypes;
  const stepOptions = isEnglish ? baseStepsEn : baseSteps;
  const t = isEnglish
    ? {
        chip: 'Instant insight',
        title: 'Calculate your saving',
        intro: 'Discover what you can save right away. The check is free, completely non-binding and does not commit you to anything.',
        loadingPrices: 'Loading energy prices...',
        phases: ['Analysing...', 'Calculating...', 'Optimising...', 'Finishing...'],
        resultsTitle: 'Your savings analysis',
        resultsSubtitle: 'Based on indicative market input and your business profile',
        currentCosts: 'Your estimated current energy costs',
        electricity: 'electricity',
        livePrices: 'Current market input',
        indicativePrices: 'Indicative price input',
        potentialSaving: 'Potential saving',
        co2Reduction: 'CO2 reduction',
        payback: 'Avg. payback time',
        year: 'year',
        newCalculation: 'New calculation',
        disclaimer: 'This is an indicative calculation. Actual savings may differ and depend on specific circumstances.',
        businessTitle: 'Tell us about your business',
        businessIntro: 'We tailor the analysis to your sector',
        businessType: 'Business type',
        selectType: 'Select type...',
        buildingSize: 'Business premises size',
        usageTitle: 'Your energy use',
        usageIntro: 'This helps us calculate the saving',
        electricityUsage: 'Electricity use',
        gasUsage: 'Gas use',
        perYear: 'per year',
        systemsTitle: 'Current systems',
        systemsIntro: 'Select what you already have installed',
        noSystems: 'No systems? No problem. We will analyse all possibilities',
        feedTitle: 'Solar panel feed-in',
        feedIntro: 'How much electricity do you feed back into the grid?',
        annualFeed: 'Annual feed-in',
        tip: 'Tip:',
        feedTip: 'Feed-in is the electricity your solar panels produce but that you do not use yourself. It is sent back to the electricity grid.',
        quickSelect: 'Quick select:',
        contractTitle: 'Your energy contract',
        contractIntro: 'Select your current contract type',
        recommended: 'Attention point',
        dynamicNote: 'Dynamic rates can be useful when usage can really be shifted.',
        dynamicNoteStrong: 'We show this as an opportunity, not as guaranteed saving.',
        prioritiesTitle: 'What matters to you?',
        prioritiesIntro: 'We rank the recommendations based on your choice',
        prioritiesNote: 'The order of recommendations is aligned with your priorities',
        contactTitle: 'Receive your report by email',
        contactIntro: 'Enter your details and we will send the savings report to your mailbox',
        contactBox: 'After submitting, you receive the indicative savings report by email. The check is free and completely non-binding; you are not committed to anything.',
        name: 'Your name',
        company: 'Company name',
        email: 'Email address',
        privacy: 'I have read the privacy statement and agree that BespaarCheck may process my details to send the report and follow up on this non-binding request.',
        privacyLink: 'privacy statement',
        privacyRequired: 'Accept the privacy statement to receive the report',
        previous: 'Previous',
        next: 'Next',
        calculate: 'Email my report',
        preparing: 'Checking and sending...',
        prepareRequest: 'Email my report',
        mailOpened: 'Your report has been sent by email. A colleague can calmly look at the possibilities with you. You are not committed to anything.',
        mailError: 'Something went wrong while sending. Email directly to',
        aiTitle: 'Critical result check',
        aiLoading: 'The result is being checked...',
        aiUnavailable: 'The extra result check is temporarily unavailable. The calculation remains usable.',
        sanityTitle: 'Sanity check',
        nextSteps: 'Logical next steps',
        attentionPoints: 'Worth checking',
      }
    : {
        chip: 'Direct inzicht',
        title: 'Bereken uw besparing',
        intro: 'Ontdek direct wat u kunt besparen. De check is gratis, geheel vrijblijvend en verplicht u tot niets.',
        loadingPrices: 'Energieprijzen laden...',
        phases: ['Analyseren...', 'Berekenen...', 'Optimaliseren...', 'Afronden...'],
        resultsTitle: 'Uw besparingsanalyse',
        resultsSubtitle: 'Gebaseerd op indicatieve marktinput en uw bedrijfsprofiel',
        currentCosts: 'Uw geschatte huidige energiekosten',
        electricity: 'elektra',
        livePrices: 'Actuele marktinput',
        indicativePrices: 'Indicatieve prijsinput',
        potentialSaving: 'Potentiele besparing',
        co2Reduction: 'CO2 reductie',
        payback: 'Gem. terugverdientijd',
        year: 'jaar',
        newCalculation: 'Nieuwe berekening',
        disclaimer: 'Dit is een indicatieve berekening. Werkelijke besparingen kunnen afwijken en zijn afhankelijk van specifieke omstandigheden.',
        businessTitle: 'Vertel ons over uw bedrijf',
        businessIntro: 'We stemmen de analyse af op uw sector',
        businessType: 'Bedrijfstype',
        selectType: 'Selecteer type...',
        buildingSize: 'Bedrijfspand grootte',
        usageTitle: 'Uw energieverbruik',
        usageIntro: 'Dit helpt ons de besparing te berekenen',
        electricityUsage: 'Elektriciteitsverbruik',
        gasUsage: 'Gasverbruik',
        perYear: 'jaar',
        systemsTitle: 'Huidige installaties',
        systemsIntro: 'Selecteer wat u al heeft geinstalleerd',
        noSystems: 'Geen installaties? Geen probleem. We analyseren alle mogelijkheden',
        feedTitle: 'Teruglevering zonnepanelen',
        feedIntro: 'Hoeveel levert u terug aan het net?',
        annualFeed: 'Jaarlijkse teruglevering',
        tip: 'Tip:',
        feedTip: 'Teruglevering is de stroom die uw zonnepanelen produceren maar die u niet zelf verbruikt. Dit wordt teruggeleverd aan het elektriciteitsnet.',
        quickSelect: 'Snelle selectie:',
        contractTitle: 'Uw energiecontract',
        contractIntro: 'Selecteer uw huidige contractvorm',
        recommended: 'Aandachtspunt',
        dynamicNote: 'Dynamische tarieven kunnen interessant zijn als verbruik echt te sturen is.',
        dynamicNoteStrong: 'We tonen dit als kans, niet als gegarandeerde besparing.',
        prioritiesTitle: 'Wat is belangrijk voor u?',
        prioritiesIntro: 'We rangschikken de aanbevelingen op basis van uw keuze',
        prioritiesNote: 'De volgorde van aanbevelingen wordt afgestemd op uw prioriteiten',
        contactTitle: 'Ontvang uw rapport per mail',
        contactIntro: 'Vul uw gegevens in en wij sturen het besparingsrapport naar uw mailbox',
        contactBox: 'Na het indienen ontvangt u het indicatieve besparingsrapport per mail. De check is gratis en geheel vrijblijvend; u zit nergens aan vast.',
        name: 'Uw naam',
        company: 'Bedrijfsnaam',
        email: 'E-mailadres',
        privacy: 'Ik heb de privacyverklaring gelezen en ga ermee akkoord dat BespaarCheck mijn gegevens verwerkt om het rapport te versturen en deze vrijblijvende aanvraag op te volgen.',
        privacyLink: 'privacyverklaring',
        privacyRequired: 'Accepteer de privacyverklaring om het rapport te ontvangen',
        previous: 'Vorige',
        next: 'Volgende',
        calculate: 'Mail mijn rapport',
        preparing: 'Controleren en versturen...',
        prepareRequest: 'Mail mijn rapport',
        mailOpened: 'Uw rapport is per mail verzonden. Een collega kan rustig meekijken naar de mogelijkheden. U zit nergens aan vast.',
        mailError: 'Er ging iets mis bij het versturen. Mail rechtstreeks naar',
        aiTitle: 'Kritische resultaatcontrole',
        aiLoading: 'Het resultaat wordt gecontroleerd...',
        aiUnavailable: 'De extra resultaatcontrole is tijdelijk niet beschikbaar. De berekening blijft gewoon bruikbaar.',
        sanityTitle: 'Sanitycheck',
        nextSteps: 'Logische vervolgstappen',
        attentionPoints: 'Goed om te controleren',
      };

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
    return stepOptions.filter(step => !step.conditional || (step.id === 'solar' && hasSolarPanels));
  }, [hasSolarPanels, stepOptions]);

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
  const progress = currentStepIndex >= 0 ?(currentStepIndex / (steps.length - 1)) * 100 : 0;

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

    // Huidige energiekosten berekenen met indicatieve prijsinput.
    const currentCosts = {
      electricity: formData.electricityUsage * energyPrices.electricity,
      gas: formData.gasUsage * energyPrices.gas,
      total: 0,
    };

    // Bestaande solar feed-in verrekenen (gebruiker krijgt al geld terug)
    if (formData.solarFeedIn > 0) {
      currentCosts.electricity = Math.max(0, currentCosts.electricity - formData.solarFeedIn * energyPrices.feedInTariff);
    }

    currentCosts.total = currentCosts.electricity + currentCosts.gas;

    const recommendations: Recommendation[] = [];
    const hasInstallation = (id: string) => formData.existingInstallations.includes(id);

    // === SEQUENTIËLE BEREKENING ===
    // Elke maatregel verlaagt het resterend verbruik voor volgende maatregelen
    let remainingElecKwh = formData.electricityUsage;
    let remainingGasM3 = formData.gasUsage;

    // 1. LED-verlichting (hoogste ROI, eerst)
    if (!hasInstallation('led')) {
      const lightingUsage = remainingElecKwh * profile.lighting;
      const savingsKwh = lightingUsage * SAVINGS_MEASURES.led.savingsPercent;
      const yearlySavings = savingsKwh * energyPrices.electricity;
      const investment = formData.buildingSize * SAVINGS_MEASURES.led.investmentPerM2;
      const co2Reduction = savingsKwh * CO2_FACTORS.electricity / 1000;

      if (yearlySavings > 100) {
        recommendations.push({
          name: 'LED-verlichting',
          yearlySavings: Math.round(yearlySavings),
          investment: Math.round(investment),
          paybackYears: Math.round((investment / yearlySavings) * 10) / 10,
          co2Reduction: Math.round(co2Reduction * 10) / 10,
          priority: yearlySavings > 1000 ?'high' : 'medium',
        });
        remainingElecKwh -= savingsKwh;
      }
    }

    // 2. Warmtepomp (vóór solar, want voegt elektra-vraag toe)
    let heatpumpAdded = false;
    if (!hasInstallation('heatpump') && formData.gasUsage > 2000 && formData.buildingSize <= SAVINGS_MEASURES.heatpump.maxBuildingSize) {
      const gasForHeating = getSpaceHeatingGasM3(formData.businessType, formData.buildingSize, remainingGasM3);
      const gasSavings = gasForHeating * SAVINGS_MEASURES.heatpump.gasSavingsPercent;
      const extraElectricity = (gasSavings * 9.77 * SAVINGS_MEASURES.heatpump.boilerEfficiency) / SAVINGS_MEASURES.heatpump.cop;

      const yearlySavings = (gasSavings * energyPrices.gas) - (extraElectricity * energyPrices.electricity);
      const rawInvestment = SAVINGS_MEASURES.heatpump.baseCost + (formData.buildingSize * SAVINGS_MEASURES.heatpump.costPerM2);
      const investment = Math.min(rawInvestment, SAVINGS_MEASURES.heatpump.maxInvestment);
      const co2Reduction = (gasSavings * CO2_FACTORS.gas - extraElectricity * CO2_FACTORS.electricity) / 1000;
      const payback = yearlySavings > 0 ?investment / yearlySavings : 99;

      if (yearlySavings > 300 && payback <= SAVINGS_MEASURES.heatpump.lifespan) {
        recommendations.push({
          name: 'Warmtepomp of hybride oplossing',
          yearlySavings: Math.round(yearlySavings),
          investment: Math.round(investment),
          paybackYears: Math.round(payback * 10) / 10,
          co2Reduction: Math.round(co2Reduction * 10) / 10,
          priority: co2Reduction > 5 ?'high' : 'medium',
        });
        remainingGasM3 -= gasSavings;
        remainingElecKwh += extraElectricity;
        heatpumpAdded = true;
      }
    }

    // 3. Slimme klimaatregeling (alleen als geen warmtepomp)
    if (formData.gasUsage > 1000 && !hasInstallation('heatpump') && !heatpumpAdded) {
      const gasForHeating = getSpaceHeatingGasM3(formData.businessType, formData.buildingSize, remainingGasM3);
      const heatingCosts = gasForHeating * energyPrices.gas;
      const yearlySavings = heatingCosts * SAVINGS_MEASURES.smartThermostat.heatingSavingsPercent;
      const rawInvestment = SAVINGS_MEASURES.smartThermostat.baseCost + (formData.buildingSize * SAVINGS_MEASURES.smartThermostat.costPerM2);
      const investment = Math.min(rawInvestment, SAVINGS_MEASURES.smartThermostat.maxInvestment);
      const gasSavingsM3 = gasForHeating * SAVINGS_MEASURES.smartThermostat.heatingSavingsPercent;
      const co2Reduction = (gasSavingsM3 * CO2_FACTORS.gas) / 1000;

      if (yearlySavings > 100) {
        recommendations.push({
          name: 'Slimme klimaatregeling',
          yearlySavings: Math.round(yearlySavings),
          investment: Math.round(investment),
          paybackYears: Math.round((investment / yearlySavings) * 10) / 10,
          co2Reduction: Math.round(co2Reduction * 10) / 10,
          priority: 'low',
        });
        remainingGasM3 -= gasSavingsM3;
      }
    }

    // 4. Zonnepanelen (na LED/warmtepomp, zodat sizing op actuele vraag is)
    if (!hasInstallation('solar')) {
      const roofFraction: Record<string, number> = {
        retail: 0.6, office: 0.3, warehouse: 0.7, production: 0.6,
        hospitality: 0.4, healthcare: 0.25, other: 0.5,
      };
      const roofArea = formData.buildingSize * (roofFraction[formData.businessType] || 0.5);
      const possibleKwp = roofArea * SAVINGS_MEASURES.solar.roofFactorPerM2;
      const maxKwp = Math.min(possibleKwp, remainingElecKwh / SAVINGS_MEASURES.solar.kWhPerKwp);
      const solarProduction = maxKwp * SAVINGS_MEASURES.solar.kWhPerKwp;

      const eigenVerbruikRatio = getSolarSelfConsumptionRate(formData.businessType, solarProduction, remainingElecKwh);
      const eigenVerbruik = solarProduction * eigenVerbruikRatio;
      const teruglevering = solarProduction * (1 - eigenVerbruikRatio);
      const exportValueFactor = teruglevering > solarProduction * 0.30 ? 0.85 : 1;

      const yearlySavings = eigenVerbruik * energyPrices.electricity + teruglevering * energyPrices.feedInTariff * exportValueFactor;
      const investment = maxKwp * getSolarCostPerKwp(maxKwp);
      const co2Reduction = solarProduction * CO2_FACTORS.electricity / 1000;

      if (maxKwp > 3 && yearlySavings > 200) {
        recommendations.push({
          name: `Zonnepanelen (${Math.round(maxKwp)} kWp)`,
          yearlySavings: Math.round(yearlySavings),
          investment: Math.round(investment),
          paybackYears: Math.round((investment / yearlySavings) * 10) / 10,
          co2Reduction: Math.round(co2Reduction * 10) / 10,
          priority: 'high',
        });
        remainingElecKwh -= eigenVerbruik;
      }
    }

    // 5. EMS (op basis van resterende kosten)
    const remainingElecCost = remainingElecKwh * energyPrices.electricity;
    const remainingGasCost = remainingGasM3 * energyPrices.gas;
    const remainingTotalCost = remainingElecCost + remainingGasCost;

    if (!hasInstallation('ems') && remainingTotalCost > 10000) {
      const emsRate = EMS_SAVINGS_RATE[formData.businessType] ?? EMS_SAVINGS_RATE.other;
      const controllableGasCost = remainingGasCost * 0.35;
      const yearlySavings = remainingElecCost * emsRate + controllableGasCost * emsRate;
      const rawInvestment = SAVINGS_MEASURES.ems.baseCost + (formData.buildingSize * SAVINGS_MEASURES.ems.costPerM2);
      const investment = Math.min(rawInvestment, SAVINGS_MEASURES.ems.maxInvestment);
      const remainingCO2 = (remainingElecKwh * CO2_FACTORS.electricity + remainingGasM3 * CO2_FACTORS.gas) / 1000;
      const co2Reduction = remainingCO2 * emsRate;
      const payback = yearlySavings > 0 ? investment / yearlySavings : 99;

      if (yearlySavings > 500 && payback <= 12) {
        recommendations.push({
          name: 'Energiemanagementsysteem (EMS)',
          yearlySavings: Math.round(yearlySavings),
          investment: Math.round(investment),
          paybackYears: Math.round(payback * 10) / 10,
          co2Reduction: Math.round(co2Reduction * 10) / 10,
          priority: remainingTotalCost > 25000 ?'high' : 'medium',
        });
      }
    }

    // 6. Dynamisch contract (op basis van resterende elektrakosten)
    if (formData.contractType !== 'dynamic') {
      const potentialSavings = remainingElecCost * SAVINGS_MEASURES.dynamicContract.savingsPercent * profile.peakLoadFactor;

      if (potentialSavings > 150) {
        recommendations.push({
          name: 'Contractoptimalisatie en vraagsturing',
          yearlySavings: Math.round(potentialSavings),
          investment: 0,
          paybackYears: 0,
          co2Reduction: 0,
          priority: 'low',
          countsInTotals: false,
        });
      }
    }

    // Sorteer op basis van gebruikersprioriteiten
    if (formData.priorities.length > 0) {
      recommendations.sort((a, b) => {
        let scoreA = 0, scoreB = 0;
        const has = (p: string) => formData.priorities.includes(p);

        if (has('cost')) {
          scoreA += a.yearlySavings;
          scoreB += b.yearlySavings;
        }
        if (has('sustainability')) {
          scoreA += a.co2Reduction * 2000;
          scoreB += b.co2Reduction * 2000;
        }
        if (has('independence')) {
          if (a.name.includes('Zonnepanelen')) scoreA += 5000;
          if (b.name.includes('Zonnepanelen')) scoreB += 5000;
          if (a.name.includes('Warmtepomp')) scoreA += 3000;
          if (b.name.includes('Warmtepomp')) scoreB += 3000;
        }
        if (has('comfort')) {
          if (a.name.includes('Warmtepomp')) scoreA += 4000;
          if (b.name.includes('Warmtepomp')) scoreB += 4000;
          if (a.name.includes('klimaatregeling')) scoreA += 3000;
          if (b.name.includes('klimaatregeling')) scoreB += 3000;
        }

        return scoreB - scoreA;
      });
    } else {
      recommendations.sort((a, b) => b.yearlySavings - a.yearlySavings);
    }

    // Bereken totalen (top 5 maatregelen)
    const topRecommendations = recommendations.slice(0, 5);
    const mainRecommendations = topRecommendations.filter((r) => r.countsInTotals !== false);
    const totalRecommendations = mainRecommendations.length > 0 ? mainRecommendations : topRecommendations;
    const rawTotalYearlySavings = totalRecommendations.reduce((sum, r) => sum + r.yearlySavings, 0);

    // Realisme-plafond: de gecombineerde besparing kan in de praktijk niet meer dan een groot deel
    // van de huidige energiekosten zijn. We cappen op 45% en schalen de maatregelen proportioneel terug
    // zodat de getoonde bedragen en de terugverdientijden consistent blijven met het totaal.
    const SAVINGS_CAP_RATE = 0.45;
    const savingsCap = currentCosts.total * SAVINGS_CAP_RATE;
    if (rawTotalYearlySavings > savingsCap && savingsCap > 0) {
      const scale = savingsCap / rawTotalYearlySavings;
      totalRecommendations.forEach((r) => {
        r.yearlySavings = Math.round(r.yearlySavings * scale);
        r.paybackYears = r.yearlySavings > 0 ? Math.round((r.investment / r.yearlySavings) * 10) / 10 : 0;
      });
    }

    const totalYearlySavings = totalRecommendations.reduce((sum, r) => sum + r.yearlySavings, 0);
    const totalInvestment = totalRecommendations.reduce((sum, r) => sum + r.investment, 0);
    const totalCO2Reduction = totalRecommendations.reduce((sum, r) => sum + r.co2Reduction, 0);
    const avgPayback = totalInvestment > 0 && totalYearlySavings > 0 ?totalInvestment / totalYearlySavings : 0;

    return {
      currentCosts,
      yearlySavings: totalYearlySavings,
      co2Reduction: Math.round(totalCO2Reduction * 10) / 10,
      paybackPeriod: Math.round(avgPayback * 10) / 10,
      recommendations: topRecommendations,
      totalInvestment,
    };
  }, [formData, energyPrices]);

  const validateContactForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.contactName || formData.contactName.trim().length < 2) {
      errors.contactName = isEnglish ? 'Enter your name (at least 2 characters)' : 'Vul uw naam in (minimaal 2 tekens)';
    }

    if (!formData.email) {
      errors.email = isEnglish ? 'Email address is required' : 'E-mailadres is verplicht';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = isEnglish ? 'Enter a valid email address' : 'Vul een geldig e-mailadres in';
    }

    if (!formData.privacyAccepted) {
      errors.privacyAccepted = t.privacyRequired;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildMailSummary = (calculatedResults: CalculationResult, insight?: CalculatorInsight | null): string => {
    const businessLabel = businessTypes.find(type => type.value === formData.businessType)?.label || formData.businessType;
    const lines = [
      `Bedrijfstype: ${businessLabel}`,
      `Pand: ${formData.buildingSize.toLocaleString()} m2`,
      `Elektriciteit: ${formData.electricityUsage.toLocaleString()} kWh/jaar`,
      `Gas: ${formData.gasUsage.toLocaleString()} m3/jaar`,
      `Contract: ${formData.contractType || 'Niet opgegeven'}`,
      `Bestaande installaties: ${formData.existingInstallations.length > 0 ? formData.existingInstallations.join(', ') : 'Geen'}`,
      `Prioriteiten: ${formData.priorities.length > 0 ? formData.priorities.join(', ') : 'Niet opgegeven'}`,
      '',
      '--- RESULTATEN ---',
      `Huidige kosten: EUR ${calculatedResults.currentCosts.total.toLocaleString()}/jaar`,
      `Potentiele besparing: EUR ${calculatedResults.yearlySavings.toLocaleString()}/jaar`,
      `CO2 reductie: ${calculatedResults.co2Reduction} ton/jaar`,
      `Gem. terugverdientijd: ${calculatedResults.paybackPeriod} jaar`,
      '',
      'Aanbevolen maatregelen:',
    ];

    if (calculatedResults.recommendations.length === 0) {
      lines.push('Geen directe standaardmaatregelen gevonden op basis van de invoer.');
    } else {
      calculatedResults.recommendations.forEach((rec, index) => {
        const scopeNote = rec.countsInTotals === false ? ', kans apart beoordeeld en niet meegeteld in de hoofdtotalen' : '';
        lines.push(`${index + 1}. ${rec.name}: EUR ${rec.yearlySavings.toLocaleString()}/jaar potentie, investering EUR ${rec.investment.toLocaleString()}, terugverdientijd ${rec.paybackYears} jaar${scopeNote}`);
      });
    }

    if (insight) {
      lines.push('');
      lines.push('--- KRITISCHE CONTROLE ---');
      lines.push(insight.sanitySummary);
      insight.sanityChecks.forEach((check) => lines.push(`- ${check}`));
      lines.push('');
      lines.push(insight.confidenceNote);
    }

    return lines.join('\n');
  };

  const requestCalculatorInsight = useCallback(async (calculatedResults: CalculationResult): Promise<CalculatorInsight | null> => {
    setCalculatorInsight(null);

    try {
      const response = await fetch(resolveCalculatorInsightEndpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: isEnglish ? 'en' : 'nl',
          calculation: {
            input: {
              businessType: businessTypes.find(type => type.value === formData.businessType)?.label || formData.businessType,
              buildingSize: formData.buildingSize,
              electricityUsage: formData.electricityUsage,
              gasUsage: formData.gasUsage,
              existingInstallations: formData.existingInstallations,
              solarFeedIn: formData.solarFeedIn,
              contractType: formData.contractType || 'Niet opgegeven',
              priorities: formData.priorities,
            },
            result: {
              currentCosts: calculatedResults.currentCosts,
              yearlySavings: calculatedResults.yearlySavings,
              savingsShareOfCurrentCosts:
                calculatedResults.currentCosts.total > 0
                  ? Math.round((calculatedResults.yearlySavings / calculatedResults.currentCosts.total) * 1000) / 10
                  : 0,
              co2Reduction: calculatedResults.co2Reduction,
              paybackPeriod: calculatedResults.paybackPeriod,
              totalInvestment: calculatedResults.totalInvestment,
              calculatedPaybackCheck:
                calculatedResults.yearlySavings > 0
                  ? Math.round((calculatedResults.totalInvestment / calculatedResults.yearlySavings) * 10) / 10
                  : 0,
              recommendations: calculatedResults.recommendations,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Calculator insight endpoint returned an error');
      }

      const data = (await response.json()) as { insight?: CalculatorInsight };
      if (!data.insight) {
        throw new Error('No insight returned');
      }

      setCalculatorInsight(data.insight);
      return data.insight;
    } catch (error) {
      console.warn('BespaarCheck calculator insight niet beschikbaar:', error);
      return null;
    }
  }, [formData, isEnglish]);

  const submitLead = async (calculatedResults: CalculationResult, insight?: CalculatorInsight | null) => {
    if (isSubmitting) return;
    // Honeypot spam check
    if (formData.honeypot) {
      setSubmitStatus('success');
      return;
    }
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch(resolveContactEndpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'calculator',
          language: isEnglish ? 'en' : 'nl',
          honeypot: formData.honeypot,
          contact: {
            name: formData.contactName,
            company: formData.companyName,
            email: formData.email,
          },
          privacyAccepted: formData.privacyAccepted,
          report: {
            businessType: businessTypes.find(type => type.value === formData.businessType)?.label || formData.businessType,
            buildingSize: `${formData.buildingSize.toLocaleString()} m2`,
            electricityUsage: `${formData.electricityUsage.toLocaleString()} kWh/jaar`,
            gasUsage: `${formData.gasUsage.toLocaleString()} m3/jaar`,
            contractType: formData.contractType || 'Niet opgegeven',
            existingInstallations: formData.existingInstallations.length > 0 ?formData.existingInstallations.join(', ') : 'Geen',
            priorities: formData.priorities.length > 0 ?formData.priorities.join(', ') : 'Niet opgegeven',
            yearlySavings: `EUR ${calculatedResults.yearlySavings.toLocaleString()}/jaar`,
            totalInvestment: `EUR ${calculatedResults.totalInvestment.toLocaleString()}`,
            paybackPeriod: `${calculatedResults.paybackPeriod} jaar`,
            currentCosts: `EUR ${calculatedResults.currentCosts.total.toLocaleString()}/jaar`,
            co2Reduction: `${calculatedResults.co2Reduction} ton/jaar`,
            recommendations: calculatedResults.recommendations.map((rec) => ({
              name: rec.name,
              yearlySavings: `EUR ${rec.yearlySavings.toLocaleString()}/jaar`,
              investment: `EUR ${rec.investment.toLocaleString()}`,
              paybackYears: `${rec.paybackYears} jaar`,
              countsInTotals: rec.countsInTotals !== false,
            })),
            insight,
            summary: buildMailSummary(calculatedResults, insight),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Contact endpoint returned an error');
      }

      setSubmitStatus('success');
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (isTransitioning || isCalculating || isSubmitting) return;
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    const isLastStep = currentIndex === steps.length - 1;

    // Validate contact form on last step
    if (isLastStep && !validateContactForm()) {
      return;
    }

    if (!isLastStep) {
      setTransitionDirection('forward');
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(steps[currentIndex + 1].id as number | 'solar');
        setTimeout(() => setIsTransitioning(false), 50);
      }, 200);
    } else {
      setIsCalculating(true);
      setSubmitStatus('idle');
      setCalculationPhase(0);

      try {
        await new Promise((resolve) => setTimeout(resolve, 900));
        const nextResults = calculateResults();
        setResults(nextResults);
        const insight = await requestCalculatorInsight(nextResults);
        await submitLead(nextResults, insight);
        setShowResults(true);
      } finally {
        setIsCalculating(false);
      }
    }
  };

  const handlePrevious = () => {
    if (isTransitioning) return;
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
    setCalculatorInsight(null);
    setSubmitStatus('idle');
    setFormErrors({});
    setCurrentStep(1);
    setFormData({ businessType: '', buildingSize: 500, electricityUsage: 50000, gasUsage: 15000, existingInstallations: [], solarFeedIn: 0, contractType: '', priorities: [], contactName: '', companyName: '', email: '', privacyAccepted: false, honeypot: '' });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 100000) return `${Math.round(num / 1000)}k`;
    if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    return num.toString();
  };

  return (
    <section
      id="calculator"
      ref={containerRef}
      className="material-section relative overflow-hidden transition-colors duration-300"
      style={{
        backgroundImage: isDark
          ?'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
          : 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
      }}
    >
      {/* Subtle decorative elements - contained within section */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(13, 148, 136, 0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="material-chip inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            {t.chip}
          </div>
          <h2 className="material-title text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-900 dark:text-white mb-4">
            {t.title}
          </h2>
          <p className="text-base leading-7 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto sm:text-lg">
            {t.intro}
          </p>
          {isLoadingPrices && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-400 dark:text-gray-500">
              <div className="w-3 h-3 border-2 border-gray-300 dark:border-gray-600 border-t-emerald-500 rounded-full animate-spin" />
              {t.loadingPrices}
            </div>
          )}
        </div>

        {/* Main Calculator Container */}
        <div
          ref={cardRef}
          className="relative"
        >
          {/* Main card */}
          <div
            className="material-card-active relative rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
            style={{
              boxShadow: isDark
                ?'0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2), 0 20px 50px -12px rgba(0, 0, 0, 0.5)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 20px 50px -12px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* Top accent line */}
            <div
              className="h-1 w-full"
              style={{
                backgroundImage: 'linear-gradient(90deg, #0d9488 0%, #059669 50%, #16a34a 100%)',
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: isDark
                    ?'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)'
                    : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                  animation: 'shimmer-line 5s ease-in-out infinite',
                }}
              />
            </div>

            {/* Corner accents */}
            {/* Clean Stepper */}
            <div className="px-3 sm:px-8 pt-5 sm:pt-8 pb-4 sm:pb-6">
              <div className="mb-3 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 dark:bg-gray-900 dark:text-gray-300 sm:hidden">
                <span>{steps[currentStepIndex]?.label}</span>
                <span>{currentStepIndex + 1} / {steps.length}</span>
              </div>
              <div className="hidden pb-2 sm:block sm:overflow-visible sm:pb-0">
              <div className="flex min-w-0 items-center justify-between relative">
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
                            ?'bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-900'
                            : isCompleted
                            ?'bg-emerald-500'
                            : 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        {isCompleted ?(
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <Icon className={`w-5 h-5 ${isActive || isCompleted ?'text-white' : 'text-gray-400'}`} />
                        )}
                      </div>
                      <span
                        className={`mt-2 text-xs font-medium transition-all duration-300 ${
                          isActive ?'text-emerald-600 dark:text-emerald-400 sm:block' : isCompleted ?'text-emerald-500 dark:text-emerald-400 hidden sm:block' : 'text-gray-500 dark:text-gray-400 hidden sm:block'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="px-3 sm:px-8 pb-5 sm:pb-8">
              <div className="rounded-lg p-4 sm:p-8 min-h-[350px] bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
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
                        {t.phases[calculationPhase % 4]}
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

                {/* Mail confirmation */}
                {showResults && results && !isCalculating && (submitStatus === 'success' || submitStatus === 'error') && (
                  <div className="animate-fade-in">
                    {submitStatus === 'success' ? (
                      <div className="mx-auto max-w-2xl rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-800 dark:bg-emerald-900/30 sm:p-8">
                        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500">
                          <Check className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {isEnglish ? 'Your report is on its way' : 'Uw rapport is onderweg'}
                        </h3>
                        <p className="mt-3 text-base leading-7 text-gray-600 dark:text-gray-300">
                          {t.mailOpened}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                          {isEnglish
                            ? 'The report is sent to the email address you entered. Please also check spam or promotions folders if it is not visible within a few minutes.'
                            : 'Het rapport wordt verzonden naar het ingevulde e-mailadres. Controleer ook spam of reclame als u het binnen enkele minuten nog niet ziet.'}
                        </p>
                        <button
                          onClick={resetCalculator}
                          className="mt-6 rounded-lg border border-emerald-300 px-6 py-3 font-medium text-emerald-800 transition-all hover:bg-white dark:border-emerald-700 dark:text-emerald-200 dark:hover:bg-emerald-950"
                        >
                          {t.newCalculation}
                        </button>
                      </div>
                    ) : (
                      <div className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/30 sm:p-8">
                        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-500">
                          <AlertCircle className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {isEnglish ? 'Sending failed' : 'Versturen is niet gelukt'}
                        </h3>
                        <p className="mt-3 text-base leading-7 text-gray-600 dark:text-gray-300">
                          {t.mailError}{' '}
                          <a href="mailto:info@bespaarcheck.net" className="font-semibold underline">
                            info@bespaarcheck.net
                          </a>.
                        </p>
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                          <button
                            onClick={() => void submitLead(results, calculatorInsight)}
                            disabled={isSubmitting}
                            className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:bg-emerald-700 disabled:cursor-wait disabled:bg-emerald-400"
                          >
                            {isSubmitting ? t.preparing : isEnglish ? 'Try again' : 'Opnieuw proberen'}
                          </button>
                          <button
                            onClick={resetCalculator}
                            className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-all hover:bg-white dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            {t.newCalculation}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Form Steps with Slide Transitions */}
                {!showResults && !isCalculating && (
                  <div
                    className={`step-transition ${isTransitioning ?'transitioning' : ''} ${transitionDirection}`}
                    style={{
                      animation: !isTransitioning ?'step-slide-in 0.4s ease-out both' : 'step-slide-out 0.2s ease-in both',
                    }}
                  >
                    {/* Step 1: Business Info */}
                    {currentStep === 1 && (
                      <div>
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-lg bg-emerald-500 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.businessTitle}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">{t.businessIntro}</p>
                          </div>
                        </div>

                        {/* Dropdown */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t.businessType}
                          </label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setActiveDropdown(!activeDropdown)}
                              className={`w-full px-4 py-3 rounded-lg text-left flex items-center justify-between transition-all bg-white dark:bg-gray-800 border ${
                                activeDropdown ?'border-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-900' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                              }`}
                            >
                              <span className={`${formData.businessType ?'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                {businessOptions.find(type => type.value === formData.businessType)?.label || t.selectType}
                              </span>
                              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${activeDropdown ?'rotate-180' : ''}`} />
                            </button>

                            {activeDropdown && (
                              <div className="absolute z-50 w-full mt-1 py-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg">
                                {businessOptions.slice(1).map((type) => (
                                  <button
                                    key={type.value}
                                    onClick={() => {
                                      setFormData({ ...formData, businessType: type.value });
                                      setActiveDropdown(false);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left transition-colors flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                      formData.businessType === type.value ?'bg-emerald-50 dark:bg-emerald-900/30' : ''
                                    }`}
                                  >
                                    <span className={formData.businessType === type.value ?'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-gray-700 dark:text-gray-300'}>
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
                            {t.buildingSize}
                          </label>
                          <div className="relative p-5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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
                          <div className="w-12 h-12 rounded-lg bg-amber-500 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.usageTitle}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">{t.usageIntro}</p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {/* Electricity Slider */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t.electricityUsage}
                            </label>
                            <div className="p-5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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
                              {t.gasUsage}
                            </label>
                            <div className="p-5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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
                          <div className="w-12 h-12 rounded-lg bg-amber-500 flex items-center justify-center">
                            <Sun className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.systemsTitle}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Selecteer wat u al heeft geïnstalleerd</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            { id: 'led', label: 'LED-verlichting', desc: 'Energiezuinige verlichting', icon: Zap, color: '#22c55e' },
                            { id: 'solar', label: 'Zonnepanelen', desc: 'Eigen stroomopwekking', icon: Sun, color: '#f59e0b' },
                            { id: 'heatpump', label: 'Warmtepomp', desc: 'Efficiënte verwarming', icon: Thermometer, color: '#ef4444' },
                            { id: 'ems', label: 'EMS Systeem', desc: 'Slim energiebeheer', icon: Settings, color: '#8b5cf6' },
                          ].map((option) => {
                            const isSelected = formData.existingInstallations.includes(option.id);
                            const Icon = option.icon;
                            return (
                              <button
                                key={option.id}
                                onClick={() => {
                                  const newInstallations = isSelected
                                    ?formData.existingInstallations.filter((i) => i !== option.id)
                                    : [...formData.existingInstallations, option.id];
                                  setFormData({ ...formData, existingInstallations: newInstallations });
                                }}
                                className={`p-4 rounded-lg text-left transition-all border-2 ${
                                  isSelected
                                    ?'border-current bg-opacity-10'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                                }`}
                                style={{
                                  borderColor: isSelected ?option.color : undefined,
                                  backgroundColor: isSelected ?`${option.color}10` : undefined,
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

                        <div className="mt-6 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-center">
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {t.noSystems}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step Solar: Feed-in / Teruglevering */}
                    {currentStep === 'solar' && (
                      <div>
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-lg bg-amber-500 flex items-center justify-center">
                            <ArrowDownUp className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.feedTitle}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">{t.feedIntro}</p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {/* Feed-in slider */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              {t.annualFeed}
                            </label>
                            <div className="p-5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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
                          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800">
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              <span className="text-amber-600 dark:text-amber-400 font-semibold">Tip:</span> Teruglevering is de stroom die uw zonnepanelen produceren maar die u niet zelf verbruikt. Dit wordt teruggeleverd aan het elektriciteitsnet.
                            </p>
                          </div>

                          {/* Quick select buttons */}
                          <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{t.quickSelect}</p>
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
                                        ?'border-amber-500 bg-amber-500 text-white'
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
                          <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                            <Euro className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.contractTitle}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">{t.contractIntro}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {[
                            { value: 'variable', label: 'Variabel tarief', desc: 'Prijs varieert met de marktomstandigheden', icon: TrendingDown, color: '#f97316' },
                            { value: 'fixed', label: 'Vast tarief', desc: 'Vaste prijs gedurende de contractperiode', icon: Euro, color: '#3b82f6' },
                            { value: 'dynamic', label: 'Dynamisch tarief', desc: 'Realtime uurprijzen voor stuurbaar verbruik', icon: Zap, color: '#10b981' },
                          ].map((option) => {
                            const isSelected = formData.contractType === option.value;
                            const Icon = option.icon;
                            return (
                              <button
                                key={option.value}
                                onClick={() => setFormData({ ...formData, contractType: option.value })}
                                className={`relative w-full p-4 rounded-lg text-left transition-all border-2 ${
                                  isSelected
                                    ?'bg-white dark:bg-gray-800'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                                }`}
                                style={{
                                  borderColor: isSelected ?option.color : undefined,
                                  backgroundColor: isSelected ?`${option.color}08` : undefined,
                                }}
                              >
                                <div className="flex items-center gap-4">
                                  {/* Radio button */}
                                  <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all`}
                                    style={{
                                      borderColor: isSelected ?option.color : '#d1d5db',
                                      backgroundColor: isSelected ?option.color : 'transparent',
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

                        <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
                          <p className="text-gray-600 dark:text-gray-300 text-sm flex items-center gap-2">
                            <Zap className="w-4 h-4 text-blue-500" />
                            <span>{t.dynamicNote} <span className="text-blue-600 dark:text-blue-400 font-semibold">{t.dynamicNoteStrong}</span></span>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Priorities */}
                    {currentStep === 5 && (
                      <div>
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-lg bg-violet-500 flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t.prioritiesTitle}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">{t.prioritiesIntro}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                                    ?formData.priorities.filter((p) => p !== option.id)
                                    : [...formData.priorities, option.id];
                                  setFormData({ ...formData, priorities: newPriorities });
                                }}
                                className={`p-4 rounded-lg text-center transition-all border-2 ${
                                  isSelected
                                    ?'bg-white dark:bg-gray-800'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                                }`}
                                style={{
                                  borderColor: isSelected ?option.color : undefined,
                                  backgroundColor: isSelected ?`${option.color}10` : undefined,
                                }}
                              >
                                <div className="flex flex-col items-center">
                                  <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
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

                        <div className="mt-6 p-4 rounded-lg bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800 text-center">
                          <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center justify-center gap-2">
                            <Cpu className="w-4 h-4 text-violet-500" />
                            <span>{t.prioritiesNote}</span>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 6: Contact */}
                    {currentStep === 6 && (
                      <div className="mx-auto max-w-2xl">
                        <div className="mb-5 rounded-lg border border-teal-100 bg-white p-4 shadow-sm dark:border-teal-900/60 dark:bg-gray-900 sm:p-5">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-teal-500 shadow-lg shadow-teal-500/20">
                              <Mail className="h-6 w-6 text-white" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-xl font-bold leading-tight text-gray-900 dark:text-white">{t.contactTitle}</h3>
                              <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">{t.contactIntro}</p>
                            </div>
                          </div>

                          <div className="mt-4 rounded-lg border border-teal-100 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-950/30">
                            <p className="flex items-start gap-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
                              <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-500" />
                              <span>{t.contactBox}</span>
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 rounded-lg border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-4">
                          {/* Name */}
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {t.name} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-gray-50 text-gray-400 dark:bg-gray-800">
                                <User className="h-5 w-5" />
                              </div>
                              <input
                                type="text"
                                value={formData.contactName}
                                onChange={(e) => {
                                  setFormData({ ...formData, contactName: e.target.value });
                                  if (formErrors.contactName) setFormErrors(prev => {
                                    const next = { ...prev };
                                    delete next.contactName;
                                    return next;
                                  });
                                }}
                                placeholder="Jan Jansen"
                                className={`min-h-[56px] w-full rounded-lg border bg-gray-50 py-3 pl-14 pr-4 text-base text-gray-900 outline-none transition-all placeholder-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 ${
                                  formErrors.contactName
                                    ?'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900'
                                    : 'border-gray-200 dark:border-gray-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900'
                                }`}
                              />
                            </div>
                            {formErrors.contactName && (
                              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {formErrors.contactName}
                              </p>
                            )}
                          </div>

                          {/* Company */}
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {t.company}
                            </label>
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-gray-50 text-gray-400 dark:bg-gray-800">
                                <Building className="h-5 w-5" />
                              </div>
                              <input
                                type="text"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                placeholder="Uw Bedrijf B.V."
                                className="min-h-[56px] w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-14 pr-4 text-base text-gray-900 outline-none transition-all placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:ring-teal-900"
                              />
                            </div>
                          </div>

                          {/* Email */}
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {t.email} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-gray-50 text-gray-400 dark:bg-gray-800">
                                <Mail className="h-5 w-5" />
                              </div>
                              <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => {
                                  setFormData({ ...formData, email: e.target.value });
                                  if (formErrors.email) setFormErrors(prev => {
                                    const next = { ...prev };
                                    delete next.email;
                                    return next;
                                  });
                                }}
                                placeholder="jan@uwbedrijf.nl"
                                className={`min-h-[56px] w-full rounded-lg border bg-gray-50 py-3 pl-14 pr-4 text-base text-gray-900 outline-none transition-all placeholder-gray-400 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 ${
                                  formErrors.email
                                    ?'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900'
                                    : 'border-gray-200 dark:border-gray-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900'
                                }`}
                              />
                            </div>
                            {formErrors.email && (
                              <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {formErrors.email}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Honeypot - hidden from users, catches bots */}
                        <div className="absolute opacity-0 -z-10" aria-hidden="true" tabIndex={-1}>
                          <label htmlFor="website">Website</label>
                          <input
                            type="text"
                            id="website"
                            name="website"
                            autoComplete="off"
                            value={formData.honeypot}
                            onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                          />
                        </div>

                        <div className={`mt-4 rounded-lg border p-4 dark:bg-gray-800 ${
                          formErrors.privacyAccepted
                            ? 'border-red-300 bg-red-50 dark:border-red-800'
                            : 'border-gray-200 bg-gray-50 dark:border-gray-700'
                        }`}>
                          <label className="flex cursor-pointer items-start gap-3 text-left">
                            <input
                              type="checkbox"
                              checked={formData.privacyAccepted}
                              onChange={(e) => {
                                setFormData({ ...formData, privacyAccepted: e.target.checked });
                                if (formErrors.privacyAccepted) setFormErrors(prev => {
                                  const next = { ...prev };
                                  delete next.privacyAccepted;
                                  return next;
                                });
                              }}
                              className="mt-1 h-5 w-5 flex-shrink-0 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                            <span className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                              {t.privacy}{' '}
                              <a href="#privacy" className="font-semibold text-teal-700 underline underline-offset-2 dark:text-teal-300">
                                {t.privacyLink}
                              </a>.
                            </span>
                          </label>
                          {formErrors.privacyAccepted && (
                            <p className="mt-2 flex items-center gap-1 text-sm text-red-500">
                              <AlertCircle className="h-3.5 w-3.5" />
                              {formErrors.privacyAccepted}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 sm:flex-row sm:gap-4">
                      {/* Back Button */}
                      <button
                        onClick={handlePrevious}
                        disabled={currentStepIndex === 0}
                        className={`w-full px-4 py-3 rounded-lg font-medium transition-all border sm:w-auto sm:px-6 ${
                          currentStepIndex === 0
                            ?'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                            : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 rotate-180" />
                          {t.previous}
                        </span>
                      </button>

                      {/* Next/Analyze Button */}
                      <button
                        onClick={handleNext}
                        disabled={(currentStep === 1 && !formData.businessType) || isCalculating || isSubmitting}
                        className={`w-full px-4 py-4 rounded-lg font-semibold text-white transition-all sm:flex-1 sm:px-8 ${
                          (currentStep === 1 && !formData.businessType) || isCalculating || isSubmitting
                            ?'bg-gray-300 cursor-not-allowed'
                            : 'bg-emerald-500 hover:bg-emerald-600 hover:shadow-lg'
                        }`}
                      >
                        <span className="flex items-center justify-center gap-2">
                          {currentStepIndex === steps.length - 1 ?(
                            <>
                              {isSubmitting ? t.preparing : t.calculate}
                              {isSubmitting ? (
                                <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                              ) : (
                                <Sparkles className="w-5 h-5" />
                              )}
                            </>
                          ) : (
                            <>
                              {t.next}
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
