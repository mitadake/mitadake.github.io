// ─────────────────────────────────────────────────────────────────────────────
// Portfolio chat agent (simple)
//
// Reads visible text from this page and sends it as context to Ollama Cloud
// (gemma4) through a serverless proxy. No separate knowledge base or retrieval.
// ─────────────────────────────────────────────────────────────────────────────

const AGENT_PROXY_URL =
  (typeof window !== 'undefined' && window.AGENT_PROXY_URL) ||
  'https://YOUR-WORKER-SUBDOMAIN.workers.dev';

const CHAT_MODEL =
  (typeof window !== 'undefined' && window.AGENT_CHAT_MODEL) || 'gemma4';

const MAX_OUTPUT_TOKENS = 320;

const CALL_SCHEDULING_URL = 'https://calendly.com/miteshadake';
const CALL_INTENT_PATTERN = /\b(schedule|book|set up|setup|arrange)\b.*\b(call|meeting|chat)\b|\bcall\b.*\b(schedule|book|meeting)\b/i;
const RESUME_PATH = 'assets/Resume__Mitesh__Adake.pdf';
const RESUME_URL = typeof window !== 'undefined'
  ? new URL(RESUME_PATH, window.location.href).href
  : RESUME_PATH;
const RESUME_INTENT_PATTERN = /\b(cv|resume|curriculum\s+vitae)\b|where\s+.*\bresume\b|resume\s+where|download\s+.*\b(cv|resume)\b/i;

const SYSTEM_PROMPT =
  'You are a concise portfolio assistant for Mitesh Adake. Answer using ONLY the website content provided in the user message. ' +
  'If the content does not contain the answer, say you are not sure. Keep responses brief (2-4 sentences). ' +
  'Do not invent facts. Do not use markdown formatting. ' +
  'When mentioning LinkedIn, GitHub, or Kaggle, use those plain words (links are added automatically).';

const DEFAULT_CHIPS = [
  "What is Mitesh's experience?",
  'Tell me about his education',
  'What projects has he built?',
  'Tell me about the GGUF k-quant attack project',
  'Schedule a call with Mitesh',
  'Resume',
];

function cloudGenerationEnabled() {
  return typeof AGENT_PROXY_URL === 'string' && !AGENT_PROXY_URL.includes('YOUR-WORKER');
}

// ── Page context (source of truth = what's on this page) ─────────────────────

let cachedPageContext = null;

function buildPageContext() {
  const main = document.getElementById('main-content');
  if (!main) return '';

  const clone = main.cloneNode(true);
  clone.querySelectorAll('script, style, noscript').forEach((n) => n.remove());

  return clone.innerText
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function getPageContext() {
  if (!cachedPageContext) cachedPageContext = buildPageContext();
  return cachedPageContext;
}

/** Guess which on-page section to scroll to from the question. */
function pickViewSectionId(query) {
  const rules = [
    [/gguf|k-quant|quantization attack|content.injection/i, 'proj-gguf-attack'],
    [/tokengen|token gen/i, 'proj-tokengen'],
    [/hate speech|unlearning|llama\s*3/i, 'proj-hate-speech'],
    [/anytoken|any token/i, 'proj-anytoken'],
    [/pricenet|stock price/i, 'proj-pricenet'],
    [/phishing|edge extension|browser extension/i, 'proj-phishing'],
    [/object detection|computer vision project/i, 'proj-objdet'],
    [/education|usc|viterbi|\bms\b|master|graduate|gpa|coursework/i, 'edu-ms'],
    [/pict|undergrad|bachelor|\bb\.e\./i, 'edu-be'],
    [/fedex|revenue science|pricing|work experience|internship/i, 'section-experience'],
    [/nice\b|persistent|software engineer.*hyderabad/i, 'section-experience'],
    [/talk|qiskit|quantum cryptography|presentation/i, 'section-talks'],
    [/community|hackathon|mentor|qiskit advocate/i, 'section-beyond'],
    [/chess|kaggle|football|soccer|hobby|hobbies|interest/i, 'section-beyond'],
    [/project|portfolio|built|research/i, 'section-projects'],
  ];

  for (const [re, id] of rules) {
    if (re.test(query) && document.getElementById(id)) return id;
  }
  return null;
}

// ── Message formatting ────────────────────────────────────────────────────────

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const BARE_LINK_RE = /\b((?:https?:\/\/)?(?:www\.)?(?:linkedin\.com\/in\/[\w-]+|github\.com\/[\w./-]+|kaggle\.com\/[\w.-]+|calendly\.com\/[\w./-]+|(?:tokengen|anytoken)\.streamlit\.app))(?:\/[^\s<,)]+)?/gi;

const PROFILE_LINKS = {
  linkedin: 'https://www.linkedin.com/in/mitesh-adake/',
  github: 'https://github.com/mitadake',
  kaggle: 'https://www.kaggle.com/miteshadake',
};

function agentLink(href, label) {
  return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="agent-link">${label}</a>`;
}

function normalizeHref(match) {
  let href = match;
  if (!/^https?:\/\//i.test(href)) href = `https://${href}`;
  return href.replace(/^https:\/\/linkedin\.com/i, 'https://www.linkedin.com');
}

function linkifyOutsideAnchors(html, replacer) {
  const parts = html.split(/(<a\b[^>]*>[\s\S]*?<\/a>)/gi);
  return parts.map((part, i) => (i % 2 === 1 ? part : replacer(part))).join('');
}

function linkifyBotMessage(text) {
  let out = escapeHtml(text);

  out = out.replace(
    /\bLinkedIn\s*\((linkedin\.com\/in\/[\w-]+)\)/gi,
    (_, path) => agentLink(normalizeHref(path), 'LinkedIn')
  );
  out = out.replace(
    /\bGitHub\s*\((github\.com\/[\w./-]+)\)/gi,
    (_, path) => agentLink(normalizeHref(path), 'GitHub')
  );
  out = out.replace(
    /\bKaggle\s*\((kaggle\.com\/[\w.-]+)\)/gi,
    (_, path) => agentLink(normalizeHref(path), 'Kaggle')
  );

  out = linkifyOutsideAnchors(out, (part) =>
    part.replace(BARE_LINK_RE, (match) => agentLink(normalizeHref(match), match))
  );

  out = linkifyOutsideAnchors(out, (part) =>
    part
      .replace(/\bLinkedIn\b/g, (m) => agentLink(PROFILE_LINKS.linkedin, m))
      .replace(/\bGitHub\b/g, (m) => agentLink(PROFILE_LINKS.github, m))
      .replace(/\bKaggle\b/g, (m) => agentLink(PROFILE_LINKS.kaggle, m))
  );

  return out;
}

function formatBotMessage(content, { trustedHtml = false } = {}) {
  return trustedHtml ? content : linkifyBotMessage(content);
}

// ── Page actions ──────────────────────────────────────────────────────────────

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

// ── UI ────────────────────────────────────────────────────────────────────────

const fab = document.getElementById('agent-fab');
const fabHint = document.getElementById('agent-fab-hint');
const fabHintTip = document.getElementById('agent-fab-hint-tip');
const fabWrap = document.getElementById('agent-fab-wrap');
const panel = document.getElementById('agent-panel');
const closeBtn = document.getElementById('agent-close');
const msgArea = document.getElementById('agent-messages');
const chipsArea = document.getElementById('agent-chips');
const input = document.getElementById('agent-input');
const sendBtn = document.getElementById('agent-send');

const HINT_TIP_ROTATION = [
  'Ask about Mitesh, his resume, or book a call.',
  'Try a suggested question, or type your own.',
  'Questions about experience, projects, or education welcome.',
];

let panelOpen = false;
let firstOpen = true;
let hintTipInterval = null;

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
  if (!panel) return;
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
  }
}

fab?.addEventListener('click', togglePanel);
if (fabHint) fabHint.addEventListener('click', togglePanel);
closeBtn?.addEventListener('click', togglePanel);

setPanelAriaExpanded(false);
startHintTipRotation();

function addBotMessage(html, sectionId, { trustedHtml = false } = {}) {
  const div = document.createElement('div');
  div.className = 'agent-msg bot';
  let content = formatBotMessage(html, { trustedHtml });
  if (sectionId) {
    content += `<br><span class="view-link" data-section="${sectionId}">View on page &rarr;</span>`;
  }
  div.innerHTML = content;
  msgArea.appendChild(div);
  div.querySelector('.view-link')?.addEventListener('click', (e) => {
    scrollToSection(e.currentTarget.dataset.section);
  });
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
  chips.forEach((text) => {
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
  document.getElementById('agent-loading')?.remove();
}

function addStreamingBotMessage() {
  const div = document.createElement('div');
  div.className = 'agent-msg bot';
  div.textContent = '';
  msgArea.appendChild(div);
  msgArea.scrollTop = msgArea.scrollHeight;

  return {
    append(text) {
      div.textContent += text;
      msgArea.scrollTop = msgArea.scrollHeight;
    },
    finish(sectionId) {
      const raw = div.textContent;
      div.textContent = '';
      div.innerHTML = linkifyBotMessage(raw);
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

// ── Ollama Cloud via proxy ────────────────────────────────────────────────────

async function generateWithCloud(query, pageContext) {
  const body = {
    model: CHAT_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Website content:\n${pageContext}\n\nQuestion: ${query}`,
      },
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
    let detail = '';
    try {
      const errJson = await res.json();
      detail = errJson.error || JSON.stringify(errJson);
    } catch (_) {
      detail = await res.text().catch(() => '');
    }
    throw new Error(detail || `Proxy responded ${res.status}`);
  }

  removeLoadingIndicator();
  const stream = addStreamingBotMessage();
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let got = false;

  const handleLine = (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let obj;
    try {
      obj = JSON.parse(trimmed);
    } catch (_) {
      return;
    }
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
      handleLine(buffer.slice(0, nl));
      buffer = buffer.slice(nl + 1);
    }
  }
  if (buffer.trim()) handleLine(buffer);
  if (!got) throw new Error('Empty response from model');
  return stream;
}

// ── Query handling ────────────────────────────────────────────────────────────

async function handleQuery(text) {
  if (!text.trim()) return;

  addUserMessage(text);
  chipsArea.innerHTML = '';
  input.value = '';

  if (CALL_INTENT_PATTERN.test(text)) {
    addBotMessage(
      `Absolutely - you can schedule a call here: <a href="${CALL_SCHEDULING_URL}" target="_blank" rel="noopener noreferrer" class="agent-link">Schedule a call</a>. You can also message on <a href="https://www.linkedin.com/in/mitesh-adake/" target="_blank" rel="noopener noreferrer" class="agent-link">LinkedIn</a>.`,
      null,
      { trustedHtml: true }
    );
    showChips(DEFAULT_CHIPS);
    return;
  }

  if (RESUME_INTENT_PATTERN.test(text)) {
    addBotMessage(
      `Here is Mitesh\'s resume (PDF): <a href="${RESUME_URL}" target="_blank" rel="noopener noreferrer" class="agent-link">Open resume</a>.`,
      null,
      { trustedHtml: true }
    );
    showChips(DEFAULT_CHIPS);
    return;
  }

  if (!cloudGenerationEnabled()) {
    addBotMessage('The chat assistant is not configured. Set AGENT_PROXY_URL in index.html.');
    return;
  }

  addLoadingIndicator();

  try {
    const pageContext = getPageContext();
    const viewSectionId = pickViewSectionId(text);
    const stream = await generateWithCloud(text, pageContext);
    stream.finish(viewSectionId);
    showChips(DEFAULT_CHIPS);
  } catch (err) {
    removeLoadingIndicator();
    console.error('Agent query error:', err);
    addBotMessage('Something went wrong reaching the assistant. Please try again in a moment.');
  }
}

sendBtn?.addEventListener('click', () => handleQuery(input.value));
input?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleQuery(input.value);
});

if (!fab || !panel || !closeBtn || !msgArea || !sendBtn || !input) {
  console.warn('Portfolio chat: missing DOM elements; agent disabled.');
}
