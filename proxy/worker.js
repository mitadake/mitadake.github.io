// Cloudflare Worker: Ollama Cloud chat proxy
//
// Keeps OLLAMA_API_KEY server-side (as a Worker secret) so it is never shipped to
// the browser. The portfolio agent (agent.js) POSTs a chat request here; this
// Worker attaches the Authorization header and streams the Ollama Cloud response
// back with CORS headers.
//
// Deploy (see proxy/README-ish notes in chat):
//   cd proxy
//   npx wrangler secret put OLLAMA_API_KEY
//   npx wrangler deploy
//
// Local dev:
//   cp .dev.vars.example .dev.vars   # then edit it to add your key
//   npx wrangler dev

const OLLAMA_URL = 'https://ollama.com/api/chat';

// Only these models may be requested through the proxy (prevents someone from
// pointing your key at an expensive giant model).
const ALLOWED_MODELS = new Set(['gemma4:e4b', 'gemma4', 'gpt-oss:20b']);

// Origins allowed to call this proxy.
const DEFAULT_ALLOWED_ORIGINS = [
  'https://mitadake.github.io',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
];

function allowedOrigins(env) {
  if (env.ALLOWED_ORIGINS) {
    return env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return DEFAULT_ALLOWED_ORIGINS;
}

function corsHeaders(origin, env) {
  const origins = allowedOrigins(env);
  const allow = origins.includes(origin) ? origin : origins[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsHeaders(origin, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, cors);
    }
    if (!env.OLLAMA_API_KEY) {
      return json({ error: 'Proxy missing OLLAMA_API_KEY secret' }, 500, cors);
    }

    let payload;
    try {
      payload = await request.json();
    } catch (_) {
      return json({ error: 'Invalid JSON body' }, 400, cors);
    }

    const model = payload.model || 'gemma4';
    if (!ALLOWED_MODELS.has(model)) {
      return json({ error: `Model not allowed: ${model}` }, 400, cors);
    }

    if (!Array.isArray(payload.messages) || payload.messages.length === 0) {
      return json({ error: 'messages[] required' }, 400, cors);
    }

    // Rebuild the upstream body from vetted fields only.
    const upstreamBody = {
      model,
      messages: payload.messages,
      stream: payload.stream !== false,
      think: false,
      options: {
        temperature: clampNum(payload?.options?.temperature, 0, 2, 0.2),
        num_predict: clampNum(payload?.options?.num_predict, 1, 512, 256),
      },
    };

    let upstream;
    try {
      upstream = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OLLAMA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(upstreamBody),
      });
    } catch (err) {
      return json({ error: `Upstream fetch failed: ${err}` }, 502, cors);
    }

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      return json({ error: `Ollama error ${upstream.status}: ${detail}` }, upstream.status, cors);
    }

    // Stream the NDJSON response straight through.
    return new Response(upstream.body, {
      status: 200,
      headers: {
        ...cors,
        'Content-Type': upstream.headers.get('Content-Type') || 'application/x-ndjson',
        'Cache-Control': 'no-store',
      },
    });
  },
};

function clampNum(v, min, max, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}
