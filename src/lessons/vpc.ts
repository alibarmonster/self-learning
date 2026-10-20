/**
 * VPC networks and firewall rules — the deep-dive lesson. Built around the
 * questions a network actually answers: where do addresses come from, how
 * does a packet pick its path, who is allowed in and out, and how do networks
 * connect. Two interactive blocks: a subnet calculator and firewall rule
 * exercises judged by the same rules Google applies.
 */
import type { Lesson } from '@/types';

const SVG = (label: string, w: number, h: number, body: string) =>
  `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}" style="font: 13px var(--font); letter-spacing: 0">
  <defs>
    <marker id="vpc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/>
    </marker>
  </defs>${body}
</svg>`;

const MINT = 'style="fill: var(--mint)" stroke="currentColor" stroke-width="1.5"';
const ON = 'style="fill: #1a1a1a"';
const BOX = 'fill="none" stroke="currentColor" stroke-width="1.5"';
const A = 'marker-end="url(#vpc-arrow)"';

const vm = (x: number, y: number, name: string, ip: string) =>
  `<rect x="${x}" y="${y}" width="118" height="48" rx="6" ${BOX}/><text x="${x + 59}" y="${y + 20}" text-anchor="middle" fill="currentColor" font-weight="600">${name}</text><text x="${x + 59}" y="${y + 38}" text-anchor="middle" fill="currentColor" opacity="0.7" style="font-size: 12px">${ip}</text>`;

const FIG_GLOBAL = SVG(
  'One global VPC with regional subnets: a subnet in us-central1 and one in asia-southeast2; VMs in both regions talk over internal IPs without a VPN',
  720,
  300,
  `
  <rect x="16" y="16" width="688" height="250" rx="10" ${BOX} stroke-dasharray="7 5"/>
  <rect x="36" y="52" width="310" height="196" rx="8" ${BOX} opacity="0.55"/>
  <rect x="374" y="52" width="310" height="196" rx="8" ${BOX} opacity="0.55"/>
  <rect x="52" y="92" width="278" height="140" rx="6" ${BOX}/>
  <rect x="390" y="92" width="278" height="140" rx="6" ${BOX}/>
  ${vm(68, 150, 'web-a', '10.10.0.2 · zone a')}
  ${vm(200, 150, 'web-b', '10.10.0.3 · zone b')}
  ${vm(470, 150, 'app-1', '10.20.0.2 · zone a')}
  <path d="M318,174 L468,174" fill="none" stroke="currentColor" stroke-width="1.5" ${A}/>
  <rect x="352" y="160" width="82" height="24" rx="12" ${MINT}/>
  <g fill="currentColor">
    <text x="32" y="38" font-weight="600">VPC prod-vpc — global</text>
    <text x="52" y="76" opacity="0.75">Region us-central1</text>
    <text x="390" y="76" opacity="0.75">Region asia-southeast2</text>
    <text x="66" y="116">subnet web-us · 10.10.0.0/24</text>
    <text x="404" y="116">subnet app-jkt · 10.20.0.0/24</text>
    <text x="393" y="176" text-anchor="middle" ${ON} style="fill:#1a1a1a; font-size: 12px">internal IP</text>
    <text x="360" y="290" text-anchor="middle" opacity="0.7">Firewall rules and routes apply to the whole VPC; a subnet belongs to one region; a VM to one zone.</text>
  </g>`
);

const FIG_CIDR = SVG(
  'The subnet 10.0.1.0/24 has 256 addresses: .0 is the network address, .1 the gateway, .254 reserved by Google, .255 broadcast, and 252 addresses are left for VMs',
  720,
  170,
  `
  <g ${BOX}>
    <rect x="40" y="56" width="40" height="44"/>
    <rect x="80" y="56" width="40" height="44"/>
    <rect x="600" y="56" width="40" height="44"/>
    <rect x="640" y="56" width="40" height="44"/>
  </g>
  <rect x="120" y="56" width="480" height="44" ${MINT}/>
  <g fill="currentColor" text-anchor="middle">
    <text x="360" y="36" font-weight="600">10.0.1.0/24 = 256 addresses · 4 reserved · 252 for VMs</text>
    <text x="60" y="83">.0</text><text x="100" y="83">.1</text><text x="620" y="83">.254</text><text x="660" y="83">.255</text>
    <text x="360" y="83" ${ON}>.2 … .253 — usable by VMs, internal load balancers and more</text>
    <g opacity="0.7" style="font-size: 12px">
      <text x="60" y="124">network</text>
      <text x="100" y="144">gateway</text>
      <text x="620" y="124">Google</text>
      <text x="660" y="144">broadcast</text>
    </g>
  </g>`
);

const FIG_ROUTE = SVG(
  'A VPC route table: subnet routes to other VMs, a route to a VPN tunnel, and the default route 0.0.0.0/0 to the default internet gateway; the most specific prefix wins',
  720,
  250,
  `
  <g ${BOX}>
    <rect x="16" y="100" width="124" height="50" rx="6"/>
    <rect x="180" y="34" width="254" height="190" rx="6"/>
    <rect x="476" y="32" width="228" height="46" rx="6"/>
    <rect x="476" y="102" width="228" height="46" rx="6"/>
    <rect x="476" y="172" width="228" height="46" rx="6"/>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M140,125 L178,125" ${A}/>
    <path d="M434,82 L474,58" ${A}/>
    <path d="M434,118 L474,62"/>
    <path d="M434,158 L474,126" ${A}/>
    <path d="M434,198 L474,195" ${A}/>
    <path d="M196,104 L418,104 M196,140 L418,140 M196,176 L418,176" opacity="0.25"/>
  </g>
  <g fill="currentColor">
    <text x="78" y="122" text-anchor="middle" font-weight="600">VM</text>
    <text x="78" y="139" text-anchor="middle" opacity="0.7" style="font-size: 12px">10.10.0.2</text>
    <text x="307" y="56" text-anchor="middle" font-weight="600">prod-vpc route table</text>
    <g class="mono" style="font-size: 12px; font-family: var(--font-mono)">
      <text x="196" y="88">10.10.0.0/24 → subnet</text>
      <text x="196" y="124">10.20.0.0/24 → subnet</text>
      <text x="196" y="162">192.168.0.0/16 → vpn-tunnel</text>
      <text x="196" y="198">0.0.0.0/0 → internet gateway</text>
    </g>
    <text x="590" y="60" text-anchor="middle">Other VMs in the VPC</text>
    <text x="590" y="130" text-anchor="middle">The office over Cloud VPN</text>
    <text x="590" y="192" text-anchor="middle">The internet</text>
    <text x="590" y="209" text-anchor="middle" opacity="0.7" style="font-size: 12px">only with an external IP or NAT</text>
  </g>`
);

const FIG_FW = SVG(
  'The VPC firewall is enforced at every VM: incoming traffic is checked against ingress rules, outgoing traffic against egress rules, and replies are allowed automatically because it is stateful',
  720,
  250,
  `
  <g ${BOX}>
    <rect x="16" y="88" width="140" height="56" rx="6"/>
    <rect x="564" y="88" width="140" height="56" rx="6"/>
    <rect x="278" y="62" width="164" height="108" rx="10" stroke-dasharray="6 4"/>
  </g>
  <rect x="300" y="88" width="120" height="56" rx="6" ${MINT}/>
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M156,104 L276,104" ${A}/>
    <path d="M276,128 L158,128" stroke-dasharray="4 4" ${A}/>
    <path d="M442,104 L562,104" ${A}/>
    <path d="M562,128 L444,128" stroke-dasharray="4 4" ${A}/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="86" y="121" font-weight="600">Internet client</text>
    <text x="634" y="121" font-weight="600">External API</text>
    <text x="360" y="113" ${ON} font-weight="600">VM web-1</text>
    <text x="360" y="131" ${ON} style="fill:#1a1a1a; font-size: 12px">tag: web</text>
    <text x="360" y="54" opacity="0.7" style="font-size: 12px">VPC firewall — at every VM</text>
    <text x="216" y="96" style="font-size: 12px">in: INGRESS rules</text>
    <text x="216" y="146" opacity="0.7" style="font-size: 12px">replies: automatic</text>
    <text x="502" y="96" style="font-size: 12px">out: EGRESS rules</text>
    <text x="502" y="146" opacity="0.7" style="font-size: 12px">replies: automatic</text>
  </g>
  <g ${BOX}><rect x="96" y="196" width="250" height="34" rx="17"/><rect x="374" y="196" width="250" height="34" rx="17"/></g>
  <g fill="currentColor" text-anchor="middle" style="font-size: 12px">
    <text x="221" y="218">implied: deny all ingress · 65535</text>
    <text x="499" y="218">implied: allow all egress · 65535</text>
  </g>`
);

const path4 = (y: number, via: string, to: string) => `
  <rect x="250" y="${y}" width="190" height="44" rx="6" ${MINT}/>
  <rect x="482" y="${y}" width="222" height="44" rx="6" ${BOX}/>
  <path d="M156,150 C200,150 200,${y + 22} 248,${y + 22}" fill="none" stroke="currentColor" stroke-width="1.5" ${A}/>
  <path d="M440,${y + 22} L480,${y + 22}" fill="none" stroke="currentColor" stroke-width="1.5" ${A}/>
  <text x="345" y="${y + 27}" text-anchor="middle" ${ON} style="fill:#1a1a1a; font-size: 12.5px">${via}</text>
  <text x="593" y="${y + 27}" text-anchor="middle" fill="currentColor" style="font-size: 12.5px">${to}</text>`;

const FIG_EGRESS = SVG(
  'Four ways out for a VM without an external IP: Cloud NAT to the internet, Private Google Access to Google APIs, a Private Service Connect endpoint, and private services access to Cloud SQL',
  720,
  290,
  `
  <rect x="16" y="120" width="140" height="60" rx="6" ${BOX}/>
  <text x="86" y="146" text-anchor="middle" fill="currentColor" font-weight="600">Private VM</text>
  <text x="86" y="164" text-anchor="middle" fill="currentColor" opacity="0.7" style="font-size: 12px">no external IP</text>
  ${path4(14, 'Cloud NAT', 'Internet: apt, third-party APIs')}
  ${path4(82, 'Private Google Access', 'Google APIs: Storage, BigQuery')}
  ${path4(150, 'PSC endpoint', 'Google APIs on an internal IP')}
  ${path4(218, 'Private services access', 'Cloud SQL, Memorystore')}`
);

const vpcBox = (x: number, name: string, cidr: string) =>
  `<rect x="${x}" y="70" width="160" height="70" rx="10" ${BOX}/><text x="${x + 80}" y="100" text-anchor="middle" fill="currentColor" font-weight="600">${name}</text><text x="${x + 80}" y="120" text-anchor="middle" fill="currentColor" opacity="0.7" style="font-size: 12px">${cidr}</text>`;

const FIG_PEERING = SVG(
  'Peering is not transitive: A is peered with B and B with C, but A cannot reach C through B',
  720,
  230,
  `
  ${vpcBox(40, 'VPC A', '10.1.0.0/16')}
  ${vpcBox(280, 'VPC B', '10.2.0.0/16')}
  ${vpcBox(520, 'VPC C', '10.3.0.0/16')}
  <g fill="none" stroke="currentColor" stroke-width="2">
    <path d="M200,105 L280,105"/>
    <path d="M440,105 L520,105"/>
    <path d="M120,140 C120,214 600,214 600,140" stroke-dasharray="6 5" opacity="0.7"/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="240" y="94" style="font-size: 12px">peering ✓</text>
    <text x="480" y="94" style="font-size: 12px">peering ✓</text>
    <text x="360" y="200" style="font-size: 12px">A ↔ C ✗ — not through B</text>
    <text x="360" y="36" opacity="0.7">Both sides must create the peering · ranges must not overlap</text>
  </g>`
);

const FIG_SHARED = SVG(
  'Shared VPC: the host project owns the VPC and subnets; VMs in service projects use those subnets; the network team manages networking and firewalls in the host project',
  720,
  260,
  `
  <rect x="16" y="28" width="320" height="206" rx="10" ${BOX}/>
  <rect x="36" y="78" width="280" height="54" rx="6" ${MINT}/>
  <rect x="36" y="150" width="280" height="54" rx="6" ${MINT}/>
  <rect x="396" y="28" width="308" height="94" rx="10" ${BOX}/>
  <rect x="396" y="140" width="308" height="94" rx="10" ${BOX}/>
  <rect x="416" y="62" width="130" height="44" rx="6" ${BOX}/>
  <rect x="560" y="62" width="130" height="44" rx="6" ${BOX}/>
  <rect x="416" y="174" width="130" height="44" rx="6" ${BOX}/>
  <g fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4">
    <path d="M416,84 L318,104" ${A}/>
    <path d="M560,84 C520,30 360,40 318,96" ${A}/>
    <path d="M416,196 L318,178" ${A}/>
  </g>
  <g fill="currentColor">
    <text x="32" y="52" font-weight="600">Host project · VPC shared-vpc</text>
    <text x="176" y="102" text-anchor="middle" ${ON} style="fill:#1a1a1a">subnet-prod · 10.10.0.0/20</text>
    <text x="176" y="120" text-anchor="middle" ${ON} style="fill:#1a1a1a; font-size: 12px">firewalls & routes live here</text>
    <text x="176" y="174" text-anchor="middle" ${ON} style="fill:#1a1a1a">subnet-dev · 10.20.0.0/20</text>
    <text x="410" y="50" font-weight="600">Service project shop-prod</text>
    <text x="410" y="162" font-weight="600">Service project shop-dev</text>
    <text x="481" y="89" text-anchor="middle">api VM</text>
    <text x="625" y="89" text-anchor="middle">GKE node</text>
    <text x="481" y="201" text-anchor="middle">test VM</text>
    <text x="176" y="226" text-anchor="middle" opacity="0.7" style="font-size: 12px">app teams need roles/compute.networkUser</text>
  </g>`
);

const FIG_HYBRID = SVG(
  'Hybrid: the office connects to the VPC through HA VPN with two tunnels or through Interconnect; Cloud Router exchanges routes over BGP',
  720,
  250,
  `
  <g ${BOX}>
    <rect x="16" y="66" width="150" height="110" rx="8"/>
    <rect x="296" y="138" width="160" height="56" rx="6"/>
    <rect x="496" y="92" width="110" height="60" rx="6"/>
    <rect x="636" y="66" width="68" height="110" rx="8"/>
  </g>
  <rect x="296" y="46" width="160" height="56" rx="6" ${MINT}/>
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M166,94 L294,66"/>
    <path d="M166,104 L294,84"/>
    <path d="M166,150 L294,166"/>
    <path d="M456,74 L494,112" ${A}/>
    <path d="M456,166 L494,134" ${A}/>
    <path d="M606,122 L634,122" ${A}/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="91" y="114" font-weight="600">Office / DC</text>
    <text x="91" y="132" opacity="0.7" style="font-size: 12px">BGP router</text>
    <text x="376" y="70" ${ON} font-weight="600">HA VPN</text>
    <text x="376" y="88" ${ON} style="fill:#1a1a1a; font-size: 12px">2 IPsec tunnels · 99.99%</text>
    <text x="376" y="162" font-weight="600">Interconnect</text>
    <text x="376" y="180" opacity="0.7" style="font-size: 12px">Dedicated / Partner</text>
    <text x="551" y="118" font-weight="600">Cloud</text>
    <text x="551" y="136" font-weight="600">Router</text>
    <text x="670" y="126" font-weight="600">VPC</text>
    <text x="230" y="64" opacity="0.7" style="font-size: 12px">internet, encrypted</text>
    <text x="230" y="184" opacity="0.7" style="font-size: 12px">private link</text>
    <text x="551" y="176" opacity="0.7" style="font-size: 12px">BGP</text>
    <text x="360" y="232" opacity="0.7">The dynamic routing mode decides whether office routes reach one region or every region.</text>
  </g>`
);

const SA_API = 'api-sa@ace-lab-123.iam.gserviceaccount.com';
const SA_BATCH = 'batch-sa@ace-lab-123.iam.gserviceaccount.com';

export const lesson: Lesson = {
  id: 'vpc',
  lang: 'en',
  title: 'VPC Networks and Firewall Rules',
  intro:
    'Google Cloud networking feels confusing because much of what is separate elsewhere is combined here — a global VPC, a firewall attached to every VM, routes that apply in every region. This lesson follows the questions a network answers: where IP addresses come from, which way a packet goes, who may come in and go out, and how networks connect to each other. There is a subnet calculator and firewall-reading exercises to try as you go.',
  practice: [
    { label: 'Topology: open a web server to the internet', href: '#/ace/lab/network/web-open', note: 'External IP, firewall, target tags' },
    { label: 'Topology: secure SSH through IAP', href: '#/ace/lab/network/iap-ssh', note: '35.235.240.0/20, no external IP' },
    { label: 'Topology: block one VM with priority', href: '#/ace/lab/network/deny-priority', note: 'Priority and deny vs allow' },
    { label: 'Topology: a private VM needs OS updates', href: '#/ace/lab/network/cloud-nat', note: 'Cloud NAT' },
    { label: 'Topology: peering is not transitive', href: '#/ace/lab/network/peering-transitive', note: 'A–B–C' },
    { label: 'Topology: hybrid office to two regions', href: '#/ace/lab/network/hybrid-vpn', note: 'HA VPN, global dynamic routing' },
    { label: 'Command quiz: VPCs, subnets and firewalls', href: '#/ace/lab/cmd/network', note: '16 questions on gcloud compute networks / firewall-rules' },
    { label: 'Canvas: fix a load balancer 502', href: '#/ace/lab/canvas/fix-lb-502', note: 'Health check firewall' }
  ],
  parts: [
    // ── 1 ─────────────────────────────────────────────────────────────────
    {
      id: 'map',
      title: 'The big picture',
      sections: [
        {
          id: 'what',
          title: 'A VPC: your own private network, at global scale',
          blocks: [
            {
              kind: 'p',
              text: 'A **Virtual Private Cloud (VPC)** is an isolated private network for your resources: VMs, GKE nodes, internal load balancers, Cloud SQL with a private IP. The biggest difference from other clouds: **a Google VPC is global**. One VPC can have a subnet in Jakarta and one in Iowa at the same time, and VMs in both talk over internal IPs with no VPN or peering.'
            },
            { kind: 'figure', svg: FIG_GLOBAL, caption: 'A global VPC, regional subnets, zonal VMs. Traffic between regions inside one VPC stays on Google\'s private network.' },
            {
              kind: 'table',
              caption: 'The scope of each network resource',
              columns: ['Resource', 'Scope', 'What it means'],
              rows: [
                ['VPC network', 'Global', 'One network for every region'],
                ['Route', 'Global (belongs to the VPC)', 'Applies to every VM in the VPC, can be narrowed with network tags'],
                ['Firewall rule', 'Global (belongs to the VPC)', 'Applied to the VMs it targets, in any region'],
                ['Subnet', 'Regional', 'One IP range in one region, spanning every zone of that region'],
                ['Cloud Router, Cloud NAT, regional external IPs', 'Regional', 'You need one per region'],
                ['VM, disk', 'Zonal', 'Lives in one zone']
              ]
            },
            {
              kind: 'callout',
              tone: 'analogy',
              text: 'A VPC is a housing estate owned by one developer with branches in several cities. Subnets are the blocks of houses in each city, the firewall is a guard at the door of every house (not at the estate gate), and routes are the street map handed to every resident.'
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"VMs in two regions must communicate privately with minimal setup" → put them in the same VPC (subnets in different regions). Peering or VPN is only needed when the networks are different.'
            }
          ]
        },
        {
          id: 'modes',
          title: 'Subnet modes: auto vs custom, and the default network',
          blocks: [
            {
              kind: 'table',
              columns: ['', 'Auto mode', 'Custom mode'],
              rows: [
                ['Subnets', 'Created automatically: one /20 in every region, from 10.128.0.0/9', 'You create them, in the regions you choose'],
                ['IP ranges', 'The same in every auto mode project', 'Your choice'],
                ['Risk', 'Clashes when peering or connecting auto mode projects over VPN', 'Needs planning'],
                ['Changes', 'Can be converted to custom (once, one way)', '—'],
                ['Good for', 'Experiments', 'Production']
              ]
            },
            {
              kind: 'p',
              text: 'A new project usually has a network called **default** — auto mode, plus four built-in firewall rules at priority 65534: `default-allow-internal` (all protocols from 10.128.0.0/9), `default-allow-ssh` (tcp:22 from anywhere), `default-allow-rdp` (tcp:3389 from anywhere) and `default-allow-icmp`. Handy for trying things, but SSH and RDP are open to the whole internet. Many organisations turn off creation of the default network with an org policy.'
            },
            {
              kind: 'code',
              title: 'A production network: custom mode, your own subnets',
              lines: [
                '$ gcloud compute networks create prod-vpc --subnet-mode=custom',
                '$ gcloud compute networks subnets create web-us --network=prod-vpc --region=us-central1 --range=10.10.0.0/24 --enable-private-ip-google-access',
                '$ gcloud compute networks subnets create app-jkt --network=prod-vpc --region=asia-southeast2 --range=10.20.0.0/24',
                '$ gcloud compute networks subnets list --network=prod-vpc',
                'NAME     REGION           NETWORK   RANGE         STACK_TYPE',
                'web-us   us-central1      prod-vpc  10.10.0.0/24  IPV4_ONLY',
                'app-jkt  asia-southeast2  prod-vpc  10.20.0.0/24  IPV4_ONLY'
              ]
            }
          ]
        }
      ]
    },

    // ── 2 ─────────────────────────────────────────────────────────────────
    {
      id: 'addresses',
      title: 'IP addresses',
      sections: [
        {
          id: 'cidr',
          title: 'Reading CIDR without a calculator',
          blocks: [
            {
              kind: 'p',
              text: 'IP ranges are written in **CIDR** notation: `10.0.1.0/24`. The number after the slash is how many leading bits are fixed; the rest are free. An IPv4 address has 32 bits, so `/24` leaves 8 bits = 2⁸ = **256 addresses**. Every step down doubles the size: `/23` = 512, `/22` = 1,024, `/20` = 4,096. Every step up halves it: `/25` = 128, `/28` = 16, `/29` = 8.'
            },
            { kind: 'figure', svg: FIG_CIDR, caption: 'Google reserves four addresses in every subnet: the first (network), the second (default gateway), the second-to-last (reserved by Google) and the last (broadcast). So a /24 gives 252 addresses for VMs, not 256.' },
            {
              kind: 'table',
              caption: 'Worth memorising a few',
              columns: ['Prefix', 'Total addresses', 'Usable in a GCP subnet', 'Typical use'],
              mono: [0],
              rows: [
                ['/29', '8', '4', 'The smallest subnet allowed'],
                ['/28', '16', '12', 'Private GKE control plane range'],
                ['/26', '64', '60', 'Minimum for Cloud Run Direct VPC egress'],
                ['/24', '256', '252', 'A small application subnet'],
                ['/20', '4,096', '4,092', 'An auto mode subnet per region'],
                ['/16', '65,536', '65,532', 'The range for one large environment'],
                ['/8', '16,777,216', '—', 'All of 10.0.0.0/8']
              ]
            },
            { kind: 'cidr', value: '10.10.0.0/24', note: 'Try: 10.10.0.0/20, 192.168.5.77/27, 172.16.0.0/29, or 10.0.0.0/30 (too small for a subnet).' }
          ]
        },
        {
          id: 'plan',
          title: 'Planning ranges you will not regret',
          blocks: [
            {
              kind: 'list',
              items: [
                'Use the **RFC 1918** private ranges: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.',
                'Subnet ranges **must not overlap** inside one VPC, nor with networks you peer with or connect over VPN — including the office network. Plan every environment up front.',
                'A subnet can be **expanded** with no downtime (`expand-ip-range`, a smaller prefix), but **never shrunk**. Start with what you need and leave room next to it to grow.',
                'A subnet can have **secondary ranges** (alias IPs) — GKE uses them for Pod and Service IPs.',
                'The minimum IPv4 subnet size is **/29**.'
              ]
            },
            {
              kind: 'code',
              title: 'A subnet is nearly full: expand it from /24 to /22',
              lines: [
                '$ gcloud compute networks subnets expand-ip-range web-us --region=us-central1 --prefix-length=22',
                'Updated [https://www.googleapis.com/compute/v1/projects/ace-lab-123/regions/us-central1/subnetworks/web-us].',
                '# 10.10.0.0/24 → 10.10.0.0/22: the new range still must not overlap any other subnet'
              ]
            }
          ]
        },
        {
          id: 'ips',
          title: 'Internal and external IPs',
          blocks: [
            {
              kind: 'table',
              columns: ['Kind', 'Comes from', 'Ephemeral', 'Static'],
              rows: [
                ['Internal IP', 'The subnet range', 'Picked automatically, can change when the VM is recreated', '`gcloud compute addresses create NAME --region=R --subnet=S --addresses=10.10.0.10`'],
                ['Regional external IP', 'Google\'s pool in that region', 'Changes when the VM is stopped and started', '`gcloud compute addresses create NAME --region=R` — for VMs and Network LBs'],
                ['Global external IP', 'Google anycast', '—', '`gcloud compute addresses create NAME --global` — for global Application LBs']
              ]
            },
            {
              kind: 'list',
              items: [
                'A VM\'s external IP is not visible inside the OS: the VM only knows its internal IP, and Google translates it (1:1 NAT) at the network edge.',
                'A reserved static IP that is not in use is still billed — release it if you do not need it.',
                'The recommended pattern: VMs **with no external IP**; out through Cloud NAT, in through a load balancer, admin access through IAP.'
              ]
            }
          ]
        }
      ]
    },

    // ── 3 ─────────────────────────────────────────────────────────────────
    {
      id: 'routing',
      title: 'Routing',
      sections: [
        {
          id: 'routes',
          title: 'How a packet picks its path',
          blocks: [
            {
              kind: 'p',
              text: 'Every VPC has a **route table** shared by all of its VMs. When a VM sends a packet, Google looks for routes whose destination covers the target address; if more than one matches, **the most specific prefix wins** (`/24` beats `/16`, which beats `/0`), and if they are equally specific, the lowest **priority** wins.'
            },
            { kind: 'figure', svg: FIG_ROUTE, caption: 'A packet to 10.20.0.5 matches a subnet route; to 192.168.3.4 the VPN route; to 8.8.8.8 only 0.0.0.0/0. The default route alone is not enough for the internet — the VM also needs an external IP or Cloud NAT.' },
            {
              kind: 'table',
              columns: ['Route type', 'Created by', 'Notes'],
              rows: [
                ['Subnet route', 'Automatically, one per subnet range', 'Cannot be deleted while the subnet exists; connects every subnet to every other'],
                ['Default route 0.0.0.0/0 → default internet gateway', 'Automatically when the VPC is created', 'Can be deleted to cut internet access entirely (then PGA needs a route to the Google VIPs)'],
                ['Static route', 'You', 'Next hop: a VM (e.g. a firewall appliance), an IP, a VPN tunnel, an internal LB; can be limited by network tag'],
                ['Dynamic route', 'Cloud Router over BGP', 'Learned from VPN or Interconnect; changes automatically when the office network changes'],
                ['Peering route', 'VPC peering', 'The neighbouring network\'s subnet routes']
              ]
            }
          ]
        },
        {
          id: 'dynamic',
          title: 'Dynamic routes: Cloud Router, BGP and the dynamic routing mode',
          blocks: [
            {
              kind: 'p',
              text: '**Cloud Router** is a managed service that speaks **BGP** with the router in your office or data centre. It advertises the VPC subnet ranges there and learns the office ranges from there, so you do not have to type a static route for every new network. Cloud Router is regional.'
            },
            {
              kind: 'table',
              columns: ['Dynamic routing mode', 'Office routes reach…', 'When to choose it'],
              rows: [
                ['`regional` (default)', 'Only subnets in the Cloud Router\'s region', 'Every workload that needs the office is in one region'],
                ['`global`', 'Every subnet in every region of the VPC', 'One hybrid connection serves several regions']
              ]
            },
            { kind: 'code', lines: ['$ gcloud compute networks update prod-vpc --bgp-routing-mode=global', '$ gcloud compute routers create hub-router --network=prod-vpc --region=us-central1 --asn=65010'] },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"On-premises can reach VMs in us-central1 over VPN but not VMs in europe-west1 in the same VPC" → change the VPC dynamic routing mode to global.'
            }
          ]
        }
      ]
    },

    // ── 4 ─────────────────────────────────────────────────────────────────
    {
      id: 'firewall',
      title: 'Firewall',
      sections: [
        {
          id: 'how',
          title: 'How the VPC firewall works',
          blocks: [
            {
              kind: 'p',
              text: 'The VPC firewall is not a box at the edge of the network. It is **distributed**: its rules are enforced at every VM, so even two VMs on the same subnet are checked against each other. And it is **stateful**: if an outgoing connection is allowed, its replies may come back in automatically (and the other way round), with no separate rule.'
            },
            { kind: 'figure', svg: FIG_FW, caption: 'Every VPC always has two implied rules at the lowest priority that cannot be deleted: deny all ingress, allow all egress. All of your rules sit above them.' },
            {
              kind: 'list',
              items: [
                '**Ingress** = traffic into a VM; matched on its **source**. **Egress** = traffic out of a VM; matched on its **destination**.',
                'With no rules at all, a VM cannot be reached from anywhere, but can go out freely.',
                'Some traffic is always allowed whatever the rules (DHCP, DNS and the metadata server at 169.254.169.254), and some is always blocked (for example egress tcp:25 outside Google).'
              ]
            }
          ]
        },
        {
          id: 'anatomy',
          title: 'Anatomy of a firewall rule',
          blocks: [
            {
              kind: 'table',
              columns: ['Part', 'Value', 'Notes'],
              rows: [
                ['Network', 'One VPC', 'A rule belongs to one network'],
                ['Direction', '`INGRESS` or `EGRESS`', 'INGRESS by default'],
                ['Priority', '0–65535, default 1000', '**Lower number = evaluated first**'],
                ['Action', '`allow` or `deny`', 'Through `--allow`, or `--action` + `--rules`'],
                ['Target', 'All instances, **target tags**, or a **target service account**', 'Which VMs the rule applies to'],
                ['Source (ingress)', 'IP ranges, source tags, source service accounts', 'Ranges and tags are combined with OR'],
                ['Destination (egress)', 'IP ranges', '—'],
                ['Protocols & ports', '`tcp:80`, `tcp:8000-8100`, `udp:53`, `icmp`, `all`', 'One rule can list several'],
                ['Logging', 'On/off', 'Firewall Rules Logging to Cloud Logging']
              ]
            },
            {
              kind: 'code',
              title: 'Three rules you will almost always have',
              lines: [
                '# public web, only to VMs tagged web',
                '$ gcloud compute firewall-rules create allow-http --network=prod-vpc --allow=tcp:80,tcp:443 --source-ranges=0.0.0.0/0 --target-tags=web',
                '# SSH only through IAP',
                '$ gcloud compute firewall-rules create allow-iap-ssh --network=prod-vpc --allow=tcp:22 --source-ranges=35.235.240.0/20',
                '# web may reach the database, nothing else',
                '$ gcloud compute firewall-rules create allow-web-to-db --network=prod-vpc --allow=tcp:5432 --source-tags=web --target-tags=db'
              ]
            },
            {
              kind: 'callout',
              tone: 'tip',
              text: 'If an ingress rule has neither `--source-ranges` nor `--source-tags`, the source is taken to be `0.0.0.0/0` — the whole internet. Always write the source on purpose.'
            }
          ]
        },
        {
          id: 'order',
          title: 'Evaluation order: who wins',
          blocks: [
            {
              kind: 'steps',
              items: [
                { title: 'Keep the relevant ones', text: 'Take the rules with the same direction, a target that covers the VM, a matching source/destination, and covered ports. Ignore the rest.' },
                { title: 'Take the lowest priority', text: 'Of those that match, the lowest priority number wins. A rule at priority 900 beats one at 1000, whatever its action.' },
                { title: 'A tie? Deny wins', text: 'When a deny and an allow match at the same priority, the **deny** applies.' },
                { title: 'Nothing matches? Implied rules', text: 'Ingress is denied, egress is allowed.' }
              ]
            },
            {
              kind: 'firewall',
              title: 'Exercise 1 — guess: allowed or denied?',
              vms: [
                { name: 'web-1', ip: '10.10.0.2', tags: ['web'], sa: SA_API },
                { name: 'db-1', ip: '10.10.1.5', tags: ['db'], sa: SA_BATCH }
              ],
              rules: [
                { name: 'deny-bad-ip', direction: 'INGRESS', priority: 900, action: 'deny', ports: 'all', sources: ['198.51.100.0/24'] },
                { name: 'allow-http', direction: 'INGRESS', priority: 1000, action: 'allow', ports: 'tcp:80,tcp:443', sources: ['0.0.0.0/0'], targetTags: ['web'] },
                { name: 'allow-iap-ssh', direction: 'INGRESS', priority: 1000, action: 'allow', ports: 'tcp:22', sources: ['35.235.240.0/20'] },
                { name: 'allow-web-to-db', direction: 'INGRESS', priority: 1000, action: 'allow', ports: 'tcp:5432', sourceTags: ['web'], targetTags: ['db'] }
              ],
              packets: [
                { direction: 'INGRESS', peer: '203.0.113.7', vm: 'web-1', proto: 'tcp', port: 443, expect: 'allow' },
                { direction: 'INGRESS', peer: '198.51.100.20', vm: 'web-1', proto: 'tcp', port: 80, expect: 'deny' },
                { direction: 'INGRESS', peer: '203.0.113.7', vm: 'db-1', proto: 'tcp', port: 5432, expect: 'deny' },
                { direction: 'INGRESS', peer: 'web-1', vm: 'db-1', proto: 'tcp', port: 5432, expect: 'allow' },
                { direction: 'INGRESS', peer: '35.235.240.9', vm: 'db-1', proto: 'tcp', port: 22, expect: 'allow' },
                { direction: 'INGRESS', peer: '203.0.113.7', vm: 'db-1', proto: 'tcp', port: 22, expect: 'deny' },
                { direction: 'EGRESS', peer: '8.8.8.8', vm: 'web-1', proto: 'udp', port: 53, expect: 'allow' }
              ],
              after: 'Look at the second row: allow-http matches, but deny-bad-ip at priority 900 comes first. And the last row: there are no egress rules at all, so the implied allow egress applies.'
            }
          ]
        },
        {
          id: 'targets',
          title: 'Targets: network tag or service account?',
          blocks: [
            {
              kind: 'table',
              columns: ['', 'Network tag', 'Service account', 'Secure tag (Resource Manager tag)'],
              rows: [
                ['Used in', 'VPC firewall rules', 'VPC firewall rules', 'Network firewall policies'],
                ['Who can change it', 'Anyone allowed to edit the VM (`compute.instances.setTags`)', 'Needs `iam.serviceAccountUser` on the SA, and the VM must be stopped', 'Controlled by IAM per tag'],
                ['Strength of control', 'Weak — a free-form label', 'Strong — tied to an identity', 'Strong and central'],
                ['Good for', 'Labs, small teams', 'Production, separation of duties', 'Large organisations']
              ]
            },
            {
              kind: 'list',
              items: [
                'One rule **cannot mix** tags and service accounts (for example a target tag with a source service account).',
                'Source tags and source service accounts only match traffic from **the internal IPs of VMs in the same VPC** — not across peering and not from external IPs.'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Ensure only the security team can control which VMs a firewall rule applies to" → a target service account (or secure tags), not a network tag that any VM owner can change.'
            }
          ]
        },
        {
          id: 'ranges',
          title: 'Special ranges to memorise',
          blocks: [
            {
              kind: 'table',
              columns: ['Range', 'Who', 'Rule needed'],
              mono: [0],
              rows: [
                ['35.235.240.0/20', 'Identity-Aware Proxy (TCP forwarding)', 'Ingress tcp:22 (SSH) / tcp:3389 (RDP) to VMs without an external IP'],
                ['130.211.0.0/22 and 35.191.0.0/16', 'Google load balancer health checks and proxies', 'Ingress to the backend port; without it backends are UNHEALTHY → 502'],
                ['199.36.153.8/30', 'private.googleapis.com', 'Egress tcp:443 when internet egress is closed but Google APIs must still work'],
                ['199.36.153.4/30', 'restricted.googleapis.com', 'The same, for APIs supported by VPC Service Controls'],
                ['169.254.169.254', 'Metadata server', 'Always allowed — no rule needed']
              ]
            }
          ]
        },
        {
          id: 'policies',
          title: 'Hierarchical firewall policies: rules from above',
          blocks: [
            {
              kind: 'p',
              text: 'In a large organisation the security team wants rules project teams cannot step around — for example "never open RDP to the internet" or "always allow the security scanner". For that there are **hierarchical firewall policies** at organisation and folder level, and **network firewall policies** at VPC level. Their actions are `allow`, `deny`, or **`goto_next`** (hand the decision to the level below).'
            },
            {
              kind: 'steps',
              items: [
                { title: 'Organisation policy', text: 'Evaluated first. A deny here cannot be opened by any project.' },
                { title: 'Folder policy', text: 'For connections the organisation passed on with goto_next.' },
                { title: 'VPC rules and network firewall policies', text: 'The project\'s ordinary firewall rules, plus network policies (which can use secure tags and FQDNs).' },
                { title: 'Implied rules', text: 'Deny ingress, allow egress.' }
              ]
            },
            {
              kind: 'firewall',
              title: 'Exercise 2 — the same-priority trap',
              vms: [
                { name: 'api-1', ip: '10.30.0.4', tags: ['api'], sa: SA_API },
                { name: 'batch-1', ip: '10.30.0.9', tags: ['api'], sa: SA_BATCH }
              ],
              rules: [
                { name: 'allow-lb-hc', direction: 'INGRESS', priority: 1000, action: 'allow', ports: 'tcp:8080', sources: ['130.211.0.0/22', '35.191.0.0/16'], targetSa: SA_API },
                { name: 'deny-8080', direction: 'INGRESS', priority: 1000, action: 'deny', ports: 'tcp:8080', sources: ['0.0.0.0/0'], targetTags: ['api'] },
                { name: 'allow-internal', direction: 'INGRESS', priority: 2000, action: 'allow', ports: 'all', sources: ['10.30.0.0/16'] },
                { name: 'allow-egress-google', direction: 'EGRESS', priority: 1000, action: 'allow', ports: 'tcp:443', destinations: ['199.36.153.8/30'] },
                { name: 'deny-egress-all', direction: 'EGRESS', priority: 65000, action: 'deny', ports: 'all', destinations: ['0.0.0.0/0'] }
              ],
              packets: [
                { direction: 'INGRESS', peer: '35.191.4.10', vm: 'api-1', proto: 'tcp', port: 8080, expect: 'deny' },
                { direction: 'INGRESS', peer: 'batch-1', vm: 'api-1', proto: 'tcp', port: 8080, expect: 'deny' },
                { direction: 'INGRESS', peer: 'batch-1', vm: 'api-1', proto: 'tcp', port: 22, expect: 'allow' },
                { direction: 'INGRESS', peer: '35.191.4.10', vm: 'batch-1', proto: 'tcp', port: 8080, expect: 'deny' },
                { direction: 'EGRESS', peer: '199.36.153.9', vm: 'api-1', proto: 'tcp', port: 443, expect: 'allow' },
                { direction: 'EGRESS', peer: '93.184.216.34', vm: 'api-1', proto: 'tcp', port: 443, expect: 'deny' }
              ],
              after:
                'The first row is the trap: allow-lb-hc and deny-8080 are both at priority 1000, so the deny wins and the health check fails. The fix: give allow-lb-hc a lower number, for example 900. The egress pattern in the last two rows — close everything at 65000, open what you need above it — is the standard way to lock down egress.'
            }
          ]
        }
      ]
    },

    // ── 5 ─────────────────────────────────────────────────────────────────
    {
      id: 'egress',
      title: 'Leaving the VPC',
      sections: [
        {
          id: 'paths',
          title: 'Four ways out for a private VM',
          blocks: [
            { kind: 'figure', svg: FIG_EGRESS, caption: 'A VM with no external IP can still do its job — as long as you pick the way out that suits the destination.' },
            {
              kind: 'table',
              columns: ['Destination', 'Use', 'Set up in', 'Notes'],
              rows: [
                ['The internet (OS updates, third-party APIs)', '**Cloud NAT**', 'A Cloud Router per region per VPC', 'Outbound only; never accepts incoming connections'],
                ['Public Google APIs (Storage, BigQuery, Pub/Sub)', '**Private Google Access**', 'Per subnet', 'No NAT and no external IP; still needs a route to the default internet gateway (or to the private/restricted VIPs)'],
                ['Google APIs on an internal address you choose', 'A **Private Service Connect** endpoint', 'Per VPC', 'Good for on-premises reaching Google APIs over VPN/Interconnect'],
                ['Managed services with private IPs (Cloud SQL, Memorystore)', '**Private services access**', 'An allocated range + servicenetworking peering', 'Once per VPC']
              ]
            },
            {
              kind: 'code',
              title: 'Opening two ways out for private VMs in us-central1',
              lines: [
                '# out to the internet',
                '$ gcloud compute routers create nat-router --network=prod-vpc --region=us-central1',
                '$ gcloud compute routers nats create prod-nat --router=nat-router --region=us-central1 --auto-allocate-nat-external-ips --nat-all-subnet-ip-ranges',
                '# Google APIs without the internet',
                '$ gcloud compute networks subnets update web-us --region=us-central1 --enable-private-ip-google-access'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"VMs without external IPs must download OS patches" → Cloud NAT. "VMs without external IPs must access Cloud Storage / BigQuery" → Private Google Access. Do not mix them up: PGA does not open the internet, and NAT is not needed for Google APIs when PGA is on.'
            }
          ]
        }
      ]
    },

    // ── 6 ─────────────────────────────────────────────────────────────────
    {
      id: 'connect',
      title: 'Connecting networks',
      sections: [
        {
          id: 'peering',
          title: 'VPC Network Peering',
          blocks: [
            {
              kind: 'p',
              text: '**Peering** connects two VPCs (in the same or different projects or organisations) so their VMs talk over internal IPs with the latency and cost of a single network. Each VPC is still managed on its own: firewalls, routes and admins stay separate.'
            },
            { kind: 'figure', svg: FIG_PEERING, caption: 'The three peering rules tested most: created from both sides, ranges must not overlap, and not transitive.' },
            {
              kind: 'list',
              items: [
                'A peering only becomes `ACTIVE` once **both** sides create it (`gcloud compute networks peerings create` in each VPC).',
                'The subnet ranges of the two VPCs **must not overlap** — the main reason not to use auto mode.',
                '**Not transitive**: A–B and B–C does not let A reach C. For hub-and-spoke, use direct peerings, VPN, or Network Connectivity Center.',
                'Firewall rules are not shared: each VPC must allow its neighbour\'s ranges itself. Source tags and service accounts do not work across peering — use IP ranges.'
              ]
            }
          ]
        },
        {
          id: 'shared',
          title: 'Shared VPC',
          blocks: [
            {
              kind: 'p',
              text: '**Shared VPC** lets one **host project** own the VPC, subnets and firewalls, while many **service projects** put their VMs and clusters in those subnets. The result: the network team runs the network in one place, and app teams run their apps in their own projects (with separate billing and IAM).'
            },
            { kind: 'figure', svg: FIG_SHARED, caption: 'The resources live in the service projects, but their NICs sit in the host project\'s subnets.' },
            {
              kind: 'table',
              columns: ['Role', 'IAM role', 'Granted on'],
              rows: [
                ['Turn on Shared VPC, attach service projects', '`roles/compute.xpnAdmin` (Shared VPC Admin)', 'The organisation or a folder'],
                ['App teams creating VMs in shared subnets', '`roles/compute.networkUser`', 'The host project, or per subnet (narrower)'],
                ['The network team managing subnets, routes, firewalls', '`roles/compute.networkAdmin` / `securityAdmin`', 'The host project']
              ]
            },
            {
              kind: 'table',
              caption: 'Peering or Shared VPC?',
              columns: ['Situation', 'Choose'],
              rows: [
                ['One organisation that wants the network run centrally by one team', 'Shared VPC'],
                ['Two different organisations, or two teams that want separate network admins', 'Peering'],
                ['Connecting to a service producer\'s network (Cloud SQL, a SaaS partner)', 'Peering / private services access / PSC']
              ]
            }
          ]
        },
        {
          id: 'hybrid',
          title: 'Hybrid: Cloud VPN and Cloud Interconnect',
          blocks: [
            { kind: 'figure', svg: FIG_HYBRID, caption: 'Both use Cloud Router and BGP; they differ in the physical path, the capacity and the cost.' },
            {
              kind: 'table',
              columns: ['', 'HA VPN', 'Dedicated Interconnect', 'Partner Interconnect'],
              rows: [
                ['Path', 'The public internet, encrypted with IPsec', 'A direct physical connection in a colocation facility', 'Through a service provider'],
                ['Capacity', 'About 3 Gbps per tunnel; add tunnels', '10 or 100 Gbps circuits', '50 Mbps to 50 Gbps'],
                ['SLA', '99.99% with 2 interfaces and 2 tunnels', 'Up to 99.99% with the recommended topology', 'Up to 99.99%'],
                ['Encryption', 'Always', 'Not by default (MACsec or HA VPN over Interconnect are options)', 'Not by default'],
                ['Good for', 'Fast, cheap, moderate traffic', 'Heavy traffic, stable latency, near a Google colocation', 'Not near a colocation, or a small capacity']
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Encrypted connection quickly and at low cost" → HA VPN. "10 Gbps or more, private, low latency" → Dedicated Interconnect. "Not near a colocation facility" or "less than 10 Gbps" → Partner Interconnect. Classic VPN with static routing is the old answer.'
            }
          ]
        }
      ]
    },

    // ── 7 ─────────────────────────────────────────────────────────────────
    {
      id: 'ops',
      title: 'Access and observability',
      sections: [
        {
          id: 'access',
          title: 'Getting into a VM safely',
          blocks: [
            {
              kind: 'steps',
              items: [
                { title: 'No external IP on the VM', text: 'The attack surface from the internet is gone.' },
                { title: 'Firewall from the IAP range only', text: 'Ingress tcp:22 (and tcp:3389 for Windows) from 35.235.240.0/20.', code: ['gcloud compute firewall-rules create allow-iap-ssh --network=prod-vpc --allow=tcp:22 --source-ranges=35.235.240.0/20'] },
                { title: 'Permission through IAM', text: 'Users need `roles/iap.tunnelResourceAccessor`; with **OS Login**, SSH access is also controlled by `roles/compute.osLogin` or `osAdminLogin` — not by keys in metadata.' },
                { title: 'Connect', text: 'gcloud opens a tunnel through IAP.', code: ['gcloud compute ssh db-1 --zone=us-central1-a --tunnel-through-iap'] }
              ]
            },
            {
              kind: 'callout',
              tone: 'tip',
              text: 'A bastion host (a jump VM with a public IP) still shows up in older questions. IAP TCP forwarding achieves the same with no VM to patch and no SSH port open to the internet.'
            }
          ]
        },
        {
          id: 'tools',
          title: 'Network troubleshooting tools',
          blocks: [
            {
              kind: 'table',
              columns: ['Tool', 'Answers', 'Notes'],
              rows: [
                ['**Connectivity Tests** (Network Intelligence Center)', '"Can A reach B, and if not, where does it stop?"', 'Analyses configuration: routes, firewalls, NAT; names the rule that blocks'],
                ['**Firewall Rules Logging**', '"Which rule allowed/denied this connection?"', 'Turned on per rule; goes to Cloud Logging'],
                ['**Firewall Insights**', '"Which rules are never hit, or shadowed by others?"', 'Finds shadowed and overly permissive rules'],
                ['**VPC Flow Logs**', '"Who talks to whom, and how much?"', 'Per subnet, sampled; for traffic analysis and forensics'],
                ['**Packet Mirroring**', '"What is inside the packets?"', 'Copies traffic to an analysis appliance']
              ]
            },
            {
              kind: 'code',
              title: 'Commands you will use often',
              lines: [
                '$ gcloud compute firewall-rules list --filter="network:prod-vpc" --sort-by=priority',
                'NAME             NETWORK   DIRECTION  PRIORITY  ALLOW           DENY  DISABLED',
                'deny-bad-ip      prod-vpc  INGRESS    900                       all   False',
                'allow-http       prod-vpc  INGRESS    1000      tcp:80,tcp:443        False',
                'allow-iap-ssh    prod-vpc  INGRESS    1000      tcp:22                False',
                '$ gcloud compute firewall-rules update allow-http --enable-logging',
                '$ gcloud network-management connectivity-tests create web-to-db --source-instance=projects/ace-lab-123/zones/us-central1-a/instances/web-1 --destination-instance=projects/ace-lab-123/zones/us-central1-a/instances/db-1 --protocol=TCP --destination-port=5432',
                '$ gcloud compute networks subnets update web-us --region=us-central1 --enable-flow-logs'
              ]
            }
          ]
        }
      ]
    },

    // ── 8 ─────────────────────────────────────────────────────────────────
    {
      id: 'scenarios',
      title: 'Troubleshooting scenarios',
      sections: [
        {
          id: 'sc-ssh',
          title: 'Scenario 1 — SSH fails to a VM with no external IP',
          blocks: [
            {
              kind: 'case',
              title: 'The admin cannot get into db-1',
              situation: 'The VM db-1 was deliberately created with no external IP in prod-vpc (custom mode, no SSH rule). The admin runs gcloud compute ssh and it fails.',
              symptom: ['$ gcloud compute ssh db-1 --zone=us-central1-a', 'External IP address was not found; defaulting to using IAP tunneling.', 'ERROR: (gcloud.compute.start-iap-tunnel) Error while connecting [4003: \'failed to connect to backend\'].'],
              diagnose: [
                'gcloud switches to IAP automatically because the VM has no external IP — good.',
                'Error 4003 = IAP cannot reach port 22 on the VM: there is no ingress firewall rule from 35.235.240.0/20.',
                'If the error is 4033, the problem is IAM: the user does not have `roles/iap.tunnelResourceAccessor`.'
              ],
              fix: ['$ gcloud compute firewall-rules create allow-iap-ssh --network=prod-vpc --allow=tcp:22 --source-ranges=35.235.240.0/20 --target-tags=db', '$ gcloud compute ssh db-1 --zone=us-central1-a --tunnel-through-iap'],
              why: 'IAP comes from a fixed Google range. Opening tcp:22 to that range only gives SSH access without opening the port to the internet.',
              exam: '"Connect to VMs that have no external IP without a bastion host" → IAP TCP forwarding + a firewall rule for 35.235.240.0/20.'
            }
          ]
        },
        {
          id: 'sc-web',
          title: 'Scenario 2 — The web server will not open',
          blocks: [
            {
              kind: 'case',
              title: 'The rule exists, but the browser still times out',
              situation: 'The VM web-2 has an external IP and nginx runs on port 80. There is an allow-http rule (tcp:80, 0.0.0.0/0, target tag web). The browser still times out.',
              symptom: ['$ gcloud compute instances describe web-2 --zone=us-central1-a --format="value(tags.items)"', 'http-server'],
              diagnose: [
                'allow-http only applies to VMs tagged `web`, but this VM is tagged `http-server` (the tag the Console\'s "Allow HTTP traffic" checkbox sets on the default network).',
                'No other rule matches → implied deny ingress.',
                'A Connectivity Test from 0.0.0.0/0 to web-2:80 would say "dropped by implied rule".'
              ],
              fix: ['$ gcloud compute instances add-tags web-2 --zone=us-central1-a --tags=web', '# or change the rule\'s target to match the tag in use'],
              why: 'Firewall rules are matched per VM through their target. A rule that "looks right" has no effect if its target does not cover that VM.',
              exam: 'Questions that say "rule exists but traffic is still blocked" are often about a target tag that does not match, or about priority.'
            }
          ]
        },
        {
          id: 'sc-isolate',
          title: 'Scenario 3 — Isolating one suspicious VM',
          blocks: [
            {
              kind: 'case',
              title: 'Cut all traffic to app-7 without affecting anything else',
              situation: 'The VM app-7 shows signs of malware. The team wants to cut all its traffic in and out for forensics, without deleting it and without changing the rules other VMs use.',
              diagnose: [
                'You need a **deny** rule that only hits app-7, at a **lower** priority number than every existing allow (for example 100).',
                'Target it with a dedicated service account or a unique tag (`quarantine`) — not all instances.',
                'Ingress and egress are separate rules; you need both. Still allow IAP if the team needs to get in (at an even lower number).'
              ],
              fix: [
                '$ gcloud compute instances add-tags app-7 --zone=us-central1-a --tags=quarantine',
                '$ gcloud compute firewall-rules create q-allow-iap --network=prod-vpc --priority=50 --allow=tcp:22 --source-ranges=35.235.240.0/20 --target-tags=quarantine',
                '$ gcloud compute firewall-rules create q-deny-in --network=prod-vpc --priority=100 --action=DENY --rules=all --source-ranges=0.0.0.0/0 --target-tags=quarantine',
                '$ gcloud compute firewall-rules create q-deny-out --network=prod-vpc --priority=100 --direction=EGRESS --action=DENY --rules=all --destination-ranges=0.0.0.0/0 --target-tags=quarantine'
              ],
              why: 'A low priority number makes the deny evaluated before any allow; the target tag limits it to one VM. Remember that a tag can be removed by anyone allowed to edit the VM — for a quarantine nobody may lift casually, use a target service account or a secure tag.',
              exam: '"Block traffic to one VM while keeping other rules" → a deny rule with a higher priority (lower number) and a specific target.'
            }
          ]
        },
        {
          id: 'sc-private',
          title: 'Scenario 4 — A private VM cannot update or read a bucket',
          blocks: [
            {
              kind: 'case',
              title: 'Two symptoms, two cures',
              situation: 'The VM batch-1 has no external IP and sits in the batch subnet (us-central1). `apt-get update` times out, and so does `gcloud storage ls gs://ace-data-123`.',
              symptom: ['$ sudo apt-get update', "Err:1 https://deb.debian.org/debian bookworm InRelease  Could not connect to deb.debian.org:443 (151.101.2.132). - connect (110: Connection timed out)", '$ gcloud storage ls gs://ace-data-123', 'ERROR: … Max retries exceeded … Connection timed out'],
              diagnose: [
                'With no external IP the VM has no way to the internet: it needs **Cloud NAT** in us-central1.',
                'Cloud Storage does not need the internet: turn on **Private Google Access** on that subnet.',
                'Still timing out after PGA is on? Check whether the default route 0.0.0.0/0 was deleted — PGA to Google\'s public VIPs still needs that route (or a dedicated route to 199.36.153.8/30).',
                'If the timeout turns into a 403, the network is fixed; now it is IAM or the VM\'s access scopes.'
              ],
              fix: [
                '$ gcloud compute routers create nat-router --network=prod-vpc --region=us-central1',
                '$ gcloud compute routers nats create batch-nat --router=nat-router --region=us-central1 --auto-allocate-nat-external-ips --nat-all-subnet-ip-ranges',
                '$ gcloud compute networks subnets update batch --region=us-central1 --enable-private-ip-google-access'
              ],
              why: 'NAT and PGA solve different problems: NAT for internet destinations, PGA for Google APIs. Many designs use both.',
              exam: 'The option "assign external IPs to the VMs" is almost always wrong when the question stresses security.'
            }
          ]
        },
        {
          id: 'sc-peering',
          title: 'Scenario 5 — A peering that does not reach',
          blocks: [
            {
              kind: 'case',
              title: 'A reaches B, B reaches C, A cannot reach C',
              situation: 'The team peered vpc-a ↔ vpc-shared and vpc-shared ↔ vpc-c, hoping vpc-shared would act as a hub. VMs in vpc-a cannot reach VMs in vpc-c.',
              symptom: ['$ gcloud compute networks peerings list', 'NAME          NETWORK     PEER_NETWORK  STATE   STATE_DETAILS', 'a-to-shared   vpc-a       vpc-shared    ACTIVE  [2026-10-18]: Connected.', 'shared-to-c   vpc-shared  vpc-c         ACTIVE  [2026-10-18]: Connected.'],
              diagnose: ['Peering **is not transitive**: vpc-c\'s routes are not passed to vpc-a through vpc-shared.', 'If a new peering fails straight away with an overlapping-range message, check both VPCs\' subnets — they must not overlap.'],
              fix: [
                '# A direct A ↔ C peering (created on both sides)',
                '$ gcloud compute networks peerings create a-to-c --network=vpc-a --peer-network=vpc-c',
                '$ gcloud compute networks peerings create c-to-a --network=vpc-c --peer-network=vpc-a',
                '# For many spokes: consider Shared VPC, HA VPN between VPCs, or Network Connectivity Center'
              ],
              why: 'Each peering only exchanges the routes of its two VPCs. A hub-and-spoke network needs a mechanism that actually forwards routes.',
              exam: 'A question about "three VPCs peered in a chain" always tests non-transitivity.'
            }
          ]
        },
        {
          id: 'sc-ip',
          title: 'Scenario 6 — The subnet runs out of IPs',
          blocks: [
            {
              kind: 'case',
              title: 'The MIG cannot add VMs',
              situation: 'The autoscaler wants to add VMs, but the operation fails. The app-us subnet is a /26.',
              symptom: ["ERROR: (gcloud.compute.instances.create) Could not fetch resource:", " - IP space of 'projects/ace-lab-123/regions/us-central1/subnetworks/app-us' is exhausted."],
              diagnose: ['/26 = 64 addresses, 60 usable. All are taken.', 'Check that the range next to it is free (not used by another subnet, a peering, or the office network) so it can grow.'],
              fix: ['$ gcloud compute networks subnets expand-ip-range app-us --region=us-central1 --prefix-length=24'],
              why: 'Expanding a subnet does not disturb existing VMs and needs no downtime. The opposite — shrinking — is impossible, so plan room to grow from the start.',
              exam: '"Subnet needs more IP addresses without downtime" → `expand-ip-range`.'
            }
          ]
        },
        {
          id: 'sc-shared',
          title: 'Scenario 7 — Cannot create a VM in a Shared VPC subnet',
          blocks: [
            {
              kind: 'case',
              title: 'A developer in a service project is refused',
              situation: 'A developer has roles/compute.instanceAdmin in the service project shop-dev, but creating a VM in subnet-dev, which belongs to the host project, is refused.',
              symptom: ["ERROR: (gcloud.compute.instances.create) Could not fetch resource:", " - Required 'compute.subnetworks.use' permission for 'projects/net-host/regions/us-central1/subnetworks/subnet-dev'"],
              diagnose: ['Creating the VM is allowed in the service project, but **using the subnet** is a permission in the host project.', 'The `compute.subnetworks.use` permission is in `roles/compute.networkUser`.'],
              fix: ['$ gcloud compute networks subnets add-iam-policy-binding subnet-dev --region=us-central1 --project=net-host \\', '    --member=user:dev@example.com --role=roles/compute.networkUser'],
              why: 'Shared VPC deliberately splits permissions: the network belongs to the host, the workloads to the service projects. Granting networkUser per subnet is the least-privilege version.',
              exam: '"Users in a service project cannot create VMs in the shared subnet" → `roles/compute.networkUser`.'
            }
          ]
        },
        {
          id: 'sc-hybrid',
          title: 'Scenario 8 — The office can only reach one region',
          blocks: [
            {
              kind: 'case',
              title: 'The VPN is up, but the second region is unreachable',
              situation: 'HA VPN and Cloud Router are in us-central1. Office servers can reach VMs in us-central1, but not VMs in europe-west1 in the same VPC.',
              symptom: ['$ gcloud compute networks describe prod-vpc --format="value(routingConfig.routingMode)"', 'REGIONAL'],
              diagnose: [
                'With **regional** dynamic routing, Cloud Router only advertises subnets in its own region to the office, and office routes are only installed in that region.',
                'The tunnels and BGP are healthy — this is about route scope, not connectivity.'
              ],
              fix: ['$ gcloud compute networks update prod-vpc --bgp-routing-mode=global'],
              why: 'Global mode lets one Cloud Router serve every region of the VPC. The alternative is a VPN and Cloud Router in every region.',
              exam: 'The phrase "routes learned via VPN only in one region" → global dynamic routing mode.'
            }
          ]
        },
        {
          id: 'sc-shadow',
          title: 'Scenario 9 — A new rule has no effect',
          blocks: [
            {
              kind: 'case',
              title: 'The allow is there, but the connection is still refused',
              situation: 'The team created allow-metrics (tcp:9100 from 10.0.0.0/8, priority 1000) so Prometheus can scrape the VMs. Connections are still refused.',
              symptom: [
                '$ gcloud compute firewall-rules list --filter="network:prod-vpc" --sort-by=priority',
                'NAME           DIRECTION  PRIORITY  ALLOW     DENY  DISABLED',
                'deny-internal  INGRESS    500                 all   False',
                'allow-metrics  INGRESS    1000      tcp:9100        False'
              ],
              diagnose: ['deny-internal (priority 500) covers the same traffic and is evaluated first → allow-metrics is never hit (shadowed).', 'Firewall Insights flags rules like this; Firewall Rules Logging on deny-internal shows the connections being denied there.'],
              fix: ['$ gcloud compute firewall-rules update allow-metrics --priority=400'],
              why: 'In the VPC firewall there is no "the more specific rule wins" — only priority decides (then deny on a tie). That is different from routes.',
              exam: 'The classic trap: thinking a rule with more specific ports will win.'
            }
          ]
        }
      ]
    },

    // ── 9 ─────────────────────────────────────────────────────────────────
    {
      id: 'check',
      title: 'Check yourself',
      sections: [
        {
          id: 'quiz',
          title: 'Twelve quick questions',
          blocks: [
            { kind: 'quiz', q: 'How many addresses can VMs use in the subnet `10.1.0.0/24`?', options: ['256', '254', '252', '250'], answer: 2, explain: 'Google reserves 4 addresses in every subnet (network, gateway, Google reserved, broadcast): 256 − 4 = 252.' },
            { kind: 'quiz', q: 'What is the scope of a VPC network and of a subnet in Google Cloud?', options: ['VPC regional, subnet zonal', 'VPC global, subnet regional', 'VPC global, subnet global', 'VPC zonal, subnet zonal'], answer: 1, explain: 'The VPC is global; a subnet belongs to one region and spans all of its zones.' },
            { kind: 'quiz', q: 'An allow rule and a deny rule both match a connection, both at priority 1000. The result?', options: ['Allowed', 'Denied', 'The rule created last wins', 'The rule with more specific ports wins'], answer: 1, explain: 'At the same priority, deny wins.' },
            { kind: 'quiz', q: 'The safest way to give admins SSH to VMs with no external IP?', options: ['Open tcp:22 from 0.0.0.0/0', 'A bastion host with a public IP', 'IAP TCP forwarding with a firewall rule for 35.235.240.0/20', 'Give the VM a temporary external IP'], answer: 2, explain: 'IAP needs no public IP or bastion; access is controlled by IAM and port 22 is only open to the IAP range.' },
            { kind: 'quiz', q: 'VMs with no external IP must download OS patches from the internet. What do you use?', options: ['Private Google Access', 'Cloud NAT', 'VPC peering', 'Private services access'], answer: 1, explain: 'Cloud NAT gives outbound internet access. PGA is only for Google APIs.' },
            { kind: 'quiz', q: 'VMs with no external IP must read a Cloud Storage bucket without internet access. What do you use?', options: ['Cloud NAT', 'Private Google Access on the subnet', 'A static external IP', 'Cloud VPN'], answer: 1, explain: 'Private Google Access is turned on per subnet and opens a path to Google APIs without the internet.' },
            { kind: 'quiz', q: 'VPC A is peered with B, and B with C. Can VMs in A reach VMs in C?', options: ['Yes, through B', 'Yes, if custom routes are exported', 'No — peering is not transitive', 'Yes, if all three are auto mode'], answer: 2, explain: 'Peering is not transitive; A needs a direct peering to C or another mechanism.' },
            { kind: 'quiz', q: 'One organisation wants a network team to run subnets and firewalls centrally for dozens of application projects. The best choice?', options: ['VPC peering between every pair of projects', 'Shared VPC', 'Cloud VPN between projects', 'Auto mode in every project'], answer: 1, explain: 'Shared VPC: the host project owns the network, service projects use it.' },
            { kind: 'quiz', q: 'Every load balancer backend is UNHEALTHY although the app is running. Which firewall rule is missing?', options: ['Ingress from 35.235.240.0/20', 'Ingress from 130.211.0.0/22 and 35.191.0.0/16 to the backend port', 'Egress to 0.0.0.0/0', 'Ingress from 199.36.153.8/30'], answer: 1, explain: 'Load balancer health checks and proxies come from 130.211.0.0/22 and 35.191.0.0/16.' },
            { kind: 'quiz', q: 'Only the security team may decide which VMs a firewall rule applies to. The right target?', options: ['A network tag', 'All instances', 'A target service account', 'A source IP range'], answer: 2, explain: 'Changing a VM\'s service account needs IAM permission and a stopped VM; a network tag can be changed by anyone who may edit the VM.' },
            { kind: 'quiz', q: 'Over VPN, the office can only reach subnets in the Cloud Router\'s region. What do you change?', options: ['Add external IPs to the VMs', 'Change the VPC dynamic routing mode to global', 'Create a peering', 'Switch to Classic VPN'], answer: 1, explain: 'Global mode spreads dynamic routes to every region of the VPC.' },
            { kind: 'quiz', q: 'A /24 subnet is nearly full and there must be no downtime. The step?', options: ['Recreate the subnet as a /22', 'gcloud compute networks subnets expand-ip-range … --prefix-length=22', 'Add a secondary range and move the VMs', 'Switch the VPC to auto mode'], answer: 1, explain: 'A subnet can be expanded in place with no downtime (but never shrunk).' }
          ]
        }
      ]
    }
  ]
};
