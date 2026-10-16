/**
 * Network lab scenarios. Each builds a starting topology and lists goals:
 * probes that must succeed or must be blocked, plus a few design checks
 * (least privilege, no external IPs). A scenario is solved when every goal
 * holds at once — like a Packet Tracer activity's completion check.
 */
import type { LabMeta } from '../types';
import type { Endpoint, Probe } from './engine';
import { probe } from './engine';
import {
  emptyTopology,
  defaultNetwork,
  fwRule,
  makeSubnet,
  makeVm,
  makeVpc,
  uid,
  vmByName,
  type Proto,
  type Topology,
  type Vpc
} from './model';

/** An endpoint named the way a goal is written: `vm:web-1`, `lb:web-lb`, `internet`… */
export type EndpointRef = string;

export interface ProbeGoal {
  kind: 'probe';
  from: EndpointRef;
  to: EndpointRef;
  proto: Proto;
  port: number;
  /** true: must connect. false: must be blocked. */
  expect: boolean;
}

export interface CheckGoal {
  kind: 'check';
  label: string;
  test: (t: Topology) => boolean;
}

export type NetGoal = ProbeGoal | CheckGoal;

export interface NetScenario extends LabMeta {
  story: string;
  build: () => Topology;
  goals: NetGoal[];
  hints: string[];
  /** The takeaway shown once solved. */
  lesson: string;
}

export function resolveRef(t: Topology, ref: EndpointRef): Endpoint | null {
  const [kind, name] = ref.split(':');
  if (kind === 'vm') {
    const vm = vmByName(t, name);
    return vm ? { kind: 'vm', id: vm.id } : null;
  }
  if (kind === 'lb') {
    const lb = t.lbs.find((l) => l.name === name);
    return lb ? { kind: 'lb', id: lb.id } : null;
  }
  if (kind === 'internet' || kind === 'google' || kind === 'onprem' || kind === 'iap') return { kind };
  return null;
}

export function refLabel(ref: EndpointRef): string {
  const [kind, name] = ref.split(':');
  return name ?? { internet: 'Internet', google: 'Google APIs', onprem: 'On-prem', iap: 'IAP' }[kind] ?? kind;
}

export function goalLabel(g: NetGoal): string {
  if (g.kind === 'check') return g.label;
  const svc = g.proto === 'icmp' ? 'ping' : `${g.proto}:${g.port}`;
  return `${refLabel(g.from)} → ${refLabel(g.to)} ${svc} ${g.expect ? 'harus TERSAMBUNG' : 'harus DIBLOKIR'}`;
}

export interface GoalResult {
  goal: NetGoal;
  pass: boolean;
  /** The probe the goal ran, so the UI can replay it. */
  probe?: Probe;
  note: string;
}

export function checkGoal(t: Topology, g: NetGoal): GoalResult {
  if (g.kind === 'check') {
    const pass = g.test(t);
    return { goal: g, pass, note: pass ? 'Terpenuhi.' : 'Belum terpenuhi.' };
  }
  const from = resolveRef(t, g.from);
  const to = resolveRef(t, g.to);
  if (!from || !to) return { goal: g, pass: false, note: `${!from ? refLabel(g.from) : refLabel(g.to)} tidak ada di topologi.` };
  const p: Probe = { from, to, proto: g.proto, port: g.port };
  const r = probe(t, p);
  const pass = r.ok === g.expect;
  return {
    goal: g,
    pass,
    probe: p,
    note: pass ? (g.expect ? 'Tersambung.' : 'Diblokir, sesuai harapan.') : g.expect ? r.summary : 'Masih tersambung — seharusnya diblokir.'
  };
}

// ── helpers for writing scenarios ────────────────────────────────────────

const go = (from: string, to: string, port: number, expect = true, proto: Proto = 'tcp'): ProbeGoal => ({
  kind: 'probe',
  from,
  to,
  proto,
  port,
  expect
});

function net(t: Topology, name: string, subnets: [name: string, region: string, cidr: string][]): Vpc {
  const v = makeVpc(name, 'custom');
  for (const [n, r, c] of subnets) v.subnets.push(makeSubnet(n, r, c));
  t.vpcs.push(v);
  return v;
}

function vm(
  t: Topology,
  vpc: Vpc,
  subnet: string,
  name: string,
  o: { external?: boolean; tags?: string[]; listens?: string[]; sa?: string } = {}
) {
  const sn = vpc.subnets.find((s) => s.name === subnet)!;
  const v = makeVm(t, { name, vpc, subnet: sn, external: o.external, tags: o.tags, listens: o.listens, serviceAccount: o.sa });
  t.vms.push(v);
  return v;
}

const noExternal = (...names: string[]) => (t: Topology) => names.every((n) => !vmByName(t, n)?.externalIp);
const opensToWorld = (t: Topology, port: number) =>
  t.vpcs.some((v) =>
    v.firewall.some(
      (r) =>
        !r.disabled &&
        r.direction === 'INGRESS' &&
        r.action === 'allow' &&
        (r.sourceRanges.includes('0.0.0.0/0') || (!r.sourceRanges.length && !r.sourceTags.length && !r.sourceServiceAccounts.length)) &&
        r.rules.some((s) => s.proto === 'all' || (s.proto === 'tcp' && (!s.ports.length || s.ports.some(([lo, hi]) => port >= lo && port <= hi))))
    )
  );

// ── scenarios ────────────────────────────────────────────────────────────

export const NET_SCENARIOS: NetScenario[] = [
  {
    id: 'web-open',
    title: 'Buka web server ke internet',
    level: 'Dasar',
    summary: 'VM sudah jalan dan punya external IP, tapi website tidak bisa dibuka.',
    topics: ['Firewall', 'Network tags', 'Implied rules'],
    story:
      'Tim kamu baru membuat VPC custom "prod-vpc" dan VM web-1 dengan Nginx di port 80. VM punya external IP, tapi browser time-out. VPC custom tidak membawa rule apa pun selain dua implied rule.',
    build() {
      const t = emptyTopology();
      const v = net(t, 'prod-vpc', [['web-subnet', 'asia-southeast2', '10.10.1.0/24']]);
      vm(t, v, 'web-subnet', 'web-1', { external: true, listens: ['tcp:80', 'tcp:22'] });
      return t;
    },
    goals: [
      go('internet', 'vm:web-1', 80),
      go('internet', 'vm:web-1', 22, false),
      {
        kind: 'check',
        label: 'Rule HTTP hanya mengenai VM bertag (pakai target tag, bukan "semua instance")',
        test: (t) =>
          t.vpcs.some((v) =>
            v.firewall.some(
              (r) =>
                r.direction === 'INGRESS' &&
                r.action === 'allow' &&
                r.targetTags.length > 0 &&
                r.rules.some((s) => s.proto === 'tcp' && s.ports.some(([lo, hi]) => 80 >= lo && 80 <= hi))
            )
          )
      }
    ],
    hints: [
      'Klik web-1 dan tambahkan network tag, misalnya http-server.',
      'Di prod-vpc, tambahkan firewall rule: INGRESS, allow, tcp:80, source 0.0.0.0/0, target tag http-server.',
      'Jangan buka tcp:22 ke internet — goal kedua minta SSH tetap tertutup.'
    ],
    lesson:
      'Ingress ditolak secara default (implied deny ingress, priority 65535). Membuka port = membuat rule allow. Network tag membuat rule hanya berlaku untuk VM tertentu — ini cara yang diharapkan di soal ujian.'
  },
  {
    id: 'three-tier',
    title: 'Tiga tier: web → app → db',
    level: 'Dasar',
    summary: 'Izinkan hanya jalur yang perlu: web ke app, app ke database.',
    topics: ['Source tags', 'Least privilege', 'Firewall'],
    story:
      'Aplikasi tiga lapis di satu VPC. Internet sudah bisa ke web-1. Sekarang web-1 harus bisa memanggil app-1 di 8080, dan hanya app-1 yang boleh ke database PostgreSQL di db-1.',
    build() {
      const t = emptyTopology();
      const v = net(t, 'shop-vpc', [
        ['web', 'asia-southeast2', '10.20.1.0/24'],
        ['app', 'asia-southeast2', '10.20.2.0/24'],
        ['db', 'asia-southeast2', '10.20.3.0/24']
      ]);
      vm(t, v, 'web', 'web-1', { external: true, tags: ['web'], listens: ['tcp:80'] });
      vm(t, v, 'app', 'app-1', { tags: ['app'], listens: ['tcp:8080'] });
      vm(t, v, 'db', 'db-1', { tags: ['db'], listens: ['tcp:5432'] });
      v.firewall.push(fwRule({ name: 'allow-http', sourceRanges: ['0.0.0.0/0'], targetTags: ['web'], rules: [{ proto: 'tcp', ports: [[80, 80]] }] }));
      return t;
    },
    goals: [
      go('internet', 'vm:web-1', 80),
      go('vm:web-1', 'vm:app-1', 8080),
      go('vm:app-1', 'vm:db-1', 5432),
      go('vm:web-1', 'vm:db-1', 5432, false),
      go('internet', 'vm:app-1', 8080, false)
    ],
    hints: [
      'Rule ingress: allow tcp:8080, source tag web, target tag app.',
      'Rule ingress: allow tcp:5432, source tag app, target tag db.',
      'Hindari rule "allow semua internal" — web-1 → db-1 harus tetap diblokir.'
    ],
    lesson:
      'Source tags/service accounts membuat rule mengikuti identitas VM, bukan IP. Itu pola least privilege yang paling sering muncul: setiap tier hanya menerima dari tier di depannya.'
  },
  {
    id: 'cloud-nat',
    title: 'VM private perlu update OS',
    level: 'Dasar',
    summary: 'VM tanpa external IP harus bisa apt-get, tapi tidak boleh bisa diakses dari luar.',
    topics: ['Cloud NAT', 'Cloud Router', 'External IP'],
    story:
      'Kebijakan keamanan: VM worker tidak boleh punya external IP. Tapi worker-1 perlu download paket dari internet (tcp:443). Cari solusi yang tetap mencegah koneksi masuk dari internet.',
    build() {
      const t = emptyTopology();
      const v = net(t, 'batch-vpc', [['workers', 'asia-southeast2', '10.30.0.0/24']]);
      vm(t, v, 'workers', 'worker-1', { listens: ['tcp:22'] });
      return t;
    },
    goals: [
      go('vm:worker-1', 'internet', 443),
      go('internet', 'vm:worker-1', 22, false),
      { kind: 'check', label: 'worker-1 tetap tanpa external IP', test: noExternal('worker-1') }
    ],
    hints: [
      'Tambahkan Cloud NAT di region asia-southeast2 untuk batch-vpc.',
      'Cloud NAT dipasang pada Cloud Router dan bersifat regional.'
    ],
    lesson:
      'Cloud NAT = keluar saja. Ia memberi akses outbound ke VM tanpa external IP dan tidak pernah menerima koneksi baru dari internet. NAT itu regional: satu per region yang punya VM private.'
  },
  {
    id: 'private-google-access',
    title: 'Baca Cloud Storage tanpa internet',
    level: 'Menengah',
    summary: 'Job batch harus membaca bucket, tapi tidak boleh punya jalur ke internet umum.',
    topics: ['Private Google Access', 'Subnet'],
    story:
      'batch-1 memproses file di Cloud Storage. Auditor menolak external IP dan juga menolak Cloud NAT karena itu membuka jalan ke internet umum. VM harus tetap bisa memanggil storage.googleapis.com.',
    build() {
      const t = emptyTopology();
      const v = net(t, 'data-vpc', [
        ['data-subnet', 'asia-southeast2', '10.40.0.0/24'],
        ['other-subnet', 'asia-southeast2', '10.40.1.0/24']
      ]);
      vm(t, v, 'data-subnet', 'batch-1');
      return t;
    },
    goals: [
      go('vm:batch-1', 'google', 443),
      go('vm:batch-1', 'internet', 443, false),
      { kind: 'check', label: 'batch-1 tanpa external IP', test: noExternal('batch-1') },
      { kind: 'check', label: 'Tidak memakai Cloud NAT', test: (t) => t.nats.length === 0 }
    ],
    hints: ['Private Google Access diaktifkan per subnet. Subnet mana yang dipakai batch-1?'],
    lesson:
      'Private Google Access (setting subnet) mengizinkan VM tanpa external IP menjangkau Google APIs seperti Cloud Storage dan BigQuery — tanpa membuka akses ke internet umum.'
  },
  {
    id: 'iap-ssh',
    title: 'SSH aman lewat IAP',
    level: 'Menengah',
    summary: 'Tutup SSH dari internet, tapi admin tetap bisa SSH dari console.',
    topics: ['Identity-Aware Proxy', 'Firewall', 'Default network'],
    story:
      'Project lama memakai network default, sehingga default-allow-ssh membuka port 22 ke seluruh internet. Admin tetap perlu SSH ke ops-1 dari tombol SSH di console (lewat IAP), tapi port 22 tidak boleh terbuka ke 0.0.0.0/0.',
    build() {
      const t = emptyTopology();
      const v = defaultNetwork(['asia-southeast2']);
      t.vpcs.push(v);
      vm(t, v, 'default', 'ops-1', { external: true, listens: ['tcp:22'] });
      return t;
    },
    goals: [
      go('iap', 'vm:ops-1', 22),
      go('internet', 'vm:ops-1', 22, false),
      { kind: 'check', label: 'Tidak ada rule yang membuka tcp:22 ke 0.0.0.0/0', test: (t) => !opensToWorld(t, 22) }
    ],
    hints: [
      'Buat rule ingress allow tcp:22 dari 35.235.240.0/20 (range IAP).',
      'Hapus atau disable default-allow-ssh. Bonus: hapus external IP ops-1 — IAP tidak membutuhkannya.'
    ],
    lesson:
      'IAP TCP forwarding menyambung dari range 35.235.240.0/20 ke IP internal VM, setelah memeriksa IAM (IAP-secured Tunnel User). Jadi VM tidak perlu external IP, dan port 22 tidak perlu dibuka ke internet.'
  },
  {
    id: 'peering-transitive',
    title: 'Peering tidak transitif',
    level: 'Menengah',
    summary: 'spoke-a dan spoke-b sama-sama peering ke hub, tapi tidak bisa saling bicara.',
    topics: ['VPC Network Peering', 'Routes'],
    story:
      'Desain hub-and-spoke: hub-vpc peering ke spoke-a dan spoke-b. Seseorang sudah mulai membuat peering spoke-a → spoke-b, tapi aplikasi di a-1 tetap tidak bisa memanggil b-1 di port 8080.',
    build() {
      const t = emptyTopology();
      const hub = net(t, 'hub-vpc', [['hub', 'asia-southeast2', '10.0.1.0/24']]);
      const a = net(t, 'spoke-a', [['a', 'asia-southeast2', '10.1.1.0/24']]);
      const b = net(t, 'spoke-b', [['b', 'asia-southeast2', '10.2.1.0/24']]);
      for (const v of [hub, a, b])
        v.firewall.push(fwRule({ name: `${v.name}-allow-internal`, sourceRanges: ['10.0.0.0/8'], rules: [{ proto: 'all', ports: [] }] }));
      vm(t, hub, 'hub', 'hub-1', { listens: ['tcp:8080'] });
      vm(t, a, 'a', 'a-1', { listens: ['tcp:8080'] });
      vm(t, b, 'b', 'b-1', { listens: ['tcp:8080'] });
      const peer = (x: Vpc, y: Vpc) =>
        t.peerings.push({ id: uid('peer'), name: `${x.name}-to-${y.name}`, vpcId: x.id, peerVpcId: y.id, exchangeCustomRoutes: false });
      peer(hub, a);
      peer(a, hub);
      peer(hub, b);
      peer(b, hub);
      peer(a, b);
      return t;
    },
    goals: [go('vm:a-1', 'vm:b-1', 8080), go('vm:b-1', 'vm:a-1', 8080), go('vm:a-1', 'vm:hub-1', 8080)],
    hints: [
      'Lihat daftar peering: spoke-a → spoke-b sudah ada, tapi sisi sebaliknya belum.',
      'Peering baru ACTIVE kalau kedua VPC membuatnya.'
    ],
    lesson:
      'VPC peering tidak transitif: A↔Hub dan Hub↔B tidak membuat A↔B. Perlu peering langsung, dan peering harus dibuat dari kedua sisi sebelum ACTIVE. Range subnet juga tidak boleh tumpang tindih.'
  },
  {
    id: 'lb-health',
    title: 'Load balancer: semua backend UNHEALTHY',
    level: 'Menengah',
    summary: 'Global external Application LB mengembalikan 502. Backend sehat, tapi health check gagal.',
    topics: ['Cloud Load Balancing', 'Health checks', 'Firewall'],
    story:
      'web-a dan web-b (tanpa external IP) melayani HTTP di port 80 dan dipasang di belakang External Application Load Balancer "web-lb". Pengguna mendapat 502. Perbaiki tanpa memberi external IP ke backend.',
    build() {
      const t = emptyTopology();
      const v = net(t, 'web-vpc', [['web', 'asia-southeast2', '10.50.0.0/24']]);
      const a = vm(t, v, 'web', 'web-a', { tags: ['web'], listens: ['tcp:80'] });
      const b = vm(t, v, 'web', 'web-b', { tags: ['web'], listens: ['tcp:80'] });
      v.firewall.push(fwRule({ name: 'allow-internal', sourceRanges: ['10.50.0.0/24'], rules: [{ proto: 'all', ports: [] }] }));
      t.lbs.push({ id: uid('lb'), name: 'web-lb', type: 'external-alb', vpcId: v.id, region: 'global', port: 80, backendPort: 80, backendVmIds: [a.id, b.id], ip: '34.120.5.10' });
      return t;
    },
    goals: [
      go('internet', 'lb:web-lb', 80),
      go('internet', 'vm:web-a', 80, false),
      { kind: 'check', label: 'Backend tetap tanpa external IP', test: noExternal('web-a', 'web-b') },
      { kind: 'check', label: 'Tidak membuka tcp:80 ke 0.0.0.0/0 (cukup range Google)', test: (t) => !opensToWorld(t, 80) }
    ],
    hints: ['Health check dan proxy Google datang dari 130.211.0.0/22 dan 35.191.0.0/16. Izinkan tcp:80 dari dua range itu ke tag web.'],
    lesson:
      'Backend load balancer harus mengizinkan range health check Google (130.211.0.0/22, 35.191.0.0/16). Untuk Application LB (proxy), trafik pengguna juga datang dari range itu, jadi backend tidak butuh external IP maupun rule 0.0.0.0/0.'
  },
  {
    id: 'deny-priority',
    title: 'Blokir satu VM dengan priority',
    level: 'Menengah',
    summary: 'Semua internal diizinkan; VM test tidak boleh menyentuh database.',
    topics: ['Firewall priority', 'Deny rule', 'Default network'],
    story:
      'Network default mengizinkan semua trafik internal (default-allow-internal). VM test-1 (tag test) sering salah konfigurasi dan menghantam db-1. Blokir test-1 ke db-1 tcp:5432 tanpa mengganggu app-1 dan tanpa menghapus default-allow-internal.',
    build() {
      const t = emptyTopology();
      const v = defaultNetwork(['asia-southeast2']);
      t.vpcs.push(v);
      vm(t, v, 'default', 'app-1', { tags: ['app'] });
      vm(t, v, 'default', 'db-1', { tags: ['db'], listens: ['tcp:5432'] });
      vm(t, v, 'default', 'test-1', { tags: ['test'] });
      return t;
    },
    goals: [
      go('vm:app-1', 'vm:db-1', 5432),
      go('vm:test-1', 'vm:db-1', 5432, false),
      { kind: 'check', label: 'default-allow-internal masih ada dan aktif', test: (t) => t.vpcs.some((v) => v.firewall.some((r) => r.name === 'default-allow-internal' && !r.disabled)) }
    ],
    hints: [
      'Buat rule ingress DENY tcp:5432, source tag test, target tag db, priority lebih kecil dari 65534 (misalnya 1000).',
      'Alternatif: rule EGRESS deny di test-1 ke IP db-1.'
    ],
    lesson:
      'Angka priority lebih kecil = lebih kuat. Rule deny di priority 1000 mengalahkan allow di 65534. Pada priority yang sama, deny menang atas allow.'
  },
  {
    id: 'hybrid-vpn',
    title: 'Hybrid: kantor ke dua region',
    level: 'Lanjut',
    summary: 'On-prem bisa ke Jakarta lewat HA VPN, tapi tidak ke Iowa.',
    topics: ['Cloud VPN', 'Cloud Router', 'Dynamic routing mode'],
    story:
      'Kantor (192.168.0.0/16) terhubung ke corp-vpc lewat HA VPN di asia-southeast2. app-jkt (Jakarta) dan report-us (us-central1) melayani HTTPS. Pengguna kantor harus bisa ke keduanya.',
    build() {
      const t = emptyTopology();
      const v = net(t, 'corp-vpc', [
        ['jkt', 'asia-southeast2', '10.60.1.0/24'],
        ['us', 'us-central1', '10.60.2.0/24']
      ]);
      vm(t, v, 'jkt', 'app-jkt', { listens: ['tcp:443'] });
      vm(t, v, 'us', 'report-us', { listens: ['tcp:443'] });
      v.firewall.push(fwRule({ name: 'allow-internal', sourceRanges: ['10.60.0.0/16'], rules: [{ proto: 'all', ports: [] }] }));
      t.vpns.push({ id: uid('vpn'), name: 'office-ha-vpn', vpcId: v.id, region: 'asia-southeast2', ha: true, remoteCidr: '192.168.0.0/16' });
      return t;
    },
    goals: [go('onprem', 'vm:app-jkt', 443), go('onprem', 'vm:report-us', 443), go('internet', 'vm:app-jkt', 443, false)],
    hints: [
      'Firewall belum mengizinkan 192.168.0.0/16.',
      'Dengan dynamic routing REGIONAL, route BGP hanya dipelajari subnet di region Cloud Router. Ubah corp-vpc ke GLOBAL.'
    ],
    lesson:
      'Cloud Router mempelajari route on-prem lewat BGP. Mode routing REGIONAL hanya berlaku untuk region router; GLOBAL membuat semua region bisa memakainya. Firewall tetap harus mengizinkan range on-prem.'
  },
  {
    id: 'sandbox',
    title: 'Sandbox bebas',
    level: 'Dasar',
    summary: 'Network default dengan dua VM. Bangun dan uji apa saja — tanpa goal.',
    topics: ['Bebas'],
    story:
      'Mulai dari project baru: network default (auto mode) dengan empat rule bawaan. Tambah VPC, subnet, VM, rule, NAT, peering, VPN atau load balancer, lalu uji koneksinya di panel simulasi.',
    build() {
      const t = emptyTopology();
      const v = defaultNetwork(['asia-southeast2', 'us-central1']);
      t.vpcs.push(v);
      vm(t, v, 'default', 'vm-1', { external: true, listens: ['tcp:22', 'tcp:80'] });
      return t;
    },
    goals: [],
    hints: ['Coba hapus default-allow-ssh lalu uji Internet → vm-1 tcp:22.'],
    lesson: ''
  }
];

export const NET_BY_ID: Record<string, NetScenario> = Object.fromEntries(NET_SCENARIOS.map((s) => [s.id, s]));
