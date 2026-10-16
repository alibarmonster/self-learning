/**
 * The reachability engine: given a topology and a probe ("can web-1 reach
 * db-1 on tcp:5432?"), walks the path the way Google Cloud would — egress
 * firewall at the sender, a route, ingress firewall at the receiver, a process
 * listening — and records every decision as a hop, like Connectivity Tests.
 *
 * Semantics modelled (simplified, but faithful where the exams probe):
 * - VPCs are global, subnets regional; subnet routes reach every subnet of the VPC.
 * - Firewall rules are stateful, apply per VM, lowest priority number wins,
 *   a deny beats an allow at the same priority, and two implied rules sit at
 *   65535: deny all ingress, allow all egress.
 * - Targets: all instances, target tags, or target service accounts. Source
 *   tags and source service accounts only match VMs in the same VPC.
 * - Internet egress needs the default route plus an external IP or Cloud NAT;
 *   unsolicited inbound needs an external IP (NAT never accepts inbound).
 * - Google APIs: external IP, Private Google Access on the subnet, or NAT.
 * - Peering is non-transitive, needs both sides, and refuses overlapping ranges.
 * - Cloud VPN routes reach only the router's region unless the VPC uses
 *   global dynamic routing.
 * - Load balancer backends must allow the health-check ranges; the external
 *   Application LB proxies traffic from Google Front Ends, the passthrough
 *   Network LBs keep the client's address.
 */
import { inAny, overlaps } from './ip';
import {
  GFE_RANGES,
  GOOGLE_API_IP,
  IAP_RANGE,
  INTERNET_CLIENT_IP,
  INTERNET_SITE_IP,
  NLB_HC_RANGES,
  onPremHostIp,
  subnetOf,
  vpcOf,
  type Direction,
  type FirewallRule,
  type LoadBalancer,
  type Proto,
  type Topology,
  type Vm,
  type Vpc
} from './model';

export type Endpoint =
  | { kind: 'vm'; id: string }
  | { kind: 'internet' }
  | { kind: 'google' }
  | { kind: 'onprem' }
  | { kind: 'iap' }
  | { kind: 'lb'; id: string };

export interface Probe {
  from: Endpoint;
  to: Endpoint;
  proto: Proto;
  port: number;
}

export interface Hop {
  /** The canvas node this hop happens at, for the packet animation. */
  node: string;
  ok: boolean;
  title: string;
  detail: string;
}

export interface Trace {
  ok: boolean;
  summary: string;
  hops: Hop[];
}

export const nodeId = (e: Endpoint): string =>
  e.kind === 'vm' ? `vm:${e.id}` : e.kind === 'lb' ? `lb:${e.id}` : e.kind;

// ── firewall ─────────────────────────────────────────────────────────────

interface Peer {
  ip: string;
  /** The VM at the other end when it is one of ours. */
  vm?: Vm;
}

export interface FwVerdict {
  allowed: boolean;
  /** The deciding rule's name, or the implied rule. */
  rule: string;
  priority: number;
}

function protoMatches(r: FirewallRule, proto: Proto, port: number): boolean {
  return r.rules.some(
    (s) =>
      s.proto === 'all' ||
      (s.proto === proto &&
        (proto === 'icmp' || !s.ports.length || s.ports.some(([lo, hi]) => port >= lo && port <= hi)))
  );
}

function targets(r: FirewallRule, vm: Vm): boolean {
  if (r.targetTags.length) return r.targetTags.some((t) => vm.tags.includes(t));
  if (r.targetServiceAccounts.length) return r.targetServiceAccounts.includes(vm.serviceAccount);
  return true;
}

function sourceMatches(r: FirewallRule, vpc: Vpc, peer: Peer): boolean {
  const hasSource = r.sourceRanges.length || r.sourceTags.length || r.sourceServiceAccounts.length;
  // gcloud fills in 0.0.0.0/0 when an ingress rule names no source at all.
  if (!hasSource) return true;
  if (r.sourceRanges.length && inAny(peer.ip, r.sourceRanges)) return true;
  // Tags and service accounts identify VMs of this same network only.
  const local = peer.vm && peer.vm.vpcId === vpc.id;
  if (local && r.sourceTags.some((t) => peer.vm!.tags.includes(t))) return true;
  if (local && r.sourceServiceAccounts.includes(peer.vm!.serviceAccount)) return true;
  return false;
}

function destMatches(r: FirewallRule, ip: string): boolean {
  return !r.destinationRanges.length || inAny(ip, r.destinationRanges);
}

/** Evaluates a VPC's firewall for traffic leaving or entering `vm`. */
export function evaluateFirewall(
  vpc: Vpc,
  vm: Vm,
  direction: Direction,
  peer: Peer,
  proto: Proto,
  port: number
): FwVerdict {
  const hits = vpc.firewall
    .filter(
      (r) =>
        !r.disabled &&
        r.direction === direction &&
        targets(r, vm) &&
        protoMatches(r, proto, port) &&
        (direction === 'INGRESS' ? sourceMatches(r, vpc, peer) : destMatches(r, peer.ip))
    )
    .sort((a, b) => a.priority - b.priority || (a.action === 'deny' ? -1 : 1) - (b.action === 'deny' ? -1 : 1));
  const top = hits[0];
  if (top) return { allowed: top.action === 'allow', rule: top.name, priority: top.priority };
  return direction === 'INGRESS'
    ? { allowed: false, rule: 'implied deny ingress', priority: 65535 }
    : { allowed: true, rule: 'implied allow egress', priority: 65535 };
}

const svc = (proto: Proto, port: number) => (proto === 'icmp' ? 'icmp' : `${proto}:${port}`);

function fwHop(vm: Vm, v: FwVerdict, direction: Direction, proto: Proto, port: number, peerLabel: string): Hop {
  const dir = direction === 'INGRESS' ? 'Ingress' : 'Egress';
  return {
    node: `vm:${vm.id}`,
    ok: v.allowed,
    title: `${dir} firewall di ${vm.name}: ${v.allowed ? 'ALLOW' : 'DENY'}`,
    detail: `${svc(proto, port)} ${direction === 'INGRESS' ? 'dari' : 'ke'} ${peerLabel} — diputuskan oleh "${v.rule}" (priority ${v.priority}).${
      !v.allowed && v.rule === 'implied deny ingress'
        ? ' Tidak ada rule allow yang cocok, jadi implied rule menolak semua ingress.'
        : ''
    }`
  };
}

function listenHop(vm: Vm, proto: Proto, port: number): Hop {
  if (proto === 'icmp')
    return { node: `vm:${vm.id}`, ok: true, title: `${vm.name} membalas ping`, detail: 'ICMP echo reply.' };
  const ok = vm.listens.includes(`${proto}:${port}`);
  return {
    node: `vm:${vm.id}`,
    ok,
    title: ok ? `${vm.name} melayani ${proto}:${port}` : `Connection refused di ${vm.name}`,
    detail: ok
      ? 'Paket sampai dan ada proses yang mendengarkan di port itu.'
      : `Firewall sudah lolos, tapi tidak ada aplikasi di ${vm.name} yang listen di ${proto}:${port}. Ini bukan masalah jaringan.`
  };
}

// ── routing helpers ──────────────────────────────────────────────────────

function peeringSide(topo: Topology, a: string, b: string) {
  return topo.peerings.find((p) => p.vpcId === a && p.peerVpcId === b);
}

/** Why two VPCs are, or are not, peered. */
export function peeringState(topo: Topology, a: string, b: string): { active: boolean; reason: string } {
  const ab = peeringSide(topo, a, b);
  const ba = peeringSide(topo, b, a);
  const an = vpcOf(topo, a)?.name ?? a;
  const bn = vpcOf(topo, b)?.name ?? b;
  if (!ab && !ba) return { active: false, reason: `Tidak ada peering antara ${an} dan ${bn}.` };
  if (!ab || !ba)
    return {
      active: false,
      reason: `Peering ${an} ↔ ${bn} masih INACTIVE: baru dibuat dari sisi ${ab ? an : bn}. Sisi ${ab ? bn : an} juga harus membuat peering.`
    };
  const va = vpcOf(topo, a);
  const vb = vpcOf(topo, b);
  const clash = va?.subnets.find((s) => vb?.subnets.some((t) => overlaps(s.cidr, t.cidr)));
  if (clash)
    return {
      active: false,
      reason: `Peering ${an} ↔ ${bn} gagal: range subnet tumpang tindih (${clash.cidr}). Peering menolak CIDR yang overlap.`
    };
  return { active: true, reason: `Peering ${an} ↔ ${bn} ACTIVE.` };
}

function transitiveHint(topo: Topology, a: string, b: string): string {
  const via = topo.vpcs.find(
    (c) => c.id !== a && c.id !== b && peeringState(topo, a, c.id).active && peeringState(topo, c.id, b).active
  );
  return via
    ? ` Ada jalur ${vpcOf(topo, a)?.name} ↔ ${via.name} ↔ ${vpcOf(topo, b)?.name}, tapi VPC peering TIDAK transitif — perlu peering langsung.`
    : '';
}

function natFor(topo: Topology, vm: Vm) {
  const sn = subnetOf(topo, vm);
  return topo.nats.find(
    (n) =>
      n.vpcId === vm.vpcId &&
      n.region === sn?.region &&
      (n.subnets === 'all' || n.subnets.includes(vm.subnetId))
  );
}

/** The VPN that gives `vpcId` (directly or over peering) a route to on-prem, from `region`. */
function vpnRoute(topo: Topology, vm: Vm): { ok: boolean; via?: string; node?: string; detail: string } {
  const vpc = vpcOf(topo, vm.vpcId)!;
  const region = subnetOf(topo, vm)?.region;
  const direct = topo.vpns.filter((t) => t.vpcId === vpc.id);
  if (direct.length) {
    const reach = direct.find((t) => vpc.routingMode === 'GLOBAL' || t.region === region);
    if (reach)
      return {
        ok: true,
        via: reach.name,
        node: `vpn:${reach.id}`,
        detail: `Route dinamis dari Cloud Router (BGP) lewat ${reach.name}${reach.ha ? ' (HA VPN, 2 tunnel)' : ''}.`
      };
    return {
      ok: false,
      detail: `VPN ada di ${direct.map((t) => t.region).join(', ')}, tapi ${vm.name} di ${region} dan dynamic routing mode VPC ${vpc.name} masih REGIONAL. Ubah ke GLOBAL supaya semua region belajar route on-prem.`
    };
  }
  for (const t of topo.vpns) {
    const st = peeringState(topo, vm.vpcId, t.vpcId);
    if (!st.active) continue;
    const ours = peeringSide(topo, vm.vpcId, t.vpcId);
    const theirs = peeringSide(topo, t.vpcId, vm.vpcId);
    const hub = vpcOf(topo, t.vpcId)!;
    if (!ours?.exchangeCustomRoutes || !theirs?.exchangeCustomRoutes)
      return {
        ok: false,
        detail: `On-prem terhubung ke ${hub.name} lewat VPN, dan ${vpc.name} peering ke ${hub.name}, tapi route custom (hasil BGP) tidak dipertukarkan. Aktifkan export/import custom routes di kedua sisi peering.`
      };
    if (hub.routingMode !== 'GLOBAL' && t.region !== region)
      return {
        ok: false,
        detail: `Route on-prem dari ${hub.name} hanya berlaku di ${t.region} (routing mode REGIONAL).`
      };
    return {
      ok: true,
      via: t.name,
      node: `vpn:${t.id}`,
      detail: `Lewat peering ${vpc.name} → ${hub.name} (custom routes di-export/import), lalu ${t.name} ke on-prem.`
    };
  }
  return { ok: false, detail: `Tidak ada Cloud VPN/Interconnect yang menghubungkan ${vpc.name} ke on-prem.` };
}

// ── probes ───────────────────────────────────────────────────────────────

export function describe(topo: Topology, e: Endpoint): string {
  if (e.kind === 'vm') return topo.vms.find((v) => v.id === e.id)?.name ?? 'VM?';
  if (e.kind === 'lb') return topo.lbs.find((l) => l.id === e.id)?.name ?? 'LB?';
  return { internet: 'Internet', google: 'Google APIs', onprem: 'On-prem', iap: 'IAP (SSH di browser)' }[e.kind];
}

function fail(hops: Hop[], summary: string): Trace {
  return { ok: false, summary, hops };
}

function done(hops: Hop[], summary: string): Trace {
  const ok = hops.every((h) => h.ok);
  return { ok, summary: ok ? summary : hops.find((h) => !h.ok)?.title ?? summary, hops };
}

/** Runs one probe and explains the outcome hop by hop. */
export function probe(topo: Topology, p: Probe): Trace {
  const { from, to, proto, port } = p;
  const vm = (e: Endpoint) => (e.kind === 'vm' ? topo.vms.find((v) => v.id === e.id) : undefined);
  const src = vm(from);
  const dst = vm(to);
  if ((from.kind === 'vm' && !src) || (to.kind === 'vm' && !dst))
    return fail([], 'Endpoint tidak ditemukan.');
  if (from.kind === to.kind && from.kind !== 'vm' && from.kind !== 'lb')
    return fail([], 'Pilih dua titik yang berbeda.');
  if (src && dst && src.id === dst.id) return fail([], 'Sumber dan tujuan sama.');

  if (to.kind === 'lb') {
    const lb = topo.lbs.find((l) => l.id === to.id);
    if (!lb) return fail([], 'Load balancer tidak ditemukan.');
    return toLb(topo, lb, from, src, proto, port);
  }
  if (from.kind === 'lb') return fail([], 'Load balancer hanya bisa jadi tujuan.');

  if (src && dst) return vmToVm(topo, src, dst, proto, port);
  if (from.kind === 'internet' && dst) return internetToVm(topo, dst, proto, port);
  if (src && to.kind === 'internet') return vmToInternet(topo, src, proto, port);
  if (src && to.kind === 'google') return vmToGoogle(topo, src, proto, port);
  if (from.kind === 'onprem' && dst) return onPremToVm(topo, dst, proto, port);
  if (from.kind === 'iap' && dst) return iapToVm(topo, dst, proto, port);
  if (src && to.kind === 'onprem') return vmToOnPrem(topo, src, proto, port);
  return fail([], `Skenario ${describe(topo, from)} → ${describe(topo, to)} tidak dimodelkan di lab ini.`);
}

function vmToVm(topo: Topology, src: Vm, dst: Vm, proto: Proto, port: number): Trace {
  const hops: Hop[] = [];
  const sv = vpcOf(topo, src.vpcId)!;
  const dv = vpcOf(topo, dst.vpcId)!;
  const eg = evaluateFirewall(sv, src, 'EGRESS', { ip: dst.internalIp, vm: dst }, proto, port);
  hops.push(fwHop(src, eg, 'EGRESS', proto, port, `${dst.name} (${dst.internalIp})`));
  if (!eg.allowed) return done(hops, '');

  if (sv.id === dv.id) {
    const ss = subnetOf(topo, src);
    const ds = subnetOf(topo, dst);
    hops.push({
      node: `vpc:${sv.id}`,
      ok: true,
      title: `Subnet route di VPC ${sv.name}`,
      detail:
        ss?.region === ds?.region
          ? `Satu VPC, route subnet ${ds?.cidr} otomatis ada.`
          : `VPC itu global: ${ss?.region} → ${ds?.region} tetap lewat jaringan internal Google, tanpa VPN/peering.`
    });
  } else {
    const st = peeringState(topo, sv.id, dv.id);
    hops.push({
      node: st.active ? `peer:${[sv.id, dv.id].sort().join(':')}` : `vpc:${sv.id}`,
      ok: st.active,
      title: st.active ? `VPC peering ${sv.name} → ${dv.name}` : `Tidak ada route ke ${dst.internalIp}`,
      detail: st.active
        ? 'Route subnet dipertukarkan lewat peering; trafik tetap internal.'
        : st.reason + transitiveHint(topo, sv.id, dv.id)
    });
    if (!st.active) return done(hops, '');
  }

  const ing = evaluateFirewall(dv, dst, 'INGRESS', { ip: src.internalIp, vm: src }, proto, port);
  const hop = fwHop(dst, ing, 'INGRESS', proto, port, `${src.name} (${src.internalIp})`);
  if (!ing.allowed && sv.id !== dv.id && dv.firewall.some((r) => r.sourceTags.length && r.direction === 'INGRESS'))
    hop.detail += ' Catatan: source tags tidak berlaku lintas peering — pakai source range.';
  hops.push(hop);
  if (!ing.allowed) return done(hops, '');
  hops.push(listenHop(dst, proto, port));
  return done(hops, `${src.name} → ${dst.name} ${svc(proto, port)}: tersambung.`);
}

function defaultRouteHop(vpc: Vpc, node: string, purpose: string): Hop {
  return {
    node,
    ok: vpc.defaultInternetRoute,
    title: vpc.defaultInternetRoute
      ? 'Default route 0.0.0.0/0 → default-internet-gateway'
      : 'Default route ke internet sudah dihapus',
    detail: vpc.defaultInternetRoute
      ? `Next hop: default-internet-gateway (${purpose}).`
      : `VPC ${vpc.name} tidak punya route 0.0.0.0/0, jadi ${purpose} tidak punya jalan keluar.`
  };
}

function internetToVm(topo: Topology, dst: Vm, proto: Proto, port: number): Trace {
  const hops: Hop[] = [];
  const dv = vpcOf(topo, dst.vpcId)!;
  if (!dst.externalIp) {
    hops.push({
      node: `vm:${dst.id}`,
      ok: false,
      title: `${dst.name} tidak punya external IP`,
      detail:
        'Dari internet hanya external IP (atau load balancer) yang bisa dituju. Cloud NAT hanya untuk koneksi keluar, tidak menerima koneksi masuk.' +
        (natFor(topo, dst) ? ' (VM ini memang pakai Cloud NAT — tetap tidak bisa diakses dari luar.)' : '')
    });
    return done(hops, '');
  }
  hops.push({
    node: 'internet',
    ok: true,
    title: `Klien internet → ${dst.externalIp}`,
    detail: `External IP ${dst.externalIp} dipetakan 1:1 ke ${dst.internalIp}.`
  });
  const ing = evaluateFirewall(dv, dst, 'INGRESS', { ip: INTERNET_CLIENT_IP }, proto, port);
  hops.push(fwHop(dst, ing, 'INGRESS', proto, port, `internet (${INTERNET_CLIENT_IP})`));
  if (!ing.allowed) return done(hops, '');
  hops.push(listenHop(dst, proto, port));
  if (!hops.at(-1)!.ok) return done(hops, '');
  hops.push(defaultRouteHop(dv, `vpc:${dv.id}`, 'balasan ke klien'));
  return done(hops, `Internet → ${dst.name} ${svc(proto, port)}: tersambung.`);
}

function vmToInternet(topo: Topology, src: Vm, proto: Proto, port: number): Trace {
  const hops: Hop[] = [];
  const sv = vpcOf(topo, src.vpcId)!;
  const eg = evaluateFirewall(sv, src, 'EGRESS', { ip: INTERNET_SITE_IP }, proto, port);
  hops.push(fwHop(src, eg, 'EGRESS', proto, port, `internet (${INTERNET_SITE_IP})`));
  if (!eg.allowed) return done(hops, '');
  hops.push(defaultRouteHop(sv, `vpc:${sv.id}`, 'trafik ke internet'));
  if (!sv.defaultInternetRoute) return done(hops, '');
  if (src.externalIp) {
    hops.push({ node: 'internet', ok: true, title: `Keluar dengan external IP ${src.externalIp}`, detail: 'VM punya external IP sendiri.' });
  } else {
    const nat = natFor(topo, src);
    hops.push(
      nat
        ? { node: `nat:${nat.id}`, ok: true, title: `Cloud NAT ${nat.name} menerjemahkan alamat`, detail: `VM tanpa external IP keluar lewat NAT di ${nat.region}. Balasan diizinkan, koneksi baru dari luar tidak.` }
        : {
            node: `vm:${src.id}`,
            ok: false,
            title: `${src.name} tidak punya external IP dan tidak ada Cloud NAT`,
            detail: `Tambahkan Cloud NAT (di Cloud Router) untuk region ${subnetOf(topo, src)?.region}, atau beri external IP. NAT itu regional: NAT di region lain tidak berlaku.`
          }
    );
    if (nat) hops.push({ node: 'internet', ok: true, title: 'Sampai di internet', detail: '' });
  }
  return done(hops, `${src.name} → internet ${svc(proto, port)}: tersambung.`);
}

function vmToGoogle(topo: Topology, src: Vm, proto: Proto, port: number): Trace {
  const hops: Hop[] = [];
  const sv = vpcOf(topo, src.vpcId)!;
  const sn = subnetOf(topo, src);
  const eg = evaluateFirewall(sv, src, 'EGRESS', { ip: GOOGLE_API_IP }, proto, port);
  hops.push(fwHop(src, eg, 'EGRESS', proto, port, `storage.googleapis.com (${GOOGLE_API_IP})`));
  if (!eg.allowed) return done(hops, '');
  hops.push(defaultRouteHop(sv, `vpc:${sv.id}`, 'akses Google APIs'));
  if (!sv.defaultInternetRoute) return done(hops, '');
  const nat = natFor(topo, src);
  const how = src.externalIp
    ? 'VM punya external IP.'
    : sn?.privateGoogleAccess
      ? `Private Google Access aktif di subnet ${sn.name} — tanpa external IP, trafik tetap di jaringan Google.`
      : nat
        ? `Lewat Cloud NAT ${nat.name} (Private Google Access mati, tapi NAT juga bisa menjangkau Google APIs).`
        : '';
  hops.push(
    how
      ? { node: 'google', ok: true, title: 'Sampai di Google APIs', detail: how }
      : {
          node: `vm:${src.id}`,
          ok: false,
          title: `${src.name} tidak bisa menjangkau Google APIs`,
          detail: `Tanpa external IP, VM butuh Private Google Access di subnet ${sn?.name} (atau Cloud NAT). PGA diatur per subnet.`
        }
  );
  return done(hops, `${src.name} → Google APIs: tersambung.`);
}

function iapToVm(topo: Topology, dst: Vm, proto: Proto, port: number): Trace {
  const hops: Hop[] = [];
  const dv = vpcOf(topo, dst.vpcId)!;
  const ip = '35.235.240.10';
  hops.push({
    node: 'iap',
    ok: true,
    title: 'IAP TCP forwarding',
    detail: `Identity-Aware Proxy memeriksa IAM (roles/iap.tunnelResourceAccessor), lalu membuka tunnel dari ${IAP_RANGE} ke IP internal ${dst.internalIp}. External IP tidak dibutuhkan.`
  });
  const ing = evaluateFirewall(dv, dst, 'INGRESS', { ip }, proto, port);
  const hop = fwHop(dst, ing, 'INGRESS', proto, port, `IAP (${IAP_RANGE})`);
  if (!ing.allowed) hop.detail += ` Buat rule ingress allow ${svc(proto, port)} dari ${IAP_RANGE}.`;
  hops.push(hop);
  if (!ing.allowed) return done(hops, '');
  hops.push(listenHop(dst, proto, port));
  return done(hops, `IAP → ${dst.name} ${svc(proto, port)}: tersambung.`);
}

function onPremToVm(topo: Topology, dst: Vm, proto: Proto, port: number): Trace {
  const hops: Hop[] = [];
  const route = vpnRoute(topo, dst);
  hops.push({ node: route.node ?? 'onprem', ok: route.ok, title: route.ok ? `Lewat ${route.via}` : 'Tidak ada jalur dari on-prem', detail: route.detail });
  if (!route.ok) return done(hops, '');
  const dv = vpcOf(topo, dst.vpcId)!;
  const ip = onPremHostIp(topo);
  const ing = evaluateFirewall(dv, dst, 'INGRESS', { ip }, proto, port);
  hops.push(fwHop(dst, ing, 'INGRESS', proto, port, `on-prem (${ip})`));
  if (!ing.allowed) return done(hops, '');
  hops.push(listenHop(dst, proto, port));
  return done(hops, `On-prem → ${dst.name} ${svc(proto, port)}: tersambung.`);
}

function vmToOnPrem(topo: Topology, src: Vm, proto: Proto, port: number): Trace {
  const hops: Hop[] = [];
  const sv = vpcOf(topo, src.vpcId)!;
  const ip = onPremHostIp(topo);
  const eg = evaluateFirewall(sv, src, 'EGRESS', { ip }, proto, port);
  hops.push(fwHop(src, eg, 'EGRESS', proto, port, `on-prem (${ip})`));
  if (!eg.allowed) return done(hops, '');
  const route = vpnRoute(topo, src);
  hops.push({ node: route.node ?? `vm:${src.id}`, ok: route.ok, title: route.ok ? `Lewat ${route.via}` : `Tidak ada route ke ${topo.onPremCidr}`, detail: route.detail });
  if (!route.ok) return done(hops, '');
  hops.push({ node: 'onprem', ok: true, title: 'Sampai di on-prem', detail: `Host ${ip} menerima koneksi (firewall on-prem dianggap terbuka).` });
  return done(hops, `${src.name} → on-prem: tersambung.`);
}

function toLb(topo: Topology, lb: LoadBalancer, from: Endpoint, src: Vm | undefined, proto: Proto, port: number): Trace {
  const hops: Hop[] = [];
  const vpc = vpcOf(topo, lb.vpcId)!;
  const external = lb.type.startsWith('external');
  const label = {
    'external-alb': 'External Application LB (global, HTTP/S, proxy)',
    'external-nlb': 'External passthrough Network LB (regional, TCP/UDP)',
    'internal-alb': 'Internal Application LB (regional, proxy)',
    'internal-nlb': 'Internal passthrough Network LB (regional, TCP/UDP)'
  }[lb.type];

  if (external && from.kind !== 'internet') {
    hops.push({ node: `lb:${lb.id}`, ok: false, title: 'LB external dites dari internet', detail: 'Pilih Internet sebagai sumber untuk load balancer external.' });
    return done(hops, '');
  }
  if (!external) {
    if (!src) {
      hops.push({ node: `lb:${lb.id}`, ok: false, title: 'Internal LB hanya untuk klien di VPC', detail: 'Internal load balancer tidak punya alamat publik; klien harus VM di VPC yang sama (atau on-prem/peered).' });
      return done(hops, '');
    }
    if (src.vpcId !== lb.vpcId) {
      hops.push({ node: `lb:${lb.id}`, ok: false, title: 'Klien di VPC lain', detail: 'Lab ini memodelkan klien internal LB di VPC yang sama.' });
      return done(hops, '');
    }
    const region = subnetOf(topo, src)?.region;
    if (region !== lb.region) {
      hops.push({ node: `lb:${lb.id}`, ok: false, title: 'Klien beda region', detail: `Internal LB ini di ${lb.region}; klien di ${region}. Aktifkan global access di forwarding rule kalau klien dari region lain.` });
      return done(hops, '');
    }
    const eg = evaluateFirewall(vpc, src, 'EGRESS', { ip: lb.ip }, proto, port);
    hops.push(fwHop(src, eg, 'EGRESS', proto, port, `${lb.name} (${lb.ip})`));
    if (!eg.allowed) return done(hops, '');
  }
  if (proto === 'icmp' || port !== lb.port) {
    hops.push({ node: `lb:${lb.id}`, ok: false, title: `Forwarding rule tidak melayani ${svc(proto, port)}`, detail: `${lb.name} hanya menerima ${lb.type.endsWith('alb') ? 'HTTP(S)' : 'TCP'} di port ${lb.port}.` });
    return done(hops, '');
  }
  hops.push({ node: `lb:${lb.id}`, ok: true, title: `${lb.name}: ${label}`, detail: `Frontend ${lb.ip}:${lb.port} → backend port ${lb.backendPort}.` });

  const backends = topo.vms.filter((v) => lb.backendVmIds.includes(v.id));
  if (!backends.length) {
    hops.push({ node: `lb:${lb.id}`, ok: false, title: 'Backend kosong', detail: 'Tambahkan VM (instance group) sebagai backend.' });
    return done(hops, '');
  }
  const proxy = lb.type.endsWith('alb');
  const hcRanges = lb.type === 'external-nlb' ? NLB_HC_RANGES : GFE_RANGES;
  const clientIp = from.kind === 'internet' ? INTERNET_CLIENT_IP : src!.internalIp;
  const healthy: Vm[] = [];
  for (const b of backends) {
    if (b.vpcId !== lb.vpcId) continue;
    // Probes arrive from every health-check range; each one must be allowed.
    const verdicts = hcRanges.map((r) => evaluateFirewall(vpc, b, 'INGRESS', { ip: r.split('/')[0] }, 'tcp', lb.backendPort));
    const hc = verdicts.find((v) => !v.allowed) ?? verdicts[0];
    const serving = b.listens.includes(`tcp:${lb.backendPort}`);
    // A proxy LB reaches backends from Google's ranges; a passthrough LB keeps the client's IP.
    const data = proxy
      ? hc
      : evaluateFirewall(vpc, b, 'INGRESS', { ip: clientIp, vm: src }, 'tcp', lb.backendPort);
    const ok = hc.allowed && serving && data.allowed;
    if (ok) healthy.push(b);
    hops.push({
      node: `vm:${b.id}`,
      ok,
      title: `Backend ${b.name}: ${ok ? 'HEALTHY' : 'UNHEALTHY'}`,
      detail: !hc.allowed
        ? `Health check dari ${hcRanges.join(', ')} ke tcp:${lb.backendPort} ditolak oleh "${hc.rule}". Buat rule ingress allow dari range health check.`
        : !serving
          ? `Tidak ada aplikasi di ${b.name} yang listen di tcp:${lb.backendPort}.`
          : !data.allowed
            ? `Passthrough LB meneruskan IP asli klien (${clientIp}); firewall "${data.rule}" menolaknya.`
            : proxy
              ? `Health check lolos; trafik datang dari proxy Google (${GFE_RANGES.join(', ')}), backend tidak perlu external IP.`
              : 'Health check dan trafik klien (IP asli) diizinkan.'
    });
  }
  // A load balancer works while at least one backend is healthy.
  return {
    ok: healthy.length > 0,
    summary: healthy.length
      ? `${describe(topo, from)} → ${lb.name}: dilayani oleh ${healthy.map((b) => b.name).join(', ')}.`
      : 'Semua backend unhealthy — LB membalas 502 / koneksi gagal.',
    hops
  };
}
