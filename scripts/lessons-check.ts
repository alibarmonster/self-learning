/**
 * Sanity checks for the deep-dive lessons: unique section ids, quiz answers in
 * range, balanced SVG markup in figures, and practice links that point at a
 * lab scenario that exists. Run with `bun scripts/lessons-check.ts`.
 */
import { GOOGLE_CLOUD_LESSONS } from '../src/lessons';
import { CMD_BY_ID } from '../src/lab/cmd/bank';
import { TERM_BY_ID } from '../src/lab/term/scenarios';
import { CANVAS_BY_ID } from '../src/lab/canvas/scenarios';

let failed = 0;
const fail = (msg: string) => {
  console.log(`✗ ${msg}`);
  failed++;
};

const balanced = (svg: string) => {
  const stack: string[] = [];
  for (const m of svg.matchAll(/<(\/?)([a-zA-Z]+)[^>]*?(\/?)>/g)) {
    const [, close, tag, self] = m;
    if (self) continue;
    if (close) {
      if (stack.pop() !== tag) return false;
    } else stack.push(tag);
  }
  return stack.length === 0;
};

for (const meta of GOOGLE_CLOUD_LESSONS) {
  const { lesson } = await meta.load();
  if (lesson.id !== meta.id) fail(`${meta.id}: lesson id is ${lesson.id}`);
  const ids = new Set<string>();
  let quizzes = 0;
  for (const part of lesson.parts)
    for (const s of part.sections) {
      if (ids.has(s.id)) fail(`${meta.id}: duplicate section id ${s.id}`);
      ids.add(s.id);
      if (!s.blocks.length) fail(`${meta.id}/${s.id}: empty section`);
      for (const b of s.blocks) {
        if (b.kind === 'quiz') {
          quizzes++;
          if (b.answer < 0 || b.answer >= b.options.length) fail(`${meta.id}/${s.id}: quiz answer out of range — ${b.q}`);
          if (new Set(b.options).size !== b.options.length) fail(`${meta.id}/${s.id}: duplicate options — ${b.q}`);
        }
        if (b.kind === 'figure' && (!balanced(b.svg) || /NaN|undefined/.test(b.svg))) fail(`${meta.id}/${s.id}: figure markup is broken`);
        if (b.kind === 'table' && b.rows.some((r) => r.length !== b.columns.length)) fail(`${meta.id}/${s.id}: table row width differs from its columns`);
      }
    }
  for (const l of lesson.practice) {
    const [, , , mode, id] = l.href.split('/');
    const known = mode === 'cmd' ? CMD_BY_ID[id] : mode === 'terminal' ? TERM_BY_ID[id] : mode === 'canvas' ? CANVAS_BY_ID[id] : undefined;
    if (!known) fail(`${meta.id}: practice link ${l.href} points nowhere`);
  }
  if (!failed) console.log(`✓ ${meta.id}: ${ids.size} sections, ${quizzes} quiz questions`);
}
if (failed) process.exit(1);
