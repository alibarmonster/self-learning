/**
 * Grades a typed command against a question's accepted answers. Both sides go
 * through the same parser, so the comparison is about meaning: flag order,
 * `--flag=value` against `--flag value`, aliases, `TYPE/NAME`, gsutil against
 * gcloud storage — none of those matter. What matters is the command, its
 * arguments and the flags the task needs, with the values it asks for.
 *
 * Answer patterns are written as commands with three extras:
 *   <ANY>       any value              {a|b}  either spelling
 *   [--flag=v]  optional, but if given it must have this value
 */
import { flagSpecs, normalisePath, valueMatches, type CmdSpec, type FlagSpec, type Parsed } from './grammar';
import { tokenize } from '../term/shell';
import { parseLine, parseWords, type ParseResult } from './parse';
import { BQ_GLOBAL, GCLOUD_GLOBAL, GSUTIL_TOP, KUBECTL_GLOBAL } from './specs';

export interface Trap {
  /** Tested against the typed line. */
  when: RegExp;
  /** What to tell the learner, in Indonesian. */
  say: string;
}

export interface CmdItem {
  id: string;
  /** The task, in English as the cheat sheet words it; values to use in `backticks`. */
  prompt: string;
  /** Accepted patterns; the first is the one shown as the answer. */
  answers: string[];
  /** Why this is the command, in Indonesian. Shown after a correct answer or a reveal. */
  explain: string;
  /** A nudge that does not give the answer away. */
  hint?: string;
  traps?: Trap[];
  /** Flags that make an otherwise valid answer wrong, with the reason. */
  forbid?: Record<string, string>;
  /** How the answer is shown when the pattern holds a placeholder (`<SQL>`). */
  display?: string;
}

export interface Expected {
  raw: string;
  p: Parsed;
  spec: CmdSpec;
  optional: Set<string>;
}

const compiled = new Map<string, Expected>();

/** The first spelling of each choice, and a harmless stand-in for each placeholder. */
const concrete = (tok: string) => tok.replace(/\{([^{}|]*)\|[^{}]*\}/g, '$1').replace(/<[^<>]+>/g, 'x');

/**
 * Parses a pattern by parsing a concrete instance of it (so the CLI's own
 * validation still runs), then puts the pattern's `{a|b}` and `<ANY>` back
 * into the parsed values.
 */
function parsePattern(src: string): ParseResult | null {
  const toks = tokenize(src);
  if (!Array.isArray(toks)) throw new Error(`answer pattern does not tokenize: "${src}"`);
  const back = new Map<string, string>();
  const words = toks.map((t) => {
    const c = concrete(t);
    if (c !== t) {
      back.set(c, t);
      const eq = t.indexOf('=');
      if (t.startsWith('-') && eq > 0) back.set(c.slice(c.indexOf('=') + 1), t.slice(eq + 1));
    }
    return c;
  });
  const r = parseWords(words);
  if (r?.ok && back.size) {
    const restore = (v: string) => back.get(v) ?? v;
    r.p.pos = r.p.pos.map(restore);
    r.p.rest = r.p.rest?.map(restore) ?? null;
    for (const k of Object.keys(r.p.flags)) r.p.flags[k] = r.p.flags[k].map(restore);
  }
  return r;
}

/** Parses an answer pattern once. Throws if the pattern itself is not a valid command. */
export function compile(pattern: string): Expected {
  const hit = compiled.get(pattern);
  if (hit) return hit;
  const groups = [...pattern.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]);
  const main = pattern.replace(/\s*\[[^\]]+\]/g, '').trim();
  const full = [main, ...groups].join(' ');
  const base = parsePattern(main);
  const all = parsePattern(full);
  if (!base?.ok || !all?.ok) {
    const why = !all ? 'empty' : all.ok ? (base && !base.ok ? base.lines.join(' / ') : '') : all.lines.join(' / ');
    throw new Error(`answer pattern does not parse: "${pattern}" — ${why}`);
  }
  const optional = new Set(Object.keys(all.p.flags).filter((f) => !(f in base.p.flags)));
  const out = { raw: pattern, p: all.p, spec: all.spec, optional };
  compiled.set(pattern, out);
  return out;
}

/** How an answer pattern is shown: optional parts dropped, the first spelling of each choice. */
export function display(pattern: string): string {
  return pattern
    .replace(/\s*\[[^\]]+\]/g, '')
    .replace(/\{([^{}|]*)\|[^{}]*\}/g, '$1')
    .trim();
}

const GLOBAL_SPECS: FlagSpec[] = [
  ...flagSpecs('gcloud', GCLOUD_GLOBAL),
  ...flagSpecs('kubectl', KUBECTL_GLOBAL),
  ...flagSpecs('bq', BQ_GLOBAL),
  ...flagSpecs('gsutil', GSUTIL_TOP)
];

function flagNorm(spec: CmdSpec, name: string): FlagSpec | undefined {
  return spec.flags.find((f) => f.name === name) ?? GLOBAL_SPECS.find((f) => f.name === name);
}

const show = (tool: string, name: string) => (tool === 'terraform' ? `-${name}` : name.length === 1 ? `-${name}` : `--${name}`);

export interface Diff {
  problems: string[];
  extra: string[];
  /** 0 = right command; higher = further away. */
  distance: number;
}

/** Compares a parsed line with one expected answer. */
export function diff(exp: Expected, got: Parsed, item: CmdItem): Diff {
  const problems: string[] = [];
  const extra: string[] = [];
  if (got.tool !== exp.p.tool)
    return { problems: [`Soal ini dijawab dengan \`${exp.p.tool}\`, bukan \`${got.tool}\`.`], extra, distance: 100 };
  if (got.path.join(' ') !== exp.p.path.join(' ')) {
    const same = got.path.filter((w, i) => exp.p.path[i] === w).length;
    return {
      problems: [`\`${got.tool} ${got.path.join(' ')}\` adalah perintah yang valid, tapi bukan yang diminta soal ini.`],
      extra,
      distance: 50 - same
    };
  }
  let distance = 0;
  // Positionals, in order.
  const ep = exp.p.pos;
  const gp = got.pos;
  if (gp.length < ep.length) {
    problems.push(`Masih ada argumen yang kurang — perintah ini butuh ${ep.length} argumen posisi, kamu menulis ${gp.length}.`);
    distance += 5;
  } else if (gp.length > ep.length) {
    problems.push(`Ada argumen berlebih: \`${gp.slice(ep.length).join(' ')}\`.`);
    distance += 3;
  }
  ep.forEach((v, i) => {
    if (gp[i] === undefined) return;
    if (!valueMatches(normalisePath(v), normalisePath(gp[i]))) {
      problems.push(`Argumen \`${gp[i]}\` belum sesuai soal — cek lagi nama atau nilai yang diminta.`);
      distance += 4;
    }
  });
  // Words after `--`.
  if (exp.p.rest) {
    const er = exp.p.rest.join(' ');
    const gr = (got.rest ?? []).join(' ');
    if (!valueMatches(er, gr)) {
      problems.push(got.rest ? `Bagian setelah \`--\` belum sesuai: \`${gr}\`.` : 'Perintah untuk container ditulis setelah `--`.');
      distance += 3;
    }
  }
  // Flags the answer needs.
  for (const [name, want] of Object.entries(exp.p.flags)) {
    const have = got.flags[name];
    const f = flagNorm(exp.spec, name);
    if (!have) {
      if (exp.optional.has(name)) continue;
      problems.push(`Masih kurang ${show(got.tool, name)}.`);
      distance += 3;
      continue;
    }
    const left = [...have];
    const ok = want.every((w) => {
      const i = left.findIndex((h) => valueMatches(w, h, f?.norm));
      if (i < 0) return false;
      left.splice(i, 1);
      return true;
    });
    if (!ok) {
      const shown = have.map((h) => (f?.bool ? (h === 'true' ? 'aktif' : 'nonaktif') : h)).join(', ');
      problems.push(f?.bool ? `${show(got.tool, name)} seharusnya ${want[0] === 'true' ? 'aktif' : 'dimatikan'}.` : `Nilai ${show(got.tool, name)} belum sesuai soal (kamu menulis ${shown}).`);
      distance += 2;
    }
  }
  // Flags beyond the answer: fine unless the task rules them out.
  for (const name of Object.keys(got.flags)) {
    if (name in exp.p.flags) continue;
    const reason = item.forbid?.[name];
    if (reason) {
      problems.push(reason);
      distance += 3;
    } else extra.push(show(got.tool, name));
  }
  return { problems, extra, distance };
}

export interface Verdict {
  correct: boolean;
  /** The answer pattern the line was judged against. */
  against: string;
  /** Feedback lines in Indonesian. */
  feedback: string[];
  /** Flags typed beyond what the task needs (still correct). */
  extra: string[];
}

/** Judges a typed line. `r` is the parse of that line (already printed by the caller). */
export function judge(item: CmdItem, line: string, r: ParseResult): Verdict {
  const feedback: string[] = [];
  for (const t of item.traps ?? []) if (t.when.test(line.trim())) feedback.push(t.say);
  if (!r.p) {
    return { correct: false, against: item.answers[0], feedback: feedback.length ? feedback : item.hint ? [item.hint] : [], extra: [] };
  }
  let best: { d: Diff; raw: string } | null = null;
  for (const raw of item.answers) {
    const d = diff(compile(raw), r.p, item);
    if (!best || d.problems.length * 10 + d.distance < best.d.problems.length * 10 + best.d.distance) best = { d, raw };
  }
  const { d, raw } = best!;
  const correct = r.ok && d.problems.length === 0;
  if (!correct) {
    // The CLI error already says what broke; add our reading of it.
    feedback.push(...d.problems.slice(0, 2));
    if (d.distance >= 40 && item.hint) feedback.push(item.hint);
  }
  return { correct, against: raw, feedback: [...new Set(feedback)], extra: correct ? d.extra : [] };
}

/** The answer as shown to the learner. */
export const shownAnswer = (item: CmdItem) => item.display ?? display(item.answers[0]);

/** Every pattern in `items` parses and is answered by its own display form. */
export function selfCheck(items: CmdItem[]): string[] {
  const errors: string[] = [];
  for (const it of items) {
    for (const [i, a] of it.answers.entries()) {
      try {
        const exp = compile(a);
        const shown = i === 0 && it.display ? it.display : display(a);
        const r = parseLine(shown);
        if (!r?.ok) {
          errors.push(`${it.id}: display form of "${a}" fails: ${r ? r.lines[0] : 'empty'}`);
          continue;
        }
        const d = diff(exp, r.p, it);
        if (d.problems.length) errors.push(`${it.id}: "${shown}" does not satisfy its own pattern: ${d.problems.join(' ')}`);
      } catch (e) {
        errors.push(`${it.id}: ${(e as Error).message}`);
      }
    }
  }
  return errors;
}
