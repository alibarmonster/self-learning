/**
 * Reads one typed command the way its real CLI would: walks the command tree,
 * reads flags in that tool's style (gcloud argparse, kubectl/docker pflag,
 * gsutil getopt, bq absl, terraform Go flags) and, when the line would fail,
 * returns the error text that tool prints. A line that parses comes back
 * canonical — aliases resolved, `TYPE/NAME` split, `--location` mapped — so
 * the grader can compare meaning rather than spelling.
 */
import { tokenize } from '../term/shell';
import {
  allNodes,
  distance,
  flagSpecs,
  normalise,
  ratio,
  spell,
  type CmdSpec,
  type FlagSpec,
  type Parsed,
  type ToolName,
  type TreeNode
} from './grammar';
import {
  BQ_GLOBAL,
  COMPOSE_GLOBAL,
  DOCKER_GLOBAL,
  GCLOUD_GLOBAL,
  GSUTIL_TOP,
  KUBECTL_GLOBAL,
  KUBE_PODLIKE,
  KUBE_TYPED,
  KUBE_TYPES,
  TF_GLOBAL,
  TREES,
  containerLocation,
  gerr
} from './specs';

export type ParseResult =
  | { ok: true; p: Parsed; spec: CmdSpec; warnings: string[]; notes: string[] }
  /** `p` is set when the command was recognised but its arguments were wrong. */
  | { ok: false; lines: string[]; p?: Parsed; spec?: CmdSpec; notes: string[] };

export const TOOLS: ToolName[] = ['gcloud', 'gsutil', 'kubectl', 'bq', 'terraform', 'docker'];

const GLOBALS: Record<ToolName, FlagSpec[]> = {
  gcloud: flagSpecs('gcloud', GCLOUD_GLOBAL),
  gsutil: flagSpecs('gsutil', GSUTIL_TOP),
  kubectl: flagSpecs('kubectl', KUBECTL_GLOBAL),
  bq: flagSpecs('bq', BQ_GLOBAL),
  terraform: flagSpecs('terraform', TF_GLOBAL),
  docker: flagSpecs('docker', DOCKER_GLOBAL)
};
const COMPOSE_FLAGS = flagSpecs('docker', COMPOSE_GLOBAL);

interface Hit {
  f: FlagSpec;
  neg?: boolean;
}

function index(tool: ToolName, specs: FlagSpec[]): Map<string, Hit> {
  const m = new Map<string, Hit>();
  for (const f of specs) {
    m.set(spell(tool, f.name), { f });
    if (tool === 'terraform') m.set(`--${f.name}`, { f });
    for (const a of f.aliases) m.set(a, { f });
  }
  for (const f of specs) {
    if (!f.bool || f.name.length === 1) continue;
    const neg = tool === 'bq' ? `--no${f.name}` : tool === 'terraform' ? '' : `--no-${f.name}`;
    if (neg && !m.has(neg)) m.set(neg, { f, neg: true });
  }
  return m;
}

const BOOL_WORDS: Record<string, string> = { true: 'true', false: 'false', '1': 'true', '0': 'false', yes: 'true', no: 'false', on: 'true', off: 'false' };
const isFlagLike = (s: string) => /^--?[A-Za-z]/.test(s);

interface Read {
  pos: string[];
  flags: Record<string, string[]>;
  rest: string[] | null;
  unknown: string[];
  needValue?: string;
  badShort?: { ch: string; tok: string };
  badValue?: { flag: string; value: string };
}

function readFlags(tool: ToolName, tokens: string[], idx: Map<string, Hit>, spec: CmdSpec): Read {
  const r: Read = { pos: [], flags: {}, rest: null, unknown: [] };
  const add = (f: FlagSpec, v: string) => {
    if (f.repeat) (r.flags[f.name] ??= []).push(v);
    else r.flags[f.name] = [v];
  };
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (tok === '--') {
      if (spec.dashArgs) r.rest = tokens.slice(i + 1);
      else r.pos.push(...tokens.slice(i + 1));
      break;
    }
    const long = tool === 'terraform' ? /^--?[A-Za-z]/.test(tok) : tok.startsWith('--') && tok.length > 2;
    if (long) {
      const eq = tok.indexOf('=');
      const key = eq >= 0 ? tok.slice(0, eq) : tok;
      const hit = idx.get(key);
      if (!hit) {
        r.unknown.push(tok);
        continue;
      }
      if (hit.f.bool) {
        let v = 'true';
        if (eq >= 0) {
          const given = tok.slice(eq + 1).toLowerCase();
          if (!(given in BOOL_WORDS)) {
            r.badValue = { flag: key, value: tok.slice(eq + 1) };
            continue;
          }
          v = BOOL_WORDS[given];
        }
        if (hit.neg) v = v === 'true' ? 'false' : 'true';
        add(hit.f, v);
      } else {
        let v = eq >= 0 ? tok.slice(eq + 1) : undefined;
        if (v === undefined) {
          const nx = tokens[i + 1];
          if (nx === undefined || (isFlagLike(nx) && tool !== 'kubectl')) {
            r.needValue = key;
            continue;
          }
          v = nx;
          i++;
        }
        add(hit.f, v);
      }
      continue;
    }
    if (tok.startsWith('-') && tok.length > 1 && !/^-\d/.test(tok)) {
      const body = tok.slice(1);
      for (let k = 0; k < body.length; k++) {
        const hit = idx.get(`-${body[k]}`);
        if (!hit) {
          if (tool === 'kubectl' || tool === 'docker') r.badShort = { ch: body[k], tok };
          else r.unknown.push(tok);
          break;
        }
        if (hit.f.bool) {
          add(hit.f, 'true');
          continue;
        }
        let v = body.slice(k + 1).replace(/^=/, '');
        if (!v) {
          const nx = tokens[i + 1];
          if (nx === undefined) {
            r.needValue = `-${body[k]}`;
            break;
          }
          v = nx;
          i++;
        }
        add(hit.f, v);
        break;
      }
      continue;
    }
    r.pos.push(tok);
    if (spec.stopAtPos) {
      r.pos.push(...tokens.slice(i + 1));
      break;
    }
  }
  return r;
}

interface Walked {
  node: TreeNode;
  used: Set<number>;
  bad?: { i: number; word: string };
}

function walk(tree: TreeNode, words: string[], valueFlags: Set<string>): Walked {
  let node = tree;
  const used = new Set<number>();
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (w.startsWith('-') && w.length > 1) {
      if (!w.includes('=') && valueFlags.has(w)) i++;
      continue;
    }
    const kid = node.kids.get(w);
    if (kid) {
      node = kid;
      used.add(i);
      continue;
    }
    if (node.spec) break;
    return { node, used, bad: { i, word: w } };
  }
  return { node, used };
}

const valueSpellings = (tool: ToolName, specs: FlagSpec[]) =>
  new Set(specs.filter((f) => !f.bool).flatMap((f) => [spell(tool, f.name), ...f.aliases]));

function posBounds(spec: CmdSpec): { min: number; max: number } {
  const min = spec.pos.filter((p) => !p.optional).length;
  const max = spec.pos.some((p) => p.many) ? Infinity : spec.pos.length;
  return { min, max };
}

const posLabel = (p: { name: string; many: boolean }) => (p.many ? `${p.name} [${p.name} ...]` : p.name);

function checkChoices(spec: CmdSpec, flags: Record<string, string[]>): { f: FlagSpec; v: string } | null {
  for (const f of spec.flags) {
    if (!f.choices || !flags[f.name]) continue;
    const allowed = f.choices.map((c) => normalise(c, f.norm));
    for (const v of flags[f.name]) if (!allowed.includes(normalise(v, f.norm))) return { f, v };
  }
  return null;
}

function missingRequired(spec: CmdSpec, r: Read): string[] {
  const out: string[] = [];
  const { min } = posBounds(spec);
  if (r.pos.length < min) out.push(...spec.pos.filter((p) => !p.optional).slice(r.pos.length).map(posLabel));
  for (const f of spec.flags) if (f.required && !(f.name in r.flags)) out.push(spell(spec.tool, f.name));
  return out;
}

// ── gcloud ──────────────────────────────────────────────────────────────────

const HELP_HINT = ['To search the help text of gcloud commands, run:', '  gcloud help -- SEARCH_TERMS'];

const wrapUsage = (label: string, items: string[]): string[] => {
  const pad = ' '.repeat(25);
  const lines: string[] = [];
  let cur = `  ${label.padEnd(23)}`;
  items.forEach((it, i) => {
    const piece = (i ? ' | ' : '') + it;
    if (cur.length + piece.length > 80 && cur.trim().length) {
      lines.push(cur.trimEnd());
      cur = pad + it;
    } else cur += piece;
  });
  lines.push(cur);
  return lines;
};

const flagMeta = (f: FlagSpec) => f.name.toUpperCase().replace(/-/g, '_');

export function gcloudUsage(spec: CmdSpec): string[] {
  const path = `gcloud ${spec.path.join(' ')}`;
  const pos = spec.pos.map((p) => (p.optional ? `[${posLabel(p)}]` : posLabel(p)));
  const grouped = new Set(spec.oneOf.flat());
  const req = spec.flags.filter((f) => f.required && !grouped.has(f.name)).map((f) => (f.bool ? `--${f.name}` : `--${f.name}=${flagMeta(f)}`));
  const groups = spec.oneOf.map((g) => `(${g.map((n) => `--${n}`).join(' | ')})`);
  const optional = spec.flags.filter((f) => !f.required && !grouped.has(f.name)).map((f) => `--${f.name}`).sort();
  return [
    `Usage: ${[path, ...pos, ...req, ...groups, optional.length ? '[optional flags]' : ''].filter(Boolean).join(' ')}`,
    ...(optional.length ? wrapUsage('optional flags may be', optional) : []),
    '',
    'For detailed information on this command and its flags, run:',
    `  ${path} --help`
  ];
}

function groupUsage(node: TreeNode, tool: string): string[] {
  const kids = node.order.map((w) => node.kids.get(w)!).filter((k) => !k.hidden);
  const groups = kids.filter((k) => !k.spec).map((k) => k.word);
  const cmds = kids.filter((k) => k.spec).map((k) => k.word);
  const path = [tool, ...node.path].join(' ');
  return [
    `Usage: ${path} [optional flags] <group | command>`,
    ...(groups.length ? wrapUsage('group may be', groups) : []),
    ...(cmds.length ? wrapUsage('command may be', cmds) : []),
    '',
    'For detailed information on this command and its flags, run:',
    `  ${path} --help`
  ];
}

const SYNONYMS: Record<string, string> = {
  create: 'add',
  add: 'create',
  delete: 'remove',
  remove: 'delete',
  describe: 'get',
  get: 'describe',
  show: 'describe',
  make: 'create',
  modify: 'update',
  patch: 'update',
  change: 'update',
  instance: 'instances',
  instances: 'instance',
  init: 'init'
};

/** gcloud's "Maybe you meant": close commands anywhere in the tree, then the group's own subcommands. */
function gcloudSuggest(tree: TreeNode, group: TreeNode, bad: string, after: string[]): string[] {
  const scored: { path: string[]; score: number }[] = [];
  const inGroup = (n: TreeNode) => group.path.every((w, i) => n.path[i] === w);
  for (const n of allNodes(tree)) {
    if (n.hidden) continue;
    const last = n.path[n.path.length - 1];
    const exact = last === bad || SYNONYMS[bad] === last;
    const score = exact ? 1 : ratio(last, bad);
    // Near misses count inside the group being typed; exact names count anywhere (`auth init` → `init`).
    if (score >= 0.7 && (exact || inGroup(n))) {
      // Follow the rest of what was typed, so `comptue instances list` → `compute instances list`.
      let node = n;
      for (const w of after) {
        const k = node.kids.get(w);
        if (!k) break;
        node = k;
      }
      scored.push({ path: node.path, score: score + (n.path.length === group.path.length + 1 ? 0.01 : 0) });
    }
  }
  scored.sort((a, b) => b.score - a.score || a.path.length - b.path.length);
  const sims = scored.slice(0, 10).map((s) => `gcloud ${s.path.join(' ')}`);
  const kids = group.path.length
    ? group.order.filter((w) => !group.kids.get(w)!.hidden).map((w) => `gcloud ${[...group.path, w].join(' ')}`)
    : [];
  const all = [...new Set([...sims, ...kids])];
  return all.filter((s) => !all.some((o) => o !== s && o.startsWith(s + ' ')));
}

function parseGcloud(words: string[], notes: string[]): ParseResult {
  const tree = TREES.gcloud;
  const globals = GLOBALS.gcloud;
  let track: string | undefined;
  const firstWord = words.findIndex((w) => !w.startsWith('-'));
  if (firstWord >= 0 && (words[firstWord] === 'beta' || words[firstWord] === 'alpha')) {
    track = words[firstWord];
    words = words.filter((_, i) => i !== firstWord);
  }
  const w = walk(tree, words, valueSpellings('gcloud', globals));
  if (w.bad) {
    const tag = `(gcloud${w.node.path.length ? '.' + w.node.path.join('.') : ''})`;
    const after = words.slice(w.bad.i + 1).filter((x) => !x.startsWith('-'));
    const sug = gcloudSuggest(tree, w.node, w.bad.word, after);
    const head = `ERROR: ${tag} Invalid choice: '${w.bad.word}'.`;
    if (sug.length) return { ok: false, lines: [head, 'Maybe you meant:', ...sug.map((s) => `  ${s}`), '', ...HELP_HINT], notes };
    return { ok: false, lines: [head, ...groupUsage(w.node, 'gcloud')], notes };
  }
  if (!w.node.spec) {
    const tag = `(gcloud${w.node.path.length ? '.' + w.node.path.join('.') : ''})`;
    return { ok: false, lines: [`ERROR: ${tag} Command name argument expected.`, '', ...groupUsage(w.node, 'gcloud')], notes };
  }
  const spec = w.node.spec;
  const rest = words.filter((_, i) => !w.used.has(i));
  const all = [...spec.flags, ...globals];
  const r = readFlags('gcloud', rest, index('gcloud', all), spec);
  const p: Parsed = { tool: 'gcloud', path: spec.path, pos: r.pos, flags: r.flags, rest: r.rest, track };
  const fail = (lines: string[]): ParseResult => ({ ok: false, lines, p, spec, notes });
  if (r.flags.help?.[0] === 'true') return { ok: true, p, spec, warnings: [], notes };

  if (r.needValue) return fail([gerr(p, `argument ${r.needValue}: expected one argument`), ...gcloudUsage(spec)]);
  if (r.badValue) return fail([gerr(p, `argument ${r.badValue.flag}: ignored explicit argument '${r.badValue.value}'`), ...gcloudUsage(spec)]);
  const bad = checkChoices(spec, r.flags);
  if (bad) {
    const choices = [...bad.f.choices!].sort();
    const close = choices.map((c) => ({ c, s: ratio(c.toLowerCase(), bad.v.toLowerCase()) })).sort((a, b) => b.s - a.s)[0];
    if (close && close.s >= 0.6) return fail([gerr(p, `argument --${bad.f.name}: Invalid choice: '${bad.v}'. Did you mean '${close.c}'?`), ...gcloudUsage(spec)]);
    return fail([gerr(p, `argument --${bad.f.name}: Invalid choice: '${bad.v}'.`), '', `Valid choices are [${choices.join(', ')}].`]);
  }
  const { max } = posBounds(spec);
  const extra = [...r.unknown, ...r.pos.slice(max)];
  if (extra.length) {
    const known = all.flatMap((f) => [spell('gcloud', f.name), ...f.aliases]);
    const msgs = extra.map((x) => {
      if (!x.startsWith('-')) return x;
      const name = x.split('=')[0];
      const best = known.map((k) => ({ k, s: ratio(k, name) })).sort((a, b) => b.s - a.s)[0];
      return best && best.s >= 0.75 ? `${x} (did you mean '${best.k}'?)` : x;
    });
    if (msgs.length === 1) return fail([gerr(p, `unrecognized arguments: ${msgs[0]} `), '', ...HELP_HINT]);
    return fail([gerr(p, 'unrecognized arguments:'), ...msgs.map((m) => `  ${m}`), ...HELP_HINT.map((h) => `  ${h.trim()}`)]);
  }
  const missing = missingRequired(spec, r);
  if (missing.length) return fail([gerr(p, `argument ${missing.join(' ')}: Must be specified.`), ...gcloudUsage(spec)]);
  for (const g of spec.oneOf) {
    const given = g.filter((n) => n in r.flags);
    const list = g.map((n) => spell('gcloud', n)).join(' | ');
    if (!given.length) return fail([gerr(p, `Exactly one of (${list}) must be specified.`), ...gcloudUsage(spec)]);
    if (given.length > 1) return fail([gerr(p, `argument ${spell('gcloud', given[1])}: At most one of ${list} can be specified.`), ...gcloudUsage(spec)]);
  }
  for (const g of spec.atMostOne) {
    const given = g.filter((n) => n in r.flags);
    if (given.length > 1)
      return fail([gerr(p, `argument ${spell('gcloud', given[1])}: At most one of ${g.map((n) => spell('gcloud', n)).join(' | ')} can be specified.`), ...gcloudUsage(spec)]);
  }
  const checked = spec.check?.(p);
  if (checked) return fail(Array.isArray(checked) ? checked : checked.split('\n'));
  containerLocation(p);
  const warnings = [...deprecations(spec, r.flags), ...(spec.warn?.(p) ?? [])];
  if (track) notes.push(`\`gcloud ${track}\` tidak perlu — perintah ini sudah GA.`);
  return { ok: true, p, spec, warnings, notes };
}

function deprecations(spec: CmdSpec, flags: Record<string, string[]>): string[] {
  return Object.entries(spec.deprecated)
    .filter(([f, msg]) => msg && f in flags)
    .map(([, msg]) => msg);
}

// ── kubectl ─────────────────────────────────────────────────────────────────

function kubeCanon(spec: CmdSpec, p: Parsed): string[] | null {
  const key = spec.path.join(' ');
  if (KUBE_TYPED.has(key)) {
    if (!p.pos.length) return null;
    const [first, ...more] = p.pos;
    if (first.includes('/')) {
      const out: string[] = [];
      for (const x of p.pos) {
        const [t, ...n] = x.split('/');
        if (!n.length || x.includes('=')) {
          out.push(x);
          continue;
        }
        if (!KUBE_TYPES[t.toLowerCase()]) return [`error: the server doesn't have a resource type "${t}"`];
        out.push(`${KUBE_TYPES[t.toLowerCase()]}/${n.join('/')}`);
      }
      p.pos = out;
      return null;
    }
    const t = KUBE_TYPES[first.toLowerCase()];
    if (!t) return [`error: the server doesn't have a resource type "${first}"`];
    const names = more.filter((x) => !x.includes('='));
    const pairs = more.filter((x) => x.includes('='));
    p.pos = names.length ? [...names.map((n) => `${t}/${n}`), ...pairs] : [t, ...pairs];
    return null;
  }
  if (KUBE_PODLIKE.has(key) && p.pos.length) {
    const [first, ...more] = p.pos;
    if (first.includes('/')) {
      const [t, n] = first.split('/');
      if (!KUBE_TYPES[t.toLowerCase()]) return [`error: the server doesn't have a resource type "${t}"`];
      p.pos = [`${KUBE_TYPES[t.toLowerCase()]}/${n}`, ...more];
    } else p.pos = [`pods/${first}`, ...more];
  }
  return null;
}

function parseKubectl(words: string[], notes: string[]): ParseResult {
  const tree = TREES.kubectl;
  const globals = GLOBALS.kubectl;
  const w = walk(tree, words, valueSpellings('kubectl', globals));
  if (w.bad) {
    if (!w.node.path.length) {
      const top = tree.order;
      const sug = top.filter((c) => distance(c, w.bad!.word) <= 2 || c.startsWith(w.bad!.word));
      return { ok: false, lines: [`error: unknown command "${w.bad.word}" for "kubectl"`, ...(sug.length ? ['', 'Did you mean this?', ...sug.map((s) => `\t${s}`)] : [])], notes };
    }
    const g = w.node.path.join(' ');
    const restWords = words.slice(w.bad.i).filter((x) => !x.startsWith('-'));
    if (g === 'create') return { ok: false, lines: [`error: Unexpected args: [${restWords.join(' ')}]`, `See 'kubectl create -h' for help and examples`], notes };
    return { ok: false, lines: [`error: unknown command "${restWords.join(' ')}"`, `See 'kubectl ${g} -h' for help and examples`], notes };
  }
  if (!w.node.spec) {
    const kids = w.node.order.filter((k) => !w.node.kids.get(k)!.hidden);
    return {
      ok: false,
      lines: w.node.path.length
        ? ['Available Commands:', ...kids.map((k) => `  ${k}`), '', 'Usage:', `  kubectl ${w.node.path.join(' ')} SUBCOMMAND [options]`]
        : ['kubectl controls the Kubernetes cluster manager.', '', 'Basic Commands:', `  ${tree.order.slice(0, 12).join('  ')}`, '', 'Usage:', '  kubectl [flags] [options]'],
      notes
    };
  }
  const spec = w.node.spec;
  const rest = words.filter((_, i) => !w.used.has(i));
  const all = [...spec.flags, ...globals];
  const r = readFlags('kubectl', rest, index('kubectl', all), spec);
  const p: Parsed = { tool: 'kubectl', path: spec.path, pos: r.pos, flags: r.flags, rest: r.rest };
  const fail = (lines: string[]): ParseResult => ({ ok: false, lines, p, spec, notes });
  const usageFooter = `See 'kubectl ${spec.path.join(' ')} --help' for usage.`;
  if (r.badShort) return fail([`error: unknown shorthand flag: '${r.badShort.ch}' in ${r.badShort.tok}`, usageFooter]);
  if (r.unknown.length) return fail([`error: unknown flag: ${r.unknown[0].split('=')[0]}`, usageFooter]);
  if (r.needValue)
    return fail([r.needValue.startsWith('--') ? `error: flag needs an argument: ${r.needValue}` : `error: flag needs an argument: '${r.needValue.slice(1)}' in ${r.needValue}`, usageFooter]);
  if (r.badValue) return fail([`error: invalid argument "${r.badValue.value}" for "${r.badValue.flag}" flag: strconv.ParseBool: parsing "${r.badValue.value}": invalid syntax`, usageFooter]);
  const req = spec.flags.filter((f) => f.required && !(f.name in r.flags)).map((f) => `"${f.name}"`);
  if (req.length) return fail([`error: required flag(s) ${req.join(', ')} not set`]);
  const canon = kubeCanon(spec, p);
  if (canon) return fail(canon);
  const checked = spec.check?.(p);
  if (checked) return fail(Array.isArray(checked) ? checked : checked.split('\n'));
  if (p.flags['cpu-percent'] && !p.flags.cpu) {
    p.flags.cpu = p.flags['cpu-percent'].map((v) => `${normalise(v, 'pct')}%`);
    delete p.flags['cpu-percent'];
    return { ok: true, p, spec, warnings: deprecations(spec, { 'cpu-percent': [] }), notes };
  }
  return { ok: true, p, spec, warnings: deprecations(spec, r.flags), notes };
}

// ── gsutil ──────────────────────────────────────────────────────────────────

function gsutilFail(cmd: string, spec: CmdSpec, head: string): string[] {
  return [`CommandException: ${head} Usage:`, '', ...(spec.usage ?? '').split('\n').map((l) => `  ${l}`), '', 'For additional help run:', `  gsutil help ${cmd}`];
}

function parseGsutil(words: string[], notes: string[]): ParseResult {
  const tree = TREES.gsutil;
  const globals = GLOBALS.gsutil;
  const w = walk(tree, words, valueSpellings('gsutil', globals));
  if (w.bad) {
    if (!w.node.path.length) {
      const close = tree.order.map((c) => ({ c, s: ratio(c, w.bad!.word) })).sort((a, b) => b.s - a.s)[0];
      return { ok: false, lines: [...(close && close.s >= 0.6 ? ['Did you mean this?', `\t${close.c}`] : []), `CommandException: Invalid command "${w.bad.word}".`], notes };
    }
    const top = w.node.path[0];
    return { ok: false, lines: [`CommandException: Invalid subcommand "${w.bad.word}" for the ${top} command.`, `See "gsutil help ${top}".`], notes };
  }
  if (!w.node.spec) {
    if (!w.node.path.length) return { ok: false, lines: ['Usage: gsutil [-D] [-DD] [-h header]... [-i service_account] [-m] [-o section:flag=value]... [-q] [-u user_project] [command [opts...] args...]'], notes };
    const kid = w.node.kids.get(w.node.order[0])!.spec!;
    return { ok: false, lines: gsutilFail(w.node.path[0], kid, `The ${w.node.path[0]} command requires at least 1 argument.`), notes };
  }
  const spec = w.node.spec;
  const top = spec.path[0];
  const rest = words.filter((_, i) => !w.used.has(i));
  const all = [...spec.flags, ...globals];
  const r = readFlags('gsutil', rest, index('gsutil', all), spec);
  const p: Parsed = { tool: 'gsutil', path: spec.path, pos: r.pos, flags: r.flags, rest: r.rest };
  const fail = (lines: string[]): ParseResult => ({ ok: false, lines, p, spec, notes });
  if (r.unknown.length || r.needValue || r.badValue) return fail(gsutilFail(top, spec, 'Incorrect option(s) specified.'));
  const bad = checkChoices(spec, r.flags);
  if (bad) return fail([`CommandException: Invalid value "${bad.v}" for -${bad.f.name}. Valid values are: ${bad.f.choices!.join(', ')}.`]);
  const sub = spec.path.length - 1;
  const { min, max } = posBounds(spec);
  if (r.pos.length < min) {
    const n = min + sub;
    return fail(gsutilFail(top, spec, `The ${top} command requires at least ${n} argument${n === 1 ? '' : 's'}.`));
  }
  if (r.pos.length > max) return fail(gsutilFail(top, spec, `The ${top} command accepts at most ${max + sub} arguments.`));
  const checked = spec.check?.(p);
  if (checked) return fail(Array.isArray(checked) ? checked : checked.split('\n'));
  return { ok: true, p, spec, warnings: [], notes };
}

// ── bq ──────────────────────────────────────────────────────────────────────

const absl = (msg: string) => [`FATAL Flags parsing error: ${msg}`, 'Pass --helpshort or --helpfull to see help on flags.'];

function parseBq(words: string[], notes: string[]): ParseResult {
  const tree = TREES.bq;
  const globals = GLOBALS.bq;
  const w = walk(tree, words, valueSpellings('bq', globals));
  // Reconstructed: bq's wording for an unknown command was not found in a source.
  if (w.bad) return { ok: false, lines: [`Unknown command: ${w.bad.word}`, "Run 'bq help' to get help."], notes };
  if (!w.node.spec) return { ok: false, lines: ['Python script for interacting with BigQuery.', '', 'USAGE: bq [--global_flags] <command> [--command_flags] [args]'], notes };
  const spec = w.node.spec;
  // Flags typed before the command are global; note where a global one landed after it.
  const cmdAt = [...w.used][0] ?? 0;
  const late = words.slice(cmdAt + 1).filter((x) => globals.some((g) => x.split('=')[0] === `--${g.name}` && g.name === 'location'));
  if (late.length) notes.push('Di bq, flag global seperti --location ditulis sebelum nama perintah: bq --location=US mk …');
  const rest = words.filter((_, i) => !w.used.has(i));
  const all = [...spec.flags, ...globals];
  const r = readFlags('bq', rest, index('bq', all), spec);
  const p: Parsed = { tool: 'bq', path: spec.path, pos: r.pos, flags: r.flags, rest: r.rest };
  const fail = (lines: string[]): ParseResult => ({ ok: false, lines, p, spec, notes });
  if (r.unknown.length) return fail(absl(`Unknown command line flag '${r.unknown[0].split('=')[0].replace(/^-+/, '')}'`));
  if (r.needValue) return fail(absl(`Missing value for flag ${r.needValue}`));
  if (r.badValue) return fail(absl(`flag ${r.badValue.flag}=${r.badValue.value}: Non-boolean argument to boolean flag`));
  const bad = checkChoices(spec, r.flags);
  if (bad) return fail(absl(`flag --${bad.f.name}=${bad.v}: value should be one of <${bad.f.choices!.join('|')}>`));
  const { min, max } = posBounds(spec);
  // Reconstructed: bq's exact text for a missing positional was not found.
  if (r.pos.length < min) return fail([`BigQuery error in ${spec.path[0]} operation: Missing required argument: ${spec.pos.filter((x) => !x.optional)[r.pos.length].name}`]);
  if (r.pos.length > max) return fail(absl(`Too many positional args, still have ['${r.pos.slice(max).join("', '")}']`));
  return { ok: true, p, spec, warnings: [], notes };
}

// ── terraform ───────────────────────────────────────────────────────────────

function parseTerraform(words: string[], notes: string[]): ParseResult {
  const tree = TREES.terraform;
  const globals = GLOBALS.terraform;
  const w = walk(tree, words, valueSpellings('terraform', globals));
  if (w.bad) {
    if (!w.node.path.length) {
      const best = tree.order.map((c) => ({ c, d: distance(c, w.bad!.word) })).sort((a, b) => a.d - b.d)[0];
      const mean = best && best.d <= 2 ? ` Did you mean "${best.c}"?` : '';
      return { ok: false, lines: [`Terraform has no command named "${w.bad.word}".${mean}`, '', "To see all of Terraform's top-level commands, run:", '  terraform -help'], notes };
    }
    return { ok: false, lines: subHelp(w.node), notes };
  }
  if (!w.node.spec) {
    if (!w.node.path.length) return { ok: false, lines: ['Usage: terraform [global options] <subcommand> [args]', '', 'Main commands:', '  init          Prepare your working directory for other commands', '  validate      Check whether the configuration is valid', '  plan          Show changes required by the current configuration', '  apply         Create or update infrastructure', '  destroy       Destroy previously-created infrastructure'], notes };
    return { ok: false, lines: subHelp(w.node), notes };
  }
  const spec = w.node.spec;
  const rest = words.filter((_, i) => !w.used.has(i));
  const all = [...spec.flags, ...globals];
  const r = readFlags('terraform', rest, index('terraform', all), spec);
  const p: Parsed = { tool: 'terraform', path: spec.path, pos: r.pos, flags: r.flags, rest: r.rest };
  const fail = (lines: string[]): ParseResult => ({ ok: false, lines, p, spec, notes });
  const helpLine = ['', 'For more help on using this command, run:', `  terraform ${spec.path.join(' ')} -help`];
  if (r.unknown.length || r.needValue) {
    const msg = r.unknown.length ? `flag provided but not defined: ${r.unknown[0].split('=')[0]}` : `flag needs an argument: ${r.needValue}`;
    return fail(['╷', '│ Error: Failed to parse command-line flags', '│ ', `│ ${msg}`, '╵', ...helpLine]);
  }
  const { min, max } = posBounds(spec);
  if (spec.path[0] === 'import' && r.pos.length !== 2) return fail(['The import command expects two arguments.', 'Usage: terraform [global options] import [options] ADDR ID']);
  if (r.pos.length < min) return fail(['╷', '│ Error: Missing required argument', '│ ', `│ The ${spec.path.join(' ')} command expects ${spec.pos.filter((x) => !x.optional).map((x) => x.name).join(' and ')}.`, '╵', ...helpLine]);
  if (r.pos.length > max) return fail(['╷', '│ Error: Too many command line arguments', '│ ', '│ To specify a working directory, use the global -chdir flag.', '╵', ...helpLine]);
  const checked = spec.check?.(p);
  if (checked) return fail(Array.isArray(checked) ? checked : checked.split('\n'));
  return { ok: true, p, spec, warnings: [], notes };
}

function subHelp(node: TreeNode): string[] {
  const kids = node.order;
  return [`Usage: terraform [global options] ${node.path.join(' ')} <subcommand> [options] [args]`, '', 'Subcommands:', ...kids.map((k) => `    ${k}`)];
}

// ── docker ──────────────────────────────────────────────────────────────────

function parseDocker(words: string[], notes: string[]): ParseResult {
  const tree = TREES.docker;
  // `docker compose -f x.yml up` — compose options sit between compose and its subcommand.
  const globals = words[0] === 'compose' ? [...GLOBALS.docker, ...COMPOSE_FLAGS] : GLOBALS.docker;
  const w = walk(tree, words, valueSpellings('docker', globals));
  if (w.bad) {
    if (w.node.path[0] === 'compose') return { ok: false, lines: ['Usage:  docker compose [OPTIONS] COMMAND', '', `unknown docker command: "compose ${w.bad.word}"`], notes };
    return { ok: false, lines: [`docker: unknown command: docker ${[...w.node.path, w.bad.word].join(' ')}`, '', "Run 'docker --help' for more information"], notes };
  }
  if (!w.node.spec) {
    const path = ['docker', ...w.node.path].join(' ');
    return { ok: false, lines: [`Usage:  ${path} [OPTIONS] COMMAND`, '', 'Commands:', ...w.node.order.map((k) => `  ${k}`), '', `Run '${path} COMMAND --help' for more information on a command.`], notes };
  }
  const spec = w.node.spec;
  const name = `docker ${spec.path.join(' ')}`;
  const shown = spec.path[0] === 'build' ? 'docker buildx build' : name;
  const usage = ['', `Usage:  ${spec.usage ?? `${name} [OPTIONS]`}`, ''];
  const rest = words.filter((_, i) => !w.used.has(i));
  const all = [...spec.flags, ...globals];
  const r = readFlags('docker', rest, index('docker', all), spec);
  const p: Parsed = { tool: 'docker', path: spec.path, pos: r.pos, flags: r.flags, rest: r.rest };
  const fail = (lines: string[]): ParseResult => ({ ok: false, lines, p, spec, notes });
  const runHelp = `Run '${shown} --help' for more information`;
  if (r.badShort) return fail([`unknown shorthand flag: '${r.badShort.ch}' in ${r.badShort.tok}`, ...usage, runHelp]);
  if (r.unknown.length) return fail([`unknown flag: ${r.unknown[0].split('=')[0]}`, ...usage, runHelp]);
  if (r.needValue) return fail([`flag needs an argument: ${r.needValue.startsWith('--') ? r.needValue : `'${r.needValue.slice(1)}' in ${r.needValue}`}`, ...usage, runHelp]);
  const { min, max } = posBounds(spec);
  if (r.pos.length < min || r.pos.length > max) {
    const exact = min === max;
    const what =
      max === 0 ? 'accepts no arguments' : exact ? `requires ${min} argument${min === 1 ? '' : 's'}` : r.pos.length < min ? `requires at least ${min} argument${min === 1 ? '' : 's'}` : `requires at most ${max} arguments`;
    const head = `${spec.path[0] === 'build' ? 'ERROR: ' : ''}docker: '${shown}' ${what}`;
    return fail([head, ...usage, `${spec.path[0] === 'build' ? 'Run' : 'See'} '${shown} --help' for more information`]);
  }
  const checked = spec.check?.(p);
  if (checked) return fail(Array.isArray(checked) ? checked : checked.split('\n'));
  return { ok: true, p, spec, warnings: [], notes };
}

// ── entry ───────────────────────────────────────────────────────────────────

/** Splits on `|`, `&&` and `;` outside quotes and keeps the first command. */
function firstCommand(line: string): { cmd: string; more: boolean } {
  let q: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === q) q = null;
      continue;
    }
    if (ch === '"' || ch === "'") q = ch;
    else if (ch === ';' || ch === '|' || (ch === '&' && line[i + 1] === '&')) return { cmd: line.slice(0, i).trim(), more: true };
  }
  return { cmd: line.trim(), more: false };
}

export function parseLine(raw: string): ParseResult | null {
  const notes: string[] = [];
  let line = raw.trim().replace(/^\$\s+/, '');
  if (!line) return null;
  const first = firstCommand(line);
  if (first.more) notes.push('Hanya perintah pertama yang dinilai.');
  line = first.cmd;
  const tok = tokenize(line);
  if (!Array.isArray(tok)) return { ok: false, lines: [`bash: ${tok.error}`], notes };
  return parseWords(tok, notes);
}

/** Parses a line that is already split into words. */
export function parseWords(tok: string[], notes: string[] = []): ParseResult | null {
  let words = tok;
  if (words[0] === 'sudo') words = words.slice(1);
  if (!words.length) return null;
  let tool = words[0];
  let rest = words.slice(1);
  if (tool === 'docker-compose') {
    tool = 'docker';
    rest = ['compose', ...rest];
    notes.push('`docker-compose` adalah nama lama; sekarang ditulis `docker compose`.');
  }
  switch (tool) {
    case 'gcloud':
      return parseGcloud(rest, notes);
    case 'kubectl':
      return parseKubectl(rest, notes);
    case 'gsutil':
      return parseGsutil(rest, notes);
    case 'bq':
      return parseBq(rest, notes);
    case 'terraform':
      return parseTerraform(rest, notes);
    case 'docker':
      return parseDocker(rest, notes);
    default:
      return { ok: false, lines: [`bash: ${tool}: command not found`], notes };
  }
}

/** Completion candidates for a partly typed line: command words, then flags. */
export function completions(line: string): { line: string; options: string[] } {
  const m = /^(\s*)(\S+)((?:\s+\S+)*)(\s*)$/.exec(line);
  if (!m) return { line, options: TOOLS };
  const words = line.trim().split(/\s+/);
  const trailing = /\s$/.test(line);
  const typed = trailing ? '' : words[words.length - 1];
  const before = trailing ? words : words.slice(0, -1);
  let options: string[];
  if (!before.length) options = TOOLS;
  else {
    const tool = before[0] as ToolName;
    const tree = TREES[tool];
    if (!tree) return { line, options: [] };
    let node = tree;
    for (const w of before.slice(1)) {
      if (w.startsWith('-')) continue;
      const k = node.kids.get(w);
      if (!k) break;
      node = k;
    }
    if (typed.startsWith('-')) {
      const specs = [...(node.spec?.flags ?? []), ...(tool === 'gcloud' ? GLOBALS.gcloud.filter((f) => ['project', 'quiet', 'format'].includes(f.name)) : [])];
      options = specs.map((f) => spell(tool, f.name) + (f.bool ? '' : '='));
    } else options = node.order.filter((w) => !node.kids.get(w)!.hidden);
  }
  const hits = options.filter((o) => o.startsWith(typed));
  if (!hits.length) return { line, options: [] };
  const head = before.join(' ') + (before.length ? ' ' : '');
  if (hits.length === 1) return { line: head + hits[0] + (hits[0].endsWith('=') ? '' : ' '), options: [] };
  let prefix = hits[0];
  for (const h of hits) while (!h.startsWith(prefix)) prefix = prefix.slice(0, -1);
  return { line: prefix.length > typed.length ? head + prefix : line, options: hits.sort() };
}
