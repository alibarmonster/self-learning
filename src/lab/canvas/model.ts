/**
 * The service canvas: a design is a list of service nodes and the edges
 * between them, as plain JSON so it can be cloned for undo and saved to
 * localStorage. An edge always points from the caller to what it calls
 * (Cloud Run → Cloud SQL), from an event source to its consumer (bucket →
 * function), or from an attachment to what it attaches to (VM → VPC,
 * service account → Cloud Run).
 */

export type NodeType =
  | 'internet'
  | 'scheduler'
  | 'lb'
  | 'run'
  | 'fn'
  | 'gce'
  | 'mig'
  | 'gke'
  | 'gcs'
  | 'sql'
  | 'redis'
  | 'firestore'
  | 'bq'
  | 'topic'
  | 'secret'
  | 'ar'
  | 'build'
  | 'sa'
  | 'vpc'
  | 'nat'
  | 'sink';

export type Params = Record<string, unknown>;

export interface CNode {
  id: string;
  type: NodeType;
  name: string;
  x: number;
  y: number;
  params: Params;
}

export interface CEdge {
  id: string;
  from: string;
  to: string;
  params: Params;
}

export interface Doc {
  version: 1;
  nodes: CNode[];
  edges: CEdge[];
  view: { x: number; y: number; z: number };
}

export type Level = 'error' | 'warn' | 'info';

export interface Issue {
  level: Level;
  msg: string;
  /** The config field the issue is about, so the form can mark it. */
  field?: string;
}

export const PROJECT = 'ace-lab-123';
export const PROJECT_NUMBER = '123456789012';
export const DEFAULT_SA = `${PROJECT_NUMBER}-compute@developer.gserviceaccount.com`;

export const REGIONS = ['us-central1', 'us-east1', 'europe-west1', 'asia-southeast1', 'asia-southeast2'];
export const REGION_LABEL: Record<string, string> = {
  'us-central1': 'us-central1 (Iowa)',
  'us-east1': 'us-east1 (South Carolina)',
  'europe-west1': 'europe-west1 (Belgia)',
  'asia-southeast1': 'asia-southeast1 (Singapura)',
  'asia-southeast2': 'asia-southeast2 (Jakarta)'
};
const ZONE_LETTERS: Record<string, string[]> = {
  'us-central1': ['a', 'b', 'c', 'f'],
  'us-east1': ['b', 'c', 'd'],
  'europe-west1': ['b', 'c', 'd'],
  'asia-southeast1': ['a', 'b', 'c'],
  'asia-southeast2': ['a', 'b', 'c']
};
export const ZONES = REGIONS.flatMap((r) => ZONE_LETTERS[r].map((l) => `${r}-${l}`));
export const regionOfZone = (z: string) => z.replace(/-[a-z]$/, '');

export const emptyDoc = (): Doc => ({ version: 1, nodes: [], edges: [], view: { x: 40, y: 40, z: 1 } });

let counter = 0;
export const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}${(counter++).toString(36)}`;

export const nodeById = (d: Doc, id: string) => d.nodes.find((n) => n.id === id);
export const outgoing = (d: Doc, id: string) => d.edges.filter((e) => e.from === id);
export const incoming = (d: Doc, id: string) => d.edges.filter((e) => e.to === id);

export const str = (p: Params, k: string, def = '') => (typeof p[k] === 'string' ? (p[k] as string) : p[k] === undefined || p[k] === null ? def : String(p[k]));
export const num = (p: Params, k: string, def = 0) => {
  const v = Number(p[k]);
  return Number.isFinite(v) ? v : def;
};
export const bool = (p: Params, k: string) => p[k] === true;
export const rows = (p: Params, k: string) => (Array.isArray(p[k]) ? (p[k] as Record<string, unknown>[]) : []);
export const list = (p: Params, k: string) =>
  (typeof p[k] === 'string' ? (p[k] as string) : '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export const saEmail = (name: string) => `${name}@${PROJECT}.iam.gserviceaccount.com`;

/** The service account a node runs as: the one wired to it, or the default compute account. */
export function runtimeSa(d: Doc, n: CNode): { email: string; node?: CNode; isDefault: boolean } {
  for (const e of incoming(d, n.id)) {
    const src = nodeById(d, e.from);
    if (src?.type === 'sa') return { email: saEmail(src.name), node: src, isDefault: false };
  }
  return { email: DEFAULT_SA, isDefault: true };
}

/** The VPC a node is attached to, if any. */
export function vpcOf(d: Doc, n: CNode): CNode | undefined {
  for (const e of outgoing(d, n.id)) {
    const t = nodeById(d, e.to);
    if (t?.type === 'vpc') return t;
  }
  return undefined;
}

// ── CIDR helpers ────────────────────────────────────────────────────────────

export function parseCidr(c: string): { base: number; bits: number } | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/.exec(c.trim());
  if (!m) return null;
  const oct = m.slice(1, 5).map(Number);
  const bits = Number(m[5]);
  if (oct.some((o) => o > 255) || bits > 32) return null;
  const ip = ((oct[0] << 24) >>> 0) + (oct[1] << 16) + (oct[2] << 8) + oct[3];
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return { base: (ip & mask) >>> 0, bits };
}

export function overlaps(a: string, b: string): boolean {
  const x = parseCidr(a);
  const y = parseCidr(b);
  if (!x || !y) return false;
  const bits = Math.min(x.bits, y.bits);
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return ((x.base & mask) >>> 0) === ((y.base & mask) >>> 0);
}

export const isPrivateRange = (c: string) => ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '100.64.0.0/10'].some((r) => {
  const x = parseCidr(c);
  const y = parseCidr(r)!;
  return !!x && x.bits >= y.bits && overlaps(c, r);
});
