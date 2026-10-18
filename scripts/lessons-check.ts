/**
 * Sanity checks for the deep-dive lessons: unique section ids, quiz answers in
 * range, balanced SVG markup in figures, firewall exercises whose intended
 * answers the evaluator agrees with, and practice links that point at a lab
 * scenario that exists. Run with `bun scripts/lessons-check.ts`.
 */
import { GOOGLE_CLOUD_LESSONS } from '../src/lessons';
import { CMD_BY_ID } from '../src/lab/cmd/bank';
import { TERM_BY_ID } from '../src/lab/term/scenarios';
import { CANVAS_BY_ID } from '../src/lab/canvas/scenarios';
import { NET_BY_ID } from '../src/lab/net/scenarios';
import { cidrInfo, describePacket, evaluate, parseCidr } from '../src/lessons/net';

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
  let packets = 0;
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
        if (b.kind === 'cidr' && !cidrInfo(b.value).ok) fail(`${meta.id}/${s.id}: calculator starts from an invalid range ${b.value}`);
        if (b.kind === 'firewall') {
          const names = new Set(b.vms.map((v) => v.name));
          if (new Set(b.rules.map((r) => r.name)).size !== b.rules.length) fail(`${meta.id}/${s.id}: duplicate firewall rule names`);
          for (const r of b.rules) {
            const ranges = [...(r.sources ?? []), ...(r.destinations ?? [])];
            if (ranges.some((c) => !parseCidr(c))) fail(`${meta.id}/${s.id}: ${r.name} has a range that does not parse`);
            if (r.direction === 'EGRESS' && (r.sources?.length || r.sourceTags?.length)) fail(`${meta.id}/${s.id}: egress rule ${r.name} has sources`);
            if (r.targetSa && r.targetTags?.length) fail(`${meta.id}/${s.id}: ${r.name} mixes a target service account and target tags`);
          }
          for (const p of b.packets) {
            packets++;
            if (!names.has(p.vm)) fail(`${meta.id}/${s.id}: packet names unknown VM ${p.vm}`);
            const v = evaluate(b.vms, b.rules, p);
            if (v.action !== p.expect) fail(`${meta.id}/${s.id}: ${describePacket(p)} is ${v.action} by ${v.rule}, lesson says ${p.expect}`);
          }
        }
      }
    }
  for (const l of lesson.practice) {
    const [, , , mode, id] = l.href.split('/');
    const known =
      mode === 'cmd' ? CMD_BY_ID[id] : mode === 'terminal' ? TERM_BY_ID[id] : mode === 'canvas' ? CANVAS_BY_ID[id] : mode === 'network' ? NET_BY_ID[id] : undefined;
    if (!known) fail(`${meta.id}: practice link ${l.href} points nowhere`);
  }
  if (!failed) console.log(`✓ ${meta.id}: ${ids.size} sections, ${quizzes} quiz questions${packets ? `, ${packets} firewall verdicts` : ''}`);
}
if (failed) process.exit(1);
