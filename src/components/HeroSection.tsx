import { useState, useRef, useEffect } from 'react';
import { ParticleExplosion } from './ParticleExplosion';
import { ElectricityOverlay } from './ElectricityOverlay';
import { useTheme } from '../context/ThemeContext';

export function HeroSection() {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [hoverProgress, setHoverProgress] = useState(0);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const { isDark } = useTheme();

  // Handle hover progress for color transition (blue to red)
  useEffect(() => {
    if (isButtonHovered) {
      progressIntervalRef.current = window.setInterval(() => {
        setHoverProgress(prev => Math.min(prev + 0.015, 1));
      }, 50);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setHoverProgress(0);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isButtonHovered]);

  // Calculate button color based on hover progress
  const getButtonColor = () => {
    if (!isButtonHovered) return isDark ? 'rgb(34, 197, 94)' : 'rgb(255, 255, 255)';

    // Transition: white/green -> blue -> red
    if (hoverProgress < 0.5) {
      // White/Green to blue
      const t = hoverProgress * 2;
      if (isDark) {
        const r = Math.round(34 + (59 - 34) * t);
        const g = Math.round(197 - (197 - 130) * t);
        const b = Math.round(94 + (246 - 94) * t);
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        const r = Math.round(255 - (255 - 59) * t);
        const g = Math.round(255 - (255 - 130) * t);
        const b = Math.round(255 - (255 - 246) * t);
        return `rgb(${r}, ${g}, ${b})`;
      }
    } else {
      // Blue to red
      const t = (hoverProgress - 0.5) * 2;
      const r = Math.round(59 + (239 - 59) * t);
      const g = Math.round(130 - 130 * t);
      const b = Math.round(246 - 178 * t);
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  const getTextColor = () => {
    if (!isButtonHovered) return isDark ? 'rgb(255, 255, 255)' : 'rgb(31, 41, 55)';
    return hoverProgress < 0.3 ? (isDark ? 'rgb(255, 255, 255)' : 'rgb(31, 41, 55)') : 'rgb(255, 255, 255)';
  };

  const getGlowColor = () => {
    if (!isButtonHovered) return 'transparent';
    if (hoverProgress < 0.5) {
      return `rgba(59, 130, 246, ${0.5 + hoverProgress})`;
    }
    const t = (hoverProgress - 0.5) * 2;
    return `rgba(${Math.round(59 + 180 * t)}, ${Math.round(130 - 100 * t)}, ${Math.round(246 - 178 * t)}, ${0.7 + hoverProgress * 0.3})`;
  };

  // Progressive shake intensity
  const getShakeIntensity = () => {
    return Math.max(0.5, hoverProgress * 3); // Starts at 0.5, goes up to 3
  };

  // Progressive scale
  const getScale = () => {
    const baseScale = 1 + hoverProgress * 0.3; // 1.0 to 1.3
    const shake = isButtonHovered ? Math.sin(Date.now() / (80 - hoverProgress * 50)) * 0.02 * hoverProgress : 0;
    return baseScale + shake;
  };

  return (
    <section
      ref={heroRef}
      className="min-h-screen flex items-center justify-center pt-16 relative overflow-hidden transition-colors duration-500"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #14532d 100%)'
          : 'linear-gradient(135deg, #0d9488 0%, #059669 50%, #16a34a 100%)',
      }}
    >
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Particle explosion effect */}
      <ParticleExplosion
        isActive={isButtonHovered}
        buttonRef={buttonRef}
        containerRef={heroRef}
        intensity={hoverProgress}
      />

      {/* Electricity overlay */}
      <ElectricityOverlay
        isActive={isButtonHovered}
        buttonRef={buttonRef}
        containerRef={heroRef}
        intensity={hoverProgress}
      />

      {/* Screen flash on hover */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-100 z-5"
        style={{
          background: isButtonHovered
            ? `radial-gradient(circle at 50% 60%, ${getGlowColor()} 0%, transparent ${50 + hoverProgress * 30}%)`
            : 'transparent',
          opacity: isButtonHovered ? 1 : 0,
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-30">
        {/* Main Title - Viewport proportional */}
        <h1
          className="font-bold text-white mb-8 tracking-tight"
          style={{
            fontSize: 'clamp(3rem, 12vw, 8rem)',
            lineHeight: 0.95,
            textShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
          }}
        >
          BespaarCheck
        </h1>
        <h2
          className="font-medium text-white/80 mb-8"
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.75rem)',
            lineHeight: 1.3,
          }}
        >
          Voor MKB · Ontdek direct uw energiebesparingskansen
        </h2>

        {/* Subtitle */}
        <p
          className="text-white/90 mb-2"
          style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
        >
          Snel inzicht in verbruik, opwek en slimme besparingsopties.
        </p>
        <p
          className="font-semibold mb-12"
          style={{
            color: '#bef264',
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          }}
        >
          Simpel, gratis en zonder verplichtingen.
        </p>

        {/* EPIC CTA Button */}
        <div className="relative inline-block">
          {/* Button glow ring */}
          <div
            className="absolute inset-0 rounded-full transition-all duration-300"
            style={{
              transform: isButtonHovered ? `scale(${1.5 + hoverProgress * 1.5})` : 'scale(1)',
              background: isButtonHovered
                ? `radial-gradient(circle, ${getGlowColor()} 0%, transparent 70%)`
                : 'transparent',
              filter: isButtonHovered ? `blur(${15 + hoverProgress * 25}px)` : 'blur(0px)',
              opacity: isButtonHovered ? 1 : 0,
            }}
          />

          {/* Pulsing rings - intensity increases with progress */}
          {isButtonHovered && (
            <>
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  background: `radial-gradient(circle, ${getGlowColor()} 0%, transparent 70%)`,
                  animationDuration: `${1.5 - hoverProgress * 0.5}s`,
                  transform: `scale(${1 + hoverProgress})`,
                }}
              />
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  background: `radial-gradient(circle, ${getGlowColor()} 0%, transparent 70%)`,
                  animationDuration: `${2 - hoverProgress * 0.7}s`,
                  animationDelay: '0.3s',
                  transform: `scale(${1 + hoverProgress * 1.5})`,
                }}
              />
              {hoverProgress > 0.5 && (
                <div
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{
                    background: `radial-gradient(circle, ${getGlowColor()} 0%, transparent 70%)`,
                    animationDuration: '0.8s',
                    animationDelay: '0.1s',
                    transform: `scale(${1.5 + hoverProgress})`,
                  }}
                />
              )}
            </>
          )}

          <a
            ref={buttonRef}
            href="#calculator"
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            className="relative inline-flex items-center font-semibold rounded-full transition-all"
            style={{
              padding: isButtonHovered
                ? `${1 + hoverProgress * 0.5}rem ${2.5 + hoverProgress}rem`
                : '1rem 2.5rem',
              fontSize: isButtonHovered ? `${1 + hoverProgress * 0.25}rem` : '1rem',
              backgroundColor: getButtonColor(),
              color: getTextColor(),
              boxShadow: isButtonHovered
                ? `0 0 ${40 + hoverProgress * 60}px ${getGlowColor()}, 0 0 ${80 + hoverProgress * 120}px ${getGlowColor()}, 0 25px 50px -12px rgba(0, 0, 0, 0.5)`
                : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              transform: `scale(${getScale()})`,
              animation: isButtonHovered
                ? `buttonShake ${0.15 - hoverProgress * 0.08}s infinite`
                : 'none',
              transition: 'padding 0.3s, font-size 0.3s, background-color 0.1s, color 0.3s, box-shadow 0.3s',
            }}
          >
            Doe de BespaarCheck
          </a>
        </div>

        {/* More info link */}
        <div className="mt-6">
          <a
            href="#savings"
            className="text-white/80 hover:text-white underline underline-offset-4 transition-colors text-sm"
          >
            Meer informatie
          </a>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-20 animate-pulse">
          <div className="w-px h-20 bg-white/40 mx-auto" />
        </div>
      </div>

      {/* Keyframe animation for button shake - intensity controlled by CSS variable */}
      <style>{`
        @keyframes buttonShake {
          0%, 100% { transform: scale(${getScale()}) translate(0, 0) rotate(0deg); }
          10% { transform: scale(${getScale()}) translate(${-2 * getShakeIntensity()}px, ${-1 * getShakeIntensity()}px) rotate(${-1 * getShakeIntensity()}deg); }
          20% { transform: scale(${getScale()}) translate(${2 * getShakeIntensity()}px, ${1 * getShakeIntensity()}px) rotate(${1 * getShakeIntensity()}deg); }
          30% { transform: scale(${getScale()}) translate(${-1 * getShakeIntensity()}px, ${2 * getShakeIntensity()}px) rotate(0deg); }
          40% { transform: scale(${getScale()}) translate(${1 * getShakeIntensity()}px, ${-1 * getShakeIntensity()}px) rotate(${1 * getShakeIntensity()}deg); }
          50% { transform: scale(${getScale()}) translate(${-1 * getShakeIntensity()}px, ${1 * getShakeIntensity()}px) rotate(${-1 * getShakeIntensity()}deg); }
          60% { transform: scale(${getScale()}) translate(${2 * getShakeIntensity()}px, ${1 * getShakeIntensity()}px) rotate(0deg); }
          70% { transform: scale(${getScale()}) translate(${-2 * getShakeIntensity()}px, ${-1 * getShakeIntensity()}px) rotate(${-1 * getShakeIntensity()}deg); }
          80% { transform: scale(${getScale()}) translate(${1 * getShakeIntensity()}px, ${2 * getShakeIntensity()}px) rotate(${1 * getShakeIntensity()}deg); }
          90% { transform: scale(${getScale()}) translate(${-1 * getShakeIntensity()}px, ${-2 * getShakeIntensity()}px) rotate(0deg); }
        }
      `}</style>
    </section>
  );
}
