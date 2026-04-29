import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function PrivacySection() {
  const { isEnglish } = useLanguage();
  const text = isEnglish
    ? {
        chip: 'Privacy',
        title: 'Privacy statement',
        intro:
          'BespaarCheck processes personal data carefully and only for clear, practical purposes.',
        updated: 'Last updated: 29 April 2026',
        controllerTitle: 'Who is responsible?',
        controller:
          'BespaarCheck is responsible for processing data submitted through this website. You can contact us at info@bespaarcheck.net.',
        dataTitle: 'Which data do we process?',
        data:
          'When you use the calculator, contact form or chatbot, we may process your name, company name, email address, phone number or other contact detail, company energy profile, calculator input, generated report information and the content of your message or chat.',
        purposeTitle: 'Why do we process this data?',
        purpose:
          'We use this data to send your report, answer your question, follow up on a non-binding request, improve the website and prevent misuse of forms.',
        basisTitle: 'Legal basis',
        basis:
          'We process data because you request a report or contact moment, because you give consent where requested, and because we have a legitimate interest in securing and improving the website.',
        sharingTitle: 'Who receives data?',
        sharing:
          'We only share data with processors needed to run the website, send email and provide the requested service, such as hosting, email and analysis infrastructure. We do not sell personal data.',
        retentionTitle: 'How long do we keep data?',
        retention:
          'We keep contact and request data no longer than necessary for follow-up, administration and security. If a request does not lead to further contact, we aim to remove or anonymise it within a reasonable period.',
        rightsTitle: 'Your rights',
        rights:
          'You can request access, correction, deletion, restriction or transfer of your data. You can also object to processing or withdraw consent. Email info@bespaarcheck.net. You may also contact the Dutch Data Protection Authority.',
        securityTitle: 'Security',
        security:
          'We use technical and organisational measures to protect data, including secure connections, limited access and server-side handling of keys and form submissions.',
      }
    : {
        chip: 'Privacy',
        title: 'Privacyverklaring',
        intro:
          'BespaarCheck verwerkt persoonsgegevens zorgvuldig en alleen voor duidelijke, praktische doelen.',
        updated: 'Laatst bijgewerkt: 29 april 2026',
        controllerTitle: 'Wie is verantwoordelijk?',
        controller:
          'BespaarCheck is verantwoordelijk voor de verwerking van gegevens die via deze website worden ingevuld. U kunt contact opnemen via info@bespaarcheck.net.',
        dataTitle: 'Welke gegevens verwerken wij?',
        data:
          'Wanneer u de calculator, het contactformulier of de chatbot gebruikt, kunnen wij uw naam, bedrijfsnaam, e-mailadres, telefoonnummer of ander contactgegeven, bedrijfsprofiel, energiegegevens, calculatorinvoer, rapportgegevens en de inhoud van uw bericht of chat verwerken.',
        purposeTitle: 'Waarom verwerken wij deze gegevens?',
        purpose:
          'Wij gebruiken deze gegevens om uw rapport te versturen, uw vraag te beantwoorden, een vrijblijvende aanvraag op te volgen, de website te verbeteren en misbruik van formulieren te voorkomen.',
        basisTitle: 'Grondslag',
        basis:
          'Wij verwerken gegevens omdat u een rapport of contactmoment aanvraagt, omdat u toestemming geeft waar dat wordt gevraagd, en omdat wij een gerechtvaardigd belang hebben bij beveiliging en verbetering van de website.',
        sharingTitle: 'Wie ontvangen gegevens?',
        sharing:
          'Wij delen gegevens alleen met verwerkers die nodig zijn voor de website, e-mailverzending en de gevraagde dienstverlening, zoals hosting, e-mail en analyse-infrastructuur. Wij verkopen geen persoonsgegevens.',
        retentionTitle: 'Hoe lang bewaren wij gegevens?',
        retention:
          'Wij bewaren contact- en aanvraaggegevens niet langer dan nodig is voor opvolging, administratie en beveiliging. Als een aanvraag niet tot verder contact leidt, streven wij ernaar deze binnen een redelijke termijn te verwijderen of te anonimiseren.',
        rightsTitle: 'Uw rechten',
        rights:
          'U kunt vragen om inzage, correctie, verwijdering, beperking of overdracht van uw gegevens. U kunt ook bezwaar maken tegen verwerking of toestemming intrekken. Mail naar info@bespaarcheck.net. U kunt ook terecht bij de Autoriteit Persoonsgegevens.',
        securityTitle: 'Beveiliging',
        security:
          'Wij nemen technische en organisatorische maatregelen om gegevens te beschermen, waaronder beveiligde verbindingen, beperkte toegang en server-side verwerking van sleutels en formulierinzendingen.',
      };

  const items = [
    [text.controllerTitle, text.controller],
    [text.dataTitle, text.data],
    [text.purposeTitle, text.purpose],
    [text.basisTitle, text.basis],
    [text.sharingTitle, text.sharing],
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
