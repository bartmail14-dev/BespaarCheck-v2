const SERVER_PROMPT = `
Je bent Check, de digitale energieadviseur van BespaarCheck.
Je helpt Nederlandse MKB-bezoekers met energiebesparing, verduurzaming, wet- en regelgeving en de BespaarCheck-calculator.

Stijl:
- Nederlands, helder, professioneel en vriendelijk.
- Stel maximaal 1 gerichte vervolgvraag.
- Wees voorzichtig enthousiast als er kansen liggen, zonder hype of verkooppraat.
- Zeg duidelijk dat BespaarCheck gratis en geheel vrijblijvend is als kosten, aanvragen of vervolgstappen ter sprake komen.
- Geef geen juridisch advies; verwijs bij regelgeving naar officiele RVO-bronnen.
- Houd antwoorden kort genoeg voor een chatvenster.
`.trim();

const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const MAX_REQUEST_BYTES = 24_000;

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

function cleanMessages(messages) {
  if (!Array.isArray(messages)) return [];

  return messages
    .slice(-10)
    .filter((message) => message && (message.role === 'user' || message.role === 'assistant'))
    .map((message) => ({
      role: message.role,
      content: String(message.content || '').slice(0, 1200),
    }));
}

function extractText(data) {
  if (typeof data.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const firstText = data.output
    ?.flatMap((item) => item.content || [])
    ?.find((content) => typeof content.text === 'string')?.text;

  return typeof firstText === 'string' ? firstText.trim() : '';
}

function buildSystemPrompt(req) {
  const frontendPrompt = String(req.body?.system || '').slice(0, 6000);
  const context = String(req.body?.context || '').slice(0, 7000);

  return `${frontendPrompt || SERVER_PROMPT}\n\nWebsitekennis:\n${context}`;
}

async function requestOpenAI({ apiKey, model, systemPrompt, messages }) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_output_tokens: 650,
      input: [
        {
          role: 'developer',
          content: systemPrompt,
        },
        ...messages,
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      status: response.status,
      error: data.error?.message || 'OpenAI request failed',
    };
  }

  return { reply: extractText(data) };
}

function mapGeminiMessages(messages) {
  return messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }));
}

function extractGeminiText(data) {
  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();

  return typeof text === 'string' ? text : '';
}

async function requestGemini({ apiKey, model, systemPrompt, messages }) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: mapGeminiMessages(messages),
        generationConfig: {
          maxOutputTokens: 650,
          temperature: 0.55,
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

  return { reply: extractGeminiText(data) };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = getClientId(req);
  if (isRateLimited(clientId)) {
    return res.status(429).json({ error: 'Too many chat requests. Please try again shortly.' });
  }

  if (estimateRequestSize(req) > MAX_REQUEST_BYTES) {
    return res.status(413).json({ error: 'Chat request is too large' });
  }

  const provider = (process.env.CHAT_PROVIDER || 'openai').toLowerCase();
  const messages = cleanMessages(req.body?.messages);
  const systemPrompt = buildSystemPrompt(req);

  try {
    let result;

    if (provider === 'gemini' || provider === 'google') {
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: 'GEMINI_API_KEY is not configured' });
      }
      result = await requestGemini({
        apiKey,
        model: process.env.GEMINI_MODEL || 'gemini-2.5-pro',
        systemPrompt,
        messages,
      });
    } else {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: 'OPENAI_API_KEY is not configured' });
      }
      result = await requestOpenAI({
        apiKey,
        model: process.env.OPENAI_MODEL || 'gpt-5-mini',
        systemPrompt,
        messages,
      });
    }

    if (result.error) {
      return res.status(result.status || 502).json({ error: result.error });
    }

    if (!result.reply) {
      return res.status(502).json({ error: 'No text returned by model' });
    }

    return res.status(200).json({ reply: result.reply });
  } catch (error) {
    console.error('BespaarCheck chat error:', error);
    return res.status(500).json({ error: 'Chat request failed' });
  }
}
