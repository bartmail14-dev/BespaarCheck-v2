import { useState } from 'react';
import { ChevronDown, Thermometer, Sun, FileText, Battery, Plug, Zap, ArrowRight } from 'lucide-react';

const opportunities = [
  {
    id: 'warmtepomp',
    icon: Thermometer,
    title: 'Warmtepomp',
    description: 'Efficiënte verwarming en koeling met tot 70% energiebesparing',
    color: '#ef4444',
    details: 'Een warmtepomp haalt warmte uit de buitenlucht, bodem of grondwater en gebruikt deze om uw bedrijfspand te verwarmen. In de zomer kan het systeem ook koelen.'
  },
  {
    id: 'zonnepanelen',
    icon: Sun,
    title: 'Zonnepanelen',
    description: 'Duurzame energie opwekking en directe terugverdientijd',
    color: '#f59e0b',
    details: 'Zonnepanelen zetten zonlicht om in elektriciteit. Met de huidige energieprijzen is de terugverdientijd vaak 5-7 jaar.'
  },
  {
    id: 'energiecontracten',
    icon: FileText,
    title: 'Energiecontracten',
    description: 'Optimale tarieven en contractvoorwaarden voor uw bedrijf',
    color: '#10b981',
    details: 'Wij analyseren uw huidige contract en vergelijken dit met actuele aanbiedingen. Vaak kunnen we honderden tot duizenden euro\'s per jaar besparen.'
  },
  {
    id: 'opslag',
    icon: Battery,
    title: 'Opslag & Batterijen',
    description: 'Energie opslaan voor optimaal gebruik en onafhankelijkheid',
    color: '#22c55e',
    details: 'Batterijopslag stelt u in staat om zelf opgewekte energie op te slaan voor later gebruik.'
  },
  {
    id: 'laadpalen',
    icon: Plug,
    title: 'Laadpalen',
    description: 'Slimme laadoplossingen voor elektrische voertuigen',
    color: '#6366f1',
    details: 'Met slimme laadpalen op uw bedrijfsterrein kunt u uw wagenpark en die van uw medewerkers efficiënt laden.'
  },
  {
    id: 'smart',
    icon: Zap,
    title: 'Smart Energy Management',
    description: 'Intelligente systemen voor real-time energieoptimalisatie',
    color: '#84cc16',
    details: 'Een Energy Management Systeem monitort en stuurt al uw energiestromen voor maximale besparing.'
  }
];

export function SavingsSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <section id="savings" className="py-24 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            Energiebesparingsmogelijkheden
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Ontdek de mogelijkheden voor uw bedrijf
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-14 mb-16">
          {opportunities.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className="group transition-all duration-300 hover:-translate-y-1"
              >
                {/* Icon and Chevron Row */}
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundColor: item.color }}
                  >
                    <Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
                  </div>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all hover:shadow-md"
                  >
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                  {item.description}
                </p>

                {/* Expanded Details */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isExpanded ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {item.details}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <a
            href="#calculator"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-800 dark:bg-blue-600 hover:bg-blue-900 dark:hover:bg-blue-700 text-white font-semibold rounded-full transition-all hover:shadow-xl hover:scale-105"
          >
            Bereken uw besparing
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
