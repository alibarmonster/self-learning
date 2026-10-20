/**
 * Cloud Load Balancing — the deep-dive lesson. Organised around the names:
 * Google renamed every load balancer in 2023, the exam and older material
 * still use the old names, and the product line has grown since. So the
 * lesson starts with how a name is built, maps old to new, picks one with
 * four questions (an interactive picker, backed by lessons/lb.ts), then goes
 * deep on each family, health checks and firewalls. Ranges and names checked
 * against the Cloud Load Balancing docs as of October 2026.
 */
import type { Lesson } from '@/types';

const SVG = (label: string, w: number, h: number, body: string) =>
  `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}" style="font: 13px var(--font); letter-spacing: 0">
  <defs>
    <marker id="lb-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/>
    </marker>
  </defs>${body}
</svg>`;

const MINT = 'style="fill: var(--mint)" stroke="currentColor" stroke-width="1.5"';
const ON = 'style="fill: #1a1a1a"';
const ON_SM = 'style="fill: #1a1a1a; font-size: 12px"';
const BOX = 'fill="none" stroke="currentColor" stroke-width="1.5"';
const LINE = 'fill="none" stroke="currentColor" stroke-width="1.5"';
const A = 'marker-end="url(#lb-arrow)"';
const SM = 'style="font-size: 12px"';

const link = (x: number, title: string, a: string, b: string, mint = false) => `
  <rect x="${x}" y="52" width="124" height="80" rx="6" ${mint ? MINT : BOX}/>
  <text x="${x + 62}" y="78" text-anchor="middle" ${mint ? ON : 'fill="currentColor"'} font-weight="600">${title}</text>
  <text x="${x + 62}" y="98" text-anchor="middle" ${mint ? ON_SM : `fill="currentColor" opacity="0.75" ${SM}`}>${a}</text>
  <text x="${x + 62}" y="116" text-anchor="middle" ${mint ? ON_SM : `fill="currentColor" opacity="0.75" ${SM}`}>${b}</text>`;

const FIG_CHAIN = SVG(
  'The parts of a proxy load balancer, left to right: forwarding rule, target proxy, URL map, backend service, backends',
  720,
  210,
  `
  <text x="360" y="28" text-anchor="middle" fill="currentColor" opacity="0.75">Clients connect to the forwarding rule; each part hands the request to the next</text>
  ${link(16, 'Forwarding rule', 'IP address', 'protocol · port')}
  ${link(158, 'Target proxy', 'terminates TLS', 'HTTP(S) or TCP')}
  ${link(300, 'URL map', 'host and path', 'routing rules')}
  ${link(442, 'Backend service', 'health check', 'CDN · Armor · IAP', true)}
  ${link(584, 'Backends', 'MIG · NEG', 'bucket')}
  <g ${LINE}>
    <path d="M140,92 L156,92" ${A}/><path d="M282,92 L298,92" ${A}/><path d="M424,92 L440,92" ${A}/><path d="M566,92 L582,92" ${A}/>
  </g>
  <g fill="currentColor" text-anchor="middle" ${SM} opacity="0.75">
    <text x="360" y="166">Only proxy load balancers have a target proxy, and only Application Load Balancers a URL map.</text>
    <text x="360" y="188">A passthrough load balancer goes straight from the forwarding rule to the backend service.</text>
  </g>`
);

const leaves = (x: number, items: string[]) =>
  items
    .map(
      (t, i) =>
        `<rect x="${x + 14}" y="${157 + i * 24}" width="8" height="8" fill="currentColor" opacity="0.6"/><text x="${x + 30}" y="${165 + i * 24}" fill="currentColor" style="font-size: 12.5px">${t}</text>`
    )
    .join('');

const FIG_FAMILIES = SVG(
  'Cloud Load Balancing has three families: Application Load Balancers (layer 7 proxy), proxy Network Load Balancers (layer 4 proxy) and passthrough Network Load Balancers (layer 4, no proxy), each with global, regional, internal and cross-region variants',
  720,
  290,
  `
  <rect x="260" y="14" width="200" height="36" rx="6" ${MINT}/>
  <text x="360" y="37" text-anchor="middle" ${ON} font-weight="600">Cloud Load Balancing</text>
  <g ${LINE}><path d="M360,50 L124,80"/><path d="M360,50 L360,80"/><path d="M360,50 L596,80"/></g>
  <g ${BOX}>
    <rect x="16" y="80" width="216" height="52" rx="6"/><rect x="252" y="80" width="216" height="52" rx="6"/><rect x="488" y="80" width="216" height="52" rx="6"/>
  </g>
  <g ${BOX} stroke-dasharray="5 4" opacity="0.6">
    <rect x="16" y="142" width="216" height="134" rx="6"/><rect x="252" y="142" width="216" height="134" rx="6"/><rect x="488" y="142" width="216" height="134" rx="6"/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="124" y="102" font-weight="600">Application LB</text>
    <text x="124" y="120" opacity="0.75" ${SM}>layer 7 · proxy · HTTP(S)</text>
    <text x="360" y="102" font-weight="600">Proxy Network LB</text>
    <text x="360" y="120" opacity="0.75" ${SM}>layer 4 · proxy · TCP</text>
    <text x="596" y="102" font-weight="600">Passthrough Network LB</text>
    <text x="596" y="120" opacity="0.75" ${SM}>layer 4 · no proxy · any IP</text>
  </g>
  ${leaves(16, ['Global external', 'Regional external', 'Regional internal', 'Cross-region internal', 'Classic (legacy)'])}
  ${leaves(252, ['Global external', 'Regional external', 'Regional internal', 'Cross-region internal', 'Classic (legacy)'])}
  ${leaves(488, ['Regional external', 'Global external (Preview)', 'Internal (always regional)'])}`
);

const FIG_PROXY_PASS = SVG(
  'Proxy versus passthrough: a proxy load balancer ends the client connection and opens a new one to the backend, so the backend sees the proxy; a passthrough load balancer forwards the same packets, the backend sees the client, and replies go straight back to the client',
  720,
  264,
  `
  <g fill="currentColor" font-weight="600"><text x="16" y="44">Proxy</text><text x="16" y="164">Passthrough</text></g>
  <g ${BOX}>
    <rect x="16" y="56" width="120" height="44" rx="6"/><rect x="584" y="56" width="120" height="44" rx="6"/>
    <rect x="16" y="176" width="120" height="44" rx="6"/><rect x="290" y="176" width="140" height="44" rx="6"/><rect x="584" y="176" width="120" height="44" rx="6"/>
  </g>
  <rect x="290" y="56" width="140" height="44" rx="6" ${MINT}/>
  <g ${LINE}>
    <path d="M136,70 L288,70" ${A}/><path d="M430,70 L582,70" ${A}/>
    <path d="M582,88 L432,88" stroke-dasharray="4 4" ${A}/><path d="M288,88 L138,88" stroke-dasharray="4 4" ${A}/>
    <path d="M136,190 L288,190" ${A}/><path d="M430,190 L582,190" ${A}/>
    <path d="M584,214 C450,246 230,246 138,216" stroke-dasharray="4 4" ${A}/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="76" y="83">Client</text><text x="644" y="83">Backend</text>
    <text x="360" y="76" ${ON} font-weight="600">Load balancer</text>
    <text x="360" y="92" ${ON_SM}>ends the connection</text>
    <text x="212" y="62" ${SM}>connection 1</text><text x="506" y="62" ${SM}>connection 2</text>
    <text x="360" y="124" opacity="0.75" ${SM}>The backend sees the proxy; the client IP travels in X-Forwarded-For or the PROXY protocol.</text>
    <text x="76" y="203">Client</text><text x="644" y="203">Backend</text>
    <text x="360" y="196" font-weight="600">Load balancer</text>
    <text x="360" y="212" opacity="0.75" ${SM}>forwards packets</text>
    <text x="212" y="182" ${SM}>packet</text><text x="506" y="182" ${SM}>client IP kept</text>
    <text x="360" y="258" opacity="0.75" ${SM}>The reply goes straight back to the client (direct server return).</text>
  </g>`
);

const FIG_URLMAP = SVG(
  'A URL map sends shop.example.com/api to a Cloud Run backend service, /static to a Cloud Storage backend bucket with Cloud CDN, and everything else to a managed instance group',
  720,
  230,
  `
  <rect x="16" y="90" width="110" height="50" rx="6" ${BOX}/>
  <rect x="166" y="62" width="170" height="106" rx="6" ${MINT}/>
  <g ${BOX}>
    <rect x="430" y="20" width="274" height="50" rx="6"/><rect x="430" y="90" width="274" height="50" rx="6"/><rect x="430" y="160" width="274" height="50" rx="6"/>
  </g>
  <g ${LINE}>
    <path d="M126,115 L164,115" ${A}/>
    <path d="M336,92 C380,88 390,46 428,45" ${A}/>
    <path d="M336,115 L428,115" ${A}/>
    <path d="M336,138 C380,142 390,184 428,185" ${A}/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="71" y="120">Client</text>
    <text x="251" y="96" ${ON} font-weight="600">URL map</text>
    <text x="251" y="116" ${ON_SM}>host: shop.example.com</text>
    <text x="251" y="134" ${ON_SM}>3 path rules</text>
    <text x="378" y="56" ${SM}>/api/*</text>
    <text x="382" y="108" ${SM}>/static/*</text>
    <text x="378" y="182" ${SM}>/*</text>
    <text x="567" y="42" font-weight="600">api-bs · serverless NEG</text>
    <text x="567" y="60" opacity="0.7" ${SM}>Cloud Run service api</text>
    <text x="567" y="112" font-weight="600">static · backend bucket</text>
    <text x="567" y="130" opacity="0.7" ${SM}>gs://shop-static · Cloud CDN</text>
    <text x="567" y="182" font-weight="600">web-bs · instance group</text>
    <text x="567" y="200" opacity="0.7" ${SM}>web-mig in two zones</text>
  </g>`
);

const FIG_PROXY_SUBNET = SVG(
  'Envoy-based regional load balancers run their proxies in a proxy-only subnet; backends see traffic coming from that subnet, so the firewall must allow it, plus 35.191.0.0/16 for health checks',
  720,
  250,
  `
  <rect x="16" y="16" width="688" height="220" rx="10" ${BOX} stroke-dasharray="7 5"/>
  <rect x="36" y="70" width="150" height="56" rx="6" ${BOX}/>
  <rect x="236" y="56" width="200" height="150" rx="6" ${MINT}/>
  <g fill="none" stroke="#1a1a1a" stroke-width="1.5">
    <rect x="256" y="110" width="160" height="24" rx="4"/><rect x="256" y="140" width="160" height="24" rx="4"/><rect x="256" y="170" width="160" height="24" rx="4"/>
  </g>
  <rect x="496" y="56" width="190" height="150" rx="6" ${BOX}/>
  <g ${BOX}><rect x="512" y="104" width="158" height="36" rx="5"/><rect x="512" y="152" width="158" height="36" rx="5"/></g>
  <g ${LINE}><path d="M186,98 L234,98" ${A}/><path d="M436,130 L494,130" ${A}/></g>
  <g fill="currentColor" text-anchor="middle">
    <text x="32" y="40" text-anchor="start" font-weight="600">VPC prod-vpc · region us-central1</text>
    <text x="111" y="94" font-weight="600">Forwarding rule</text>
    <text x="111" y="112" opacity="0.7" ${SM}>10.10.0.50:443</text>
    <text x="111" y="150" opacity="0.7" ${SM}>clients in the VPC</text>
    <text x="336" y="80" ${ON} font-weight="600">Proxy-only subnet</text>
    <text x="336" y="98" ${ON_SM}>10.129.0.0/23</text>
    <text x="336" y="126" ${ON_SM}>Envoy proxy</text><text x="336" y="156" ${ON_SM}>Envoy proxy</text><text x="336" y="186" ${ON_SM}>Envoy proxy</text>
    <text x="591" y="80" font-weight="600">subnet app</text>
    <text x="591" y="96" opacity="0.7" ${SM}>10.10.1.0/24</text>
    <text x="591" y="127">app-1</text><text x="591" y="175">app-2</text>
    <text x="360" y="226" opacity="0.75" ${SM}>Backends see traffic from 10.129.0.0/23 — allow it in the firewall, plus 35.191.0.0/16 for health checks.</text>
  </g>`
);

export const lesson: Lesson = {
  id: 'load-balancing',
  lang: 'en',
  title: 'Cloud Load Balancing: Today\'s Names and How to Choose',
  intro:
    'In 2023 Google renamed every load balancer: "HTTP(S) Load Balancing" became the Application Load Balancer, "TCP/SSL Proxy" became the proxy Network Load Balancer, and "Network Load Balancing" and "Internal TCP/UDP Load Balancing" became passthrough Network Load Balancers. The line has grown since, with cross-region internal and global passthrough load balancers. Older material and many exam questions still use the old names. This lesson shows how today\'s names are built, maps old to new, picks one with four questions (try the picker), then goes deep on each family, health checks, firewalls, and the problems people hit most.',
  practice: [
    { label: 'Command quiz: DNS, load balancing and Cloud Armor', href: '#/ace/lab/cmd/lb', note: '11 questions on backend services, URL maps, forwarding rules' },
    { label: 'Canvas: fix a load balancer 502', href: '#/ace/lab/canvas/fix-lb-502', note: 'Health check firewall' },
    { label: 'Topology: load balancer health checks', href: '#/ace/lab/network/lb-health', note: '35.191.0.0/16 and 130.211.0.0/22' },
    { label: 'Topology: a three-tier app', href: '#/ace/lab/network/three-tier', note: 'Public web tier, private app and database tiers' },
    { label: 'Canvas: a serverless online shop', href: '#/ace/lab/canvas/web-serverless', note: 'A load balancer in front of Cloud Run' }
  ],
  parts: [
    // ── 1 ─────────────────────────────────────────────────────────────────
    {
      id: 'basics',
      title: 'How load balancing works here',
      sections: [
        {
          id: 'what',
          title: 'No box to buy: load balancing as software',
          blocks: [
            {
              kind: 'p',
              text: 'A load balancer spreads client traffic across several backends, sends nothing to the ones that are unhealthy, and gives clients one stable address. On Google Cloud there is no appliance to size or patch: a load balancer is configuration, carried out by Google\'s own software at Google\'s scale. It scales from zero to millions of requests per second without warming up.'
            },
            {
              kind: 'table',
              caption: 'The engines underneath — useful for reading the docs',
              columns: ['Engine', 'Where', 'Used by'],
              rows: [
                ['**Google Front End (GFE)**', 'At Google\'s edge locations worldwide', 'Global external and classic load balancers; terminates connections close to the user'],
                ['**Envoy** (managed by Google)', 'In a region, in a proxy-only subnet', 'Regional and cross-region proxy load balancers'],
                ['**Maglev**', 'Google\'s edge network', 'External passthrough Network Load Balancers'],
                ['**Andromeda**', 'Google\'s virtual network stack, at every host', 'Internal passthrough Network Load Balancers']
              ]
            },
            {
              kind: 'list',
              items: [
                'A **global** external load balancer has one **anycast** IP: users everywhere connect to the same address, reach the nearest Google edge, and travel on Google\'s backbone from there.',
                'A **regional** load balancer has an IP in one region and backends in that region.',
                'An **internal** load balancer has a private IP inside your VPC; clients are VMs in the VPC or systems connected through VPN, Interconnect or peering.'
              ]
            },
            {
              kind: 'callout',
              tone: 'analogy',
              text: 'Think of a hotel reception. A proxy load balancer is a receptionist who takes your request and makes the call to the right department on your behalf — the department only hears the receptionist. A passthrough load balancer is a switchboard that connects your call straight through — the department hears you, and answers you directly.'
            }
          ]
        },
        {
          id: 'parts',
          title: 'The parts of a load balancer',
          blocks: [
            { kind: 'figure', svg: FIG_CHAIN, caption: 'In the Console you see one load balancer; in gcloud and Terraform you build it from these pieces. Knowing the chain is what lets you read an error message and know which piece it is about.' },
            {
              kind: 'terms',
              items: [
                {
                  term: 'Forwarding rule',
                  meaning: 'The front door: an IP address, a protocol and a port (or range). It points at a target proxy, or — for passthrough load balancers — straight at a backend service.',
                  example: '`web-fr` on `34.120.45.6:443`.'
                },
                {
                  term: 'Target proxy',
                  meaning: 'Ends the client connection. A target HTTPS proxy holds the TLS certificates; a target TCP or SSL proxy does the same for proxy Network Load Balancers.',
                  example: '`web-https` with the certificate `shop-cert`.'
                },
                {
                  term: 'URL map',
                  meaning: 'Application Load Balancers only: rules on host and path (and headers, for the newer modes) that choose a backend service or bucket. It can also redirect, rewrite and split traffic.',
                  example: '`/api/*` → `api-bs`, `/static/*` → a backend bucket, everything else → `web-bs`.'
                },
                {
                  term: 'Backend service',
                  meaning: 'Says how to spread traffic across its backends: balancing mode, capacity, session affinity, timeouts, the health check to use — and where Cloud CDN, Cloud Armor and IAP are switched on.',
                  example: '`web-bs` with the health check `web-hc` and Cloud Armor policy `edge-waf`.'
                },
                {
                  term: 'Backends',
                  meaning: 'Where the work happens: instance groups, network endpoint groups (NEGs) of several kinds, or — for Application Load Balancers — Cloud Storage backend buckets.',
                  example: 'A regional managed instance group, a serverless NEG for Cloud Run, a GKE zonal NEG.'
                },
                {
                  term: 'Health check',
                  meaning: 'Probes the backends on a protocol, port and path; only backends that pass get traffic. Separate from the autohealing health check of a managed instance group, which recreates VMs.',
                  example: 'HTTP `GET /healthz` on port 80 every 5 seconds.'
                }
              ]
            }
          ]
        }
      ]
    },

    // ── 2 ─────────────────────────────────────────────────────────────────
    {
      id: 'names',
      title: 'The names, then and now',
      sections: [
        {
          id: 'families',
          title: 'Three families, and how a name is built',
          blocks: [
            { kind: 'figure', svg: FIG_FAMILIES, caption: 'Every load balancer belongs to one of three families. Within a family, the variants differ in who the clients are (external or internal) and how far it reaches (global, regional, cross-region).' },
            {
              kind: 'p',
              text: 'Every current name is built from the same parts, in the same order: **scope** (global, regional, cross-region) · **who it serves** (external, internal) · **how it handles traffic** (proxy, passthrough — left out for Application Load Balancers, which are always proxies) · **what it balances** (Application = HTTP(S), Network = everything else). So "regional internal proxy Network Load Balancer" tells you, in order: one region, private IP, terminates TCP connections, not HTTP-aware.'
            },
            {
              kind: 'table',
              caption: 'Reading three real names',
              columns: ['Name', 'Scope', 'Clients', 'Proxy?', 'Layer'],
              rows: [
                ['Global external Application Load Balancer', 'Global', 'Internet', 'Yes (always for Application)', '7 — HTTP(S)'],
                ['Regional internal proxy Network Load Balancer', 'One region', 'VPC', 'Yes', '4 — TCP'],
                ['Internal passthrough Network Load Balancer', 'Always regional, so not in the name', 'VPC', 'No', '4 — TCP, UDP and more']
              ]
            }
          ]
        },
        {
          id: 'rename',
          title: 'Old name → today\'s name',
          blocks: [
            {
              kind: 'table',
              columns: ['Older name', 'Name today', 'Scheme'],
              rows: [
                ['Global external HTTP(S) load balancer', '**Global external Application Load Balancer**', '`EXTERNAL_MANAGED`'],
                ['Global external HTTP(S) load balancer (classic)', '**Classic Application Load Balancer**', '`EXTERNAL`'],
                ['Regional external HTTP(S) load balancer', '**Regional external Application Load Balancer**', '`EXTERNAL_MANAGED`'],
                ['Internal HTTP(S) load balancer', '**Regional internal Application Load Balancer**', '`INTERNAL_MANAGED`'],
                ['— (new)', '**Cross-region internal Application Load Balancer**', '`INTERNAL_MANAGED`'],
                ['TCP proxy / SSL proxy load balancer', '**Global external proxy Network Load Balancer** (or the **classic proxy Network Load Balancer** for the older setups)', '`EXTERNAL_MANAGED` / `EXTERNAL`'],
                ['Regional external TCP proxy load balancer', '**Regional external proxy Network Load Balancer**', '`EXTERNAL_MANAGED`'],
                ['Internal regional TCP proxy load balancer', '**Regional internal proxy Network Load Balancer**', '`INTERNAL_MANAGED`'],
                ['— (new)', '**Cross-region internal proxy Network Load Balancer**', '`INTERNAL_MANAGED`'],
                ['External TCP/UDP Network Load Balancing', '**Regional external passthrough Network Load Balancer**', '`EXTERNAL`'],
                ['— (new, Preview)', '**Global external passthrough Network Load Balancer**', '`EXTERNAL_PASSTHROUGH`'],
                ['Internal TCP/UDP Load Balancing', '**Internal passthrough Network Load Balancer**', '`INTERNAL`']
              ]
            },
            {
              kind: 'list',
              items: [
                'The **scheme** is what you set in gcloud with `--load-balancing-scheme`, and it is the most reliable way to tell the modes apart. `EXTERNAL_MANAGED` and `INTERNAL_MANAGED` are the Envoy-based ones.',
                'The **classic** modes still work but get fewer new features; Google recommends migrating classic Application Load Balancers to the global external mode.',
                'Kubernetes naming adds to the confusion: on GKE, a Service of `type: LoadBalancer` creates a **passthrough** Network Load Balancer (external, or internal with an annotation), while an Ingress or a Gateway creates an **Application** Load Balancer.'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: 'Questions written before 2023 say "HTTP(S) load balancer", "SSL proxy", "TCP proxy", "network load balancer" or "internal TCP/UDP load balancer". Translate them with this table, then answer. Questions written since use today\'s names — and the answer options may mix both.'
            }
          ]
        }
      ]
    },

    // ── 3 ─────────────────────────────────────────────────────────────────
    {
      id: 'choose',
      title: 'Choosing one',
      sections: [
        {
          id: 'questions',
          title: 'Four questions',
          blocks: [
            {
              kind: 'steps',
              items: [
                { title: 'What does it need to understand?', text: 'HTTP(S) — URLs, hosts, headers, cookies → an **Application** Load Balancer. TCP that a proxy may terminate → a **proxy** Network Load Balancer. UDP, other protocols, or backends that must see the client IP → a **passthrough** Network Load Balancer.' },
                { title: 'Where are the clients?', text: 'On the internet → **external**. In the VPC, or connected through VPN, Interconnect or peering → **internal**.' },
                { title: 'How far does it reach?', text: 'Users or backends in several regions → **global** (external) or **cross-region** (internal). One region — or traffic that must stay in a region — → **regional**.' },
                { title: 'Which network tier?', text: '**Premium Tier** (the default) carries traffic on Google\'s backbone and is required for global load balancers. **Standard Tier** is cheaper, uses the public internet more, and only works with regional external load balancers.' }
              ]
            },
            {
              kind: 'callout',
              tone: 'tip',
              text: 'Two shortcuts. If the question mentions **Cloud CDN**, it is a global external Application Load Balancer (or the classic one). If it mentions **UDP** or **preserving the client IP**, it is a passthrough Network Load Balancer.'
            }
          ]
        },
        {
          id: 'picker',
          title: 'Try it: pick a load balancer',
          blocks: [
            {
              kind: 'p',
              text: 'Answer the questions as if you were designing a real service. The result shows today\'s name, what it used to be called, and what the backends\' firewall must allow — the part people most often forget.'
            },
            { kind: 'lbpicker', title: 'Which load balancer?' }
          ]
        },
        {
          id: 'proxy-pass',
          title: 'Proxy or passthrough: what the backend sees',
          blocks: [
            { kind: 'figure', svg: FIG_PROXY_PASS, caption: 'This one difference decides firewall rules, client IP logging, protocol support and where TLS ends.' },
            {
              kind: 'table',
              columns: ['', 'Proxy (Application, proxy Network)', 'Passthrough Network'],
              rows: [
                ['Connections', 'Two: client ↔ load balancer, load balancer ↔ backend', 'One: client ↔ backend'],
                ['Source IP at the backend', 'The proxy (GFE ranges or the proxy-only subnet)', 'The client'],
                ['Getting the client IP', '`X-Forwarded-For` header (Application) or the PROXY protocol (proxy Network)', 'It is already the source address'],
                ['TLS', 'Can end at the load balancer (certificate on the target proxy)', 'Passes through; the backend handles TLS'],
                ['Protocols', 'HTTP(S) / TCP', 'TCP, UDP, ICMP, ESP, GRE and more'],
                ['Replies', 'Back through the load balancer', 'Straight from the backend to the client']
              ]
            }
          ]
        }
      ]
    },

    // ── 4 ─────────────────────────────────────────────────────────────────
    {
      id: 'alb',
      title: 'Application Load Balancers in depth',
      sections: [
        {
          id: 'urlmap',
          title: 'URL maps: one IP, many services',
          blocks: [
            { kind: 'figure', svg: FIG_URLMAP, caption: 'One address and one certificate in front of a Cloud Run API, a bucket of static files and a VM web tier.' },
            {
              kind: 'list',
              items: [
                'A **host rule** matches the `Host` header (`shop.example.com`, `api.example.com`) and hands the request to a **path matcher**.',
                'A **path matcher** has **path rules** (`/api/*`, `/static/*`) and a default service for everything else.',
                'The newer modes add **route rules**: matching on headers and query parameters, weighted traffic splitting, rewrites, redirects, retries and fault injection.',
                'A URL map can send nothing but redirects — the usual way to turn HTTP into HTTPS with a second forwarding rule on port 80.'
              ]
            }
          ]
        },
        {
          id: 'backends',
          title: 'What can sit behind it',
          blocks: [
            {
              kind: 'table',
              columns: ['Backend', 'What it is', 'Typical use'],
              rows: [
                ['**Managed instance group**', 'VMs from one template, autoscaled and autohealed', 'A VM web tier; zonal or regional MIG'],
                ['**Zonal NEG** (`GCE_VM_IP_PORT`)', 'IP:port endpoints, usually Pods', 'GKE container-native load balancing — traffic goes straight to Pods'],
                ['**Serverless NEG**', 'A Cloud Run service, Cloud Run function or App Engine app', 'A custom domain, Cloud Armor or CDN in front of serverless'],
                ['**Internet NEG**', 'An external hostname or IP', 'A backend outside Google Cloud, e.g. another CDN origin'],
                ['**Hybrid NEG** (`NON_GCP_PRIVATE_IP_PORT`)', 'Private IPs on-premises or in another cloud, over VPN/Interconnect', 'Gradual migration; one front door for both'],
                ['**Private Service Connect NEG**', 'A service published through PSC', 'Reaching a producer service or a Google API through the load balancer'],
                ['**Backend bucket**', 'A Cloud Storage bucket', 'Static files, often with Cloud CDN']
              ]
            }
          ]
        },
        {
          id: 'build',
          title: 'Building a global external Application Load Balancer',
          blocks: [
            {
              kind: 'code',
              title: 'From the backends out to the IP',
              lines: [
                '# 1 health check and backend service',
                '$ gcloud compute health-checks create http web-hc --port=80 --request-path=/healthz',
                '$ gcloud compute backend-services create web-bs --global --load-balancing-scheme=EXTERNAL_MANAGED --protocol=HTTP --port-name=http --health-checks=web-hc',
                '$ gcloud compute backend-services add-backend web-bs --global --instance-group=web-mig --instance-group-region=us-central1',
                '# 2 URL map (one service for now)',
                '$ gcloud compute url-maps create web-map --default-service=web-bs',
                '# 3 certificate and target proxy',
                '$ gcloud compute ssl-certificates create shop-cert --domains=shop.example.com --global',
                '$ gcloud compute target-https-proxies create web-https --url-map=web-map --ssl-certificates=shop-cert --global',
                '# 4 a static global IP and the forwarding rule',
                '$ gcloud compute addresses create web-ip --global',
                '$ gcloud compute forwarding-rules create web-fr --global --load-balancing-scheme=EXTERNAL_MANAGED --address=web-ip --target-https-proxy=web-https --ports=443',
                '# 5 let the Google Front Ends reach the backends',
                '$ gcloud compute firewall-rules create allow-lb --network=prod-vpc --allow=tcp:80 --source-ranges=130.211.0.0/22,35.191.0.0/16 --target-tags=web'
              ]
            },
            {
              kind: 'callout',
              tone: 'warn',
              text: 'Step 5 is the one that gets forgotten. Without it every backend is UNHEALTHY and users get a 502. Also make sure the instance group has a **named port** (`http:80`) matching `--port-name`.'
            }
          ]
        },
        {
          id: 'edge',
          title: 'TLS, Cloud CDN, Cloud Armor and IAP',
          blocks: [
            {
              kind: 'table',
              columns: ['Feature', 'Where it is set', 'What it gives you'],
              rows: [
                ['**Google-managed certificates**', 'Target HTTPS proxy (Compute Engine certificates or Certificate Manager)', 'Free certificates that renew themselves — once DNS points at the load balancer'],
                ['**Cloud CDN**', 'Backend service or backend bucket (`--enable-cdn`)', 'Caching at Google\'s edge; global external and classic Application LBs only'],
                ['**Cloud Armor**', 'A security policy on the backend service', 'WAF rules (SQL injection, XSS), allow/deny by IP or region, rate limiting, bot management'],
                ['**Identity-Aware Proxy**', 'Backend service (`--iap=enabled`)', 'Only signed-in users with `roles/iap.httpsResourceAccessor` reach the app'],
                ['**SSL policies**', 'Target HTTPS proxy', 'Minimum TLS version and allowed ciphers']
              ]
            },
            {
              kind: 'code',
              title: 'Switching them on',
              lines: [
                '$ gcloud compute backend-services update web-bs --global --enable-cdn',
                '$ gcloud compute security-policies create edge-waf --description="WAF for shop"',
                '$ gcloud compute security-policies rules create 1000 --security-policy=edge-waf --expression="evaluatePreconfiguredWaf(\'sqli-v33-stable\')" --action=deny-403',
                '$ gcloud compute backend-services update web-bs --global --security-policy=edge-waf',
                '$ gcloud compute backend-services update admin-bs --global --iap=enabled'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Protect against SQL injection / block traffic from certain countries / DDoS at the edge" → Cloud Armor on the backend service of an external Application Load Balancer. "Cache static content close to users" → Cloud CDN. "Only employees may open an internal web app, without a VPN" → IAP on the backend service.'
            }
          ]
        }
      ]
    },

    // ── 5 ─────────────────────────────────────────────────────────────────
    {
      id: 'nlb',
      title: 'Network Load Balancers in depth',
      sections: [
        {
          id: 'proxy-nlb',
          title: 'Proxy Network Load Balancers: TCP, ended at the proxy',
          blocks: [
            {
              kind: 'p',
              text: 'A **proxy Network Load Balancer** does for any TCP service what an Application Load Balancer does for HTTP: it ends the client connection close to the user (at Google\'s edge for the global one, in an Envoy proxy for the regional and internal ones) and opens a new one to a healthy backend. The external ones can also end **TLS** (with a target SSL proxy), so backends receive plain TCP.'
            },
            {
              kind: 'list',
              items: [
                'Use it for TCP services that are not HTTP: MQTT, IMAP/SMTP over TLS, database proxies, game lobbies.',
                'The backend sees the proxy as the source. Turn on the **PROXY protocol** (`--proxy-header=PROXY_V1` on the target proxy) if the backend must log the real client IP — and make sure the backend understands it.',
                'The global one carries traffic on Google\'s backbone from the nearest edge, which helps users far from the backends.'
              ]
            }
          ]
        },
        {
          id: 'passthrough',
          title: 'Passthrough Network Load Balancers: packets, untouched',
          blocks: [
            {
              kind: 'p',
              text: 'A **passthrough Network Load Balancer** does not end connections at all. It picks a backend for each flow and forwards the packets as they are, so the backend sees the client\'s own IP and replies straight to the client. That makes it the choice for **UDP** (game servers, VoIP, DNS), for protocols other than TCP, and whenever the backend must see the client IP at the network level.'
            },
            {
              kind: 'table',
              columns: ['', 'Regional external passthrough', 'Internal passthrough'],
              rows: [
                ['IP', 'A regional external IP', 'An internal IP in a subnet'],
                ['Backends', 'Instance groups or zonal NEGs through a backend service (recommended), or a legacy target pool', 'Instance groups or zonal NEGs through a backend service'],
                ['Health check ranges', '35.191.0.0/16, 209.85.152.0/22, 209.85.204.0/22', '35.191.0.0/16'],
                ['Special powers', 'Network edge Cloud Armor policies', 'Can be the **next hop of a route**; **global access** lets clients in every region (and on-premises) reach it']
              ]
            },
            {
              kind: 'code',
              title: 'An internal passthrough load balancer for a TCP service',
              lines: [
                '$ gcloud compute health-checks create tcp db-hc --port=5432 --region=us-central1',
                '$ gcloud compute backend-services create db-bs --load-balancing-scheme=INTERNAL --protocol=TCP --region=us-central1 --health-checks=db-hc --health-checks-region=us-central1',
                '$ gcloud compute backend-services add-backend db-bs --region=us-central1 --instance-group=db-mig --instance-group-region=us-central1',
                '$ gcloud compute forwarding-rules create db-fr --load-balancing-scheme=INTERNAL --region=us-central1 --network=prod-vpc --subnet=app-us --ip-protocol=TCP --ports=5432 --backend-service=db-bs --allow-global-access'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Highly available NAT/firewall appliances in the traffic path" → internal passthrough Network Load Balancer as the next hop of a custom static route. "UDP traffic from the internet" → regional external passthrough Network Load Balancer.'
            }
          ]
        }
      ]
    },

    // ── 6 ─────────────────────────────────────────────────────────────────
    {
      id: 'health',
      title: 'Health checks, firewalls and proxy-only subnets',
      sections: [
        {
          id: 'checks',
          title: 'Health checks',
          blocks: [
            {
              kind: 'table',
              columns: ['Setting', 'Default', 'Meaning'],
              rows: [
                ['Protocol, port, path', '—', 'What is probed: HTTP `/healthz` on 80, TCP on 5432, gRPC and so on'],
                ['Check interval', '5 s', 'How often each prober tries'],
                ['Timeout', '5 s', 'How long to wait for an answer'],
                ['Healthy threshold', '2', 'Successes in a row before a backend gets traffic again'],
                ['Unhealthy threshold', '2', 'Failures in a row before a backend stops getting traffic']
              ]
            },
            {
              kind: 'list',
              items: [
                'A load balancer health check only **stops sending traffic** to a failing backend. It does not repair it.',
                'A managed instance group\'s **autohealing** health check is separate: it **recreates** VMs that fail it. Give autohealing a longer initial delay and more patience than the load balancer, or VMs get recreated while they boot.',
                'Many probers check each backend, so a backend sees health check traffic far more often than the interval suggests.'
              ]
            }
          ]
        },
        {
          id: 'ranges',
          title: 'Which ranges the firewall must allow',
          blocks: [
            {
              kind: 'p',
              text: 'Backends live behind the implied deny-ingress rule like any other VM. Traffic from the load balancer — and its health checks — must be allowed on purpose, and the source depends on the family.'
            },
            {
              kind: 'table',
              columns: ['Load balancer', 'Allow from', 'Why'],
              rows: [
                ['Global external and classic Application LB, global external and classic proxy Network LB', '`130.211.0.0/22` and `35.191.0.0/16`', 'Google Front End proxies connect from both; health checks come from 35.191.0.0/16'],
                ['Regional external, regional internal and cross-region internal Application LB; regional and cross-region proxy Network LB', 'The **proxy-only subnet** range, plus `35.191.0.0/16`', 'Envoy proxies connect from the proxy-only subnet; health checks from Google\'s range'],
                ['Regional external passthrough Network LB', 'The client ranges, plus `35.191.0.0/16`, `209.85.152.0/22`, `209.85.204.0/22`', 'Clients connect directly; health checks from those ranges'],
                ['Global external passthrough Network LB (Preview)', 'The client ranges, plus `136.124.104.0/22`, `136.124.108.0/22`', 'Clients connect directly; its own health check ranges'],
                ['Internal passthrough Network LB', 'The client ranges, plus `35.191.0.0/16`', 'Clients connect directly; health checks from Google\'s range']
              ]
            },
            {
              kind: 'callout',
              tone: 'tip',
              title: 'What changed',
              text: 'Older material says health checks come from `130.211.0.0/22` and `35.191.0.0/16`. Google\'s current docs list only `35.191.0.0/16` for health check probes, and keep `130.211.0.0/22` for Google Front End proxy traffic. The classic rule allowing both ranges is still correct for global and classic load balancers — and still the exam answer.'
            }
          ]
        },
        {
          id: 'proxy-subnet',
          title: 'Proxy-only subnets',
          blocks: [
            { kind: 'figure', svg: FIG_PROXY_SUBNET, caption: 'The Envoy proxies of a regional or cross-region load balancer take their addresses from a subnet reserved for them. Your VMs never use it.' },
            {
              kind: 'list',
              items: [
                'Needed by every **Envoy-based** load balancer: regional external, regional internal and cross-region internal Application LBs, and the regional and cross-region proxy Network LBs.',
                'One per region and VPC, shared by all of those load balancers in that region. Purpose `REGIONAL_MANAGED_PROXY` for regional ones, `GLOBAL_MANAGED_PROXY` for cross-region ones.',
                'Google recommends a **/23** (minimum /26) — every proxy takes addresses from it, and it must not overlap other subnets.',
                'Not needed by global external or classic load balancers (they use Google Front Ends) or by passthrough load balancers (there is no proxy).'
              ]
            },
            {
              kind: 'code',
              lines: [
                '$ gcloud compute networks subnets create proxy-only-us --purpose=REGIONAL_MANAGED_PROXY --role=ACTIVE --network=prod-vpc --region=us-central1 --range=10.129.0.0/23',
                '$ gcloud compute firewall-rules create allow-proxies --network=prod-vpc --allow=tcp:80,tcp:443,tcp:8080 --source-ranges=10.129.0.0/23 --target-tags=app'
              ]
            }
          ]
        },
        {
          id: 'balancing',
          title: 'Balancing modes, affinity and draining',
          blocks: [
            {
              kind: 'table',
              columns: ['Setting', 'Options', 'Notes'],
              rows: [
                ['Balancing mode', '`UTILIZATION` (CPU, instance groups only), `RATE` (requests per second), `CONNECTION`', 'How "full" a backend is measured; with a capacity scaler (0–1) to drain a group gently'],
                ['Session affinity', 'None, client IP, generated cookie, HTTP cookie, header field', 'Keeps a client on the same backend while it stays healthy — not a guarantee'],
                ['Connection draining', '`--connection-draining-timeout`', 'Lets in-flight requests finish when a backend is removed or scaled in'],
                ['Locality', 'Nearest region with capacity first (global), then spill over', 'Global load balancers send users to the closest healthy backends']
              ]
            }
          ]
        }
      ]
    },

    // ── 7 ─────────────────────────────────────────────────────────────────
    {
      id: 'scenarios',
      title: 'Troubleshooting scenarios',
      sections: [
        {
          id: 'sc-502',
          title: 'Scenario 1 — A new load balancer answers 502',
          blocks: [
            {
              kind: 'case',
              title: 'Everything is created, nothing works',
              situation: 'A global external Application Load Balancer was just built in front of `web-mig`. The VMs answer on port 80 when tested from inside the VPC, but users get an error page.',
              symptom: [
                '$ curl -i https://shop.example.com/',
                'HTTP/2 502',
                'Error: Server Error. The server encountered a temporary error and could not complete your request.',
                '$ gcloud compute backend-services get-health web-bs --global',
                '    - healthState: UNHEALTHY',
                '      ipAddress: 10.10.0.5',
                '      port: 80'
              ],
              diagnose: [
                'Every backend is UNHEALTHY, so the load balancer has nowhere to send traffic — the request logs show `statusDetails: failed_to_pick_backend`.',
                'The usual cause: no firewall rule lets Google\'s probes and proxies in. The implied deny-ingress rule drops them.',
                'Also check that the health check port and path really answer 200, and that the instance group\'s named port matches the backend service.'
              ],
              fix: ['$ gcloud compute firewall-rules create allow-lb --network=prod-vpc --allow=tcp:80 --source-ranges=130.211.0.0/22,35.191.0.0/16 --target-tags=web', '$ gcloud compute backend-services get-health web-bs --global', '    - healthState: HEALTHY'],
              why: 'Probes and proxied traffic come from Google\'s ranges, not from the users. Until the firewall allows those ranges, the load balancer never sees a healthy backend.',
              exam: '"All backends unhealthy / 502 after creating the load balancer" → a firewall rule from 130.211.0.0/22 and 35.191.0.0/16.'
            }
          ]
        },
        {
          id: 'sc-proxy-subnet',
          title: 'Scenario 2 — The internal load balancer will not build, then will not connect',
          blocks: [
            {
              kind: 'case',
              title: 'A regional internal Application Load Balancer for internal APIs',
              situation: 'The team creates a regional internal Application Load Balancer in us-central1. The forwarding rule fails; after fixing that, clients get connection resets although health checks pass.',
              symptom: [
                '$ gcloud compute forwarding-rules create api-fr --load-balancing-scheme=INTERNAL_MANAGED --region=us-central1 --network=prod-vpc --subnet=app-us --target-https-proxy=api-https --target-https-proxy-region=us-central1 --ports=443',
                'ERROR: (gcloud.compute.forwarding-rules.create) Could not fetch resource:',
                ' - An active proxy-only subnetwork is required in the same region and VPC as the forwarding rule.'
              ],
              diagnose: [
                'Envoy-based load balancers need a **proxy-only subnet** in the region before the forwarding rule can exist.',
                'Health checks come from 35.191.0.0/16 — that rule was there, so backends look healthy.',
                'But real traffic comes from the proxy-only subnet range, and no rule allows it.'
              ],
              fix: [
                '$ gcloud compute networks subnets create proxy-only-us --purpose=REGIONAL_MANAGED_PROXY --role=ACTIVE --network=prod-vpc --region=us-central1 --range=10.129.0.0/23',
                '$ gcloud compute firewall-rules create allow-proxies --network=prod-vpc --allow=tcp:8080 --source-ranges=10.129.0.0/23 --target-tags=api'
              ],
              why: 'With Envoy-based load balancers, health checks and traffic come from different places. Both must be allowed.',
              exam: 'Any regional or internal managed (Envoy) load balancer → a proxy-only subnet, and a firewall rule from its range.'
            }
          ]
        },
        {
          id: 'sc-client-ip',
          title: 'Scenario 3 — The app logs the wrong client IP',
          blocks: [
            {
              kind: 'case',
              title: 'Every visitor seems to come from 35.191.x.x',
              situation: 'Behind a global external Application Load Balancer, the app\'s access log shows Google addresses instead of visitors, so rate limiting by IP blocks everyone at once.',
              symptom: ['35.191.10.12 - - [20/Oct/2026:09:12:01] "GET /cart HTTP/1.1" 200', '35.191.10.12 - - [20/Oct/2026:09:12:01] "GET /api/price HTTP/1.1" 200'],
              diagnose: [
                'An Application Load Balancer is a proxy: the connection to the backend comes from the Google Front End.',
                'The original client is in the `X-Forwarded-For` header: `client-ip, load-balancer-ip`.',
                'For a proxy Network Load Balancer there is no HTTP header — use the PROXY protocol. For the source address itself, only a passthrough load balancer keeps it.'
              ],
              fix: [
                '# web server: trust the load balancer and read the first X-Forwarded-For address',
                '# (nginx: set_real_ip_from 130.211.0.0/22; set_real_ip_from 35.191.0.0/16; real_ip_header X-Forwarded-For;)',
                '# or rate-limit at the edge instead, with a Cloud Armor rate-based rule'
              ],
              why: 'Proxy load balancers replace the source address; they pass the client on in a header or protocol instead.',
              exam: '"Backend must know the client IP behind an HTTP(S) load balancer" → X-Forwarded-For. "Must be preserved at the network level" → passthrough Network Load Balancer.'
            }
          ]
        },
        {
          id: 'sc-cert',
          title: 'Scenario 4 — The certificate never becomes active',
          blocks: [
            {
              kind: 'case',
              title: 'HTTPS fails a day after setup',
              situation: 'A Google-managed certificate for `shop.example.com` was attached to the target HTTPS proxy. Browsers get a TLS error.',
              symptom: ['$ gcloud compute ssl-certificates describe shop-cert --global --format="get(managed.status, managed.domainStatus)"', 'PROVISIONING	shop.example.com=FAILED_NOT_VISIBLE'],
              diagnose: [
                'Google can only issue the certificate once the domain resolves to the load balancer and it can be reached on port 443.',
                '`FAILED_NOT_VISIBLE` = the DNS A record still points somewhere else (the old server), or does not exist.',
                'Check that the forwarding rule on 443 references the target proxy with this certificate.'
              ],
              fix: ['$ gcloud dns record-sets update shop.example.com. --zone=shop-zone --type=A --ttl=300 --rrdatas=34.120.45.6', '# then wait: provisioning continues on its own once DNS is right'],
              why: 'Domain validation for managed certificates is done through the load balancer itself, so DNS must point at it first.',
              exam: 'A managed certificate stuck in PROVISIONING / FAILED_NOT_VISIBLE → fix the DNS record to point at the load balancer IP.'
            }
          ]
        },
        {
          id: 'sc-udp',
          title: 'Scenario 5 — A UDP game server behind the wrong load balancer',
          blocks: [
            {
              kind: 'case',
              title: 'Players cannot connect on UDP 7777',
              situation: 'A studio tried to put its game servers behind an Application Load Balancer. Players connect over UDP on port 7777, and the servers must see each player\'s IP for anti-cheat.',
              diagnose: [
                'Application and proxy Network Load Balancers only carry HTTP(S) and TCP.',
                'UDP + the client IP at the backend = a **passthrough** Network Load Balancer.',
                'Its health check can probe a TCP or HTTP port that the game server also opens.'
              ],
              fix: [
                '$ gcloud compute health-checks create tcp game-hc --port=8080 --region=asia-southeast2',
                '$ gcloud compute backend-services create game-bs --load-balancing-scheme=EXTERNAL --protocol=UDP --region=asia-southeast2 --health-checks=game-hc --health-checks-region=asia-southeast2',
                '$ gcloud compute backend-services add-backend game-bs --region=asia-southeast2 --instance-group=game-mig --instance-group-region=asia-southeast2',
                '$ gcloud compute forwarding-rules create game-fr --load-balancing-scheme=EXTERNAL --region=asia-southeast2 --ip-protocol=UDP --ports=7777 --backend-service=game-bs',
                '$ gcloud compute firewall-rules create allow-game --network=prod-vpc --allow=udp:7777,tcp:8080 --source-ranges=0.0.0.0/0 --target-tags=game'
              ],
              why: 'Passthrough load balancers forward packets of any supported protocol without ending the connection, so the client IP arrives intact.',
              exam: '"UDP" or "preserve the client IP" in the question → a passthrough Network Load Balancer.'
            }
          ]
        },
        {
          id: 'sc-global',
          title: 'Scenario 6 — Users far away are slow',
          blocks: [
            {
              kind: 'case',
              title: 'One region serves the whole world',
              situation: 'A shop runs behind a regional external Application Load Balancer in us-central1. Customers in Jakarta wait almost a second for each page.',
              diagnose: [
                'Every request travels across the Pacific to one region and back.',
                'A **global external Application Load Balancer** gives one anycast IP; users enter Google\'s network at the nearest edge, and are sent to the closest region that has healthy capacity.',
                'Static content can be cached at the edge with Cloud CDN, so many requests never reach a backend.'
              ],
              fix: [
                '# a second MIG in asia-southeast2 behind the same global backend service',
                '$ gcloud compute backend-services add-backend web-bs --global --instance-group=web-mig-jkt --instance-group-region=asia-southeast2',
                '$ gcloud compute backend-services update web-bs --global --enable-cdn'
              ],
              why: 'Global load balancers route on proximity and capacity, and spill over to another region when the nearest one is full or unhealthy.',
              exam: '"Users worldwide, single IP, lowest latency" → global external Application Load Balancer (Premium Tier) with backends in several regions.'
            }
          ]
        },
        {
          id: 'sc-armor',
          title: 'Scenario 7 — Attack traffic reaches the app',
          blocks: [
            {
              kind: 'case',
              title: 'SQL injection attempts and a flood from one country',
              situation: 'Logs show SQL injection probes and a burst of traffic from a region where the shop does not sell. The team wants to stop it before it reaches the VMs.',
              diagnose: [
                'Filtering at the VMs still lets the traffic use bandwidth and CPU. Cloud Armor filters at Google\'s edge.',
                'Preconfigured WAF rules cover the OWASP classics; expressions can match `origin.region_code`, IP ranges, headers.',
                'Start rules in **preview** mode to see what they would block before enforcing them.'
              ],
              fix: [
                '$ gcloud compute security-policies create edge-waf',
                '$ gcloud compute security-policies rules create 1000 --security-policy=edge-waf --expression="evaluatePreconfiguredWaf(\'sqli-v33-stable\')" --action=deny-403 --preview',
                '$ gcloud compute security-policies rules create 2000 --security-policy=edge-waf --expression="origin.region_code == \'XX\'" --action=deny-403',
                '$ gcloud compute backend-services update web-bs --global --security-policy=edge-waf'
              ],
              why: 'Cloud Armor policies attach to the backend service of the load balancer, so they act before traffic ever reaches your network.',
              exam: '"Block SQL injection / allow or deny by geography / mitigate DDoS for an HTTP(S) app" → Cloud Armor.'
            }
          ]
        },
        {
          id: 'sc-onprem',
          title: 'Scenario 8 — On-premises cannot reach an internal load balancer',
          blocks: [
            {
              kind: 'case',
              title: 'The VPN lands in another region',
              situation: 'An internal passthrough Network Load Balancer for a database proxy lives in us-central1. The office connects over HA VPN that terminates in asia-southeast2, and its connections time out.',
              diagnose: [
                'By default, internal load balancers only accept clients in their own region.',
                '**Global access** on the forwarding rule lets clients in any region of the VPC — and on-premises systems connected through VPN or Interconnect in any region — reach it.',
                'The office also needs a route to the us-central1 subnet: with regional dynamic routing it never learns one.'
              ],
              fix: ['$ gcloud compute forwarding-rules update db-fr --region=us-central1 --allow-global-access', '$ gcloud compute networks update prod-vpc --bgp-routing-mode=global'],
              why: 'Internal load balancers are regional resources; global access and global dynamic routing together make them reachable from everywhere the VPC reaches.',
              exam: '"Clients in another region / on-premises must reach an internal load balancer" → enable global access.'
            }
          ]
        },
        {
          id: 'sc-bucket',
          title: 'Scenario 9 — Serving static files under the same domain',
          blocks: [
            {
              kind: 'case',
              title: 'Images and scripts straight from Cloud Storage',
              situation: 'The VMs spend most of their time serving images and JavaScript. The team wants those files served from a bucket under `shop.example.com/static/`, cached worldwide.',
              diagnose: [
                'An Application Load Balancer can have a Cloud Storage **backend bucket** as a target of a path rule.',
                'Cloud CDN on the backend bucket caches the files at Google\'s edge.',
                'The bucket objects must be readable by the load balancer — for public assets, by `allUsers`.'
              ],
              fix: [
                '$ gcloud compute backend-buckets create static --gcs-bucket-name=shop-static --enable-cdn',
                '$ gcloud compute url-maps add-path-matcher web-map --path-matcher-name=shop --default-service=web-bs --new-hosts=shop.example.com --backend-bucket-path-rules="/static/*=static"'
              ],
              why: 'The URL map splits one address between dynamic backends and static storage, and CDN keeps most static requests from reaching either.',
              exam: '"Serve static content from Cloud Storage and dynamic content from VMs under one domain" → backend bucket + backend service in one URL map.'
            }
          ]
        }
      ]
    },

    // ── 8 ─────────────────────────────────────────────────────────────────
    {
      id: 'check',
      title: 'Check yourself',
      sections: [
        {
          id: 'quiz',
          title: 'Twelve quick questions',
          blocks: [
            { kind: 'quiz', q: 'A public HTTPS site has users on every continent, needs one IP address and Cloud CDN. Which load balancer?', options: ['Regional external Application Load Balancer', 'Global external Application Load Balancer', 'Regional external passthrough Network Load Balancer', 'Global external proxy Network Load Balancer'], answer: 1, explain: 'HTTP(S) + worldwide + CDN → the global external Application Load Balancer (Premium Tier).' },
            { kind: 'quiz', q: 'What is "Internal TCP/UDP Load Balancing" called today?', options: ['Regional internal proxy Network Load Balancer', 'Regional internal Application Load Balancer', 'Internal passthrough Network Load Balancer', 'Cross-region internal proxy Network Load Balancer'], answer: 2, explain: 'It never proxied anything, so it became a passthrough Network Load Balancer.' },
            { kind: 'quiz', q: 'What is the old "global external HTTP(S) load balancer" (not classic) called today?', options: ['Global external Application Load Balancer', 'Classic Application Load Balancer', 'Global external proxy Network Load Balancer', 'Regional external Application Load Balancer'], answer: 0, explain: 'HTTP(S) load balancers became Application Load Balancers; the classic variant became the classic Application Load Balancer.' },
            { kind: 'quiz', q: 'Game servers take UDP traffic from the internet and must see each player\'s IP. Which load balancer?', options: ['Global external Application Load Balancer', 'Regional external proxy Network Load Balancer', 'Regional external passthrough Network Load Balancer', 'Regional internal Application Load Balancer'], answer: 2, explain: 'UDP and the client IP both point to a passthrough Network Load Balancer.' },
            { kind: 'quiz', q: 'Internal HTTP microservices in one region need host and path routing. Which load balancer?', options: ['Internal passthrough Network Load Balancer', 'Regional internal Application Load Balancer', 'Global external Application Load Balancer', 'Regional internal proxy Network Load Balancer'], answer: 1, explain: 'HTTP-aware + internal + one region → the regional internal Application Load Balancer.' },
            { kind: 'quiz', q: 'Which of these needs a proxy-only subnet?', options: ['Global external Application Load Balancer', 'Internal passthrough Network Load Balancer', 'Regional external passthrough Network Load Balancer', 'Regional internal Application Load Balancer'], answer: 3, explain: 'Envoy-based (regional and cross-region proxy) load balancers run their proxies in a proxy-only subnet.' },
            { kind: 'quiz', q: 'Behind a new global external Application Load Balancer every backend is UNHEALTHY. Which firewall rule is missing?', options: ['Ingress from 35.235.240.0/20', 'Ingress from 130.211.0.0/22 and 35.191.0.0/16', 'Egress to 0.0.0.0/0', 'Ingress from the proxy-only subnet'], answer: 1, explain: 'Google Front End proxies and health checks come from those ranges.' },
            { kind: 'quiz', q: 'Behind an Application Load Balancer, the app sees Google addresses as the client. Where is the real client IP?', options: ['It is lost', 'In the X-Forwarded-For header', 'In the PROXY protocol header', 'In the Host header'], answer: 1, explain: 'Application Load Balancers add the client IP to X-Forwarded-For. The PROXY protocol is for proxy Network Load Balancers.' },
            { kind: 'quiz', q: 'Where do you block SQL injection attempts before they reach the backends?', options: ['A VPC firewall rule', 'A Cloud Armor security policy on the backend service', 'Cloud CDN', 'An SSL policy'], answer: 1, explain: 'Cloud Armor\'s preconfigured WAF rules filter at Google\'s edge.' },
            { kind: 'quiz', q: 'A project uses Standard Tier networking. Which load balancer cannot be used?', options: ['Regional external Application Load Balancer', 'Regional external passthrough Network Load Balancer', 'Global external Application Load Balancer', 'Regional external proxy Network Load Balancer'], answer: 2, explain: 'Global load balancers need Premium Tier; Standard Tier only works with regional external ones.' },
            { kind: 'quiz', q: 'You need highly available firewall appliances as the next hop of a route. Which load balancer?', options: ['Internal passthrough Network Load Balancer', 'Regional internal Application Load Balancer', 'Global external proxy Network Load Balancer', 'Classic Application Load Balancer'], answer: 0, explain: 'Only the internal passthrough Network Load Balancer can be a route\'s next hop.' },
            { kind: 'quiz', q: 'A Google-managed certificate shows FAILED_NOT_VISIBLE. The fix?', options: ['Upload the certificate again', 'Point the domain\'s DNS A record at the load balancer IP', 'Turn on Cloud CDN', 'Use a self-managed certificate'], answer: 1, explain: 'Google validates the domain through the load balancer, so DNS must point at it.' }
          ]
        }
      ]
    }
  ]
};
