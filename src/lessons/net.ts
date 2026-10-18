/**
 * Small, exact helpers behind the networking lesson's interactive blocks: a
 * subnet calculator that knows the four addresses Google reserves, and a VPC
 * firewall evaluator — lowest priority number wins, deny beats allow at the
 * same priority, implied deny-ingress / allow-egress at 65535.
 */
import type { FwPacket, FwRule, FwVm } from '@/types';

const toInt = (ip: string): number | null => {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip.trim());
  if (!m) return null;
  const o = m.slice(1).map(Number);
  if (o.some((x) => x > 255)) return null;
  return ((o[0] << 24) >>> 0) + (o[1] << 16) + (o[2] << 8) + o[3];
};

const toIp = (n: number) => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');

const maskOf = (bits: number) => (bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0);

export function parseCidr(c: string): { base: number; bits: number } | null {
  const [ip, b] = c.trim().split('/');
  const n = toInt(ip ?? '');
  const bits = Number(b);
  if (n === null || b === undefined || !/^\d+$/.test(b) || bits > 32) return null;
  return { base: (n & maskOf(bits)) >>> 0, bits };
}

export function inCidr(ip: string, cidr: string): boolean {
  const n = toInt(ip);
  const c = parseCidr(cidr);
  if (n === null || !c) return false;
  return ((n & maskOf(c.bits)) >>> 0) === c.base;
}

const PRIVATE = ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'];

export type CidrInfo =
  | { ok: false; error: string }
  | {
      ok: true;
      cidr: string;
      normalised: boolean;
      network: string;
      gateway: string;
      googleReserved: string;
      broadcast: string;
      firstUsable: string;
      lastUsable: string;
      total: number;
      usable: number;
      mask: string;
      rfc1918: boolean;
      /** Why it could not be a VPC subnet primary range, if it could not. */
      subnetProblem?: string;
    };

export function cidrInfo(input: string): CidrInfo {
  const c = parseCidr(input);
  if (!c) return { ok: false, error: 'Tulis seperti 10.0.1.0/24 — empat angka 0–255, garis miring, lalu panjang prefix 0–32.' };
  const total = 2 ** (32 - c.bits);
  const last = c.base + total - 1;
  const network = toIp(c.base);
  const rfc1918 = PRIVATE.some((p) => inCidr(network, p) && c.bits >= parseCidr(p)!.bits);
  let subnetProblem: string | undefined;
  if (c.bits > 29) subnetProblem = 'Subnet IPv4 di VPC paling kecil /29 (8 alamat, 4 bisa dipakai).';
  else if (c.bits < 8) subnetProblem = 'Rentang sebesar ini tidak dianjurkan untuk subnet; Google menyarankan maksimal /8.';
  else if (!rfc1918) subnetProblem = 'Bukan rentang privat RFC 1918 (10/8, 172.16/12, 192.168/16) — biasanya bukan yang diinginkan untuk subnet.';
  return {
    ok: true,
    cidr: `${network}/${c.bits}`,
    normalised: input.trim() !== `${network}/${c.bits}`,
    network,
    gateway: toIp(c.base + 1),
    googleReserved: toIp(last - 1),
    broadcast: toIp(last),
    firstUsable: toIp(c.base + 2),
    lastUsable: toIp(last - 2),
    total,
    usable: Math.max(0, total - 4),
    mask: toIp(maskOf(c.bits)),
    rfc1918,
    subnetProblem
  };
}

// ── firewall ────────────────────────────────────────────────────────────────

export const describePacket = (p: FwPacket) => {
  const port = p.proto === 'icmp' ? 'icmp' : `${p.proto}:${p.port}`;
  return p.direction === 'INGRESS' ? `${p.peer} → ${p.vm}  ${port}` : `${p.vm} → ${p.peer}  ${port}`;
};

function portsCover(ports: string, proto: string, port?: number): boolean {
  return ports.split(',').some((entry) => {
    const e = entry.trim();
    if (e === 'all') return true;
    const [pr, range] = e.split(':');
    if (pr !== proto) return false;
    if (!range || port === undefined) return true;
    const [a, b] = range.split('-').map(Number);
    return port >= a && port <= (b ?? a);
  });
}

export interface FwStep {
  rule: string;
  priority: number;
  action: 'allow' | 'deny';
  match: boolean;
  why: string;
}

export interface FwVerdict {
  action: 'allow' | 'deny';
  /** The deciding rule, or the implied rule. */
  rule: string;
  implied: boolean;
  steps: FwStep[];
}

/** The order Google evaluates rules in: lowest priority number first, deny before allow at a tie. */
export const byPriority = (a: FwRule, b: FwRule) => a.priority - b.priority || (a.action === b.action ? 0 : a.action === 'deny' ? -1 : 1);

export function evaluate(vms: FwVm[], rules: FwRule[], p: FwPacket): FwVerdict {
  const vm = vms.find((v) => v.name === p.vm)!;
  const peerVm = vms.find((v) => v.name === p.peer);
  const peerIp = peerVm?.ip ?? p.peer;
  const steps: FwStep[] = [];
  for (const r of [...rules].sort(byPriority)) {
    const step = (match: boolean, why: string) => steps.push({ rule: r.name, priority: r.priority, action: r.action, match, why });
    if (r.direction !== p.direction) {
      step(false, `arah ${r.direction}, koneksi ini ${p.direction}`);
      continue;
    }
    if (r.targetSa && r.targetSa !== vm.sa) {
      step(false, `target hanya VM dengan service account ${r.targetSa}`);
      continue;
    }
    if (!r.targetSa && r.targetTags?.length && !r.targetTags.some((t) => vm.tags.includes(t))) {
      step(false, `target tag ${r.targetTags.join(', ')} — ${vm.name} tidak punya`);
      continue;
    }
    if (p.direction === 'INGRESS') {
      const ranges = r.sources ?? [];
      const tags = r.sourceTags ?? [];
      const anySource = !ranges.length && !tags.length;
      const byRange = anySource || ranges.some((c) => inCidr(peerIp, c));
      const byTag = !!peerVm && tags.some((t) => peerVm.tags.includes(t));
      if (!byRange && !byTag) {
        step(false, tags.length && !ranges.length ? `sumber hanya VM bertag ${tags.join(', ')}` : `sumber ${peerIp} tidak di ${ranges.join(', ')}`);
        continue;
      }
    } else {
      const dests = r.destinations ?? [];
      if (dests.length && !dests.some((c) => inCidr(peerIp, c))) {
        step(false, `tujuan ${peerIp} tidak di ${dests.join(', ')}`);
        continue;
      }
    }
    if (!portsCover(r.ports, p.proto, p.port)) {
      step(false, `${p.proto === 'icmp' ? 'icmp' : `${p.proto}:${p.port}`} tidak termasuk ${r.ports}`);
      continue;
    }
    step(true, 'cocok');
  }
  const matched = steps.filter((s) => s.match);
  if (!matched.length) {
    const action = p.direction === 'INGRESS' ? 'deny' : 'allow';
    return { action, rule: p.direction === 'INGRESS' ? 'implied deny ingress (65535)' : 'implied allow egress (65535)', implied: true, steps };
  }
  const top = matched[0].priority;
  const tied = matched.filter((s) => s.priority === top);
  const win = tied.find((s) => s.action === 'deny') ?? tied[0];
  return { action: win.action, rule: win.rule, implied: false, steps };
}
