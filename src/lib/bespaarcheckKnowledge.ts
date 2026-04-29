export type KnowledgeItem = {
  id: string;
  title: string;
  summary: string;
  keywords: string[];
  bullets: string[];
  anchor?: string;
};

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatLanguage = 'nl' | 'en';

const BESPAAIRCHECK_SYSTEM_PROMPT_NL = `
Je bent Check, de digitale energieadviseur van BespaarCheck.
Je praat vriendelijk, helder en zakelijk met Nederlandse MKB-bezoekers.
Je bent getraind op de inhoud van de BespaarCheck-website: besparingsmaatregelen,
calculator, wet- en regelgeving, FAQ en contactinformatie.

Gedragsregels:
- Antwoord in het Nederlands.
- Houd antwoorden compact, concreet en behulpzaam.
- Klink competent, warm en rustig. Neem bezoekers mee in mogelijkheden zonder overdreven enthousiasme.
- Gebruik af en toe een lichte positieve formulering, zoals "Dat is een mooie ingang" of "Daar zit vaak veel potentieel", maar vermijd hype, verkooppraat en cheesy taal.
- Noem bedragen, verplichtingen en besparingen altijd als indicatie, tenzij de bezoeker exacte gegevens geeft.
- Benadruk waar relevant dat BespaarCheck gratis en geheel vrijblijvend is: de bezoeker zit nergens aan vast.
- Geef geen juridisch advies. Verwijs bij wetgeving naar officiële RVO-bronnen of een adviseur.
- Vraag maximaal 1 gerichte vervolgvraag als je meer informatie nodig hebt. Goede vragen gaan over bedrijfstype, jaarverbruik, gebouwgrootte, bestaande installaties, dakruimte, energiecontract of prioriteit.
- Stuur bezoekers naar de calculator wanneer een berekening of concreet advies nodig is.
- Werk na 2 tot 4 nuttige vragen rustig toe naar een lichte conversie als er duidelijke interesse of besparingspotentieel is.
- Vraag dan vriendelijk of een collega vrijblijvend mag meekijken en nodig de bezoeker uit om een e-mailadres of telefoonnummer te delen.
- Neem twijfel weg: zeg expliciet dat er niets automatisch gebeurt, dat het geen overeenkomst is, dat BespaarCheck eerst meedenkt en dat de bezoeker nergens aan vast zit.
- Houd conversievragen subtiel en behulpzaam. Niet pushen, geen schaarste, geen agressieve sales.
- Gebruik geen em dash of en dash in antwoorden. Gebruik liever een punt, komma, dubbele punt of korte zin.
- Gebruik Nederlandse sentence case voor kopjes en formuleringen. Dus niet ieder woord met een hoofdletter, behalve eigennamen, afkortingen en BespaarCheck.
- Gebruik geen opsommingen met streepjes als dat niet nodig is.
`.trim();

const BESPAAIRCHECK_SYSTEM_PROMPT_EN = `
You are Check, BespaarCheck's digital energy advisor.
You speak clearly, calmly and professionally with SME visitors.
You are trained on the content of the BespaarCheck website: saving measures,
calculator, laws and regulations, FAQ and contact information.

Behaviour rules:
1. Answer in English.
2. Keep answers compact, concrete and helpful.
3. Sound competent, warm and calm. Guide visitors into the possibilities without hype or pushy sales language.
4. Use light positive phrasing when it fits, for example "That is a useful starting point" or "There is often real potential there", but avoid cheesy language.
5. Treat amounts, obligations and savings as indicative unless the visitor gives exact data.
6. Where relevant, stress that BespaarCheck is free and completely non-binding: the visitor is not committed to anything.
7. Do not give legal advice. For regulation, refer to official RVO sources or an advisor.
8. Ask at most one focused follow-up question when you need more information. Good questions are about business type, annual consumption, building size, existing installations, roof space, energy contract or priority.
9. Send visitors to the calculator when a calculation or concrete indication is needed.
10. After 2 to 4 useful questions, gently work towards a light conversion when there is clear interest or saving potential.
11. Ask whether a colleague may take a non-binding look and invite the visitor to share an email address or phone number.
12. Reduce hesitation: explicitly say that nothing happens automatically, it is not an agreement, BespaarCheck first thinks along and the visitor is not committed to anything.
13. Keep conversion questions subtle and helpful. No pressure, scarcity or aggressive sales.
14. Do not use em dashes or en dashes. Use a period, comma, colon or short sentence instead.
15. Use normal sentence case. Do not capitalize every word in headings.
16. Avoid bullet lists with dashes when they are not needed.
`.trim();

export const BESPAAIRCHECK_SYSTEM_PROMPT = BESPAAIRCHECK_SYSTEM_PROMPT_NL;

export function getBespaarcheckSystemPrompt(language: ChatLanguage = 'nl') {
  return language === 'en' ? BESPAAIRCHECK_SYSTEM_PROMPT_EN : BESPAAIRCHECK_SYSTEM_PROMPT_NL;
}

export const kennisbank: KnowledgeItem[] = [
  {
    id: 'intro',
    title: 'Wat is BespaarCheck?',
    summary:
      'BespaarCheck helpt MKB-bedrijven met inzicht in energiekosten, besparingskansen en relevante verduurzamingsmaatregelen.',
    keywords: ['bespaarcheck', 'wat is', 'bedrijf', 'mkb', 'energieadvies', 'advies', 'gratis', 'vrijblijvend'],
    bullets: [
      'De online check geeft direct een indicatie van energiekosten, besparingen en CO2-reductie.',
      'Het eerste inzicht en adviesgesprek zijn gratis en geheel vrijblijvend.',
      'Bezoekers zitten nergens aan vast en bepalen zelf of zij vervolgstappen zetten.',
    ],
    anchor: '#calculator',
  },
  {
    id: 'calculator',
    title: 'Bespaarcalculator',
    summary:
      'De calculator gebruikt bedrijfstype, gebouwgrootte, energieverbruik, bestaande installaties, contracttype en prioriteiten.',
    keywords: ['calculator', 'berekening', 'besparing', 'rapport', 'verbruik', 'energiekosten', 'bespaarcheck doen'],
    bullets: [
      'De uitkomst is een indicatie, geen bindende offerte.',
      'De calculator rekent met actuele of fallback zakelijke energietarieven.',
      'Het resultaat toont huidige kosten, verwachte besparing, CO2-reductie, investering en terugverdientijd.',
      'Na de berekening vult de bezoeker contactgegevens in, accepteert de privacyverklaring en ontvangt het indicatieve rapport per e-mail.',
    ],
    anchor: '#calculator',
  },
  {
    id: 'vrijblijvend',
    title: 'Gratis en vrijblijvend',
    summary:
      'Alles via BespaarCheck is laagdrempelig: de check, de indicatie en het eerste gesprek zijn vrijblijvend.',
    keywords: ['vrijblijvend', 'vast', 'kosten', 'gratis', 'offerte', 'aanvraag', 'contract'],
    bullets: [
      'De bezoeker zit nergens aan vast.',
      'Een aanvraag leidt niet automatisch tot een overeenkomst.',
      'BespaarCheck geeft eerst inzicht; de bezoeker kiest zelf of vervolgstappen gewenst zijn.',
    ],
    anchor: '#calculator',
  },
  {
    id: 'led',
    title: 'LED-verlichting',
    summary:
      'LED-verlichting is vaak een snelle maatregel met relatief korte terugverdientijd, vooral bij winkels, kantoren en magazijnen.',
    keywords: ['led', 'verlichting', 'lampen', 'tl', 'licht', 'terugverdientijd'],
    bullets: [
      'Kan het elektriciteitsverbruik voor verlichting aanzienlijk verlagen.',
      'De calculator sluit LED automatisch uit als de bezoeker dit al heeft aangegeven.',
      'Investering en besparing hangen af van gebouwgrootte, branduren en huidige armaturen.',
    ],
    anchor: '#savings',
  },
  {
    id: 'solar',
    title: 'Zonnepanelen',
    summary:
      'Zonnepanelen kunnen interessant zijn bij geschikt dakoppervlak en voldoende eigen elektriciteitsverbruik.',
    keywords: ['zonnepanelen', 'zon', 'pv', 'dak', 'teruglevering', 'opwek', 'eigen verbruik'],
    bullets: [
      'De calculator houdt rekening met eigen verbruik en teruglevering.',
      'Bestaande zonnepanelen kunnen worden ingevoerd, inclusief jaarlijkse teruglevering.',
      'Rendement hangt af van dakoriëntatie, dakoppervlak, netaansluiting en contractvoorwaarden.',
    ],
    anchor: '#savings',
  },
  {
    id: 'heatpump',
    title: 'Warmtepomp',
    summary:
      'Een warmtepomp kan gasverbruik verlagen, maar vraagt een goede match met gebouw, afgiftesysteem en isolatieniveau.',
    keywords: ['warmtepomp', 'verwarming', 'gas', 'koeling', 'cv', 'aardgas'],
    bullets: [
      'De calculator rekent alleen met warmtepompopties als het gasverbruik en gebouwprofiel logisch zijn.',
      'Een warmtepomp verhoogt meestal het elektriciteitsverbruik, maar verlaagt het gasverbruik.',
      'Voor grotere of slecht geïsoleerde panden is maatwerk nodig.',
    ],
    anchor: '#savings',
  },
  {
    id: 'ems',
    title: 'Energiemanagement en slimme sturing',
    summary:
      'Energiemanagementsystemen en slimme klimaatregeling geven inzicht en kunnen verbruik, pieken en verspilling verminderen.',
    keywords: ['ems', 'energie management', 'energiemanagement', 'slimme thermostaat', 'sturing', 'monitoring', 'klimaatregeling'],
    bullets: [
      'EMS is vooral interessant bij hogere energiekosten of meerdere installaties.',
      'Slimme klimaatregeling kan helpen bij onnodig verwarmen of koelen.',
      'De beste opbrengst ontstaat vaak door maatregelen te combineren.',
    ],
    anchor: '#savings',
  },
  {
    id: 'contract',
    title: 'Energiecontracten',
    summary:
      'Contractoptimalisatie kan zonder technische investering besparing opleveren, afhankelijk van profiel en contractvoorwaarden.',
    keywords: ['contract', 'energiecontract', 'leverancier', 'tarief', 'dynamisch', 'vast', 'variabel', 'prijs'],
    bullets: [
      'De calculator neemt contracttype mee als onderdeel van de besparingsindicatie.',
      'Dynamische contracten zijn vooral interessant als verbruik flexibel gestuurd kan worden.',
      'Voor zakelijke contracten tellen ook voorwaarden, looptijd en aansluitprofiel mee.',
    ],
    anchor: '#calculator',
  },
  {
    id: 'energiebesparingsplicht',
    title: 'Energiebesparingsplicht',
    summary:
      'Bedrijven en instellingen kunnen onder de energiebesparingsplicht vallen vanaf 50.000 kWh elektriciteit of 25.000 m3 aardgas(equivalent) per locatie.',
    keywords: ['energiebesparingsplicht', '50.000', '25000', '25.000', 'aardgas', 'kwh', 'eml', 'wetgeving'],
    bullets: [
      'De verplichting gaat over maatregelen die zich binnen 5 jaar terugverdienen.',
      'De beoordeling hangt af van locatie, activiteit en energiegebruik.',
      'Controleer de officiële RVO-bronnen voor de exacte situatie.',
    ],
    anchor: '#regelgeving',
  },
  {
    id: 'informatieplicht',
    title: 'Informatieplicht energiebesparing',
    summary:
      'Wie onder de energiebesparingsplicht valt, moet meestal eens per 4 jaar rapporteren welke maatregelen zijn genomen.',
    keywords: ['informatieplicht', 'rapporteren', 'rvo', 'eloket', 'omgevingsdienst', 'rapportage'],
    bullets: [
      'De vorige rapportageronde had 1 december 2023 als uiterste datum. Controleer RVO voor de actuele ronde en uitzonderingen.',
      'Rapporteren loopt via RVO eLoket en is gericht aan de omgevingsdienst.',
      'Niet of onvolledig rapporteren kan tot handhaving leiden.',
    ],
    anchor: '#regelgeving',
  },
  {
    id: 'onderzoeksplicht',
    title: 'Onderzoeksplicht energiebesparing',
    summary:
      'Voor zeer energie-intensieve locaties kan naast de informatieplicht ook een onderzoeksplicht gelden.',
    keywords: ['onderzoeksplicht', '10 miljoen', '170000', '170.000', 'energie-intensief', 'grote verbruiker'],
    bullets: [
      'Relevant vanaf 10 miljoen kWh elektriciteit of 170.000 m3 aardgas(equivalent) per locatie.',
      'Geldt alleen voor aangewezen sectoren en activiteiten.',
      'Het onderzoek beschrijft kosteneffectieve energiebesparende en CO2-reducerende maatregelen.',
    ],
    anchor: '#regelgeving',
  },
  {
    id: 'label-c',
    title: 'Energielabel C kantoren',
    summary:
      'Veel kantoorgebouwen moeten sinds 1 januari 2023 minimaal energielabel C hebben om als kantoor gebruikt te mogen worden.',
    keywords: ['label c', 'energielabel', 'kantoor', 'kantoren', '100 m2', '2023'],
    bullets: [
      'De verplichting geldt vaak bij minimaal 100 m2 kantoorfunctie en meer dan 50% kantoorfunctie.',
      'Er zijn uitzonderingen, bijvoorbeeld monumenten of geplande sloop/transformatie.',
      'Gemeenten en omgevingsdiensten kunnen handhaven.',
    ],
    anchor: '#regelgeving',
  },
  {
    id: 'eed-epbd-fgassen',
    title: 'EED, EPBD en F-gassen',
    summary:
      'Grotere ondernemingen en gebouwen met bepaalde installaties kunnen aanvullende audit-, keurings- of logboekplichten hebben.',
    keywords: ['eed', 'epbd', 'gacs', 'f-gassen', 'airco', 'koeling', 'keuring', 'audit', '250 fte'],
    bullets: [
      'EED-auditplicht geldt voor grote ondernemingen, bijvoorbeeld vanaf 250 fte of hoge omzet/balanstotaal.',
      'EPBD-keuring geldt voor grotere verwarmings- en aircosystemen rond of boven 70 kW, met exacte grens per systeemtype.',
      'GACS geldt sinds 2026 voor veel utiliteitsgebouwen met klimaatinstallaties boven 290 kW en wordt vanaf 2030 breder relevant boven 70 kW.',
      'F-gasseninstallaties kunnen lekcontrole, certificering en logboekplicht vragen.',
    ],
    anchor: '#regelgeving',
  },
  {
    id: 'contact',
    title: 'Contact',
    summary:
      'BespaarCheck is bereikbaar via info@bespaarcheck.net. Bezoekers kunnen vrijblijvend contactgegevens achterlaten voor een vervolggesprek.',
    keywords: ['contact', 'mail', 'email', 'e-mail', 'bellen', 'afspraak', 'telefoon', 'bereikbaar'],
    bullets: [
      'E-mail: info@bespaarcheck.net.',
      'Een vervolggesprek is vrijblijvend.',
      'Een aanvraag of contactmoment verplicht de bezoeker tot niets.',
    ],
    anchor: '#contact',
  },
];

const kennisbankEn: KnowledgeItem[] = [
  {
    id: 'intro',
    title: 'What is BespaarCheck?',
    summary:
      'BespaarCheck helps SME companies understand energy costs, saving opportunities and relevant sustainability measures.',
    keywords: ['bespaarcheck', 'what is', 'company', 'sme', 'energy advice', 'advice', 'free', 'non binding'],
    bullets: [
      'The online check gives an immediate indication of energy costs, savings and CO2 reduction.',
      'The first insight and advice conversation are free and completely non-binding.',
      'Visitors are not committed to anything and choose their own next steps.',
    ],
    anchor: '#calculator',
  },
  {
    id: 'calculator',
    title: 'Savings calculator',
    summary:
      'The calculator uses business type, building size, energy use, existing installations, contract type and priorities.',
    keywords: ['calculator', 'calculation', 'saving', 'report', 'consumption', 'energy costs', 'check'],
    bullets: [
      'The result is an indication, not a binding quote.',
      'The calculator uses current or fallback business energy rates.',
      'The result shows current costs, expected savings, CO2 reduction, investment and payback time.',
      'After the calculation, the visitor enters contact details, accepts the privacy statement and receives the indicative report by email.',
    ],
    anchor: '#calculator',
  },
  {
    id: 'non-binding',
    title: 'Free and non-binding',
    summary:
      'Everything through BespaarCheck is low-threshold: the check, the indication and the first conversation are non-binding.',
    keywords: ['non binding', 'commitment', 'costs', 'free', 'quote', 'request', 'contract'],
    bullets: [
      'The visitor is not committed to anything.',
      'A request does not automatically become an agreement.',
      'BespaarCheck first gives insight; the visitor chooses whether next steps make sense.',
    ],
    anchor: '#calculator',
  },
  {
    id: 'led',
    title: 'LED lighting',
    summary:
      'LED lighting is often a quick measure with a relatively short payback time, especially for shops, offices and warehouses.',
    keywords: ['led', 'lighting', 'lamps', 'light', 'payback'],
    bullets: [
      'It can significantly reduce electricity use for lighting.',
      'The calculator automatically leaves LED out if the visitor already has it.',
      'Investment and savings depend on building size, operating hours and current fixtures.',
    ],
    anchor: '#savings',
  },
  {
    id: 'solar',
    title: 'Solar panels',
    summary:
      'Solar panels can be attractive when there is suitable roof space and enough own electricity consumption.',
    keywords: ['solar', 'solar panels', 'pv', 'roof', 'feed in', 'generation', 'own consumption'],
    bullets: [
      'The calculator takes own consumption and feed-in into account.',
      'Existing solar panels can be entered, including annual feed-in.',
      'Return depends on roof orientation, roof area, grid connection and contract terms.',
    ],
    anchor: '#savings',
  },
  {
    id: 'heatpump',
    title: 'Heat pump',
    summary:
      'A heat pump can lower gas use, but it needs a good match with the building, heating system and insulation level.',
    keywords: ['heat pump', 'heating', 'gas', 'cooling', 'boiler'],
    bullets: [
      'The calculator only includes heat pump options when gas use and building profile make sense.',
      'A heat pump usually increases electricity use, but lowers gas use.',
      'Larger or poorly insulated buildings need a tailored assessment.',
    ],
    anchor: '#savings',
  },
  {
    id: 'ems',
    title: 'Energy management and smart control',
    summary:
      'Energy management systems and smart climate control provide insight and can reduce use, peaks and waste.',
    keywords: ['ems', 'energy management', 'smart thermostat', 'control', 'monitoring', 'climate control'],
    bullets: [
      'EMS is especially relevant with higher energy costs or multiple installations.',
      'Smart climate control can help avoid unnecessary heating or cooling.',
      'The best result often comes from combining measures.',
    ],
    anchor: '#savings',
  },
  {
    id: 'contract',
    title: 'Energy contracts',
    summary:
      'Contract optimization can save money without a technical investment, depending on the profile and contract terms.',
    keywords: ['contract', 'energy contract', 'supplier', 'rate', 'dynamic', 'fixed', 'variable', 'price'],
    bullets: [
      'The calculator includes contract type in the savings indication.',
      'Dynamic contracts are mainly interesting when consumption can be steered flexibly.',
      'For business contracts, terms, duration and connection profile also matter.',
    ],
    anchor: '#calculator',
  },
  {
    id: 'energy-saving-obligation',
    title: 'Energy-saving obligation',
    summary:
      'Companies and institutions may fall under the energy-saving obligation from 50,000 kWh electricity or 25,000 m3 natural gas equivalent per location.',
    keywords: ['energy saving obligation', '50000', '25000', 'natural gas', 'kwh', 'eml', 'regulation'],
    bullets: [
      'The obligation concerns measures that pay back within 5 years.',
      'The assessment depends on location, activity and energy use.',
      'Check official RVO sources for the exact situation.',
    ],
    anchor: '#regelgeving',
  },
  {
    id: 'information-duty',
    title: 'Energy-saving information duty',
    summary:
      'Organizations that fall under the energy-saving obligation usually have to report every 4 years which measures were taken.',
    keywords: ['information duty', 'reporting', 'rvo', 'eloket', 'environmental authority'],
    bullets: [
      'The previous reporting round was due by 1 December 2023. Check RVO for the current reporting round and exceptions.',
      'Reporting runs through RVO eLoket and is addressed to the environmental authority.',
      'Missing or incomplete reporting can lead to enforcement.',
    ],
    anchor: '#regelgeving',
  },
  {
    id: 'research-duty',
    title: 'Energy-saving research duty',
    summary:
      'Very energy-intensive locations may also have a research duty in addition to the information duty.',
    keywords: ['research duty', '10 million', '170000', 'energy intensive', 'large consumer'],
    bullets: [
      'Relevant from 10 million kWh electricity or 170,000 m3 natural gas equivalent per location.',
      'Only applies to designated sectors and activities.',
      'The study describes cost-effective energy-saving and CO2-reducing measures.',
    ],
    anchor: '#regelgeving',
  },
  {
    id: 'label-c',
    title: 'Energy label C for offices',
    summary:
      'Many office buildings must have at least energy label C since 1 January 2023 to be used as offices.',
    keywords: ['label c', 'energy label', 'office', 'offices', '100 m2', '2023'],
    bullets: [
      'The rule often applies from at least 100 m2 office function and more than 50 percent office function.',
      'There are exceptions, such as monuments, short temporary use, expropriation, no climate control or required measures with payback above 10 years.',
      'Municipalities and environmental authorities can enforce this.',
    ],
    anchor: '#regelgeving',
  },
  {
    id: 'contact',
    title: 'Contact',
    summary:
      'BespaarCheck can be reached at info@bespaarcheck.net. Visitors can leave contact details for a non-binding follow-up conversation.',
    keywords: ['contact', 'mail', 'email', 'call', 'appointment', 'phone'],
    bullets: [
      'Email: info@bespaarcheck.net.',
      'A follow-up conversation is non-binding.',
      'A request or contact moment does not commit the visitor to anything.',
    ],
    anchor: '#contact',
  },
];

const stopWords = new Set([
  'de',
  'het',
  'een',
  'en',
  'of',
  'ik',
  'wij',
  'jij',
  'u',
  'uw',
  'mijn',
  'voor',
  'met',
  'aan',
  'van',
  'op',
  'in',
  'is',
  'zijn',
  'wat',
  'hoe',
  'waar',
  'kan',
  'moet',
  'graag',
  'over',
  'als',
  'dan',
]);

function tokenize(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9.]+/g, ' ')
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !stopWords.has(token));
}

function getKnowledgeBase(language: ChatLanguage = 'nl') {
  return language === 'en' ? kennisbankEn : kennisbank;
}

export function findRelevantKnowledge(question: string, limit = 3, language: ChatLanguage = 'nl') {
  const tokens = tokenize(question);
  const knowledgeBase = getKnowledgeBase(language);

  const scored = knowledgeBase.map((item) => {
    const haystack = [
      item.title,
      item.summary,
      item.keywords.join(' '),
      item.bullets.join(' '),
    ]
      .join(' ')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const score = tokens.reduce((total, token) => {
      if (item.keywords.some((keyword) => keyword.toLowerCase().includes(token))) return total + 5;
      if (haystack.includes(token)) return total + 2;
      return total;
    }, 0);

    return { item, score };
  });

  const matches = scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);

  return matches.length > 0 ? matches : knowledgeBase.slice(0, limit);
}

export function buildKnowledgeContext(items: KnowledgeItem[]) {
  return items
    .map((item) => {
      const bullets = item.bullets.map((bullet, index) => `${index + 1}. ${bullet}`).join('\n');
      return `${item.title}\n${item.summary}\n${bullets}`;
    })
    .join('\n\n');
}

export function createLocalAnswer(question: string, language: ChatLanguage = 'nl') {
  const lower = question.toLowerCase();
  const matches = findRelevantKnowledge(question, 3, language);
  const primary = matches[0];

  if (language === 'en') {
    if (/^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(lower)) {
      return {
        reply:
          'Hello, I am Check from BespaarCheck. I can help you with saving opportunities, the calculator and relevant regulation. Everything is completely non-binding: you are not committed to anything. Where would you like to start?',
        anchor: '#calculator',
      };
    }

    if (
      lower.includes('where do i start') ||
      lower.includes('how do i start') ||
      lower.includes('first step') ||
      lower.includes('office')
    ) {
      return {
        reply:
          'That is a useful starting point. For an office, I would usually look first at consumption and the energy contract, then lighting and climate control, and then solar panels or larger installations if the building profile fits. Energy label C can also matter for offices, but practical savings start with insight into kWh, gas use and existing installations.\n\nDo you roughly know your annual electricity and gas consumption?',
        anchor: '#calculator',
      };
    }

    if (
      lower.includes('energy-saving obligation') ||
      lower.includes('information duty') ||
      lower.includes('research duty') ||
      lower.includes('regulation') ||
      lower.includes('legal') ||
      lower.includes('mandatory')
    ) {
      return {
        reply:
          'That depends on your consumption, location, sector and installations. If a location uses at least 50,000 kWh electricity or 25,000 m3 natural gas equivalent per year, the energy-saving obligation may apply. Measures with a payback time of 5 years or less can then be required. Very high consumption can also trigger a research duty. This is information, not legal advice; always check official RVO sources for your specific situation.',
        anchor: '#regelgeving',
      };
    }

    if (
      lower.includes('non-binding') ||
      lower.includes('commit') ||
      lower.includes('free') ||
      lower.includes('cost') ||
      lower.includes('agreement') ||
      lower.includes('contract')
    ) {
      return {
        reply:
          'Yes. BespaarCheck is free and completely non-binding. The online indication, a first advice conversation and preparing a request do not commit you to anything. You decide whether you want to take next steps.',
        anchor: '#calculator',
      };
    }

    const intro = `Based on the BespaarCheck information, this is the key point about ${primary.title.toLowerCase()}:`;
    const bullets = primary.bullets.slice(0, 3).map((bullet, index) => `${index + 1}. ${bullet}`).join('\n');
    const extra =
      matches.length > 1
        ? `\n\nAlso relevant: ${matches
            .slice(1)
            .map((item) => item.title)
            .join(', ')}.`
        : '';
    const cta = primary.anchor
      ? `\n\nWould you like to make this concrete? Open ${primary.anchor === '#calculator' ? 'the calculator' : 'the right section on this page'}.`
      : '';

    return {
      reply: `${intro}\n${bullets}${extra}${cta}`,
      anchor: primary.anchor,
    };
  }

  if (/^(hoi|hallo|hey|goedemorgen|goedemiddag|goedenavond)\b/.test(lower)) {
    return {
      reply:
        'Hallo, ik ben Check van BespaarCheck. Ik kan u helpen met besparingskansen, de calculator en wet- en regelgeving. Alles is geheel vrijblijvend: u zit nergens aan vast. Waar wilt u mee beginnen?',
      anchor: '#calculator',
    };
  }

  if (
    lower.includes('waar begin') ||
    lower.includes('waar starten') ||
    lower.includes('hoe begin') ||
    lower.includes('eerste stap') ||
    lower.includes('kantoor van')
  ) {
    return {
      reply:
        'Dat is een mooie ingang. Voor een kantoor zou ik meestal in deze volgorde kijken: eerst verbruik en contract, daarna verlichting en klimaatregeling, en vervolgens zonnepanelen of grotere installaties als het gebouwprofiel klopt. Bij kantoren is energielabel C ook een aandachtspunt, maar voor besparing begint het praktisch met inzicht in kWh, gasverbruik en bestaande installaties.\n\nWeet u ongeveer uw jaarverbruik voor stroom en gas?',
      anchor: '#calculator',
    };
  }

  if (
    lower.includes('energiebesparingsplicht') ||
    lower.includes('informatieplicht') ||
    lower.includes('onderzoeksplicht') ||
    lower.includes('wetgeving') ||
    lower.includes('regelgeving') ||
    (lower.includes('verplicht') && (lower.includes('maatregel') || lower.includes('bedrijf') || lower.includes('mkb')))
  ) {
    return {
      reply:
        'Dat hangt af van uw verbruik, locatie, sector en installaties. Als een locatie jaarlijks vanaf 50.000 kWh elektriciteit of 25.000 m3 aardgas(equivalent) gebruikt, kan de energiebesparingsplicht gelden. Dan moeten maatregelen worden genomen die zich binnen 5 jaar terugverdienen. Bij zeer groot verbruik kan ook de onderzoeksplicht gelden. Dit is informatief, geen juridisch advies; controleer altijd de officiële RVO-bronnen voor uw specifieke situatie.',
      anchor: '#regelgeving',
    };
  }

  if (
    lower.includes('vrijblijvend') ||
    lower.includes('nergens aan vast') ||
    lower.includes('zit ik ergens aan vast') ||
    lower.includes('gratis') ||
    lower.includes('kost') ||
    lower.includes('overeenkomst') ||
    lower.includes('contract afsluiten')
  ) {
    return {
      reply:
        'Ja. De BespaarCheck is gratis en geheel vrijblijvend. De online indicatie, een eerste adviesgesprek en het klaarzetten van een aanvraag verplichten u tot niets. U bepaalt zelf of u daarna vervolgstappen wilt zetten.',
      anchor: '#calculator',
    };
  }

  const intro = `Op basis van de BespaarCheck-informatie is dit het belangrijkste over ${primary.title.toLowerCase()}:`;
  const bullets = primary.bullets.slice(0, 3).map((bullet, index) => `${index + 1}. ${bullet}`).join('\n');
  const extra =
    matches.length > 1
      ? `\n\nOok relevant: ${matches
          .slice(1)
          .map((item) => item.title)
          .join(', ')}.`
      : '';
  const cta = primary.anchor
    ? `\n\nWilt u dit concreet maken? Ga dan naar ${primary.anchor === '#calculator' ? 'de calculator' : 'de juiste sectie op deze pagina'}.`
    : '';

  return {
    reply: `${intro}\n${bullets}${extra}${cta}`,
    anchor: primary.anchor,
  };
}
