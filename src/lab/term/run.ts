/**
 * Runs one line typed into the lab terminal: expands variables, splits on
 * `&&` and `;`, handles the few shell builtins Cloud Shell users reach for,
 * and hands everything else to gcloud, gsutil, kubectl or bq.
 */
import { bq, BQ_COMMANDS } from './bq';
import { CliError } from './common';
import { gcloud, GCLOUD_COMMANDS } from './gcloud';
import { GSUTIL_COMMANDS, gsutil } from './gsutil';
import { KUBECTL_COMMANDS, kubectl } from './kubectl';
import { Out, tokenize, type Line, type Tool } from './shell';
import { config, type CloudState } from './state';

const TOOLS: Record<string, Tool> = { gcloud, gsutil, kubectl, bq };

export const BUILTINS = ['help', 'clear', 'ls', 'cat', 'echo', 'export', 'pwd', 'whoami', 'history', 'hint', 'reset', 'tasks'];

/** Words a command line can start with, for completion. */
export const COMPLETIONS: string[] = [
  ...BUILTINS,
  ...GCLOUD_COMMANDS.map((c) => `gcloud ${c}`),
  ...GSUTIL_COMMANDS.map((c) => `gsutil ${c}`),
  ...KUBECTL_COMMANDS.map((c) => `kubectl ${c}`),
  ...BQ_COMMANDS.map((c) => `bq ${c}`)
];

/** Replaces `$VAR`, `${VAR}` and `$(gcloud config get-value project)` outside single quotes. */
export function expand(s: CloudState, line: string): string {
  const vars: Record<string, string> = {
    GOOGLE_CLOUD_PROJECT: config(s).project ?? '',
    DEVSHELL_PROJECT_ID: config(s).project ?? '',
    HOME: '/home/student',
    USER: 'student',
    ...s.env
  };
  let out = '';
  let single = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === "'" ) single = !single;
    if (ch !== '$' || single) {
      out += ch;
      continue;
    }
    const sub = /^\$\(\s*gcloud config get-value (project|compute\/region|compute\/zone|account)\s*\)/.exec(line.slice(i));
    if (sub) {
      const cfg = config(s);
      out += { project: cfg.project, 'compute/region': cfg.region, 'compute/zone': cfg.zone, account: s.account }[sub[1]] ?? '';
      i += sub[0].length - 1;
      continue;
    }
    const v = /^\$(?:\{(\w+)\}|(\w+))/.exec(line.slice(i));
    if (v) {
      out += vars[v[1] ?? v[2]] ?? '';
      i += v[0].length - 1;
      continue;
    }
    out += ch;
  }
  return out;
}

/** Splits on `&&` and `;` outside quotes. Returns [segment, joiner-before-it]. */
function chain(line: string): { cmd: string; and: boolean }[] {
  const parts: { cmd: string; and: boolean }[] = [];
  let cur = '';
  let q: string | null = null;
  let and = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === q) q = null;
      cur += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      q = ch;
      cur += ch;
      continue;
    }
    if (ch === ';' || (ch === '&' && line[i + 1] === '&')) {
      parts.push({ cmd: cur.trim(), and });
      and = ch === '&';
      if (ch === '&') i++;
      cur = '';
      continue;
    }
    cur += ch;
  }
  parts.push({ cmd: cur.trim(), and });
  return parts.filter((p) => p.cmd);
}

function builtin(s: CloudState, o: Out, words: string[]): boolean {
  const [cmd, ...rest] = words;
  switch (cmd) {
    case 'pwd':
      o.out('/home/student');
      return true;
    case 'whoami':
      o.out('student');
      return true;
    case 'ls': {
      const names = Object.keys(s.files).sort();
      if (names.length) o.out(names.join('  '));
      return true;
    }
    case 'cat': {
      if (!rest.length) throw new CliError('cat: missing file operand');
      for (const f of rest) {
        if (s.files[f] === undefined) throw new CliError(`cat: ${f}: No such file or directory`);
        o.out(s.files[f]);
      }
      return true;
    }
    case 'echo': {
      const gt = rest.findIndex((w) => w === '>' || w === '>>');
      if (gt >= 0) {
        const file = rest[gt + 1];
        if (!file) throw new CliError('bash: syntax error near unexpected token `newline\'');
        const text = rest.slice(0, gt).join(' ');
        s.files[file] = rest[gt] === '>>' && s.files[file] !== undefined ? `${s.files[file]}\n${text}` : text;
        return true;
      }
      o.out(rest.join(' '));
      return true;
    }
    case 'export': {
      for (const pair of rest) {
        const eq = pair.indexOf('=');
        if (eq > 0) s.env[pair.slice(0, eq)] = pair.slice(eq + 1);
      }
      return true;
    }
    case 'nano':
    case 'vi':
    case 'vim':
    case 'cloudshell':
      o.info(`Lab: editor tidak disimulasikan. Buat file dengan echo '…' > ${rest[0] ?? 'file'}, atau pakai file yang sudah ada (ls).`);
      return true;
    case 'help':
      o.out(
        'Terminal lab — Cloud Shell tiruan. Semua perintah berjalan di project simulasi, bukan akun sungguhan.',
        '',
        '  gcloud …    Compute Engine, VPC, GKE, IAM, Cloud Run, Cloud SQL, Pub/Sub, Storage',
        '  gsutil …    Cloud Storage klasik: mb, cp, ls, rm, versioning, lifecycle, iam ch',
        '  kubectl …   GKE: get, create, apply, expose, scale, set image, rollout, autoscale',
        '  bq …        BigQuery: mk, ls, show, load, query, extract, rm, head',
        '',
        '  ls, cat, echo … > file, export VAR=…, clear, history',
        '  hint        petunjuk untuk task berikutnya',
        '  tasks       daftar task dan statusnya',
        '  reset       mulai ulang skenario',
        '',
        'Tab melengkapi perintah, panah atas/bawah memanggil riwayat.'
      );
      return true;
  }
  return false;
}

/** Runs a line and returns what it printed. `clear`, `hint`, `reset`, `history` and `tasks` are left to the UI. */
export function run(s: CloudState, line: string): Line[] {
  const o = new Out();
  let lastOk = true;
  for (const { cmd, and } of chain(line)) {
    if (and && !lastOk) break;
    const words = tokenize(expand(s, cmd));
    if (!Array.isArray(words)) {
      o.err(`bash: ${words.error}`);
      lastOk = false;
      continue;
    }
    if (!words.length) continue;
    try {
      const tool = TOOLS[words[0]];
      if (tool) tool({ s, o, words: words.slice(1) });
      else if (!builtin(s, o, words)) {
        if (/^(sudo|apt|apt-get|pip|docker|terraform|curl|wget|ssh)$/.test(words[0]))
          throw new CliError(`bash: ${words[0]}: command not available in this lab`, 'Lab ini mensimulasikan gcloud, gsutil, kubectl dan bq. Docker dan Terraform ada di cheat sheet Commands.');
        throw new CliError(`bash: ${words[0]}: command not found`, `Coba help. Perintah yang dikenal: gcloud, gsutil, kubectl, bq.`);
      }
      lastOk = true;
    } catch (e) {
      if (e instanceof CliError) {
        o.err(e.message);
        if (e.hint) o.lines.push({ kind: 'warn', text: `Petunjuk: ${e.hint}` });
      } else {
        o.err(`Lab error: ${(e as Error).message}`);
      }
      lastOk = false;
    }
  }
  return o.lines;
}

/** Whether the last run of `line` failed — for `&&` and for scoring. */
export const failed = (lines: Line[]) => lines.some((l) => l.kind === 'err');

/** Completes the word under the cursor against known command paths. */
export function complete(line: string): { line: string; options: string[] } {
  const trimmed = line.replace(/^\s+/, '');
  const words = trimmed.split(/\s+/);
  const typed = words.join(' ');
  if (words.some((w) => w.startsWith('-'))) return { line, options: [] };
  const hits = COMPLETIONS.filter((c) => c.startsWith(typed));
  if (!hits.length) return { line, options: [] };
  // Next word candidates after what's typed.
  const depth = words.length - 1;
  const nextWords = [...new Set(hits.map((h) => h.split(' ')[depth]).filter(Boolean))];
  if (nextWords.length === 1) {
    const done = [...words.slice(0, depth), nextWords[0]].join(' ');
    const more = hits.some((h) => h.split(' ').length > depth + 1 && h.startsWith(done + ' '));
    return { line: done + (more || hits.includes(done) ? ' ' : ''), options: [] };
  }
  // Longest common prefix of the candidates.
  let prefix = nextWords[0];
  for (const w of nextWords) while (!w.startsWith(prefix)) prefix = prefix.slice(0, -1);
  const completed = [...words.slice(0, depth), prefix].join(' ');
  return { line: completed.length > typed.length ? completed : line, options: nextWords.sort() };
}
