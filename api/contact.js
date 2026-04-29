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

function toDetailRows(lines) {
  const rows = lines
    .filter((line) => line.value)
    .map(
      (line) =>
        `<tr>
          <td style="padding:12px 16px;color:#64748b;font-weight:700;vertical-align:top;border-bottom:1px solid #e2e8f0;width:44%;">${escapeHtml(line.label)}</td>
          <td style="padding:12px 16px;color:#0f172a;vertical-align:top;border-bottom:1px solid #e2e8f0;">${escapeHtml(line.value)}</td>
        </tr>`
    )
    .join('');

  return rows.replace(/border-bottom:1px solid #e2e8f0;(?![\s\S]*border-bottom:1px solid #e2e8f0;)/, '');
}

function toSection(title, lines) {
  const rows = toDetailRows(lines);
  if (!rows) return '';

  return `
    <tr>
      <td style="padding:24px 30px 0;">
        <h2 style="margin:0 0 12px;font-size:19px;line-height:1.35;color:#0f172a;">${escapeHtml(title)}</h2>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;font-size:14px;line-height:1.5;">
          ${rows}
        </table>
      </td>
    </tr>
  `;
}

function toMetricCard(label, value, color, background, border) {
  if (!value) return '';

  return `
    <td class="metric-cell" style="padding:18px;border-radius:14px;background:${background};border:1px solid ${border};vertical-align:top;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:800;color:${color};text-transform:uppercase;letter-spacing:0.04em;">${escapeHtml(label)}</p>
      <p style="margin:0;font-size:25px;line-height:1.16;font-weight:900;color:${color};">${escapeHtml(value)}</p>
    </td>
  `;
}

function toReportSummary(summary) {
  const cleanSummary = cleanText(summary, 3000);
  if (!cleanSummary) return '';

  return `
    <tr>
      <td style="padding:24px 30px 0;">
        <h2 style="margin:0 0 12px;font-size:19px;line-height:1.35;color:#0f172a;">Samenvatting uit de calculator</h2>
        <pre style="margin:0;white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.65;color:#334155;">${escapeHtml(cleanSummary)}</pre>
      </td>
    </tr>
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

  if (source === 'calculator' && payload.privacyAccepted !== true) {
    return { error: 'Privacy statement acceptance is required' };
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

  const primaryMetric = report.yearlySavings || (source === 'chatbot' ? 'Chatbot lead' : 'Nieuwe aanvraag');
  const secondaryMetric = report.paybackPeriod || 'Vrijblijvend';
  const tertiaryMetric = report.totalInvestment || company || name || contactDetail || 'Opvolgen';

  const htmlBody = `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <style>
          @media only screen and (max-width: 620px) {
            .wrapper { padding: 16px 8px !important; }
            .container { border-radius: 12px !important; }
            .header, .content-pad { padding-left: 18px !important; padding-right: 18px !important; }
            .metric-table, .metric-table tbody, .metric-table tr, .metric-cell { display: block !important; width: 100% !important; box-sizing: border-box !important; }
            .metric-spacer { display: none !important; }
            .metric-cell { margin-bottom: 10px !important; }
            h1 { font-size: 24px !important; }
          }
        </style>
      </head>
      <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <div style="display:none;max-height:0;overflow:hidden;color:transparent;opacity:0;">
          Nieuwe vrijblijvende aanvraag via BespaarCheck. Rustig opvolgen, nergens aan vast.
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="wrapper" style="background:#f1f5f9;padding:28px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="container" style="max-width:740px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dbe4ee;box-shadow:0 18px 48px rgba(15,23,42,0.10);">
                <tr>
                  <td class="header" style="background:#006fba;padding:28px 30px;color:#ffffff;">
                    <div style="display:inline-block;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.28);border-radius:999px;padding:7px 12px;font-size:13px;font-weight:800;">BespaarCheck</div>
                    <h1 style="margin:18px 0 8px;font-size:28px;line-height:1.18;font-weight:900;color:#ffffff;">Nieuwe vrijblijvende aanvraag</h1>
                    <p style="margin:0;font-size:15px;line-height:1.7;color:#e0f2fe;">Een bezoeker wil rustig contact over energiebesparing, verduurzaming of regelgeving. De aanvraag is vrijblijvend en verplicht tot niets.</p>
                  </td>
                </tr>
                <tr>
                  <td class="content-pad" style="padding:24px 30px 4px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="metric-table">
                      <tr>
                        ${toMetricCard(source === 'chatbot' ? 'Leadtype' : 'Potentiele besparing', primaryMetric, '#065f46', '#ecfdf5', '#bbf7d0')}
                        <td class="metric-spacer" width="12"></td>
                        ${toMetricCard(source === 'chatbot' ? 'Status' : 'Terugverdientijd', secondaryMetric, '#1e3a8a', '#eff6ff', '#bfdbfe')}
                        <td class="metric-spacer" width="12"></td>
                        ${toMetricCard(source === 'chatbot' ? 'Contact' : 'Investering', tertiaryMetric, '#6d28d9', '#f5f3ff', '#ddd6fe')}
                      </tr>
                    </table>
                  </td>
                </tr>
                ${toSection('Contactgegevens', contactRows)}
                ${toSection('Calculatorgegevens', reportRows)}
                ${toReportSummary(report.summary)}
                ${
                  conversation
                    ? `<tr><td style="padding:24px 30px 0;"><h2 style="margin:0 0 12px;font-size:19px;line-height:1.35;color:#0f172a;">Chatgesprek</h2><pre style="margin:0;white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.65;color:#334155;">${escapeHtml(conversation)}</pre></td></tr>`
                    : ''
                }
                <tr>
                  <td class="content-pad" style="padding:24px 30px 30px;">
                    <div style="padding:18px 20px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0;color:#475569;font-size:14px;line-height:1.7;">
                      <strong style="display:block;color:#0f172a;margin-bottom:4px;">Vrijblijvend opvolgen</strong>
                      Neem rustig contact op om de mogelijkheden te bespreken. Er wordt niets automatisch gestart, er is geen overeenkomst en de bezoeker zit nergens aan vast.
                    </div>
                    <p style="margin:18px 0 0;text-align:center;font-size:12px;color:#94a3b8;">bespaarcheck.net</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
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

function buildVisitorReportEmail(payload) {
  const contact = payload.contact || {};
  const report = payload.report || {};
  const name = cleanText(contact.name, 160);
  const email = cleanText(contact.email, 240);

  if (!isValidEmail(email)) {
    return { error: 'Valid recipient email is required' };
  }

  const recommendations = Array.isArray(report.recommendations) ? report.recommendations : [];
  const recommendationRows = recommendations.length
    ? recommendations
        .map(
          (rec) => `
            <tr>
              <td style="padding:13px 16px;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:800;">${escapeHtml(rec.name)}</td>
              <td style="padding:13px 16px;border-bottom:1px solid #e2e8f0;color:#047857;font-weight:800;text-align:right;">${escapeHtml(rec.yearlySavings)}</td>
            </tr>`
        )
        .join('')
    : `<tr><td style="padding:14px 16px;color:#475569;">Geen directe standaardmaatregelen gevonden op basis van de invoer.</td></tr>`;

  const insight = report.insight || {};
  const sanityChecks = Array.isArray(insight.sanityChecks) ? insight.sanityChecks : [];
  const sanityHtml = insight.sanitySummary
    ? `
      <tr>
        <td style="padding:24px 30px 0;">
          <div style="border:1px solid #bae6fd;background:#f0f9ff;border-radius:14px;padding:18px;">
            <h2 style="margin:0 0 8px;font-size:18px;color:#0f172a;">Kritische controle</h2>
            <p style="margin:0;color:#334155;font-size:14px;line-height:1.65;">${escapeHtml(insight.sanitySummary)}</p>
            ${
              sanityChecks.length
                ? `<ul style="margin:12px 0 0;padding-left:18px;color:#334155;font-size:14px;line-height:1.65;">${sanityChecks.map((check) => `<li>${escapeHtml(check)}</li>`).join('')}</ul>`
                : ''
            }
          </div>
        </td>
      </tr>`
    : '';

  const htmlBody = `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <style>
          @media only screen and (max-width: 620px) {
            .wrapper { padding: 16px 8px !important; }
            .container { border-radius: 12px !important; }
            .header, .content-pad { padding-left: 18px !important; padding-right: 18px !important; }
            .metric-table, .metric-table tbody, .metric-table tr, .metric-cell { display: block !important; width: 100% !important; box-sizing: border-box !important; }
            .metric-spacer { display: none !important; }
            .metric-cell { margin-bottom: 10px !important; }
            h1 { font-size: 24px !important; }
          }
        </style>
      </head>
      <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <div style="display:none;max-height:0;overflow:hidden;color:transparent;opacity:0;">
          Uw vrijblijvende BespaarCheck rapport staat klaar.
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="wrapper" style="background:#f1f5f9;padding:28px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="container" style="max-width:740px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dbe4ee;box-shadow:0 18px 48px rgba(15,23,42,0.10);">
                <tr>
                  <td class="header" style="background:#006fba;padding:28px 30px;color:#ffffff;">
                    <div style="display:inline-block;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.28);border-radius:999px;padding:7px 12px;font-size:13px;font-weight:800;">BespaarCheck</div>
                    <h1 style="margin:18px 0 8px;font-size:28px;line-height:1.18;font-weight:900;color:#ffffff;">Uw indicatieve besparingsrapport</h1>
                    <p style="margin:0;font-size:15px;line-height:1.7;color:#e0f2fe;">${name ? `Beste ${escapeHtml(name)}, ` : ''}hieronder vindt u de uitkomst van uw BespaarCheck. Alles is vrijblijvend en verplicht u tot niets.</p>
                  </td>
                </tr>
                <tr>
                  <td class="content-pad" style="padding:24px 30px 4px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="metric-table">
                      <tr>
                        ${toMetricCard('Potentiele besparing', report.yearlySavings, '#065f46', '#ecfdf5', '#bbf7d0')}
                        <td class="metric-spacer" width="12"></td>
                        ${toMetricCard('Terugverdientijd', report.paybackPeriod, '#1e3a8a', '#eff6ff', '#bfdbfe')}
                        <td class="metric-spacer" width="12"></td>
                        ${toMetricCard('Investering', report.totalInvestment, '#6d28d9', '#f5f3ff', '#ddd6fe')}
                      </tr>
                    </table>
                  </td>
                </tr>
                ${toSection('Uw invoer', [
                  { label: 'Bedrijfstype', value: report.businessType },
                  { label: 'Pandgrootte', value: report.buildingSize },
                  { label: 'Elektriciteit', value: report.electricityUsage },
                  { label: 'Gas', value: report.gasUsage },
                  { label: 'Contract', value: report.contractType },
                  { label: 'Bestaande installaties', value: report.existingInstallations },
                  { label: 'Prioriteiten', value: report.priorities },
                ])}
                <tr>
                  <td style="padding:24px 30px 0;">
                    <h2 style="margin:0 0 12px;font-size:19px;line-height:1.35;color:#0f172a;">Aanbevolen maatregelen</h2>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;font-size:14px;line-height:1.5;">
                      ${recommendationRows}
                    </table>
                  </td>
                </tr>
                ${sanityHtml}
                <tr>
                  <td class="content-pad" style="padding:24px 30px 30px;">
                    <div style="padding:18px 20px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0;color:#475569;font-size:14px;line-height:1.7;">
                      <strong style="display:block;color:#0f172a;margin-bottom:4px;">Volledig vrijblijvend</strong>
                      Dit rapport is indicatief. Er wordt niets automatisch gestart, er is geen overeenkomst en u zit nergens aan vast.
                    </div>
                    <p style="margin:18px 0 0;text-align:center;font-size:12px;color:#94a3b8;">bespaarcheck.net</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const textBody = [
    'Uw indicatieve BespaarCheck rapport',
    '',
    'Alles is vrijblijvend. U zit nergens aan vast.',
    '',
    `Potentiele besparing: ${cleanText(report.yearlySavings)}`,
    `Terugverdientijd: ${cleanText(report.paybackPeriod)}`,
    `Investering: ${cleanText(report.totalInvestment)}`,
    '',
    cleanText(report.summary, 4000),
  ].join('\n');

  return {
    to: email,
    subject: 'Uw vrijblijvende BespaarCheck rapport',
    htmlBody,
    textBody,
  };
}

async function sendPostmarkEmail(email, toOverride) {
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
      From: process.env.POSTMARK_FROM_EMAIL || 'info@bespaarcheck.net',
      To: toOverride || process.env.CONTACT_TO_EMAIL || 'ict@comcamenergy.com',
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

  if ((req.body || {}).source === 'calculator') {
    const visitorEmail = buildVisitorReportEmail(req.body || {});
    if (visitorEmail.error) {
      return res.status(400).json({ error: visitorEmail.error });
    }

    const visitorResult = await sendPostmarkEmail(visitorEmail, visitorEmail.to);
    if (visitorResult.error) {
      return res.status(visitorResult.status || 502).json({ error: visitorResult.error });
    }
  }

  return res.status(200).json({ ok: true, id: result.id });
}
