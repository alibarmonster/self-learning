/**
 * Splits an exam's bank into fixed, numbered practice sets and writes them to
 * src/exams/<id>/sets.ts. Run once; the file it writes is then the source, so
 * the sets stay the same however the bank is edited later.
 *
 *   bun scripts/tools/make-sets.ts ace 50
 *
 * Each full set gets a fair share of every section (questions are dealt round
 * the sets section by section), and no question appears in two sets. When the
 * bank does not divide evenly, a randomly chosen remainder becomes a final,
 * shorter set. The draw is seeded, so rerunning gives the same sets.
 */
import { writeFileSync } from 'node:fs';
import { EXAM_DATA } from '@/exams/registry';

const [examId = 'ace', sizeArg = '50', seedArg = '2026'] = process.argv.slice(2);
const size = Number(sizeArg);
const exam = EXAM_DATA.find((e) => e.id === examId);
if (!exam) throw new Error(`no exam "${examId}"`);

// mulberry32: tiny, seedable, good enough to deal cards.
let state = Number(seedArg) >>> 0;
const random = () => {
  state = (state + 0x6d2b79f5) >>> 0;
  let t = state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const shuffle = <T>(items: T[]): T[] => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const all = exam.sections.flatMap((s) => s.questions.map((q) => ({ id: q.id, section: s.id })));
const full = Math.floor(all.length / size);
const remainder = new Set(shuffle(all).slice(0, all.length - full * size).map((q) => q.id));

const sets: string[][] = Array.from({ length: full }, () => []);
let k = 0;
for (const section of exam.sections) {
  const pool = shuffle(section.questions.map((q) => q.id).filter((id) => !remainder.has(id)));
  for (const id of pool) sets[k++ % full].push(id);
}
if (remainder.size) sets.push(shuffle([...remainder]));
const dealt = sets.map(shuffle);

const pad = String(dealt.length).length < 2 ? 2 : String(dealt.length).length;
const body = dealt
  .map((ids, i) => {
    const n = String(i + 1).padStart(pad, '0');
    const list = ids.map((id) => `'${id}'`).join(', ');
    return `  {\n    id: 'set-${n}',\n    name: 'Set ${n}',\n    questionIds: [${list}]\n  }`;
  })
  .join(',\n');

const file = `/**
 * Fixed practice sets for ${exam.name}: ${full} sets of ${size}${remainder.size ? ` and a final set of ${remainder.size}` : ''},
 * no question in two sets, every section spread across them. Written by
 * scripts/tools/make-sets.ts (seed ${seedArg}); this file is now the source, so the
 * sets stay the same when the bank is edited.
 */
import type { PaperSet } from '@/types';

export const sets: PaperSet[] = [
${body}
];
`;
writeFileSync(`src/exams/${examId}/sets.ts`, file);
console.log(dealt.map((s, i) => `set ${i + 1}: ${s.length}`).join(', '));
