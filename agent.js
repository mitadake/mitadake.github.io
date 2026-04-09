// Transformers.js loaded dynamically at runtime via import()
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
    text: 'Tell me about TokenGen. TokenGen is a visualization tool that shows layer-wise prediction evolution across transformer layers in GPT-2 and OPT large language models. It is Mitesh featured LLM interpretability project.',
    answer: 'TokenGen is Mitesh\'s featured project -- a visualization tool for analyzing layer-wise token evolution patterns across 12+ transformer layers in GPT-2 and OPT models. Built with Streamlit and UMAP, it\'s an LLM interpretability tool. Try the live demo at tokengen.streamlit.app.',
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
    answer: 'Mitesh built a Real-time Phishing Detection system using production ML models, deployed as a Microsoft Edge browser extension. The research was published in an academic paper.',
    followUps: ['What other projects?', 'Tell me about object detection', 'What is his experience?']
  },
  {
    id: 'proj-objdet',
    text: 'Mitesh built a Real-time Object Detection system for computer vision, a high-performance detection application.',
    answer: 'Mitesh built a high-performance real-time object detection system demonstrating his computer vision skills. The code is available on GitHub.',
    followUps: ['Tell me about TokenGen', 'What are his key projects?', 'What is his experience?']
  },
  {
    id: 'section-projects',
    text: 'What projects has Mitesh built? Tell me about his projects, portfolio, applications, tools, and side work. What has he created and developed?',
    answer: 'Mitesh has built several notable projects: TokenGen (LLM interpretability), Hate Speech Unlearning for LLaMA 3, AnyToken (tokenizer visualizer), PriceNet (LLM-based stock prediction), a Real-time Phishing Detection browser extension (published paper), and a Real-time Object Detection system.',
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
    text: 'What are Mitesh personal interests and hobbies? He plays chess, likes football and soccer, and competes in Kaggle ML competitions.',
    answer: 'Outside of work, Mitesh is a chess player, football/soccer enthusiast, and actively competes in Kaggle ML competitions. He draws inspiration from Andrej Karpathy and Richard Feynman.',
    followUps: ['What is his work experience?', 'What projects has he built?', 'Tell me about his education']
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
  "What NLP skills does he have?",
  "Show me his education",
  "What projects has he built?"
];

const SIMILARITY_THRESHOLD = 0.1;

// ── State ───────────────────────────────────────────────────────────────────
let extractor = null;
let kbEmbeddings = null;
let isLoading = false;

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
const panel = document.getElementById('agent-panel');
const closeBtn = document.getElementById('agent-close');
const msgArea = document.getElementById('agent-messages');
const chipsArea = document.getElementById('agent-chips');
const input = document.getElementById('agent-input');
const sendBtn = document.getElementById('agent-send');

let panelOpen = false;
let firstOpen = true;

function togglePanel() {
  panelOpen = !panelOpen;
  panel.classList.toggle('open', panelOpen);
  if (panelOpen && firstOpen) {
    firstOpen = false;
    addBotMessage('Hi! I\'m an AI agent running <strong>entirely in your browser</strong> using a transformer embedding model. Ask me anything about Mitesh\'s experience, skills, or projects.');
    showChips(DEFAULT_CHIPS);
    initModel();
  }
}

fab.addEventListener('click', togglePanel);
closeBtn.addEventListener('click', togglePanel);

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

// ── Model Init ──────────────────────────────────────────────────────────────
async function initModel() {
  if (extractor || isLoading) return;
  isLoading = true;
  addBotMessage('<i class="fas fa-download" style="margin-right:6px"></i>Loading AI model...');

  try {
    const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1/dist/transformers.min.js');
    removeLastBotMessage();
    addBotMessage('<i class="fas fa-cog fa-spin" style="margin-right:6px"></i>Initializing embedding model...');
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      dtype: 'q8',
    });
    removeLastBotMessage();
    addBotMessage('<i class="fas fa-check" style="margin-right:6px;color:#22c55e"></i>Model loaded. Ask me anything!');
    kbEmbeddings = await embedAll();
  } catch (err) {
    removeLastBotMessage();
    addBotMessage('Failed to load model. Try refreshing the page.');
    console.error('Agent model load error:', err);
  } finally {
    isLoading = false;
  }
}

function removeLastBotMessage() {
  const msgs = msgArea.querySelectorAll('.agent-msg.bot');
  if (msgs.length) msgs[msgs.length - 1].remove();
}

// ── Query Handling ──────────────────────────────────────────────────────────
async function handleQuery(text) {
  if (!text.trim()) return;

  addUserMessage(text);
  chipsArea.innerHTML = '';
  input.value = '';

  if (!extractor || !kbEmbeddings) {
    addBotMessage('The model is still loading. Please wait a moment and try again.');
    return;
  }

  addLoadingIndicator();

  try {
    const queryVec = await embed(text);
    const results = search(queryVec, 2);
    removeLoadingIndicator();

    const best = results[0];
    if (best.score < SIMILARITY_THRESHOLD) {
      addBotMessage('That doesn\'t seem related to Mitesh\'s background. Try asking about his experience, skills, projects, or education.');
      showChips(DEFAULT_CHIPS);
      return;
    }

    const chunk = KB[best.i];
    addBotMessage(chunk.answer, chunk.id);
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
