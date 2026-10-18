/**
 * Deploy and test, without a cloud. `deploy` walks the design in the order
 * Terraform or a person in the console would create it — APIs, identities,
 * networks, data stores, compute, then the wiring — and reports what would
 * fail and why. `trace` then sends one request (or event) from a starting
 * node and follows it hop by hop, checking the network path and the IAM role
 * at every hop, like Packet Tracer's simulation mode.
 */
import { SPECS, nodeIssues } from './catalog';
import { granted, ruleFor, wiringFor, type Ctx, type Rule } from './rules';
import { PROJECT, incoming, nodeById, outgoing, runtimeSa, str, type CEdge, type CNode, type Doc, type Level, type NodeType } from './model';

export type Status = 'ok' | 'warn' | 'error';

export interface DeployEvent {
  t: number;
  level: Level | 'ok';
  /** The resource the line is about. */
  at: string;
  text: string;
  nodeId?: string;
  edgeId?: string;
}

export interface DeployReport {
  events: DeployEvent[];
  node: Record<string, Status>;
  edge: Record<string, Status>;
  errors: number;
  warnings: number;
  /** The design as deployed, to tell when it has changed since. */
  snapshot: string;
}

const PHASE: Record<NodeType, number> = {
  sa: 0,
  vpc: 1,
  nat: 2,
  gcs: 3,
  sql: 3,
  redis: 3,
  firestore: 3,
  bq: 3,
  topic: 3,
  secret: 3,
  ar: 3,
  run: 4,
  fn: 4,
  gce: 4,
  mig: 4,
  gke: 4,
  lb: 5,
  scheduler: 5,
  build: 5,
  sink: 5,
  internet: 9
};

const APIS: Partial<Record<NodeType, string>> = {
  run: 'run.googleapis.com',
  fn: 'cloudfunctions.googleapis.com',
  gce: 'compute.googleapis.com',
  mig: 'compute.googleapis.com',
  lb: 'compute.googleapis.com',
  vpc: 'compute.googleapis.com',
  nat: 'compute.googleapis.com',
  gke: 'container.googleapis.com',
  sql: 'sqladmin.googleapis.com',
  redis: 'redis.googleapis.com',
  firestore: 'firestore.googleapis.com',
  bq: 'bigquery.googleapis.com',
  topic: 'pubsub.googleapis.com',
  secret: 'secretmanager.googleapis.com',
  ar: 'artifactregistry.googleapis.com',
  build: 'cloudbuild.googleapis.com',
  scheduler: 'cloudscheduler.googleapis.com',
  sink: 'logging.googleapis.com'
};

/** Everything that matters for a deploy, positions left out. */
export function fingerprint(d: Doc): string {
  return JSON.stringify({
    n: d.nodes.map((n) => [n.id, n.type, n.name, n.params]),
    e: d.edges.map((e) => [e.id, e.from, e.to, e.params])
  });
}

export function ctxOf(d: Doc, e: CEdge): (Ctx & { rule: Rule }) | null {
  const src = nodeById(d, e.from);
  const dst = nodeById(d, e.to);
  if (!src || !dst) return null;
  const rule = ruleFor(src.type, dst.type);
  return rule ? { d, e, src, dst, rule } : null;
}

/** One line describing what was created, for the deploy log. */
function summary(n: CNode): string {
  const p = n.params;
  switch (n.type) {
    case 'run':
      return `${str(p, 'region')}, ${str(p, 'cpu', '1')} vCPU / ${str(p, 'memory', '512Mi')}, ingress ${str(p, 'ingress', 'all')}, ${p.allowUnauth ? 'publik' : 'butuh autentikasi'}`;
    case 'fn':
      return `${str(p, 'runtime')} di ${str(p, 'region')}`;
    case 'gce':
      return `${str(p, 'machine')} di ${str(p, 'zone')}, IP eksternal: ${str(p, 'ip')}`;
    case 'mig':
      return `${p.regional ? `regional ${str(p, 'region')}` : `zonal ${str(p, 'zone')}`}, ${str(p, 'min')}–${str(p, 'max')} VM @ CPU ${str(p, 'cpu')}%`;
    case 'gke':
      return `${str(p, 'mode')} di ${str(p, 'location')}, channel ${str(p, 'channel')}`;
    case 'gcs':
      return `${SPECS.gcs.location!(n)}, ${str(p, 'class')}${p.uniform ? ', uniform access' : ''}${p.pap ? ', public access prevention' : ''}`;
    case 'sql':
      return `${str(p, 'version')} db-custom-${str(p, 'cpu')}-${Math.round(Number(p.memory) * 1024)}, ${str(p, 'region')}, ${p.ha ? 'REGIONAL (HA)' : 'ZONAL'}`;
    case 'redis':
      return `${str(p, 'tier')} ${str(p, 'size')} GB, ${str(p, 'region')}`;
    case 'bq':
      return `lokasi ${str(p, 'location')}`;
    case 'vpc':
      return `mode ${str(p, 'mode')}`;
    case 'lb':
      return `${str(p, 'scheme')} ${str(p, 'protocol')}`;
    case 'scheduler':
      return `"${str(p, 'schedule')}" ${str(p, 'tz')}`;
    default:
      return '';
  }
}

export function deploy(d: Doc): DeployReport {
  const events: DeployEvent[] = [];
  const node: Record<string, Status> = {};
  const edge: Record<string, Status> = {};
  let t = 0;
  const push = (ev: Omit<DeployEvent, 't'>) => events.push({ t: (t += 120 + Math.round(Math.random() * 380)), ...ev });
  const worst = (map: Record<string, Status>, id: string, s: Status) => {
    const rank = { ok: 0, warn: 1, error: 2 };
    if (!map[id] || rank[s] > rank[map[id]]) map[id] = s;
  };

  const real = d.nodes.filter((n) => n.type !== 'internet');
  const apis = [...new Set(real.map((n) => APIS[n.type]).filter(Boolean))];
  if (apis.length) push({ level: 'info', at: PROJECT, text: `Mengaktifkan API: ${apis.join(', ')}` });

  for (const n of [...real].sort((a, b) => PHASE[a.type] - PHASE[b.type])) {
    const spec = SPECS[n.type];
    const issues = nodeIssues(n, d);
    // Deploy-time IAM: actAs on the attached service account, secrets read at start-up, image pulls.
    for (const e of [...incoming(d, n.id), ...outgoing(d, n.id)]) {
      const c = ctxOf(d, e);
      if (!c) continue;
      for (const nd of c.rule.needs?.(c) ?? []) if (nd.phase === 'deploy' && !granted(e, nd.id)) issues.push({ level: 'error', msg: nd.fail });
    }
    const errs = issues.filter((i) => i.level === 'error');
    const warns = issues.filter((i) => i.level === 'warn');
    if (errs.length) {
      for (const i of errs) push({ level: 'error', at: n.name, text: `✗ ${spec.product} ${n.name}: ${i.msg}`, nodeId: n.id });
      worst(node, n.id, 'error');
      continue;
    }
    push({ level: 'ok', at: n.name, text: `✓ ${spec.product} ${n.name} dibuat${summary(n) ? ` — ${summary(n)}` : ''}`, nodeId: n.id });
    for (const i of warns) push({ level: 'warn', at: n.name, text: `! ${i.msg}`, nodeId: n.id });
    worst(node, n.id, warns.length ? 'warn' : 'ok');
  }

  for (const e of d.edges) {
    const c = ctxOf(d, e);
    if (!c) continue;
    const label = `${c.src.name} → ${c.dst.name}`;
    const issues = c.rule.check?.(c) ?? [];
    const errs = issues.filter((i) => i.level === 'error');
    for (const i of issues) push({ level: i.level === 'info' ? 'info' : i.level, at: label, text: `${i.level === 'error' ? '✗' : i.level === 'warn' ? '!' : '·'} ${c.rule.label}: ${i.msg}`, edgeId: e.id });
    if (errs.length || node[c.src.id] === 'error' || (node[c.dst.id] === 'error' && c.dst.type !== 'internet')) {
      worst(edge, e.id, 'error');
      continue;
    }
    if (c.rule.kind !== 'identity' && c.rule.kind !== 'network') push({ level: 'ok', at: label, text: `✓ ${c.rule.label}: ${label}`, edgeId: e.id });
    for (const nd of c.rule.needs?.(c) ?? []) {
      if (granted(e, nd.id)) push({ level: 'info', at: label, text: `+ IAM: ${nd.role} untuk ${nd.who} di ${nd.on}`, edgeId: e.id });
      else if (nd.phase === 'runtime') push({ level: 'info', at: label, text: `· ${nd.role} untuk ${nd.who} tidak diberikan (dimatikan di koneksi ini)`, edgeId: e.id });
    }
    worst(edge, e.id, issues.some((i) => i.level === 'warn') ? 'warn' : 'ok');
  }

  const errors = events.filter((e) => e.level === 'error').length;
  const warnings = events.filter((e) => e.level === 'warn').length;
  push({ level: errors ? 'error' : 'ok', at: PROJECT, text: errors ? `Deploy selesai dengan ${errors} error — resource yang gagal tidak dibuat.` : `Deploy berhasil: ${real.length} resource, ${d.edges.length} koneksi.` });
  return { events, node, edge, errors, warnings, snapshot: fingerprint(d) };
}

// ── tracing a request ───────────────────────────────────────────────────────

export interface Hop {
  t: number;
  edgeId: string | null;
  from: string;
  to: string;
  proto: string;
  ok: boolean;
  text: string;
  detail: string[];
}

export interface Trace {
  start: string;
  hops: Hop[];
  ok: boolean;
  /** Node ids the request reached successfully. */
  reached: string[];
}

const FORWARDS: NodeType[] = ['run', 'fn', 'gce', 'mig', 'gke', 'lb', 'topic', 'build', 'scheduler', 'internet', 'gcs', 'sink'];
const TRAVERSE = new Set(['invoke', 'data', 'event']);

const startText = (n: CNode): string => {
  switch (n.type) {
    case 'internet':
      return `GET ${str(n.params, 'path', '/')} dari pengguna di internet`;
    case 'scheduler':
      return `Job ${n.name} berjalan (${str(n.params, 'schedule')})`;
    case 'gcs':
      return `Objek uploads/foto-001.jpg di-finalize di gs://${n.name}`;
    case 'topic':
      return `Pesan dipublish ke ${n.name}`;
    case 'build':
      return `Commit di-push ke ${str(n.params, 'branch')} — build dimulai`;
    case 'sink':
      return 'Entri log yang cocok dengan filter tercatat';
    default:
      return `Request dikirim dari ${n.name}`;
  }
};

export function trace(d: Doc, report: DeployReport | null, startId: string): Trace {
  const start = nodeById(d, startId)!;
  const hops: Hop[] = [];
  const reached = new Set<string>([startId]);
  let t = 0;
  hops.push({ t, edgeId: null, from: start.name, to: start.name, proto: 'Start', ok: true, text: startText(start), detail: [] });
  const own = report?.node[startId];
  if (start.type !== 'internet' && (own === undefined || own === 'error')) {
    hops.push({ t: 10, edgeId: null, from: start.name, to: start.name, proto: '—', ok: false, text: own === 'error' ? `${start.name} gagal di-deploy.` : `${start.name} belum di-deploy. Jalankan Deploy dulu.`, detail: [] });
    return { start: startId, hops, ok: false, reached: [] };
  }
  const queue = [start];
  const seen = new Set<string>();
  while (queue.length) {
    const u = queue.shift()!;
    if (seen.has(u.id)) continue;
    seen.add(u.id);
    // A starting topic/bucket fans out; when reached mid-trace they fan out too.
    for (const e of outgoing(d, u.id)) {
      const c = ctxOf(d, e);
      if (!c || !TRAVERSE.has(c.rule.kind)) continue;
      t += 15 + Math.round(Math.random() * 120);
      const hop: Hop = { t, edgeId: e.id, from: u.name, to: c.dst.name, proto: c.rule.proto, ok: true, text: '', detail: [] };
      const fail = (msg: string) => {
        hop.ok = false;
        hop.text = msg;
      };
      const st = report?.node[c.dst.id];
      if (c.dst.type !== 'internet' && (!report || st === undefined)) fail(`${c.dst.name} belum di-deploy. Jalankan Deploy dulu.`);
      else if (st === 'error') fail(`${c.dst.name} gagal di-deploy, jadi tidak ada yang menerima request ini.`);
      else if (report?.edge[e.id] === 'error') fail(`Koneksi ${c.rule.label} ${u.name} → ${c.dst.name} gagal dibuat saat deploy.`);
      else {
        const r = c.rule.reach?.(c);
        if (r && !r.ok) fail(r.msg);
        else {
          if (r?.msg) hop.detail.push(`Jaringan: ${r.msg}`);
          for (const nd of c.rule.needs?.(c) ?? []) {
            if (nd.phase !== 'runtime') continue;
            if (!granted(e, nd.id)) {
              fail(nd.fail);
              break;
            }
            hop.detail.push(`IAM ✓ ${nd.role} — ${nd.who}`);
          }
        }
      }
      if (hop.ok) {
        hop.text = `${c.rule.label}: ${u.name} → ${c.dst.name} berhasil`;
        if (['run', 'fn', 'gce', 'mig', 'gke'].includes(u.type) && c.rule.kind !== 'event') {
          const sa = runtimeSa(d, u);
          hop.detail.unshift(`Identitas pemanggil: ${sa.email}${sa.isDefault ? ' (default)' : ''}`);
        }
        reached.add(c.dst.id);
        if (FORWARDS.includes(c.dst.type) && c.dst.type !== 'internet') queue.push(c.dst);
      }
      hops.push(hop);
    }
  }
  if (hops.length === 1) hops.push({ t: t + 10, edgeId: null, from: start.name, to: start.name, proto: '—', ok: false, text: `${start.name} belum terhubung ke apa pun.`, detail: [] });
  return { start: startId, hops, ok: hops.every((h) => h.ok), reached: [...reached] };
}

/**
 * Where "Deploy & uji" starts its test requests: every entry point (internet,
 * scheduler, bucket, topic, build, sink) with somewhere to go, plus any
 * compute node that starts a flow of its own (calls out, but nobody calls it).
 */
export function testStarts(d: Doc): CNode[] {
  const flows = (e: CEdge) => {
    const c = ctxOf(d, e);
    return !!c && TRAVERSE.has(c.rule.kind);
  };
  return d.nodes.filter((n) => {
    const out = outgoing(d, n.id).some(flows);
    if (!out) return false;
    if (SPECS[n.type].entry) return n.type !== 'gcs' || !incoming(d, n.id).some(flows);
    return !incoming(d, n.id).some(flows);
  });
}

// ── equivalent commands ─────────────────────────────────────────────────────

export function nodeCommands(d: Doc, n: CNode): string[] {
  return SPECS[n.type].gcloud(n, d, wiringFor(d, n));
}

export function edgeCommands(d: Doc, e: CEdge): string[] {
  const c = ctxOf(d, e);
  if (!c) return [];
  const out = [...(c.rule.gcloud?.(c) ?? [])];
  for (const nd of c.rule.needs?.(c) ?? []) if (granted(e, nd.id)) out.push(nd.gcloud);
  return out;
}

/** The whole design as a gcloud script, in creation order. */
export function script(d: Doc): string[] {
  const out: string[] = [`gcloud config set project ${PROJECT}`];
  const apis = [...new Set(d.nodes.map((n) => APIS[n.type]).filter(Boolean))];
  if (apis.length) out.push(`gcloud services enable ${apis.join(' ')}`);
  for (const n of [...d.nodes].sort((a, b) => PHASE[a.type] - PHASE[b.type])) {
    if (n.type === 'internet') continue;
    out.push('', `# ${SPECS[n.type].product}: ${n.name}`, ...nodeCommands(d, n).filter((l) => !l.startsWith('# ') || l.includes(':')));
  }
  const wired = d.edges.map((e) => [e, edgeCommands(d, e)] as const).filter(([, cmds]) => cmds.length);
  if (wired.length) {
    out.push('', '# Koneksi dan IAM');
    for (const [, cmds] of wired) out.push(...cmds);
  }
  return out;
}
