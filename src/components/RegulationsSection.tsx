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
  ExternalLink,
  AlertTriangle,
  Calendar,
  Scale,
  Info,
  Euro
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface RegulationItem {
  id: string;
  icon: React.ElementType;
  question: string;
  summary: string;
  details: {
    applicable: string;
    requirements: string[];
    deadline?: string;
    penalties?: string;
    exemptions?: string[];
    links: { label: string; url: string }[];
  };
  color: string;
}

const regulations: RegulationItem[] = [
  {
    id: 'energiebesparingsplicht',
    icon: Building2,
    question: 'Val ik onder de energiebesparingsplicht?',
    summary: 'Bedrijven en instellingen met een energieverbruik boven de drempelwaarden zijn verplicht alle erkende energiebesparende maatregelen te nemen die zich binnen 5 jaar terugverdienen.',
    details: {
      applicable: 'U valt onder de energiebesparingsplicht als uw organisatie voldoet aan minimaal één van deze criteria:',
      requirements: [
        'Jaarlijks elektriciteitsverbruik van 50.000 kWh of meer',
        'Jaarlijks aardgasverbruik van 25.000 m³ of meer',
        'U bent eigenaar of drijver van een inrichting type A of B onder het Activiteitenbesluit'
      ],
      deadline: 'Doorlopende verplichting - maatregelen moeten binnen redelijke termijn worden uitgevoerd',
      penalties: 'Het bevoegd gezag (vaak de omgevingsdienst) kan handhavend optreden via een last onder dwangsom of bestuursdwang.',
      exemptions: [
        'Glastuinbouwbedrijven met deelname aan CO2-vereveningssysteem',
        'Deelnemers aan het convenant Meerjarenafspraken energie-efficiëntie (MJA3/MEE)',
        'Organisaties met een CO2-heffing industrie',
        'ETS-bedrijven voor het deel dat onder het ETS valt'
      ],
      links: [
        { label: 'RVO - Energiebesparingsplicht', url: 'https://www.rvo.nl/onderwerpen/energiebesparingsplicht' },
        { label: 'Wettekst Activiteitenbesluit', url: 'https://wetten.overheid.nl/BWBR0022762/' }
      ]
    },
    color: '#3b82f6' // blue
  },
  {
    id: 'informatieplicht',
    icon: FileText,
    question: 'Moet ik rapporteren via de informatieplicht?',
    summary: 'Bedrijven onder de energiebesparingsplicht moeten elke 4 jaar rapporteren welke energiebesparende maatregelen zij hebben genomen via het eLoket van RVO.',
    details: {
      applicable: 'De informatieplicht geldt voor alle organisaties die onder de energiebesparingsplicht vallen. U rapporteert over:',
      requirements: [
        'Welke erkende maatregelen (EML) u heeft uitgevoerd',
        'Welke maatregelen niet van toepassing zijn en waarom',
        'Eventuele alternatieve maatregelen met gelijkwaardig resultaat',
        'Bij meerdere vestigingen: rapportage per vestiging of gebundeld'
      ],
      deadline: 'Uiterlijk 1 december 2023 voor de eerste rapportage, daarna elke 4 jaar (volgende deadline: 1 december 2027)',
      penalties: 'Bij niet-rapporteren kan de omgevingsdienst handhavend optreden. Rapportages worden steekproefsgewijs gecontroleerd.',
      links: [
        { label: 'RVO eLoket - Informatieplicht', url: 'https://mijn.rvo.nl/informatieplicht-energiebesparing' },
        { label: 'RVO - Uitleg informatieplicht', url: 'https://www.rvo.nl/onderwerpen/informatieplicht-energiebesparing' }
      ]
    },
    color: '#10b981' // emerald
  },
  {
    id: 'eml',
    icon: CheckSquare,
    question: 'Welke maatregelen moet ik minimaal uitvoeren (EML)?',
    summary: 'De Erkende Maatregelenlijsten (EML) bevatten standaard energiebesparende maatregelen per bedrijfstak. Maatregelen met een terugverdientijd van 5 jaar of minder zijn verplicht.',
    details: {
      applicable: 'Er zijn 19 verschillende EML\'s voor specifieke bedrijfstakken. Uw branche bepaalt welke lijst van toepassing is:',
      requirements: [
        'Kantoren en zakelijke dienstverlening',
        'Gezondheidszorg en welzijn',
        'Onderwijs',
        'Sport en recreatie',
        'Horeca en verblijfsrecreatie',
        'Detailhandel en groothandel',
        'Industrie (diverse sectoren)',
        'Agrarische sector'
      ],
      exemptions: [
        'Maatregelen met een terugverdientijd langer dan 5 jaar',
        'Technisch niet toepasbare maatregelen voor uw situatie',
        'Maatregelen die binnen 3 jaar vervangen worden door andere activiteiten'
      ],
      links: [
        { label: 'RVO - Erkende Maatregelenlijsten', url: 'https://www.rvo.nl/onderwerpen/erkende-maatregelenlijsten' },
        { label: 'RVO - EML per sector', url: 'https://www.rvo.nl/onderwerpen/erkende-maatregelenlijsten/bedrijfstakken' }
      ]
    },
    color: '#059669' // green
  },
  {
    id: 'eed',
    icon: Search,
    question: 'Ben ik EED-auditplichtig (Europese auditplicht)?',
    summary: 'Grote ondernemingen moeten elke 4 jaar een energieaudit laten uitvoeren volgens de Europese Energie-Efficiëntierichtlijn (EED). De audit moet door een gecertificeerd bureau worden uitgevoerd.',
    details: {
      applicable: 'U bent EED-auditplichtig als uw onderneming voldoet aan één van deze criteria:',
      requirements: [
        'Meer dan 250 werknemers (FTE), óf',
        'Jaaromzet hoger dan €50 miljoen én balanstotaal hoger dan €43 miljoen',
        'De audit moet minimaal 90% van het totale energieverbruik dekken',
        'De audit moet voldoen aan de Europese norm EN 16247'
      ],
      deadline: 'Elke 4 jaar een nieuwe audit. Volgende deadline is afhankelijk van uw laatste audit.',
      penalties: 'Boete tot €20.500 bij niet voldoen aan de auditverplichting.',
      exemptions: [
        'Bedrijven met een gecertificeerd ISO 50001 energiemanagementsysteem',
        'Deelnemers aan MJA3 of MEE-convenant (tot 2024)',
        'MKB-bedrijven (onder de genoemde drempelwaarden)'
      ],
      links: [
        { label: 'RVO - EED Energie-audit', url: 'https://www.rvo.nl/onderwerpen/energie-audit-eed' },
        { label: 'EUR-Lex - EED Richtlijn', url: 'https://eur-lex.europa.eu/legal-content/NL/TXT/?uri=CELEX:32012L0027' }
      ]
    },
    color: '#6366f1' // indigo
  },
  {
    id: 'labelc',
    icon: Home,
    question: 'Moet mijn kantoor aan Energielabel C voldoen?',
    summary: 'Sinds 1 januari 2023 moeten kantoorgebouwen groter dan 100 m² minimaal energielabel C hebben. Zonder geldig label mag het pand niet meer als kantoor worden gebruikt.',
    details: {
      applicable: 'De label C-verplichting geldt voor kantoorgebouwen met de volgende kenmerken:',
      requirements: [
        'Kantoorgebouw of kantoorgedeelte groter dan 100 m² gebruiksoppervlakte',
        'De kantoorfunctie beslaat meer dan 50% van het gebouw, óf',
        'Het kantoorgedeelte is groter dan 100 m² én heeft eigen adres/toegang',
        'Energielabel C komt overeen met een Energie-Index van maximaal 1,3'
      ],
      deadline: 'De verplichting is ingegaan op 1 januari 2023. Let op: per 2030 geldt waarschijnlijk label A.',
      penalties: 'Gemeenten zijn bevoegd gezag en kunnen een last onder dwangsom opleggen of sluiting gelasten.',
      exemptions: [
        'Monumenten (Rijks-, provinciaal of gemeentelijk monument)',
        'Gebouwen met religieuze functie',
        'Tijdelijke gebouwen (gebruiksduur < 2 jaar)',
        'Gebouwen die binnen 2 jaar gesloopt, onteigend of getransformeerd worden'
      ],
      links: [
        { label: 'RVO - Label C kantoren', url: 'https://www.rvo.nl/onderwerpen/label-c-kantoren' },
        { label: 'Rijksoverheid - Energielabel C', url: 'https://www.rijksoverheid.nl/onderwerpen/energielabel-woningen-en-gebouwen/label-c-plicht-voor-kantoren' }
      ]
    },
    color: '#f59e0b' // amber
  },
  {
    id: 'epbd',
    icon: Thermometer,
    question: 'Moeten mijn installaties periodiek gekeurd worden (EPBD)?',
    summary: 'Verwarmings- en airconditioningsystemen boven bepaalde vermogens moeten periodiek worden gekeurd door een gecertificeerd inspecteur volgens de EPBD-richtlijn.',
    details: {
      applicable: 'De keuringsplicht geldt voor de volgende installaties in utiliteitsgebouwen:',
      requirements: [
        'Verwarmingssystemen met vermogen > 70 kW: keuring elke 4 jaar',
        'Airconditioningsystemen met vermogen > 70 kW: keuring elke 5 jaar',
        'Gecombineerde systemen (verwarming + ventilatie): keuring elke 4 jaar',
        'De keuring moet worden uitgevoerd door een BRL 9500-gecertificeerd bedrijf'
      ],
      deadline: 'De eerste keuring moet plaatsvinden binnen de gestelde termijn na installatie of laatste keuring.',
      penalties: 'Het bevoegd gezag kan een bestuurlijke boete opleggen bij het ontbreken van een geldige keuring.',
      exemptions: [
        'Systemen met vermogen onder de drempelwaarden',
        'Installaties met een gebouwautomatiserings- en controlesysteem (GACS)',
        'Residentiële gebouwen vallen onder een apart regime'
      ],
      links: [
        { label: 'RVO - Keuring verwarmingssystemen', url: 'https://www.rvo.nl/onderwerpen/keuring-verwarmingssystemen' },
        { label: 'RVO - Keuring aircosystemen', url: 'https://www.rvo.nl/onderwerpen/keuring-aircosystemen' }
      ]
    },
    color: '#ef4444' // red
  },
  {
    id: 'fgassen',
    icon: Wind,
    question: 'Wat zijn mijn F-gassen verplichtingen (airco/koeling/warmtepomp)?',
    summary: 'Eigenaren van koelinstallaties, airconditioners en warmtepompen met gefluoreerde broeikasgassen (F-gassen) moeten lekcontroles uitvoeren en een logboek bijhouden.',
    details: {
      applicable: 'De F-gassenverordening (EU 517/2014) is van toepassing op installaties die F-gassen bevatten:',
      requirements: [
        'Installaties ≥5 ton CO2-equivalent: jaarlijkse lekcontrole',
        'Installaties ≥50 ton CO2-equivalent: halfjaarlijkse lekcontrole',
        'Installaties ≥500 ton CO2-equivalent: driemaandelijkse lekcontrole + lekdetectiesysteem',
        'Logboek bijhouden van alle controles, lekken en onderhoud',
        'Werkzaamheden uitsluitend door F-gassen gecertificeerde technici'
      ],
      deadline: 'Lekcontroles moeten binnen de voorgeschreven termijnen worden uitgevoerd.',
      penalties: 'Boetes tot €10.000 voor particulieren en tot €50.000 voor bedrijven bij overtreding.',
      exemptions: [
        'Hermetisch gesloten systemen < 10 ton CO2-equivalent (met label)',
        'Systemen met natuurlijke koudemiddelen (CO2, ammoniak, propaan)'
      ],
      links: [
        { label: 'RVO - F-gassen', url: 'https://www.rvo.nl/onderwerpen/f-gassen' },
        { label: 'STEK - F-gassenregeling', url: 'https://www.sfrk.nl/f-gassenverordening/' },
        { label: 'EUR-Lex - F-gassen verordening', url: 'https://eur-lex.europa.eu/legal-content/NL/TXT/?uri=CELEX:32014R0517' }
      ]
    },
    color: '#06b6d4' // cyan
  },
  {
    id: 'rapportages',
    icon: ClipboardList,
    question: 'Waar en hoe dien ik mijn rapportages in?',
    summary: 'De meeste energiegerelateerde rapportages dient u in via het eLoket van RVO. Sommige verplichtingen lopen via uw gemeente of omgevingsdienst.',
    details: {
      applicable: 'Overzicht van de verschillende rapportageverplichtingen en waar u deze indient:',
      requirements: [
        'Informatieplicht energiebesparing → RVO eLoket (mijn.rvo.nl)',
        'EED-audit rapportage → RVO eLoket',
        'Energielabel aanvragen → EP-Online (via gecertificeerd adviseur)',
        'EPBD-keuringsrapporten → Bewaren in eigen administratie',
        'F-gassen logboek → Bewaren in eigen administratie (min. 5 jaar)',
        'Milieuvergunning/melding → Omgevingsloket (DSO) of gemeente'
      ],
      links: [
        { label: 'RVO eLoket', url: 'https://mijn.rvo.nl/' },
        { label: 'EP-Online (energielabels)', url: 'https://www.ep-online.nl/' },
        { label: 'Omgevingsloket', url: 'https://omgevingswet.overheid.nl/' },
        { label: 'MKB Routekaart', url: 'https://www.mkbroutekaart.nl/' }
      ]
    },
    color: '#8b5cf6' // violet
  }
];

export function RegulationsSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { isDark } = useTheme();

  return (
    <section
      id="regelgeving"
      className="py-24 relative overflow-hidden transition-colors duration-300"
      style={{
        background: isDark
          ? 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)',
      }}
    >
      {/* Subtle decorative elements */}
      <div
        className="absolute top-20 left-0 w-96 h-96 rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute bottom-20 right-0 w-80 h-80 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
            <Scale className="w-4 h-4" />
            Wettelijke verplichtingen
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Wet- en regelgeving
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 max-w-2xl mx-auto">
            Overzicht van de belangrijkste energiegerelateerde verplichtingen voor MKB-bedrijven in Nederland
          </p>
        </div>

        {/* Important notice */}
        <div className="mb-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 text-sm font-medium">Let op: controleer altijd uw specifieke situatie</p>
            <p className="text-amber-700 text-sm mt-1">
              Dit overzicht is informatief. De exacte verplichtingen hangen af van uw bedrijfsgrootte, sector en energieverbruik.
              Raadpleeg de officiële bronnen of een adviseur voor uw specifieke situatie.
            </p>
          </div>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {regulations.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden transition-all duration-300 ${
                  isExpanded
                    ? 'shadow-lg ring-2'
                    : 'shadow-md hover:shadow-lg'
                }`}
                style={{
                  ringColor: isExpanded ? `${item.color}40` : 'transparent'
                }}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full p-5 flex items-center gap-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300"
                    style={{
                      backgroundColor: `${item.color}15`,
                      transform: isExpanded ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className="block font-semibold text-gray-900 dark:text-white">
                      {item.question}
                    </span>
                    <span className="block text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">
                      {item.summary}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-300 flex-shrink-0 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-5 pb-6 border-t border-gray-100 dark:border-gray-700">
                    {/* Full summary */}
                    <div className="pt-4 pb-4">
                      <p className="text-gray-700 dark:text-gray-300 dark:text-gray-300 leading-relaxed">
                        {item.summary}
                      </p>
                    </div>

                    {/* Applicable to */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" style={{ color: item.color }} />
                        Wanneer van toepassing
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm mb-2">{item.details.applicable}</p>
                      <ul className="space-y-1.5">
                        {item.details.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                            <span
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2"
                              style={{ backgroundColor: item.color }}
                            />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Deadline if present */}
                    {item.details.deadline && (
                      <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300">Deadline:</span>
                          <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">{item.details.deadline}</span>
                        </div>
                      </div>
                    )}

                    {/* Exemptions if present */}
                    {item.details.exemptions && item.details.exemptions.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Uitzonderingen</h4>
                        <ul className="space-y-1">
                          {item.details.exemptions.map((ex, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                              <span className="text-gray-400 dark:text-gray-500">•</span>
                              {ex}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Penalties if present */}
                    {item.details.penalties && (
                      <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800">
                        <div className="flex items-start gap-2 text-sm">
                          <Euro className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium text-red-700">Bij niet-naleving: </span>
                            <span className="text-red-600">{item.details.penalties}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Links */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">Officiële bronnen</h4>
                      <div className="flex flex-wrap gap-2">
                        {item.details.links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm transition-colors"
                          >
                            {link.label}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary table */}
        <div className="mt-10 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-600" />
            Snelle check: welke verplichtingen gelden voor u?
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Verplichting</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Drempelwaarde</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Frequentie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-2 text-gray-900 dark:text-white">Energiebesparingsplicht</td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">&ge;50.000 kWh of &ge;25.000 m³</td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">Doorlopend</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-2 text-gray-900 dark:text-white">Informatieplicht</td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">Idem energiebesparingsplicht</td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">Elke 4 jaar</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-2 text-gray-900 dark:text-white">EED-audit</td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">&gt;250 FTE of &gt;€50M omzet</td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">Elke 4 jaar</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-2 text-gray-900 dark:text-white">Energielabel C kantoren</td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">Kantoor &gt;100 m²</td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">Sinds 1-1-2023</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-2 text-gray-900 dark:text-white">EPBD-keuring</td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">CV/airco &gt;70 kW</td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">4-5 jaar</td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-2 text-gray-900 dark:text-white">F-gassen lekcontrole</td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">&ge;5 ton CO2-eq</td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">1-4x per jaar</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Box */}
        <div className="mt-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-8 text-center shadow-xl">
          <h3 className="text-xl font-bold text-white mb-2">
            Niet zeker of u aan alle verplichtingen voldoet?
          </h3>
          <p className="text-emerald-100 mb-6 max-w-lg mx-auto">
            Onze specialisten helpen u graag met een compliance-check en een plan van aanpak voor uw organisatie.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://www.rvo.nl/onderwerpen/energiebesparing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl transition-all border border-white/30"
            >
              RVO Energiebesparing
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 dark:hover:bg-gray-700 text-emerald-700 font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              Bereken uw besparing
            </button>
          </div>
        </div>

        {/* Last updated note */}
        <p className="mt-6 text-center text-gray-400 dark:text-gray-500 text-xs">
          Laatste update: januari 2025. Informatie is met zorg samengesteld maar kan inmiddels gewijzigd zijn.
        </p>
      </div>
    </section>
  );
}
