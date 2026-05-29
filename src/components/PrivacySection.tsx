import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function PrivacySection() {
  const { isEnglish } = useLanguage();
  const text = isEnglish
    ? {
        chip: 'Privacy',
        title: 'Privacy statement',
        intro:
          'BespaarCheck processes personal data carefully, transparently and only for clear, practical purposes. This statement explains which data we process and why.',
        updated: 'Last updated: 29 May 2026',
        controllerTitle: 'Who is responsible?',
        controller:
          'BespaarCheck is the controller for the personal data submitted through this website. For privacy questions or to exercise your rights, you can contact us at info@bespaarcheck.net.',
        dataTitle: 'Which data do we process?',
        data:
          'When you use the calculator, contact form or chatbot, we may process your name, company name, email address, phone number or other contact detail, your company energy profile and calculator input, the generated report, and the content of your message or chat conversation. We also process technical data such as your IP address for security and abuse prevention.',
        purposeTitle: 'Why do we process this data?',
        purpose:
          'We use this data to send your indicative savings report, answer your question via the chatbot, follow up on a non-binding request, secure and improve the website, and prevent misuse of our forms.',
        basisTitle: 'Legal basis (GDPR)',
        basis:
          'We rely on your consent for the savings report and contact requests (which you may withdraw at any time), on the necessity of processing to handle your request, and on our legitimate interest in securing and improving the website and preventing abuse.',
        aiTitle: 'Use of AI',
        ai:
          'The chatbot and the analysis of your calculator result are generated with the help of AI services from OpenAI and/or Google. The text you enter and the calculation data are sent to these providers to produce a response. The output is indicative and is never an automated decision with legal consequences for you.',
        sharingTitle: 'Who receives data?',
        sharing:
          'We only share data with processors needed to deliver the service: Vercel (hosting), Postmark (email delivery) and OpenAI and/or Google (AI processing). These parties act on our instructions under a processing agreement. We never sell personal data.',
        transferTitle: 'Transfer outside the EEA',
        transfer:
          'Some of these processors are established in the United States, so your data may be transferred outside the European Economic Area. Such transfers take place with appropriate safeguards, such as EU Standard Contractual Clauses and, where applicable, the EU-US Data Privacy Framework.',
        cookiesTitle: 'Cookies and local storage',
        cookies:
          'We do not use tracking or marketing cookies and no third-party analytics. We only store functional preferences (your language and light or dark theme) locally in your browser. You can clear these at any time through your browser settings.',
        retentionTitle: 'How long do we keep data?',
        retention:
          'We keep contact and request data no longer than necessary for follow-up, administration and security. If a request does not lead to further contact, we aim to remove or anonymise it within a reasonable period.',
        rightsTitle: 'Your rights',
        rights:
          'You can request access, correction, deletion, restriction or transfer of your data, object to processing or withdraw consent at any time. Email info@bespaarcheck.net. If you are not satisfied, you may also lodge a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens).',
        securityTitle: 'Security',
        security:
          'We apply technical and organisational measures to protect data, including encrypted (HTTPS) connections, limited access, rate limiting against abuse and server-side handling of keys and form submissions.',
      }
    : {
        chip: 'Privacy',
        title: 'Privacyverklaring',
        intro:
          'BespaarCheck verwerkt persoonsgegevens zorgvuldig, transparant en alleen voor duidelijke, praktische doelen. Deze verklaring legt uit welke gegevens wij verwerken en waarom.',
        updated: 'Laatst bijgewerkt: 29 mei 2026',
        controllerTitle: 'Wie is verantwoordelijk?',
        controller:
          'BespaarCheck is de verwerkingsverantwoordelijke voor de persoonsgegevens die via deze website worden ingevuld. Voor vragen over privacy of het uitoefenen van uw rechten kunt u contact opnemen via info@bespaarcheck.net.',
        dataTitle: 'Welke gegevens verwerken wij?',
        data:
          'Wanneer u de calculator, het contactformulier of de chatbot gebruikt, kunnen wij uw naam, bedrijfsnaam, e-mailadres, telefoonnummer of ander contactgegeven, uw bedrijfs- en energieprofiel en calculatorinvoer, het gegenereerde rapport en de inhoud van uw bericht of chatgesprek verwerken. Daarnaast verwerken wij technische gegevens zoals uw IP-adres voor beveiliging en het voorkomen van misbruik.',
        purposeTitle: 'Waarom verwerken wij deze gegevens?',
        purpose:
          'Wij gebruiken deze gegevens om uw indicatieve besparingsrapport te versturen, uw vraag via de chatbot te beantwoorden, een vrijblijvende aanvraag op te volgen, de website te beveiligen en te verbeteren en misbruik van formulieren te voorkomen.',
        basisTitle: 'Grondslag (AVG)',
        basis:
          'Wij baseren ons op uw toestemming voor het besparingsrapport en contactaanvragen (die u altijd kunt intrekken), op de noodzaak van de verwerking om uw aanvraag uit te voeren, en op ons gerechtvaardigd belang bij beveiliging, verbetering en het voorkomen van misbruik.',
        aiTitle: 'Gebruik van AI',
        ai:
          'De chatbot en de analyse van uw calculatoruitkomst worden mede gegenereerd met AI-diensten van OpenAI en/of Google. De tekst die u invoert en de berekeningsgegevens worden naar deze partijen verstuurd om een antwoord te genereren. De uitkomst is indicatief en vormt nooit een geautomatiseerd besluit met rechtsgevolgen voor u.',
        sharingTitle: 'Wie ontvangen gegevens?',
        sharing:
          'Wij delen gegevens alleen met verwerkers die nodig zijn om de dienst te leveren: Vercel (hosting), Postmark (e-mailverzending) en OpenAI en/of Google (AI-verwerking). Deze partijen handelen in onze opdracht onder een verwerkersovereenkomst. Wij verkopen nooit persoonsgegevens.',
        transferTitle: 'Doorgifte buiten de EER',
        transfer:
          'Een deel van deze verwerkers is gevestigd in de Verenigde Staten, waardoor uw gegevens buiten de Europese Economische Ruimte kunnen worden verwerkt. Deze doorgifte gebeurt met passende waarborgen, zoals de EU-modelcontractbepalingen (SCC\u2019s) en waar van toepassing het EU-US Data Privacy Framework.',
        cookiesTitle: 'Cookies en lokale opslag',
        cookies:
          'Wij gebruiken geen tracking- of marketingcookies en geen analytics van derden. Wij slaan alleen functionele voorkeuren (uw taalkeuze en licht of donker thema) lokaal in uw browser op. U kunt deze altijd wissen via uw browserinstellingen.',
        retentionTitle: 'Hoe lang bewaren wij gegevens?',
        retention:
          'Wij bewaren contact- en aanvraaggegevens niet langer dan nodig is voor opvolging, administratie en beveiliging. Als een aanvraag niet tot verder contact leidt, streven wij ernaar deze binnen een redelijke termijn te verwijderen of te anonimiseren.',
        rightsTitle: 'Uw rechten',
        rights:
          'U kunt vragen om inzage, correctie, verwijdering, beperking of overdracht van uw gegevens, bezwaar maken tegen verwerking of uw toestemming intrekken. Mail naar info@bespaarcheck.net. Bent u niet tevreden, dan kunt u ook een klacht indienen bij de Autoriteit Persoonsgegevens.',
        securityTitle: 'Beveiliging',
        security:
          'Wij nemen technische en organisatorische maatregelen om gegevens te beschermen, waaronder versleutelde (HTTPS) verbindingen, beperkte toegang, rate limiting tegen misbruik en server-side verwerking van sleutels en formulierinzendingen.',
      };

  const items = [
    [text.controllerTitle, text.controller],
    [text.dataTitle, text.data],
    [text.purposeTitle, text.purpose],
    [text.basisTitle, text.basis],
    [text.aiTitle, text.ai],
    [text.sharingTitle, text.sharing],
    [text.transferTitle, text.transfer],
    [text.cookiesTitle, text.cookies],
    [text.retentionTitle, text.retention],
    [text.rightsTitle, text.rights],
    [text.securityTitle, text.security],
  ];

  return (
    <section id="privacy" className="bg-slate-50 py-16 dark:bg-slate-950 sm:py-20">
      <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              {text.chip}
            </div>
            <h2 className="mt-5 text-3xl font-bold text-slate-950 dark:text-white">
              {text.title}
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
              {text.intro}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {text.updated}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {items.map(([title, body]) => (
              <article key={title} className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <h3 className="text-base font-bold text-slate-950 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
