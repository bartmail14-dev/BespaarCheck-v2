import { ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function Footer() {
  const { isEnglish } = useLanguage();
  const text = isEnglish
    ? {
        description:
          'BespaarCheck helps SMEs get a non-binding view of energy savings, payback time and possible regulatory attention points.',
        reassurance: 'Everything is completely non-binding. You get insight first and are not committed to anything.',
        contactLabel: 'Contact',
        title: 'Ask a question or review options together?',
        contactText: 'Send an e-mail. We keep it practical, clear and without obligations.',
        navLabel: 'Footer navigation',
        copyright: 'Indicative and non-binding.',
        links: [
          { label: 'Saving options', href: '#savings' },
          { label: 'Rules and regulations', href: '#regelgeving' },
          { label: 'Frequently asked questions', href: '#faq' },
          { label: 'Privacy statement', href: '#privacy' },
          { label: 'Start the check', href: '#calculator' },
        ],
      }
    : {
        description:
          'BespaarCheck helpt MKB-bedrijven vrijblijvend inzicht krijgen in energiebesparing, terugverdientijd en mogelijke aandachtspunten rond wet- en regelgeving.',
        reassurance: 'Alles is volledig vrijblijvend. U krijgt eerst inzicht en zit nergens aan vast.',
        contactLabel: 'Contact',
        title: 'Vraag stellen of samen kijken?',
        contactText: 'Stuur een e-mail. We houden het praktisch, helder en zonder verplichtingen.',
        navLabel: 'Footer navigatie',
        copyright: 'Indicatief en vrijblijvend.',
        links: [
          { label: 'Bespaarmogelijkheden', href: '#savings' },
          { label: 'Wet- en regelgeving', href: '#regelgeving' },
          { label: 'Veelgestelde vragen', href: '#faq' },
          { label: 'Privacyverklaring', href: '#privacy' },
          { label: 'Doe de check', href: '#calculator' },
        ],
      };

  return (
    <footer id="contact" className="bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-14">
        <div className="grid min-w-0 gap-8 lg:grid-cols-[1.15fr_0.85fr] items-stretch">
          <div className="min-w-0 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 p-4 sm:p-8">
            <img src="/logo.png" alt="BespaarCheck" className="h-10 max-w-full dark:hidden sm:h-12" />
            <img src="/logo-light.png" alt="BespaarCheck" className="hidden h-10 max-w-full dark:block sm:h-12" />
            <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-300">
              {text.description}
            </p>
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-emerald-100 dark:border-emerald-900/50 bg-white dark:bg-slate-950 px-4 py-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-300" />
              <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                {text.reassurance}
              </p>
            </div>
          </div>

          <div className="min-w-0 rounded-lg border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
              {text.contactLabel}
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {text.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
              {text.contactText}
            </p>
            <a
              href="mailto:info@bespaarcheck.net"
              className="mt-6 inline-flex w-full min-w-0 items-center justify-between gap-3 rounded-lg bg-emerald-600 px-4 py-4 text-left font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 dark:bg-sky-600 dark:hover:bg-sky-500 sm:px-5"
            >
              <span className="inline-flex min-w-0 items-center gap-3">
                <Mail className="h-5 w-5" />
                <span className="break-all">info@bespaarcheck.net</span>
              </span>
              <ArrowRight className="h-5 w-5 flex-shrink-0" />
            </a>
          </div>
        </div>

        <div className="mt-8 grid gap-8 border-t border-gray-100 dark:border-slate-800 pt-8 md:grid-cols-[1fr_auto] md:items-center">
          <nav className="flex flex-wrap gap-x-6 gap-y-3" aria-label={text.navLabel}>
            {text.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-emerald-700 dark:text-gray-300 dark:hover:text-emerald-300"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} BespaarCheck. {text.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
