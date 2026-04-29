import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Mail, Send, X } from 'lucide-react';
import {
  buildKnowledgeContext,
  findRelevantKnowledge,
  getBespaarcheckSystemPrompt,
} from '../lib/bespaarcheckKnowledge';
import type { ChatLanguage, ChatMessage } from '../lib/bespaarcheckKnowledge';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const chatCopy = {
  nl: {
    initial:
      'Welkom, ik ben Check. Ik help u rustig ontdekken waar energie, kosten en regelgeving elkaar raken. We beginnen klein: wat voor bedrijfspand wilt u slimmer maken?',
    leadInvite:
      'Als u wilt, kan een collega vrijblijvend meekijken naar de mogelijkheden. U kunt gerust uw e-mailadres of telefoonnummer delen; er gebeurt niets automatisch, het is geen overeenkomst en u zit nergens aan vast.',
    contactReply:
      'Dank u. Ik zet hieronder een vrijblijvende contactactie klaar. U bepaalt zelf of u dit doorzet. Een collega kan dan rustig meekijken naar de mogelijkheden en u zit nergens aan vast.',
    assistantLabel: 'BespaarCheck assistent',
    close: 'Sluit chat',
    thinking: 'Check denkt mee...',
    unavailable:
      'Ik kan nu geen verbinding maken met de AI. Controleer of de chatbot API en server key goed zijn ingesteld. U kunt natuurlijk wel direct contact opnemen via info@bespaarcheck.net.',
    followUpTitle: 'Vrijblijvend laten opvolgen?',
    followUpBody:
      'Klik alleen als u deze contactvraag naar BespaarCheck wilt sturen. Het is vrijblijvend en u zit nergens aan vast.',
    followUpAction: 'Verstuur vrijblijvend',
    followUpSending: 'Versturen...',
    followUpSent: 'Verzonden. Een collega kan rustig meekijken en u zit nergens aan vast.',
    followUpError: 'Versturen lukte niet. Mail gerust rechtstreeks naar info@bespaarcheck.net.',
    inputLabel: 'Stel uw vraag aan Check',
    placeholder: 'Bijv. kantoor 450 m2...',
    send: 'Verstuur bericht',
    nudge: 'Kan ik u ergens mee helpen?',
    open: 'Open BespaarCheck chat',
    mailSubject: 'Vrijblijvende opvolging via BespaarCheck chatbot',
    mailIntro: 'Er is via de BespaarCheck chatbot een vrijblijvende contactvraag klaargezet.',
    mailContact: 'Contactgegeven',
    mailContext: 'Gesprekscontext',
    visitor: 'Bezoeker',
    note: 'Let op: de bezoeker zit nergens aan vast. Eerst rustig meedenken over de mogelijkheden.',
  },
  en: {
    initial:
      'Welcome, I am Check. I help you calmly explore where energy, costs and regulation meet. Let us start small: what kind of business premises would you like to make smarter?',
    leadInvite:
      'If you like, a colleague can take a non-binding look at the possibilities. You can safely share your email address or phone number; nothing happens automatically, it is not an agreement and you are not committed to anything.',
    contactReply:
      'Thank you. I have prepared a non-binding contact step below. You decide whether to continue. A colleague can calmly look at the possibilities with you and you are not committed to anything.',
    assistantLabel: 'BespaarCheck assistant',
    close: 'Close chat',
    thinking: 'Check is thinking along...',
    unavailable:
      'I cannot connect to the AI right now. Please check whether the chatbot API and server key are configured correctly. You can still contact us directly at info@bespaarcheck.net.',
    followUpTitle: 'Follow up without obligation?',
    followUpBody:
      'Only click if you want to send this contact request to BespaarCheck. It is non-binding and you are not committed to anything.',
    followUpAction: 'Send non-binding request',
    followUpSending: 'Sending...',
    followUpSent: 'Sent. A colleague can calmly look at the possibilities and you are not committed to anything.',
    followUpError: 'Sending failed. You can still email info@bespaarcheck.net directly.',
    inputLabel: 'Ask Check your question',
    placeholder: 'For example office 450 m2...',
    send: 'Send message',
    nudge: 'Can I help you with anything?',
    open: 'Open BespaarCheck chat',
    mailSubject: 'Non-binding follow-up via BespaarCheck chatbot',
    mailIntro: 'A non-binding contact request has been prepared through the BespaarCheck chatbot.',
    mailContact: 'Contact detail',
    mailContext: 'Conversation context',
    visitor: 'Visitor',
    note: 'Note: the visitor is not committed to anything. First calmly think along about the possibilities.',
  },
} satisfies Record<ChatLanguage, Record<string, string>>;

function getInitialMessages(language: ChatLanguage): ChatMessage[] {
  return [{ role: 'assistant', content: chatCopy[language].initial }];
}

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const phonePattern = /(?:\+31|0031|0)\s?(?:6|[1-9][0-9])(?:[\s.-]?\d){7,8}/;

function normalizeAssistantText(content: string) {
  return content
    .replace(/[\u2013\u2014]/g, ',')
    .replace(/\s+,/g, ',')
    .replace(/,\s*,/g, ',')
    .trim();
}

function extractContactDetail(input: string) {
  const email = input.match(emailPattern)?.[0];
  if (email) return email;

  const phone = input.match(phonePattern)?.[0];
  if (phone) return phone;

  return null;
}

function shouldInviteLead(messages: ChatMessage[], question: string, language: ChatLanguage) {
  const lower = question.toLowerCase();
  const userMessages = messages.filter((message) => message.role === 'user').length;
  const intent =
    language === 'en'
      ? lower.includes('interesting') ||
        lower.includes('advice') ||
        lower.includes('contact') ||
        lower.includes('possibilities') ||
        lower.includes('quote') ||
        lower.includes('next step')
      : lower.includes('interessant') ||
        lower.includes('advies') ||
        lower.includes('contact') ||
        lower.includes('mogelijkheden') ||
        lower.includes('offerte') ||
        lower.includes('volgende stap');

  return userMessages >= 2 || intent;
}

function ChatFavicon({
  className = 'h-6 w-6',
  variant = 'default',
}: {
  className?: string;
  variant?: 'default' | 'white';
}) {
  return (
    <img
      src="/favicon.png"
      alt=""
      className={`${className} object-contain ${variant === 'white' ? 'brightness-0 invert' : ''}`}
      aria-hidden="true"
    />
  );
}

function resolveChatEndpoint() {
  const configured = import.meta.env.VITE_BESPAARCHECK_CHAT_ENDPOINT?.trim();
  return configured || '/api/chat';
}

async function askLlmEndpoint(messages: ChatMessage[], question: string, language: ChatLanguage) {
  const relevantKnowledge = findRelevantKnowledge(question, 6, language);
  const response = await fetch(resolveChatEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      context: buildKnowledgeContext(relevantKnowledge),
      system: getBespaarcheckSystemPrompt(language),
    }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || `Chat endpoint returned ${response.status}`);
  }

  const data = (await response.json()) as { reply?: string };
  return typeof data.reply === 'string' && data.reply.trim() ? data.reply.trim() : null;
}

export function BespaarChatbot() {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const copy = chatCopy[language];
  const [isOpen, setIsOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => getInitialMessages(language));
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [hasInvitedLead, setHasInvitedLead] = useState(false);
  const [leadContact, setLeadContact] = useState<string | null>(null);
  const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const conversationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!conversationRef.current) return;
    conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
  }, [messages, isThinking, isOpen]);

  useEffect(() => {
    const resetTimer = setTimeout(() => {
      setMessages(getInitialMessages(language));
      setInput('');
      setHasInvitedLead(false);
      setLeadContact(null);
      setLeadStatus('idle');
    }, 0);

    return () => clearTimeout(resetTimer);
  }, [language]);

  useEffect(() => {
    if (isOpen) return;

    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const showBriefly = () => {
      setShowNudge(true);
      hideTimer = setTimeout(() => setShowNudge(false), 6500);
    };

    const firstTimer = setTimeout(showBriefly, 3500);
    const intervalTimer = setInterval(showBriefly, 28000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(intervalTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isOpen]);

  const openChat = () => {
    setShowNudge(false);
    setIsOpen(true);
  };

  const sendMessage = async (text: string) => {
    const question = text.trim();
    if (!question || isThinking) return;

    const userMessage: ChatMessage = { role: 'user', content: question };
    const nextMessages = [...messages, userMessage];
    const contactDetail = extractContactDetail(question);

    setMessages(nextMessages);
    setInput('');
    setIsThinking(true);

    if (contactDetail) {
      setLeadContact(contactDetail);
      setLeadStatus('idle');
      setHasInvitedLead(true);
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: copy.contactReply,
        },
      ]);
      setIsThinking(false);
      return;
    }

    const shouldInvite = !hasInvitedLead && shouldInviteLead(nextMessages, question, language);

    try {
      const llmReply = await askLlmEndpoint(nextMessages, question, language);
      if (llmReply) {
        const reply = normalizeAssistantText(llmReply);
        setMessages((current) => [
          ...current,
          { role: 'assistant', content: shouldInvite ? `${reply}\n\n${copy.leadInvite}` : reply },
        ]);
        if (shouldInvite) setHasInvitedLead(true);
        setIsThinking(false);
        return;
      }
    } catch (error) {
      console.warn('BespaarCheck chat endpoint niet beschikbaar of niet goed geconfigureerd:', error);
    }

    setMessages((current) => [
      ...current,
      {
        role: 'assistant',
        content: copy.unavailable,
      },
    ]);
    setIsThinking(false);
  };

  const submitChatLead = async () => {
    if (!leadContact || leadStatus === 'sending') return;

    setLeadStatus('sending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'chatbot',
          language,
          contact: {
            detail: leadContact,
            email: emailPattern.test(leadContact) ? leadContact : '',
            phone: emailPattern.test(leadContact) ? '' : leadContact,
          },
          messages,
        }),
      });

      if (!response.ok) {
        throw new Error('Contact endpoint returned an error');
      }

      setLeadStatus('sent');
    } catch (error) {
      console.warn('BespaarCheck contact endpoint niet beschikbaar of niet goed geconfigureerd:', error);
      setLeadStatus('error');
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-[60] pointer-events-none">
      {isOpen && (
        <div className="pointer-events-auto mb-4 flex max-h-[calc(100svh-3.5rem)] w-[calc(100vw-2rem)] max-w-[460px] flex-col overflow-hidden rounded-lg bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 shadow-2xl shadow-slate-900/20 dark:shadow-black/50">
          <div
            className="relative overflow-hidden border-b border-gray-100 dark:border-slate-800 bg-white px-5 py-4 text-gray-900 dark:bg-slate-950 dark:text-white"
            style={{
              boxShadow: isDark
                ? 'inset 0 1px 0 rgba(255,255,255,0.04)'
                : 'inset 0 1px 0 rgba(255,255,255,0.8)',
            }}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 dark:from-violet-500 dark:via-sky-500 dark:to-teal-400" />
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-lg bg-emerald-50 dark:bg-slate-900 border border-emerald-100 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-sm">
                  <ChatFavicon className="relative h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold leading-tight tracking-tight">Check</h2>
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{copy.assistantLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-10 w-10 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
                aria-label={copy.close}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            ref={conversationRef}
            className="min-h-[210px] sm:min-h-[390px] flex-1 overflow-y-auto px-4 sm:px-5 py-5 space-y-5 bg-gray-50 dark:bg-slate-950"
          >
            {messages.map((message, index) => {
              const isAssistant = message.role === 'assistant';
              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex items-end gap-2 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="mb-1 h-9 w-9 rounded-lg bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <ChatFavicon className="h-6 w-6" />
                    </div>
                  )}
                  <div
                    className={`max-w-[86%] rounded-lg px-4 py-3.5 text-[15px] sm:text-base leading-7 whitespace-pre-line ${
                      isAssistant
                        ? 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-slate-800 shadow-sm'
                        : 'bg-emerald-600 dark:bg-sky-600 text-white shadow-lg shadow-emerald-600/16 dark:shadow-sky-950/30'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })}

            {isThinking && (
              <div className="flex justify-start items-end gap-2">
                <div className="mb-1 h-9 w-9 rounded-lg bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 flex items-center justify-center shadow-sm">
                  <ChatFavicon className="h-6 w-6" />
                </div>
                <div className="rounded-lg bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 px-4 py-3.5 text-[15px] text-gray-500 dark:text-gray-400 flex items-center gap-3 shadow-sm">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-sky-400 animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-sky-400 animate-bounce [animation-delay:120ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-sky-400 animate-bounce [animation-delay:240ms]" />
                  </span>
                  {copy.thinking}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-950">
            {leadContact && (
              <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm dark:bg-slate-950 dark:text-emerald-300">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {copy.followUpTitle}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                      {copy.followUpBody}
                    </p>
                    {leadStatus === 'sent' || leadStatus === 'error' ? (
                      <p
                        className={`mt-3 text-sm font-semibold ${
                          leadStatus === 'sent'
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : 'text-red-600 dark:text-red-300'
                        }`}
                      >
                        {leadStatus === 'sent' ? copy.followUpSent : copy.followUpError}
                      </p>
                    ) : (
                    <button
                      type="button"
                      onClick={submitChatLead}
                      disabled={leadStatus === 'sending'}
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 disabled:cursor-wait disabled:opacity-70 dark:text-emerald-300 dark:hover:text-emerald-200"
                    >
                      {leadStatus === 'sending' ? copy.followUpSending : copy.followUpAction}
                      {leadStatus === 'sending' ? (
                        <span className="h-4 w-4 rounded-full border-2 border-emerald-700/30 border-t-emerald-700 animate-spin dark:border-emerald-300/30 dark:border-t-emerald-300" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                    </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <label className="sr-only" htmlFor="bespaarcheck-chat-input">
                {copy.inputLabel}
              </label>
              <textarea
                id="bespaarcheck-chat-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage(input);
                  }
                }}
                rows={1}
                placeholder={copy.placeholder}
                className="min-h-[52px] max-h-32 flex-1 resize-none rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 px-4 py-3.5 text-base leading-6 text-gray-900 dark:text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:border-sky-500 dark:focus:ring-sky-950"
              />
              <button
                type="submit"
                disabled={!input.trim() || isThinking}
                className="h-[52px] w-[52px] rounded-lg bg-emerald-600 dark:bg-sky-600 text-white flex items-center justify-center transition-all hover:bg-emerald-700 dark:hover:bg-sky-500 hover:-translate-y-0.5 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                aria-label={copy.send}
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {!isOpen && (
        <>
          <button
            type="button"
            onClick={openChat}
            className={`pointer-events-auto fixed bottom-7 right-[100px] hidden w-[min(230px,calc(100vw-7rem))] rounded-lg border border-gray-100 bg-white px-4 py-3 text-left text-sm font-medium leading-5 text-gray-700 shadow-xl shadow-slate-900/10 transition-all duration-500 dark:border-slate-800 dark:bg-slate-950 dark:text-gray-200 dark:shadow-black/40 xl:block ${
              showNudge ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 pointer-events-none'
            }`}
            aria-hidden={!showNudge}
            tabIndex={showNudge ? 0 : -1}
          >
            {copy.nudge}
            <span className="absolute -right-1.5 bottom-5 h-3 w-3 rotate-45 border-r border-t border-gray-100 bg-white dark:border-slate-800 dark:bg-slate-950" />
          </button>

          <button
            type="button"
            onClick={openChat}
            className="pointer-events-auto group relative flex h-12 w-12 items-center justify-center rounded-full bg-white/95 dark:bg-slate-950/95 text-white border border-emerald-100 dark:border-slate-800 shadow-xl shadow-emerald-950/15 backdrop-blur dark:shadow-black/50 transition-all hover:-translate-y-0.5 sm:h-[68px] sm:w-[68px] sm:shadow-2xl"
            aria-label={copy.open}
          >
            <span className="absolute inset-0 rounded-full bg-emerald-300 dark:bg-sky-400 opacity-[0.18] animate-ping" />
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-lime-300 ring-[3px] ring-white dark:ring-slate-950 sm:h-4 sm:w-4 sm:ring-4" />
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-violet-500 dark:to-sky-500 shadow-inner sm:h-14 sm:w-14">
              <ChatFavicon className="h-6 w-6 drop-shadow-sm sm:h-9 sm:w-9" variant="white" />
            </span>
          </button>
        </>
      )}
    </div>
  );
}
