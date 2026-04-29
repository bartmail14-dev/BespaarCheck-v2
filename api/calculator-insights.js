const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const MAX_REQUEST_BYTES = 28_000;

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
          confidenceNote: 'This is an AI explanation of the calculator result, not financial or legal advice.',
        }
      : {
          summary: 'De berekening geeft een eerste richting. Een specialist kan de exacte haalbaarheid vrijblijvend controleren.',
          nextSteps: ['Controleer het actuele contract en jaarverbruik', 'Geef prioriteit aan de maatregel met de kortste terugverdientijd'],
          attentionPoints: ['De cijfers zijn indicatief en hangen af van het pand en de actuele tarieven'],
          confidenceNote: 'Dit is een AI-toelichting op de calculatoruitkomst, geen financieel of juridisch advies.',
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

You are adding the final AI explanation layer to a deterministic energy saving calculator. Do not change the numbers. Do not invent guarantees. Give practical interpretation only.

Return strict JSON with:
{
  "summary": "max 2 sentences",
  "nextSteps": ["2 or 3 practical next steps"],
  "attentionPoints": ["1 to 3 relevant checks or caveats"],
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
          maxOutputTokens: 700,
          temperature: 0.35,
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
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
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
