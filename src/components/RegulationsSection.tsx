import { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckSquare,
  ChevronDown,
  ClipboardList,
  Euro,
  ExternalLink,
  FileText,
  Home,
  Info,
  Scale,
  Search,
  Thermometer,
  Wind,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

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
    summary:
      'Bedrijven en instellingen boven de energiedrempels moeten energiebesparende maatregelen nemen die zich binnen 5 jaar terugverdienen.',
    details: {
      applicable: 'Dit speelt meestal bij organisaties met een hoger jaarlijks energieverbruik per locatie.',
      requirements: [
        'Vanaf 50.000 kWh elektriciteit per jaar per locatie',
        'Of vanaf 25.000 m3 aardgas(equivalent) per jaar per locatie',
        'De beoordeling kan afhangen van gebouw, activiteit, huur/eigendom en bevoegd gezag',
      ],
      deadline: 'Doorlopende verplichting. Controleer bij RVO en bevoegd gezag welke rapportageronde voor u geldt.',
      penalties: 'Het bevoegd gezag kan handhavend optreden, bijvoorbeeld via een last onder dwangsom.',
      links: [
        { label: 'RVO: energiebesparingsplicht', url: 'https://www.rvo.nl/onderwerpen/energiebesparingsplicht' },
        { label: 'RVO: informatieplicht', url: 'https://www.rvo.nl/onderwerpen/energiebesparingsplicht/informatieplicht-energiebesparing' },
      ],
      exemptions: ['Sommige sectoren of situaties kennen uitzonderingen of aanvullende regimes. Controleer dit altijd bij de officiele bron.'],
    },
    color: '#006fba',
  },
  {
    id: 'informatieplicht',
    icon: FileText,
    question: 'Moet ik rapporteren via de informatieplicht?',
    summary:
      'Veel organisaties onder de energiebesparingsplicht moeten eens per 4 jaar rapporteren welke maatregelen zij hebben genomen.',
    details: {
      applicable: 'Dit geldt meestal als u ook onder de energiebesparingsplicht valt.',
      requirements: [
        'Rapportage over uitgevoerde erkende maatregelen',
        'Uitleg waarom maatregelen niet van toepassing zijn',
        'Eventuele alternatieve maatregelen met gelijkwaardig resultaat',
      ],
      deadline: 'De informatieplicht is periodiek. Controleer RVO voor actuele termijnen en uitzonderingen.',
      penalties: 'Bij niet of onvolledig rapporteren kan de omgevingsdienst handhavend optreden.',
      links: [
        { label: 'RVO eLoket', url: 'https://mijn.rvo.nl/informatieplicht-energiebesparing' },
        { label: 'RVO: uitleg informatieplicht', url: 'https://www.rvo.nl/onderwerpen/energiebesparingsplicht/informatieplicht-energiebesparing' },
      ],
    },
    color: '#059669',
  },
  {
    id: 'onderzoeksplicht',
    icon: ClipboardList,
    question: 'Geldt voor mijn locatie ook de onderzoeksplicht?',
    summary:
      'Voor zeer energie-intensieve locaties in aangewezen sectoren kan naast de informatieplicht ook een onderzoeksplicht gelden.',
    details: {
      applicable: 'Dit is vooral relevant bij grote verbruikslocaties in specifieke bedrijfstakken.',
      requirements: [
        'Vanaf 10 miljoen kWh elektriciteit per jaar per locatie, of',
        'Vanaf 170.000 m3 aardgas(equivalent) per jaar per locatie',
        'Alleen voor aangewezen bedrijfstakken en activiteiten',
      ],
      deadline: 'Rapportage gebeurt periodiek. Controleer RVO voor de actuele ronde.',
      penalties: 'Het bevoegd gezag kan handhaven als de onderzoeksplicht niet of onvoldoende wordt nageleefd.',
      links: [
        { label: 'RVO: onderzoeksplicht', url: 'https://www.rvo.nl/onderwerpen/energiebesparingsplicht-2023/onderzoeksplicht-energiebesparing-vanaf-2023' },
        { label: 'RVO stappenplan', url: 'https://infographics.rvo.nl/stappenplan/' },
      ],
    },
    color: '#0ea5e9',
  },
  {
    id: 'eml',
    icon: CheckSquare,
    question: 'Welke maatregelen moet ik minimaal uitvoeren (EML)?',
    summary:
      'De Erkende Maatregelenlijsten helpen bepalen welke energiebesparende maatregelen voor uw bedrijfstak voor de hand liggen.',
    details: {
      applicable: 'De juiste lijst hangt af van uw bedrijfstak en situatie.',
      requirements: [
        'Kies de EML die past bij uw branche of activiteit',
        'Controleer of maatregelen technisch en economisch toepasbaar zijn',
        'Onderbouw waarom maatregelen eventueel niet passen',
      ],
      links: [
        { label: 'RVO: erkende maatregelenlijsten', url: 'https://www.rvo.nl/onderwerpen/erkende-maatregelenlijsten' },
        { label: 'RVO: EML per sector', url: 'https://www.rvo.nl/onderwerpen/erkende-maatregelenlijsten/bedrijfstakken' },
      ],
      exemptions: ['Niet iedere maatregel past technisch of economisch in iedere situatie. Onderbouwing blijft belangrijk.'],
    },
    color: '#10b981',
  },
  {
    id: 'eed',
    icon: Search,
    question: 'Ben ik EED-auditplichtig?',
    summary:
      'Grote ondernemingen moeten periodiek een energie-audit uitvoeren en daarover rapporteren bij RVO.',
    details: {
      applicable: 'Dit geldt vooral voor grotere ondernemingen boven Europese drempelwaarden.',
      requirements: [
        '250 fte of meer, of',
        'Jaaromzet hoger dan 50 miljoen euro en balanstotaal hoger dan 43 miljoen euro',
        'De audit moet een representatief beeld geven van energieverbruik en besparingskansen',
      ],
      deadline: 'Elke 4 jaar een nieuwe audit. De exacte deadline hangt af van de laatste rapportage.',
      penalties: 'RVO kan handhavend optreden bij niet-naleving.',
      links: [
        { label: 'RVO: EED-auditplicht', url: 'https://www.rvo.nl/onderwerpen/energiebesparingsplicht/eed-auditplicht' },
        { label: 'RVO: herziene EED-richtlijn', url: 'https://www.rvo.nl/onderwerpen/energiebesparingsplicht/eed-auditplicht/herziene-eed-richtlijn' },
      ],
      exemptions: ['MKB-bedrijven vallen meestal buiten deze auditplicht. Controleer groepsstructuur en verbonden ondernemingen.'],
    },
    color: '#6366f1',
  },
  {
    id: 'labelc',
    icon: Home,
    question: 'Moet mijn kantoor aan energielabel C voldoen?',
    summary:
      'Veel kantoorgebouwen moeten minimaal energielabel C hebben om als kantoor gebruikt te mogen worden.',
    details: {
      applicable: 'Dit speelt bij kantoorgebouwen waar kantoorfunctie en oppervlakte boven de drempels komen.',
      requirements: [
        'Kantoorfunctie en nevenfuncties samen vanaf 100 m2',
        'Kantoorfunctie is meer dan 50% van het gebouw',
        'Geen uitzondering zoals monument, religieuze functie of geplande sloop/transformatie',
      ],
      deadline: 'De verplichting geldt sinds 1 januari 2023. Gemeenten en omgevingsdiensten kunnen handhaven.',
      penalties: 'Een kantoor dat niet voldoet mag mogelijk niet meer als kantoor worden gebruikt.',
      links: [
        { label: 'RVO: label C kantoren', url: 'https://www.rvo.nl/onderwerpen/wetten-en-regels-gebouwen/energielabel-c-kantoren' },
        { label: 'Rijksoverheid: energielabel C', url: 'https://www.rijksoverheid.nl/onderwerpen/energielabel-woningen-en-gebouwen/label-c-plicht-voor-kantoren' },
      ],
    },
    color: '#f59e0b',
  },
  {
    id: 'epbd',
    icon: Thermometer,
    question: 'Moeten installaties periodiek gekeurd worden?',
    summary:
      'Grotere verwarmings- en airconditioningsystemen kunnen onder de EPBD-keuringsplicht vallen.',
    details: {
      applicable: 'Dit is relevant voor utiliteitsgebouwen met grotere technische installaties.',
      requirements: [
        'Verwarmingssystemen vanaf 70 kW',
        'Airconditioningsystemen vanaf 70 kW',
        'Bij grotere systemen kunnen aanvullende gebouwautomatiseringseisen gelden',
      ],
      deadline: 'Keuringen moeten periodiek plaatsvinden volgens de geldende termijnen.',
      penalties: 'Het bevoegd gezag kan optreden bij het ontbreken van een geldige keuring.',
      links: [
        { label: 'RVO: EPBD-keuringen', url: 'https://www.rvo.nl/onderwerpen/wetten-en-regels-gebouwen/epbd-iii/technische-keuringen-verwarmings-en-aircosystemen' },
        { label: 'RVO: GACS', url: 'https://www.rvo.nl/onderwerpen/wetten-en-regels-gebouwen/epbd-iii/systeemeisen-technische-bouwsystemen/gacs' },
      ],
    },
    color: '#ef4444',
  },
  {
    id: 'fgassen',
    icon: Wind,
    question: 'Wat zijn mijn F-gassen verplichtingen?',
    summary:
      'Koelinstallaties, airco-systemen en warmtepompen met F-gassen kunnen lekcontrole, logboekplicht en certificering vragen.',
    details: {
      applicable: 'Dit speelt bij installaties met gefluoreerde broeikasgassen.',
      requirements: [
        'Periodieke lekcontrole vanaf relevante CO2-equivalent drempels',
        'Logboek bijhouden van controles, lekken en onderhoud',
        'Werkzaamheden laten uitvoeren door gecertificeerde partijen',
      ],
      deadline: 'Controle-intervallen hangen af van koudemiddel, hoeveelheid en installatie.',
      penalties: 'Bij overtreding kunnen bestuurlijke boetes volgen.',
      links: [
        { label: 'RVO: F-gassen', url: 'https://www.rvo.nl/onderwerpen/f-gassen' },
        { label: 'NVKL: F-gassenverordening', url: 'https://www.nvkl.nl/wetgeving/f-gassenverordening/' },
        { label: 'EUR-Lex: EU 2024/573', url: 'https://eur-lex.europa.eu/legal-content/NL/TXT/?uri=CELEX:32024R0573' },
      ],
    },
    color: '#06b6d4',
  },
  {
    id: 'rapportages',
    icon: ClipboardList,
    question: 'Waar dien ik rapportages in?',
    summary:
      'Rapportages lopen deels via RVO, deels via bevoegd gezag en deels via eigen administratie.',
    details: {
      applicable: 'Dit verschilt per verplichting en soms per locatie of bevoegd gezag.',
      requirements: [
        'Informatieplicht en onderzoeksplicht meestal via RVO eLoket',
        'EED-auditrapportage via RVO',
        'EPBD-keuringsrapporten en F-gassen logboeken bewaren in eigen administratie',
        'Milieuvergunningen en meldingen via Omgevingsloket of bevoegd gezag',
      ],
      links: [
        { label: 'RVO eLoket', url: 'https://mijn.rvo.nl/' },
        { label: 'EP-Online', url: 'https://www.ep-online.nl/' },
        { label: 'Omgevingsloket', url: 'https://omgevingswet.overheid.nl/' },
      ],
    },
    color: '#8b5cf6',
  },
];

const quickFacts = [
  { label: 'Vrijblijvend', value: 'BespaarCheck verplicht u nergens toe.' },
  { label: 'Afhankelijk van locatie', value: 'Verbruik, gebouw en activiteit bepalen veel.' },
  { label: 'Altijd broncheck', value: 'Controleer RVO en bevoegd gezag bij twijfel.' },
];

const quickRows = [
  ['Energiebesparingsplicht', '>=50.000 kWh of >=25.000 m3', 'Doorlopend'],
  ['Informatieplicht', 'Idem energiebesparingsplicht', 'Elke 4 jaar'],
  ['Onderzoeksplicht', '>=10 mln kWh of >=170.000 m3', 'Elke 4 jaar'],
  ['EED-audit', 'Grote ondernemingen', 'Elke 4 jaar'],
  ['Energielabel C kantoren', 'Kantoor >=100 m2', 'Sinds 1-1-2023'],
  ['EPBD-keuring', 'CV/airco >=70 kW', 'Periodiek'],
  ['F-gassen', 'Afhankelijk van CO2-equivalent', 'Periodiek'],
];

const regulationCopyEn: Record<string, Pick<RegulationItem, 'question' | 'summary'> & { details: Omit<RegulationItem['details'], 'links'> }> = {
  energiebesparingsplicht: {
    question: 'Do I fall under the Dutch energy-saving obligation?',
    summary:
      'Businesses and institutions above the energy thresholds must take energy-saving measures that pay back within 5 years.',
    details: {
      applicable: 'This usually applies to organisations with higher annual energy use per location.',
      requirements: [
        'From 50,000 kWh electricity per year per location',
        'Or from 25,000 m3 natural gas equivalent per year per location',
        'Assessment can depend on building, activity, lease or ownership and competent authority',
      ],
      deadline: 'Ongoing obligation. Check RVO and the competent authority for the reporting round that applies to you.',
      penalties: 'The competent authority can enforce compliance, for example through a penalty order.',
      exemptions: ['Some sectors or situations have exceptions or additional regimes. Always check the official source.'],
    },
  },
  informatieplicht: {
    question: 'Do I need to report under the information obligation?',
    summary:
      'Many organisations under the energy-saving obligation must report every 4 years which measures they have taken.',
    details: {
      applicable: 'This usually applies if you also fall under the energy-saving obligation.',
      requirements: [
        'Report on implemented recognised measures',
        'Explain why measures are not applicable',
        'Include alternative measures with equivalent results where relevant',
      ],
      deadline: 'The information obligation is periodic. Check RVO for current deadlines and exceptions.',
      penalties: 'If reporting is missing or incomplete, the environmental authority can enforce compliance.',
    },
  },
  onderzoeksplicht: {
    question: 'Does the investigation obligation also apply to my location?',
    summary:
      'Very energy-intensive locations in designated sectors may have an investigation obligation in addition to the information obligation.',
    details: {
      applicable: 'This is mainly relevant for large consumption locations in specific business sectors.',
      requirements: [
        'From 10 million kWh electricity per year per location, or',
        'From 170,000 m3 natural gas equivalent per year per location',
        'Only for designated sectors and activities',
      ],
      deadline: 'Reporting is periodic. Check RVO for the current round.',
      penalties: 'The competent authority can enforce compliance if the obligation is not met sufficiently.',
    },
  },
  eml: {
    question: 'Which measures do I need to implement under the EML?',
    summary:
      'The recognised measures lists help determine which energy-saving measures are relevant for your business sector.',
    details: {
      applicable: 'The right list depends on your sector and situation.',
      requirements: [
        'Choose the EML that fits your sector or activity',
        'Check whether measures are technically and economically applicable',
        'Explain why measures may not fit your situation',
      ],
      exemptions: ['Not every measure fits every situation technically or economically. Supporting evidence remains important.'],
    },
  },
  eed: {
    question: 'Am I subject to the EED audit obligation?',
    summary:
      'Large enterprises must periodically carry out an energy audit and report it to RVO.',
    details: {
      applicable: 'This mainly applies to larger enterprises above European thresholds.',
      requirements: [
        '250 FTE or more, or',
        'Annual turnover above 50 million euros and balance sheet total above 43 million euros',
        'The audit must give a representative view of energy use and saving opportunities',
      ],
      deadline: 'A new audit every 4 years. The exact deadline depends on the last report.',
      penalties: 'RVO can enforce compliance in case of non-compliance.',
      exemptions: ['SMEs usually fall outside this audit obligation. Check group structure and affiliated companies.'],
    },
  },
  labelc: {
    question: 'Does my office need to meet energy label C?',
    summary:
      'Many office buildings must have at least energy label C to be used as an office.',
    details: {
      applicable: 'This applies to office buildings where office function and floor area exceed the thresholds.',
      requirements: [
        'Office function and ancillary functions together from 100 m2',
        'Office function is more than 50% of the building',
        'No exception such as monument status, religious function or planned demolition/transformation',
      ],
      deadline: 'The obligation applies since 1 January 2023. Municipalities and environmental authorities can enforce it.',
      penalties: 'An office that does not comply may no longer be allowed to be used as an office.',
    },
  },
  epbd: {
    question: 'Do installations need periodic inspections?',
    summary:
      'Larger heating and air-conditioning systems may fall under EPBD inspection obligations.',
    details: {
      applicable: 'This is relevant for non-residential buildings with larger technical installations.',
      requirements: [
        'Heating systems from 70 kW',
        'Air-conditioning systems from 70 kW',
        'Larger systems may have additional building automation requirements',
      ],
      deadline: 'Inspections must take place periodically according to the applicable terms.',
      penalties: 'The competent authority can act if a valid inspection is missing.',
    },
  },
  fgassen: {
    question: 'What are my F-gas obligations?',
    summary:
      'Cooling systems, air-conditioning systems and heat pumps with F-gases can require leak checks, logs and certification.',
    details: {
      applicable: 'This applies to installations with fluorinated greenhouse gases.',
      requirements: [
        'Periodic leak checks from relevant CO2-equivalent thresholds',
        'Keep a logbook of checks, leaks and maintenance',
        'Have work carried out by certified parties',
      ],
      deadline: 'Inspection intervals depend on refrigerant, quantity and installation.',
      penalties: 'Administrative fines can follow in case of violations.',
    },
  },
  rapportages: {
    question: 'Where do I submit reports?',
    summary:
      'Reports partly run through RVO, partly through the competent authority and partly through your own administration.',
    details: {
      applicable: 'This differs per obligation and sometimes per location or competent authority.',
      requirements: [
        'Information obligation and investigation obligation usually through RVO eLoket',
        'EED audit reporting through RVO',
        'Keep EPBD inspection reports and F-gas logs in your own administration',
        'Environmental permits and notifications through Omgevingsloket or the competent authority',
      ],
    },
  },
};

const quickFactsEn = [
  { label: 'Non-binding', value: 'BespaarCheck does not commit you to anything.' },
  { label: 'Location-dependent', value: 'Consumption, building and activity matter.' },
  { label: 'Always check sources', value: 'Check RVO and the competent authority when in doubt.' },
];

const quickRowsEn = [
  ['Energy-saving obligation', '>=50,000 kWh or >=25,000 m3', 'Ongoing'],
  ['Information obligation', 'Same as energy-saving obligation', 'Every 4 years'],
  ['Investigation obligation', '>=10 mln kWh or >=170,000 m3', 'Every 4 years'],
  ['EED audit', 'Large enterprises', 'Every 4 years'],
  ['Energy label C offices', 'Office >=100 m2', 'Since 1 Jan 2023'],
  ['EPBD inspection', 'Heating/airco >=70 kW', 'Periodic'],
  ['F-gases', 'Depends on CO2 equivalent', 'Periodic'],
];

export function RegulationsSection() {
  const { isEnglish } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>('energiebesparingsplicht');
  const items = isEnglish
    ? regulations.map((item) => ({
        ...item,
        question: regulationCopyEn[item.id].question,
        summary: regulationCopyEn[item.id].summary,
        details: {
          ...item.details,
          ...regulationCopyEn[item.id].details,
        },
      }))
    : regulations;
  const facts = isEnglish ? quickFactsEn : quickFacts;
  const rows = isEnglish ? quickRowsEn : quickRows;
  const text = isEnglish
    ? {
        chip: 'Rules and regulations',
        title: 'Quickly see which obligations may need attention.',
        intro:
          'A practical overview of energy-related obligations. Informative, not legally binding, and always completely non-binding.',
        warningTitle: 'Always check your specific situation',
        warning:
          'Obligations depend on location, lease or ownership, sector, installations and energy use. Consult official sources or the competent authority when in doubt.',
        applies: 'When applicable',
        deadline: 'Deadline',
        penalties: 'In case of non-compliance',
        exceptions: 'Exceptions',
        sources: 'Official sources',
        quickTitle: 'Quick check: which obligations apply to you?',
        table: ['Obligation', 'Threshold', 'Frequency'],
        ctaTitle: 'Not sure whether you meet all obligations?',
        ctaText:
          'Start with the non-binding BespaarCheck. You receive an indication of opportunities and attention points, without being committed to anything.',
        rvo: 'RVO energy saving',
        check: 'Start the non-binding check',
        disclaimer:
          'This information has been compiled with care, but legislation and implementation can change. Always check the current official sources.',
      }
    : {
        chip: 'Wet- en regelgeving',
        title: 'Snel zien welke verplichtingen aandacht vragen.',
        intro:
          'Een praktisch overzicht van energiegerelateerde verplichtingen. Informatief, niet juridisch bindend, en altijd volledig vrijblijvend.',
        warningTitle: 'Controleer altijd uw specifieke situatie',
        warning:
          'Verplichtingen hangen af van locatie, eigendom/huur, sector, installaties en energieverbruik. Raadpleeg officiele bronnen of bevoegd gezag bij twijfel.',
        applies: 'Wanneer van toepassing',
        deadline: 'Deadline',
        penalties: 'Bij niet-naleving',
        exceptions: 'Uitzonderingen',
        sources: 'Officiele bronnen',
        quickTitle: 'Snelle check: welke verplichtingen gelden voor u?',
        table: ['Verplichting', 'Drempelwaarde', 'Frequentie'],
        ctaTitle: 'Niet zeker of u aan alle verplichtingen voldoet?',
        ctaText:
          'Doe eerst vrijblijvend de BespaarCheck. U krijgt een indicatie van kansen en aandachtspunten, zonder dat u ergens aan vast zit.',
        rvo: 'RVO Energiebesparing',
        check: 'Doe vrijblijvend de check',
        disclaimer:
          'Informatie is met zorg samengesteld, maar wetgeving en uitvoering kunnen wijzigen. Controleer altijd de actuele officiele bronnen.',
      };

  return (
    <section id="regelgeving" className="material-section scroll-mt-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.72fr] lg:items-end mb-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-sky-900/30 px-4 py-2 text-sm font-semibold text-[#006fba] dark:text-sky-300">
              <Scale className="w-4 h-4" />
              {text.chip}
            </div>
            <h2 className="material-title mt-5 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              {text.title}
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-600 dark:text-gray-300">
              {text.intro}
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 dark:border-amber-800/70 dark:bg-amber-950/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-300" />
              <div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  {text.warningTitle}
                </p>
                <p className="mt-2 text-sm leading-6 text-amber-800 dark:text-amber-200">
                  {text.warning}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 mb-8">
          {facts.map((fact) => (
            <div key={fact.label} className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
                {fact.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{fact.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3">
          {items.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className={`overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-300 dark:bg-slate-900 ${
                  isExpanded
                    ? 'border-transparent ring-2 shadow-md dark:ring-offset-slate-950'
                    : 'border-gray-100 dark:border-slate-800'
                }`}
                style={{ '--tw-ring-color': isExpanded ? `${item.color}40` : 'transparent' } as React.CSSProperties}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full p-4 sm:p-5 flex items-start gap-4 text-left hover:bg-gray-50 dark:hover:bg-slate-800/70 transition-colors"
                  aria-expanded={isExpanded}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300"
                    style={{
                      backgroundColor: `${item.color}15`,
                      transform: isExpanded ? 'scale(1.05)' : 'scale(1)',
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <span className="block text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      {item.question}
                    </span>
                    <span className="block text-sm leading-6 text-gray-500 dark:text-gray-400 mt-1 line-clamp-3 sm:line-clamp-none">
                      {item.summary}
                    </span>
                  </div>
                  <ChevronDown
                    className={`mt-3 w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-300 flex-shrink-0 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-500 ease-in-out ${
                    isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="mx-4 sm:mx-5 pb-5 border-t border-gray-100 dark:border-slate-800">
                      <div className="pt-5 grid gap-5 lg:grid-cols-[1fr_0.78fr]">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Info className="w-4 h-4" style={{ color: item.color }} />
                            {text.applies}
                          </h4>
                          <p className="text-sm leading-6 text-gray-600 dark:text-gray-300 mb-3">
                            {item.details.applicable}
                          </p>
                          <ul className="space-y-2">
                            {item.details.requirements.map((req) => (
                              <li key={req} className="flex items-start gap-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                <span
                                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2.5"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-3">
                          {item.details.deadline && (
                            <div className="rounded-lg bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 p-4">
                              <div className="flex items-start gap-2 text-sm leading-6">
                                <Calendar className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                                <div>
                                  <span className="block font-semibold text-gray-800 dark:text-gray-200">{text.deadline}</span>
                                  <span className="text-gray-600 dark:text-gray-300">{item.details.deadline}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {item.details.penalties && (
                            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/60 p-4">
                              <div className="flex items-start gap-2 text-sm leading-6">
                                <Euro className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                                <div>
                                  <span className="block font-semibold text-red-800 dark:text-red-200">{text.penalties}</span>
                                  <span className="text-red-700 dark:text-red-200">{item.details.penalties}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {item.details.exemptions && item.details.exemptions.length > 0 && (
                        <div className="mt-5 rounded-lg bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">{text.exceptions}</h4>
                          <ul className="grid gap-2 sm:grid-cols-2">
                            {item.details.exemptions.map((ex) => (
                              <li key={ex} className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                                {ex}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mt-5">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">{text.sources}</h4>
                        <div className="flex flex-wrap gap-2">
                          {item.details.links.map((link) => (
                            <a
                              key={link.url}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
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
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-lg border border-gray-100 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-600" />
            {text.quickTitle}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">{text.table[0]}</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">{text.table[1]}</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">{text.table[2]}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {rows.map(([name, threshold, frequency]) => (
                  <tr key={name} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                    <td className="py-3 px-2 text-gray-900 dark:text-white">{name}</td>
                    <td className="py-3 px-2 text-gray-600 dark:text-gray-400">{threshold}</td>
                    <td className="py-3 px-2 text-gray-600 dark:text-gray-400">{frequency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 p-7 sm:p-8 text-center shadow-xl shadow-emerald-950/10">
          <h3 className="text-xl font-bold text-white mb-2">
            {text.ctaTitle}
          </h3>
          <p className="text-emerald-100 mb-6 max-w-lg mx-auto">
            {text.ctaText}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://www.rvo.nl/onderwerpen/energiebesparing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-all border border-white/30"
            >
              {text.rvo}
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-emerald-700 font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
            >
              {text.check}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-gray-400 dark:text-gray-500 text-xs">
          {text.disclaimer}
        </p>
      </div>
    </section>
  );
}
