import { useState, useEffect } from 'react';
import { ChevronDown, Thermometer, Sun, FileText, Battery, Plug, Zap, ArrowRight, X, ExternalLink, CheckCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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
        { name: 'RVO: ISDE warmtepomp zakelijk', url: 'https://www.rvo.nl/subsidies-financiering/isde/zakelijke-gebruikers/warmtepomp' },
        { name: 'Milieu Centraal: warmtepomp', url: 'https://www.milieucentraal.nl/energie-besparen/duurzaam-verwarmen-en-koelen/warmtepomp-duurzaam-elektrisch-verwarmen/' }
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
        { name: 'RVO: subsidies zonne-energie', url: 'https://www.rvo.nl/onderwerpen/zonne-energie/subsidies-regelingen' },
        { name: 'RVO: energie-investeringsaftrek', url: 'https://www.rvo.nl/subsidies-financiering/eia' }
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
        { name: 'ACM: rechten zakelijke afnemers', url: 'https://www.acm.nl/nl/energie/elektriciteit-en-gas/rechten-van-afnemers/uw-rechten-als-zakelijk-afnemer-van-elektriciteit-en-gas' },
        { name: 'KVK: kosten besparen', url: 'https://ondernemersplein.kvk.nl/kosten-besparen/' }
      ]
    }
  },
  {
    id: 'opslag',
    icon: Battery,
    title: 'Opslag en batterijen',
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
        { name: 'RVO: energieopslag', url: 'https://www.rvo.nl/onderwerpen/netcongestie/energieopslag' },
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
        { name: 'RVO: elektrisch vervoer', url: 'https://www.rvo.nl/onderwerpen/elektrisch-vervoer' },
        { name: 'RVO: laadinfrastructuur subsidies', url: 'https://www.rvo.nl/subsidies-financiering/laadinfrastructuur' }
      ]
    }
  },
  {
    id: 'smart',
    icon: Zap,
    title: 'Slim energiemanagement',
    description: 'Inzicht en sturing van uw energieverbruik',
    color: '#84cc16',
    details: 'Een energiemanagementsysteem monitort uw energiestromen en kan helpen bij optimalisatie.',
    extendedInfo: {
      intro: 'Een energiemanagementsysteem (EMS) geeft realtime inzicht in uw energieverbruik en kan apparaten automatisch aansturen.',
      benefits: [
        'Realtime inzicht in uw energiestromen',
        'Mogelijkheid tot automatische optimalisatie',
        'Kan helpen bij het verlagen van verbruik',
        'Integratie met zonnepanelen, batterij en laadpalen',
        'Rapportages voor duurzaamheidsverslagen'
      ],
      subsidies: 'EMS-systemen kunnen onder voorwaarden in aanmerking komen voor de EIA-regeling. Raadpleeg RVO voor actuele voorwaarden.',
      roi: 'De terugverdientijd hangt af van de complexiteit van uw energiesysteem en huidige verbruikspatronen.',
      sources: [
        { name: 'RVO: energie voor MKB', url: 'https://www.rvo.nl/onderwerpen/klimaat-energie/klein-middelgroot-bedrijf' },
        { name: 'KVK: duurzame bedrijfsvoering', url: 'https://ondernemersplein.kvk.nl/starten-met-een-duurzame-bedrijfsvoering/' }
      ]
    }
  }
];

const opportunitiesEn: typeof opportunities = [
  {
    ...opportunities[0],
    title: 'Heat pump',
    description: 'Efficient heating and cooling for your business premises',
    details: 'A heat pump draws heat from outdoor air, soil or groundwater and uses it to heat your business premises. In summer, the system can also provide cooling.',
    extendedInfo: {
      intro: 'A heat pump is a sustainable alternative to gas-based heating. It extracts heat from outdoor air, soil or groundwater and raises it to a useful temperature level for heating.',
      benefits: [
        'Can reduce energy use for heating',
        'No direct CO2 emissions on site',
        'Can also cool in summer',
        'Potentially lower energy costs over the long term',
        'Can increase the value of your property',
      ],
      subsidies: 'The Dutch ISDE scheme may provide subsidy options for heat pumps. Check RVO for current conditions and amounts.',
      roi: 'Payback time depends on your current heating system, insulation and energy prices.',
      sources: [
        { name: 'RVO: business ISDE heat pump', url: 'https://www.rvo.nl/subsidies-financiering/isde/zakelijke-gebruikers/warmtepomp' },
        { name: 'Milieu Centraal: heat pump', url: 'https://www.milieucentraal.nl/energie-besparen/duurzaam-verwarmen-en-koelen/warmtepomp-duurzaam-elektrisch-verwarmen/' },
      ],
    },
  },
  {
    ...opportunities[1],
    title: 'Solar panels',
    description: 'Generate sustainable energy on your own roof',
    details: 'Solar panels convert sunlight into electricity. Payback time depends on your situation and energy prices.',
    extendedInfo: {
      intro: 'Solar panels convert sunlight directly into electricity. For companies with a suitable roof, this can be an attractive option.',
      benefits: [
        'Can lower your energy bill',
        'Less exposure to energy price fluctuations',
        'Reduces your CO2 footprint',
        'Relatively low maintenance',
        'Long service life, often with manufacturer warranties around 25 years',
      ],
      subsidies: 'Business solar panels may be eligible for the Dutch Energy Investment Allowance. Check RVO for current conditions.',
      roi: 'Payback time depends on roof orientation, own consumption and energy prices.',
      sources: [
        { name: 'RVO: solar energy subsidies', url: 'https://www.rvo.nl/onderwerpen/zonne-energie/subsidies-regelingen' },
        { name: 'RVO: energy investment allowance', url: 'https://www.rvo.nl/subsidies-financiering/eia' },
      ],
    },
  },
  {
    ...opportunities[2],
    title: 'Energy contracts',
    description: 'Compare rates and contract conditions',
    details: 'Analyse your current contract and compare it with current offers in the market.',
    extendedInfo: {
      intro: 'It can pay to review your energy contract regularly. Optimising contract conditions may create savings without technical investment.',
      benefits: [
        'No investment required',
        'Compare business energy suppliers',
        'Flexible or fixed contracts possible',
        'Green electricity available',
        'Support with contract selection',
      ],
      subsidies: 'There are no direct subsidies, but green energy choices can involve Guarantees of Origin and other purchasing considerations.',
      roi: 'Savings depend on your current contract and consumption profile.',
      sources: [
        { name: 'ACM: rights for business customers', url: 'https://www.acm.nl/nl/energie/elektriciteit-en-gas/rechten-van-afnemers/uw-rechten-als-zakelijk-afnemer-van-elektriciteit-en-gas' },
        { name: 'KVK: reducing costs', url: 'https://ondernemersplein.kvk.nl/kosten-besparen/' },
      ],
    },
  },
  {
    ...opportunities[3],
    title: 'Storage and batteries',
    description: 'Store energy for later use',
    details: 'Battery storage lets you store self-generated energy for moments when you need it.',
    extendedInfo: {
      intro: 'Battery storage can be useful for businesses with solar panels. It stores surplus energy for later use.',
      benefits: [
        'Use more of your own solar electricity',
        'Can reduce peak demand on the grid',
        'Possible backup power option',
        'Less dependence on the grid',
        'Can be combined with smart EV charging',
      ],
      subsidies: 'Battery storage may qualify for the Dutch EIA scheme under certain conditions. Check RVO for current rules.',
      roi: 'Payback time depends strongly on peak load, energy prices and grid connection.',
      sources: [
        { name: 'RVO: energy storage', url: 'https://www.rvo.nl/onderwerpen/netcongestie/energieopslag' },
        { name: 'Netbeheer Nederland', url: 'https://www.netbeheernederland.nl/' },
      ],
    },
  },
  {
    ...opportunities[4],
    title: 'EV chargers',
    description: 'Charging solutions for electric vehicles',
    details: 'With chargers on your premises, employees, customers and your own fleet can charge vehicles.',
    extendedInfo: {
      intro: 'Electric mobility is growing. Chargers at your business premises support employees, customers and your own fleet.',
      benefits: [
        'Facility for employees driving electric vehicles',
        'Smart charging when electricity is cheaper',
        'Can be combined with solar panels',
        'Potential to offer paid visitor charging',
        'Ready for an electric fleet',
      ],
      subsidies: 'Charging infrastructure may be eligible for EIA under certain conditions. Check RVO for current schemes.',
      roi: 'Payback time depends on usage, energy costs and possible combination with solar panels.',
      sources: [
        { name: 'RVO: electric transport', url: 'https://www.rvo.nl/onderwerpen/elektrisch-vervoer' },
        { name: 'RVO: charging infrastructure subsidies', url: 'https://www.rvo.nl/subsidies-financiering/laadinfrastructuur' },
      ],
    },
  },
  {
    ...opportunities[5],
    title: 'Smart energy management',
    description: 'Insight and control over your energy use',
    details: 'An energy management system monitors your energy flows and can help optimise them.',
    extendedInfo: {
      intro: 'An energy management system gives real-time insight into energy use and can automatically control equipment.',
      benefits: [
        'Real-time insight into energy flows',
        'Automated optimisation options',
        'Can help reduce consumption',
        'Integration with solar panels, batteries and chargers',
        'Reports for sustainability documentation',
      ],
      subsidies: 'EMS systems may qualify for the Dutch EIA scheme under certain conditions. Check RVO for current rules.',
      roi: 'Payback time depends on the complexity of your energy system and current consumption patterns.',
      sources: [
        { name: 'RVO: energy for SMEs', url: 'https://www.rvo.nl/onderwerpen/klimaat-energie/klein-middelgroot-bedrijf' },
        { name: 'KVK: sustainable business operations', url: 'https://ondernemersplein.kvk.nl/starten-met-een-duurzame-bedrijfsvoering/' },
      ],
    },
  },
];

export function SavingsSection() {
  const { isEnglish } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<typeof opportunities[0] | null>(null);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const items = isEnglish ? opportunitiesEn : opportunities;
  const text = isEnglish
    ? {
        chip: 'Options',
        title: 'Energy-saving options',
        intro: 'Discover which combinations make sense for your business. From quick optimisations to larger steps toward smart energy.',
        more: 'More information',
        cta: 'Calculate your saving',
        benefits: 'Benefits',
        subsidies: 'Subsidies and financing',
        payback: 'Payback time',
        sources: 'Sources and more information',
        modalCta: 'Calculate your saving for',
        open: 'Open',
        close: 'Close',
        quickBenefits: 'Key gains',
        why: 'Why this can be relevant',
        practical: 'Practical note',
        sourceCount: 'sources',
      }
    : {
        chip: 'Mogelijkheden',
        title: 'Energiebesparingsmogelijkheden',
        intro: 'Ontdek welke combinaties voor uw bedrijf logisch zijn. Van snelle optimalisaties tot grotere stappen richting slimme energie.',
        more: 'Meer informatie',
        cta: 'Bereken uw besparing',
        benefits: 'Voordelen',
        subsidies: 'Subsidies en financiering',
        payback: 'Terugverdientijd',
        sources: 'Bronnen en meer informatie',
        modalCta: 'Bereken uw besparing voor',
        open: 'Open',
        close: 'Sluit',
        quickBenefits: 'Belangrijkste winst',
        why: 'Waarom dit relevant kan zijn',
        practical: 'Praktisch aandachtspunt',
        sourceCount: 'bronnen',
      };

  const openModal = (item: typeof opportunities[0]) => {
    setModalItem(item);
    setIsModalClosing(false);
  };

  const closeModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setModalItem(null);
      setIsModalClosing(false);
    }, 300);
  };

  useEffect(() => {
    if (!modalItem) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [modalItem]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalItem) closeModal();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [modalItem]);

  return (
    <section id="savings" className="material-section bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="material-chip inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold mb-4">
            <Zap className="w-4 h-4" />
            {text.chip}
          </div>
          <h2 className="material-title text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            {text.title}
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {text.intro}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6 mb-14">
          {items.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className={`material-card group p-5 sm:p-6 transition-all duration-500 ${
                  isExpanded ? 'md:col-span-2 xl:col-span-1 shadow-xl shadow-slate-900/10 dark:shadow-black/30' : ''
                }`}
              >
                {/* Icon and Chevron Row */}
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-14 h-14 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-0.5"
                    style={{
                      backgroundColor: `${item.color}17`,
                      color: item.color,
                    }}
                  >
                    <Icon className="w-7 h-7" strokeWidth={1.7} />
                  </div>
                  <button
                    onClick={() => setExpandedId(isExpanded ?null : item.id)}
                    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all"
                    aria-label={`${isExpanded ? text.close : text.open} ${item.title}`}
                    aria-expanded={isExpanded}
                    aria-controls={`savings-details-${item.id}`}
                  >
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-300 ${
                        isExpanded ?'rotate-180' : ''
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
                  id={`savings-details-${item.id}`}
                  className={`overflow-hidden transition-all duration-500 ease-out ${
                    isExpanded ?'max-h-[560px] opacity-100 mt-5' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div
                    className="rounded-lg relative overflow-hidden border bg-white dark:bg-gray-900"
                    style={{
                      borderColor: `${item.color}22`,
                    }}
                  >
                    <div
                      className="h-1 w-full"
                      style={{ backgroundImage: `linear-gradient(90deg, ${item.color}, ${item.color}88)` }}
                    />
                    <div className="p-5">
                      <div className="flex items-start gap-3">
                        <div
                          className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: `${item.color}14`,
                            color: item.color,
                          }}
                        >
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-500">
                            {text.why}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-gray-700 dark:text-gray-200">
                            {item.details}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-500">
                          {text.quickBenefits}
                        </p>
                        <div className="grid gap-2">
                          {item.extendedInfo.benefits.slice(0, 3).map((benefit, index) => (
                            <div
                              key={benefit}
                              className="flex items-start gap-2.5 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm leading-5 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                              style={{
                                animation: `fadeSlideIn 0.28s ease-out ${index * 0.05}s both`,
                              }}
                            >
                              <CheckCircle
                                className="mt-0.5 h-4 w-4 flex-shrink-0"
                                style={{ color: item.color }}
                              />
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <ShieldCheck className="h-4 w-4" style={{ color: item.color }} />
                          <span>
                            {item.extendedInfo.sources.length} {text.sourceCount}
                          </span>
                        </div>
                        <button
                          onClick={() => openModal(item)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                          aria-label={`${text.more} ${item.title}`}
                          style={{
                            backgroundColor: item.color,
                            boxShadow: `0 12px 24px ${item.color}22`,
                          }}
                        >
                          {text.more}
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
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
            className="material-button inline-flex items-center gap-2 px-8 py-4 bg-emerald-700 dark:bg-emerald-600 hover:bg-emerald-800 dark:hover:bg-emerald-700 text-white font-semibold"
          >
            {text.cta}
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Modal */}
      {modalItem && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
            isModalClosing ?'opacity-0' : 'opacity-100'
          }`}
          onClick={closeModal}
          role="presentation"
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 ${
              isModalClosing ?'opacity-0' : 'opacity-100'
            }`}
          />

          {/* Modal Content */}
          <div
            className={`relative flex max-h-[calc(100svh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl transition-all duration-300 dark:bg-gray-800 ${
              isModalClosing
                ?'opacity-0 scale-95 translate-y-4'
                : 'opacity-100 scale-100 translate-y-0'
            }`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`savings-modal-title-${modalItem.id}`}
            style={{
              animation: !isModalClosing ?'modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : undefined,
            }}
          >
            {/* Colored Header */}
            <div
              className="relative overflow-hidden p-4 sm:p-6"
              style={{
                backgroundImage: `linear-gradient(135deg, ${modalItem.color} 0%, ${modalItem.color}dd 100%)`,
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
                className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all hover:-translate-y-0.5 cursor-pointer"
                aria-label={text.close}
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Icon and Title */}
              <div className="relative z-10 grid gap-4 pr-10 sm:grid-cols-[auto_1fr] sm:items-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-white/20 flex items-center justify-center shadow-inner">
                  <modalItem.icon className="w-7 h-7 text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 id={`savings-modal-title-${modalItem.id}`} className="text-xl sm:text-2xl font-bold text-white">{modalItem.title}</h3>
                  <p className="text-white/85 text-sm sm:text-base leading-6 mt-1">{modalItem.description}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="min-h-0 flex-1">
              <div className="grid h-full gap-0 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="p-4 sm:p-5 lg:p-6">
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400 dark:text-gray-500">
                      {text.why}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-200">
                      {modalItem.extendedInfo.intro}
                    </p>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
                      <span
                        className="w-1.5 h-5 rounded-full"
                        style={{ backgroundColor: modalItem.color }}
                      />
                      {text.benefits}
                    </h4>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {modalItem.extendedInfo.benefits.map((benefit, index) => (
                        <div
                          key={benefit}
                          className="flex items-start gap-2.5 rounded-lg border border-gray-100 bg-white p-3 text-gray-600 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                          style={{
                            animation: `fadeSlideIn 0.3s ease-out ${0.1 + index * 0.05}s both`,
                          }}
                        >
                          <CheckCircle
                            className="w-5 h-5 flex-shrink-0 mt-0.5"
                            style={{ color: modalItem.color }}
                          />
                          <span className="text-sm leading-5">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <aside className="border-t border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/70 lg:border-l lg:border-t-0 sm:p-5 lg:p-6">
                  <div
                    className="rounded-lg border bg-white p-4 dark:bg-gray-800"
                    style={{
                      borderColor: `${modalItem.color}33`,
                    }}
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {text.subsidies}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-5">
                      {modalItem.extendedInfo.subsidies}
                    </p>
                  </div>

                  <div className="mt-3 flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: modalItem.color }}
                    >
                      ROI
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {text.payback}
                      </h4>
                      <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm leading-5">
                        {modalItem.extendedInfo.roi}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                      {text.sources}
                    </h4>
                    <div className="grid gap-2">
                      {modalItem.extendedInfo.sources.map((source) => (
                        <a
                          key={source.url}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-between gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition-all hover:-translate-y-0.5 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        >
                          <span>{source.name}</span>
                          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" style={{ color: modalItem.color }} />
                        </a>
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="border-t border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50 sm:p-5">
              <a
                href="#calculator"
                onClick={closeModal}
                className="flex items-center justify-center gap-2 w-full rounded-lg py-3.5 text-sm font-semibold text-white transition-all hover:scale-[1.01] hover:shadow-lg sm:text-base"
                style={{ backgroundColor: modalItem.color }}
              >
                {text.modalCta} {modalItem.title}
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
