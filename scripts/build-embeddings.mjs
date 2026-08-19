// Offline embedding builder.
//
// Precomputes an embedding vector for every knowledge-base entry in kb.json and
// writes them to kb-embeddings.json. The browser agent loads that file directly
// instead of re-embedding the whole KB on every page load, so at runtime only the
// user's single query is embedded in-browser (same model => same vector space).
//
// IMPORTANT: The model + pooling + normalization here MUST match agent.js exactly.
//   model:     Xenova/bge-small-en-v1.5
//   dtype:     q8
//   pooling:   mean
//   normalize: true
//
// Run with:  npm run build:embeddings
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from '@huggingface/transformers';

const EMBED_MODEL = 'Xenova/bge-small-en-v1.5';
const EMBED_DTYPE = 'q8';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const kbPath = path.join(root, 'kb.json');
const outPath = path.join(root, 'kb-embeddings.json');

const KB = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
if (!Array.isArray(KB) || KB.length === 0) {
  throw new Error('kb.json is empty or not an array');
}

console.log(`Loading embedding model ${EMBED_MODEL} (${EMBED_DTYPE})...`);
const extractor = await pipeline('feature-extraction', EMBED_MODEL, { dtype: EMBED_DTYPE });

async function embed(text) {
  const out = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(out.data);
}

const vectors = [];
for (let i = 0; i < KB.length; i++) {
  const entry = KB[i];
  const vec = await embed(entry.text);
  vectors.push({ id: entry.id, vector: vec });
  process.stdout.write(`\rEmbedded ${i + 1}/${KB.length}`);
}
process.stdout.write('\n');

const dim = vectors[0].vector.length;
const payload = {
  model: EMBED_MODEL,
  dtype: EMBED_DTYPE,
  pooling: 'mean',
  normalize: true,
  dim,
  count: vectors.length,
  builtAt: new Date().toISOString(),
  vectors,
};

fs.writeFileSync(outPath, JSON.stringify(payload));
console.log(`Wrote ${outPath} (${vectors.length} vectors, dim ${dim})`);
