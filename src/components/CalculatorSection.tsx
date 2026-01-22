import { useState, useRef, useEffect, useCallback } from 'react';
import { Building2, Zap, Euro, Users, CheckCircle, Sparkles, TrendingDown, Leaf, ArrowRight, Cpu, Sun, Battery, Car, Thermometer, Settings, ChevronDown } from 'lucide-react';

const steps = [
  { id: 1, label: 'Bedrijf', icon: Building2 },
  { id: 2, label: 'Verbruik', icon: Zap },
  { id: 3, label: 'Installaties', icon: Sun },
  { id: 4, label: 'Contract', icon: Euro },
  { id: 5, label: 'Prioriteiten', icon: Users },
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
  '': { buildingSize: { min: 50, max: 5000, default: 500, step: 50 }, electricity: { min: 5000, max: 500000, default: 50000, step: 5000 }, gas: { min: 0, max: 100000, default: 15000, step: 1000 } },
  retail: { buildingSize: { min: 50, max: 2000, default: 250, step: 25 }, electricity: { min: 5000, max: 150000, default: 35000, step: 2500 }, gas: { min: 0, max: 30000, default: 8000, step: 500 } },
  office: { buildingSize: { min: 100, max: 5000, default: 500, step: 50 }, electricity: { min: 10000, max: 300000, default: 60000, step: 5000 }, gas: { min: 0, max: 50000, default: 12000, step: 1000 } },
  warehouse: { buildingSize: { min: 500, max: 25000, default: 3000, step: 250 }, electricity: { min: 25000, max: 750000, default: 150000, step: 10000 }, gas: { min: 0, max: 150000, default: 40000, step: 2500 } },
  production: { buildingSize: { min: 1000, max: 50000, default: 5000, step: 500 }, electricity: { min: 100000, max: 2000000, default: 500000, step: 25000 }, gas: { min: 10000, max: 500000, default: 100000, step: 5000 } },
  hospitality: { buildingSize: { min: 50, max: 1500, default: 200, step: 25 }, electricity: { min: 10000, max: 200000, default: 45000, step: 2500 }, gas: { min: 5000, max: 75000, default: 20000, step: 1000 } },
  healthcare: { buildingSize: { min: 200, max: 15000, default: 1500, step: 100 }, electricity: { min: 50000, max: 1000000, default: 200000, step: 10000 }, gas: { min: 10000, max: 200000, default: 50000, step: 2500 } },
  other: { buildingSize: { min: 50, max: 10000, default: 500, step: 50 }, electricity: { min: 5000, max: 500000, default: 50000, step: 5000 }, gas: { min: 0, max: 100000, default: 15000, step: 1000 } },
};

interface CalculationResult {
  yearlySavings: number;
  co2Reduction: number;
  paybackPeriod: number;
  recommendations: string[];
}

// Animated particles for background
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  hue: number;
}

function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | undefined>(undefined);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    for (let i = 0; i < 60; i++) {
      particlesRef.current.push({
        id: i,
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        hue: Math.random() * 60 + 140, // Cyan to green
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      particlesRef.current.forEach((particle, i) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Mouse interaction
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          particle.speedX -= dx * 0.0002;
          particle.speedY -= dy * 0.0002;
        }

        // Boundary wrap
        if (particle.x < 0) particle.x = canvas.offsetWidth;
        if (particle.x > canvas.offsetWidth) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.offsetHeight;
        if (particle.y > canvas.offsetHeight) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue}, 80%, 60%, ${particle.opacity})`;
        ctx.fill();

        // Draw connections
        particlesRef.current.slice(i + 1).forEach(other => {
          const dx2 = particle.x - other.x;
          const dy2 = particle.y - other.y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if (dist2 < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `hsla(${(particle.hue + other.hue) / 2}, 70%, 50%, ${0.15 * (1 - dist2 / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.6 }}
    />
  );
}

// Glowing orb component
function GlowingOrb({ color, size, x, y, delay = 0 }: { color: string; size: number; x: string; y: string; delay?: number }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: 'blur(40px)',
        animation: `pulse-glow 4s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

export function CalculatorSection() {
  const [currentStep, setCurrentStep] = useState(1);
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
    contractType: '',
    priorities: [] as string[],
  });
  const [activeDropdown, setActiveDropdown] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward'>('forward');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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

  const progress = ((currentStep - 1) / 4) * 100;

  useEffect(() => {
    if (isCalculating) {
      const interval = setInterval(() => {
        setCalculationPhase((prev) => prev + 1);
      }, 400);
      return () => clearInterval(interval);
    }
  }, [isCalculating]);

  const calculateResults = useCallback((): CalculationResult => {
    const baseSavings = formData.electricityUsage * 0.15 + formData.gasUsage * 0.12;
    const sizeFactor = formData.buildingSize / 500;
    const contractFactor = formData.contractType === 'dynamic' ? 1.2 : formData.contractType === 'variable' ? 1.1 : 1;
    const yearlySavings = Math.round(baseSavings * sizeFactor * contractFactor);
    const co2Reduction = Math.round((formData.electricityUsage * 0.4 + formData.gasUsage * 1.8) * sizeFactor / 100) / 10;
    const recommendations: string[] = [];
    if (formData.priorities.includes('cost')) recommendations.push('LED-verlichting installatie');
    if (formData.priorities.includes('sustainability')) recommendations.push('Zonnepanelen overwegen');
    if (formData.priorities.includes('independence')) recommendations.push('Batterijopslag systeem');
    if (formData.priorities.includes('comfort')) recommendations.push('Smart thermostaat');
    if (recommendations.length === 0) recommendations.push('Energie-audit uitvoeren');
    return { yearlySavings, co2Reduction, paybackPeriod: Math.round(yearlySavings / 1000) / 2 + 1, recommendations };
  }, [formData]);

  const handleNext = () => {
    if (currentStep < 5) {
      setTransitionDirection('forward');
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
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
    if (currentStep > 1) {
      setTransitionDirection('backward');
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setTimeout(() => setIsTransitioning(false), 50);
      }, 200);
    }
  };

  const resetCalculator = () => {
    setShowResults(false);
    setResults(null);
    setCurrentStep(1);
    setFormData({ businessType: '', buildingSize: 500, electricityUsage: 50000, gasUsage: 15000, existingInstallations: [], contractType: '', priorities: [] });
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
      className="py-20 relative overflow-hidden min-h-screen"
      style={{
        background: 'linear-gradient(180deg, #0a0f1a 0%, #0d1929 50%, #0f2027 100%)',
      }}
    >
      {/* Animated particle background */}
      <AnimatedBackground />

      {/* Glowing orbs */}
      <GlowingOrb color="rgba(6, 182, 212, 0.3)" size={400} x="10%" y="20%" delay={0} />
      <GlowingOrb color="rgba(16, 185, 129, 0.25)" size={350} x="70%" y="60%" delay={1.5} />
      <GlowingOrb color="rgba(139, 92, 246, 0.2)" size={300} x="80%" y="10%" delay={3} />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 backdrop-blur-sm mb-8">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-300 text-sm font-medium tracking-wider uppercase">AI-Powered Analysis</span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-white">Ontdek uw </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 animate-gradient-x">
              besparingspotentieel
            </span>
          </h2>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Onze AI analyseert uw energieprofiel en geeft direct inzicht in besparingsmogelijkheden
          </p>
        </div>

        {/* Main Calculator Container */}
        <div
          ref={cardRef}
          className="relative group"
        >
          {/* Animated gradient border */}
          <div
            className="absolute -inset-[2px] rounded-3xl opacity-75 blur-sm"
            style={{
              background: 'linear-gradient(90deg, #06b6d4, #10b981, #8b5cf6, #06b6d4)',
              backgroundSize: '300% 100%',
              animation: 'gradient-shift 4s linear infinite',
            }}
          />

          {/* Outer glow ring */}
          <div
            className="absolute -inset-4 rounded-[2rem] opacity-30"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.4) 0%, transparent 70%)',
              filter: 'blur(30px)',
              animation: 'pulse-glow 3s ease-in-out infinite',
            }}
          />

          {/* Main card with glassmorphism */}
          <div
            className="relative rounded-3xl overflow-hidden backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(10,15,30,0.95) 0%, rgba(15,25,45,0.9) 50%, rgba(10,20,35,0.95) 100%)',
              boxShadow: `
                0 25px 80px -12px rgba(0,0,0,0.6),
                0 0 0 1px rgba(255,255,255,0.1),
                inset 0 1px 0 rgba(255,255,255,0.1),
                0 0 40px rgba(6,182,212,0.1)
              `,
            }}
          >
            {/* Animated top accent line */}
            <div
              className="h-1 w-full relative overflow-hidden"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.3) 20%, rgba(16,185,129,0.5) 50%, rgba(139,92,246,0.3) 80%, transparent 100%)',
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                  animation: 'shimmer-line 3s ease-in-out infinite',
                }}
              />
            </div>

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none">
              <div
                className="absolute top-4 left-4 w-20 h-20 rounded-full opacity-20"
                style={{
                  background: 'radial-gradient(circle, rgba(6,182,212,0.6) 0%, transparent 70%)',
                  filter: 'blur(15px)',
                }}
              />
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none">
              <div
                className="absolute bottom-4 right-4 w-20 h-20 rounded-full opacity-20"
                style={{
                  background: 'radial-gradient(circle, rgba(16,185,129,0.6) 0%, transparent 70%)',
                  filter: 'blur(15px)',
                }}
              />
            </div>

            {/* Premium Stepper */}
            <div className="px-4 sm:px-8 pt-8 sm:pt-10 pb-6 sm:pb-8">
              <div className="flex items-center justify-between relative">
                {/* Connection line with glow */}
                <div className="absolute top-5 sm:top-7 left-[8%] sm:left-[10%] right-[8%] sm:right-[10%] h-0.5 sm:h-1 bg-gray-800/50 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-1000 ease-out relative"
                    style={{
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #06b6d4, #10b981, #06b6d4)',
                      backgroundSize: '200% 100%',
                      animation: 'gradient-shift 2s linear infinite',
                      boxShadow: '0 0 20px rgba(6,182,212,0.6), 0 0 40px rgba(6,182,212,0.3)',
                    }}
                  >
                    <div
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white"
                      style={{ boxShadow: '0 0 15px rgba(255,255,255,0.8), 0 0 30px rgba(6,182,212,0.8)' }}
                    />
                  </div>
                </div>

                {steps.map((step) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;

                  return (
                    <div key={step.id} className="relative z-10 flex flex-col items-center">
                      {/* Pulse rings for active step */}
                      {isActive && (
                        <>
                          <div
                            className="absolute w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl"
                            style={{
                              background: 'linear-gradient(135deg, rgba(6,182,212,0.4) 0%, rgba(16,185,129,0.4) 100%)',
                              animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                            }}
                          />
                          <div
                            className="absolute w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl"
                            style={{
                              background: 'linear-gradient(135deg, rgba(6,182,212,0.2) 0%, rgba(16,185,129,0.2) 100%)',
                              animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                              animationDelay: '0.3s',
                            }}
                          />
                        </>
                      )}

                      <div
                        className={`relative w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-500 ${
                          isActive ? 'scale-105 sm:scale-110' : ''
                        }`}
                        style={{
                          background: isActive
                            ? 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)'
                            : isCompleted
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                          border: isActive
                            ? '2px solid rgba(255,255,255,0.4)'
                            : isCompleted
                            ? '2px solid rgba(16,185,129,0.3)'
                            : '1px solid rgba(255,255,255,0.1)',
                          boxShadow: isActive
                            ? '0 0 40px rgba(6,182,212,0.6), 0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                            : isCompleted
                            ? '0 0 25px rgba(16,185,129,0.4), 0 8px 30px rgba(0,0,0,0.3)'
                            : '0 4px 20px rgba(0,0,0,0.2)',
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white drop-shadow-lg" />
                        ) : (
                          <Icon className={`w-4 h-4 sm:w-6 sm:h-6 ${isActive ? 'text-white drop-shadow-lg' : 'text-gray-500'}`} />
                        )}
                      </div>
                      <span
                        className={`mt-2 sm:mt-4 text-[10px] sm:text-sm font-semibold transition-all duration-300 ${
                          isActive ? 'text-cyan-400 scale-105' : isCompleted ? 'text-emerald-400' : 'text-gray-600'
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
              <div
                className="rounded-xl sm:rounded-2xl p-4 sm:p-8 min-h-[350px] sm:min-h-[400px] relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(6,182,212,0.03) 0%, rgba(16,185,129,0.02) 50%, rgba(139,92,246,0.03) 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 -1px 0 rgba(0,0,0,0.1)',
                }}
              >
                {/* Subtle inner glow */}
                <div
                  className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.15) 0%, transparent 50%)',
                  }}
                />
                {/* Premium AI Calculation Animation */}
                {isCalculating && (
                  <div className="flex flex-col items-center justify-center h-[400px] relative">
                    {/* Background energy waves */}
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute rounded-full"
                          style={{
                            top: '50%',
                            left: '50%',
                            width: `${150 + i * 80}px`,
                            height: `${150 + i * 80}px`,
                            transform: 'translate(-50%, -50%)',
                            border: `2px solid rgba(6,182,212,${0.3 - i * 0.05})`,
                            animation: `pulse-ring ${2 + i * 0.5}s ease-out infinite`,
                            animationDelay: `${i * 0.3}s`,
                          }}
                        />
                      ))}
                    </div>

                    {/* Main AI Core */}
                    <div className="relative w-48 h-48 mb-10">
                      {/* Outer spinning ring with gradient */}
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: 'conic-gradient(from 0deg, transparent, rgba(6,182,212,0.8), transparent, rgba(16,185,129,0.8), transparent)',
                          animation: 'spin 2s linear infinite',
                        }}
                      />
                      <div
                        className="absolute inset-1 rounded-full"
                        style={{ background: 'rgba(10,15,30,0.95)' }}
                      />

                      {/* Middle pulsing ring */}
                      <div
                        className="absolute inset-4 rounded-full"
                        style={{
                          border: '3px solid transparent',
                          background: 'linear-gradient(rgba(10,15,30,0.95), rgba(10,15,30,0.95)) padding-box, linear-gradient(135deg, #06b6d4, #10b981, #8b5cf6) border-box',
                          animation: 'spin 3s linear infinite reverse',
                        }}
                      />

                      {/* Inner core with glow */}
                      <div
                        className="absolute inset-8 rounded-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
                          boxShadow: '0 0 60px rgba(6,182,212,0.6), 0 0 100px rgba(16,185,129,0.3), inset 0 0 30px rgba(255,255,255,0.2)',
                          animation: 'glow-pulse 1.5s ease-in-out infinite',
                        }}
                      >
                        <Cpu className="w-12 h-12 text-white drop-shadow-lg" />
                      </div>

                      {/* Orbiting particles */}
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2.5 h-2.5 rounded-full"
                          style={{
                            top: '50%',
                            left: '50%',
                            background: i % 2 === 0 ? '#06b6d4' : '#10b981',
                            transform: `rotate(${i * 45 + calculationPhase * 15}deg) translateX(${75 + (i % 3) * 10}px)`,
                            boxShadow: `0 0 15px ${i % 2 === 0 ? 'rgba(6,182,212,0.8)' : 'rgba(16,185,129,0.8)'}`,
                          }}
                        />
                      ))}

                      {/* Data streams */}
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 rounded-full"
                          style={{
                            height: '40px',
                            top: '50%',
                            left: '50%',
                            background: 'linear-gradient(180deg, transparent, #06b6d4, transparent)',
                            transform: `rotate(${i * 90 + calculationPhase * 10}deg) translateY(-90px)`,
                            opacity: 0.6,
                          }}
                        />
                      ))}
                    </div>

                    {/* Status text with better styling */}
                    <div className="text-center relative z-10">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        <p className="text-xl font-semibold text-white">
                          {['AI Initialiseren', 'Energieprofiel Analyseren', 'Besparingen Berekenen', 'Rapport Genereren', 'Optimaliseren'][calculationPhase % 5]}
                        </p>
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" style={{ animationDelay: '0.3s' }} />
                      </div>

                      {/* Premium progress bar */}
                      <div className="relative">
                        <div className="h-2 w-64 bg-gray-800/80 rounded-full overflow-hidden mx-auto">
                          <div
                            className="h-full rounded-full transition-all duration-300 relative"
                            style={{
                              width: `${Math.min((calculationPhase / 6) * 100, 100)}%`,
                              background: 'linear-gradient(90deg, #06b6d4, #10b981)',
                              boxShadow: '0 0 20px rgba(6,182,212,0.5)',
                            }}
                          >
                            <div
                              className="absolute inset-0"
                              style={{
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                                animation: 'shimmer-line 1s ease-in-out infinite',
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between mt-3 text-sm">
                          <span className="text-gray-500">Voortgang</span>
                          <span className="text-cyan-400 font-bold">
                            {Math.min(Math.round((calculationPhase / 6) * 100), 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Premium Results */}
                {showResults && results && !isCalculating && (
                  <div className="relative">
                    {/* Success burst effect */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 rounded-full"
                          style={{
                            top: '20%',
                            left: '50%',
                            background: i % 3 === 0 ? '#06b6d4' : i % 3 === 1 ? '#10b981' : '#8b5cf6',
                            animation: `confetti-burst 1.5s ease-out forwards`,
                            animationDelay: `${i * 0.05}s`,
                            transform: `rotate(${i * 30}deg) translateY(0)`,
                          }}
                        />
                      ))}
                    </div>

                    <div className="animate-fade-in">
                      {/* Success header */}
                      <div className="text-center mb-12">
                        <div className="relative inline-block mb-6">
                          {/* Glow rings */}
                          <div
                            className="absolute -inset-4 rounded-full"
                            style={{
                              background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)',
                              animation: 'pulse-glow 2s ease-in-out infinite',
                            }}
                          />
                          <div
                            className="relative w-24 h-24 rounded-2xl flex items-center justify-center"
                            style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              boxShadow: '0 0 60px rgba(16,185,129,0.5), 0 20px 40px rgba(0,0,0,0.3)',
                            }}
                          >
                            <CheckCircle className="w-12 h-12 text-white drop-shadow-lg" />
                          </div>
                        </div>
                        <h3 className="text-4xl font-bold text-white mb-3">Analyse Compleet!</h3>
                        <p className="text-xl text-gray-400">Ontdek uw persoonlijke besparingspotentieel</p>
                      </div>

                      {/* Premium stats grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {[
                          { label: 'Jaarlijkse besparing', value: `€${results.yearlySavings.toLocaleString()}`, icon: Euro, color: '#06b6d4', gradient: 'from-cyan-500/20 to-cyan-500/5' },
                          { label: 'CO₂ reductie', value: `${results.co2Reduction * 10} ton`, icon: Leaf, color: '#10b981', gradient: 'from-emerald-500/20 to-emerald-500/5' },
                          { label: 'Terugverdientijd', value: `${results.paybackPeriod} jaar`, icon: TrendingDown, color: '#8b5cf6', gradient: 'from-violet-500/20 to-violet-500/5' },
                        ].map((stat, i) => (
                          <div
                            key={i}
                            className="group relative overflow-hidden"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          >
                            {/* Card glow */}
                            <div
                              className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md"
                              style={{ background: stat.color }}
                            />

                            <div
                              className="relative p-8 rounded-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-1"
                              style={{
                                background: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)`,
                                border: `1px solid ${stat.color}30`,
                                boxShadow: `0 10px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)`,
                              }}
                            >
                              {/* Icon with glow */}
                              <div
                                className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                                style={{
                                  background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}cc 100%)`,
                                  boxShadow: `0 0 30px ${stat.color}40`,
                                }}
                              >
                                <stat.icon className="w-7 h-7 text-white" />
                              </div>
                              <p className="text-gray-400 text-sm mb-2 uppercase tracking-wider">{stat.label}</p>
                              <p
                                className="text-4xl font-bold"
                                style={{ color: stat.color }}
                              >
                                {stat.value}
                              </p>

                              {/* Decorative line */}
                              <div
                                className="absolute bottom-0 left-0 right-0 h-1 opacity-50"
                                style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Premium Recommendations */}
                      <div
                        className="relative p-8 rounded-2xl mb-10 overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(6,182,212,0.05) 100%)',
                          border: '1px solid rgba(16,185,129,0.2)',
                        }}
                      >
                        {/* Background decoration */}
                        <div
                          className="absolute top-0 right-0 w-40 h-40 opacity-20"
                          style={{
                            background: 'radial-gradient(circle, rgba(16,185,129,0.5) 0%, transparent 70%)',
                            filter: 'blur(40px)',
                          }}
                        />
                        <h4 className="relative text-xl font-semibold text-white mb-6 flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              boxShadow: '0 0 20px rgba(16,185,129,0.3)',
                            }}
                          >
                            <Sparkles className="w-5 h-5 text-white" />
                          </div>
                          Aanbevolen maatregelen
                        </h4>
                        <div className="relative flex flex-wrap gap-3">
                          {results.recommendations.map((rec, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 px-5 py-3 rounded-xl transition-all hover:scale-105"
                              style={{
                                background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)',
                                border: '1px solid rgba(16,185,129,0.3)',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                              }}
                            >
                              <CheckCircle className="w-5 h-5 text-emerald-400" />
                              <span className="text-emerald-200 font-medium">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Premium CTA Section */}
                      <div className="flex flex-col sm:flex-row gap-4 mt-2">
                        <button
                          onClick={resetCalculator}
                          className="group px-8 py-5 rounded-2xl font-semibold transition-all hover:scale-[1.02]"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                            border: '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          <span className="text-gray-400 group-hover:text-white transition-colors flex items-center gap-2">
                            <ArrowRight className="w-5 h-5 rotate-180" />
                            Nieuwe berekening
                          </span>
                        </button>
                        <button
                          className="flex-1 group relative px-10 py-5 rounded-2xl font-bold text-white overflow-hidden transition-all hover:scale-[1.02]"
                          style={{
                            background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
                            boxShadow: '0 15px 50px rgba(6,182,212,0.4), 0 5px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                          }}
                        >
                          <div
                            className="absolute -inset-1 opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-2xl blur-lg"
                            style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)' }}
                          />
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: 'linear-gradient(135deg, #0891b2 0%, #059669 100%)' }}
                          />
                          <span className="relative flex items-center justify-center gap-3 text-lg">
                            Vraag gratis adviesgesprek aan
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                          </span>
                        </button>
                      </div>
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
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center"
                            style={{
                              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                              boxShadow: '0 10px 30px rgba(6,182,212,0.3)',
                            }}
                          >
                            <Building2 className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white">Vertel ons over uw bedrijf</h3>
                            <p className="text-gray-500">We stemmen de analyse af op uw sector</p>
                          </div>
                        </div>

                        {/* Premium Custom Dropdown */}
                        <div className="mb-8">
                          <label className="flex items-center gap-2 text-sm font-semibold text-cyan-400/80 mb-4 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            Bedrijfstype
                          </label>
                          <div className="relative group">
                            {/* Dropdown glow effect */}
                            {activeDropdown && (
                              <div
                                className="absolute -inset-1 rounded-2xl opacity-50 blur-md"
                                style={{
                                  background: 'linear-gradient(135deg, rgba(6,182,212,0.4) 0%, rgba(16,185,129,0.4) 100%)',
                                }}
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => setActiveDropdown(!activeDropdown)}
                              className="relative w-full p-5 rounded-2xl text-left flex items-center justify-between transition-all duration-300 hover:scale-[1.01]"
                              style={{
                                background: activeDropdown
                                  ? 'linear-gradient(135deg, rgba(6,182,212,0.15) 0%, rgba(16,185,129,0.1) 100%)'
                                  : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                                border: activeDropdown ? '2px solid rgba(6,182,212,0.5)' : '1px solid rgba(255,255,255,0.1)',
                                boxShadow: activeDropdown
                                  ? '0 0 40px rgba(6,182,212,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                                  : '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                              }}
                            >
                              <span className={`text-lg font-medium ${formData.businessType ? 'text-white' : 'text-gray-500'}`}>
                                {businessTypes.find(t => t.value === formData.businessType)?.label || 'Selecteer uw bedrijfstype...'}
                              </span>
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${activeDropdown ? 'rotate-180' : ''}`}
                                style={{
                                  background: activeDropdown
                                    ? 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)'
                                    : 'rgba(255,255,255,0.1)',
                                }}
                              >
                                <ChevronDown className={`w-5 h-5 ${activeDropdown ? 'text-white' : 'text-gray-400'}`} />
                              </div>
                            </button>

                            {activeDropdown && (
                              <div
                                className="absolute z-50 w-full mt-3 py-3 rounded-2xl overflow-hidden animate-fade-in"
                                style={{
                                  background: 'linear-gradient(135deg, rgba(10,15,30,0.98) 0%, rgba(15,25,45,0.98) 100%)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(6,182,212,0.1)',
                                }}
                              >
                                {businessTypes.slice(1).map((type, idx) => (
                                  <button
                                    key={type.value}
                                    onClick={() => {
                                      setFormData({ ...formData, businessType: type.value });
                                      setActiveDropdown(false);
                                    }}
                                    className="w-full px-5 py-4 text-left transition-all flex items-center gap-4 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-emerald-500/5"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                  >
                                    <div
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        formData.businessType === type.value
                                          ? 'bg-gradient-to-br from-cyan-500 to-emerald-500'
                                          : 'bg-white/5'
                                      }`}
                                    >
                                      <Building2 className={`w-4 h-4 ${formData.businessType === type.value ? 'text-white' : 'text-gray-500'}`} />
                                    </div>
                                    <span className={`font-medium ${formData.businessType === type.value ? 'text-cyan-400' : 'text-gray-300'}`}>
                                      {type.label}
                                    </span>
                                    {formData.businessType === type.value && (
                                      <CheckCircle className="w-5 h-5 text-emerald-400 ml-auto" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Premium Building Size Slider */}
                        <div>
                          <label className="flex items-center gap-2 text-sm font-semibold text-cyan-400/80 mb-4 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Bedrijfspand grootte
                          </label>
                          <div
                            className="relative p-6 rounded-2xl overflow-hidden group"
                            style={{
                              background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(16,185,129,0.05) 100%)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              boxShadow: '0 4px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                            }}
                          >
                            {/* Animated background glow */}
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                              style={{
                                background: 'radial-gradient(circle at 50% 50%, rgba(6,182,212,0.1) 0%, transparent 70%)',
                              }}
                            />

                            <div className="relative flex justify-between items-center mb-8">
                              <span className="text-gray-500 text-sm font-medium">{currentRanges.buildingSize.min.toLocaleString()} m²</span>
                              <div className="relative">
                                {/* Value display glow */}
                                <div
                                  className="absolute -inset-2 rounded-full opacity-50 blur-md"
                                  style={{
                                    background: 'linear-gradient(135deg, rgba(6,182,212,0.5) 0%, rgba(16,185,129,0.5) 100%)',
                                  }}
                                />
                                <div
                                  className="relative px-8 py-3 rounded-full"
                                  style={{
                                    background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
                                    boxShadow: '0 0 30px rgba(6,182,212,0.4), 0 10px 40px rgba(0,0,0,0.3)',
                                  }}
                                >
                                  <span className="text-3xl font-bold text-white">{formData.buildingSize.toLocaleString()}</span>
                                  <span className="text-lg text-white/80 ml-1">m²</span>
                                </div>
                              </div>
                              <span className="text-gray-500 text-sm font-medium">{currentRanges.buildingSize.max.toLocaleString()} m²</span>
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
                          <div className="relative">
                            <div
                              className="absolute -inset-2 rounded-2xl opacity-40 blur-md"
                              style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' }}
                            />
                            <div
                              className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                              style={{
                                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                boxShadow: '0 10px 40px rgba(251,191,36,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                              }}
                            >
                              <Zap className="w-8 h-8 text-white drop-shadow-lg" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white mb-1">Uw energieverbruik</h3>
                            <p className="text-gray-400">Dit helpt ons de besparing te berekenen</p>
                          </div>
                        </div>

                        <div className="space-y-8">
                          {/* Premium Electricity Slider */}
                          <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-amber-400/80 mb-4 uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              Elektriciteitsverbruik
                            </label>
                            <div
                              className="relative p-6 rounded-2xl overflow-hidden group"
                              style={{
                                background: 'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(251,191,36,0.03) 100%)',
                                border: '1px solid rgba(251,191,36,0.2)',
                                boxShadow: '0 4px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                              }}
                            >
                              <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{ background: 'radial-gradient(circle at 50% 50%, rgba(251,191,36,0.1) 0%, transparent 70%)' }}
                              />
                              <div className="relative flex justify-between items-center mb-8">
                                <span className="text-gray-500 text-sm font-medium">{formatNumber(currentRanges.electricity.min)} kWh</span>
                                <div className="relative">
                                  <div
                                    className="absolute -inset-2 rounded-full opacity-50 blur-md"
                                    style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.5) 0%, rgba(245,158,11,0.5) 100%)' }}
                                  />
                                  <div
                                    className="relative px-8 py-3 rounded-full"
                                    style={{
                                      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                      boxShadow: '0 0 30px rgba(251,191,36,0.4), 0 10px 40px rgba(0,0,0,0.3)',
                                    }}
                                  >
                                    <span className="text-2xl font-bold text-gray-900">{formData.electricityUsage.toLocaleString()}</span>
                                    <span className="text-sm text-gray-800 ml-1">kWh/jaar</span>
                                  </div>
                                </div>
                                <span className="text-gray-500 text-sm font-medium">{formatNumber(currentRanges.electricity.max)} kWh</span>
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

                          {/* Premium Gas Slider */}
                          <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-orange-400/80 mb-4 uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                              Gasverbruik
                            </label>
                            <div
                              className="relative p-6 rounded-2xl overflow-hidden group"
                              style={{
                                background: 'linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(249,115,22,0.03) 100%)',
                                border: '1px solid rgba(249,115,22,0.2)',
                                boxShadow: '0 4px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                              }}
                            >
                              <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{ background: 'radial-gradient(circle at 50% 50%, rgba(249,115,22,0.1) 0%, transparent 70%)' }}
                              />
                              <div className="relative flex justify-between items-center mb-8">
                                <span className="text-gray-500 text-sm font-medium">{formatNumber(currentRanges.gas.min)} m³</span>
                                <div className="relative">
                                  <div
                                    className="absolute -inset-2 rounded-full opacity-50 blur-md"
                                    style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.5) 0%, rgba(234,88,12,0.5) 100%)' }}
                                  />
                                  <div
                                    className="relative px-8 py-3 rounded-full"
                                    style={{
                                      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                      boxShadow: '0 0 30px rgba(249,115,22,0.4), 0 10px 40px rgba(0,0,0,0.3)',
                                    }}
                                  >
                                    <span className="text-2xl font-bold text-white">{formData.gasUsage.toLocaleString()}</span>
                                    <span className="text-sm text-white/80 ml-1">m³/jaar</span>
                                  </div>
                                </div>
                                <span className="text-gray-500 text-sm font-medium">{formatNumber(currentRanges.gas.max)} m³</span>
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
                          <div className="relative">
                            <div
                              className="absolute -inset-2 rounded-2xl opacity-40 blur-md"
                              style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)' }}
                            />
                            <div
                              className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                              style={{
                                background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
                                boxShadow: '0 10px 40px rgba(251,191,36,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                              }}
                            >
                              <Sun className="w-8 h-8 text-white drop-shadow-lg" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white mb-1">Huidige installaties</h3>
                            <p className="text-gray-400">Selecteer wat u al heeft geïnstalleerd</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { id: 'solar', label: 'Zonnepanelen', desc: 'Eigen stroomopwekking', icon: Sun, color: '#fbbf24' },
                            { id: 'heatpump', label: 'Warmtepomp', desc: 'Efficiënte verwarming', icon: Thermometer, color: '#ef4444' },
                            { id: 'charging', label: 'Laadpalen', desc: 'Elektrisch rijden', icon: Car, color: '#3b82f6' },
                            { id: 'battery', label: 'Batterijopslag', desc: 'Energie bufferen', icon: Battery, color: '#10b981' },
                            { id: 'ems', label: 'EMS Systeem', desc: 'Slim energiebeheer', icon: Settings, color: '#8b5cf6' },
                          ].map((option, index) => {
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
                                className="stagger-item group relative p-5 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02]"
                                style={{
                                  animationDelay: `${0.1 + index * 0.05}s`,
                                  background: isSelected
                                    ? `linear-gradient(135deg, ${option.color}20 0%, ${option.color}08 100%)`
                                    : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                                  border: isSelected ? `2px solid ${option.color}60` : '1px solid rgba(255,255,255,0.1)',
                                  boxShadow: isSelected
                                    ? `0 0 40px ${option.color}25, inset 0 1px 0 rgba(255,255,255,0.1)`
                                    : '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                                }}
                              >
                                <div className="relative flex items-center gap-4">
                                  <div
                                    className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300"
                                    style={{
                                      background: `linear-gradient(135deg, ${option.color} 0%, ${option.color}bb 100%)`,
                                      boxShadow: isSelected
                                        ? `0 0 30px ${option.color}60, 0 10px 30px rgba(0,0,0,0.3)`
                                        : '0 4px 15px rgba(0,0,0,0.3)',
                                    }}
                                  >
                                    <Icon className="w-7 h-7 text-white drop-shadow-md" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`font-semibold transition-colors duration-300 ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                      {option.label}
                                    </p>
                                    <p className={`text-sm truncate transition-colors duration-300 ${isSelected ? 'text-gray-300' : 'text-gray-500 group-hover:text-gray-200'}`}>{option.desc}</p>
                                  </div>
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                      isSelected ? 'scale-100' : 'scale-75 opacity-0 group-hover:opacity-50 group-hover:scale-90'
                                    }`}
                                    style={{
                                      background: isSelected ? option.color : 'rgba(255,255,255,0.1)',
                                      boxShadow: isSelected ? `0 0 15px ${option.color}60` : 'none',
                                    }}
                                  >
                                    <CheckCircle className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div
                          className="mt-6 p-4 rounded-xl text-center"
                          style={{
                            background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.03) 100%)',
                            border: '1px solid rgba(139,92,246,0.2)',
                          }}
                        >
                          <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4 text-violet-400" />
                            Geen installaties? Geen probleem - we analyseren alle mogelijkheden
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Contract - Premium */}
                    {currentStep === 4 && (
                      <div>
                        <div className="flex items-center gap-4 mb-8">
                          <div className="relative">
                            <div
                              className="absolute -inset-2 rounded-2xl opacity-40 blur-md"
                              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' }}
                            />
                            <div
                              className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                              style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                                boxShadow: '0 10px 40px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                              }}
                            >
                              <Euro className="w-8 h-8 text-white drop-shadow-lg" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white mb-1">Uw energiecontract</h3>
                            <p className="text-gray-400">Selecteer uw huidige contractvorm</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {[
                            { value: 'variable', label: 'Variabel tarief', desc: 'Prijs varieert met de marktomstandigheden', icon: TrendingDown, color: '#f97316', gradient: 'from-orange-500 to-amber-500' },
                            { value: 'fixed', label: 'Vast tarief', desc: 'Vaste prijs gedurende de contractperiode', icon: Euro, color: '#3b82f6', gradient: 'from-blue-500 to-indigo-500' },
                            { value: 'dynamic', label: 'Dynamisch tarief', desc: 'Realtime uurprijzen - optimaal voor slim verbruik', icon: Zap, color: '#10b981', gradient: 'from-emerald-500 to-cyan-500', recommended: true },
                          ].map((option, index) => {
                            const isSelected = formData.contractType === option.value;
                            const Icon = option.icon;
                            return (
                              <button
                                key={option.value}
                                onClick={() => setFormData({ ...formData, contractType: option.value })}
                                className="stagger-item group relative w-full p-6 rounded-2xl text-left transition-all duration-300 hover:scale-[1.01]"
                                style={{
                                  animationDelay: `${0.1 + index * 0.08}s`,
                                  background: isSelected
                                    ? `linear-gradient(135deg, ${option.color}20 0%, ${option.color}08 100%)`
                                    : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                                  border: isSelected ? `2px solid ${option.color}60` : '1px solid rgba(255,255,255,0.1)',
                                  boxShadow: isSelected
                                    ? `0 0 40px ${option.color}25, inset 0 1px 0 rgba(255,255,255,0.1)`
                                    : '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                                }}
                              >
                                {/* Hover glow */}
                                <div
                                  className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-25 transition-opacity duration-300 blur-md"
                                  style={{ background: option.color }}
                                />

                                {/* Recommended badge */}
                                {option.recommended && (
                                  <div
                                    className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold text-white"
                                    style={{
                                      background: `linear-gradient(135deg, ${option.color} 0%, ${option.color}dd 100%)`,
                                      boxShadow: `0 0 20px ${option.color}50`,
                                    }}
                                  >
                                    <span className="flex items-center gap-1">
                                      <Sparkles className="w-3 h-3" />
                                      Aanbevolen
                                    </span>
                                  </div>
                                )}

                                <div className="relative flex items-center gap-5">
                                  {/* Radio button */}
                                  <div
                                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300"
                                    style={{
                                      borderColor: isSelected ? option.color : 'rgba(255,255,255,0.3)',
                                      background: isSelected ? option.color : 'transparent',
                                      boxShadow: isSelected ? `0 0 20px ${option.color}60` : 'none',
                                    }}
                                  >
                                    {isSelected && (
                                      <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                                    )}
                                  </div>

                                  {/* Icon */}
                                  <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                                    style={{
                                      background: `linear-gradient(135deg, ${option.color} 0%, ${option.color}bb 100%)`,
                                      boxShadow: isSelected
                                        ? `0 0 25px ${option.color}50, 0 8px 25px rgba(0,0,0,0.3)`
                                        : '0 4px 15px rgba(0,0,0,0.2)',
                                    }}
                                  >
                                    <Icon className="w-6 h-6 text-white" />
                                  </div>

                                  {/* Text */}
                                  <div className="flex-1 min-w-0">
                                    <p className={`font-semibold text-lg transition-colors ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                      {option.label}
                                    </p>
                                    <p className="text-gray-500 text-sm">{option.desc}</p>
                                  </div>

                                  {/* Checkmark */}
                                  {isSelected && (
                                    <div
                                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                      style={{
                                        background: option.color,
                                        boxShadow: `0 0 15px ${option.color}60`,
                                      }}
                                    >
                                      <CheckCircle className="w-5 h-5 text-white" />
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div
                          className="mt-6 p-4 rounded-xl"
                          style={{
                            background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(99,102,241,0.05) 100%)',
                            border: '1px solid rgba(59,130,246,0.2)',
                          }}
                        >
                          <p className="text-gray-400 text-sm flex items-center gap-2">
                            <Zap className="w-4 h-4 text-blue-400" />
                            <span>Dynamische tarieven kunnen tot <span className="text-blue-400 font-semibold">30% extra besparing</span> opleveren</span>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Priorities - Premium */}
                    {currentStep === 5 && (
                      <div>
                        <div className="flex items-center gap-4 mb-8">
                          <div className="relative">
                            <div
                              className="absolute -inset-2 rounded-2xl opacity-40 blur-md"
                              style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' }}
                            />
                            <div
                              className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                              style={{
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                                boxShadow: '0 10px 40px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                              }}
                            >
                              <Users className="w-8 h-8 text-white drop-shadow-lg" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white mb-1">Wat is belangrijk voor u?</h3>
                            <p className="text-gray-400">Selecteer een of meerdere prioriteiten</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                          {[
                            { id: 'cost', label: 'Kostenbesparing', desc: 'Lagere energierekening', icon: Euro, color: '#fbbf24' },
                            { id: 'sustainability', label: 'Duurzaamheid', desc: 'Groene voetafdruk', icon: Leaf, color: '#10b981' },
                            { id: 'independence', label: 'Onafhankelijkheid', desc: 'Zelf energie opwekken', icon: Battery, color: '#3b82f6' },
                            { id: 'comfort', label: 'Comfort', desc: 'Optimaal klimaat', icon: Thermometer, color: '#8b5cf6' },
                          ].map((option, index) => {
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
                                className="stagger-item group relative p-6 rounded-2xl text-center transition-all duration-300 hover:scale-[1.03]"
                                style={{
                                  animationDelay: `${0.1 + index * 0.08}s`,
                                  background: isSelected
                                    ? `linear-gradient(135deg, ${option.color}20 0%, ${option.color}08 100%)`
                                    : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                                  border: isSelected ? `2px solid ${option.color}60` : '1px solid rgba(255,255,255,0.1)',
                                  boxShadow: isSelected
                                    ? `0 0 40px ${option.color}25, 0 15px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`
                                    : '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
                                }}
                              >
                                {/* Hover glow */}
                                <div
                                  className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-lg"
                                  style={{ background: option.color }}
                                />

                                {/* Icon container */}
                                <div className="relative flex flex-col items-center">
                                  <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300"
                                    style={{
                                      background: `linear-gradient(135deg, ${option.color} 0%, ${option.color}bb 100%)`,
                                      boxShadow: isSelected
                                        ? `0 0 35px ${option.color}60, 0 10px 30px rgba(0,0,0,0.3)`
                                        : '0 8px 25px rgba(0,0,0,0.3)',
                                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                                    }}
                                  >
                                    <Icon className="w-8 h-8 text-white drop-shadow-md" />
                                  </div>

                                  <p className={`font-semibold text-lg mb-1 transition-colors ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                    {option.label}
                                  </p>
                                  <p className="text-gray-500 text-sm">{option.desc}</p>

                                  {/* Selection indicator */}
                                  <div
                                    className={`mt-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                      isSelected ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                                    }`}
                                    style={{
                                      background: option.color,
                                      boxShadow: `0 0 20px ${option.color}60`,
                                    }}
                                  >
                                    <CheckCircle className="w-5 h-5 text-white" />
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div
                          className="mt-8 p-5 rounded-2xl text-center"
                          style={{
                            background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(168,85,247,0.08) 100%)',
                            border: '1px solid rgba(139,92,246,0.3)',
                            boxShadow: '0 4px 30px rgba(139,92,246,0.1)',
                          }}
                        >
                          <div className="flex items-center justify-center gap-3 text-violet-300">
                            <Cpu className="w-5 h-5" />
                            <span className="font-medium">Onze AI past de analyse aan op uw voorkeuren</span>
                            <Sparkles className="w-5 h-5 text-violet-400" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Premium Navigation */}
                    <div className="flex gap-4 mt-12 pt-8 border-t border-gray-800/50 relative">
                      {/* Navigation line glow */}
                      <div
                        className="absolute top-0 left-1/4 right-1/4 h-px"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.5), transparent)',
                        }}
                      />

                      {/* Back Button */}
                      <button
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                        className={`group relative px-8 py-4 rounded-2xl font-semibold transition-all duration-300 overflow-hidden ${
                          currentStep === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:scale-[1.02]'
                        }`}
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        {currentStep !== 1 && (
                          <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                            }}
                          />
                        )}
                        <span className={`relative flex items-center gap-2 ${currentStep === 1 ? 'text-gray-600' : 'text-gray-400 group-hover:text-white'}`}>
                          <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                          Vorige
                        </span>
                      </button>

                      {/* Next/Analyze Button */}
                      <button
                        onClick={handleNext}
                        disabled={currentStep === 1 && !formData.businessType}
                        className={`flex-1 group relative px-10 py-5 rounded-2xl font-bold text-white overflow-hidden transition-all duration-300 ${
                          currentStep === 1 && !formData.businessType ? 'opacity-40 cursor-not-allowed' : 'hover:scale-[1.02]'
                        }`}
                        style={{
                          background: currentStep === 1 && !formData.businessType
                            ? 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
                            : 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
                          boxShadow: currentStep === 1 && !formData.businessType
                            ? 'none'
                            : '0 15px 50px rgba(6,182,212,0.4), 0 5px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                        }}
                      >
                        {/* Button glow ring */}
                        {!(currentStep === 1 && !formData.businessType) && (
                          <>
                            <div
                              className="absolute -inset-1 opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-2xl blur-lg"
                              style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)' }}
                            />
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              style={{ background: 'linear-gradient(135deg, #0891b2 0%, #059669 100%)' }}
                            />
                            {/* Shimmer effect */}
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-100"
                              style={{
                                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                                animation: 'shimmer-line 1.5s ease-in-out infinite',
                              }}
                            />
                          </>
                        )}
                        <span className="relative flex items-center justify-center gap-3 text-lg">
                          {currentStep === 5 ? (
                            <>
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: 'rgba(255,255,255,0.2)' }}
                              >
                                <Cpu className="w-5 h-5" />
                              </div>
                              Start AI Analyse
                              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            </>
                          ) : (
                            <>
                              Volgende stap
                              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
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

        /* Premium Slider Styles */
        .premium-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 10px;
          border-radius: 5px;
          background: linear-gradient(90deg, rgba(6,182,212,0.3) 0%, rgba(16,185,129,0.3) 100%);
          outline: none;
          position: relative;
          cursor: pointer;
        }

        .premium-slider::-webkit-slider-runnable-track {
          height: 10px;
          border-radius: 5px;
          background: linear-gradient(90deg, #06b6d4, #10b981);
          box-shadow: 0 0 20px rgba(6,182,212,0.4);
        }

        .premium-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
          cursor: pointer;
          border: 4px solid rgba(6,182,212,0.8);
          box-shadow: 0 0 25px rgba(6,182,212,0.6), 0 0 50px rgba(6,182,212,0.3), 0 4px 15px rgba(0,0,0,0.4);
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          margin-top: -11px;
        }

        .premium-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          border-color: rgba(16,185,129,0.8);
          box-shadow: 0 0 35px rgba(6,182,212,0.8), 0 0 70px rgba(6,182,212,0.4), 0 6px 20px rgba(0,0,0,0.5);
        }

        .premium-slider::-moz-range-thumb {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
          cursor: pointer;
          border: 4px solid rgba(6,182,212,0.8);
          box-shadow: 0 0 25px rgba(6,182,212,0.6), 0 0 50px rgba(6,182,212,0.3), 0 4px 15px rgba(0,0,0,0.4);
        }

        .premium-slider::-moz-range-track {
          height: 10px;
          border-radius: 5px;
          background: linear-gradient(90deg, #06b6d4, #10b981);
        }

        .premium-slider-yellow {
          background: linear-gradient(90deg, rgba(251,191,36,0.3) 0%, rgba(245,158,11,0.3) 100%);
        }

        .premium-slider-yellow::-webkit-slider-runnable-track {
          background: linear-gradient(90deg, #fbbf24, #f59e0b);
          box-shadow: 0 0 20px rgba(251,191,36,0.4);
        }

        .premium-slider-yellow::-webkit-slider-thumb {
          border-color: rgba(251,191,36,0.8);
          box-shadow: 0 0 25px rgba(251,191,36,0.6), 0 0 50px rgba(251,191,36,0.3), 0 4px 15px rgba(0,0,0,0.4);
        }

        .premium-slider-yellow::-webkit-slider-thumb:hover {
          border-color: rgba(245,158,11,0.9);
          box-shadow: 0 0 35px rgba(251,191,36,0.8), 0 0 70px rgba(251,191,36,0.4), 0 6px 20px rgba(0,0,0,0.5);
        }

        .premium-slider-orange {
          background: linear-gradient(90deg, rgba(249,115,22,0.3) 0%, rgba(234,88,12,0.3) 100%);
        }

        .premium-slider-orange::-webkit-slider-runnable-track {
          background: linear-gradient(90deg, #f97316, #ea580c);
          box-shadow: 0 0 20px rgba(249,115,22,0.4);
        }

        .premium-slider-orange::-webkit-slider-thumb {
          border-color: rgba(249,115,22,0.8);
          box-shadow: 0 0 25px rgba(249,115,22,0.6), 0 0 50px rgba(249,115,22,0.3), 0 4px 15px rgba(0,0,0,0.4);
        }

        .premium-slider-orange::-webkit-slider-thumb:hover {
          border-color: rgba(234,88,12,0.9);
          box-shadow: 0 0 35px rgba(249,115,22,0.8), 0 0 70px rgba(249,115,22,0.4), 0 6px 20px rgba(0,0,0,0.5);
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
