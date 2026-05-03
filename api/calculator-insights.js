const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const MAX_REQUEST_BYTES = 28_000;
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

function cleanText(value, maxLength = 1200) {
  return String(value || '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function normalizeInsight(data, language) {
  const fallback =
    language === 'en'
      ? {
          summary: 'The calculation gives a first direction. A specialist can check the exact feasibility without obligation.',
          nextSteps: ['Check the current contract and annual use', 'Prioritise the measure with the shortest payback time'],
          attentionPoints: ['Figures are indicative and depend on the building and current rates'],
          sanityLevel: 'review',
          sanitySummary: 'The outcome looks usable as an initial estimate, but the underlying assumptions should be checked before making decisions.',
          sanityChecks: ['Compare the savings percentage with the current annual energy costs', 'Check whether investment and payback time fit the selected measures'],
          confidenceNote: 'This is an indicative plausibility check of the calculator result, not financial or legal advice.',
        }
      : {
          summary: 'De berekening geeft een eerste richting. Een specialist kan de exacte haalbaarheid vrijblijvend controleren.',
          nextSteps: ['Controleer het actuele contract en jaarverbruik', 'Geef prioriteit aan de maatregel met de kortste terugverdientijd'],
          attentionPoints: ['De cijfers zijn indicatief en hangen af van het pand en de actuele tarieven'],
          sanityLevel: 'controleren',
          sanitySummary: 'De uitkomst is bruikbaar als eerste indicatie, maar de aannames moeten worden gecontroleerd voordat er beslissingen op worden gebaseerd.',
          sanityChecks: ['Vergelijk het besparingspercentage met de huidige jaarlijkse energiekosten', 'Controleer of investering en terugverdientijd passen bij de gekozen maatregelen'],
          confidenceNote: 'Dit is een indicatieve plausibiliteitscontrole van de calculatoruitkomst, geen financieel of juridisch advies.',
        };

  if (!data || typeof data !== 'object') return fallback;

  const cleanList = (value) =>
    Array.isArray(value)
      ? value.map((item) => cleanText(item, 180)).filter(Boolean).slice(0, 3)
      : [];

  return {
    summary: cleanText(data.summary, 360) || fallback.summary,
    nextSteps: cleanList(data.nextSteps).length ? cleanList(data.nextSteps) : fallback.nextSteps,
    attentionPoints: cleanList(data.attentionPoints).length
      ? cleanList(data.attentionPoints)
      : fallback.attentionPoints,
    sanityLevel: cleanText(data.sanityLevel, 80) || fallback.sanityLevel,
    sanitySummary: cleanText(data.sanitySummary, 420) || fallback.sanitySummary,
    sanityChecks: cleanList(data.sanityChecks).length ? cleanList(data.sanityChecks) : fallback.sanityChecks,
    confidenceNote: cleanText(data.confidenceNote, 260) || fallback.confidenceNote,
  };
}

function buildPrompt(body) {
  const language = body.language === 'en' ? 'en' : 'nl';
  const instruction =
    language === 'en'
      ? 'Write in English. Use sentence case. Do not use em dashes. Be clear, calm and lightly optimistic. Emphasise that BespaarCheck is non-binding and the visitor is not committed to anything.'
      : 'Schrijf in het Nederlands. Gebruik sentence case. Gebruik geen gedachtenstreepjes. Wees helder, rustig en licht positief. Benadruk dat BespaarCheck vrijblijvend is en dat de bezoeker nergens aan vast zit.';

  return `
${instruction}

You are adding a critical plausibility check to a deterministic energy saving calculator. Do not change the numbers. Do not invent guarantees.

Perform a strict sanity check before writing the explanation:
1. Check whether yearly savings are plausible compared with current annual costs.
2. Check whether total investment and payback period mathematically make sense.
3. Check whether recommendations fit the entered building type, energy use and existing installations.
4. Flag anything that seems optimistic, incomplete or dependent on missing data.
5. If the outcome looks plausible, say that calmly. If it needs review, explain what must be checked.
6. Recommendations with countsInTotals false are separate opportunities. Do not treat them as guaranteed savings or as part of the headline total.

Return strict JSON with:
{
  "summary": "max 2 sentences",
  "nextSteps": ["2 or 3 practical next steps"],
  "attentionPoints": ["1 to 3 relevant checks or caveats"],
  "sanityLevel": "one short label: plausible, review or caution",
  "sanitySummary": "critical sanity check summary in max 2 sentences",
  "sanityChecks": ["2 or 3 concrete plausibility checks or red flags"],
  "confidenceNote": "short note that the result is indicative"
}

Calculator input and output:
${JSON.stringify(body.calculation || {}, null, 2)}
`.trim();
}

function extractGeminiText(data) {
  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();

  return typeof text === 'string' ? text : '';
}

async function requestGemini({ apiKey, model, prompt }) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    return {
      status: response.status,
      error: data.error?.message || 'Gemini request failed',
    };
  }

  return { text: extractGeminiText(data) };
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
    return res.status(429).json({ error: 'Too many insight requests. Please try again shortly.' });
  }

  if (estimateRequestSize(req) > MAX_REQUEST_BYTES) {
    return res.status(413).json({ error: 'Insight request is too large' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'GEMINI_API_KEY is not configured' });
  }

  try {
    const language = req.body?.language === 'en' ? 'en' : 'nl';
    const result = await requestGemini({
      apiKey,
      model: process.env.GEMINI_CALCULATOR_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-pro',
      prompt: buildPrompt(req.body || {}),
    });

    if (result.error) {
      return res.status(result.status || 502).json({ error: result.error });
    }

    const parsed = safeJsonParse(result.text || '');
    return res.status(200).json({ insight: normalizeInsight(parsed, language) });
  } catch (error) {
    console.error('BespaarCheck calculator insight error:', error);
    return res.status(500).json({ error: 'Calculator insight request failed' });
  }
}
