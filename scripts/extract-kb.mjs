// One-off: pull the KB array out of the legacy agent.js and write it to kb.json
// so the knowledge base has a single, data-only source of truth.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(root, 'agent.js'), 'utf8');

const start = src.indexOf('const KB = [');
if (start === -1) throw new Error('Could not find "const KB = [" in agent.js');
const arrStart = src.indexOf('[', start);
const arrEnd = src.indexOf('\n];', arrStart);
if (arrEnd === -1) throw new Error('Could not find end of KB array');

const literal = src.slice(arrStart, arrEnd + 2); // include the closing "]"
// eslint-disable-next-line no-eval
const KB = eval(literal);

fs.writeFileSync(path.join(root, 'kb.json'), JSON.stringify(KB, null, 2) + '\n');
console.log(`Wrote kb.json with ${KB.length} entries`);
