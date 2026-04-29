import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Zap } from 'lucide-react';

export function HeroSection() {
  const { isDark } = useTheme();
  const { isEnglish } = useLanguage();
  const text = isEnglish
    ? {
        chip: 'Smart savings start with insight',
        subtitle: 'For SMEs · discover your energy-saving opportunities instantly',
        intro: 'Quick insight into consumption, generation and smart saving options.',
        reassurance: 'Completely non-binding: you are not committed to anything.',
        cta: 'Start the BespaarCheck',
        rules: 'Check obligations',
        more: 'More information',
        routeLabel: 'Live roadmap',
        routeTitle: 'From insight to action',
        steps: [
          ['1', 'Consumption and building profile', 'The basis for a realistic indication'],
          ['2', 'Combine measures', 'LED, climate, contracts, solar and controls'],
          ['3', 'Optional follow-up', 'Only continue when it makes sense'],
        ],
        badges: ['Free', 'SME', 'No obligation'],
      }
    : {
        chip: 'Slim besparen begint met inzicht',
        subtitle: 'Voor MKB · ontdek direct uw energiebesparingskansen',
        intro: 'Snel inzicht in verbruik, opwek en slimme besparingsopties.',
        reassurance: 'Geheel vrijblijvend: u zit nergens aan vast.',
        cta: 'Doe de BespaarCheck',
        rules: 'Check verplichtingen',
        more: 'Meer informatie',
        routeLabel: 'Live routekaart',
        routeTitle: 'Van inzicht naar actie',
        steps: [
          ['1', 'Verbruik en gebouwprofiel', 'Basis voor een realistische indicatie'],
          ['2', 'Maatregelen combineren', 'LED, klimaat, contract, solar en sturing'],
          ['3', 'Vrijblijvend vervolg', 'Alleen verder als het logisch voelt'],
        ],
        badges: ['Gratis', 'MKB', 'Vrijblijvend'],
      };

  return (
    <section
      className="flex min-h-[auto] items-center justify-center pt-20 pb-8 relative overflow-hidden transition-colors duration-700 sm:min-h-[88svh] sm:pt-24 sm:pb-10"
      style={{
        backgroundImage: isDark
          ? 'linear-gradient(135deg, #070b1f 0%, #111b45 28%, #312e81 62%, #0f3f68 100%)'
          : 'linear-gradient(135deg, #00796b 0%, #00897b 45%, #2e7d32 100%)',
      }}
    >
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(circle at 18% 20%, rgba(124, 58, 237, 0.38) 0%, transparent 30%), radial-gradient(circle at 82% 14%, rgba(59, 130, 246, 0.34) 0%, transparent 28%), radial-gradient(circle at 72% 82%, rgba(20, 184, 166, 0.16) 0%, transparent 32%)'
            : 'radial-gradient(circle at 18% 20%, rgba(190, 242, 100, 0.16) 0%, transparent 30%), radial-gradient(circle at 82% 14%, rgba(45, 212, 191, 0.18) 0%, transparent 28%)',
        }}
      />

      {/* Subtle pattern overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${isDark ? 'opacity-[0.14]' : 'opacity-10'}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0 h-28 pointer-events-none transition-colors duration-700"
        style={{
          backgroundImage: isDark
            ? 'linear-gradient(to top, rgba(15, 23, 42, 0.42), transparent)'
            : 'linear-gradient(to top, rgba(255, 255, 255, 0.1), transparent)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 z-10">
        <div className="grid min-w-0 gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:gap-16 items-center">
          <div className="min-w-0 text-center xl:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 dark:border-violet-200/20 text-white/90 text-sm font-semibold mb-7 shadow-lg shadow-black/10 dark:shadow-violet-950/20">
              <Sparkles className="w-4 h-4 text-lime-200 dark:text-violet-200" />
              {text.chip}
            </div>
        {/* Main Title */}
        <h1
          className="font-bold text-white mb-7 tracking-tight material-title"
          style={{
            fontSize: 'clamp(2.35rem, 8vw, 5.6rem)',
            lineHeight: 1,
            textShadow: '0 8px 36px rgba(0, 0, 0, 0.28)',
          }}
        >
          BespaarCheck
        </h1>
        <h2
          className="mx-auto mb-6 max-w-[22rem] overflow-wrap-anywhere font-medium text-white/90 sm:max-w-3xl xl:mx-0"
          style={{
            fontSize: 'clamp(1rem, 2.2vw, 1.75rem)',
            lineHeight: 1.3,
            textShadow: '0 4px 22px rgba(0, 0, 0, 0.22)',
          }}
        >
          {text.subtitle}
        </h2>

        {/* Subtitle */}
        <p
          className="mx-auto mb-3 max-w-[21rem] overflow-wrap-anywhere text-white/90 leading-relaxed sm:max-w-2xl xl:mx-0"
          style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
        >
          {text.intro}
        </p>
        <p
          className="mx-auto mb-8 max-w-[21rem] overflow-wrap-anywhere font-semibold sm:max-w-2xl sm:mb-12 xl:mx-0"
          style={{
            color: isDark ? '#c4b5fd' : '#bef264',
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          }}
        >
          {text.reassurance}
        </p>

            <div className="flex flex-col sm:flex-row items-center justify-center xl:justify-start gap-3">
              <a
                href="#calculator"
                className="material-button inline-flex items-center justify-center gap-2 font-semibold bg-white text-emerald-800 px-8 py-4 text-lg"
                style={{
                  boxShadow: '0 12px 34px -12px rgba(0, 0, 0, 0.4)',
                }}
              >
                {text.cta}
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#regelgeving"
                className="material-button inline-flex items-center justify-center gap-2 px-7 py-4 text-white font-semibold border border-white/25 bg-white/10 hover:bg-white/15"
              >
                {text.rules}
                <ShieldCheck className="w-5 h-5" />
              </a>
            </div>

        {/* More info link */}
        <div className="mt-7">
          <a
            href="#savings"
            className="text-white/80 hover:text-white underline underline-offset-4 transition-colors text-sm font-medium"
          >
            {text.more}
          </a>
        </div>
          </div>

          <div className="hero-route-card relative mx-auto w-full min-w-0 max-w-full sm:max-w-xl xl:mx-0">
            <div className="material-surface w-full max-w-full overflow-hidden rounded-lg bg-white/92 dark:bg-slate-950/86 backdrop-blur-xl p-4 sm:p-6 border-white/35 dark:border-violet-300/20 dark:shadow-2xl dark:shadow-violet-950/30">
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-gray-100 dark:border-indigo-900/50">
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-sky-300">{text.routeLabel}</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{text.routeTitle}</h3>
                </div>
                <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-violet-500/20 text-emerald-700 dark:text-violet-200 flex items-center justify-center">
                  <Zap className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {text.steps.map(([step, title, stepText]) => (
                  <div key={step} className="flex items-start gap-3 rounded-lg bg-gray-50 dark:bg-slate-900/80 p-3 border border-gray-100 dark:border-indigo-900/50">
                    <div className="h-8 w-8 rounded-lg bg-emerald-600 dark:bg-gradient-to-br dark:from-violet-500 dark:to-sky-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {step}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{stepText}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {text.badges.map((label) => (
                  <div key={label} className="rounded-lg bg-emerald-50 dark:bg-violet-500/10 text-emerald-800 dark:text-violet-100 px-2 sm:px-3 py-2 text-center text-xs font-bold border border-transparent dark:border-violet-300/20">
                    <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-8 hidden animate-pulse sm:block xl:mt-12">
          <div className="w-px h-14 bg-white/40 mx-auto" />
        </div>
      </div>
    </section>
  );
}
