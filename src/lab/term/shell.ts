/**
 * The terminal lab's shell: splits a command line like bash would, parses
 * flags the way gcloud/kubectl do, and collects the lines a command prints.
 */
import type { CloudState } from './state';

export type LineKind = 'cmd' | 'out' | 'err' | 'warn' | 'info' | 'ok';

export interface Line {
  kind: LineKind;
  text: string;
}

export class Out {
  lines: Line[] = [];
  out(...text: string[]) {
    for (const t of text) for (const l of t.split('\n')) this.lines.push({ kind: 'out', text: l });
  }
  err(text: string) {
    for (const l of text.split('\n')) this.lines.push({ kind: 'err', text: l });
  }
  warn(text: string) {
    this.lines.push({ kind: 'warn', text });
  }
  info(text: string) {
    for (const l of text.split('\n')) this.lines.push({ kind: 'info', text: l });
  }
  ok(text: string) {
    this.lines.push({ kind: 'ok', text });
  }
  /** A gcloud-style table: upper-case headers, columns padded and two spaces apart. */
  table(headers: string[], rows: (string | number | null | undefined)[][]) {
    if (!rows.length) {
      this.info('Listed 0 items.');
      return;
    }
    const cells = rows.map((r) => r.map((c) => (c === null || c === undefined || c === '' ? '' : String(c))));
    const widths = headers.map((h, i) => Math.max(h.length, ...cells.map((r) => (r[i] ?? '').length)));
    const fmt = (r: string[]) => r.map((c, i) => (i === r.length - 1 ? c : c.padEnd(widths[i]))).join('  ').trimEnd();
    this.out(fmt(headers.map((h) => h.toUpperCase())));
    for (const r of cells) this.out(fmt(r));
  }
}

/** Splits a command line into words: quotes, backslash escapes, no globbing. */
export function tokenize(line: string): string[] | { error: string } {
  const out: string[] = [];
  let cur = '';
  let quote: '"' | "'" | null = null;
  let has = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      if (ch === quote) quote = null;
      else if (ch === '\\' && quote === '"' && i + 1 < line.length) cur += line[++i];
      else cur += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      has = true;
    } else if (ch === '\\' && i + 1 < line.length) {
      cur += line[++i];
      has = true;
    } else if (/\s/.test(ch)) {
      if (has) out.push(cur);
      cur = '';
      has = false;
    } else {
      cur += ch;
      has = true;
    }
  }
  if (quote) return { error: `unexpected EOF while looking for matching \`${quote}'` };
  if (has) out.push(cur);
  return out;
}

export interface Args {
  /** Positional words, the command path included. */
  pos: string[];
  /** `--zone=x`, `--zone x`, `-n x`; boolean flags map to true. */
  flags: Record<string, string | true>;
}

/**
 * Splits words into positionals and flags. A flag takes the next word as its
 * value unless it is written `--flag=value`, is a known boolean, or the next
 * word is itself a flag.
 */
export function parseArgs(words: string[], booleans: Set<string>): Args {
  const pos: string[] = [];
  const flags: Record<string, string | true> = {};
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (w === '--') {
      pos.push(...words.slice(i + 1));
      break;
    }
    if (/^--?[A-Za-z]/.test(w)) {
      const body = w.replace(/^--?/, '');
      const eq = body.indexOf('=');
      if (eq >= 0) {
        flags[body.slice(0, eq)] = body.slice(eq + 1);
        continue;
      }
      const next = words[i + 1];
      if (booleans.has(body) || next === undefined || /^--?[A-Za-z]/.test(next)) flags[body] = true;
      else {
        flags[body] = next;
        i++;
      }
      continue;
    }
    pos.push(w);
  }
  return { pos, flags };
}

/** A flag's string value, under any of its spellings. */
export function flag(a: Args, ...names: string[]): string | undefined {
  for (const n of names) {
    const v = a.flags[n];
    if (typeof v === 'string') return v;
  }
  return undefined;
}

export function bool(a: Args, ...names: string[]): boolean {
  return names.some((n) => n in a.flags && a.flags[n] !== 'false');
}

/** `a,b,c` → ['a','b','c']. */
export function list(v: string | undefined): string[] {
  return v ? v.split(',').map((x) => x.trim()).filter(Boolean) : [];
}

export interface Ctx {
  s: CloudState;
  o: Out;
  /** The words after the tool name, e.g. ['compute', 'instances', 'list']. */
  words: string[];
}

export type Tool = (ctx: Ctx) => void;

/**
 * Finds the longest registered command path at the start of `pos`, e.g.
 * `compute instances create` out of `compute instances create web-1`.
 */
export function route<T>(table: Record<string, T>, pos: string[]): { key: string; handler: T; rest: string[] } | null {
  for (let n = Math.min(pos.length, 5); n > 0; n--) {
    const key = pos.slice(0, n).join(' ');
    if (key in table) return { key, handler: table[key], rest: pos.slice(n) };
  }
  return null;
}

/** Suggests registered paths that share the words typed so far. */
export function suggest(table: Record<string, unknown>, pos: string[]): string[] {
  const typed = pos.join(' ');
  for (let n = pos.length; n > 0; n--) {
    const prefix = pos.slice(0, n).join(' ');
    const hits = Object.keys(table).filter((k) => k.startsWith(prefix + ' ') || k === prefix);
    if (hits.length) return hits.slice(0, 12);
  }
  return typed ? [] : Object.keys(table).slice(0, 12);
}

export function age(): string {
  return `${10 + Math.floor(Math.random() * 40)}s`;
}
