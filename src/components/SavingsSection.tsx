import { useState, useEffect } from 'react';
import { ChevronDown, Thermometer, Sun, FileText, Battery, Plug, Zap, ArrowRight, X, ExternalLink, CheckCircle } from 'lucide-react';

const opportunities = [
  {
    id: 'warmtepomp',
    icon: Thermometer,
    title: 'Warmtepomp',
    description: 'Efficiënte verwarming en koeling voor uw bedrijfspand',
    color: '#ef4444',
    details: 'Een warmtepomp haalt warmte uit de buitenlucht, bodem of grondwater en gebruikt deze om uw bedrijfspand te verwarmen. In de zomer kan het systeem ook koelen.',
    extendedInfo: {
      intro: 'Een warmtepomp is een duurzaam alternatief voor verwarming op aardgas. Het systeem onttrekt warmte uit de buitenlucht, bodem of grondwater en brengt deze naar een hoger temperatuurniveau voor verwarming.',
      benefits: [
        'Kan energieverbruik voor verwarming verlagen',
        'Geen directe CO₂-uitstoot op locatie',
        'Kan ook koelen in de zomer',
        'Potentieel lagere energiekosten op lange termijn',
        'Kan de waarde van uw pand verhogen'
      ],
      subsidies: 'Via de ISDE (Investeringssubsidie Duurzame Energie) kunt u mogelijk subsidie aanvragen voor warmtepompen. Raadpleeg RVO voor actuele voorwaarden en bedragen.',
      roi: 'De terugverdientijd is afhankelijk van uw huidige verwarmingssysteem, isolatie en energieprijzen.',
      sources: [
        { name: 'RVO - ISDE Warmtepomp zakelijk', url: 'https://www.rvo.nl/subsidies-financiering/isde/zakelijke-gebruikers/warmtepomp' },
        { name: 'Milieu Centraal - Warmtepomp', url: 'https://www.milieucentraal.nl/energie-besparen/duurzaam-verwarmen-en-koelen/warmtepomp-duurzaam-elektrisch-verwarmen/' }
      ]
    }
  },
  {
    id: 'zonnepanelen',
    icon: Sun,
    title: 'Zonnepanelen',
    description: 'Duurzame energie opwekken op uw eigen dak',
    color: '#f59e0b',
    details: 'Zonnepanelen zetten zonlicht om in elektriciteit. De terugverdientijd hangt af van uw situatie en energieprijzen.',
    extendedInfo: {
      intro: 'Zonnepanelen (PV-panelen) zetten zonlicht direct om in elektriciteit. Voor bedrijven met een geschikt dak kan dit een interessante optie zijn.',
      benefits: [
        'Kan uw energierekening verlagen',
        'Minder afhankelijk van energieprijsschommelingen',
        'Verlaagt uw CO₂-footprint',
        'Relatief weinig onderhoud nodig',
        'Lange levensduur (fabrikanten geven vaak 25 jaar garantie)'
      ],
      subsidies: 'Zakelijke zonnepanelen kunnen in aanmerking komen voor de Energie-investeringsaftrek (EIA). Raadpleeg RVO voor actuele voorwaarden.',
      roi: 'De terugverdientijd hangt af van dakoriëntatie, eigen verbruik en energieprijzen.',
      sources: [
        { name: 'RVO - Subsidies zonne-energie', url: 'https://www.rvo.nl/onderwerpen/zonne-energie/subsidies-regelingen' },
        { name: 'RVO - Energie-investeringsaftrek', url: 'https://www.rvo.nl/subsidies-financiering/eia' }
      ]
    }
  },
  {
    id: 'energiecontracten',
    icon: FileText,
    title: 'Energiecontracten',
    description: 'Vergelijk tarieven en contractvoorwaarden',
    color: '#10b981',
    details: 'Analyseer uw huidige contract en vergelijk met actuele aanbiedingen op de markt.',
    extendedInfo: {
      intro: 'Het loont om uw energiecontract regelmatig te vergelijken. Door contractvoorwaarden te optimaliseren kunt u mogelijk besparen zonder investering.',
      benefits: [
        'Geen investering nodig',
        'Vergelijk zakelijke energieleveranciers',
        'Flexibele of vaste contracten mogelijk',
        'Groene stroom beschikbaar',
        'Ondersteuning bij contractkeuze'
      ],
      subsidies: 'Geen directe subsidies, maar wel mogelijke belastingvoordelen bij keuze voor groene energie via Garanties van Oorsprong (GvO\'s).',
      roi: 'Besparing hangt af van uw huidige contract en verbruiksprofiel.',
      sources: [
        { name: 'ACM - Rechten zakelijke afnemers', url: 'https://www.acm.nl/nl/energie/elektriciteit-en-gas/rechten-van-afnemers/uw-rechten-als-zakelijk-afnemer-van-elektriciteit-en-gas' },
        { name: 'KVK - Kosten besparen', url: 'https://ondernemersplein.kvk.nl/kosten-besparen/' }
      ]
    }
  },
  {
    id: 'opslag',
    icon: Battery,
    title: 'Opslag & Batterijen',
    description: 'Energie opslaan voor later gebruik',
    color: '#22c55e',
    details: 'Batterijopslag stelt u in staat om zelf opgewekte energie op te slaan voor later gebruik.',
    extendedInfo: {
      intro: 'Batterijopslag kan interessant zijn voor bedrijven met zonnepanelen. U slaat overtollige energie op voor momenten dat u deze nodig heeft.',
      benefits: [
        'Meer eigen zonnestroom benutten',
        'Kan piekvraag op het net verminderen',
        'Mogelijkheid voor noodstroom',
        'Minder afhankelijk van het energienet',
        'Combineerbaar met slim laden van EV\'s'
      ],
      subsidies: 'Batterijopslag kan onder voorwaarden in aanmerking komen voor de EIA-regeling. Raadpleeg RVO voor actuele voorwaarden.',
      roi: 'De terugverdientijd hangt sterk af van uw piekbelasting, energieprijzen en netaansluiting.',
      sources: [
        { name: 'RVO - Energieopslag', url: 'https://www.rvo.nl/onderwerpen/netcongestie/energieopslag' },
        { name: 'Netbeheer Nederland', url: 'https://www.netbeheernederland.nl/' }
      ]
    }
  },
  {
    id: 'laadpalen',
    icon: Plug,
    title: 'Laadpalen',
    description: 'Laadoplossingen voor elektrische voertuigen',
    color: '#6366f1',
    details: 'Met laadpalen op uw bedrijfsterrein kunt u uw wagenpark en dat van medewerkers laden.',
    extendedInfo: {
      intro: 'Elektrisch rijden groeit. Met laadpalen op uw bedrijfsterrein faciliteert u medewerkers, klanten en uw eigen wagenpark.',
      benefits: [
        'Faciliteit voor EV-rijdende medewerkers',
        'Slim laden: laad wanneer stroom goedkoper is',
        'Combineerbaar met zonnepanelen',
        'Mogelijk laadpunten verhuren aan bezoekers',
        'Voorbereid op elektrisch wagenpark'
      ],
      subsidies: 'Laadinfrastructuur kan onder voorwaarden in aanmerking komen voor EIA. Raadpleeg RVO voor actuele regelingen.',
      roi: 'De terugverdientijd hangt af van gebruik, energiekosten en eventuele combinatie met zonnepanelen.',
      sources: [
        { name: 'RVO - Elektrisch vervoer', url: 'https://www.rvo.nl/onderwerpen/elektrisch-vervoer' },
        { name: 'RVO - Laadinfrastructuur subsidies', url: 'https://www.rvo.nl/subsidies-financiering/laadinfrastructuur' }
      ]
    }
  },
  {
    id: 'smart',
    icon: Zap,
    title: 'Smart Energy Management',
    description: 'Inzicht en sturing van uw energieverbruik',
    color: '#84cc16',
    details: 'Een Energy Management Systeem monitort uw energiestromen en kan helpen bij optimalisatie.',
    extendedInfo: {
      intro: 'Een Energy Management Systeem (EMS) geeft real-time inzicht in uw energieverbruik en kan apparaten automatisch aansturen.',
      benefits: [
        'Real-time inzicht in uw energiestromen',
        'Mogelijkheid tot automatische optimalisatie',
        'Kan helpen bij het verlagen van verbruik',
        'Integratie met zonnepanelen, batterij en laadpalen',
        'Rapportages voor duurzaamheidsverslagen'
      ],
      subsidies: 'EMS-systemen kunnen onder voorwaarden in aanmerking komen voor de EIA-regeling. Raadpleeg RVO voor actuele voorwaarden.',
      roi: 'De terugverdientijd hangt af van de complexiteit van uw energiesysteem en huidige verbruikspatronen.',
      sources: [
        { name: 'RVO - Energie voor MKB', url: 'https://www.rvo.nl/onderwerpen/klimaat-energie/klein-middelgroot-bedrijf' },
        { name: 'KVK - Duurzame bedrijfsvoering', url: 'https://ondernemersplein.kvk.nl/starten-met-een-duurzame-bedrijfsvoering/' }
      ]
    }
  }
];

export function SavingsSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<typeof opportunities[0] | null>(null);
  const [isModalClosing, setIsModalClosing] = useState(false);

  const openModal = (item: typeof opportunities[0]) => {
    setModalItem(item);
    setIsModalClosing(false);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setModalItem(null);
      setIsModalClosing(false);
      document.body.style.overflow = '';
    }, 300);
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalItem) closeModal();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [modalItem]);

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
                  className={`overflow-hidden transition-all duration-500 ease-out ${
                    isExpanded ? 'max-h-60 opacity-100 mt-5' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div
                    className="p-5 rounded-2xl relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${item.color}15 0%, ${item.color}08 100%)`,
                      borderLeft: `3px solid ${item.color}`,
                    }}
                  >
                    <div
                      className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"
                      style={{ backgroundColor: item.color }}
                    />
                    <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed relative z-10">
                      {item.details}
                    </p>
                    <button
                      onClick={() => openModal(item)}
                      className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold transition-all hover:gap-2.5 relative z-10"
                      style={{ color: item.color }}
                    >
                      Meer informatie
                      <ArrowRight className="w-4 h-4" />
                    </button>
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

      {/* Modal */}
      {modalItem && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
            isModalClosing ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={closeModal}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ${
              isModalClosing ? 'opacity-0' : 'opacity-100'
            }`}
          />

          {/* Modal Content */}
          <div
            className={`relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transition-all duration-300 ${
              isModalClosing
                ? 'opacity-0 scale-95 translate-y-4'
                : 'opacity-100 scale-100 translate-y-0'
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: !isModalClosing ? 'modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : undefined,
            }}
          >
            {/* Colored Header */}
            <div
              className="relative p-8 pb-6 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${modalItem.color} 0%, ${modalItem.color}dd 100%)`,
              }}
            >
              {/* Decorative circles */}
              <div
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20"
                style={{ backgroundColor: 'white' }}
              />
              <div
                className="absolute -bottom-20 -left-10 w-60 h-60 rounded-full opacity-10"
                style={{ backgroundColor: 'white' }}
              />

              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-20 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Icon and Title */}
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <modalItem.icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{modalItem.title}</h3>
                  <p className="text-white/80 text-sm mt-1">{modalItem.description}</p>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-8 overflow-y-auto max-h-[60vh]">
              {/* Intro */}
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                {modalItem.extendedInfo.intro}
              </p>

              {/* Benefits */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span
                    className="w-1.5 h-6 rounded-full"
                    style={{ backgroundColor: modalItem.color }}
                  />
                  Voordelen
                </h4>
                <ul className="space-y-2">
                  {modalItem.extendedInfo.benefits.map((benefit, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-gray-600 dark:text-gray-400"
                      style={{
                        animation: `fadeSlideIn 0.3s ease-out ${0.1 + index * 0.05}s both`,
                      }}
                    >
                      <CheckCircle
                        className="w-5 h-5 flex-shrink-0 mt-0.5"
                        style={{ color: modalItem.color }}
                      />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Subsidies */}
              <div
                className="p-4 rounded-2xl mb-6"
                style={{
                  background: `linear-gradient(135deg, ${modalItem.color}10 0%, ${modalItem.color}05 100%)`,
                  borderLeft: `3px solid ${modalItem.color}`,
                }}
              >
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Subsidies & Financiering
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {modalItem.extendedInfo.subsidies}
                </p>
              </div>

              {/* ROI */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl mb-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: modalItem.color }}
                >
                  ROI
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    Terugverdientijd
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {modalItem.extendedInfo.roi}
                  </p>
                </div>
              </div>

              {/* Sources */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                  Bronnen & Meer informatie
                </h4>
                <div className="flex flex-wrap gap-2">
                  {modalItem.extendedInfo.sources.map((source, index) => (
                    <a
                      key={index}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
                      style={{
                        backgroundColor: `${modalItem.color}15`,
                        color: modalItem.color,
                      }}
                    >
                      {source.name}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <a
                href="#calculator"
                onClick={closeModal}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-xl text-white font-semibold transition-all hover:scale-[1.02] hover:shadow-lg"
                style={{ backgroundColor: modalItem.color }}
              >
                Bereken uw besparing voor {modalItem.title}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal animations */}
      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
}
