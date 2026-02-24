import { useTheme } from '../context/ThemeContext';

export function HeroSection() {
  const { isDark } = useTheme();

  return (
    <section
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

      <div className="relative max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 text-center z-10">
        {/* Main Title */}
        <h1
          className="font-bold text-white mb-8 tracking-tight"
          style={{
            fontSize: 'clamp(2.25rem, 8vw, 4.5rem)',
            lineHeight: 1,
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
          Voor MKB &middot; Ontdek direct uw energiebesparingskansen
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

        {/* Professional CTA Button */}
        <a
          href="#calculator"
          className="inline-flex items-center font-semibold rounded-full bg-white text-emerald-700 px-8 py-4 text-lg transition-all duration-200 ease-out hover:bg-emerald-50 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] min-h-[48px]"
          style={{
            boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.3)',
          }}
        >
          Doe de BespaarCheck
        </a>

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
    </section>
  );
}
