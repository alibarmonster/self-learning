/**
 * The Cloud Load Balancing product line as Google names it today, with the
 * names it replaced, and the four questions that pick one. Behind the load
 * balancer lesson's picker; the lesson check walks every path of the tree.
 * Ranges are from the "Firewall rules" and "Health checks overview" pages
 * (both last updated 2026-10-13).
 */

export type LbFamily = 'application' | 'proxy' | 'passthrough';

export interface LbProduct {
  id: string;
  /** The name Google uses now. */
  name: string;
  family: LbFamily;
  /** What it was called before the 2023 rename, if it existed then. */
  previously?: string;
  scheme: string;
  scope: string;
  tier: string;
  protocols: string;
  /** What the backend sees as the source of a request. */
  clientIp: string;
  /** Sources the backends' firewall must allow. */
  firewall: string[];
  proxyOnlySubnet?: string;
  backends: string;
  extras?: string;
  useFor: string;
  /** Reached through the picker; classic modes are only named in the table. */
  inPicker: boolean;
  preview?: boolean;
}

const GFE = ['130.211.0.0/22 and 35.191.0.0/16 (Google Front End proxies; health checks come from 35.191.0.0/16)'];
const ENVOY = (purpose: string) => [`The proxy-only subnet range (${purpose}) — that is where the Envoy proxies connect from`, '35.191.0.0/16 for health checks'];

export const LB_PRODUCTS: LbProduct[] = [
  {
    id: 'gx-alb',
    name: 'Global external Application Load Balancer',
    family: 'application',
    previously: 'Global external HTTP(S) load balancer',
    scheme: 'EXTERNAL_MANAGED',
    scope: 'Global — one anycast IP, backends in any region',
    tier: 'Premium only',
    protocols: 'HTTP, HTTPS, HTTP/2, gRPC, WebSockets',
    clientIp: 'The proxy — the client IP arrives in the X-Forwarded-For header',
    firewall: GFE,
    backends: 'Managed instance groups, zonal NEGs (GKE), serverless NEGs (Cloud Run, Cloud Run functions, App Engine), internet and hybrid NEGs, Cloud Storage backend buckets',
    extras: 'Cloud CDN, Cloud Armor (edge and backend policies), IAP, Google-managed certificates, advanced traffic management',
    useFor: 'A public website or API with users in more than one region',
    inPicker: true
  },
  {
    id: 'classic-alb',
    name: 'Classic Application Load Balancer',
    family: 'application',
    previously: 'Global external HTTP(S) load balancer (classic)',
    scheme: 'EXTERNAL',
    scope: 'Global in Premium Tier, regional in Standard Tier',
    tier: 'Premium or Standard',
    protocols: 'HTTP, HTTPS, HTTP/2',
    clientIp: 'The proxy — the client IP arrives in the X-Forwarded-For header',
    firewall: GFE,
    backends: 'Instance groups, NEGs, backend buckets',
    extras: 'Cloud CDN, Cloud Armor; fewer traffic-management features — Google recommends migrating to the global external mode',
    useFor: 'Existing setups only',
    inPicker: false
  },
  {
    id: 'rx-alb',
    name: 'Regional external Application Load Balancer',
    family: 'application',
    previously: 'Regional external HTTP(S) load balancer',
    scheme: 'EXTERNAL_MANAGED',
    scope: 'Regional — one region',
    tier: 'Premium or Standard',
    protocols: 'HTTP, HTTPS, HTTP/2',
    clientIp: 'The proxy — the client IP arrives in the X-Forwarded-For header',
    firewall: ENVOY('REGIONAL_MANAGED_PROXY'),
    proxyOnlySubnet: 'Required in the region (purpose REGIONAL_MANAGED_PROXY)',
    backends: 'Managed instance groups, zonal and hybrid NEGs, serverless NEGs, internet NEGs, backend buckets',
    extras: 'Regional Cloud Armor policies, Certificate Manager certificates',
    useFor: 'A public HTTP service that must stay in one region (data residency), or a cheaper Standard Tier setup',
    inPicker: true
  },
  {
    id: 'ri-alb',
    name: 'Regional internal Application Load Balancer',
    family: 'application',
    previously: 'Internal HTTP(S) load balancer',
    scheme: 'INTERNAL_MANAGED',
    scope: 'Regional — an internal IP in one region (global access can open it to clients in other regions)',
    tier: 'Premium',
    protocols: 'HTTP, HTTPS, HTTP/2',
    clientIp: 'The proxy — the client IP arrives in the X-Forwarded-For header',
    firewall: ENVOY('REGIONAL_MANAGED_PROXY'),
    proxyOnlySubnet: 'Required in the region (purpose REGIONAL_MANAGED_PROXY)',
    backends: 'Instance groups, zonal and hybrid NEGs, serverless NEGs (Cloud Run), internet NEGs, backend buckets',
    extras: 'Host and path routing, header-based routing, traffic splitting between internal services',
    useFor: 'Internal HTTP microservices reached from the VPC or from on-premises',
    inPicker: true
  },
  {
    id: 'xi-alb',
    name: 'Cross-region internal Application Load Balancer',
    family: 'application',
    scheme: 'INTERNAL_MANAGED',
    scope: 'Cross-region — internal IPs in the regions you choose, backends in several regions',
    tier: 'Premium',
    protocols: 'HTTP, HTTPS, HTTP/2',
    clientIp: 'The proxy — the client IP arrives in the X-Forwarded-For header',
    firewall: ENVOY('GLOBAL_MANAGED_PROXY'),
    proxyOnlySubnet: 'Required in every region the load balancer uses (purpose GLOBAL_MANAGED_PROXY)',
    backends: 'Managed instance groups, zonal and hybrid NEGs, serverless NEGs (Cloud Run), backend buckets',
    extras: 'Failover to backends in another region when one region is unhealthy',
    useFor: 'An internal HTTP service that must survive the loss of a region',
    inPicker: true
  },
  {
    id: 'gx-pnlb',
    name: 'Global external proxy Network Load Balancer',
    family: 'proxy',
    previously: 'Global external TCP proxy load balancer / SSL proxy load balancer',
    scheme: 'EXTERNAL_MANAGED',
    scope: 'Global — one anycast IP',
    tier: 'Premium only',
    protocols: 'TCP, with optional SSL (TLS) offload',
    clientIp: 'The proxy — turn on the PROXY protocol to pass the client IP on',
    firewall: GFE,
    backends: 'Instance groups',
    extras: 'Cloud Armor backend policies, TLS termination with a target SSL proxy',
    useFor: 'A non-HTTP TCP service (for example MQTT, IMAPS, a game lobby) for users in several regions',
    inPicker: true
  },
  {
    id: 'classic-pnlb',
    name: 'Classic proxy Network Load Balancer',
    family: 'proxy',
    previously: 'TCP proxy load balancer (classic) / SSL proxy load balancer',
    scheme: 'EXTERNAL',
    scope: 'Global in Premium Tier, regional in Standard Tier',
    tier: 'Premium or Standard',
    protocols: 'TCP, with optional SSL offload',
    clientIp: 'The proxy — PROXY protocol to pass the client IP on',
    firewall: GFE,
    backends: 'Instance groups, zonal NEGs',
    useFor: 'Existing setups only',
    inPicker: false
  },
  {
    id: 'rx-pnlb',
    name: 'Regional external proxy Network Load Balancer',
    family: 'proxy',
    previously: 'Regional external TCP proxy load balancer',
    scheme: 'EXTERNAL_MANAGED',
    scope: 'Regional',
    tier: 'Premium or Standard',
    protocols: 'TCP',
    clientIp: 'The proxy — PROXY protocol to pass the client IP on',
    firewall: ENVOY('REGIONAL_MANAGED_PROXY'),
    proxyOnlySubnet: 'Required in the region (purpose REGIONAL_MANAGED_PROXY)',
    backends: 'Instance groups, zonal, hybrid and internet NEGs',
    useFor: 'A public TCP service kept in one region',
    inPicker: true
  },
  {
    id: 'ri-pnlb',
    name: 'Regional internal proxy Network Load Balancer',
    family: 'proxy',
    previously: 'Regional internal TCP proxy load balancer',
    scheme: 'INTERNAL_MANAGED',
    scope: 'Regional — an internal IP',
    tier: 'Premium',
    protocols: 'TCP (no SSL offload)',
    clientIp: 'The proxy — PROXY protocol to pass the client IP on',
    firewall: ENVOY('REGIONAL_MANAGED_PROXY'),
    proxyOnlySubnet: 'Required in the region (purpose REGIONAL_MANAGED_PROXY)',
    backends: 'Instance groups, zonal, hybrid and internet NEGs',
    useFor: 'An internal TCP service, for example in front of on-premises servers through hybrid NEGs',
    inPicker: true
  },
  {
    id: 'xi-pnlb',
    name: 'Cross-region internal proxy Network Load Balancer',
    family: 'proxy',
    scheme: 'INTERNAL_MANAGED',
    scope: 'Cross-region',
    tier: 'Premium',
    protocols: 'TCP (no SSL offload)',
    clientIp: 'The proxy — PROXY protocol to pass the client IP on',
    firewall: ENVOY('GLOBAL_MANAGED_PROXY'),
    proxyOnlySubnet: 'Required in every region it uses (purpose GLOBAL_MANAGED_PROXY)',
    backends: 'Instance groups, zonal and hybrid NEGs',
    useFor: 'An internal TCP service with backends in several regions and failover',
    inPicker: true
  },
  {
    id: 'rx-ptnlb',
    name: 'Regional external passthrough Network Load Balancer',
    family: 'passthrough',
    previously: 'External TCP/UDP Network Load Balancing',
    scheme: 'EXTERNAL',
    scope: 'Regional',
    tier: 'Premium or Standard',
    protocols: 'TCP, UDP, ESP, GRE, ICMP, ICMPv6',
    clientIp: 'The client itself — packets are not proxied, and replies go straight back to the client',
    firewall: ['The client ranges you serve (often 0.0.0.0/0)', '35.191.0.0/16, 209.85.152.0/22 and 209.85.204.0/22 for health checks'],
    backends: 'Instance groups or zonal NEGs through a backend service (recommended), or a legacy target pool',
    extras: 'Network edge Cloud Armor policies; session affinity on client IP',
    useFor: 'UDP (game servers, VoIP, DNS), protocols other than TCP, or backends that must see the client IP',
    inPicker: true
  },
  {
    id: 'gx-ptnlb',
    name: 'Global external passthrough Network Load Balancer',
    family: 'passthrough',
    scheme: 'EXTERNAL_PASSTHROUGH',
    scope: 'Global — anycast IPs, backends in several regions',
    tier: 'Premium',
    protocols: 'TCP, UDP, ESP, GRE, ICMP, ICMPv6',
    clientIp: 'The client itself',
    firewall: ['The client ranges you serve', '136.124.104.0/22 and 136.124.108.0/22 for health checks'],
    backends: 'Instance groups or zonal NEGs through a backend service',
    useFor: 'Passthrough traffic (for example UDP) for users in several regions',
    inPicker: true,
    preview: true
  },
  {
    id: 'i-ptnlb',
    name: 'Internal passthrough Network Load Balancer',
    family: 'passthrough',
    previously: 'Internal TCP/UDP Load Balancing',
    scheme: 'INTERNAL',
    scope: 'Always regional — an internal IP (global access can open it to clients in other regions)',
    tier: 'Premium',
    protocols: 'TCP, UDP, ICMP, ICMPv6, SCTP, ESP, AH, GRE',
    clientIp: 'The client itself',
    firewall: ['The internal ranges of the clients', '35.191.0.0/16 for health checks'],
    backends: 'Instance groups or zonal NEGs',
    extras: 'Can be the next hop of a custom static route — the classic way to put highly available firewall appliances in the path',
    useFor: 'An internal TCP/UDP service, or HA network appliances',
    inPicker: true
  }
];

export const LB_BY_ID: Record<string, LbProduct> = Object.fromEntries(LB_PRODUCTS.map((p) => [p.id, p]));

export interface LbChoice {
  value: string;
  label: string;
  hint: string;
}

export interface LbQuestion {
  key: 'traffic' | 'clients' | 'scope';
  q: string;
  choices: LbChoice[];
}

export type LbAnswers = Partial<Record<LbQuestion['key'], string>>;

const TRAFFIC: LbQuestion = {
  key: 'traffic',
  q: 'What must the load balancer understand?',
  choices: [
    { value: 'http', label: 'HTTP or HTTPS', hint: 'It should read URLs, hosts, headers or cookies' },
    { value: 'tcp', label: 'TCP, through a proxy', hint: 'A proxy may terminate the connection, optionally with TLS offload' },
    { value: 'pass', label: 'Packets, untouched', hint: 'UDP or other protocols, or the backends must see the client IP' }
  ]
};

const CLIENTS: LbQuestion = {
  key: 'clients',
  q: 'Where are the clients?',
  choices: [
    { value: 'external', label: 'On the internet', hint: 'Public users' },
    { value: 'internal', label: 'Inside the VPC', hint: 'Or connected to it through VPN, Interconnect or peering' }
  ]
};

const SCOPE: Record<'external' | 'internal', LbQuestion> = {
  external: {
    key: 'scope',
    q: 'How far does it reach?',
    choices: [
      { value: 'global', label: 'Several regions', hint: 'Users or backends around the world, one anycast IP' },
      { value: 'regional', label: 'One region', hint: 'Traffic must stay in a region, or you want Standard Tier' }
    ]
  },
  internal: {
    key: 'scope',
    q: 'How far does it reach?',
    choices: [
      { value: 'regional', label: 'One region', hint: 'Backends in one region' },
      { value: 'cross', label: 'Several regions', hint: 'Backends in several regions, with failover between them' }
    ]
  }
};

const LEAF: Record<string, string> = {
  'http/external/global': 'gx-alb',
  'http/external/regional': 'rx-alb',
  'http/internal/regional': 'ri-alb',
  'http/internal/cross': 'xi-alb',
  'tcp/external/global': 'gx-pnlb',
  'tcp/external/regional': 'rx-pnlb',
  'tcp/internal/regional': 'ri-pnlb',
  'tcp/internal/cross': 'xi-pnlb',
  'pass/external/global': 'gx-ptnlb',
  'pass/external/regional': 'rx-ptnlb',
  'pass/internal': 'i-ptnlb'
};

/** The questions to show for the answers so far — internal passthrough is always regional, so it skips the last one. */
export function lbQuestions(a: LbAnswers): LbQuestion[] {
  const qs = [TRAFFIC];
  if (!a.traffic) return qs;
  qs.push(CLIENTS);
  if (!a.clients) return qs;
  if (a.traffic === 'pass' && a.clients === 'internal') return qs;
  qs.push(SCOPE[a.clients as 'external' | 'internal']);
  return qs;
}

/** The product the answers lead to, once every question shown has an answer. */
export function lbPick(a: LbAnswers): LbProduct | null {
  const qs = lbQuestions(a);
  if (qs.some((q) => !a[q.key])) return null;
  const id = LEAF[qs.map((q) => a[q.key]).join('/')];
  return id ? LB_BY_ID[id] : null;
}

/** Every complete path through the questions, for the lesson check. */
export function lbPaths(): { answers: LbAnswers; product: LbProduct | null }[] {
  const out: { answers: LbAnswers; product: LbProduct | null }[] = [];
  const walk = (a: LbAnswers) => {
    const qs = lbQuestions(a);
    const next = qs.find((q) => !a[q.key]);
    if (!next) return out.push({ answers: a, product: lbPick(a) });
    for (const c of next.choices) walk({ ...a, [next.key]: c.value });
  };
  walk({});
  return out;
}
