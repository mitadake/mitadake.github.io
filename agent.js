// Transformers.js v4 loaded dynamically at runtime via import()
// ── Knowledge Base ──────────────────────────────────────────────────────────
// Text fields use natural language that mirrors how users ask questions.
const KB = [
  {
    id: 'exp-fedex-intern',
    text: 'What is Mitesh doing right now? He is currently working as a Revenue Management Intern at FedEx in Los Angeles, building machine learning systems for pricing automation on AWS.',
    answer: 'Mitesh is currently a Revenue Management Intern at FedEx in Los Angeles (Sep 2025 -- present). He built 3 automated systems using ML and probability models that cut pricing analyst processing time from ~5 days to ~1 hour, and partnered with cross-functional teams on AWS dashboards and AI proof-of-concepts.',
    followUps: ['Tell me about the summer internship', 'What other FedEx roles did he have?', 'What ML skills does he use?']
  },
  {
    id: 'exp-fedex-summer',
    text: 'Mitesh worked as a Revenue Management Summer Intern at FedEx in Memphis. He built automated database systems using Python, SQL, Streamlit, and Docker.',
    answer: 'During summer 2025, Mitesh interned at FedEx in Memphis as a Revenue Management Summer Intern. He built an automated system with Python, SQL, Streamlit, and Docker for business-critical database operations, reducing manual processing time from ~10 days to ~10 minutes through statistical analysis.',
    followUps: ['What about his current FedEx role?', 'Tell me about the software engineer position', 'What tools does he use?']
  },
  {
    id: 'exp-fedex-swe',
    text: 'Mitesh worked as a Software Engineer at FedEx in Hyderabad India. He migrated data pipelines from Dataiku to Ab Initio ETL and optimized NLP code saving one million dollars annually.',
    answer: 'Mitesh worked as a Software Engineer at FedEx in Hyderabad (Aug 2023 -- Jul 2024). He migrated a Dataiku pipeline to Ab Initio for the Harmonized Code search engine, saving $1M annually. He also optimized NLP code in Python, reducing data discrepancies from 25% to negligible and eliminating data shuffling from 75% of text data.',
    followUps: ['What is his current role?', 'Tell me about his NLP skills', 'What projects has he built?']
  },
  {
    id: 'exp-fedex-intern',
    text: 'Tell me about all of Mitesh FedEx roles. He has worked at FedEx three times as intern and software engineer in revenue management, data automation, pricing, and NLP pipeline optimization.',
    answer: 'Mitesh has held 3 roles at FedEx: (1) Revenue Management Intern in LA (current) -- building ML-powered pricing automation, (2) Revenue Management Summer Intern in Memphis -- automating database operations with Python/SQL, and (3) Software Engineer in Hyderabad -- migrating data pipelines and optimizing NLP code, saving $1M annually.',
    followUps: ['What other companies has he worked at?', 'What are his key skills?', 'Tell me about his education']
  },
  {
    id: 'exp-fedex-intern',
    text: 'What is Mitesh experience? What has he worked on? Tell me about his work experience, professional background, career, job history, and work he has done.',
    answer: 'Mitesh has extensive experience across ML engineering and data roles: 3 positions at FedEx (pricing automation, database systems, NLP pipeline optimization), ML intern at Persistent Systems (NLP deduplication), and Data Engineer intern at NICE (AWS serverless systems). He is currently interning at FedEx while completing his M.S. at USC.',
    followUps: ['Tell me about FedEx roles', 'What are his skills?', 'What projects has he built?']
  },
  {
    id: 'exp-persistent',
    text: 'Mitesh interned at Persistent Systems as a Machine Learning Intern in Pune India. He built an NLP question deduplication system using Python, Flask, FastAPI, and Docker.',
    answer: 'At Persistent Systems (Jun -- Aug 2022), Mitesh implemented an NLP-based question deduplication system for the company\'s community portal, reducing duplicate postings to 10%. He built it with Python, Flask, FastAPI, and Docker.',
    followUps: ['What about his FedEx experience?', 'Tell me about NICE internship', 'What NLP projects has he done?']
  },
  {
    id: 'exp-nice',
    text: 'Mitesh interned at NICE as a Data Engineer in Pune India. He built serverless file ingestion on AWS using S3 DynamoDB Lambda and MongoDB with a Python Flask interface.',
    answer: 'At NICE (Nov 2021 -- Apr 2022), Mitesh built a scalable, serverless real-time file ingestion system using AWS (S3, DynamoDB, Lambda) and MongoDB, plus a Python Flask interface for data management.',
    followUps: ['What cloud skills does he have?', 'Tell me about his education', 'What other internships?']
  },
  {
    id: 'edu-ms',
    text: 'Mitesh is studying at USC University of Southern California for a Master of Science in Computer Science at Viterbi School of Engineering with a 3.66 GPA. His courses include Applied NLP and Computer Vision.',
    answer: 'Mitesh is pursuing an M.S. in Computer Science at USC Viterbi School of Engineering (Aug 2024 -- May 2026) with a 3.66 GPA. His coursework includes Applied NLP, Advanced Computer Vision, and Adversarial & Trustworthy Foundation Models.',
    followUps: ['What about his undergraduate?', 'What skills has he developed?', 'What projects did he build at USC?']
  },
  {
    id: 'edu-be',
    text: 'Mitesh got his Bachelor of Engineering in Computer Engineering from Pune Institute of Computer Technology PICT with a 3.84 GPA and Honors in AI and ML. He studied Machine Learning, NLP, Deep Learning, and Quantum Computing.',
    answer: 'Mitesh earned a B.E. in Computer Engineering from Pune Institute of Computer Technology (Jul 2019 -- May 2023) with a 3.84 GPA. He completed Honors in AI & ML, with coursework in Data Structures, Machine Learning, NLP, Deep Learning, and Quantum Computing.',
    followUps: ['Tell me about USC', 'What internships did he do during undergrad?', 'What projects has he built?']
  },
  {
    id: 'edu-ms',
    text: 'What is Mitesh education? Where did he study? Tell me about his educational background, university, college, school, degree, GPA, courses, and academic history.',
    answer: 'Mitesh holds an M.S. in Computer Science from USC Viterbi (3.66 GPA, graduating May 2026) and a B.E. in Computer Engineering from PICT, Pune (3.84 GPA, Honors in AI & ML). His coursework spans NLP, Computer Vision, Deep Learning, and Adversarial Foundation Models.',
    followUps: ['What is his work experience?', 'What projects has he built?', 'What are his skills?']
  },
  {
    id: 'exp-fedex-intern',
    text: 'What are Mitesh skills and technical abilities? He knows Python, Java, MongoDB, MySQL, SQL, AWS, GCP, PyTorch, TensorFlow, Keras, Docker, Flask, FastAPI, and many other tools.',
    answer: 'Mitesh\'s key skills: Python, Java | MongoDB, MySQL, SQL | AWS, GCP | Neural Networks, NLP, LLMs, PyTorch, TensorFlow, Keras | Ab Initio, Dataiku, Docker, Flask, FastAPI, Django, Power BI. He has deep expertise in applied ML and NLP.',
    followUps: ['What ML projects has he done?', 'Tell me about his experience', 'What cloud platforms does he use?']
  },
  {
    id: 'proj-tokengen',
    text: 'Tell me about TokenGen. TokenGen is a visualization tool that shows layer-wise prediction evolution across transformer layers in GPT-2 and OPT large language models. It is an LLM interpretability project.',
    answer: 'TokenGen is a visualization tool for analyzing layer-wise token evolution patterns across 12+ transformer layers in GPT-2 and OPT models. Built with Streamlit and UMAP, it\'s an LLM interpretability tool. Try the live demo at tokengen.streamlit.app.',
    followUps: ['What other projects has he built?', 'Tell me about hate speech unlearning', 'What about AnyToken?']
  },
  {
    id: 'proj-hate-speech',
    text: 'Mitesh worked on Hate Speech Unlearning for LLMs using LLaMA 3. He used Task Vector Arithmetic, Contrastive Learning, and Fine-tuning to improve AI safety and alignment.',
    answer: 'Mitesh worked on Hate Speech Unlearning for LLMs, implementing Task Vector Arithmetic, Contrastive Learning, and Fine-tuning to remove hate speech from LLaMA 3 models. He reduced the harmful rate from 62% to 34% on the PKU-SafeRLHF dataset.',
    followUps: ['Tell me about TokenGen', 'What other NLP projects?', 'What about PriceNet?']
  },
  {
    id: 'proj-anytoken',
    text: 'What is AnyToken? AnyToken is an interactive HuggingFace vocabulary and subword segmentation visualization tool that shows how different models break down input text.',
    answer: 'AnyToken is an interactive HuggingFace tokenizer visualization tool built by Mitesh. It helps users understand how different tokenizers break down text. Try it at anytoken.streamlit.app.',
    followUps: ['Tell me about TokenGen', 'What is PriceNet?', 'What NLP skills does he have?']
  },
  {
    id: 'proj-pricenet',
    text: 'PriceNet is a stock price prediction project using Llama and Gemini LLMs for explainable financial time series forecasting in FinTech.',
    answer: 'PriceNet is a stock price prediction system using Llama and Gemini for explainable financial time series forecasting. It combines LLM capabilities with financial data analysis for FinTech applications.',
    followUps: ['What about TokenGen?', 'Tell me about phishing detection', 'What ML skills does he have?']
  },
  {
    id: 'proj-phishing',
    text: 'Mitesh built a Real-time Phishing Detection system with ML models deployed as a Microsoft Edge browser extension. He published a research paper about it.',
    answer: 'Mitesh built a Real-time Phishing Detection system using production ML models, deployed as a Microsoft Edge browser extension, during his B.E. at Pune Institute of Computer Technology (PICT). The research was published in an academic paper.',
    followUps: ['What other projects?', 'Tell me about object detection', 'What is his experience?']
  },
  {
    id: 'proj-objdet',
    text: 'Mitesh built a Real-time Object Detection system for computer vision, a high-performance detection application.',
    answer: 'Mitesh built a high-performance real-time object detection system during his B.E. at Pune Institute of Computer Technology (PICT). The code is available on GitHub.',
    followUps: ['Tell me about TokenGen', 'What are his key projects?', 'What is his experience?']
  },
  {
    id: 'section-projects',
    text: 'What projects did Mitesh build at USC? What graduate projects did he do at University of Southern California Viterbi during his masters MS degree?',
    answer: 'During his M.S. at USC Viterbi (Aug 2024--May 2026), Mitesh\'s main portfolio projects are TokenGen (LLM layer-wise interpretability), Hate Speech Unlearning for LLaMA 3, AnyToken (tokenizer visualization), and PriceNet (LLM-based explainable stock forecasting). The Real-time Phishing Detection browser extension and Real-time Object Detection system were built during his B.E. at PICT in Pune, not at USC.',
    followUps: ['What projects has he built in total?', 'Tell me about TokenGen', 'Show me his education']
  },
  {
    id: 'section-projects',
    text: 'What projects has Mitesh built? Tell me about his projects, portfolio, applications, tools, and side work. What has he created and developed?',
    answer: 'Mitesh\'s projects split by school: at USC (M.S.): TokenGen, Hate Speech Unlearning for LLaMA 3, AnyToken, and PriceNet. At PICT during his B.E.: Real-time Phishing Detection (Microsoft Edge extension, published paper) and Real-time Object Detection.',
    followUps: ['Tell me about TokenGen', 'What about the phishing paper?', 'What is PriceNet?']
  },
  {
    id: 'section-talks',
    text: 'Has Mitesh given any talks or presentations? He spoke at conferences about quantum cryptography, Qiskit quantum computing, and quantum-classical machine learning at IEEE workshops.',
    answer: 'Mitesh has given multiple talks: Quantum Cryptography (IEEE, Python + Qiskit), Qiskit 101 Live Demo (hands-on quantum computing), and Quantum-Classical ML (comparative analysis research at QAMP). He was also a Qiskit Advocate.',
    followUps: ['What about his community involvement?', 'Tell me about his education', 'What are his interests?']
  },
  {
    id: 'section-community',
    text: 'Mitesh is involved in the community. He mentored an IEEE quantum communications workshop as a Qiskit Advocate and ran a hackathon at Delhi University.',
    answer: 'Mitesh is active in the community: he mentored an IISC-IEEE Quantum Communications workshop as a Qiskit Advocate and conducted a hackathon and hands-on session at Delhi University.',
    followUps: ['What are his personal interests?', 'Tell me about his talks', 'What is his experience?']
  },
  {
    id: 'section-interests',
    text: 'What are Mitesh personal interests and hobbies? He plays chess with a US Chess rating, likes football and soccer, and competes in Kaggle ML competitions.',
    answer: 'Outside of work, Mitesh is a chess player (US Chess rating 1685), football/soccer enthusiast, and is active on Kaggle as a Competitions Expert and a Notebooks Expert. He draws inspiration from Andrej Karpathy and Richard Feynman.',
    followUps: ['What is his work experience?', 'What projects has he built?', 'Tell me about his Kaggle profile']
  },
  {
    id: 'section-interests',
    text: 'What is Mitesh Kaggle profile? Is he a Kaggle expert? Competitions Expert Notebooks Expert badges tiers on Kaggle miteshadake.',
    answer: 'On Kaggle (kaggle.com/miteshadake), Mitesh holds the Competitions Expert tier and the Notebooks Expert tier -- Kaggle\'s recognition for sustained competition performance and high-quality public notebooks, respectively.',
    followUps: ['What are his personal interests?', 'What is his experience?', 'Tell me about his education']
  },
  {
    id: 'exp-fedex-intern',
    text: 'Who is Mitesh Adake? Tell me about him. He is an ML Engineer in Los Angeles studying at USC and interning at FedEx, specializing in NLP and LLMs. Contact him on LinkedIn or GitHub.',
    answer: 'Mitesh Adake is an ML Engineer based in Los Angeles, currently pursuing an M.S. in Computer Science at USC while interning at FedEx. He specializes in NLP, LLMs, and Deep Learning. Connect with him on LinkedIn (linkedin.com/in/mitesh-adake) or GitHub (github.com/mitadake).',
    followUps: ['What is his experience?', 'What are his skills?', 'What projects has he built?']
  },
  {
    id: 'exp-fedex-intern',
    text: 'What NLP and natural language processing work has Mitesh done? He has experience with language models, transformers, BERT, GPT, text classification, and question answering systems.',
    answer: 'Mitesh has deep NLP expertise: he optimized NLP pipelines at FedEx (reducing data discrepancies from 25% to near-zero), built question deduplication at Persistent Systems, created TokenGen for LLM interpretability, AnyToken for tokenizer visualization, and worked on hate speech unlearning with LLaMA 3. His coursework includes Applied NLP at USC.',
    followUps: ['Tell me about TokenGen', 'What LLM work has he done?', 'What about his FedEx NLP work?']
  },
  {
    id: 'exp-fedex-intern',
    text: 'What machine learning and deep learning and AI experience does Mitesh have? He has worked with neural networks, PyTorch, TensorFlow, model training, inference, and prediction systems.',
    answer: 'Mitesh is deeply experienced in ML/AI: he built ML-powered pricing automation at FedEx, implemented NLP deduplication models at Persistent Systems, created LLM interpretability tools (TokenGen), worked on LLM safety (hate speech unlearning), and built predictive models (PriceNet, phishing detection). His toolkit includes PyTorch, TensorFlow, and Keras.',
    followUps: ['What NLP work has he done?', 'Tell me about his projects', 'What is his education?']
  }
];

const DEFAULT_CHIPS = [
  "What is Mitesh's experience?",
  "Tell me about the FedEx roles",
  "Show me his education",
  "What projects has he built?",
  "Schedule a call with Mitesh",
  "Resume"
];

const SIMILARITY_THRESHOLD = 0.1;
const CALL_SCHEDULING_URL = 'https://calendly.com/miteshadake';
const CALL_INTENT_PATTERN = /\b(schedule|book|set up|setup|arrange)\b.*\b(call|meeting|chat)\b|\bcall\b.*\b(schedule|book|meeting)\b/i;
const RESUME_PATH = 'assets/Mitesh%20Adake_Engineer_20260126.pdf';
const RESUME_URL = typeof window !== 'undefined'
  ? new URL(RESUME_PATH, window.location.href).href
  : RESUME_PATH;
const RESUME_INTENT_PATTERN = /\b(cv|resume|curriculum\s+vitae)\b|where\s+.*\bresume\b|resume\s+where|download\s+.*\b(cv|resume)\b/i;
const GEMMA_SYSTEM_PROMPT = 'You are a concise portfolio assistant for Mitesh Adake. Answer questions using ONLY the provided context. If the context distinguishes where work was done (for example USC graduate work vs PICT undergraduate work), keep that distinction exactly -- do not say Phishing Detection or Object Detection were USC projects if the context says they were at PICT. If the context doesn\'t contain relevant information, say you\'re not sure. Keep responses brief (2-3 sentences max). Do not make up information. Do not use markdown formatting.';

/** Strip Gemma control tokens: <|...|> and malformed variants like <turn|> (no pipe after '<'). */
function sanitizeGemmaDisplayText(text) {
  if (!text) return '';
  return text
    .replace(/<\|[^|]+?\|>/g, '')
    .replace(/<[a-zA-Z][a-zA-Z0-9_]*\|>/g, '');
}

// ── State ───────────────────────────────────────────────────────────────────
let extractor = null;
let kbEmbeddings = null;
let transformersLib = null;
let gemmaModel = null;
let gemmaProcessor = null;
let gemmaReady = false;
/** One shared load chain (embedding + KB index + Gemma), started on page load. */
let modelInitPromise = null;
/** Model load status lines; flushed into the chat when the panel is open. */
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

// ── Helpers ─────────────────────────────────────────────────────────────────
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

async function embedAll() {
  const results = [];
  for (const chunk of KB) {
    results.push(await embed(chunk.text));
  }
  return results;
}

function search(queryVec, topK = 1) {
  const scored = kbEmbeddings.map((vec, i) => ({ i, score: cosine(queryVec, vec) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

/**
 * Which on-page section to scroll to. The top embedding hit is often a generic
 * "experience" row while the answer is about a specific role; combine the user
 * query with top-K matches so links match the topic (e.g. NICE -> exp-nice).
 */
function pickViewSectionId(query, results) {
  const above = results.filter((r) => r.score >= SIMILARITY_THRESHOLD);
  if (!above.length) return KB[results[0].i].id;

  const hasId = (id) => above.some((r) => KB[r.i].id === id);

  const rules = [
    { re: /\bNICE\b|at\s+nice\b|nice\s+intern|nice\s+data|data\s+engineer.*\bnice\b|serverless.*\bnice\b|\bnice\b.*(intern|data\s+engineer|aws|lambda|pune|mongodb|dynamo)/i, id: 'exp-nice' },
    { re: /\bpersistent\b/i, id: 'exp-persistent' },
    { re: /(fedex|fed\s+ex).*(summer|memphis)|summer.*(fedex|fed\s+ex)/i, id: 'exp-fedex-summer' },
    { re: /(fedex|fed\s+ex).*(hyderabad|software\s+engineer)|hyderabad.*(fedex|fed\s+ex)/i, id: 'exp-fedex-swe' },
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
  'Runs in your browser, your questions stay on this device.',
  'Try a chip inside, or type anything you are curious about.'
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
    addBotMessage('Hi! I\'m an AI agent running <strong>entirely in your browser</strong> powered by <strong>Gemma 4</strong>. Ask me anything about Mitesh\'s experience, skills, or projects. Note: I may not always provide accurate information.');
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

// ── Model init (page-load background + shared promise) ─────────────────────
function beginModelInit() {
  if (modelInitPromise) return modelInitPromise;
  modelInitPromise = (async () => {
    try {
      if (!transformersLib) {
        queueModelStatus('<i class="fas fa-download" style="margin-right:6px"></i>Loading AI models...');
        transformersLib = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.0.1');
      }
      if (!extractor) {
        queueModelStatus('<i class="fas fa-cog fa-spin" style="margin-right:6px"></i>Initializing embedding model...');
        const { pipeline } = transformersLib;
        extractor = await pipeline('feature-extraction', 'Xenova/bge-small-en-v1.5', {
          dtype: 'q8',
        });
        queueModelStatus('<i class="fas fa-check" style="margin-right:6px;color:#22c55e"></i>Embedding model ready. Ask me anything!');
      }
      if (!kbEmbeddings) {
        kbEmbeddings = await embedAll();
      }
      await loadGemmaInBackground();
    } catch (err) {
      modelInitPromise = null;
      queueModelStatus('Failed to load models. Try refreshing the page.');
      flushModelStatusQueue();
      console.error('Agent model load error:', err);
      throw err;
    }
  })();
  return modelInitPromise;
}

async function detectGemmaBackend() {
  if (navigator.gpu) {
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (adapter) return { device: 'webgpu', dtype: 'q4f16', label: 'WebGPU' };
    } catch (_) { /* WebGPU present but unusable, fall through */ }
  }
  return { device: 'wasm', dtype: 'q4', label: 'WASM (CPU)' };
}

async function loadGemmaInBackground() {
  if (gemmaReady || !transformersLib) return;
  const backend = await detectGemmaBackend();
  queueModelStatus(
    `<i class="fas fa-download" style="margin-right:6px"></i>Loading Gemma 4 via ${backend.label}... <span id="gemma-progress">0%</span>`
  );
  try {
    const { AutoProcessor, Gemma4ForConditionalGeneration } = transformersLib;
    gemmaProcessor = await AutoProcessor.from_pretrained('onnx-community/gemma-4-E2B-it-ONNX');
    gemmaModel = await Gemma4ForConditionalGeneration.from_pretrained(
      'onnx-community/gemma-4-E2B-it-ONNX',
      {
        dtype: backend.dtype,
        device: backend.device,
        progress_callback: (info) => {
          if (info.status === 'progress_total') {
            const el = document.getElementById('gemma-progress');
            if (el) el.textContent = `${Math.round(info.progress)}%`;
          }
        },
      }
    );
    gemmaReady = true;
    queueModelStatus(
      `<i class="fas fa-check" style="margin-right:6px;color:#22c55e"></i>Gemma 4 loaded (${backend.label}). Answers are now AI-generated.`
    );
  } catch (err) {
    queueModelStatus(
      '<i class="fas fa-info-circle" style="margin-right:6px;color:#f59e0b"></i>Gemma 4 unavailable. Using embedding-only mode.'
    );
    console.error('Gemma load error:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    beginModelInit().catch(() => {});
  });
} else {
  beginModelInit().catch(() => {});
}

function addStreamingBotMessage() {
  const div = document.createElement('div');
  div.className = 'agent-msg bot';
  div.textContent = '';
  msgArea.appendChild(div);
  msgArea.scrollTop = msgArea.scrollHeight;

  return {
    element: div,
    append(text) {
      div.textContent += sanitizeGemmaDisplayText(text);
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

async function generateWithGemma(query, retrievedEntries) {
  const contextBlock = retrievedEntries
    .map((entry, i) => `[${i + 1}] ${entry.answer}`)
    .join('\n');

  const messages = [
    { role: 'system', content: GEMMA_SYSTEM_PROMPT },
    { role: 'user', content: `Context:\n${contextBlock}\n\nQuestion: ${query}` },
  ];

  const prompt = gemmaProcessor.apply_chat_template(messages, {
    enable_thinking: false,
    add_generation_prompt: true,
  });

  const inputs = await gemmaProcessor(prompt, null, null, {
    add_special_tokens: false,
  });

  const stream = addStreamingBotMessage();

  const { TextStreamer } = transformersLib;
  const streamer = new TextStreamer(gemmaProcessor.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: false,
    callback_function: (text) => {
      stream.append(text);
    },
  });

  const outputs = await gemmaModel.generate({
    ...inputs,
    max_new_tokens: 256,
    do_sample: false,
    streamer,
  });

  if (!stream.element.textContent.trim()) {
    const decoded = gemmaProcessor.batch_decode(
      outputs.slice(null, [inputs.input_ids.dims.at(-1), null]),
      { skip_special_tokens: true },
    );
    if (decoded[0]) stream.element.textContent = sanitizeGemmaDisplayText(decoded[0]);
  } else {
    stream.element.textContent = sanitizeGemmaDisplayText(stream.element.textContent);
  }

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

  if (!extractor || !kbEmbeddings) {
    addBotMessage('The model is still loading. Please wait a moment and try again.');
    return;
  }

  addLoadingIndicator();

  try {
    const queryVec = await embed(text);
    const results = search(queryVec, 3);
    removeLoadingIndicator();

    const best = results[0];
    if (best.score < SIMILARITY_THRESHOLD) {
      addBotMessage('That doesn\'t seem related to Mitesh\'s background. Try asking about his experience, skills, projects, or education.');
      showChips(DEFAULT_CHIPS);
      return;
    }

    const chunk = KB[best.i];
    const viewSectionId = pickViewSectionId(text, results);

    if (gemmaReady) {
      const topEntries = results
        .filter(r => r.score >= SIMILARITY_THRESHOLD)
        .map(r => KB[r.i]);
      try {
        const stream = await generateWithGemma(text, topEntries);
        stream.finish(viewSectionId);
      } catch (genErr) {
        console.error('Gemma generation error:', genErr);
        addBotMessage(chunk.answer, viewSectionId);
      }
    } else {
      addBotMessage(chunk.answer, viewSectionId);
    }

    showChips(chunk.followUps);
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
