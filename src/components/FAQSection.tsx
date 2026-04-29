import { useState } from 'react';
import { ArrowRight, ChevronDown, HelpCircle, Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'Wat is BespaarCheck precies?',
    answer:
      'BespaarCheck helpt MKB-bedrijven met inzicht in energiekosten, mogelijke besparingen en passende vervolgstappen. De online check geeft een indicatie en is volledig vrijblijvend.',
  },
  {
    question: 'Hoe betrouwbaar is de online berekening?',
    answer:
      'De calculator geeft een indicatie op basis van uw bedrijfstype, verbruik en actuele zakelijke energietarieven. De werkelijke besparing hangt af van onder andere de staat van uw pand, dakorientatie, isolatiegraad en uw specifieke energiecontract.',
  },
  {
    question: 'Welke energieprijzen worden gebruikt in de berekening?',
    answer:
      'We gebruiken actuele zakelijke energietarieven waar dat technisch beschikbaar is. Bij technische problemen gebruikt de check recente gemiddelde marktprijzen als fallback. De gebruikte tarieven worden altijd getoond in de resultaten.',
  },
  {
    question: 'Kost een adviesgesprek iets?',
    answer:
      'Nee, het eerste gesprek is gratis en vrijblijvend. U bespreekt uw situatie, de uitkomsten van de calculator en mogelijke maatregelen. U zit nergens aan vast en bepaalt zelf of u vervolgstappen wilt zetten.',
  },
  {
    question: 'Welke maatregelen worden meegenomen in de berekening?',
    answer:
      'De calculator kijkt naar maatregelen zoals LED-verlichting, zonnepanelen, warmtepompen, energiemanagement, slimme thermostaten en energiecontractoptimalisatie. Maatregelen die u al heeft, worden waar mogelijk niet dubbel meegenomen.',
  },
  {
    question: 'Ik heb al zonnepanelen. Heeft BespaarCheck dan nog zin?',
    answer:
      'Ja. Zonnepanelen zijn maar een deel van het verhaal. Er kan ook winst zitten in LED, warmtepompen, klimaatregeling, energiemanagement, opslag, laadpalen en uw energiecontract.',
  },
  {
    question: 'Ben ik als MKB-bedrijf verplicht om energiebesparende maatregelen te nemen?',
    answer:
      'Dat hangt af van uw verbruik, locatie, sector en installaties. Bedrijven met een jaarlijks elektriciteitsverbruik vanaf 50.000 kWh of gasverbruik vanaf 25.000 m3 aardgas(equivalent) kunnen onder de energiebesparingsplicht vallen. Controleer altijd de officiele RVO-bronnen.',
  },
  {
    question: 'Hoe lang duurt het voordat ik resultaat zie?',
    answer:
      'Dat verschilt per maatregel. Een beter energiecontract kan direct effect hebben. LED-verlichting kan vaak snel worden geplaatst. Grotere maatregelen zoals zonnepanelen of warmtepompen vragen meer voorbereiding en planning.',
  },
  {
    question: 'Werkt BespaarCheck samen met specifieke leveranciers?',
    answer:
      'BespaarCheck kijkt eerst naar uw situatie en kansen. U bent vrij om zelf een leverancier te kiezen of om vervolgstappen via een passend netwerk te verkennen.',
  },
  {
    question: 'Wat als mijn bedrijfspand gehuurd is?',
    answer:
      'Ook als huurder kunt u vaak besparen, bijvoorbeeld met LED-verlichting, slimme thermostaten en contractoptimalisatie. Voor grotere ingrepen zoals zonnepanelen of een warmtepomp is meestal toestemming van de verhuurder nodig.',
  },
];

const faqItemsEn: FAQItem[] = [
  {
    question: 'What exactly is BespaarCheck?',
    answer:
      'BespaarCheck helps SMEs understand energy costs, potential savings and suitable next steps. The online check gives an indication and is completely non-binding.',
  },
  {
    question: 'How reliable is the online calculation?',
    answer:
      'The calculator gives an indication based on your business type, consumption and current business energy rates. Actual savings depend on factors such as the condition of the building, roof orientation, insulation and your specific energy contract.',
  },
  {
    question: 'Which energy prices are used in the calculation?',
    answer:
      'We use current business energy rates where technically available. If this is not available, the check uses recent average market prices as a fallback. The rates used are always shown in the results.',
  },
  {
    question: 'Does an advisory call cost anything?',
    answer:
      'No. The first conversation is free and non-binding. You discuss your situation, the calculator results and possible measures. You are not committed to anything and decide yourself whether to take next steps.',
  },
  {
    question: 'Which measures are included in the calculation?',
    answer:
      'The calculator looks at measures such as LED lighting, solar panels, heat pumps, energy management, smart thermostats and energy contract optimisation. Measures you already have are not counted twice where possible.',
  },
  {
    question: 'I already have solar panels. Is BespaarCheck still useful?',
    answer:
      'Yes. Solar panels are only part of the story. There may also be opportunities in LED, heat pumps, climate control, energy management, storage, EV chargers and your energy contract.',
  },
  {
    question: 'Am I legally required to take energy-saving measures as an SME?',
    answer:
      'That depends on your consumption, location, sector and installations. Businesses with annual electricity use from 50,000 kWh or gas use from 25,000 m3 natural gas equivalent may fall under the Dutch energy-saving obligation. Always check the official RVO sources.',
  },
  {
    question: 'How long does it take before I see results?',
    answer:
      'That differs per measure. A better energy contract can have an immediate effect. LED lighting can often be installed quickly. Larger measures such as solar panels or heat pumps need more preparation and planning.',
  },
  {
    question: 'Does BespaarCheck work with specific suppliers?',
    answer:
      'BespaarCheck first looks at your situation and opportunities. You are free to choose your own supplier or explore next steps through a suitable network.',
  },
  {
    question: 'What if my business premises are rented?',
    answer:
      'Tenants can often still save energy, for example with LED lighting, smart thermostats and contract optimisation. Larger measures such as solar panels or a heat pump usually require permission from the landlord.',
  },
];

export function FAQSection() {
  const { isEnglish } = useLanguage();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const items = isEnglish ? faqItemsEn : faqItems;
  const text = isEnglish
    ? {
        chip: 'Frequently asked questions',
        title: 'Clear answers without sales talk.',
        intro: 'The most important questions about BespaarCheck, calculations, measures and the non-binding process.',
        contactTitle: 'Is your question not listed?',
        contactText: 'Ask it directly by e-mail. We keep it practical and without obligations.',
        mail: 'Mail BespaarCheck',
      }
    : {
        chip: 'Veelgestelde vragen',
        title: 'Heldere antwoorden, zonder verkooppraat.',
        intro: 'De belangrijkste vragen over de BespaarCheck, berekeningen, maatregelen en vrijblijvendheid.',
        contactTitle: 'Staat uw vraag er niet bij?',
        contactText: 'Stel hem direct via e-mail. We houden het concreet en zonder verplichtingen.',
        mail: 'Mail BespaarCheck',
      };

  return (
    <section id="faq" className="material-section scroll-mt-20 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              <HelpCircle className="w-4 h-4" />
              {text.chip}
            </div>

            <h2 className="material-title mt-5 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              {text.title}
            </h2>

            <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-gray-300">
              {text.intro}
            </p>

            <div className="mt-7 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 p-5">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{text.contactTitle}</p>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                {text.contactText}
              </p>
              <a
                href="mailto:info@bespaarcheck.net"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
              >
                <Mail className="h-4 w-4" />
                {text.mail}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 p-2 sm:p-3">
            {items.map((item, index) => {
              const isExpanded = expandedIndex === index;

              return (
                <div
                  key={item.question}
                  className={`overflow-hidden rounded-lg border transition-all duration-300 ${
                    isExpanded
                      ? 'border-emerald-200 bg-white shadow-sm dark:border-emerald-900/60 dark:bg-slate-950'
                      : 'border-transparent bg-transparent'
                  }`}
                >
                  <button
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    className="w-full p-4 sm:p-5 flex items-center gap-4 text-left transition-colors hover:bg-white dark:hover:bg-slate-950"
                    aria-expanded={isExpanded}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                        isExpanded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-emerald-700 dark:bg-slate-800 dark:text-emerald-300'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="flex-grow font-semibold text-gray-900 dark:text-white text-base">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ${
                        isExpanded ? 'rotate-180 text-emerald-600' : ''
                      }`}
                    />
                  </button>

                  <div
                    id={`faq-answer-${index}`}
                    className={`grid transition-all duration-500 ease-in-out ${
                      isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-4 pb-5 pl-[4.75rem] sm:pr-8 text-[15px] sm:text-base leading-7 text-gray-600 dark:text-gray-300">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
