import { useState } from 'react';
import {
  ChevronDown,
  Building2,
  FileText,
  CheckSquare,
  Search,
  Home,
  Thermometer,
  Wind,
  ClipboardList,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const questions = [
  {
    id: 'energiebesparingsplicht',
    icon: Building2,
    question: 'Val ik onder de energiebesparingsplicht?',
    answer: 'Bedrijven met een jaarlijks energieverbruik vanaf 50.000 kWh elektriciteit of 25.000 m³ aardgas zijn verplicht erkende energiebesparende maatregelen te nemen met een terugverdientijd van 5 jaar of minder.',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'informatieplicht',
    icon: FileText,
    question: 'Moet ik rapporteren via de informatieplicht?',
    answer: 'Via het eLoket van RVO rapporteert u welke energiebesparende maatregelen u heeft genomen. Dit moet elke 4 jaar worden bijgewerkt.',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  {
    id: 'eml',
    icon: CheckSquare,
    question: 'Welke maatregelen moet ik minimaal uitvoeren (EML)?',
    answer: 'De Erkende Maatregelenlijsten (EML) bevatten standaard energiebesparende maatregelen per bedrijfstak die verplicht zijn als de terugverdientijd 5 jaar of minder is.',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  {
    id: 'eed',
    icon: Search,
    question: 'Ben ik EED-auditplichtig (Europese auditplicht)?',
    answer: 'Grote ondernemingen (>250 FTE of >€50M omzet) moeten elke 4 jaar een energieaudit laten uitvoeren volgens de EED-richtlijn.',
    iconBg: 'bg-gray-100 dark:bg-gray-700',
    iconColor: 'text-gray-600 dark:text-gray-400'
  },
  {
    id: 'labelc',
    icon: Home,
    question: 'Moet mijn kantoor aan Energielabel C voldoen?',
    answer: 'Sinds 1 januari 2023 moeten kantoorgebouwen groter dan 100 m² minimaal energielabel C hebben. Zonder geldig label mag het pand niet als kantoor worden gebruikt.',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400'
  },
  {
    id: 'epbd',
    icon: Thermometer,
    question: 'Moeten mijn installaties periodiek gekeurd worden (EPBD)?',
    answer: 'Verwarmings- en airconditioningsystemen boven bepaalde vermogens moeten periodiek worden gekeurd volgens de EPBD-richtlijn.',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400'
  },
  {
    id: 'fgassen',
    icon: Wind,
    question: 'Wat zijn mijn F-gassen verplichtingen (airco/koeling/warmtepomp)?',
    answer: 'Eigenaren van koel- en klimaatinstallaties met F-gassen zijn verplicht regelmatige lekcontroles uit te voeren en deze te registreren.',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
    iconColor: 'text-cyan-600 dark:text-cyan-400'
  },
  {
    id: 'rapportages',
    icon: ClipboardList,
    question: 'Waar en hoe dien ik mijn rapportages in?',
    answer: 'De meeste rapportages kunt u indienen via het eLoket van RVO (Rijksdienst voor Ondernemend Nederland). Sommige rapportages gaan via uw gemeente of omgevingsdienst.',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400'
  }
];

export function RegulationsSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { isDark } = useTheme();

  return (
    <section
      className="py-24 relative overflow-hidden"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #064e3b 0%, #022c22 50%, #14532d 100%)'
          : 'linear-gradient(135deg, #0f766e 0%, #065f46 50%, #14532d 100%)',
      }}
    >
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold italic text-white mb-4 tracking-tight">
            Wet- en regelgeving voor kleinverbruikers
          </h2>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {questions.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full p-5 flex items-center gap-4 text-left hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className={`w-11 h-11 rounded-xl ${item.iconBg} flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'scale-110' : ''}`}>
                    <Icon className={`w-5 h-5 ${item.iconColor}`} />
                  </div>
                  <span className="flex-grow font-semibold text-gray-900 dark:text-white">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-300 flex-shrink-0 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-5 pb-5 ml-15">
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed pl-15">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Box */}
        <div className="mt-10 bg-white dark:bg-gray-800 rounded-xl p-8 text-center shadow-xl">
          <p className="text-gray-600 dark:text-gray-300 mb-5">
            Wilt u meer weten? Bekijk de officiële richtlijnen bij RVO voor de volledige details.
          </p>
          <a
            href="https://www.rvo.nl/onderwerpen/energiebesparing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-800 dark:bg-blue-600 hover:bg-blue-900 dark:hover:bg-blue-700 text-white font-semibold rounded-full transition-all hover:shadow-lg"
          >
            Ga naar RVO
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
