/**
 * Every service the canvas offers: its config form (the fields the Cloud
 * Console create page asks for, with the same defaults and limits), the
 * checks Google would run on those values, and the gcloud command that would
 * create it — shown live under the form, the way Packet Tracer shows the
 * equivalent IOS commands.
 *
 * Limits follow the product docs as of late 2026 (see docs/lab.md for the
 * sources): Cloud Run CPU/memory pairs, bucket and service account naming,
 * Pub/Sub and Cloud SQL ranges, subnet sizes.
 */
import {
  DEFAULT_SA,
  PROJECT,
  REGIONS,
  REGION_LABEL,
  ZONES,
  bool,
  isPrivateRange,
  list,
  num,
  overlaps,
  parseCidr,
  regionOfZone,
  rows,
  runtimeSa,
  str,
  vpcOf,
  type CNode,
  type Doc,
  type Issue,
  type NodeType,
  type Params
} from './model';

export type Category = 'entry' | 'compute' | 'network' | 'data' | 'messaging' | 'ops';

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'entry', label: 'Titik masuk' },
  { id: 'compute', label: 'Compute' },
  { id: 'network', label: 'Jaringan' },
  { id: 'data', label: 'Data & storage' },
  { id: 'messaging', label: 'Integrasi' },
  { id: 'ops', label: 'Keamanan & DevOps' }
];

export interface Opt {
  value: string;
  label: string;
}

export interface Field {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'bool' | 'rows';
  def: unknown;
  options?: Opt[] | ((d: Doc, n: CNode) => Opt[]);
  advanced?: boolean;
  help?: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  show?: (p: Params, d: Doc, n: CNode) => boolean;
  /** Columns of a `rows` field. */
  cols?: Field[];
}

/** Values the edges hand to a node's create command (env vars, secrets…). */
export interface Wiring {
  env: Record<string, string>;
  secrets: string[];
  sql: string[];
}

export interface NodeSpec {
  type: NodeType;
  product: string;
  abbr: string;
  category: Category;
  /** What it is for, in one line — also the palette tooltip. */
  blurb: string;
  prefix: string;
  inputs: boolean;
  outputs: boolean;
  nameRule?: { re: RegExp; msg: string };
  fixedName?: boolean;
  fields: Field[];
  validate?: (n: CNode, d: Doc) => Issue[];
  gcloud: (n: CNode, d: Doc, w: Wiring) => string[];
  /** Label of the test action when a test starts here. */
  entry?: string;
  /** Runs code under a service account. */
  runtime?: boolean;
  /** Where it lives, for location checks. */
  location?: (n: CNode) => string;
}

const opts = (values: string[], labels?: Record<string, string>): Opt[] => values.map((v) => ({ value: v, label: labels?.[v] ?? v }));
const REGION_OPTS = opts(REGIONS, REGION_LABEL);
const ZONE_OPTS = opts(ZONES);
const MULTI = ['US', 'EU', 'ASIA'];

const err = (msg: string, field?: string): Issue => ({ level: 'error', msg, field });
const warn = (msg: string, field?: string): Issue => ({ level: 'warn', msg, field });
const info = (msg: string, field?: string): Issue => ({ level: 'info', msg, field });

const RFC1035 = { re: /^[a-z]([-a-z0-9]{0,61}[a-z0-9])?$/, msg: "Nama harus cocok dengan regex '(?:[a-z](?:[-a-z0-9]{0,61}[a-z0-9])?)': huruf kecil, angka dan tanda hubung, diawali huruf, maks. 63 karakter." };

const saFlag = (d: Doc, n: CNode) => {
  const sa = runtimeSa(d, n);
  return sa.isDefault ? '' : ` --service-account=${sa.email}`;
};

const envFlag = (w: Wiring) => {
  const pairs = Object.entries(w.env);
  return pairs.length ? ` --set-env-vars=${pairs.map(([k, v]) => `${k}=${v}`).join(',')}` : '';
};

const MACHINES = ['e2-micro', 'e2-small', 'e2-medium', 'e2-standard-2', 'e2-standard-4', 'n2-standard-2', 'n2-standard-4', 'n2-highmem-4', 'c3-standard-4', 't2d-standard-2'];
const IMAGES: Record<string, [string, string]> = {
  'debian-12': ['debian-12', 'debian-cloud'],
  'ubuntu-2404': ['ubuntu-2404-lts-amd64', 'ubuntu-os-cloud'],
  'rocky-9': ['rocky-linux-9', 'rocky-linux-cloud'],
  'windows-2022': ['windows-2022', 'windows-cloud'],
  cos: ['cos-stable', 'cos-cloud']
};
const IMAGE_LABEL: Record<string, string> = { 'debian-12': 'Debian 12', 'ubuntu-2404': 'Ubuntu 24.04 LTS', 'rocky-9': 'Rocky Linux 9', 'windows-2022': 'Windows Server 2022', cos: 'Container-Optimized OS' };

/** Cloud Run: the memory each CPU size allows (docs: memory limits per vCPU). */
const RUN_MEM: Record<string, [number, number]> = { '1': [0.5, 4], '2': [0.5, 8], '4': [2, 16], '6': [4, 24], '8': [4, 32] };
const memGi = (m: string) => (m.endsWith('Mi') ? Number(m.slice(0, -2)) / 1024 : Number(m.replace(/Gi$/, '')));

const SERVERLESS_COMMON: Field[] = [
  { key: 'region', label: 'Region', type: 'select', def: 'us-central1', options: REGION_OPTS },
  { key: 'allowUnauth', label: 'Izinkan akses tanpa autentikasi (publik)', type: 'bool', def: false, help: 'Mati: pemanggil butuh roles/run.invoker dan mengirim ID token.' }
];

const ingressField: Field = {
  key: 'ingress',
  label: 'Ingress',
  type: 'select',
  def: 'all',
  options: [
    { value: 'all', label: 'All — internet boleh langsung' },
    { value: 'internal', label: 'Internal — hanya dari VPC & layanan Google di project' },
    { value: 'internal-and-cloud-load-balancing', label: 'Internal + Cloud Load Balancing' }
  ]
};

export const SPECS: Record<NodeType, NodeSpec> = {
  internet: {
    type: 'internet',
    product: 'Pengguna internet',
    abbr: 'WWW',
    category: 'entry',
    blurb: 'Pengguna atau klien di internet. Sumber request HTTP — dan tujuan untuk trafik keluar dari VM/Cloud Run.',
    prefix: 'Internet',
    inputs: true,
    outputs: true,
    fixedName: true,
    fields: [{ key: 'path', label: 'Path request uji', type: 'text', def: '/', placeholder: '/' }],
    gcloud: () => ['# Bukan resource Google Cloud — titik awal request uji.'],
    entry: 'Kirim request HTTP'
  },

  scheduler: {
    type: 'scheduler',
    product: 'Cloud Scheduler',
    abbr: 'CRON',
    category: 'entry',
    blurb: 'Cron terkelola: memanggil HTTP (Cloud Run, functions) atau mem-publish ke Pub/Sub sesuai jadwal.',
    prefix: 'nightly',
    inputs: false,
    outputs: true,
    nameRule: { re: /^[A-Za-z0-9_-]{1,500}$/, msg: 'Nama job hanya huruf, angka, tanda hubung dan garis bawah.' },
    fields: [
      { key: 'region', label: 'Region', type: 'select', def: 'us-central1', options: REGION_OPTS },
      { key: 'schedule', label: 'Frekuensi (unix-cron)', type: 'text', def: '0 2 * * *', help: 'menit jam tanggal bulan hari — mis. "*/15 * * * *" tiap 15 menit.' },
      { key: 'tz', label: 'Zona waktu', type: 'select', def: 'Etc/UTC', options: opts(['Etc/UTC', 'Asia/Jakarta', 'America/New_York', 'Europe/Brussels']) },
      { key: 'retries', label: 'Jumlah retry', type: 'number', def: 0, min: 0, max: 5, advanced: true }
    ],
    validate: (n) => {
      const out: Issue[] = [];
      const parts = str(n.params, 'schedule').trim().split(/\s+/);
      const field = /^(\*|\d+(-\d+)?)(\/\d+)?(,(\d+(-\d+)?)(\/\d+)?)*$|^[A-Za-z]{3}$/;
      if (parts.length !== 5 || parts.some((p) => !field.test(p))) out.push(err('Jadwal harus 5 kolom unix-cron: menit jam tanggal bulan hari, mis. "0 2 * * *".', 'schedule'));
      if (str(n.params, 'tz') !== 'Etc/UTC') out.push(info('Zona waktu selain UTC bisa membuat job loncat/terulang saat pergantian daylight saving.', 'tz'));
      return out;
    },
    gcloud: (n) => [`# Job ${n.name}: perintahnya dibuat per tujuan (lihat koneksi).`],
    entry: 'Jalankan job sekarang',
    location: (n) => str(n.params, 'region')
  },

  lb: {
    type: 'lb',
    product: 'External Application Load Balancer',
    abbr: 'LB',
    category: 'network',
    blurb: 'Load balancer HTTP(S) Layer 7: satu IP anycast, URL map ke backend (MIG, Cloud Run lewat serverless NEG, backend bucket), plus Cloud CDN, Cloud Armor dan IAP.',
    prefix: 'web-lb',
    inputs: true,
    outputs: true,
    nameRule: RFC1035,
    fields: [
      {
        key: 'scheme',
        label: 'Jenis',
        type: 'select',
        def: 'global',
        options: [
          { value: 'global', label: 'Global external (EXTERNAL_MANAGED)' },
          { value: 'classic', label: 'Classic (EXTERNAL)' },
          { value: 'regional', label: 'Regional external' }
        ]
      },
      { key: 'region', label: 'Region', type: 'select', def: 'us-central1', options: REGION_OPTS, show: (p) => p.scheme === 'regional' },
      { key: 'protocol', label: 'Protokol frontend', type: 'select', def: 'HTTP', options: opts(['HTTP', 'HTTPS']) },
      { key: 'domain', label: 'Domain (sertifikat Google-managed)', type: 'text', def: '', placeholder: 'www.example.com', show: (p) => p.protocol === 'HTTPS' },
      { key: 'staticIp', label: 'Pakai IP statis', type: 'bool', def: true },
      { key: 'cdn', label: 'Cloud CDN', type: 'bool', def: false, advanced: true },
      { key: 'armor', label: 'Cloud Armor (security policy)', type: 'bool', def: false, advanced: true },
      { key: 'iap', label: 'Identity-Aware Proxy', type: 'bool', def: false, advanced: true }
    ],
    validate: (n, d) => {
      const out: Issue[] = [];
      const p = n.params;
      if (p.protocol === 'HTTPS' && !/^([a-z0-9-]+\.)+[a-z]{2,}$/.test(str(p, 'domain'))) out.push(err('HTTPS butuh domain untuk sertifikat Google-managed.', 'domain'));
      if (bool(p, 'iap') && bool(p, 'cdn')) out.push(err('IAP dan Cloud CDN tidak bisa aktif di backend service yang sama.', 'iap'));
      if (p.scheme === 'regional' && bool(p, 'cdn')) out.push(err('Cloud CDN hanya untuk Application LB global/classic.', 'cdn'));
      if (!d.edges.some((e) => e.from === n.id)) out.push(warn('Belum ada backend — tarik koneksi dari LB ke MIG, Cloud Run, functions atau bucket.'));
      if (p.protocol === 'HTTP') out.push(info('Trafik HTTP tidak terenkripsi; untuk produksi pakai HTTPS.', 'protocol'));
      return out;
    },
    gcloud: (n) => {
      const g = n.params.scheme === 'regional' ? `--region=${str(n.params, 'region')}` : '--global';
      const out: string[] = [];
      if (bool(n.params, 'staticIp')) out.push(`gcloud compute addresses create ${n.name}-ip ${g}${n.params.scheme === 'regional' ? '' : ' --ip-version=IPV4'}`);
      out.push(`gcloud compute url-maps create ${n.name}-map --default-service=${n.name}-backend ${g}`);
      if (n.params.protocol === 'HTTPS') {
        out.push(`gcloud compute ssl-certificates create ${n.name}-cert --domains=${str(n.params, 'domain') || 'DOMAIN'} ${g}`);
        out.push(`gcloud compute target-https-proxies create ${n.name}-proxy --url-map=${n.name}-map --ssl-certificates=${n.name}-cert ${g}`);
      } else out.push(`gcloud compute target-http-proxies create ${n.name}-proxy --url-map=${n.name}-map ${g}`);
      const scheme = n.params.scheme === 'classic' ? 'EXTERNAL' : 'EXTERNAL_MANAGED';
      out.push(
        `gcloud compute forwarding-rules create ${n.name}-fr ${g} --load-balancing-scheme=${scheme} --target-${n.params.protocol === 'HTTPS' ? 'https' : 'http'}-proxy=${n.name}-proxy --ports=${n.params.protocol === 'HTTPS' ? 443 : 80}${bool(n.params, 'staticIp') ? ` --address=${n.name}-ip` : ''}`
      );
      return out;
    },
    location: (n) => (n.params.scheme === 'regional' ? str(n.params, 'region') : 'global')
  },

  run: {
    type: 'run',
    product: 'Cloud Run service',
    abbr: 'RUN',
    category: 'compute',
    blurb: 'Container stateless tanpa server: melayani HTTP, skala otomatis sampai nol, bayar per pemakaian.',
    prefix: 'api',
    inputs: true,
    outputs: true,
    runtime: true,
    nameRule: { re: /^[a-z]([-a-z0-9]{0,47}[a-z0-9])?$/, msg: 'Nama service: huruf kecil, angka dan tanda hubung, diawali huruf, tidak diakhiri tanda hubung, kurang dari 50 karakter.' },
    fields: [
      ...SERVERLESS_COMMON,
      { key: 'image', label: 'Container image', type: 'text', def: 'us-docker.pkg.dev/cloudrun/container/hello', placeholder: 'REGION-docker.pkg.dev/PROJECT/REPO/IMAGE:TAG' },
      ingressField,
      { key: 'port', label: 'Container port', type: 'number', def: 8080, min: 1, max: 65535, advanced: true },
      { key: 'cpu', label: 'CPU', type: 'select', def: '1', options: opts(['1', '2', '4', '6', '8']), advanced: true },
      { key: 'memory', label: 'Memori', type: 'select', def: '512Mi', options: opts(['512Mi', '1Gi', '2Gi', '4Gi', '8Gi', '16Gi', '24Gi', '32Gi']), advanced: true },
      { key: 'concurrency', label: 'Concurrency maksimum', type: 'number', def: 80, min: 1, max: 1000, advanced: true },
      { key: 'timeout', label: 'Request timeout', type: 'number', def: 300, min: 1, max: 3600, unit: 'detik', advanced: true },
      { key: 'minInstances', label: 'Instance minimum', type: 'number', def: 0, min: 0, max: 1000, advanced: true },
      { key: 'maxInstances', label: 'Instance maksimum', type: 'number', def: 100, min: 1, max: 1000, advanced: true },
      {
        key: 'billing',
        label: 'Billing',
        type: 'select',
        def: 'request',
        options: [
          { value: 'request', label: 'Request-based (CPU hanya saat melayani request)' },
          { value: 'instance', label: 'Instance-based (CPU selalu dialokasikan)' }
        ],
        advanced: true
      },
      {
        key: 'egress',
        label: 'VPC egress',
        type: 'select',
        def: 'private-ranges-only',
        options: [
          { value: 'private-ranges-only', label: 'Hanya rentang privat lewat VPC' },
          { value: 'all-traffic', label: 'Semua trafik lewat VPC' }
        ],
        advanced: true,
        help: 'Berlaku saat service dihubungkan ke VPC (Direct VPC egress).'
      }
    ],
    validate: (n, d) => {
      const out: Issue[] = [];
      const p = n.params;
      const cpu = str(p, 'cpu', '1');
      const mem = memGi(str(p, 'memory', '512Mi'));
      const [lo, hi] = RUN_MEM[cpu] ?? [0.5, 4];
      if (mem < lo || mem > hi)
        out.push(err(`Invalid value specified for memory. For ${Number(cpu).toFixed(1)} CPU, memory must be between ${lo < 1 ? `${lo * 1024}Mi` : `${lo}Gi`} and ${hi}Gi inclusive.`, 'memory'));
      if (num(p, 'concurrency', 80) < 1 || num(p, 'concurrency', 80) > 1000) out.push(err('Concurrency 1–1000.', 'concurrency'));
      if (num(p, 'timeout', 300) < 1 || num(p, 'timeout', 300) > 3600) out.push(err('Timeout request maksimal 3600 detik (60 menit).', 'timeout'));
      if (num(p, 'minInstances') > num(p, 'maxInstances', 100)) out.push(err('Instance minimum tidak boleh lebih besar dari maksimum.', 'minInstances'));
      if (num(p, 'minInstances') > 0) out.push(info('Instance minimum > 0 mengurangi cold start, tapi ditagih walau idle.', 'minInstances'));
      const img = str(p, 'image');
      if (/^(\w+\.)?gcr\.io\//.test(img)) out.push(warn('Container Registry (gcr.io) sudah ditutup untuk penulisan sejak 18 Maret 2025 — simpan image di Artifact Registry (REGION-docker.pkg.dev).', 'image'));
      else if (!/^[a-z0-9.-]+(:\d+)?\/[a-z0-9._/-]+(:[\w.-]+|@sha256:[a-f0-9]+)?$/.test(img)) out.push(err('Format image tidak valid. Contoh: us-central1-docker.pkg.dev/ace-lab-123/apps/api:v1', 'image'));
      if (bool(p, 'allowUnauth') && p.ingress === 'all') out.push(info('Service publik dan ingress all: siapa pun di internet bisa memanggilnya langsung.'));
      if (runtimeSa(d, n).isDefault) out.push(warn('Memakai default compute service account. Least privilege: buat service account khusus dan hubungkan ke service ini.'));
      return out;
    },
    gcloud: (n, d, w) => {
      const p = n.params;
      const vpc = vpcOf(d, n);
      const subnet = vpc ? rows(vpc.params, 'subnets').find((s) => s.region === p.region) : undefined;
      let c = `gcloud run deploy ${n.name} --image=${str(p, 'image')} --region=${str(p, 'region')}`;
      c += bool(p, 'allowUnauth') ? ' --allow-unauthenticated' : ' --no-allow-unauthenticated';
      if (p.ingress !== 'all') c += ` --ingress=${str(p, 'ingress')}`;
      c += saFlag(d, n);
      if (str(p, 'cpu', '1') !== '1') c += ` --cpu=${str(p, 'cpu')}`;
      if (str(p, 'memory', '512Mi') !== '512Mi') c += ` --memory=${str(p, 'memory')}`;
      if (num(p, 'concurrency', 80) !== 80) c += ` --concurrency=${num(p, 'concurrency', 80)}`;
      if (num(p, 'timeout', 300) !== 300) c += ` --timeout=${num(p, 'timeout', 300)}`;
      if (num(p, 'minInstances')) c += ` --min-instances=${num(p, 'minInstances')}`;
      if (num(p, 'maxInstances', 100) !== 100) c += ` --max-instances=${num(p, 'maxInstances', 100)}`;
      if (p.billing === 'instance') c += ' --no-cpu-throttling';
      if (num(p, 'port', 8080) !== 8080) c += ` --port=${num(p, 'port', 8080)}`;
      if (vpc) c += ` --network=${vpc.name}${subnet ? ` --subnet=${String(subnet.name)}` : ''} --vpc-egress=${str(p, 'egress', 'private-ranges-only')}`;
      if (w.sql.length) c += ` --add-cloudsql-instances=${w.sql.join(',')}`;
      if (w.secrets.length) c += ` --set-secrets=${w.secrets.join(',')}`;
      c += envFlag(w);
      return [c];
    },
    location: (n) => str(n.params, 'region')
  },

  fn: {
    type: 'fn',
    product: 'Cloud Run functions',
    abbr: 'FN',
    category: 'compute',
    blurb: 'Potongan kode yang dipicu HTTP atau event (file baru di bucket, pesan Pub/Sub). Dulu bernama Cloud Functions (2nd gen).',
    prefix: 'on-event',
    inputs: true,
    outputs: true,
    runtime: true,
    nameRule: { re: /^[a-z]([-a-z0-9]{0,61}[a-z0-9])?$/, msg: 'Nama function: huruf kecil, angka dan tanda hubung, diawali huruf, maks. 63 karakter.' },
    fields: [
      ...SERVERLESS_COMMON,
      { key: 'runtime', label: 'Runtime', type: 'select', def: 'python312', options: opts(['python313', 'python312', 'nodejs22', 'nodejs20', 'go123', 'java21', 'dotnet8', 'ruby33', 'php83']) },
      { key: 'entryPoint', label: 'Entry point', type: 'text', def: 'main' },
      { key: 'memory', label: 'Memori', type: 'select', def: '256Mi', options: opts(['256Mi', '512Mi', '1Gi', '2Gi', '4Gi', '8Gi', '16Gi']), advanced: true },
      { key: 'timeout', label: 'Timeout', type: 'number', def: 60, min: 1, max: 3600, unit: 'detik', advanced: true },
      { key: 'maxInstances', label: 'Instance maksimum', type: 'number', def: 100, min: 1, max: 1000, advanced: true },
      { key: 'retry', label: 'Retry saat gagal (event)', type: 'bool', def: false, advanced: true }
    ],
    validate: (n, d) => {
      const out: Issue[] = [];
      const event = d.edges.some((e) => e.to === n.id && ['gcs', 'topic'].includes(d.nodes.find((x) => x.id === e.from)?.type ?? ''));
      if (event && num(n.params, 'timeout', 60) > 540) out.push(err('Function yang dipicu event dibatasi 540 detik (9 menit); hanya HTTP yang boleh sampai 3600.', 'timeout'));
      if (!str(n.params, 'entryPoint').trim()) out.push(err('Entry point wajib diisi — nama fungsi di kode.', 'entryPoint'));
      if (runtimeSa(d, n).isDefault) out.push(warn('Memakai default compute service account. Hubungkan service account khusus.'));
      return out;
    },
    gcloud: (n, d, w) => {
      const p = n.params;
      const src = d.edges.filter((e) => e.to === n.id).map((e) => d.nodes.find((x) => x.id === e.from)!).filter(Boolean);
      const bucket = src.find((s) => s.type === 'gcs');
      const topic = src.find((s) => s.type === 'topic');
      let c = `gcloud functions deploy ${n.name} --gen2 --runtime=${str(p, 'runtime')} --region=${str(p, 'region')} --source=. --entry-point=${str(p, 'entryPoint')}`;
      c += bucket ? ` --trigger-bucket=${bucket.name}` : topic ? ` --trigger-topic=${topic.name}` : ' --trigger-http';
      if (!bucket && !topic) c += bool(p, 'allowUnauth') ? ' --allow-unauthenticated' : ' --no-allow-unauthenticated';
      if (str(p, 'memory', '256Mi') !== '256Mi') c += ` --memory=${str(p, 'memory')}`;
      if (num(p, 'timeout', 60) !== 60) c += ` --timeout=${num(p, 'timeout', 60)}s`;
      if (bool(p, 'retry')) c += ' --retry';
      c += saFlag(d, n);
      if (w.secrets.length) c += ` --set-secrets=${w.secrets.join(',')}`;
      c += envFlag(w);
      return [c];
    },
    location: (n) => str(n.params, 'region')
  },

  gce: {
    type: 'gce',
    product: 'Compute Engine VM',
    abbr: 'VM',
    category: 'compute',
    blurb: 'Mesin virtual penuh: kontrol OS, software lama, lisensi khusus. Kamu yang mengurus patch dan skalanya.',
    prefix: 'vm',
    inputs: true,
    outputs: true,
    runtime: true,
    nameRule: RFC1035,
    fields: [
      { key: 'zone', label: 'Zone', type: 'select', def: 'us-central1-a', options: ZONE_OPTS },
      { key: 'machine', label: 'Machine type', type: 'select', def: 'e2-medium', options: opts(MACHINES) },
      { key: 'image', label: 'Image', type: 'select', def: 'debian-12', options: opts(Object.keys(IMAGES), IMAGE_LABEL) },
      { key: 'disk', label: 'Ukuran boot disk', type: 'number', def: 10, min: 10, max: 65536, unit: 'GB' },
      {
        key: 'ip',
        label: 'IP eksternal',
        type: 'select',
        def: 'ephemeral',
        options: [
          { value: 'ephemeral', label: 'Ephemeral' },
          { value: 'static', label: 'Statis (dipesan)' },
          { value: 'none', label: 'Tidak ada' }
        ]
      },
      { key: 'tags', label: 'Network tags', type: 'text', def: '', placeholder: 'web, ssh' },
      { key: 'port', label: 'Port aplikasi', type: 'number', def: 80, min: 1, max: 65535, help: 'Port yang didengarkan aplikasi di VM, untuk request uji.' },
      { key: 'spot', label: 'Spot VM', type: 'bool', def: false, advanced: true },
      {
        key: 'scopes',
        label: 'Access scopes',
        type: 'select',
        def: 'default',
        options: [
          { value: 'default', label: 'Default (Storage read-only, Logging, Monitoring)' },
          { value: 'cloud-platform', label: 'Akses penuh ke Cloud API (cloud-platform)' }
        ],
        advanced: true,
        help: 'Dianjurkan: cloud-platform, lalu batasi akses lewat role IAM service account.'
      }
    ],
    validate: (n, d) => {
      const out: Issue[] = [];
      const img = str(n.params, 'image');
      if (img === 'windows-2022' && num(n.params, 'disk', 10) < 50) out.push(err('Image Windows Server butuh boot disk minimal 50 GB.', 'disk'));
      if (num(n.params, 'disk', 10) < 10) out.push(err('Boot disk minimal 10 GB.', 'disk'));
      if (bool(n.params, 'spot')) out.push(info('Spot VM bisa dihentikan kapan saja dengan pemberitahuan 30 detik.', 'spot'));
      if (runtimeSa(d, n).isDefault) out.push(warn('Memakai default compute service account. Hubungkan service account khusus.'));
      return out;
    },
    gcloud: (n, d) => {
      const p = n.params;
      const [family, project] = IMAGES[str(p, 'image', 'debian-12')];
      const vpc = vpcOf(d, n);
      const subnet = vpc ? rows(vpc.params, 'subnets').find((s) => s.region === regionOfZone(str(p, 'zone'))) : undefined;
      const out: string[] = [];
      if (p.ip === 'static') out.push(`gcloud compute addresses create ${n.name}-ip --region=${regionOfZone(str(p, 'zone'))}`);
      let c = `gcloud compute instances create ${n.name} --zone=${str(p, 'zone')} --machine-type=${str(p, 'machine')} --image-family=${family} --image-project=${project}`;
      if (num(p, 'disk', 10) !== 10) c += ` --boot-disk-size=${num(p, 'disk', 10)}GB`;
      if (vpc) c += ` --network=${vpc.name}${subnet ? ` --subnet=${String(subnet.name)}` : ''}`;
      if (p.ip === 'none') c += ' --no-address';
      if (p.ip === 'static') c += ` --address=${n.name}-ip`;
      if (list(p, 'tags').length) c += ` --tags=${list(p, 'tags').join(',')}`;
      if (bool(p, 'spot')) c += ' --provisioning-model=SPOT';
      c += saFlag(d, n);
      if (p.scopes === 'cloud-platform') c += ' --scopes=cloud-platform';
      out.push(c);
      return out;
    },
    location: (n) => regionOfZone(str(n.params, 'zone'))
  },

  mig: {
    type: 'mig',
    product: 'Managed instance group',
    abbr: 'MIG',
    category: 'compute',
    blurb: 'Sekelompok VM identik dari instance template: autoscaling, autohealing, rolling update. Backend klasik untuk load balancer.',
    prefix: 'web-mig',
    inputs: true,
    outputs: true,
    runtime: true,
    nameRule: RFC1035,
    fields: [
      { key: 'regional', label: 'Regional (sebar ke beberapa zone)', type: 'bool', def: true },
      { key: 'region', label: 'Region', type: 'select', def: 'us-central1', options: REGION_OPTS, show: (p) => p.regional === true },
      { key: 'zone', label: 'Zone', type: 'select', def: 'us-central1-a', options: ZONE_OPTS, show: (p) => p.regional !== true },
      { key: 'machine', label: 'Machine type (template)', type: 'select', def: 'e2-medium', options: opts(MACHINES) },
      { key: 'image', label: 'Image (template)', type: 'select', def: 'debian-12', options: opts(Object.keys(IMAGES), IMAGE_LABEL) },
      { key: 'min', label: 'Jumlah VM minimum', type: 'number', def: 2, min: 0, max: 1000 },
      { key: 'max', label: 'Jumlah VM maksimum', type: 'number', def: 10, min: 1, max: 1000 },
      { key: 'cpu', label: 'Target CPU autoscaler', type: 'number', def: 60, min: 1, max: 100, unit: '%' },
      { key: 'tags', label: 'Network tags', type: 'text', def: 'web' },
      { key: 'port', label: 'Port aplikasi (named port http)', type: 'number', def: 80, min: 1, max: 65535 },
      { key: 'ip', label: 'IP eksternal di tiap VM', type: 'bool', def: false, advanced: true },
      { key: 'autoheal', label: 'Autohealing dengan health check', type: 'bool', def: true, advanced: true },
      { key: 'scopes', label: 'Access scopes', type: 'select', def: 'cloud-platform', options: opts(['default', 'cloud-platform']), advanced: true }
    ],
    validate: (n, d) => {
      const out: Issue[] = [];
      if (num(n.params, 'min', 2) > num(n.params, 'max', 10)) out.push(err('Minimum tidak boleh lebih besar dari maksimum.', 'min'));
      if (!bool(n.params, 'regional')) out.push(info('MIG zonal mati bersama zone-nya. Untuk high availability pakai MIG regional.', 'regional'));
      if (runtimeSa(d, n).isDefault) out.push(warn('Memakai default compute service account. Hubungkan service account khusus.'));
      return out;
    },
    gcloud: (n, d) => {
      const p = n.params;
      const [family, project] = IMAGES[str(p, 'image', 'debian-12')];
      const loc = bool(p, 'regional') ? `--region=${str(p, 'region')}` : `--zone=${str(p, 'zone')}`;
      const vpc = vpcOf(d, n);
      const out = [
        `gcloud compute instance-templates create ${n.name}-tpl --machine-type=${str(p, 'machine')} --image-family=${family} --image-project=${project}${vpc ? ` --network=${vpc.name}` : ''}${list(p, 'tags').length ? ` --tags=${list(p, 'tags').join(',')}` : ''}${bool(p, 'ip') ? '' : ' --no-address'}${saFlag(d, n)}${p.scopes === 'cloud-platform' ? ' --scopes=cloud-platform' : ''}`
      ];
      if (bool(p, 'autoheal')) out.push(`gcloud compute health-checks create http ${n.name}-hc --port=${num(p, 'port', 80)}`);
      out.push(`gcloud compute instance-groups managed create ${n.name} --template=${n.name}-tpl --size=${num(p, 'min', 2)} ${loc}${bool(p, 'autoheal') ? ` --health-check=${n.name}-hc --initial-delay=300` : ''}`);
      out.push(`gcloud compute instance-groups managed set-autoscaling ${n.name} ${loc} --min-num-replicas=${num(p, 'min', 2)} --max-num-replicas=${num(p, 'max', 10)} --target-cpu-utilization=${(num(p, 'cpu', 60) / 100).toFixed(2).replace(/0$/, '')}`);
      out.push(`gcloud compute instance-groups set-named-ports ${n.name} --named-ports=http:${num(p, 'port', 80)} ${loc}`);
      return out;
    },
    location: (n) => (bool(n.params, 'regional') ? str(n.params, 'region') : regionOfZone(str(n.params, 'zone')))
  },

  gke: {
    type: 'gke',
    product: 'GKE cluster',
    abbr: 'GKE',
    category: 'compute',
    blurb: 'Kubernetes terkelola untuk banyak container/microservice. Autopilot: Google mengurus node; Standard: kamu yang mengatur node pool.',
    prefix: 'cluster-1',
    inputs: true,
    outputs: true,
    runtime: true,
    nameRule: { re: /^[a-z]([-a-z0-9]{0,38}[a-z0-9])?$/, msg: "Cluster name must be only lowercase alphanumerics and '-', must start with a letter and end with an alphanumeric, and must be no longer than 40 characters." },
    fields: [
      { key: 'mode', label: 'Mode', type: 'select', def: 'autopilot', options: [{ value: 'autopilot', label: 'Autopilot' }, { value: 'standard', label: 'Standard' }] },
      { key: 'location', label: 'Lokasi', type: 'select', def: 'us-central1', options: [...REGION_OPTS, ...ZONE_OPTS] },
      { key: 'nodes', label: 'Jumlah node per zone', type: 'number', def: 3, min: 1, max: 1000, show: (p) => p.mode === 'standard' },
      { key: 'machine', label: 'Machine type node', type: 'select', def: 'e2-medium', options: opts(MACHINES), show: (p) => p.mode === 'standard' },
      { key: 'channel', label: 'Release channel', type: 'select', def: 'regular', options: opts(['rapid', 'regular', 'stable', 'extended']) },
      { key: 'private', label: 'Node privat (tanpa IP eksternal)', type: 'bool', def: false, advanced: true },
      { key: 'wi', label: 'Workload Identity', type: 'bool', def: true, advanced: true }
    ],
    validate: (n) => {
      const out: Issue[] = [];
      if (n.params.mode === 'autopilot' && /-[a-z]$/.test(str(n.params, 'location'))) out.push(err('Cluster Autopilot selalu regional — pilih region, bukan zone.', 'location'));
      if (!bool(n.params, 'wi')) out.push(warn('Tanpa Workload Identity, Pod memakai service account node — sulit dibatasi per aplikasi.', 'wi'));
      return out;
    },
    gcloud: (n, d) => {
      const p = n.params;
      const loc = /-[a-z]$/.test(str(p, 'location')) ? `--zone=${str(p, 'location')}` : `--region=${str(p, 'location')}`;
      const vpc = vpcOf(d, n);
      const net = vpc ? ` --network=${vpc.name}` : '';
      if (p.mode === 'autopilot') return [`gcloud container clusters create-auto ${n.name} ${loc} --release-channel=${str(p, 'channel')}${net}${bool(p, 'private') ? ' --enable-private-nodes' : ''}`];
      return [
        `gcloud container clusters create ${n.name} ${loc} --num-nodes=${num(p, 'nodes', 3)} --machine-type=${str(p, 'machine')} --release-channel=${str(p, 'channel')}${net}${bool(p, 'private') ? ' --enable-private-nodes --enable-ip-alias --master-ipv4-cidr=172.16.0.0/28' : ''}${bool(p, 'wi') ? ` --workload-pool=${PROJECT}.svc.id.goog` : ''}${saFlag(d, n)}`
      ];
    },
    location: (n) => str(n.params, 'location').replace(/-[a-z]$/, '')
  },

  gcs: {
    type: 'gcs',
    product: 'Cloud Storage bucket',
    abbr: 'GCS',
    category: 'data',
    blurb: 'Object storage untuk file, gambar, backup dan data lake; kelas Standard, Nearline, Coldline, Archive.',
    prefix: 'ace-files-123',
    inputs: true,
    outputs: true,
    nameRule: {
      re: /^(?!goog)(?!.*google)(?!\d+\.\d+\.\d+\.\d+$)[a-z0-9][a-z0-9._-]{1,61}[a-z0-9]$/,
      msg: 'Nama bucket 3–63 karakter: huruf kecil, angka, - _ dan titik; diawali dan diakhiri huruf/angka; tidak boleh diawali "goog", memuat "google", atau berbentuk alamat IP. Nama bucket unik secara global.'
    },
    fields: [
      {
        key: 'locType',
        label: 'Tipe lokasi',
        type: 'select',
        def: 'region',
        options: [
          { value: 'region', label: 'Region' },
          { value: 'dual', label: 'Dual-region' },
          { value: 'multi', label: 'Multi-region' }
        ]
      },
      { key: 'region', label: 'Region', type: 'select', def: 'us-central1', options: REGION_OPTS, show: (p) => p.locType === 'region' },
      { key: 'multi', label: 'Multi-region', type: 'select', def: 'US', options: opts(MULTI), show: (p) => p.locType === 'multi' },
      { key: 'dual', label: 'Dual-region', type: 'select', def: 'NAM4', options: opts(['NAM4', 'EUR4', 'ASIA1']), show: (p) => p.locType === 'dual' },
      { key: 'class', label: 'Storage class default', type: 'select', def: 'STANDARD', options: opts(['STANDARD', 'NEARLINE', 'COLDLINE', 'ARCHIVE']) },
      { key: 'uniform', label: 'Uniform bucket-level access', type: 'bool', def: true },
      { key: 'pap', label: 'Public access prevention', type: 'bool', def: true },
      { key: 'public', label: 'Objek bisa dibaca publik (allUsers)', type: 'bool', def: false },
      { key: 'versioning', label: 'Object versioning', type: 'bool', def: false, advanced: true },
      { key: 'softDelete', label: 'Soft delete', type: 'number', def: 7, min: 0, max: 90, unit: 'hari', advanced: true, help: '0 = mati, atau 7–90 hari.' },
      { key: 'retention', label: 'Retention policy', type: 'number', def: 0, min: 0, max: 36500, unit: 'hari', advanced: true }
    ],
    validate: (n) => {
      const out: Issue[] = [];
      const p = n.params;
      if (bool(p, 'public') && bool(p, 'pap'))
        out.push(err('412: Public access prevention aktif, jadi binding allUsers ditolak. Matikan public access prevention atau jangan buat publik.', 'public'));
      if (bool(p, 'public') && !bool(p, 'uniform')) out.push(warn('Bucket publik tanpa uniform access: ACL per objek bisa membuka objek yang tidak dimaksud.', 'uniform'));
      const sd = num(p, 'softDelete', 7);
      if (sd !== 0 && (sd < 7 || sd > 90)) out.push(err('Soft delete harus 0 (mati) atau 7–90 hari.', 'softDelete'));
      if (p.class !== 'STANDARD') out.push(info(`${str(p, 'class')} punya durasi simpan minimum (Nearline 30, Coldline 90, Archive 365 hari) dan biaya ambil data.`, 'class'));
      return out;
    },
    gcloud: (n) => {
      const p = n.params;
      const loc = p.locType === 'multi' ? str(p, 'multi', 'US') : p.locType === 'dual' ? str(p, 'dual', 'NAM4') : str(p, 'region');
      let c = `gcloud storage buckets create gs://${n.name} --location=${loc}`;
      if (p.class !== 'STANDARD') c += ` --default-storage-class=${str(p, 'class')}`;
      if (bool(p, 'uniform')) c += ' --uniform-bucket-level-access';
      c += bool(p, 'pap') ? ' --public-access-prevention' : ' --no-public-access-prevention';
      if (num(p, 'softDelete', 7) !== 7) c += ` --soft-delete-duration=${num(p, 'softDelete', 7)}d`;
      if (num(p, 'retention')) c += ` --retention-period=${num(p, 'retention')}d`;
      const out = [c];
      if (bool(p, 'versioning')) out.push(`gcloud storage buckets update gs://${n.name} --versioning`);
      if (bool(p, 'public')) out.push(`gcloud storage buckets add-iam-policy-binding gs://${n.name} --member=allUsers --role=roles/storage.objectViewer`);
      return out;
    },
    entry: 'Unggah file',
    location: (n) => (n.params.locType === 'multi' ? str(n.params, 'multi', 'US').toLowerCase() : n.params.locType === 'dual' ? str(n.params, 'dual', 'NAM4').toLowerCase() : str(n.params, 'region'))
  },

  sql: {
    type: 'sql',
    product: 'Cloud SQL',
    abbr: 'SQL',
    category: 'data',
    blurb: 'MySQL, PostgreSQL atau SQL Server terkelola untuk OLTP relasional; HA regional, backup, replika baca.',
    prefix: 'orders-db',
    inputs: true,
    outputs: true,
    nameRule: { re: /^[a-z]([-a-z0-9]{0,82}[a-z0-9])?$/, msg: 'Instance ID: huruf kecil, angka dan tanda hubung, diawali huruf (project + ID maks. 98 karakter). Tidak bisa diganti setelah dibuat.' },
    fields: [
      { key: 'version', label: 'Versi database', type: 'select', def: 'POSTGRES_16', options: opts(['MYSQL_8_0', 'MYSQL_8_4', 'POSTGRES_15', 'POSTGRES_16', 'POSTGRES_17', 'SQLSERVER_2022_STANDARD']) },
      { key: 'edition', label: 'Edisi', type: 'select', def: 'enterprise', options: [{ value: 'enterprise', label: 'Enterprise' }, { value: 'enterprise-plus', label: 'Enterprise Plus' }] },
      { key: 'region', label: 'Region', type: 'select', def: 'us-central1', options: REGION_OPTS },
      { key: 'cpu', label: 'vCPU', type: 'select', def: '2', options: opts(['1', '2', '4', '8', '16', '32']) },
      { key: 'memory', label: 'Memori', type: 'number', def: 7.5, min: 0.6, max: 624, step: 0.25, unit: 'GB' },
      { key: 'storage', label: 'Storage SSD', type: 'number', def: 10, min: 10, max: 65536, unit: 'GB' },
      { key: 'ha', label: 'High availability (regional)', type: 'bool', def: false },
      { key: 'publicIp', label: 'IP publik', type: 'bool', def: false },
      { key: 'authNets', label: 'Authorized networks', type: 'text', def: '', placeholder: '203.0.113.0/24', show: (p) => p.publicIp === true },
      { key: 'privateIp', label: 'IP privat (private services access)', type: 'bool', def: true, help: 'Butuh koneksi Cloud SQL → VPC.' },
      { key: 'backups', label: 'Backup otomatis', type: 'bool', def: true, advanced: true },
      { key: 'pitr', label: 'Point-in-time recovery', type: 'bool', def: true, advanced: true },
      { key: 'protect', label: 'Deletion protection', type: 'bool', def: true, advanced: true }
    ],
    validate: (n, d) => {
      const out: Issue[] = [];
      const p = n.params;
      const cpu = Number(str(p, 'cpu', '2'));
      const mem = num(p, 'memory', 7.5);
      if (cpu !== 1 && cpu % 2) out.push(err('vCPU custom harus 1 atau bilangan genap.', 'cpu'));
      if (mem < Math.max(3.75, 0.9 * cpu) || mem > 6.5 * cpu)
        out.push(err(`Invalid Tier (db-custom-${cpu}-${Math.round(mem * 1024)}): memori harus 0,9–6,5 GB per vCPU (minimal 3,75 GB) — untuk ${cpu} vCPU: ${Math.max(3.75, 0.9 * cpu)}–${6.5 * cpu} GB.`, 'memory'));
      if (Math.round(mem * 1024) % 256) out.push(err('Memori harus kelipatan 256 MB (0,25 GB).', 'memory'));
      if (!bool(p, 'publicIp') && !bool(p, 'privateIp')) out.push(err('Instance butuh setidaknya satu jenis IP: publik atau privat.', 'privateIp'));
      if (bool(p, 'privateIp') && !vpcOf(d, n)) out.push(err('IP privat butuh private services access: hubungkan Cloud SQL ke sebuah VPC.', 'privateIp'));
      if (list(p, 'authNets').includes('0.0.0.0/0')) out.push(warn('Authorized network 0.0.0.0/0 membuka database ke seluruh internet.', 'authNets'));
      if (bool(p, 'pitr') && !bool(p, 'backups')) out.push(err('Point-in-time recovery butuh backup otomatis.', 'pitr'));
      if (p.edition === 'enterprise-plus' && cpu < 2) out.push(err('Enterprise Plus dimulai dari 2 vCPU.', 'cpu'));
      if (!bool(p, 'ha')) out.push(info('Tanpa HA, kegagalan zone menghentikan database sampai pulih.', 'ha'));
      return out;
    },
    gcloud: (n, d) => {
      const p = n.params;
      const vpc = vpcOf(d, n);
      let c = `gcloud sql instances create ${n.name} --database-version=${str(p, 'version')} --edition=${str(p, 'edition')} --region=${str(p, 'region')} --cpu=${str(p, 'cpu')} --memory=${num(p, 'memory', 7.5)}GB --storage-size=${num(p, 'storage', 10)}GB`;
      if (bool(p, 'ha')) c += ' --availability-type=regional';
      if (bool(p, 'privateIp') && vpc) c += ` --network=projects/${PROJECT}/global/networks/${vpc.name}`;
      if (!bool(p, 'publicIp')) c += ' --no-assign-ip';
      else if (list(p, 'authNets').length) c += ` --authorized-networks=${list(p, 'authNets').join(',')}`;
      if (bool(p, 'backups')) c += ' --backup-start-time=02:00';
      if (bool(p, 'pitr')) c += str(p, 'version').startsWith('MYSQL') ? ' --enable-bin-log' : ' --enable-point-in-time-recovery';
      if (bool(p, 'protect')) c += ' --deletion-protection';
      return [c];
    },
    location: (n) => str(n.params, 'region')
  },

  redis: {
    type: 'redis',
    product: 'Memorystore for Redis',
    abbr: 'RDS',
    category: 'data',
    blurb: 'Redis terkelola untuk cache dan session; hanya punya IP internal di VPC yang diizinkan.',
    prefix: 'cache',
    inputs: true,
    outputs: true,
    nameRule: { re: /^[a-z]([-a-z0-9]{0,38}[a-z0-9])?$/, msg: 'ID instance: huruf kecil, angka dan tanda hubung, diawali huruf, maks. 40 karakter.' },
    fields: [
      { key: 'tier', label: 'Tier', type: 'select', def: 'standard', options: [{ value: 'basic', label: 'Basic (tanpa replika)' }, { value: 'standard', label: 'Standard (HA dengan replika)' }] },
      { key: 'size', label: 'Kapasitas', type: 'number', def: 1, min: 1, max: 300, unit: 'GB' },
      { key: 'version', label: 'Versi', type: 'select', def: 'REDIS_7_2', options: opts(['REDIS_7_2', 'REDIS_7_0', 'REDIS_6_X']) },
      { key: 'region', label: 'Region', type: 'select', def: 'us-central1', options: REGION_OPTS },
      { key: 'mode', label: 'Connect mode', type: 'select', def: 'DIRECT_PEERING', options: opts(['DIRECT_PEERING', 'PRIVATE_SERVICE_ACCESS']), advanced: true },
      { key: 'auth', label: 'AUTH', type: 'bool', def: true, advanced: true },
      { key: 'tls', label: 'In-transit encryption', type: 'bool', def: true, advanced: true }
    ],
    validate: (n, d) => {
      const out: Issue[] = [];
      if (num(n.params, 'size', 1) < 1 || num(n.params, 'size', 1) > 300) out.push(err('Kapasitas 1–300 GB.', 'size'));
      if (!vpcOf(d, n)) out.push(info('Belum dihubungkan ke VPC — authorized network-nya jadi VPC "default".'));
      if (n.params.tier === 'basic') out.push(info('Basic tier tidak punya replika: data cache hilang saat instance gagal.', 'tier'));
      return out;
    },
    gcloud: (n, d) => {
      const p = n.params;
      const vpc = vpcOf(d, n);
      return [
        `gcloud redis instances create ${n.name} --size=${num(p, 'size', 1)} --region=${str(p, 'region')} --tier=${str(p, 'tier')} --redis-version=${str(p, 'version').toLowerCase()} --network=projects/${PROJECT}/global/networks/${vpc?.name ?? 'default'} --connect-mode=${str(p, 'mode').toLowerCase()}${bool(p, 'auth') ? ' --enable-auth' : ''}${bool(p, 'tls') ? ' --transit-encryption-mode=server-authentication' : ''}`
      ];
    },
    location: (n) => str(n.params, 'region')
  },

  firestore: {
    type: 'firestore',
    product: 'Firestore',
    abbr: 'FS',
    category: 'data',
    blurb: 'Database dokumen NoSQL serverless; sinkron real-time dan offline untuk aplikasi web/mobile.',
    prefix: '(default)',
    inputs: true,
    outputs: false,
    nameRule: { re: /^\(default\)$|^[a-z][a-z0-9-]{2,61}[a-z0-9]$/, msg: 'Database ID: "(default)" atau 4–63 karakter huruf kecil, angka dan tanda hubung, diawali huruf.' },
    fields: [
      { key: 'mode', label: 'Mode', type: 'select', def: 'native', options: [{ value: 'native', label: 'Native' }, { value: 'datastore', label: 'Datastore mode' }] },
      { key: 'location', label: 'Lokasi', type: 'select', def: 'nam5', options: opts(['nam5', 'eur3', ...REGIONS]) }
    ],
    validate: () => [info('Lokasi database tidak bisa diganti setelah dibuat.', 'location')],
    gcloud: (n) => [`gcloud firestore databases create --database=${n.name} --location=${str(n.params, 'location')} --type=${n.params.mode === 'datastore' ? 'datastore-mode' : 'firestore-native'}`],
    location: (n) => str(n.params, 'location')
  },

  bq: {
    type: 'bq',
    product: 'BigQuery dataset',
    abbr: 'BQ',
    category: 'data',
    blurb: 'Data warehouse serverless: SQL atas data besar, bayar per data dipindai atau per slot.',
    prefix: 'analytics',
    inputs: true,
    outputs: false,
    nameRule: { re: /^[A-Za-z0-9_]{1,1024}$/, msg: 'Dataset ID hanya huruf, angka dan garis bawah (tanpa tanda hubung), maks. 1024 karakter.' },
    fields: [
      { key: 'location', label: 'Lokasi', type: 'select', def: 'US', options: opts(['US', 'EU', ...REGIONS]) },
      { key: 'table', label: 'Tabel tujuan', type: 'text', def: 'events' },
      { key: 'expiration', label: 'Kedaluwarsa tabel default', type: 'number', def: 0, min: 0, max: 36500, unit: 'hari (0 = tidak)', advanced: true }
    ],
    validate: (n) => (/^[A-Za-z_][A-Za-z0-9_]*$/.test(str(n.params, 'table')) ? [] : [err('Nama tabel: huruf, angka dan garis bawah.', 'table')]),
    gcloud: (n) => [`bq --location=${str(n.params, 'location')} mk --dataset${num(n.params, 'expiration') ? ` --default_table_expiration=${num(n.params, 'expiration') * 86400}` : ''} ${PROJECT}:${n.name}`, `bq mk --table ${PROJECT}:${n.name}.${str(n.params, 'table')} schema.json`],
    location: (n) => str(n.params, 'location').toLowerCase()
  },

  topic: {
    type: 'topic',
    product: 'Pub/Sub topic',
    abbr: 'PUB',
    category: 'messaging',
    blurb: 'Messaging asinkron: pengirim publish ke topic, setiap subscription menerima salinannya (pull, push, BigQuery, Cloud Storage).',
    prefix: 'events',
    inputs: true,
    outputs: true,
    nameRule: { re: /^(?!goog)[A-Za-z][A-Za-z0-9._~+%-]{2,254}$/, msg: 'Topic ID 3–255 karakter, diawali huruf, berisi huruf, angka, - _ . ~ + %; tidak boleh diawali "goog".' },
    fields: [{ key: 'retention', label: 'Retensi pesan di topic', type: 'select', def: '', options: [{ value: '', label: 'Tidak disimpan di topic' }, { value: '1d', label: '1 hari' }, { value: '7d', label: '7 hari' }, { value: '31d', label: '31 hari (maks.)' }], advanced: true }],
    gcloud: (n) => [`gcloud pubsub topics create ${n.name}${str(n.params, 'retention') ? ` --message-retention-duration=${str(n.params, 'retention')}` : ''}`],
    entry: 'Publish pesan'
  },

  secret: {
    type: 'secret',
    product: 'Secret Manager',
    abbr: 'KEY',
    category: 'ops',
    blurb: 'Menyimpan password, API key dan sertifikat sebagai versi-versi rahasia, dengan akses lewat IAM.',
    prefix: 'db-pass',
    inputs: true,
    outputs: false,
    nameRule: { re: /^[A-Za-z0-9_-]{1,255}$/, msg: 'Secret ID: huruf, angka, - dan _, maks. 255 karakter.' },
    fields: [
      { key: 'replication', label: 'Replikasi', type: 'select', def: 'automatic', options: [{ value: 'automatic', label: 'Automatic' }, { value: 'user-managed', label: 'User-managed (pilih region)' }] },
      { key: 'locations', label: 'Region replika', type: 'text', def: 'us-central1', show: (p) => p.replication === 'user-managed' },
      { key: 'rotation', label: 'Rotasi', type: 'select', def: '', options: [{ value: '', label: 'Tidak' }, { value: '30d', label: 'Tiap 30 hari' }, { value: '90d', label: 'Tiap 90 hari' }], advanced: true }
    ],
    gcloud: (n) => [
      `gcloud secrets create ${n.name} --replication-policy=${str(n.params, 'replication')}${n.params.replication === 'user-managed' ? ` --locations=${str(n.params, 'locations')}` : ''} --data-file=-`
    ]
  },

  ar: {
    type: 'ar',
    product: 'Artifact Registry',
    abbr: 'AR',
    category: 'ops',
    blurb: 'Repository image container dan paket. Image ditulis REGION-docker.pkg.dev/PROJECT/REPO/IMAGE:TAG.',
    prefix: 'apps',
    inputs: true,
    outputs: true,
    nameRule: { re: /^[a-z]([-a-z0-9]{0,61}[a-z0-9])?$/, msg: 'Nama repository: huruf kecil, angka dan tanda hubung, diawali huruf.' },
    fields: [
      { key: 'location', label: 'Lokasi', type: 'select', def: 'us-central1', options: [...REGION_OPTS, ...opts(['us', 'europe', 'asia'])] },
      { key: 'format', label: 'Format', type: 'select', def: 'docker', options: opts(['docker', 'maven', 'npm', 'python', 'apt', 'yum', 'go']) },
      { key: 'immutable', label: 'Tag immutable', type: 'bool', def: false, advanced: true }
    ],
    validate: (n) => (n.params.format !== 'docker' ? [warn('Hanya repository docker yang bisa dipakai Cloud Run dan GKE sebagai sumber image.', 'format')] : []),
    gcloud: (n) => [`gcloud artifacts repositories create ${n.name} --repository-format=${str(n.params, 'format')} --location=${str(n.params, 'location')}${bool(n.params, 'immutable') ? ' --immutable-tags' : ''}`],
    location: (n) => str(n.params, 'location')
  },

  build: {
    type: 'build',
    product: 'Cloud Build trigger',
    abbr: 'CB',
    category: 'ops',
    blurb: 'CI/CD terkelola: setiap push ke branch membangun image, menyimpannya di Artifact Registry, lalu men-deploy.',
    prefix: 'deploy-main',
    inputs: false,
    outputs: true,
    runtime: true,
    nameRule: { re: /^[a-zA-Z][-a-zA-Z0-9]{0,63}$/, msg: 'Nama trigger diawali huruf, berisi huruf, angka dan tanda hubung.' },
    fields: [
      { key: 'repo', label: 'Repository', type: 'text', def: 'github.com/ace-lab/shop' },
      { key: 'branch', label: 'Branch (regex)', type: 'text', def: '^main$' },
      { key: 'config', label: 'File build', type: 'text', def: 'cloudbuild.yaml' },
      { key: 'region', label: 'Region', type: 'select', def: 'us-central1', options: REGION_OPTS, advanced: true }
    ],
    validate: (n, d) => (runtimeSa(d, n).isDefault ? [warn('Sejak 2024 Cloud Build memakai default compute service account. Hubungkan service account khusus dengan role sekecil mungkin.')] : []),
    gcloud: (n, d) => {
      const [, owner, name] = str(n.params, 'repo').split('/');
      const sa = runtimeSa(d, n);
      return [`gcloud builds triggers create github --name=${n.name} --region=${str(n.params, 'region')} --repo-owner=${owner ?? 'OWNER'} --repo-name=${name ?? 'REPO'} --branch-pattern="${str(n.params, 'branch')}" --build-config=${str(n.params, 'config')}${sa.isDefault ? '' : ` --service-account=projects/${PROJECT}/serviceAccounts/${sa.email}`}`];
    },
    entry: 'Push ke branch'
  },

  sa: {
    type: 'sa',
    product: 'Service account',
    abbr: 'SA',
    category: 'ops',
    blurb: 'Identitas untuk kode, bukan manusia. Hubungkan ke Cloud Run, VM, GKE… lalu role diberikan per koneksi — least privilege.',
    prefix: 'app-runner',
    inputs: false,
    outputs: true,
    nameRule: { re: /^[a-z]([-a-z0-9]{4,28}[a-z0-9])$/, msg: 'Service account name must be between 6 and 30 characters (inclusive), must begin with a lowercase letter, and consist of lowercase alphanumeric characters that can be separated by hyphens.' },
    fields: [
      { key: 'display', label: 'Nama tampilan', type: 'text', def: '' },
      { key: 'key', label: 'Buat kunci JSON', type: 'bool', def: false, advanced: true, help: 'Hindari: kunci bisa bocor. Melampirkan SA ke resource tidak butuh kunci.' }
    ],
    validate: (n, d) => {
      const out: Issue[] = [];
      if (bool(n.params, 'key')) out.push(warn('Kunci service account adalah kredensial jangka panjang yang bisa bocor; banyak organisasi memblokirnya (iam.disableServiceAccountKeyCreation).', 'key'));
      if (!d.edges.some((e) => e.from === n.id)) out.push(info('Belum dipakai — tarik koneksi dari service account ke resource yang dijalankan sebagai akun ini.'));
      return out;
    },
    gcloud: (n) => {
      const out = [`gcloud iam service-accounts create ${n.name}${str(n.params, 'display') ? ` --display-name="${str(n.params, 'display')}"` : ''}`];
      if (bool(n.params, 'key')) out.push(`gcloud iam service-accounts keys create key.json --iam-account=${n.name}@${PROJECT}.iam.gserviceaccount.com`);
      return out;
    }
  },

  vpc: {
    type: 'vpc',
    product: 'VPC network',
    abbr: 'VPC',
    category: 'network',
    blurb: 'Jaringan privat global: subnet regional, firewall rule, Private Google Access. Hubungkan VM, MIG, GKE, Cloud SQL, Redis dan Cloud Run ke sini.',
    prefix: 'prod-vpc',
    inputs: true,
    outputs: false,
    nameRule: RFC1035,
    fields: [
      { key: 'mode', label: 'Mode subnet', type: 'select', def: 'custom', options: [{ value: 'custom', label: 'Custom' }, { value: 'auto', label: 'Auto (satu /20 per region)' }] },
      { key: 'routing', label: 'Dynamic routing', type: 'select', def: 'regional', options: opts(['regional', 'global']), advanced: true },
      {
        key: 'subnets',
        label: 'Subnet',
        type: 'rows',
        def: [{ name: 'app-subnet', region: 'us-central1', range: '10.10.0.0/24', pga: true }],
        show: (p) => p.mode === 'custom',
        cols: [
          { key: 'name', label: 'Nama', type: 'text', def: 'subnet' },
          { key: 'region', label: 'Region', type: 'select', def: 'us-central1', options: REGION_OPTS },
          { key: 'range', label: 'Rentang', type: 'text', def: '10.20.0.0/24' },
          { key: 'pga', label: 'PGA', type: 'bool', def: true }
        ]
      },
      {
        key: 'firewall',
        label: 'Firewall rule (ingress, allow)',
        type: 'rows',
        def: [{ name: 'allow-iap-ssh', allow: 'tcp:22', sources: '35.235.240.0/20', tags: '' }],
        cols: [
          { key: 'name', label: 'Nama', type: 'text', def: 'allow-http' },
          { key: 'allow', label: 'Port', type: 'text', def: 'tcp:80' },
          { key: 'sources', label: 'Sumber', type: 'text', def: '0.0.0.0/0' },
          { key: 'tags', label: 'Target tag', type: 'text', def: '' }
        ]
      }
    ],
    validate: (n) => {
      const out: Issue[] = [];
      const subnets = rows(n.params, 'subnets');
      if (n.params.mode === 'custom') {
        if (!subnets.length) out.push(warn('VPC custom tanpa subnet tidak bisa dipakai resource apa pun.', 'subnets'));
        subnets.forEach((s, i) => {
          const r = String(s.range ?? '');
          const c = parseCidr(r);
          if (!RFC1035.re.test(String(s.name ?? ''))) out.push(err(`Subnet ${i + 1}: nama tidak valid.`, 'subnets'));
          if (!c) out.push(err(`Subnet ${String(s.name)}: rentang "${r}" bukan CIDR yang valid.`, 'subnets'));
          else {
            if (c.bits > 29) out.push(err(`Subnet ${String(s.name)}: subnet IPv4 minimal /29.`, 'subnets'));
            if (!isPrivateRange(r)) out.push(warn(`Subnet ${String(s.name)}: ${r} bukan rentang privat RFC 1918.`, 'subnets'));
          }
          subnets.slice(0, i).forEach((o) => {
            if (c && overlaps(r, String(o.range ?? ''))) out.push(err(`Subnet ${String(s.name)} (${r}) bertumpuk dengan ${String(o.name)} (${String(o.range)}).`, 'subnets'));
          });
        });
      } else out.push(info('Mode auto membuat rentang 10.128.0.0/9 yang sama di setiap project — bisa bentrok saat peering. Untuk produksi pakai custom.', 'mode'));
      for (const f of rows(n.params, 'firewall')) {
        const allow = String(f.allow ?? '');
        if (!/^(all|((tcp|udp|sctp)(:\d+(-\d+)?)?|icmp|esp|ah)(,((tcp|udp|sctp)(:\d+(-\d+)?)?|icmp|esp|ah))*)$/.test(allow))
          out.push(err(`Firewall ${String(f.name)}: "${allow}" tidak valid — tulis seperti tcp:80, tcp:8000-8100, icmp, atau all.`, 'firewall'));
        for (const s of String(f.sources ?? '').split(',').map((x) => x.trim()).filter(Boolean)) if (!parseCidr(s)) out.push(err(`Firewall ${String(f.name)}: sumber "${s}" bukan CIDR.`, 'firewall'));
        if (/(^|,)\s*0\.0\.0\.0\/0/.test(String(f.sources)) && /tcp:(22|3389)\b/.test(allow)) out.push(warn(`Firewall ${String(f.name)} membuka SSH/RDP ke seluruh internet. Pakai IAP (35.235.240.0/20).`, 'firewall'));
      }
      return out;
    },
    gcloud: (n) => {
      const out = [`gcloud compute networks create ${n.name} --subnet-mode=${str(n.params, 'mode')}${n.params.routing === 'global' ? ' --bgp-routing-mode=global' : ''}`];
      if (n.params.mode === 'custom')
        for (const s of rows(n.params, 'subnets'))
          out.push(`gcloud compute networks subnets create ${String(s.name)} --network=${n.name} --region=${String(s.region)} --range=${String(s.range)}${s.pga ? ' --enable-private-ip-google-access' : ''}`);
      for (const f of rows(n.params, 'firewall'))
        out.push(`gcloud compute firewall-rules create ${String(f.name)} --network=${n.name} --allow=${String(f.allow)}${f.sources ? ` --source-ranges=${String(f.sources)}` : ''}${f.tags ? ` --target-tags=${String(f.tags)}` : ''}`);
      return out;
    }
  },

  nat: {
    type: 'nat',
    product: 'Cloud NAT',
    abbr: 'NAT',
    category: 'network',
    blurb: 'Akses internet keluar untuk VM dan node tanpa IP eksternal. Regional; tidak pernah menerima koneksi masuk.',
    prefix: 'prod-nat',
    inputs: false,
    outputs: true,
    nameRule: RFC1035,
    fields: [
      { key: 'region', label: 'Region', type: 'select', def: 'us-central1', options: REGION_OPTS },
      { key: 'router', label: 'Cloud Router', type: 'text', def: 'nat-router' }
    ],
    validate: (n, d) => (vpcOf(d, n) ? [] : [err('Cloud NAT harus dipasang ke sebuah VPC: hubungkan NAT → VPC.')]),
    gcloud: (n, d) => {
      const vpc = vpcOf(d, n);
      return [
        `gcloud compute routers create ${str(n.params, 'router')} --network=${vpc?.name ?? 'VPC'} --region=${str(n.params, 'region')}`,
        `gcloud compute routers nats create ${n.name} --router=${str(n.params, 'router')} --region=${str(n.params, 'region')} --auto-allocate-nat-external-ips --nat-all-subnet-ip-ranges`
      ];
    },
    location: (n) => str(n.params, 'region')
  },

  sink: {
    type: 'sink',
    product: 'Cloud Logging sink',
    abbr: 'LOG',
    category: 'ops',
    blurb: 'Meneruskan entri log yang cocok dengan filter ke BigQuery, Cloud Storage atau Pub/Sub — untuk audit dan analisis.',
    prefix: 'audit-sink',
    inputs: false,
    outputs: true,
    nameRule: { re: /^[A-Za-z0-9_.-]{1,100}$/, msg: 'Nama sink: huruf, angka, - _ dan titik, maks. 100 karakter.' },
    fields: [{ key: 'filter', label: 'Filter log', type: 'text', def: 'logName:"cloudaudit.googleapis.com"', placeholder: 'severity>=ERROR' }],
    validate: (n, d) => (d.edges.some((e) => e.from === n.id) ? [] : [warn('Sink butuh tujuan: hubungkan ke BigQuery, bucket, atau topic.')]),
    gcloud: (n) => [`# Sink ${n.name}: perintahnya dibuat per tujuan (lihat koneksi).`],
    entry: 'Tulis entri log'
  }
};

export const SPEC_LIST = Object.values(SPECS);

/** A unique default name for a new node of `type`. */
export function freshName(d: Doc, type: NodeType): string {
  const spec = SPECS[type];
  if (spec.fixedName) return spec.prefix;
  const taken = new Set(d.nodes.filter((n) => n.type === type).map((n) => n.name));
  if (!taken.has(spec.prefix)) return spec.prefix;
  for (let i = 2; ; i++) {
    const cand = spec.prefix === '(default)' ? `db-${i}` : spec.prefix.replace(/-123$/, '') + `-${i}${spec.prefix.endsWith('-123') ? '-123' : ''}`;
    if (!taken.has(cand)) return cand;
  }
}

export function defaults(type: NodeType): Params {
  const p: Params = {};
  for (const f of SPECS[type].fields) p[f.key] = structuredClone(f.def);
  return p;
}

/** The node's own config issues: name rule plus the service's checks. */
export function nodeIssues(n: CNode, d: Doc): Issue[] {
  const spec = SPECS[n.type];
  const out: Issue[] = [];
  if (spec.nameRule && !spec.nameRule.re.test(n.name)) out.push(err(spec.nameRule.msg, 'name'));
  if (!spec.fixedName && d.nodes.some((o) => o !== n && o.type === n.type && o.name === n.name)) out.push(err(`Nama "${n.name}" sudah dipakai ${spec.product} lain.`, 'name'));
  out.push(...(spec.validate?.(n, d) ?? []));
  return out;
}

export { DEFAULT_SA };
