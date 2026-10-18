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
  'Satu VPC global berisi subnet regional: subnet di us-central1 dan di asia-southeast2; VM di kedua region berbicara lewat IP internal tanpa VPN',
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
    <text x="393" y="176" text-anchor="middle" ${ON} style="fill:#1a1a1a; font-size: 12px">IP internal</text>
    <text x="360" y="290" text-anchor="middle" opacity="0.7">Firewall rule dan route berlaku untuk seluruh VPC; subnet milik satu region; VM milik satu zone.</text>
  </g>`
);

const FIG_CIDR = SVG(
  'Subnet 10.0.1.0/24 berisi 256 alamat: .0 alamat network, .1 gateway, .254 dicadangkan Google, .255 broadcast, dan 252 alamat untuk VM',
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
    <text x="360" y="36" font-weight="600">10.0.1.0/24 = 256 alamat · 4 dicadangkan · 252 untuk VM</text>
    <text x="60" y="83">.0</text><text x="100" y="83">.1</text><text x="620" y="83">.254</text><text x="660" y="83">.255</text>
    <text x="360" y="83" ${ON}>.2 … .253 — bisa dipakai VM, load balancer internal, dll.</text>
    <g opacity="0.7" style="font-size: 12px">
      <text x="60" y="124">network</text>
      <text x="100" y="144">gateway</text>
      <text x="620" y="124">Google</text>
      <text x="660" y="144">broadcast</text>
    </g>
  </g>`
);

const FIG_ROUTE = SVG(
  'Tabel route VPC: rute subnet ke VM lain, rute ke tunnel VPN, dan default route 0.0.0.0/0 ke default internet gateway; prefix paling spesifik menang',
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
    <text x="307" y="56" text-anchor="middle" font-weight="600">Tabel route prod-vpc</text>
    <g class="mono" style="font-size: 12px; font-family: var(--font-mono)">
      <text x="196" y="88">10.10.0.0/24 → subnet</text>
      <text x="196" y="124">10.20.0.0/24 → subnet</text>
      <text x="196" y="162">192.168.0.0/16 → vpn-tunnel</text>
      <text x="196" y="198">0.0.0.0/0 → internet gateway</text>
    </g>
    <text x="590" y="60" text-anchor="middle">VM lain di VPC</text>
    <text x="590" y="130" text-anchor="middle">Kantor lewat Cloud VPN</text>
    <text x="590" y="192" text-anchor="middle">Internet</text>
    <text x="590" y="209" text-anchor="middle" opacity="0.7" style="font-size: 12px">hanya jika ada IP eksternal / NAT</text>
  </g>`
);

const FIG_FW = SVG(
  'Firewall VPC dijalankan di setiap VM: trafik masuk dicek aturan ingress, trafik keluar dicek aturan egress, balasan koneksi otomatis diizinkan karena stateful',
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
    <text x="86" y="121" font-weight="600">Klien internet</text>
    <text x="634" y="121" font-weight="600">API luar</text>
    <text x="360" y="113" ${ON} font-weight="600">VM web-1</text>
    <text x="360" y="131" ${ON} style="fill:#1a1a1a; font-size: 12px">tag: web</text>
    <text x="360" y="54" opacity="0.7" style="font-size: 12px">firewall VPC — di setiap VM</text>
    <text x="216" y="96" style="font-size: 12px">ingress: rule INGRESS</text>
    <text x="216" y="146" opacity="0.7" style="font-size: 12px">balasan: otomatis</text>
    <text x="502" y="96" style="font-size: 12px">egress: rule EGRESS</text>
    <text x="502" y="146" opacity="0.7" style="font-size: 12px">balasan: otomatis</text>
  </g>
  <g ${BOX}><rect x="96" y="196" width="250" height="34" rx="17"/><rect x="374" y="196" width="250" height="34" rx="17"/></g>
  <g fill="currentColor" text-anchor="middle" style="font-size: 12px">
    <text x="221" y="218">implied: deny semua ingress · 65535</text>
    <text x="499" y="218">implied: allow semua egress · 65535</text>
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
  'Empat jalan keluar untuk VM tanpa IP eksternal: Cloud NAT ke internet, Private Google Access ke Google API, endpoint Private Service Connect, dan private services access ke Cloud SQL',
  720,
  290,
  `
  <rect x="16" y="120" width="140" height="60" rx="6" ${BOX}/>
  <text x="86" y="146" text-anchor="middle" fill="currentColor" font-weight="600">VM privat</text>
  <text x="86" y="164" text-anchor="middle" fill="currentColor" opacity="0.7" style="font-size: 12px">tanpa IP eksternal</text>
  ${path4(14, 'Cloud NAT', 'Internet: apt, API pihak ketiga')}
  ${path4(82, 'Private Google Access', 'Google API: Storage, BigQuery')}
  ${path4(150, 'Endpoint PSC', 'Google API lewat IP internal')}
  ${path4(218, 'Private services access', 'Cloud SQL, Memorystore')}`
);

const vpcBox = (x: number, name: string, cidr: string) =>
  `<rect x="${x}" y="70" width="160" height="70" rx="10" ${BOX}/><text x="${x + 80}" y="100" text-anchor="middle" fill="currentColor" font-weight="600">${name}</text><text x="${x + 80}" y="120" text-anchor="middle" fill="currentColor" opacity="0.7" style="font-size: 12px">${cidr}</text>`;

const FIG_PEERING = SVG(
  'Peering tidak transitif: A terhubung ke B dan B ke C, tapi A tidak bisa mencapai C lewat B',
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
    <text x="360" y="200" style="font-size: 12px">A ↔ C ✗ — tidak lewat B</text>
    <text x="360" y="36" opacity="0.7">Kedua sisi harus membuat peering · rentang tidak boleh bertumpuk</text>
  </g>`
);

const FIG_SHARED = SVG(
  'Shared VPC: host project memiliki VPC dan subnet; VM di service project memakai subnet itu; jaringan dan firewall diatur tim jaringan di host project',
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
    <text x="176" y="120" text-anchor="middle" ${ON} style="fill:#1a1a1a; font-size: 12px">firewall & route di sini</text>
    <text x="176" y="174" text-anchor="middle" ${ON} style="fill:#1a1a1a">subnet-dev · 10.20.0.0/20</text>
    <text x="410" y="50" font-weight="600">Service project shop-prod</text>
    <text x="410" y="162" font-weight="600">Service project shop-dev</text>
    <text x="481" y="89" text-anchor="middle">VM api</text>
    <text x="625" y="89" text-anchor="middle">GKE node</text>
    <text x="481" y="201" text-anchor="middle">VM test</text>
    <text x="176" y="226" text-anchor="middle" opacity="0.7" style="font-size: 12px">tim aplikasi butuh roles/compute.networkUser</text>
  </g>`
);

const FIG_HYBRID = SVG(
  'Hybrid: kantor terhubung ke VPC lewat HA VPN dengan dua tunnel atau lewat Interconnect; Cloud Router bertukar route lewat BGP',
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
    <text x="91" y="114" font-weight="600">Kantor / DC</text>
    <text x="91" y="132" opacity="0.7" style="font-size: 12px">router BGP</text>
    <text x="376" y="70" ${ON} font-weight="600">HA VPN</text>
    <text x="376" y="88" ${ON} style="fill:#1a1a1a; font-size: 12px">2 tunnel IPsec · 99,99%</text>
    <text x="376" y="162" font-weight="600">Interconnect</text>
    <text x="376" y="180" opacity="0.7" style="font-size: 12px">Dedicated / Partner</text>
    <text x="551" y="118" font-weight="600">Cloud</text>
    <text x="551" y="136" font-weight="600">Router</text>
    <text x="670" y="126" font-weight="600">VPC</text>
    <text x="230" y="64" opacity="0.7" style="font-size: 12px">internet, terenkripsi</text>
    <text x="230" y="184" opacity="0.7" style="font-size: 12px">link privat</text>
    <text x="551" y="176" opacity="0.7" style="font-size: 12px">BGP</text>
    <text x="360" y="232" opacity="0.7">Dynamic routing mode menentukan route kantor sampai ke satu region atau ke semua region.</text>
  </g>`
);

const SA_API = 'api-sa@ace-lab-123.iam.gserviceaccount.com';
const SA_BATCH = 'batch-sa@ace-lab-123.iam.gserviceaccount.com';

export const lesson: Lesson = {
  id: 'vpc',
  lang: 'id',
  title: 'VPC Networks and Firewall Rules',
  intro:
    'Jaringan Google Cloud terasa membingungkan karena banyak hal yang di tempat lain terpisah, di sini disatukan — VPC global, firewall yang menempel di setiap VM, route yang berlaku di semua region. Pelajaran ini disusun mengikuti pertanyaan yang dijawab sebuah jaringan: dari mana alamat IP datang, lewat jalan mana paket pergi, siapa boleh masuk dan keluar, dan bagaimana jaringan saling terhubung. Ada kalkulator subnet dan latihan membaca firewall yang bisa kamu coba langsung.',
  practice: [
    { label: 'Topologi: buka web server ke internet', href: '#/ace/lab/network/web-open', note: 'IP eksternal, firewall, target tag' },
    { label: 'Topologi: SSH aman lewat IAP', href: '#/ace/lab/network/iap-ssh', note: '35.235.240.0/20, tanpa IP eksternal' },
    { label: 'Topologi: blokir satu VM dengan priority', href: '#/ace/lab/network/deny-priority', note: 'Priority dan deny vs allow' },
    { label: 'Topologi: VM privat perlu update OS', href: '#/ace/lab/network/cloud-nat', note: 'Cloud NAT' },
    { label: 'Topologi: peering tidak transitif', href: '#/ace/lab/network/peering-transitive', note: 'A–B–C' },
    { label: 'Topologi: hybrid kantor ke dua region', href: '#/ace/lab/network/hybrid-vpn', note: 'HA VPN, dynamic routing global' },
    { label: 'Kuis perintah: VPC, subnet dan firewall', href: '#/ace/lab/cmd/network', note: '16 soal gcloud compute networks / firewall-rules' },
    { label: 'Kanvas: perbaiki load balancer 502', href: '#/ace/lab/canvas/fix-lb-502', note: 'Firewall health check' }
  ],
  parts: [
    // ── 1 ─────────────────────────────────────────────────────────────────
    {
      id: 'map',
      title: 'Peta besar',
      sections: [
        {
          id: 'what',
          title: 'VPC: jaringan privat milikmu, berskala global',
          blocks: [
            {
              kind: 'p',
              text: '**Virtual Private Cloud (VPC)** adalah jaringan privat yang terisolasi untuk resource-mu: VM, node GKE, load balancer internal, Cloud SQL berIP privat. Bedanya dengan cloud lain yang paling penting: **VPC Google bersifat global**. Satu VPC bisa punya subnet di Jakarta dan di Iowa sekaligus, dan VM di keduanya saling bicara lewat IP internal tanpa VPN atau peering.'
            },
            { kind: 'figure', svg: FIG_GLOBAL, caption: 'VPC global, subnet regional, VM zonal. Trafik antar region di dalam satu VPC tetap di jaringan privat Google.' },
            {
              kind: 'table',
              caption: 'Cakupan tiap resource jaringan',
              columns: ['Resource', 'Cakupan', 'Artinya'],
              rows: [
                ['VPC network', 'Global', 'Satu jaringan untuk semua region'],
                ['Route', 'Global (milik VPC)', 'Berlaku untuk semua VM di VPC, bisa dibatasi dengan network tag'],
                ['Firewall rule', 'Global (milik VPC)', 'Diterapkan ke VM yang menjadi targetnya, di region mana pun'],
                ['Subnet', 'Regional', 'Satu rentang IP di satu region, melintasi semua zone region itu'],
                ['Cloud Router, Cloud NAT, IP eksternal regional', 'Regional', 'Perlu satu per region'],
                ['VM, disk', 'Zonal', 'Hidup di satu zone']
              ]
            },
            {
              kind: 'callout',
              tone: 'analogy',
              title: 'Analogi',
              text: 'VPC itu kompleks perumahan milik satu pengembang yang punya cabang di beberapa kota. Subnet adalah blok rumah di tiap kota, firewall adalah satpam yang berjaga di depan setiap rumah (bukan di gerbang kompleks), dan route adalah peta jalan yang dibagikan ke semua penghuni.'
            },
            {
              kind: 'callout',
              tone: 'exam',
              title: 'Di soal ujian',
              text: '"VMs in two regions must communicate privately with minimal setup" → taruh di VPC yang sama (subnet berbeda region). Peering atau VPN baru dibutuhkan bila jaringannya berbeda.'
            }
          ]
        },
        {
          id: 'modes',
          title: 'Mode subnet: auto vs custom, dan jaringan default',
          blocks: [
            {
              kind: 'table',
              columns: ['', 'Auto mode', 'Custom mode'],
              rows: [
                ['Subnet', 'Dibuat otomatis: satu /20 di setiap region, dari 10.128.0.0/9', 'Kamu yang membuat, di region yang kamu mau'],
                ['Rentang IP', 'Sama di semua project auto mode', 'Bebas dipilih'],
                ['Risiko', 'Bentrok saat peering atau VPN antar project auto mode', 'Harus direncanakan'],
                ['Perubahan', 'Bisa dikonversi ke custom (sekali, tidak bisa balik)', '—'],
                ['Cocok untuk', 'Coba-coba', 'Produksi']
              ]
            },
            {
              kind: 'p',
              text: 'Project baru biasanya punya jaringan bernama **default** — auto mode, plus empat firewall rule bawaan berprioritas 65534: `default-allow-internal` (semua protokol dari 10.128.0.0/9), `default-allow-ssh` (tcp:22 dari mana saja), `default-allow-rdp` (tcp:3389 dari mana saja) dan `default-allow-icmp`. Praktis untuk mencoba, tapi SSH dan RDP terbuka ke seluruh internet. Banyak organisasi mematikan pembuatan jaringan default lewat org policy.'
            },
            {
              kind: 'code',
              title: 'Jaringan produksi: custom mode, subnet sendiri',
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
      title: 'Alamat IP',
      sections: [
        {
          id: 'cidr',
          title: 'Membaca CIDR tanpa kalkulator',
          blocks: [
            {
              kind: 'p',
              text: 'Rentang IP ditulis dalam notasi **CIDR**: `10.0.1.0/24`. Angka setelah garis miring adalah berapa bit pertama yang dikunci; sisanya bebas. Alamat IPv4 punya 32 bit, jadi `/24` menyisakan 8 bit = 2⁸ = **256 alamat**. Setiap turun satu angka, jumlahnya berlipat dua: `/23` = 512, `/22` = 1.024, `/20` = 4.096. Naik satu angka, jumlahnya separuh: `/25` = 128, `/28` = 16, `/29` = 8.'
            },
            { kind: 'figure', svg: FIG_CIDR, caption: 'Google mencadangkan empat alamat di setiap subnet: alamat pertama (network), kedua (default gateway), kedua dari terakhir (cadangan Google) dan terakhir (broadcast). Jadi /24 memberi 252 alamat untuk VM, bukan 256.' },
            {
              kind: 'table',
              caption: 'Hafalkan beberapa saja',
              columns: ['Prefix', 'Total alamat', 'Bisa dipakai di subnet GCP', 'Contoh pemakaian'],
              mono: [0],
              rows: [
                ['/29', '8', '4', 'Subnet terkecil yang diizinkan'],
                ['/28', '16', '12', 'Rentang control plane GKE privat'],
                ['/26', '64', '60', 'Minimal untuk Direct VPC egress Cloud Run'],
                ['/24', '256', '252', 'Subnet aplikasi kecil'],
                ['/20', '4.096', '4.092', 'Subnet auto mode per region'],
                ['/16', '65.536', '65.532', 'Rentang satu lingkungan besar'],
                ['/8', '16.777.216', '—', 'Seluruh 10.0.0.0/8']
              ]
            },
            { kind: 'cidr', value: '10.10.0.0/24', note: 'Coba ganti: 10.10.0.0/20, 192.168.5.77/27, 172.16.0.0/29, atau 10.0.0.0/30 (terlalu kecil untuk subnet).' }
          ]
        },
        {
          id: 'plan',
          title: 'Merencanakan rentang supaya tidak menyesal',
          blocks: [
            {
              kind: 'list',
              items: [
                'Pakai rentang privat **RFC 1918**: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.',
                'Rentang subnet **tidak boleh bertumpuk** di dalam satu VPC, dan juga dengan jaringan yang di-peer atau terhubung lewat VPN — termasuk jaringan kantor. Rencanakan dari awal untuk semua lingkungan.',
                'Subnet bisa **diperbesar** tanpa downtime (`expand-ip-range`, prefix makin kecil), tapi **tidak bisa diperkecil**. Mulai secukupnya, sisakan ruang di sebelahnya untuk tumbuh.',
                'Subnet bisa punya **rentang sekunder** (alias IP) — dipakai GKE untuk IP Pod dan Service.',
                'Ukuran minimum subnet IPv4 adalah **/29**.'
              ]
            },
            {
              kind: 'code',
              title: 'Subnet hampir penuh: perbesar dari /24 ke /22',
              lines: [
                '$ gcloud compute networks subnets expand-ip-range web-us --region=us-central1 --prefix-length=22',
                'Updated [https://www.googleapis.com/compute/v1/projects/ace-lab-123/regions/us-central1/subnetworks/web-us].',
                '# 10.10.0.0/24 → 10.10.0.0/22: rentang baru harus tetap tidak bertumpuk dengan subnet lain'
              ]
            }
          ]
        },
        {
          id: 'ips',
          title: 'IP internal dan IP eksternal',
          blocks: [
            {
              kind: 'table',
              columns: ['Jenis', 'Dari mana', 'Ephemeral', 'Statis'],
              rows: [
                ['IP internal', 'Rentang subnet', 'Dipilih otomatis, bisa berganti saat VM dibuat ulang', '`gcloud compute addresses create NAME --region=R --subnet=S --addresses=10.10.0.10`'],
                ['IP eksternal regional', 'Pool Google di region itu', 'Berganti saat VM berhenti lalu jalan lagi', '`gcloud compute addresses create NAME --region=R` — untuk VM dan Network LB'],
                ['IP eksternal global', 'Anycast Google', '—', '`gcloud compute addresses create NAME --global` — untuk Application LB global']
              ]
            },
            {
              kind: 'list',
              items: [
                'IP eksternal VM sebenarnya tidak terlihat di dalam OS: VM hanya tahu IP internalnya, dan Google menerjemahkan (1:1 NAT) di batas jaringan.',
                'IP statis yang dipesan tapi tidak dipakai tetap ditagih — hapus kalau tidak perlu.',
                'Praktik yang dianjurkan: VM **tanpa IP eksternal**; keluar lewat Cloud NAT, masuk lewat load balancer, admin lewat IAP.'
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
          title: 'Bagaimana paket memilih jalan',
          blocks: [
            {
              kind: 'p',
              text: 'Setiap VPC punya **tabel route** yang dipakai semua VM di dalamnya. Saat VM mengirim paket, Google mencari route yang tujuannya mencakup alamat tujuan; bila lebih dari satu cocok, **prefix paling spesifik menang** (`/24` mengalahkan `/16`, yang mengalahkan `/0`), dan bila sama spesifiknya, **priority** terkecil menang.'
            },
            { kind: 'figure', svg: FIG_ROUTE, caption: 'Paket ke 10.20.0.5 cocok dengan route subnet; ke 192.168.3.4 cocok dengan route VPN; ke 8.8.8.8 hanya cocok dengan 0.0.0.0/0. Route default saja tidak cukup untuk internet — VM juga butuh IP eksternal atau Cloud NAT.' },
            {
              kind: 'table',
              columns: ['Jenis route', 'Dibuat oleh', 'Catatan'],
              rows: [
                ['Subnet route', 'Otomatis, satu per rentang subnet', 'Tidak bisa dihapus selama subnet ada; membuat semua subnet saling terhubung'],
                ['Default route 0.0.0.0/0 → default internet gateway', 'Otomatis saat VPC dibuat', 'Bisa dihapus untuk memutus akses internet total (lalu PGA butuh route khusus ke VIP Google)'],
                ['Static route', 'Kamu', 'Next hop: VM (mis. appliance firewall), IP, tunnel VPN, internal LB; bisa dibatasi dengan network tag'],
                ['Dynamic route', 'Cloud Router lewat BGP', 'Dipelajari dari VPN atau Interconnect; berubah otomatis saat jaringan kantor berubah'],
                ['Peering route', 'Peering VPC', 'Subnet route jaringan tetangga']
              ]
            }
          ]
        },
        {
          id: 'dynamic',
          title: 'Route dinamis: Cloud Router, BGP dan dynamic routing mode',
          blocks: [
            {
              kind: 'p',
              text: '**Cloud Router** adalah layanan terkelola yang berbicara **BGP** dengan router di kantor atau data center. Ia mengumumkan rentang subnet VPC ke sana dan mempelajari rentang kantor dari sana, jadi kamu tidak perlu mengetik static route setiap kali ada jaringan baru. Cloud Router bersifat regional.'
            },
            {
              kind: 'table',
              columns: ['Dynamic routing mode', 'Route dari kantor sampai ke…', 'Kapan dipilih'],
              rows: [
                ['`regional` (default)', 'Hanya subnet di region tempat Cloud Router berada', 'Semua workload yang perlu ke kantor ada di satu region'],
                ['`global`', 'Semua subnet di semua region VPC', 'Satu koneksi hybrid melayani beberapa region']
              ]
            },
            { kind: 'code', lines: ['$ gcloud compute networks update prod-vpc --bgp-routing-mode=global', '$ gcloud compute routers create hub-router --network=prod-vpc --region=us-central1 --asn=65010'] },
            {
              kind: 'callout',
              tone: 'exam',
              title: 'Di soal ujian',
              text: '"On-premises can reach VMs in us-central1 over VPN but not VMs in europe-west1 in the same VPC" → ubah dynamic routing mode VPC menjadi global.'
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
          title: 'Cara kerja firewall VPC',
          blocks: [
            {
              kind: 'p',
              text: 'Firewall VPC bukan satu kotak di gerbang jaringan. Ia **terdistribusi**: aturannya ditegakkan di setiap VM, sehingga dua VM di subnet yang sama pun saling diperiksa. Dan ia **stateful**: kalau koneksi keluar diizinkan, balasannya otomatis boleh masuk (dan sebaliknya), tanpa rule terpisah.'
            },
            { kind: 'figure', svg: FIG_FW, caption: 'Setiap VPC selalu punya dua implied rule di priority terendah yang tidak bisa dihapus: tolak semua ingress, izinkan semua egress. Semua rule-mu berada di atasnya.' },
            {
              kind: 'list',
              items: [
                '**Ingress** = trafik masuk ke VM; dicocokkan dengan **sumber** (source). **Egress** = trafik keluar dari VM; dicocokkan dengan **tujuan** (destination).',
                'Tanpa rule apa pun, VM tidak bisa dihubungi dari mana pun, tapi bebas keluar.',
                'Beberapa trafik selalu diizinkan apa pun rule-nya (DHCP, DNS dan metadata server di 169.254.169.254), dan beberapa selalu diblokir (misalnya egress tcp:25 ke luar Google).'
              ]
            }
          ]
        },
        {
          id: 'anatomy',
          title: 'Anatomi sebuah firewall rule',
          blocks: [
            {
              kind: 'table',
              columns: ['Bagian', 'Nilai', 'Catatan'],
              rows: [
                ['Network', 'Satu VPC', 'Rule milik satu jaringan'],
                ['Direction', '`INGRESS` atau `EGRESS`', 'Default INGRESS'],
                ['Priority', '0–65535, default 1000', '**Angka kecil = didahulukan**'],
                ['Action', '`allow` atau `deny`', 'Lewat `--allow` atau `--action` + `--rules`'],
                ['Target', 'Semua instance, **target tag**, atau **target service account**', 'Ke VM mana rule diterapkan'],
                ['Source (ingress)', 'Rentang IP, source tag, source service account', 'Rentang dan tag digabung dengan OR'],
                ['Destination (egress)', 'Rentang IP', '—'],
                ['Protokol & port', '`tcp:80`, `tcp:8000-8100`, `udp:53`, `icmp`, `all`', 'Satu rule bisa berisi beberapa'],
                ['Logging', 'On/off', 'Firewall Rules Logging ke Cloud Logging']
              ]
            },
            {
              kind: 'code',
              title: 'Tiga rule yang hampir selalu ada',
              lines: [
                '# web publik, hanya ke VM bertag web',
                '$ gcloud compute firewall-rules create allow-http --network=prod-vpc --allow=tcp:80,tcp:443 --source-ranges=0.0.0.0/0 --target-tags=web',
                '# SSH hanya lewat IAP',
                '$ gcloud compute firewall-rules create allow-iap-ssh --network=prod-vpc --allow=tcp:22 --source-ranges=35.235.240.0/20',
                '# web boleh ke database, selain itu tidak',
                '$ gcloud compute firewall-rules create allow-web-to-db --network=prod-vpc --allow=tcp:5432 --source-tags=web --target-tags=db'
              ]
            },
            {
              kind: 'callout',
              tone: 'tip',
              text: 'Kalau `--source-ranges` dan `--source-tags` sama-sama tidak ditulis pada rule ingress, sumbernya dianggap `0.0.0.0/0` — seluruh internet. Selalu tulis sumber dengan sengaja.'
            }
          ]
        },
        {
          id: 'order',
          title: 'Urutan evaluasi: siapa yang menang',
          blocks: [
            {
              kind: 'steps',
              items: [
                { title: 'Saring yang relevan', text: 'Ambil rule dengan arah yang sama, target yang mengenai VM itu, sumber/tujuan yang cocok, dan port yang tercakup. Rule lain diabaikan.' },
                { title: 'Ambil priority terkecil', text: 'Dari yang cocok, angka priority paling kecil yang menang. Rule priority 900 mengalahkan 1000, apa pun action-nya.' },
                { title: 'Seri? deny menang', text: 'Bila deny dan allow cocok di priority yang sama, **deny** yang berlaku.' },
                { title: 'Tidak ada yang cocok? implied rule', text: 'Ingress ditolak, egress diizinkan.' }
              ]
            },
            {
              kind: 'firewall',
              title: 'Latihan 1 — tebak: diizinkan atau ditolak?',
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
              after: 'Perhatikan baris kedua: allow-http cocok, tapi deny-bad-ip priority 900 lebih dulu. Dan baris terakhir: tidak ada rule egress sama sekali, jadi implied allow egress yang berlaku.'
            }
          ]
        },
        {
          id: 'targets',
          title: 'Target: network tag atau service account?',
          blocks: [
            {
              kind: 'table',
              columns: ['', 'Network tag', 'Service account', 'Secure tag (tag Resource Manager)'],
              rows: [
                ['Dipakai di', 'VPC firewall rule', 'VPC firewall rule', 'Network firewall policy'],
                ['Siapa bisa mengubah', 'Siapa pun yang boleh mengedit VM (`compute.instances.setTags`)', 'Butuh `iam.serviceAccountUser` pada SA, dan VM harus berhenti', 'Dikendalikan IAM per tag'],
                ['Kekuatan kontrol', 'Lemah — label bebas', 'Kuat — terikat identitas', 'Kuat dan terpusat'],
                ['Cocok untuk', 'Lab, tim kecil', 'Produksi, pemisahan tugas', 'Organisasi besar']
              ]
            },
            {
              kind: 'list',
              items: [
                'Satu rule **tidak boleh mencampur** tag dan service account (misalnya target tag dengan source service account).',
                'Source tag dan source service account hanya mencocokkan trafik dari **IP internal VM di VPC yang sama** — tidak berlaku lewat peering atau dari IP eksternal.'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              title: 'Di soal ujian',
              text: '"Ensure only the security team can control which VMs a firewall rule applies to" → target service account (atau secure tags), bukan network tag yang bisa diubah setiap pemilik VM.'
            }
          ]
        },
        {
          id: 'ranges',
          title: 'Rentang khusus yang harus dihafal',
          blocks: [
            {
              kind: 'table',
              columns: ['Rentang', 'Siapa', 'Rule yang dibutuhkan'],
              mono: [0],
              rows: [
                ['35.235.240.0/20', 'Identity-Aware Proxy (TCP forwarding)', 'Ingress tcp:22 (SSH) / tcp:3389 (RDP) ke VM tanpa IP eksternal'],
                ['130.211.0.0/22 dan 35.191.0.0/16', 'Health check dan proxy load balancer Google', 'Ingress ke port backend; tanpa ini backend UNHEALTHY → 502'],
                ['199.36.153.8/30', 'private.googleapis.com', 'Egress tcp:443 bila egress ke internet ditutup tapi Google API harus tetap bisa'],
                ['199.36.153.4/30', 'restricted.googleapis.com', 'Sama, untuk API yang didukung VPC Service Controls'],
                ['169.254.169.254', 'Metadata server', 'Selalu diizinkan — tidak perlu rule']
              ]
            }
          ]
        },
        {
          id: 'policies',
          title: 'Firewall policy hierarkis: aturan dari atas',
          blocks: [
            {
              kind: 'p',
              text: 'Di organisasi besar, tim keamanan ingin aturan yang tidak bisa dilangkahi tim project — misalnya "jangan pernah buka RDP ke internet" atau "selalu izinkan scanner keamanan". Untuk itu ada **hierarchical firewall policy** di level organisasi dan folder, dan **network firewall policy** di level VPC. Action-nya `allow`, `deny`, atau **`goto_next`** (serahkan keputusan ke level di bawahnya).'
            },
            {
              kind: 'steps',
              items: [
                { title: 'Policy organisasi', text: 'Dievaluasi paling awal. Deny di sini tidak bisa dibuka oleh project mana pun.' },
                { title: 'Policy folder', text: 'Untuk koneksi yang di-goto_next oleh organisasi.' },
                { title: 'Aturan VPC dan network firewall policy', text: 'Firewall rule biasa milik project, plus policy jaringan (yang bisa memakai secure tag dan FQDN).' },
                { title: 'Implied rule', text: 'Tolak ingress, izinkan egress.' }
              ]
            },
            {
              kind: 'firewall',
              title: 'Latihan 2 — jebakan priority yang sama',
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
                'Baris pertama adalah jebakannya: allow-lb-hc dan deny-8080 sama-sama priority 1000, jadi deny menang dan health check gagal. Perbaikannya: beri allow-lb-hc priority lebih kecil, misalnya 900. Pola egress di dua baris terakhir — tutup semua di 65000, buka yang perlu di atasnya — adalah cara standar mengunci egress.'
            }
          ]
        }
      ]
    },

    // ── 5 ─────────────────────────────────────────────────────────────────
    {
      id: 'egress',
      title: 'Keluar dari VPC',
      sections: [
        {
          id: 'paths',
          title: 'Empat jalan keluar untuk VM privat',
          blocks: [
            { kind: 'figure', svg: FIG_EGRESS, caption: 'VM tanpa IP eksternal tetap bisa bekerja — asal jalan keluarnya dipilih sesuai tujuan.' },
            {
              kind: 'table',
              columns: ['Tujuan', 'Pakai', 'Diatur di', 'Catatan'],
              rows: [
                ['Internet (update OS, API pihak ketiga)', '**Cloud NAT**', 'Cloud Router per region per VPC', 'Hanya keluar; tidak pernah menerima koneksi masuk'],
                ['Google API publik (Storage, BigQuery, Pub/Sub)', '**Private Google Access**', 'Per subnet', 'Tanpa NAT dan tanpa IP eksternal; tetap butuh route ke default internet gateway (atau ke VIP private/restricted)'],
                ['Google API lewat alamat internal pilihanmu', '**Private Service Connect** endpoint', 'Per VPC', 'Cocok untuk on-premises yang mengakses Google API lewat VPN/Interconnect'],
                ['Layanan terkelola berIP privat (Cloud SQL, Memorystore)', '**Private services access**', 'Rentang dialokasikan + peering servicenetworking', 'Satu kali per VPC']
              ]
            },
            {
              kind: 'code',
              title: 'Membuka dua jalan untuk VM privat di us-central1',
              lines: [
                '# internet keluar',
                '$ gcloud compute routers create nat-router --network=prod-vpc --region=us-central1',
                '$ gcloud compute routers nats create prod-nat --router=nat-router --region=us-central1 --auto-allocate-nat-external-ips --nat-all-subnet-ip-ranges',
                '# Google API tanpa internet',
                '$ gcloud compute networks subnets update web-us --region=us-central1 --enable-private-ip-google-access'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              title: 'Di soal ujian',
              text: '"VMs without external IPs must download OS patches" → Cloud NAT. "VMs without external IPs must access Cloud Storage / BigQuery" → Private Google Access. Jangan tertukar: PGA tidak membuka internet, dan NAT tidak dibutuhkan untuk Google API bila PGA aktif.'
            }
          ]
        }
      ]
    },

    // ── 6 ─────────────────────────────────────────────────────────────────
    {
      id: 'connect',
      title: 'Menghubungkan jaringan',
      sections: [
        {
          id: 'peering',
          title: 'VPC Network Peering',
          blocks: [
            {
              kind: 'p',
              text: '**Peering** menghubungkan dua VPC (di project atau organisasi yang sama maupun berbeda) sehingga VM-nya saling bicara lewat IP internal dengan latensi dan biaya seperti di satu jaringan. Setiap VPC tetap dikelola sendiri: firewall, route, dan admin-nya terpisah.'
            },
            { kind: 'figure', svg: FIG_PEERING, caption: 'Tiga aturan peering yang paling sering diuji: dibuat dari kedua sisi, rentang tidak boleh bertumpuk, dan tidak transitif.' },
            {
              kind: 'list',
              items: [
                'Peering baru `ACTIVE` setelah **kedua** sisi membuatnya (`gcloud compute networks peerings create` di masing-masing VPC).',
                'Rentang subnet kedua VPC **tidak boleh bertumpuk** — alasan utama untuk tidak memakai auto mode.',
                '**Tidak transitif**: A–B dan B–C tidak membuat A bisa ke C. Untuk hub-and-spoke pakai peering langsung, VPN, atau Network Connectivity Center.',
                'Firewall rule tidak ikut tersebar: tiap VPC harus mengizinkan rentang tetangganya sendiri. Source tag dan service account tidak berlaku lintas peering — pakai rentang IP.'
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
              text: '**Shared VPC** memungkinkan satu **host project** memiliki VPC, subnet dan firewall, sementara banyak **service project** menaruh VM dan cluster-nya di subnet itu. Hasilnya: tim jaringan mengatur jaringan di satu tempat, tim aplikasi mengurus aplikasinya di project masing-masing (dengan billing dan IAM terpisah).'
            },
            { kind: 'figure', svg: FIG_SHARED, caption: 'Resource-nya tinggal di service project, tapi NIC-nya ada di subnet host project.' },
            {
              kind: 'table',
              columns: ['Peran', 'Role', 'Diberikan di'],
              rows: [
                ['Mengaktifkan Shared VPC, menghubungkan service project', '`roles/compute.xpnAdmin` (Shared VPC Admin)', 'Organisasi atau folder'],
                ['Tim aplikasi yang membuat VM di subnet bersama', '`roles/compute.networkUser`', 'Host project, atau per subnet (lebih sempit)'],
                ['Tim jaringan mengatur subnet, route, firewall', '`roles/compute.networkAdmin` / `securityAdmin`', 'Host project']
              ]
            },
            {
              kind: 'table',
              caption: 'Peering atau Shared VPC?',
              columns: ['Situasi', 'Pilih'],
              rows: [
                ['Satu organisasi, ingin jaringan diatur terpusat oleh satu tim', 'Shared VPC'],
                ['Dua organisasi berbeda, atau dua tim yang ingin admin jaringan terpisah', 'Peering'],
                ['Menghubungkan ke jaringan produsen layanan (Cloud SQL, partner SaaS)', 'Peering / private services access / PSC']
              ]
            }
          ]
        },
        {
          id: 'hybrid',
          title: 'Hybrid: Cloud VPN dan Cloud Interconnect',
          blocks: [
            { kind: 'figure', svg: FIG_HYBRID, caption: 'Keduanya memakai Cloud Router dan BGP; bedanya di jalur fisik, kapasitas dan biaya.' },
            {
              kind: 'table',
              columns: ['', 'HA VPN', 'Dedicated Interconnect', 'Partner Interconnect'],
              rows: [
                ['Jalur', 'Internet publik, terenkripsi IPsec', 'Sambungan fisik langsung di fasilitas colocation', 'Lewat penyedia layanan'],
                ['Kapasitas', 'Sekitar 3 Gbps per tunnel; tambah tunnel', 'Sirkuit 10 atau 100 Gbps', '50 Mbps sampai 50 Gbps'],
                ['SLA', '99,99% dengan 2 interface dan 2 tunnel', 'Hingga 99,99% dengan topologi yang disarankan', 'Hingga 99,99%'],
                ['Enkripsi', 'Selalu', 'Tidak default (bisa MACsec atau HA VPN over Interconnect)', 'Tidak default'],
                ['Cocok untuk', 'Cepat, murah, trafik sedang', 'Trafik besar, latensi stabil, dekat colocation Google', 'Tidak dekat colocation atau butuh kapasitas kecil']
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              title: 'Di soal ujian',
              text: '"Encrypted connection quickly and at low cost" → HA VPN. "10 Gbps or more, private, low latency" → Dedicated Interconnect. "Not near a colocation facility" atau "less than 10 Gbps" → Partner Interconnect. Classic VPN dengan static routing adalah jawaban lama.'
            }
          ]
        }
      ]
    },

    // ── 7 ─────────────────────────────────────────────────────────────────
    {
      id: 'ops',
      title: 'Akses dan observasi',
      sections: [
        {
          id: 'access',
          title: 'Masuk ke VM dengan aman',
          blocks: [
            {
              kind: 'steps',
              items: [
                { title: 'VM tanpa IP eksternal', text: 'Permukaan serangan dari internet hilang.' },
                { title: 'Firewall dari rentang IAP saja', text: 'Ingress tcp:22 (dan tcp:3389 untuk Windows) dari 35.235.240.0/20.', code: ['gcloud compute firewall-rules create allow-iap-ssh --network=prod-vpc --allow=tcp:22 --source-ranges=35.235.240.0/20'] },
                { title: 'Izin lewat IAM', text: 'Pengguna butuh `roles/iap.tunnelResourceAccessor`; dengan **OS Login**, akses SSH juga diatur role `roles/compute.osLogin` atau `osAdminLogin` — bukan kunci di metadata.' },
                { title: 'Masuk', text: 'gcloud membuka terowongan lewat IAP.', code: ['gcloud compute ssh db-1 --zone=us-central1-a --tunnel-through-iap'] }
              ]
            },
            {
              kind: 'callout',
              tone: 'tip',
              text: 'Bastion host (VM loncatan ber-IP publik) masih sering muncul di soal lama. IAP TCP forwarding mencapai hal yang sama tanpa VM yang harus dipatch dan tanpa port SSH terbuka ke internet.'
            }
          ]
        },
        {
          id: 'tools',
          title: 'Alat troubleshooting jaringan',
          blocks: [
            {
              kind: 'table',
              columns: ['Alat', 'Menjawab', 'Catatan'],
              rows: [
                ['**Connectivity Tests** (Network Intelligence Center)', '"Apakah A bisa ke B, dan kalau tidak, di mana berhentinya?"', 'Menganalisis konfigurasi: route, firewall, NAT; menyebut rule yang memblokir'],
                ['**Firewall Rules Logging**', '"Rule mana yang mengizinkan/menolak koneksi ini?"', 'Diaktifkan per rule; masuk ke Cloud Logging'],
                ['**Firewall Insights**', '"Rule mana yang tidak pernah kena atau tertutup rule lain?"', 'Menemukan shadowed rule dan rule terlalu longgar'],
                ['**VPC Flow Logs**', '"Siapa bicara dengan siapa, berapa banyak?"', 'Per subnet, berbasis sampel; untuk analisis trafik dan forensik'],
                ['**Packet Mirroring**', '"Isi paketnya apa?"', 'Menyalin trafik ke appliance analisis']
              ]
            },
            {
              kind: 'code',
              title: 'Perintah yang sering dipakai',
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
      title: 'Skenario troubleshooting',
      sections: [
        {
          id: 'sc-ssh',
          title: 'Skenario 1 — SSH gagal ke VM tanpa IP eksternal',
          blocks: [
            {
              kind: 'case',
              title: 'Admin tidak bisa masuk ke db-1',
              situation: 'VM db-1 sengaja dibuat tanpa IP eksternal di prod-vpc (custom mode, tanpa rule SSH). Admin menjalankan gcloud compute ssh dan gagal.',
              symptom: ['$ gcloud compute ssh db-1 --zone=us-central1-a', 'External IP address was not found; defaulting to using IAP tunneling.', 'ERROR: (gcloud.compute.start-iap-tunnel) Error while connecting [4003: \'failed to connect to backend\'].'],
              diagnose: [
                'gcloud otomatis memakai IAP karena VM tidak punya IP eksternal — bagus.',
                'Error 4003 = IAP tidak bisa mencapai port 22 VM: tidak ada firewall ingress dari 35.235.240.0/20.',
                'Kalau error-nya 4033, masalahnya di IAM: pengguna tidak punya `roles/iap.tunnelResourceAccessor`.'
              ],
              fix: ['$ gcloud compute firewall-rules create allow-iap-ssh --network=prod-vpc --allow=tcp:22 --source-ranges=35.235.240.0/20 --target-tags=db', '$ gcloud compute ssh db-1 --zone=us-central1-a --tunnel-through-iap'],
              why: 'IAP datang dari rentang tetap milik Google. Membuka tcp:22 hanya ke rentang itu memberi akses SSH tanpa membuka port ke internet.',
              exam: '"Connect to VMs that have no external IP without a bastion host" → IAP TCP forwarding + firewall 35.235.240.0/20.'
            }
          ]
        },
        {
          id: 'sc-web',
          title: 'Skenario 2 — Web server tidak bisa dibuka',
          blocks: [
            {
              kind: 'case',
              title: 'Rule sudah ada, tapi browser tetap timeout',
              situation: 'VM web-2 punya IP eksternal dan nginx jalan di port 80. Ada rule allow-http (tcp:80, 0.0.0.0/0, target tag web). Browser tetap timeout.',
              symptom: ['$ gcloud compute instances describe web-2 --zone=us-central1-a --format="value(tags.items)"', 'http-server'],
              diagnose: [
                'Rule allow-http hanya berlaku untuk VM bertag `web`, sedangkan VM ini bertag `http-server` (tag dari checkbox "Allow HTTP traffic" di Console untuk jaringan default).',
                'Tidak ada rule lain yang cocok → implied deny ingress.',
                'Connectivity Test dari 0.0.0.0/0 ke web-2:80 akan menyebut "dropped by implied rule".'
              ],
              fix: ['$ gcloud compute instances add-tags web-2 --zone=us-central1-a --tags=web', '# atau ubah target rule agar cocok dengan tag yang dipakai'],
              why: 'Firewall dicocokkan per VM lewat target. Rule yang "terlihat benar" tidak berpengaruh kalau targetnya tidak mengenai VM itu.',
              exam: 'Soal yang menyebut "rule exists but traffic is still blocked" sering soal target tag yang tidak cocok atau priority.'
            }
          ]
        },
        {
          id: 'sc-isolate',
          title: 'Skenario 3 — Isolasi satu VM yang dicurigai',
          blocks: [
            {
              kind: 'case',
              title: 'Putus semua trafik VM app-7 tanpa mengganggu yang lain',
              situation: 'VM app-7 terindikasi malware. Tim ingin memutus semua trafik masuk dan keluar VM itu untuk forensik, tanpa menghapusnya dan tanpa mengubah rule yang dipakai VM lain.',
              diagnose: [
                'Butuh rule **deny** yang hanya mengenai app-7 dengan priority **lebih kecil** dari semua allow yang ada (misalnya 100).',
                'Targetkan dengan service account khusus atau tag unik (`quarantine`) — bukan semua instance.',
                'Ingress dan egress adalah rule terpisah; butuh keduanya. Tetap izinkan IAP bila tim perlu masuk (priority lebih kecil lagi).'
              ],
              fix: [
                '$ gcloud compute instances add-tags app-7 --zone=us-central1-a --tags=quarantine',
                '$ gcloud compute firewall-rules create q-allow-iap --network=prod-vpc --priority=50 --allow=tcp:22 --source-ranges=35.235.240.0/20 --target-tags=quarantine',
                '$ gcloud compute firewall-rules create q-deny-in --network=prod-vpc --priority=100 --action=DENY --rules=all --source-ranges=0.0.0.0/0 --target-tags=quarantine',
                '$ gcloud compute firewall-rules create q-deny-out --network=prod-vpc --priority=100 --direction=EGRESS --action=DENY --rules=all --destination-ranges=0.0.0.0/0 --target-tags=quarantine'
              ],
              why: 'Priority kecil membuat deny dievaluasi sebelum allow apa pun; target tag membatasi efeknya ke satu VM. Ingat bahwa tag bisa dicabut siapa pun yang boleh mengedit VM — untuk karantina yang tidak boleh dilepas sembarang orang, pakai target service account atau secure tag.',
              exam: '"Block traffic to one VM while keeping other rules" → rule deny priority lebih tinggi (angka lebih kecil) dengan target spesifik.'
            }
          ]
        },
        {
          id: 'sc-private',
          title: 'Skenario 4 — VM privat tidak bisa update dan tidak bisa baca bucket',
          blocks: [
            {
              kind: 'case',
              title: 'Dua gejala, dua obat',
              situation: 'VM batch-1 tanpa IP eksternal di subnet batch (us-central1). `apt-get update` timeout, dan `gcloud storage ls gs://ace-data-123` juga timeout.',
              symptom: ['$ sudo apt-get update', "Err:1 https://deb.debian.org/debian bookworm InRelease  Could not connect to deb.debian.org:443 (151.101.2.132). - connect (110: Connection timed out)", '$ gcloud storage ls gs://ace-data-123', 'ERROR: … Max retries exceeded … Connection timed out'],
              diagnose: [
                'Tanpa IP eksternal, VM tidak punya jalan ke internet: butuh **Cloud NAT** di us-central1.',
                'Untuk Cloud Storage tidak perlu internet: aktifkan **Private Google Access** di subnet itu.',
                'Kalau setelah PGA aktif masih timeout: cek apakah default route 0.0.0.0/0 pernah dihapus — PGA ke VIP publik Google tetap butuh route itu (atau route khusus ke 199.36.153.8/30).',
                'Kalau timeout berubah menjadi 403: jaringannya sudah beres, sekarang masalah IAM atau access scope VM.'
              ],
              fix: [
                '$ gcloud compute routers create nat-router --network=prod-vpc --region=us-central1',
                '$ gcloud compute routers nats create batch-nat --router=nat-router --region=us-central1 --auto-allocate-nat-external-ips --nat-all-subnet-ip-ranges',
                '$ gcloud compute networks subnets update batch --region=us-central1 --enable-private-ip-google-access'
              ],
              why: 'NAT dan PGA menyelesaikan masalah yang berbeda: NAT untuk tujuan di internet, PGA untuk API Google. Banyak desain memakai keduanya.',
              exam: 'Pilihan "assign external IPs to the VMs" hampir selalu salah bila soal menekankan keamanan.'
            }
          ]
        },
        {
          id: 'sc-peering',
          title: 'Skenario 5 — Peering yang tidak sampai',
          blocks: [
            {
              kind: 'case',
              title: 'A bisa ke B, B bisa ke C, A tidak bisa ke C',
              situation: 'Tim membuat peering vpc-a ↔ vpc-shared dan vpc-shared ↔ vpc-c, berharap vpc-shared menjadi hub. VM di vpc-a tidak bisa menjangkau VM di vpc-c.',
              symptom: ['$ gcloud compute networks peerings list', 'NAME          NETWORK     PEER_NETWORK  STATE   STATE_DETAILS', 'a-to-shared   vpc-a       vpc-shared    ACTIVE  [2026-10-18]: Connected.', 'shared-to-c   vpc-shared  vpc-c         ACTIVE  [2026-10-18]: Connected.'],
              diagnose: ['Peering **tidak transitif**: route vpc-c tidak diteruskan ke vpc-a lewat vpc-shared.', 'Kalau peering baru langsung gagal dengan pesan rentang bertumpuk, cek subnet kedua VPC — tidak boleh overlap.'],
              fix: [
                '# Peering langsung A ↔ C (dibuat di kedua sisi)',
                '$ gcloud compute networks peerings create a-to-c --network=vpc-a --peer-network=vpc-c',
                '$ gcloud compute networks peerings create c-to-a --network=vpc-c --peer-network=vpc-a',
                '# Untuk banyak spoke: pertimbangkan Shared VPC, HA VPN antar VPC, atau Network Connectivity Center'
              ],
              why: 'Tiap peering hanya bertukar route kedua VPC itu. Jaringan hub-and-spoke butuh mekanisme yang memang meneruskan route.',
              exam: 'Soal "three VPCs peered in a chain" selalu menguji sifat non-transitif.'
            }
          ]
        },
        {
          id: 'sc-ip',
          title: 'Skenario 6 — Subnet kehabisan IP',
          blocks: [
            {
              kind: 'case',
              title: 'MIG tidak bisa menambah VM',
              situation: 'Autoscaler ingin menambah VM, tapi operasi gagal. Subnet app-us berukuran /26.',
              symptom: ["ERROR: (gcloud.compute.instances.create) Could not fetch resource:", " - IP space of 'projects/ace-lab-123/regions/us-central1/subnetworks/app-us' is exhausted."],
              diagnose: ['/26 = 64 alamat, 60 bisa dipakai. Semua sudah terpakai.', 'Cek rentang di sebelahnya kosong (tidak dipakai subnet lain, peering, atau jaringan kantor) supaya bisa diperbesar.'],
              fix: ['$ gcloud compute networks subnets expand-ip-range app-us --region=us-central1 --prefix-length=24'],
              why: 'Memperbesar subnet tidak mengganggu VM yang ada dan tidak butuh downtime. Kebalikannya — memperkecil — tidak mungkin, jadi rencanakan ruang tumbuh dari awal.',
              exam: '"Subnet needs more IP addresses without downtime" → `expand-ip-range`.'
            }
          ]
        },
        {
          id: 'sc-shared',
          title: 'Skenario 7 — Tidak bisa membuat VM di subnet Shared VPC',
          blocks: [
            {
              kind: 'case',
              title: 'Developer di service project ditolak',
              situation: 'Developer punya roles/compute.instanceAdmin di service project shop-dev, tapi saat membuat VM di subnet-dev milik host project, operasinya ditolak.',
              symptom: ["ERROR: (gcloud.compute.instances.create) Could not fetch resource:", " - Required 'compute.subnetworks.use' permission for 'projects/net-host/regions/us-central1/subnetworks/subnet-dev'"],
              diagnose: ['Membuat VM cukup diizinkan di service project, tapi **memakai subnet** adalah izin di host project.', 'Izin `compute.subnetworks.use` ada di `roles/compute.networkUser`.'],
              fix: ['$ gcloud compute networks subnets add-iam-policy-binding subnet-dev --region=us-central1 --project=net-host \\', '    --member=user:dev@example.com --role=roles/compute.networkUser'],
              why: 'Shared VPC sengaja memisahkan izin: jaringan milik host, workload milik service project. Memberi networkUser per subnet adalah versi least privilege-nya.',
              exam: '"Users in a service project cannot create VMs in the shared subnet" → `roles/compute.networkUser`.'
            }
          ]
        },
        {
          id: 'sc-hybrid',
          title: 'Skenario 8 — Kantor hanya bisa ke satu region',
          blocks: [
            {
              kind: 'case',
              title: 'VPN tersambung, tapi region kedua tidak terjangkau',
              situation: 'HA VPN dan Cloud Router ada di us-central1. Server kantor bisa menjangkau VM di us-central1, tapi tidak bisa menjangkau VM di europe-west1 pada VPC yang sama.',
              symptom: ['$ gcloud compute networks describe prod-vpc --format="value(routingConfig.routingMode)"', 'REGIONAL'],
              diagnose: [
                'Dengan dynamic routing **regional**, Cloud Router hanya mengumumkan subnet di region-nya ke kantor, dan route kantor hanya dipasang di region itu.',
                'Tunnel dan BGP sehat — ini soal cakupan route, bukan konektivitas.'
              ],
              fix: ['$ gcloud compute networks update prod-vpc --bgp-routing-mode=global'],
              why: 'Mode global membuat satu Cloud Router melayani semua region VPC. Alternatifnya, pasang VPN dan Cloud Router di setiap region.',
              exam: 'Kata kunci "routes learned via VPN only in one region" → dynamic routing mode global.'
            }
          ]
        },
        {
          id: 'sc-shadow',
          title: 'Skenario 9 — Rule baru tidak berpengaruh',
          blocks: [
            {
              kind: 'case',
              title: 'Allow sudah dibuat, koneksi tetap ditolak',
              situation: 'Tim membuat allow-metrics (tcp:9100 dari 10.0.0.0/8, priority 1000) agar Prometheus bisa scrape VM. Koneksi tetap ditolak.',
              symptom: [
                '$ gcloud compute firewall-rules list --filter="network:prod-vpc" --sort-by=priority',
                'NAME           DIRECTION  PRIORITY  ALLOW     DENY  DISABLED',
                'deny-internal  INGRESS    500                 all   False',
                'allow-metrics  INGRESS    1000      tcp:9100        False'
              ],
              diagnose: ['deny-internal (priority 500) mencakup trafik yang sama dan dievaluasi lebih dulu → allow-metrics tidak pernah kena (shadowed).', 'Firewall Insights menandai rule seperti ini; Firewall Rules Logging di deny-internal menunjukkan koneksinya ditolak di sana.'],
              fix: ['$ gcloud compute firewall-rules update allow-metrics --priority=400'],
              why: 'Tidak ada "rule yang lebih spesifik menang" di firewall VPC — yang menentukan hanya priority (lalu deny saat seri). Ini berbeda dari route.',
              exam: 'Jebakan klasik: mengira rule dengan port lebih spesifik akan menang.'
            }
          ]
        }
      ]
    },

    // ── 9 ─────────────────────────────────────────────────────────────────
    {
      id: 'check',
      title: 'Cek pemahaman',
      sections: [
        {
          id: 'quiz',
          title: 'Dua belas soal singkat',
          blocks: [
            { kind: 'quiz', q: 'Berapa alamat yang bisa dipakai VM di subnet `10.1.0.0/24`?', options: ['256', '254', '252', '250'], answer: 2, explain: 'Google mencadangkan 4 alamat di setiap subnet (network, gateway, cadangan Google, broadcast): 256 − 4 = 252.' },
            { kind: 'quiz', q: 'Apa cakupan sebuah VPC network dan subnet di Google Cloud?', options: ['VPC regional, subnet zonal', 'VPC global, subnet regional', 'VPC global, subnet global', 'VPC zonal, subnet zonal'], answer: 1, explain: 'VPC global; subnet milik satu region dan melintasi semua zone-nya.' },
            { kind: 'quiz', q: 'Rule allow dan rule deny sama-sama cocok dengan sebuah koneksi, keduanya priority 1000. Hasilnya?', options: ['Diizinkan', 'Ditolak', 'Rule yang dibuat terakhir menang', 'Rule dengan port lebih spesifik menang'], answer: 1, explain: 'Pada priority yang sama, deny menang.' },
            { kind: 'quiz', q: 'Cara paling aman memberi admin SSH ke VM tanpa IP eksternal?', options: ['Buka tcp:22 dari 0.0.0.0/0', 'Bastion host ber-IP publik', 'IAP TCP forwarding dengan firewall dari 35.235.240.0/20', 'Beri VM IP eksternal sementara'], answer: 2, explain: 'IAP tidak butuh IP publik atau bastion; aksesnya diatur IAM dan port 22 hanya terbuka untuk rentang IAP.' },
            { kind: 'quiz', q: 'VM tanpa IP eksternal harus mengunduh patch OS dari internet. Pakai apa?', options: ['Private Google Access', 'Cloud NAT', 'VPC peering', 'Private services access'], answer: 1, explain: 'Cloud NAT memberi akses keluar ke internet. PGA hanya untuk API Google.' },
            { kind: 'quiz', q: 'VM tanpa IP eksternal harus membaca bucket Cloud Storage tanpa akses internet. Pakai apa?', options: ['Cloud NAT', 'Private Google Access di subnet', 'IP eksternal statis', 'Cloud VPN'], answer: 1, explain: 'Private Google Access diaktifkan per subnet dan membuka jalan ke API Google tanpa internet.' },
            { kind: 'quiz', q: 'VPC A di-peer ke B, dan B di-peer ke C. Bisakah VM di A menjangkau VM di C?', options: ['Ya, lewat B', 'Ya, bila custom routes diekspor', 'Tidak — peering tidak transitif', 'Ya, bila ketiganya auto mode'], answer: 2, explain: 'Peering tidak transitif; A butuh peering langsung ke C atau mekanisme lain.' },
            { kind: 'quiz', q: 'Satu organisasi ingin tim jaringan mengatur subnet dan firewall terpusat untuk puluhan project aplikasi. Pilihan terbaik?', options: ['VPC peering di setiap pasangan project', 'Shared VPC', 'Cloud VPN antar project', 'Auto mode di setiap project'], answer: 1, explain: 'Shared VPC: host project memiliki jaringan, service project memakainya.' },
            { kind: 'quiz', q: 'Semua backend load balancer UNHEALTHY padahal aplikasinya jalan. Firewall apa yang kurang?', options: ['Ingress dari 35.235.240.0/20', 'Ingress dari 130.211.0.0/22 dan 35.191.0.0/16 ke port backend', 'Egress ke 0.0.0.0/0', 'Ingress dari 199.36.153.8/30'], answer: 1, explain: 'Health check dan proxy load balancer datang dari 130.211.0.0/22 dan 35.191.0.0/16.' },
            { kind: 'quiz', q: 'Hanya tim keamanan yang boleh menentukan VM mana yang terkena sebuah firewall rule. Target yang tepat?', options: ['Network tag', 'Semua instance', 'Target service account', 'Rentang IP sumber'], answer: 2, explain: 'Mengganti service account VM butuh izin IAM dan VM berhenti; network tag bisa diubah siapa pun yang boleh mengedit VM.' },
            { kind: 'quiz', q: 'Lewat VPN, kantor hanya bisa menjangkau subnet di region tempat Cloud Router berada. Apa yang diubah?', options: ['Tambah IP eksternal ke VM', 'Ubah dynamic routing mode VPC ke global', 'Buat peering', 'Ganti ke Classic VPN'], answer: 1, explain: 'Mode global menyebarkan route dinamis ke semua region VPC.' },
            { kind: 'quiz', q: 'Subnet /24 hampir penuh dan tidak boleh ada downtime. Langkahnya?', options: ['Buat ulang subnet dengan /22', 'gcloud compute networks subnets expand-ip-range … --prefix-length=22', 'Tambah rentang sekunder lalu pindahkan VM', 'Ubah VPC ke auto mode'], answer: 1, explain: 'Subnet bisa diperbesar di tempat tanpa downtime (tapi tidak bisa diperkecil).' }
          ]
        }
      ]
    }
  ]
};
