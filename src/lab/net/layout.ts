/**
 * Lays a topology out on a fixed 1000-unit-wide canvas: outside endpoints
 * along the top, load balancers under them, then one column per VPC with its
 * subnets stacked and VMs in a grid. Deterministic, so a topology always
 * draws the same way and the packet animation can look up any hop's node.
 */
import { peeringState } from './engine';
import type { Topology } from './model';

export const CANVAS_W = 1000;
export const VM_W = 150;
export const VM_H = 58;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Layout {
  w: number;
  h: number;
  vpcs: (Box & { id: string; subnets: (Box & { id: string })[]; chips: (Box & { id: string; kind: 'nat' | 'vpn'; label: string })[] })[];
  vms: (Box & { id: string })[];
  lbs: (Box & { id: string })[];
  ext: (Box & { id: 'internet' | 'iap' | 'google' | 'onprem'; label: string })[];
  peers: { a: string; b: string; active: boolean; d: string; mid: Point }[];
  /** Centre of every node a hop can name. */
  pos: Record<string, Point>;
}

const PAD = 12;
const HEAD = 34;
const GAP = 28;
const center = (b: Box): Point => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });

export function layout(t: Topology): Layout {
  const pos: Record<string, Point> = {};
  const out: Layout = { w: CANVAS_W, h: 0, vpcs: [], vms: [], lbs: [], ext: [], peers: [], pos };

  // Outside world, top row.
  const ext: Layout['ext'][number][] = [
    { id: 'internet', label: 'Internet', x: 0, y: 16, w: 132, h: 44 },
    { id: 'iap', label: 'IAP', x: 0, y: 16, w: 100, h: 44 },
    { id: 'google', label: 'Google APIs', x: 0, y: 16, w: 132, h: 44 }
  ];
  if (t.vpns.length) ext.push({ id: 'onprem', label: `On-prem ${t.onPremCidr}`, x: 0, y: 16, w: 176, h: 44 });
  const slot = CANVAS_W / ext.length;
  ext.forEach((e, i) => {
    e.x = Math.round(slot * i + (slot - e.w) / 2);
    pos[e.id] = center(e);
  });
  out.ext = ext;

  const n = Math.max(1, t.vpcs.length);
  const colW = (CANVAS_W - PAD * 2 - GAP * (n - 1)) / n;
  const top = t.lbs.length ? 168 : 100;

  t.vpcs.forEach((v, i) => {
    const x = PAD + i * (colW + GAP);
    const perRow = Math.max(1, Math.floor((colW - PAD * 2 + 8) / (VM_W + 8)));
    let y = top + HEAD;
    const subnets: Layout['vpcs'][number]['subnets'] = [];
    for (const s of v.subnets) {
      const vms = t.vms.filter((m) => m.subnetId === s.id);
      const rows = Math.max(1, Math.ceil(vms.length / perRow));
      const h = 32 + rows * (VM_H + 8) + 6;
      const box = { id: s.id, x: x + PAD, y, w: colW - PAD * 2, h };
      subnets.push(box);
      vms.forEach((m, j) => {
        const vm = { id: m.id, x: box.x + 8 + (j % perRow) * (VM_W + 8), y: box.y + 32 + Math.floor(j / perRow) * (VM_H + 8), w: VM_W, h: VM_H };
        out.vms.push(vm);
        pos[`vm:${m.id}`] = center(vm);
      });
      y += h + 10;
    }
    const chips: Layout['vpcs'][number]['chips'] = [];
    const extras = [
      ...t.nats.filter((c) => c.vpcId === v.id).map((c) => ({ id: c.id, kind: 'nat' as const, label: `NAT ${c.region}` })),
      ...t.vpns.filter((c) => c.vpcId === v.id).map((c) => ({ id: c.id, kind: 'vpn' as const, label: `${c.ha ? 'HA VPN' : 'VPN'} ${c.region}` }))
    ];
    if (extras.length) {
      let cx = x + PAD;
      for (const e of extras) {
        const w = Math.min(colW - PAD * 2, 30 + e.label.length * 7);
        if (cx + w > x + colW - PAD) {
          cx = x + PAD;
          y += 36;
        }
        const chip = { ...e, x: cx, y, w, h: 28 };
        chips.push(chip);
        pos[`${e.kind}:${e.id}`] = center(chip);
        cx += w + 8;
      }
      y += 38;
    }
    const box = { id: v.id, x, y: top, w: colW, h: Math.max(y - top + 4, HEAD + 40), subnets, chips };
    out.vpcs.push(box);
    pos[`vpc:${v.id}`] = { x: x + colW / 2, y: top + HEAD / 2 };
  });

  // Load balancers sit above the VPC that owns them.
  t.lbs.forEach((lb, i) => {
    const owner = out.vpcs.find((v) => v.id === lb.vpcId);
    const siblings = t.lbs.filter((x) => x.vpcId === lb.vpcId);
    const k = siblings.indexOf(lb);
    const cx = owner ? owner.x + (owner.w / (siblings.length + 1)) * (k + 1) : 120 + i * 160;
    const box = { id: lb.id, x: Math.round(cx - 70), y: 92, w: 140, h: 44 };
    out.lbs.push(box);
    pos[`lb:${lb.id}`] = center(box);
  });

  const bottom = Math.max(top + 80, ...out.vpcs.map((v) => v.y + v.h));

  // Peerings: drawn once per pair; adjacent columns get a straight bridge, others an arc below.
  const seen = new Set<string>();
  let lane = 0;
  for (const p of t.peerings) {
    const key = [p.vpcId, p.peerVpcId].sort().join(':');
    if (seen.has(key)) continue;
    seen.add(key);
    const a = out.vpcs.find((v) => v.id === p.vpcId);
    const b = out.vpcs.find((v) => v.id === p.peerVpcId);
    if (!a || !b) continue;
    const [l, r] = a.x < b.x ? [a, b] : [b, a];
    const active = peeringState(t, p.vpcId, p.peerVpcId).active;
    let d: string;
    let mid: Point;
    if (Math.abs(out.vpcs.indexOf(l) - out.vpcs.indexOf(r)) === 1) {
      const y = l.y + HEAD / 2;
      d = `M ${l.x + l.w} ${y} L ${r.x} ${y}`;
      mid = { x: (l.x + l.w + r.x) / 2, y };
    } else {
      lane += 1;
      const y = bottom + 16 + lane * 14;
      const x1 = l.x + l.w / 2;
      const x2 = r.x + r.w / 2;
      d = `M ${x1} ${l.y + l.h} L ${x1} ${y} L ${x2} ${y} L ${x2} ${r.y + r.h}`;
      mid = { x: (x1 + x2) / 2, y };
    }
    out.peers.push({ a: p.vpcId, b: p.peerVpcId, active, d, mid });
    pos[`peer:${key}`] = mid;
  }

  out.h = bottom + 28 + lane * 14 + (lane ? 16 : 0);
  return out;
}
