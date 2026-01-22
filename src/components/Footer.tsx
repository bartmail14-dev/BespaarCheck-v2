import { Mail, MapPin, Phone, Linkedin, Award } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function Footer() {
  const { isDark } = useTheme();

  return (
    <footer
      id="contact"
      className="py-20"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
          : 'linear-gradient(135deg, #1a365d 0%, #1e3a5f 50%, #0f2744 100%)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Left Column - Logo & Description */}
          <div>
            <div className="mb-8">
              <img src="/logo.png" alt="BespaarCheck" className="h-12 brightness-0 invert" />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md mb-8">
              BespaarCheck biedt de kennis, diensten en producten om uw energieprestaties te
              verbeteren vanuit een innovatief perspectief. Dat is wat ons energie geeft!
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
              >
                <Linkedin className="w-5 h-5 text-gray-300" />
              </a>
            </div>
          </div>

          {/* Right Column - Contact */}
          <div>
            <div className="flex items-center gap-2 mb-8">
              <Mail className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-semibold text-lg">Contact</h3>
            </div>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-gray-300 text-sm pt-2">
                  <p>Energiepark 15</p>
                  <p>3833 AM Leusden</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-400" />
                </div>
                <a
                  href="tel:+31338508900"
                  className="text-gray-300 text-sm hover:text-white transition-colors"
                >
                  +31 33 850 89 00
                </a>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-green-400" />
                </div>
                <a
                  href="mailto:info@bespaarcheckenergie.nl"
                  className="text-gray-300 text-sm hover:text-white transition-colors"
                >
                  info@bespaarcheckenergie.nl
                </a>
              </div>
            </div>

            {/* Certifications */}
            <div className="mt-10">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-gray-400" />
                <p className="text-gray-400 text-sm font-medium">Certificeringen</p>
              </div>
              <div className="flex gap-3">
                <span className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm text-gray-300 transition-colors">
                  ISO 50001
                </span>
                <span className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm text-gray-300 transition-colors">
                  ESCO
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-700/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-400 text-sm">
              © 2024 BespaarCheck. Alle rechten voorbehouden.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacybeleid
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Algemene voorwaarden
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Cookie beleid
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
