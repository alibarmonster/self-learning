/**
 * The network lab's world: VPC networks, subnets, VMs, firewall rules,
 * peering, Cloud NAT, Cloud VPN and load balancers. Plain data, so a topology
 * can be cloned, saved to localStorage and diffed against a scenario's goals.
 */
import { intToIp, nextHost } from './ip';

export type Proto = 'tcp' | 'udp' | 'icmp';
export type Direction = 'INGRESS' | 'EGRESS';
export type FwAction = 'allow' | 'deny';

/** One `--rules` entry: `tcp:80`, `tcp:8000-8100`, `icmp`, or `all`. */
export interface FwProtoSpec {
  proto: Proto | 'all';
  /** Inclusive port ranges; empty means every port of the protocol. */
  ports: [number, number][];
}

export interface FirewallRule {
  id: string;
  name: string;
  direction: Direction;
  action: FwAction;
  /** 0–65535; lower numbers win. */
  priority: number;
  rules: FwProtoSpec[];
  /** Ingress: where traffic may come from. */
  sourceRanges: string[];
  sourceTags: string[];
  sourceServiceAccounts: string[];
  /** Egress: where traffic may go. */
  destinationRanges: string[];
  /** Empty tags and service accounts mean "all instances in the network". */
  targetTags: string[];
  targetServiceAccounts: string[];
  disabled: boolean;
}

export interface Subnet {
  id: string;
  name: string;
  region: string;
  cidr: string;
  /** Private Google Access: VMs without external IPs may reach Google APIs. */
  privateGoogleAccess: boolean;
}

export interface Vpc {
  id: string;
  name: string;
  mode: 'auto' | 'custom';
  /** Cloud Router dynamic routing mode: which regions learn routes from VPN/Interconnect. */
  routingMode: 'REGIONAL' | 'GLOBAL';
  /** The default route 0.0.0.0/0 → default-internet-gateway. Deleting it cuts the internet. */
  defaultInternetRoute: boolean;
  subnets: Subnet[];
  firewall: FirewallRule[];
}

export interface Vm {
  id: string;
  name: string;
  vpcId: string;
  subnetId: string;
  zone: string;
  internalIp: string;
  /** Ephemeral or static external IPv4; null when the VM has none. */
  externalIp: string | null;
  tags: string[];
  serviceAccount: string;
  /** What the VM serves, e.g. `tcp:80`. ICMP is always answered. */
  listens: string[];
}

/** One side of VPC peering. Both sides must exist for the peering to be ACTIVE. */
export interface Peering {
  id: string;
  name: string;
  vpcId: string;
  peerVpcId: string;
  /** Export/import custom routes (e.g. routes learned over VPN) to and from the peer. */
  exchangeCustomRoutes: boolean;
}

export interface CloudNat {
  id: string;
  name: string;
  vpcId: string;
  region: string;
  /** 'all' or the subnet ids NAT applies to. */
  subnets: 'all' | string[];
}

export interface VpnTunnel {
  id: string;
  name: string;
  vpcId: string;
  region: string;
  /** HA VPN: two tunnels for the 99.99% SLA. */
  ha: boolean;
  /** Routes learned from on-prem through Cloud Router (BGP). */
  remoteCidr: string;
}

export type LbType = 'external-alb' | 'external-nlb' | 'internal-alb' | 'internal-nlb';

export interface LoadBalancer {
  id: string;
  name: string;
  type: LbType;
  vpcId: string;
  /** Regional types serve one region; the global external ALB serves all. */
  region: string;
  /** The frontend (forwarding rule) port. */
  port: number;
  /** The port the backends serve on. */
  backendPort: number;
  backendVmIds: string[];
  /** Frontend address, filled in when created. */
  ip: string;
}

export interface Topology {
  vpcs: Vpc[];
  vms: Vm[];
  peerings: Peering[];
  nats: CloudNat[];
  vpns: VpnTunnel[];
  lbs: LoadBalancer[];
  /** The on-premises network at the far end of any VPN tunnel. */
  onPremCidr: string;
}

// ── well-known addresses ─────────────────────────────────────────────────

/** A client somewhere on the internet. */
export const INTERNET_CLIENT_IP = '203.0.113.10';
/** A public site a VM might fetch updates from. */
export const INTERNET_SITE_IP = '151.101.1.69';
/** One of the public addresses behind storage.googleapis.com. */
export const GOOGLE_API_IP = '142.250.4.207';
/** An on-prem host. */
export const ONPREM_HOST_OFFSET = 10;

/** Google Front End and health-check ranges used by Google Cloud load balancers. */
export const GFE_RANGES = ['130.211.0.0/22', '35.191.0.0/16'];
/** Extra health-check ranges for the external passthrough Network Load Balancer. */
export const NLB_HC_RANGES = ['35.191.0.0/16', '209.85.152.0/22', '209.85.204.0/22'];
/** Identity-Aware Proxy TCP forwarding (SSH/RDP without external IPs). */
export const IAP_RANGE = '35.235.240.0/20';

export const REGIONS = [
  'us-central1',
  'us-east1',
  'europe-west1',
  'asia-southeast1',
  'asia-southeast2'
] as const;

/** The auto-mode subnet range Google assigns per region (a few of them). */
export const AUTO_RANGES: Record<string, string> = {
  'us-central1': '10.128.0.0/20',
  'us-east1': '10.142.0.0/20',
  'europe-west1': '10.132.0.0/20',
  'asia-southeast1': '10.148.0.0/20',
  'asia-southeast2': '10.184.0.0/20'
};

export const DEFAULT_SA = 'default-compute@developer';

// ── factories ────────────────────────────────────────────────────────────

let seq = 0;
export function uid(prefix: string): string {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}${seq.toString(36)}`;
}

export function fwRule(
  partial: Partial<FirewallRule> & Pick<FirewallRule, 'name'>
): FirewallRule {
  return {
    id: uid('fw'),
    direction: 'INGRESS',
    action: 'allow',
    priority: 1000,
    rules: [{ proto: 'all', ports: [] }],
    sourceRanges: [],
    sourceTags: [],
    sourceServiceAccounts: [],
    destinationRanges: [],
    targetTags: [],
    targetServiceAccounts: [],
    disabled: false,
    ...partial
  };
}

/** The four rules Google pre-populates in the `default` network. */
export function defaultNetworkRules(): FirewallRule[] {
  return [
    fwRule({
      name: 'default-allow-internal',
      priority: 65534,
      sourceRanges: ['10.128.0.0/9'],
      rules: [
        { proto: 'tcp', ports: [[0, 65535]] },
        { proto: 'udp', ports: [[0, 65535]] },
        { proto: 'icmp', ports: [] }
      ]
    }),
    fwRule({
      name: 'default-allow-ssh',
      priority: 65534,
      sourceRanges: ['0.0.0.0/0'],
      rules: [{ proto: 'tcp', ports: [[22, 22]] }]
    }),
    fwRule({
      name: 'default-allow-rdp',
      priority: 65534,
      sourceRanges: ['0.0.0.0/0'],
      rules: [{ proto: 'tcp', ports: [[3389, 3389]] }]
    }),
    fwRule({
      name: 'default-allow-icmp',
      priority: 65534,
      sourceRanges: ['0.0.0.0/0'],
      rules: [{ proto: 'icmp', ports: [] }]
    })
  ];
}

export function makeVpc(name: string, mode: Vpc['mode'] = 'custom', regions: string[] = []): Vpc {
  const vpc: Vpc = {
    id: uid('vpc'),
    name,
    mode,
    routingMode: 'REGIONAL',
    defaultInternetRoute: true,
    subnets: [],
    firewall: []
  };
  if (mode === 'auto') {
    for (const r of regions.length ? regions : Object.keys(AUTO_RANGES)) {
      vpc.subnets.push(makeSubnet(name, r, AUTO_RANGES[r] ?? '10.200.0.0/20'));
    }
  }
  return vpc;
}

export function makeSubnet(name: string, region: string, cidr: string, pga = false): Subnet {
  return { id: uid('sn'), name, region, cidr, privateGoogleAccess: pga };
}

/** The `default` network as a new project has it: auto mode, four open rules. */
export function defaultNetwork(regions: string[] = ['us-central1', 'asia-southeast2']): Vpc {
  const vpc = makeVpc('default', 'auto', regions);
  vpc.firewall = defaultNetworkRules();
  return vpc;
}

let extSeq = 20;
export function newExternalIp(): string {
  extSeq += 1;
  return `34.101.${extSeq}.${(extSeq * 7) % 250}`;
}

export function makeVm(
  topo: Topology,
  opts: {
    name: string;
    vpc: Vpc;
    subnet: Subnet;
    external?: boolean;
    tags?: string[];
    serviceAccount?: string;
    listens?: string[];
  }
): Vm {
  const taken = topo.vms.filter((v) => v.subnetId === opts.subnet.id).map((v) => v.internalIp);
  return {
    id: uid('vm'),
    name: opts.name,
    vpcId: opts.vpc.id,
    subnetId: opts.subnet.id,
    zone: `${opts.subnet.region}-a`,
    internalIp: nextHost(opts.subnet.cidr, taken) ?? '0.0.0.0',
    externalIp: opts.external ? newExternalIp() : null,
    tags: opts.tags ?? [],
    serviceAccount: opts.serviceAccount ?? DEFAULT_SA,
    listens: opts.listens ?? []
  };
}

export function emptyTopology(): Topology {
  return { vpcs: [], vms: [], peerings: [], nats: [], vpns: [], lbs: [], onPremCidr: '192.168.0.0/16' };
}

export function onPremHostIp(topo: Topology): string {
  const base = topo.onPremCidr.split('/')[0].split('.').map(Number);
  return intToIp(((base[0] * 256 + base[1]) * 256 + base[2] + 1) * 256 + ONPREM_HOST_OFFSET);
}

// ── lookups ──────────────────────────────────────────────────────────────

export function vpcOf(topo: Topology, id: string): Vpc | undefined {
  return topo.vpcs.find((v) => v.id === id);
}

export function subnetOf(topo: Topology, vm: Vm): Subnet | undefined {
  return vpcOf(topo, vm.vpcId)?.subnets.find((s) => s.id === vm.subnetId);
}

export function vmByName(topo: Topology, name: string): Vm | undefined {
  return topo.vms.find((v) => v.name === name);
}

export function vpcByName(topo: Topology, name: string): Vpc | undefined {
  return topo.vpcs.find((v) => v.name === name);
}

/** A deep copy, for resets and undo. */
export function cloneTopology(t: Topology): Topology {
  return JSON.parse(JSON.stringify(t)) as Topology;
}

// ── rule text ↔ data ─────────────────────────────────────────────────────

/** Parses `tcp:80,tcp:443,icmp` or `all` the way `--rules`/`--allow` does. */
export function parseRules(text: string): FwProtoSpec[] | null {
  const out: FwProtoSpec[] = [];
  for (const raw of text.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)) {
    if (raw === 'all') {
      out.push({ proto: 'all', ports: [] });
      continue;
    }
    const [proto, ports] = raw.split(':');
    if (proto !== 'tcp' && proto !== 'udp' && proto !== 'icmp') return null;
    if (!ports) {
      out.push({ proto, ports: [] });
      continue;
    }
    if (proto === 'icmp') return null;
    const m = /^(\d{1,5})(?:-(\d{1,5}))?$/.exec(ports);
    if (!m) return null;
    const lo = Number(m[1]);
    const hi = Number(m[2] ?? m[1]);
    if (lo > hi || hi > 65535) return null;
    const existing = out.find((s) => s.proto === proto && s.ports.length);
    if (existing) existing.ports.push([lo, hi]);
    else out.push({ proto, ports: [[lo, hi]] });
  }
  return out.length ? out : null;
}

export function rulesText(specs: FwProtoSpec[]): string {
  return specs
    .flatMap((s) =>
      s.proto === 'all'
        ? ['all']
        : s.ports.length
          ? s.ports.map(([lo, hi]) => `${s.proto}:${lo === hi ? lo : `${lo}-${hi}`}`)
          : [s.proto]
    )
    .join(',');
}

/** `tcp:80` → { proto, port }. */
export function parseService(text: string): { proto: Proto; port: number } | null {
  const m = /^(tcp|udp):(\d{1,5})$/.exec(text.trim().toLowerCase());
  return m ? { proto: m[1] as Proto, port: Number(m[2]) } : null;
}
