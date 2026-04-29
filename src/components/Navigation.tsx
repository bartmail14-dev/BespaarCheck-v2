import { useState, useEffect } from 'react';
import {
  ChevronDown,
  Languages,
  Menu,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const logoBlue = '#006fba';

const materialIconPaths = {
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5Z',
  opportunities:
    'M19 3h-4.18C14.4 1.84 13.3 1 12 1S9.6 1.84 9.18 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1Zm1 15h-2v-2h2v2Zm2.07-7.75-.9.92C13.45 11.9 13 12.5 13 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25Z',
  regulation:
    'M12 3 4 7v2h16V7l-8-4ZM6 10l-3 6c0 1.66 1.34 3 3 3s3-1.34 3-3l-3-6Zm0 2.24L7.38 15H4.62L6 12.24ZM18 10l-3 6c0 1.66 1.34 3 3 3s3-1.34 3-3l-3-6Zm0 2.24L19.38 15h-2.76L18 12.24ZM11 10v8H8v2h8v-2h-3v-8h-2Z',
  faq:
    'M11 18h2v-2h-2v2Zm1-16C6.48 2 2 6.03 2 11c0 2.3 1.02 4.4 2.7 6L4 22l4.85-2.43c.98.28 2.03.43 3.15.43 5.52 0 10-4.03 10-9S17.52 2 12 2Zm0 16c-.94 0-1.82-.13-2.64-.38l-.78-.24-1.83.92.28-1.95-.61-.56C4.87 14.54 4 12.82 4 11c0-3.86 3.58-7 8-7s8 3.14 8 7-3.58 7-8 7Zm0-12c-2.21 0-4 1.57-4 3.5h2c0-.83.9-1.5 2-1.5s2 .67 2 1.5c0 1.5-3 1.32-3 4.5h2c0-2.18 3-2.38 3-4.5C16 7.57 14.21 6 12 6Z',
  contact:
    'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z',
  calculator:
    'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2ZM7 7h10v3H7V7Zm2 10H7v-2h2v2Zm0-4H7v-2h2v2Zm4 4h-2v-2h2v2Zm0-4h-2v-2h2v2Zm4 4h-2v-6h2v6Z',
} as const;

type MaterialIconName = keyof typeof materialIconPaths;

function MaterialIcon({ name, className }: { name: MaterialIconName; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      focusable="false"
    >
      <path d={materialIconPaths[name]} />
    </svg>
  );
}

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { isEnglish, language, toggleLanguage } = useLanguage();
  const labels = isEnglish
    ? {
        opportunities: 'Savings options',
        regulation: 'Regulations',
        contact: 'Contact',
        cta: 'Start the check',
        heatPump: 'Heat pump',
        solar: 'Solar panels',
        contracts: 'Energy contracts',
        storage: 'Storage and batteries',
        charging: 'EV chargers',
        smart: 'Smart energy management',
        darkMode: 'Toggle dark mode',
        closeMenu: 'Close menu',
        openMenu: 'Open menu',
        language: 'Switch to Dutch',
      }
    : {
        opportunities: 'Bespaarmogelijkheden',
        regulation: 'Regelgeving',
        contact: 'Contact',
        cta: 'Doe de BespaarCheck',
        heatPump: 'Warmtepomp',
        solar: 'Zonnepanelen',
        contracts: 'Energiecontracten',
        storage: 'Opslag en batterijen',
        charging: 'Laadpalen',
        smart: 'Slim energiemanagement',
        darkMode: 'Schakel donkere modus',
        closeMenu: 'Sluit menu',
        openMenu: 'Open menu',
        language: 'Schakel naar Engels',
      };
  const mobileLinks: Array<{ href: string; label: string; icon: MaterialIconName }> = [
    { href: '#top', label: 'Home', icon: 'home' },
    { href: '#savings', label: labels.opportunities, icon: 'opportunities' },
    { href: '#regelgeving', label: labels.regulation, icon: 'regulation' },
    { href: '#faq', label: 'FAQ', icon: 'faq' },
    { href: '#contact', label: labels.contact, icon: 'contact' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = () => setIsDropdownOpen(false);
    if (isDropdownOpen) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [isDropdownOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 bg-white border-b border-gray-100 transition-all duration-300 ${
        isMenuOpen
          ? 'z-[70] shadow-xl shadow-slate-900/10'
          : 'z-50 shadow-sm shadow-slate-900/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 h-16">
          {/* Logo */}
          <a href="#top" className="flex min-w-0 items-center">
            <img
              src="/logo.png"
              alt="BespaarCheck"
              className="h-7 w-auto max-w-[150px] sm:h-10 sm:max-w-[190px]"
            />
          </a>

          {/* Desktop menu */}
          <div className="hidden xl:flex items-center gap-5">
            <a href="#top" className="text-gray-700 hover:text-[#006fba] transition-colors font-medium">
              Home
            </a>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className="flex items-center gap-1 text-gray-700 hover:text-[#006fba] transition-colors font-medium"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
              >
                {labels.opportunities}
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-3 w-60 material-card bg-white p-2">
                  <a href="#savings" className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#006fba] transition-colors">
                    {labels.heatPump}
                  </a>
                  <a href="#savings" className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#006fba] transition-colors">
                    {labels.solar}
                  </a>
                  <a href="#savings" className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#006fba] transition-colors">
                    {labels.contracts}
                  </a>
                  <a href="#savings" className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#006fba] transition-colors">
                    {labels.storage}
                  </a>
                  <a href="#savings" className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#006fba] transition-colors">
                    {labels.charging}
                  </a>
                  <a href="#savings" className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-[#006fba] transition-colors">
                    {labels.smart}
                  </a>
                </div>
              )}
            </div>

            <a href="#regelgeving" className="text-gray-700 hover:text-[#006fba] transition-colors font-medium">
              {labels.regulation}
            </a>
            <a href="#faq" className="text-gray-700 hover:text-[#006fba] transition-colors font-medium">
              FAQ
            </a>
            <a href="#contact" className="text-gray-700 hover:text-[#006fba] transition-colors font-medium">
              {labels.contact}
            </a>

            <a
              href="#calculator"
              className="material-button px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
            >
              {labels.cta}
            </a>

            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-blue-100 hover:bg-blue-50 hover:text-[#006fba]"
              aria-label={labels.language}
            >
              <Languages className="h-4 w-4" />
              {language.toUpperCase()}
            </button>

            {/* Dark mode toggle */}
            <div className="flex items-center gap-2 ml-2">
              <Sun className="w-4 h-4 text-amber-500 transition-colors" />
              <button
                onClick={toggleTheme}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isDark ? 'bg-[#006fba]' : 'bg-gray-300'
                }`}
                aria-label={labels.darkMode}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    isDark ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <Moon className="w-4 h-4 transition-colors" style={{ color: logoBlue }} />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="xl:hidden flex shrink-0 items-center gap-0.5 sm:gap-3">
            <button
              onClick={toggleLanguage}
              className="inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg border border-blue-100 px-2 text-xs font-bold text-[#006fba] transition-colors hover:bg-blue-50 sm:min-w-11"
              aria-label={labels.language}
            >
              {language.toUpperCase()}
            </button>

            {/* Mobile dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="h-9 w-9 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center sm:h-10 sm:w-10"
              style={{ color: logoBlue }}
              aria-label={labels.darkMode}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative h-9 w-9 hover:bg-blue-50 rounded-lg transition-colors sm:h-10 sm:w-10"
              style={{ color: logoBlue }}
              aria-label={isMenuOpen ? labels.closeMenu : labels.openMenu}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
            >
              <Menu
                className={`absolute left-1/2 top-1/2 w-6 h-6 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                  isMenuOpen ? 'rotate-90 scale-75 opacity-0' : 'rotate-0 scale-100 opacity-100'
                }`}
              />
              <X
                className={`absolute left-1/2 top-1/2 w-6 h-6 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                  isMenuOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-75 opacity-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          id="mobile-navigation"
          className={`xl:hidden overflow-hidden border-t transition-[max-height,opacity,transform,border-color,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isMenuOpen
              ? 'max-h-[520px] opacity-100 translate-y-0 border-gray-100 pt-3 pb-5'
              : 'max-h-0 opacity-0 -translate-y-2 border-transparent py-0 pointer-events-none'
          }`}
        >
          <div
            className={`rounded-lg border bg-white transition-all duration-500 ${
              isMenuOpen
                ? 'border-gray-100 shadow-lg shadow-slate-900/10'
                : 'border-transparent shadow-none'
            }`}
          >
            <div className="flex flex-col p-2">
              {mobileLinks.map((link, index) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-gray-700 hover:bg-blue-50 hover:text-[#006fba] font-medium transition-all duration-300 ${
                      isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
                    }`}
                    style={{
                      transitionDelay: isMenuOpen ? `${80 + index * 45}ms` : `${index * 20}ms`,
                    }}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 shadow-inner" style={{ color: logoBlue }}>
                      <MaterialIcon name={link.icon} className="h-5 w-5" />
                    </span>
                    <span>{link.label}</span>
                  </a>
              ))}

              <a
                href="#calculator"
                onClick={() => setIsMenuOpen(false)}
                className={`mt-2 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3.5 text-white font-semibold shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:bg-emerald-700 ${
                  isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
                }`}
                style={{
                  transitionDelay: isMenuOpen ? `${80 + mobileLinks.length * 45}ms` : '0ms',
                }}
              >
                <MaterialIcon name="calculator" className="h-5 w-5" />
                {labels.cta}
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
