// Sanity check retrieval + intent for known problem queries.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from '@huggingface/transformers';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KB = JSON.parse(fs.readFileSync(path.join(root, 'kb.json'), 'utf8'));
const emb = JSON.parse(fs.readFileSync(path.join(root, 'kb-embeddings.json'), 'utf8'));
const kbEmbeddings = KB.map((_, i) => emb.vectors[i].vector);

const INTENT_RULES = [
  { re: /other\s+fedex\s+roles|all\s+(of\s+)?(his\s+)?fedex\s+roles|fedex\s+roles\s+(did|has)|tell\s+me\s+about\s+(the\s+)?fedex\s+roles|what\s+fedex\s+roles/i, idx: 4 },
  { re: /\b(ml|machine\s+learning|ai|technical|tech)\s+skills\b|\bwhat\s+(are\s+)?(his|mitesh'?s?)\s+(key\s+)?skills\b|\bskills\s+does\s+he\b|\btoolkit\b|\btech\s+stack\b/i, idx: 11 },
];

const followUpIndex = new Map([
  ['what other fedex roles did he have?', { idx: 4 }],
  ['tell me about his ml skills', { idx: 11 }],
]);

function matchIntent(q) {
  const exact = followUpIndex.get(q.trim().toLowerCase());
  if (exact) return exact;
  for (const rule of INTENT_RULES) if (rule.re.test(q)) return { idx: rule.idx };
  return null;
}

const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const norm = (a) => Math.sqrt(dot(a, a));
const cosine = (a, b) => dot(a, b) / (norm(a) * norm(b) + 1e-8);

const extractor = await pipeline('feature-extraction', 'Xenova/bge-small-en-v1.5', { dtype: 'q8' });
const embed = async (t) => Array.from((await extractor(t, { pooling: 'mean', normalize: true })).data);

const queries = [
  'What other FedEx roles did he have?',
  'Tell me about his ML skills',
  'Tell me about the FedEx roles',
  'What are his skills?',
];

for (const q of queries) {
  const intent = matchIntent(q);
  const qv = await embed(q);
  const scored = kbEmbeddings.map((v, i) => ({ i, cos: cosine(qv, v) })).sort((a, b) => b.cos - a.cos);
  const primaryIdx = intent?.idx ?? scored[0].i;
  console.log(`\nQ: ${q}`);
  console.log(`  intent: ${intent ? intent.idx : 'none'}`);
  console.log(`  primary: [${KB[primaryIdx].id}] idx=${primaryIdx}`);
  console.log(`  answer: ${KB[primaryIdx].answer.slice(0, 100)}...`);
}
