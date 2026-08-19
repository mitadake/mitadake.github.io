// ─────────────────────────────────────────────────────────────────────────────
// Portfolio AI agent
//
// Architecture (see README notes / build scripts):
//   • Knowledge base lives in kb.json (data only, single source of truth).
//   • kb-embeddings.json holds precomputed embeddings (built offline via
//     scripts/build-embeddings.mjs) so we never re-embed the whole KB in-browser.
//   • At runtime we embed ONLY the user's query in-browser with the same small
//     model (bge-small) used offline, so vectors share one space.
//   • Retrieval is hybrid: vector cosine + lexical keyword overlap.
//   • Answer generation runs on Ollama Cloud (gemma4), called through a small
//     serverless proxy that holds the API key as a secret (never shipped to the
//     browser). If no proxy is configured, we fall back to the retrieved answer.
// ─────────────────────────────────────────────────────────────────────────────

// ── Config ──────────────────────────────────────────────────────────────────
// Point this at your deployed proxy (Cloudflare Worker, etc.). The proxy adds the
// Authorization header and forwards to https://ollama.com/api/chat. Leave as the
// placeholder to run in retrieval-only mode (no cloud generation).
const AGENT_PROXY_URL =
  (typeof window !== 'undefined' && window.AGENT_PROXY_URL) ||
  'https://YOUR-WORKER-SUBDOMAIN.workers.dev/api/chat';

const CHAT_MODEL =
  (typeof window !== 'undefined' && window.AGENT_CHAT_MODEL) || 'gemma4:e4b';

const EMBED_MODEL = 'Xenova/bge-small-en-v1.5';
const EMBED_DTYPE = 'q8';
const MAX_OUTPUT_TOKENS = 256;

// Retrieval tuning.
const TOP_K = 4;
const VECTOR_WEIGHT = 0.65;
const LEXICAL_WEIGHT = 0.35;
const RELEVANCE_THRESHOLD = 0.2;

// High-confidence intent rules: map phrasing to the best KB entry index.
// Checked before hybrid retrieval so follow-up chips and paraphrases hit the right answer.
const INTENT_RULES = [
  {
    re: /other\s+fedex\s+roles|all\s+(of\s+)?(his\s+)?fedex\s+roles|fedex\s+roles\s+(did|has)|tell\s+me\s+about\s+(the\s+)?fedex\s+roles|what\s+fedex\s+roles|how\s+many\s+times.*fedex|fedex\s+positions|roles\s+at\s+fedex/i,
    idx: 4,
    viewId: 'exp-fedex-analyst',
  },
  {
    re: /\b(ml|machine\s+learning|ai|technical|tech)\s+skills\b|\bwhat\s+(are\s+)?(his|mitesh'?s?)\s+(key\s+)?skills\b|\bskills\s+does\s+he\b|\btoolkit\b|\btech\s+stack\b/i,
    idx: 11,
    viewId: 'edu-ms',
  },
  {
    re: /\bnlp\s+skills\b|natural\s+language\s+processing\s+(skills|work|experience)/i,
    idx: 25,
    viewId: 'proj-tokengen',
  },
  {
    re: /what\s+is\s+mitesh'?s?\s+experience|work\s+experience|professional\s+background|job\s+history|career/i,
    idx: 5,
    viewId: 'exp-fedex-analyst',
  },
  {
    re: /who\s+is\s+mitesh|tell\s+me\s+about\s+mitesh\b|about\s+him\b/i,
    idx: 24,
    viewId: 'exp-fedex-analyst',
  },
  {
    re: /what\s+is\s+mitesh\s+doing|current\s+role|right\s+now|what\s+does\s+he\s+do\s+now/i,
    idx: 0,
    viewId: 'exp-fedex-analyst',
  },
  {
    re: /what\s+is\s+(his|mitesh'?s?)\s+education|where\s+did\s+he\s+study|educational\s+background/i,
    idx: 10,
    viewId: 'edu-ms',
  },
  {
    re: /what\s+projects|projects\s+has\s+he\s+built|portfolio/i,
    idx: 19,
    viewId: 'section-projects',
  },
];

const CALL_SCHEDULING_URL = 'https://calendly.com/miteshadake';
const CALL_INTENT_PATTERN = /\b(schedule|book|set up|setup|arrange)\b.*\b(call|meeting|chat)\b|\bcall\b.*\b(schedule|book|meeting)\b/i;
const RESUME_PATH = 'assets/Resume__Mitesh__Adake.pdf';
const RESUME_URL = typeof window !== 'undefined'
  ? new URL(RESUME_PATH, window.location.href).href
  : RESUME_PATH;
const RESUME_INTENT_PATTERN = /\b(cv|resume|curriculum\s+vitae)\b|where\s+.*\bresume\b|resume\s+where|download\s+.*\b(cv|resume)\b/i;

const SYSTEM_PROMPT = 'You are a concise portfolio assistant for Mitesh Adake. Answer questions using ONLY the provided context. If the context distinguishes where work was done (for example USC graduate work vs PICT undergraduate work), keep that distinction exactly -- do not say Phishing Detection or Object Detection were USC projects if the context says they were at PICT. If the context does not contain relevant information, say you are not sure. Keep responses brief (2-3 sentences max). Do not make up information. Do not use markdown formatting.';

const DEFAULT_CHIPS = [
  "What is Mitesh's experience?",
  "Tell me about the FedEx roles",
  "Show me his education",
  "What projects has he built?",
  "Schedule a call with Mitesh",
  "Resume"
];

function cloudGenerationEnabled() {
  return typeof AGENT_PROXY_URL === 'string' && !AGENT_PROXY_URL.includes('YOUR-WORKER');
}

// ── State ───────────────────────────────────────────────────────────────────
let KB = [];
let kbEmbeddings = null; // array aligned to KB: number[][]
let extractor = null;
let transformersLib = null;
/** One shared init chain (load data + embedder), started on page load. */
let initPromise = null;
/** Model/data load status lines; flushed into the chat when the panel is open. */
const modelStatusQueue = [];

function queueModelStatus(html) {
  modelStatusQueue.push(html);
  flushModelStatusQueue();
}

function flushModelStatusQueue() {
  if (!panelOpen) return;
  while (modelStatusQueue.length) {
    addBotMessage(modelStatusQueue.shift());
  }
}

// ── Vector helpers ────────────────────────────────────────────────────────────
function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}
function norm(a) { return Math.sqrt(dot(a, a)); }
function cosine(a, b) { return dot(a, b) / (norm(a) * norm(b) + 1e-8); }

async function embed(text) {
  const out = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(out.data);
}

// ── Lexical helpers (keyword overlap component of hybrid retrieval) ───────────
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'at', 'for', 'is', 'are',
  'was', 'were', 'be', 'been', 'his', 'her', 'he', 'she', 'him', 'me', 'my', 'i',
  'you', 'your', 'it', 'its', 'about', 'what', 'who', 'when', 'where', 'how', 'did',
  'does', 'do', 'has', 'have', 'had', 'tell', 'show', 'with', 'that', 'this', 'them',
  'from', 'more', 'any', 'all', 'can', 'could', 'would', 'should'
]);

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z0-9.+#]+/g) || []).filter(
    (t) => t.length > 1 && !STOPWORDS.has(t)
  );
}

let kbTokenSets = null;
function ensureKbTokenSets() {
  if (kbTokenSets) return;
  kbTokenSets = KB.map((entry) => new Set(tokenize(`${entry.text} ${entry.answer}`)));
}

function lexicalScore(queryTokens, idx) {
  if (!queryTokens.length) return 0;
  const set = kbTokenSets[idx];
  let hits = 0;
  for (const t of queryTokens) if (set.has(t)) hits++;
  return hits / queryTokens.length;
}

/** Exact follow-up chip text -> KB index (built once KB is loaded). */
let followUpIndex = null;
function buildFollowUpIndex() {
  if (followUpIndex) return;
  followUpIndex = new Map();
  const targets = {
    'What other FedEx roles did he have?': 4,
    'Tell me about the FedEx roles': 4,
    'Tell me about his ML skills': 11,
    'What ML skills does he use?': 11,
    'What are his skills?': 11,
    'What are his key skills?': 11,
    'What is his experience?': 5,
    "What is Mitesh's experience?": 5,
    'Show me his education': 10,
    'What NLP skills does he have?': 25,
    'Tell me about his NLP skills': 25,
  };
  const viewByIdx = {
    0: 'exp-fedex-analyst',
    4: 'exp-fedex-analyst',
    5: 'exp-fedex-analyst',
    10: 'edu-ms',
    11: 'edu-ms',
    19: 'section-projects',
    24: 'exp-fedex-analyst',
    25: 'proj-tokengen',
  };
  for (const [phrase, idx] of Object.entries(targets)) {
    followUpIndex.set(phrase.toLowerCase(), { idx, viewId: viewByIdx[idx] ?? null });
  }
}

function matchIntent(query) {
  buildFollowUpIndex();
  const exact = followUpIndex.get(query.trim().toLowerCase());
  if (exact) return { ...exact, source: 'followup' };

  for (const rule of INTENT_RULES) {
    if (rule.re.test(query)) return { idx: rule.idx, viewId: rule.viewId, source: 'intent' };
  }
  return null;
}

/** Hybrid retrieval with optional intent boost on a specific entry. */
function retrieve(queryVec, queryText, topK = TOP_K, intentIdx = null) {
  ensureKbTokenSets();
  const queryTokens = tokenize(queryText);
  const scored = kbEmbeddings.map((vec, i) => {
    const cos = cosine(queryVec, vec);
    const lex = lexicalScore(queryTokens, i);
    let score = VECTOR_WEIGHT * cos + LEXICAL_WEIGHT * lex;
    if (intentIdx === i) score += 0.35; // strong boost for matched intent
    return { i, cos, lex, score };
  });
  scored.sort((a, b) => b.score - a.score);

  // If intent matched, pin that entry at the top when it's reasonably relevant.
  if (intentIdx != null) {
    const pinned = scored.find((r) => r.i === intentIdx);
    if (pinned && pinned.cos >= RELEVANCE_THRESHOLD * 0.85) {
      const rest = scored.filter((r) => r.i !== intentIdx);
      return [pinned, ...rest].slice(0, topK);
    }
  }
  return scored.slice(0, topK);
}

/** Pick scroll target; intent viewId takes precedence over regex heuristics. */
function pickViewSectionId(query, results, intent) {
  if (intent?.viewId) return intent.viewId;

  const above = results.filter((r) => r.cos >= RELEVANCE_THRESHOLD);
  if (!above.length) return KB[results[0].i].id;

  const hasId = (id) => above.some((r) => KB[r.i].id === id);

  const rules = [
    { re: /\bNICE\b|at\s+nice\b|nice\s+intern|nice\s+data|data\s+engineer.*\bnice\b|serverless.*\bnice\b|\bnice\b.*(intern|data\s+engineer|aws|lambda|pune|mongodb|dynamo)/i, id: 'exp-nice' },
    { re: /\bpersistent\b/i, id: 'exp-persistent' },
    { re: /(fedex|fed\s+ex).*(summer|memphis)|summer.*(fedex|fed\s+ex)/i, id: 'exp-fedex-summer' },
    { re: /(fedex|fed\s+ex).*(hyderabad|software\s+engineer)|hyderabad.*(fedex|fed\s+ex)/i, id: 'exp-fedex-swe' },
    { re: /other\s+fedex\s+roles|all\s+fedex\s+roles|fedex\s+roles|roles\s+at\s+fedex/i, id: 'exp-fedex-analyst' },
    { re: /analyst|revenue\s+science|current\s+role|right\s+now|plano/i, id: 'exp-fedex-analyst' },
    { re: /\b(ml|machine\s+learning|technical|tech)\s+skills\b|\bskills\b/i, id: 'edu-ms' },
    { re: /\bfedex\b|fed\s+ex/i, id: 'exp-fedex-intern' },
    { re: /(usc|viterbi).*\bproject|\bproject.*(usc|viterbi)|projects.*at\s+usc|projects did he build at usc/i, id: 'section-projects' },
    { re: /\busc\b|viterbi|(\bms\b|\bm\.s\.|master).*computer|graduate.*usc|usc.*(master|graduate|\bcs\b)/i, id: 'edu-ms' },
    { re: /\bpict\b|undergraduate|bachelor|\bb\.e\.|pune institute of computer/i, id: 'edu-be' },
    { re: /tokengen|token gen/i, id: 'proj-tokengen' },
    { re: /hate speech|unlearning|llama\s*3/i, id: 'proj-hate-speech' },
    { re: /anytoken|any token/i, id: 'proj-anytoken' },
    { re: /pricenet|stock price/i, id: 'proj-pricenet' },
    { re: /phishing|edge extension|browser extension/i, id: 'proj-phishing' },
    { re: /object detection|computer vision project/i, id: 'proj-objdet' },
    { re: /\btalk\b|qiskit|ieee|quantum cryptography|presentation|youtube.*quantum/i, id: 'section-talks' },
    { re: /community|hackathon|mentor|qiskit advocate/i, id: 'section-community' },
    { re: /chess|kaggle|football|soccer|hobby|hobbies|1685|us chess|interest/i, id: 'section-interests' },
    { re: /what projects|portfolio|side project|projects has he/i, id: 'section-projects' },
  ];

  for (const { re, id } of rules) {
    if (!re.test(query)) continue;
    if (hasId(id)) return id;
    if (id === 'section-interests' && /chess|kaggle|football|soccer|hobby|1685|interest|hobbies/i.test(query)) {
      return id;
    }
  }

  return KB[above[0].i].id;
}

// ── Page Actions ────────────────────────────────────────────────────────────
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const card = el.querySelector('.theme-card') || el;
  card.classList.remove('agent-highlight');
  void card.offsetWidth;
  card.classList.add('agent-highlight');
  setTimeout(() => card.classList.remove('agent-highlight'), 3500);
}

// ── UI Bindings ─────────────────────────────────────────────────────────────
const fab = document.getElementById('agent-fab');
const fabHint = document.getElementById('agent-fab-hint');
const fabHintTip = document.getElementById('agent-fab-hint-tip');
const fabWrap = document.getElementById('agent-fab-wrap');
const panel = document.getElementById('agent-panel');

const HINT_TIP_ROTATION = [
  'Ask about Mitesh, his resume, or book a call.',
  'Try a suggested question, or type your own.',
  'Questions about experience, projects, or education welcome.'
];
let hintTipInterval = null;
const closeBtn = document.getElementById('agent-close');
const msgArea = document.getElementById('agent-messages');
const chipsArea = document.getElementById('agent-chips');
const input = document.getElementById('agent-input');
const sendBtn = document.getElementById('agent-send');

let panelOpen = false;
let firstOpen = true;

function setPanelAriaExpanded(open) {
  const v = open ? 'true' : 'false';
  if (fab) fab.setAttribute('aria-expanded', v);
  if (fabHint) fabHint.setAttribute('aria-expanded', v);
}

function stopHintTipRotation() {
  if (hintTipInterval) {
    clearInterval(hintTipInterval);
    hintTipInterval = null;
  }
}

function startHintTipRotation() {
  if (!fabHintTip || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let idx = 0;
  hintTipInterval = setInterval(() => {
    if (!fabWrap || fabWrap.classList.contains('agent-fab-hint-dismissed')) {
      stopHintTipRotation();
      return;
    }
    idx = (idx + 1) % HINT_TIP_ROTATION.length;
    fabHintTip.style.opacity = '0.5';
    setTimeout(() => {
      fabHintTip.textContent = HINT_TIP_ROTATION[idx];
      fabHintTip.style.opacity = '1';
    }, 220);
  }, 5200);
}

function togglePanel() {
  panelOpen = !panelOpen;
  panel.classList.toggle('open', panelOpen);
  setPanelAriaExpanded(panelOpen);
  if (panelOpen && fabWrap) {
    fabWrap.classList.add('agent-fab-hint-dismissed');
    stopHintTipRotation();
  }
  if (panelOpen && firstOpen) {
    firstOpen = false;
    addBotMessage('Hi! Ask me anything about Mitesh\'s experience, skills, projects, or education.');
    showChips(DEFAULT_CHIPS);
    flushModelStatusQueue();
  } else if (panelOpen) {
    flushModelStatusQueue();
  }
}

fab.addEventListener('click', togglePanel);
if (fabHint) fabHint.addEventListener('click', togglePanel);
closeBtn.addEventListener('click', togglePanel);

setPanelAriaExpanded(false);
startHintTipRotation();

function addBotMessage(html, sectionId) {
  const div = document.createElement('div');
  div.className = 'agent-msg bot';
  let content = html;
  if (sectionId) {
    content += `<span class="view-link" data-section="${sectionId}">View on page &rarr;</span>`;
  }
  div.innerHTML = content;
  msgArea.appendChild(div);

  const link = div.querySelector('.view-link');
  if (link) {
    link.addEventListener('click', () => scrollToSection(link.dataset.section));
  }

  msgArea.scrollTop = msgArea.scrollHeight;
}

function addUserMessage(text) {
  const div = document.createElement('div');
  div.className = 'agent-msg user';
  div.textContent = text;
  msgArea.appendChild(div);
  msgArea.scrollTop = msgArea.scrollHeight;
}

function showChips(chips) {
  chipsArea.innerHTML = '';
  chips.forEach(text => {
    const btn = document.createElement('button');
    btn.className = 'agent-chip';
    btn.textContent = text;
    btn.addEventListener('click', () => handleQuery(text));
    chipsArea.appendChild(btn);
  });
}

function addLoadingIndicator() {
  const div = document.createElement('div');
  div.className = 'agent-msg bot';
  div.id = 'agent-loading';
  div.innerHTML = '<i class="fas fa-circle-notch fa-spin" style="margin-right:6px"></i>Thinking...';
  msgArea.appendChild(div);
  msgArea.scrollTop = msgArea.scrollHeight;
}

function removeLoadingIndicator() {
  const el = document.getElementById('agent-loading');
  if (el) el.remove();
}

// ── Init: load KB + embeddings + query embedder ───────────────────────────────
async function _init() {
  const [kbRes, embRes] = await Promise.all([
    fetch(new URL('kb.json', document.baseURI)),
    fetch(new URL('kb-embeddings.json', document.baseURI)),
  ]);
  if (!kbRes.ok || !embRes.ok) throw new Error('Failed to load knowledge base files');
  KB = await kbRes.json();
  const emb = await embRes.json();

  // Vectors are stored in the same order as kb.json (KB ids are intentionally
  // non-unique — they map to page sections — so we align by index, not id).
  if (!emb.vectors || emb.vectors.length !== KB.length) {
    throw new Error('kb-embeddings.json is out of sync with kb.json; rebuild embeddings');
  }
  kbEmbeddings = KB.map((entry, i) => {
    const v = emb.vectors[i];
    if (v.id && v.id !== entry.id) {
      console.warn(`Embedding/KB id mismatch at index ${i}: ${v.id} vs ${entry.id}`);
    }
    return v.vector;
  });

  transformersLib = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.0.1');
  const { pipeline } = transformersLib;
  extractor = await pipeline('feature-extraction', EMBED_MODEL, { dtype: EMBED_DTYPE });
}

function beginInit() {
  if (initPromise) return initPromise;
  initPromise = _init().catch((err) => {
    initPromise = null;
    queueModelStatus('Failed to load the assistant. Try refreshing the page.');
    flushModelStatusQueue();
    console.error('Agent init error:', err);
    throw err;
  });
  return initPromise;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => beginInit().catch(() => {}));
} else {
  beginInit().catch(() => {});
}

// ── Streaming bot message helper ──────────────────────────────────────────────
function addStreamingBotMessage() {
  const div = document.createElement('div');
  div.className = 'agent-msg bot';
  div.textContent = '';
  msgArea.appendChild(div);
  msgArea.scrollTop = msgArea.scrollHeight;

  return {
    element: div,
    append(text) {
      div.textContent += text;
      msgArea.scrollTop = msgArea.scrollHeight;
    },
    finish(sectionId) {
      if (sectionId) {
        const link = document.createElement('span');
        link.className = 'view-link';
        link.dataset.section = sectionId;
        link.innerHTML = 'View on page &rarr;';
        link.addEventListener('click', () => scrollToSection(sectionId));
        div.appendChild(document.createElement('br'));
        div.appendChild(link);
      }
      msgArea.scrollTop = msgArea.scrollHeight;
    },
  };
}

// ── Cloud generation via proxy (Ollama Cloud /api/chat, NDJSON stream) ─────────
async function generateWithCloud(query, retrievedEntries) {
  const contextBlock = retrievedEntries
    .map((entry, i) => `[${i + 1}] ${entry.answer}`)
    .join('\n');

  const body = {
    model: CHAT_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Context:\n${contextBlock}\n\nQuestion: ${query}` },
    ],
    stream: true,
    think: false,
    options: { temperature: 0.2, num_predict: MAX_OUTPUT_TOKENS },
  };

  const res = await fetch(AGENT_PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) {
    throw new Error(`Proxy responded ${res.status}`);
  }

  const stream = addStreamingBotMessage();
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let got = false;

  const handleLine = (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let obj;
    try { obj = JSON.parse(trimmed); } catch (_) { return; }
    if (obj.error) throw new Error(obj.error);
    const piece = obj.message && obj.message.content;
    if (piece) {
      got = true;
      stream.append(piece);
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl;
    while ((nl = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, nl);
      buffer = buffer.slice(nl + 1);
      handleLine(line);
    }
  }
  if (buffer.trim()) handleLine(buffer);

  if (!got) throw new Error('Empty response from model');
  return stream;
}

// ── Query Handling ──────────────────────────────────────────────────────────
async function handleQuery(text) {
  if (!text.trim()) return;

  addUserMessage(text);
  chipsArea.innerHTML = '';
  input.value = '';

  if (CALL_INTENT_PATTERN.test(text)) {
    addBotMessage(
      `Absolutely - you can schedule a call here: <a href="${CALL_SCHEDULING_URL}" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline hover:text-blue-300">Schedule a call</a>. You can also message on <a href="https://www.linkedin.com/in/mitesh-adake/" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline hover:text-blue-300">LinkedIn</a>.`
    );
    showChips(['What is his experience?', 'What projects has he built?', 'What NLP skills does he have?']);
    return;
  }

  if (RESUME_INTENT_PATTERN.test(text)) {
    addBotMessage(
      `Here is Mitesh\'s resume (PDF): <a href="${RESUME_URL}" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline hover:text-blue-300">Open resume</a>.`
    );
    showChips(['What is his experience?', 'Schedule a call with Mitesh', 'What projects has he built?']);
    return;
  }

  addLoadingIndicator();

  try {
    await beginInit();
  } catch (_) {
    removeLoadingIndicator();
    addBotMessage('Failed to initialize the assistant. Please try refreshing the page.');
    return;
  }

  if (!extractor || !kbEmbeddings) {
    removeLoadingIndicator();
    addBotMessage('The assistant is still loading. Please wait a moment and try again.');
    return;
  }

  try {
    const intent = matchIntent(text);
    const queryVec = await embed(text);
    const results = retrieve(queryVec, text, TOP_K, intent?.idx ?? null);
    removeLoadingIndicator();

    const best = results[0];
    const primaryIdx = intent?.idx ?? best.i;
    const primary = KB[primaryIdx];

    if (!best || best.cos < RELEVANCE_THRESHOLD) {
      if (!intent) {
        addBotMessage('That doesn\'t seem related to Mitesh\'s background. Try asking about his experience, skills, projects, or education.');
        showChips(DEFAULT_CHIPS);
        return;
      }
    }

    const viewSectionId = pickViewSectionId(text, results, intent);
    const hasSection = document.getElementById(viewSectionId);

    if (cloudGenerationEnabled()) {
      const contextIdx = [];
      const pushIdx = (i) => { if (i >= 0 && !contextIdx.includes(i)) contextIdx.push(i); };
      pushIdx(primaryIdx);
      if (primaryIdx === 11) pushIdx(26); // skills list + ML experience narrative
      results
        .filter((r) => r.cos >= RELEVANCE_THRESHOLD)
        .forEach((r) => pushIdx(r.i));
      const topEntries = contextIdx.slice(0, TOP_K).map((i) => KB[i]);
      try {
        const stream = await generateWithCloud(text, topEntries);
        stream.finish(hasSection ? viewSectionId : null);
      } catch (genErr) {
        console.error('Cloud generation error:', genErr);
        addBotMessage(primary.answer, hasSection ? viewSectionId : null);
      }
    } else {
      addBotMessage(primary.answer, hasSection ? viewSectionId : null);
    }

    showChips(primary.followUps);
  } catch (err) {
    removeLoadingIndicator();
    addBotMessage('Something went wrong. Please try again.');
    console.error('Agent query error:', err);
  }
}

sendBtn.addEventListener('click', () => handleQuery(input.value));
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleQuery(input.value);
});
