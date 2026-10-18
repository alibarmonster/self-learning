/**
 * The grammar behind the command quiz: every CLI's command tree, positionals
 * and flags, written in a compact DSL and expanded once. `parse.ts` walks this
 * tree the way the real tool does, so a typed line is rejected with the error
 * the real CLI would print before it is ever graded.
 *
 * Flag DSL, space separated: `[*][!]name[/alias…][:choice,…][~norm][+]`
 *   *  required            !  boolean (also accepts --no-NAME)
 *   /z alias -z, /pap alias --pap      :a,b  allowed values
 *   ~norm  how values compare (see Norm)   +  may be repeated
 *
 * Positional DSL: `NAME`, `[NAME]`, `NAME...`, `[NAME...]`.
 */

export type ToolName = 'gcloud' | 'gsutil' | 'kubectl' | 'bq' | 'terraform' | 'docker';

/** How a value is compared: the typed value and the expected one both go through it. */
export type Norm = 'lower' | 'upper' | 'list' | 'lowerlist' | 'size' | 'dns' | 'splits' | 'pct';

export interface FlagSpec {
  /** Canonical name without dashes, e.g. `zone`. */
  name: string;
  bool: boolean;
  required: boolean;
  repeat: boolean;
  /** Other full spellings, e.g. `-z`, `--pap`. */
  aliases: string[];
  choices?: string[];
  norm?: Norm;
}

export interface PosSpec {
  name: string;
  optional: boolean;
  many: boolean;
}

/** A command line after parsing: everything canonical, ready to compare. */
export interface Parsed {
  tool: ToolName;
  /** Canonical command path, e.g. ['compute', 'instances', 'create']. */
  path: string[];
  pos: string[];
  /** Canonical flag name → values in the order given. Booleans are 'true' / 'false'. */
  flags: Record<string, string[]>;
  /** Words after `--`, or null when there was no `--`. */
  rest: string[] | null;
  /** gcloud release track typed before the command, if any. */
  track?: string;
}

export interface CmdSpec {
  tool: ToolName;
  path: string[];
  pos: PosSpec[];
  flags: FlagSpec[];
  /** Groups where exactly one flag must be given. */
  oneOf: string[][];
  /** Groups where at most one flag may be given. */
  atMostOne: string[][];
  /** Accepts `-- ARGS` after the flags (gcloud help, ssh, kubectl exec). */
  dashArgs: boolean;
  /** Everything after the first positional belongs to the program (docker run IMAGE CMD…). */
  stopAtPos: boolean;
  /** The tool's own synopsis, for tools that print it in errors (gsutil, docker). */
  usage?: string;
  /** Flag name → warning printed when it is used. */
  deprecated: Record<string, string>;
  /** Extra validation once flags parse; returns the exact error text, or null. */
  check?: (p: Parsed) => string | string[] | null;
  /** Warnings that depend on the values given. */
  warn?: (p: Parsed) => string[];
  hidden?: boolean;
}

const FLAG_RE = /^(\*)?(!)?([A-Za-z0-9][\w.-]*)((?:\/[\w-]+)*)((?::[^~+]+|~\w+|\+)*)$/;

/** How a flag is written on the command line for a given tool. */
export function spell(tool: ToolName, name: string): string {
  if (tool === 'terraform') return `-${name}`;
  return name.length === 1 ? `-${name}` : `--${name}`;
}

export function flagSpecs(tool: ToolName, dsl: string): FlagSpec[] {
  return dsl
    .split(/\s+/)
    .filter(Boolean)
    .map((tok) => {
      const m = FLAG_RE.exec(tok);
      if (!m) throw new Error(`bad flag DSL "${tok}"`);
      const [, req, bool, name, aliasPart, tail] = m;
      // Choices, normaliser and repeat marker may come in any order.
      const choices = /:([^~+]+)/.exec(tail)?.[1];
      const norm = /~(\w+)/.exec(tail)?.[1];
      return {
        name,
        bool: !!bool,
        required: !!req,
        repeat: tail.includes('+'),
        aliases: aliasPart
          .split('/')
          .filter(Boolean)
          .map((a) => spell(tool, a)),
        choices: choices ? choices.split(',') : undefined,
        norm: norm as Norm | undefined
      };
    });
}

export function posSpecs(dsl: string): PosSpec[] {
  return dsl
    .split(/\s+/)
    .filter(Boolean)
    .map((tok) => {
      const optional = tok.startsWith('[');
      const bare = tok.replace(/^\[|\]$/g, '');
      const many = bare.endsWith('...');
      return { name: bare.replace(/\.\.\.$/, ''), optional, many };
    });
}

export interface Extra {
  oneOf?: string[][];
  atMostOne?: string[][];
  dashArgs?: boolean;
  stopAtPos?: boolean;
  usage?: string;
  deprecated?: Record<string, string>;
  check?: CmdSpec['check'];
  warn?: CmdSpec['warn'];
  hidden?: boolean;
}

/**
 * One command. `path` words may list aliases with `|` — `top pod|pods|po` —
 * the first spelling is canonical.
 */
export function cmd(tool: ToolName, path: string, pos = '', flags = '', extra: Extra = {}): CmdSpec & { words: string[][] } {
  const words = path.split(' ').map((w) => w.split('|'));
  return {
    tool,
    path: words.map((w) => w[0]),
    words,
    pos: posSpecs(pos),
    flags: flagSpecs(tool, flags),
    oneOf: extra.oneOf ?? [],
    atMostOne: extra.atMostOne ?? [],
    dashArgs: !!extra.dashArgs,
    stopAtPos: !!extra.stopAtPos,
    usage: extra.usage,
    deprecated: extra.deprecated ?? {},
    check: extra.check,
    warn: extra.warn,
    hidden: extra.hidden
  };
}

export interface TreeNode {
  word: string;
  path: string[];
  kids: Map<string, TreeNode>;
  /** Canonical child words in insertion order (aliases excluded). */
  order: string[];
  spec?: CmdSpec;
  hidden?: boolean;
}

export function buildTree(specs: (CmdSpec & { words: string[][] })[]): TreeNode {
  const root: TreeNode = { word: '', path: [], kids: new Map(), order: [] };
  for (const s of specs) {
    let node = root;
    s.words.forEach((alts, i) => {
      let next = node.kids.get(alts[0]);
      if (!next) {
        next = { word: alts[0], path: s.path.slice(0, i + 1), kids: new Map(), order: [] };
        for (const a of alts) node.kids.set(a, next);
        node.order.push(alts[0]);
      }
      node = next;
    });
    node.spec = s;
    node.hidden = s.hidden;
  }
  return root;
}

/** Every node under `root`, depth first. */
export function allNodes(root: TreeNode): TreeNode[] {
  const out: TreeNode[] = [];
  const seen = new Set<TreeNode>();
  const visit = (n: TreeNode) => {
    for (const w of n.order) {
      const k = n.kids.get(w)!;
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(k);
      visit(k);
    }
  };
  visit(root);
  return out;
}

// ── Value comparison ────────────────────────────────────────────────────────

const sizeGb = (v: string): string => {
  const m = /^(\d+(?:\.\d+)?)\s*(gb|g|gib|tb|t|tib)?$/i.exec(v.trim());
  if (!m) return v;
  const n = Number(m[1]) * (/^t/i.test(m[2] ?? '') ? 1024 : 1);
  return `${n}GB`;
};

const splits = (v: string): string => {
  const pairs = v
    .split(',')
    .map((p) => p.split('='))
    .filter((p) => p.length === 2 && !Number.isNaN(Number(p[1])));
  if (!pairs.length) return v;
  const sum = pairs.reduce((n, p) => n + Number(p[1]), 0) || 1;
  return pairs
    .map(([k, w]) => `${k}=${Math.round((Number(w) / sum) * 1000) / 1000}`)
    .sort()
    .join(',');
};

export function normalise(v: string, norm?: Norm): string {
  switch (norm) {
    case 'lower':
      return v.toLowerCase();
    case 'upper':
      return v.toUpperCase();
    case 'list':
      return v.split(',').map((x) => x.trim()).filter(Boolean).sort().join(',');
    case 'lowerlist':
      return v.toLowerCase().split(',').map((x) => x.trim()).filter(Boolean).sort().join(',');
    case 'size':
      return sizeGb(v);
    case 'dns':
      return v.toLowerCase().replace(/\.$/, '');
    case 'splits':
      return splits(v);
    case 'pct':
      return v.replace(/%$/, '');
    default:
      return v;
  }
}

/** Paths compare without a leading `./` or a trailing slash. */
export function normalisePath(v: string): string {
  let out = v.startsWith('./') && v.length > 2 ? v.slice(2) : v;
  if (out.length > 1 && out.endsWith('/') && !/^gs:\/\/$/.test(out)) out = out.replace(/\/+$/, '');
  return out;
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Turns an expected value into a regex: `<ANY>` matches any text, `{a|b}`
 * matches either spelling, everything else is literal.
 */
export function valueRegex(pattern: string, ci: boolean): RegExp {
  let src = '';
  const re = /<[^<>]+>|\{[^{}]*\|[^{}]*\}/g;
  let last = 0;
  for (const m of pattern.matchAll(re)) {
    src += esc(pattern.slice(last, m.index));
    src += m[0].startsWith('<') ? '.+' : `(?:${m[0].slice(1, -1).split('|').map(esc).join('|')})`;
    last = m.index! + m[0].length;
  }
  src += esc(pattern.slice(last));
  return new RegExp(`^${src}$`, ci ? 'i' : '');
}

export function valueMatches(pattern: string, actual: string, norm?: Norm): boolean {
  // Alternation is expanded before normalising so `{a|b}` survives a list sort.
  const alts = expandAlternation(pattern);
  return alts.some((p) => valueRegex(normalise(p, norm), norm === 'lower' || norm === 'dns' || norm === 'lowerlist').test(normalise(actual, norm)));
}

/** `{a|b}-x` → ['a-x', 'b-x'] when the alternation is the whole of a list item. */
function expandAlternation(p: string): string[] {
  const m = /\{([^{}]*\|[^{}]*)\}/.exec(p);
  if (!m || !p.includes(',')) return [p];
  return m[1].split('|').flatMap((alt) => expandAlternation(p.slice(0, m.index) + alt + p.slice(m.index + m[0].length)));
}

/** Rough difflib ratio: 2·LCS / total length. */
export function ratio(a: string, b: string): number {
  if (!a.length && !b.length) return 1;
  const dp = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return (2 * dp[a.length][b.length]) / (a.length + b.length);
}

/** Levenshtein distance, as cobra uses for kubectl's "Did you mean this?". */
export function distance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}
