const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const MAX_REQUEST_BYTES = 32_000;
const ALLOWED_ORIGINS = new Set([
  'https://bespaarcheck.net',
  'https://www.bespaarcheck.net',
  'https://bespaarcheck.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
]);

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function getClientId(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.socket?.remoteAddress || 'unknown';
}

function isRateLimited(clientId) {
  const now = Date.now();
  const current = rateLimitStore.get(clientId);

  if (!current || now - current.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(clientId, { count: 1, windowStart: now });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

function estimateRequestSize(req) {
  const length = Number(req.headers['content-length']);
  if (Number.isFinite(length) && length > 0) return length;

  try {
    return Buffer.byteLength(JSON.stringify(req.body || {}), 'utf8');
  } catch {
    return MAX_REQUEST_BYTES + 1;
  }
}

function cleanText(value, maxLength = 2400) {
  return String(value || '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function escapeHtml(value) {
  return cleanText(value, 8000)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));
}

function toHtmlBlock(title, lines) {
  const rows = lines
    .filter((line) => line.value)
    .map(
      (line) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#475569;font-weight:600;vertical-align:top;">${escapeHtml(line.label)}</td><td style="padding:6px 0;color:#0f172a;vertical-align:top;">${escapeHtml(line.value)}</td></tr>`
    )
    .join('');

  return `
    <h2 style="font-family:Arial,sans-serif;font-size:18px;color:#0f172a;margin:24px 0 8px;">${escapeHtml(title)}</h2>
    <table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse;">${rows}</table>
  `;
}

function formatConversation(messages) {
  if (!Array.isArray(messages)) return '';

  return messages
    .slice(-12)
    .map((message) => {
      const role = message?.role === 'assistant' ? 'Check' : 'Bezoeker';
      return `${role}: ${cleanText(message?.content, 1200)}`;
    })
    .filter(Boolean)
    .join('\n\n');
}

function buildEmail(payload) {
  const source = cleanText(payload.source, 80) || 'website';
  const language = payload.language === 'en' ? 'en' : 'nl';
  const contact = payload.contact || {};
  const report = payload.report || {};
  const conversation = formatConversation(payload.messages);
  const name = cleanText(contact.name, 160);
  const company = cleanText(contact.company, 160);
  const email = cleanText(contact.email, 240);
  const phone = cleanText(contact.phone, 80);
  const contactDetail = cleanText(contact.detail, 240);

  if (source === 'calculator' && (!name || !isValidEmail(email))) {
    return { error: 'Name and valid email are required' };
  }

  if (source === 'chatbot' && !contactDetail && !email && !phone) {
    return { error: 'Contact detail is required' };
  }

  const subject =
    source === 'chatbot'
      ? `BespaarCheck chatbot lead${contactDetail ? `: ${contactDetail}` : ''}`
      : `BespaarCheck aanvraag: ${company || name}`;

  const contactRows = [
    { label: 'Bron', value: source },
    { label: 'Taal', value: language },
    { label: 'Naam', value: name },
    { label: 'Bedrijf', value: company },
    { label: 'E-mail', value: email },
    { label: 'Telefoon of contactgegeven', value: phone || contactDetail },
  ];

  const reportRows = [
    { label: 'Bedrijfstype', value: report.businessType },
    { label: 'Pandgrootte', value: report.buildingSize },
    { label: 'Elektriciteit', value: report.electricityUsage },
    { label: 'Gas', value: report.gasUsage },
    { label: 'Contract', value: report.contractType },
    { label: 'Bestaande installaties', value: report.existingInstallations },
    { label: 'Prioriteiten', value: report.priorities },
    { label: 'Potentiele besparing', value: report.yearlySavings },
    { label: 'Geschatte investering', value: report.totalInvestment },
    { label: 'Terugverdientijd', value: report.paybackPeriod },
  ];

  const htmlBody = `
    <div style="font-family:Arial,sans-serif;max-width:720px;color:#0f172a;">
      <h1 style="font-size:22px;margin:0 0 12px;">Nieuwe vrijblijvende aanvraag via BespaarCheck</h1>
      <p style="font-size:14px;line-height:1.6;color:#475569;">
        Deze aanvraag is vrijblijvend. De bezoeker zit nergens aan vast en verwacht eerst rustig contact over de mogelijkheden.
      </p>
      ${toHtmlBlock('Contactgegevens', contactRows)}
      ${toHtmlBlock('Calculatorgegevens', reportRows)}
      ${
        conversation
          ? `<h2 style="font-family:Arial,sans-serif;font-size:18px;color:#0f172a;margin:24px 0 8px;">Chatgesprek</h2><pre style="white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#0f172a;">${escapeHtml(conversation)}</pre>`
          : ''
      }
    </div>
  `;

  const textBody = [
    'Nieuwe vrijblijvende aanvraag via BespaarCheck',
    '',
    'Deze aanvraag is vrijblijvend. De bezoeker zit nergens aan vast.',
    '',
    'Contactgegevens',
    ...contactRows.filter((row) => row.value).map((row) => `${row.label}: ${row.value}`),
    '',
    'Calculatorgegevens',
    ...reportRows.filter((row) => row.value).map((row) => `${row.label}: ${row.value}`),
    conversation ? `\nChatgesprek\n${conversation}` : '',
  ].join('\n');

  return {
    subject,
    htmlBody,
    textBody,
    replyTo: isValidEmail(email) ? email : undefined,
  };
}

async function sendPostmarkEmail(email) {
  const token = process.env.POSTMARK_SERVER_TOKEN;
  if (!token) {
    return { status: 503, error: 'POSTMARK_SERVER_TOKEN is not configured' };
  }

  const response = await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': token,
    },
    body: JSON.stringify({
      From: process.env.POSTMARK_FROM_EMAIL || 'analytics@comcamenergy.com',
      To: process.env.CONTACT_TO_EMAIL || 'ict@comcamenergy.com',
      Subject: email.subject,
      HtmlBody: email.htmlBody,
      TextBody: email.textBody,
      ReplyTo: email.replyTo,
      MessageStream: process.env.POSTMARK_MESSAGE_STREAM || 'outbound',
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      status: response.status,
      error: data.Message || data.ErrorCode || 'Postmark request failed',
    };
  }

  return { id: data.MessageID || null };
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = getClientId(req);
  if (isRateLimited(clientId)) {
    return res.status(429).json({ error: 'Too many contact requests. Please try again shortly.' });
  }

  if (estimateRequestSize(req) > MAX_REQUEST_BYTES) {
    return res.status(413).json({ error: 'Contact request is too large' });
  }

  if (req.body?.honeypot) {
    return res.status(200).json({ ok: true });
  }

  const email = buildEmail(req.body || {});
  if (email.error) {
    return res.status(400).json({ error: email.error });
  }

  const result = await sendPostmarkEmail(email);
  if (result.error) {
    return res.status(result.status || 502).json({ error: result.error });
  }

  return res.status(200).json({ ok: true, id: result.id });
}
