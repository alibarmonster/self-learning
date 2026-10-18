/**
 * Canvas scenarios, graded like Packet Tracer's Activity Wizard: each goal is
 * an assertion over the design, the last deploy, or the last test runs, and
 * the panel shows a live percentage with a check per goal. Some scenarios
 * start empty (build it), some start broken (find and fix the fault).
 */
import type { LabMeta } from '../types';
import { defaults } from './catalog';
import { edgeDefaults, isPublic, ruleFor } from './rules';
import type { DeployReport, Trace } from './sim';
import { bool, emptyDoc, nodeById, newId, rows, runtimeSa, str, type CEdge, type CNode, type Doc, type NodeType, type Params } from './model';

export interface GoalCtx {
  d: Doc;
  /** The last deploy, if the design has not changed since. */
  report: DeployReport | null;
  /** The last test from each start node, if the design has not changed since. */
  traces: Record<string, Trace>;
}

export interface Goal {
  label: string;
  check: (g: GoalCtx) => boolean;
}

export interface CanvasScenario extends LabMeta {
  story: string;
  build: () => Doc;
  goals: Goal[];
  lesson: string;
  /** Shown on request, one at a time. */
  hints: string[];
}

function make() {
  const doc = emptyDoc();
  const add = (type: NodeType, name: string, x: number, y: number, params: Params = {}): CNode => {
    const n: CNode = { id: newId('n'), type, name, x, y, params: { ...defaults(type), ...params } };
    doc.nodes.push(n);
    return n;
  };
  const link = (a: CNode, b: CNode, params: Params = {}): CEdge => {
    const r = ruleFor(a.type, b.type);
    if (!r) throw new Error(`no rule ${a.type}>${b.type}`);
    const e: CEdge = { id: newId('e'), from: a.id, to: b.id, params: { ...edgeDefaults(r), ...params } };
    doc.edges.push(e);
    return e;
  };
  return { doc, add, link };
}

// ── goal helpers ────────────────────────────────────────────────────────────

const ofType = (d: Doc, t: NodeType) => d.nodes.filter((n) => n.type === t);
const hasEdge = (d: Doc, a: NodeType, b: NodeType) => d.edges.some((e) => nodeById(d, e.from)?.type === a && nodeById(d, e.to)?.type === b);
const deployed = (g: GoalCtx) => !!g.report && g.report.errors === 0;

/** A fresh test from a node of type `from` got all the way to a node of type `to`. */
const reaches = (g: GoalCtx, from: NodeType, to: NodeType) =>
  Object.values(g.traces).some((tr) => nodeById(g.d, tr.start)?.type === from && tr.reached.some((id) => nodeById(g.d, id)?.type === to));
const reachesName = (g: GoalCtx, from: string, to: string) =>
  Object.values(g.traces).some((tr) => nodeById(g.d, tr.start)?.name === from && tr.reached.some((id) => nodeById(g.d, id)?.name === to));

const dedicatedSa = (d: Doc, t: NodeType) => ofType(d, t).length > 0 && ofType(d, t).every((n) => !runtimeSa(d, n).isDefault);

const goal = (label: string, check: (g: GoalCtx) => boolean): Goal => ({ label, check });
const DEPLOY_OK = goal('Deploy berhasil tanpa error', deployed);

// ── scenarios ───────────────────────────────────────────────────────────────

export const CANVAS_SCENARIOS: CanvasScenario[] = [
  {
    id: 'sandbox',
    title: 'Kanvas bebas',
    level: 'Dasar',
    summary: 'Seret layanan apa pun, sambungkan, atur konfigurasinya, lalu deploy dan uji — tanpa target.',
    topics: ['Semua layanan'],
    story: 'Kanvas kosong untuk mencoba apa saja. Setiap koneksi menjelaskan mekanismenya, role IAM yang dibutuhkan, dan perintah gcloud yang setara.',
    build: () => {
      const { doc, add } = make();
      add('internet', 'Internet', 48, 176);
      return doc;
    },
    goals: [],
    lesson: '',
    hints: ['Seret layanan dari palet di kiri, atau klik untuk menaruhnya di tengah.', 'Tarik dari titik kanan sebuah layanan ke titik kiri layanan lain untuk menyambungkannya.']
  },
  {
    id: 'event-pipeline',
    title: 'Upload → function → BigQuery',
    level: 'Dasar',
    summary: 'Setiap file baru di bucket diproses function lalu hasilnya ditulis ke BigQuery.',
    topics: ['Cloud Storage', 'Eventarc', 'Cloud Run functions', 'BigQuery'],
    story:
      'Tim data ingin setiap file CSV yang diunggah ke bucket ace-uploads-123 langsung diproses dan barisnya masuk ke dataset BigQuery bernama sales. Pakai function, dengan service account khusus yang hanya punya izin yang perlu.',
    build: () => {
      const { doc, add } = make();
      add('gcs', 'ace-uploads-123', 64, 192);
      return doc;
    },
    goals: [
      goal('Bucket memicu sebuah Cloud Run function', (g) => hasEdge(g.d, 'gcs', 'fn')),
      goal('Function menulis ke dataset BigQuery bernama sales', (g) => g.d.edges.some((e) => nodeById(g.d, e.from)?.type === 'fn' && nodeById(g.d, e.to)?.type === 'bq' && nodeById(g.d, e.to)?.name === 'sales')),
      goal('Function memakai service account khusus, bukan default', (g) => dedicatedSa(g.d, 'fn')),
      DEPLOY_OK,
      goal('Unggahan uji sampai ke BigQuery', (g) => reaches(g, 'gcs', 'bq'))
    ],
    lesson:
      'Bucket → function memakai trigger Eventarc: service agent Cloud Storage butuh roles/pubsub.publisher, akun trigger butuh roles/eventarc.eventReceiver. Function → BigQuery butuh roles/bigquery.dataEditor di dataset dan roles/bigquery.jobUser di project — diberikan ke service account function, bukan ke default compute SA.',
    hints: [
      'Seret Cloud Run functions dan BigQuery dataset ke kanvas, lalu sambungkan bucket → function → dataset.',
      'Ganti nama dataset menjadi sales di panel konfigurasi.',
      'Tambahkan Service account dan tarik koneksinya ke function ("dijalankan sebagai").',
      'Tekan Deploy & uji. Klik koneksi untuk melihat role yang otomatis diberikan.'
    ]
  },
  {
    id: 'cron',
    title: 'Laporan harian dengan Cloud Scheduler',
    level: 'Dasar',
    summary: 'Jalankan service Cloud Run privat setiap hari pukul 02:00 dengan token OIDC.',
    topics: ['Cloud Scheduler', 'Cloud Run', 'IAM'],
    story:
      'Service Cloud Run report-job membuat laporan dan tidak boleh bisa dipanggil sembarang orang. Jalankan setiap hari pukul 02:00 waktu UTC lewat Cloud Scheduler, dengan service account yang hanya boleh memanggil service itu.',
    build: () => {
      const { doc, add } = make();
      add('run', 'report-job', 384, 192, { allowUnauth: false });
      return doc;
    },
    goals: [
      goal('report-job tetap privat (tanpa akses publik)', (g) => ofType(g.d, 'run').some((n) => n.name === 'report-job' && !isPublic(n))),
      goal('Scheduler terhubung ke report-job', (g) => hasEdge(g.d, 'scheduler', 'run')),
      goal('Jadwalnya setiap hari pukul 02:00 ("0 2 * * *")', (g) => ofType(g.d, 'scheduler').some((n) => str(n.params, 'schedule').trim().replace(/\s+/g, ' ') === '0 2 * * *')),
      goal('Koneksi Scheduler memakai service account untuk OIDC token', (g) => g.d.edges.some((e) => nodeById(g.d, e.from)?.type === 'scheduler' && !!str(e.params, 'identity'))),
      DEPLOY_OK,
      goal('Job uji berhasil memanggil report-job', (g) => reaches(g, 'scheduler', 'run'))
    ],
    lesson: 'Cloud Scheduler memanggil service privat dengan OIDC token dari service account yang dipilih di target HTTP; akun itu butuh roles/run.invoker pada service tersebut. Tanpa token, Cloud Run menjawab 403.',
    hints: ['Tambahkan Cloud Scheduler dan Service account.', 'Hubungkan Scheduler → report-job, lalu klik koneksinya dan pilih service account untuk OIDC token.', 'Biarkan "Izinkan akses tanpa autentikasi" di report-job tetap mati.']
  },
  {
    id: 'pubsub-push',
    title: 'Pesanan lewat Pub/Sub push',
    level: 'Menengah',
    summary: 'Topic orders mendorong pesan ke worker Cloud Run privat, dengan dead letter topic.',
    topics: ['Pub/Sub', 'Push subscription', 'Cloud Run', 'IAM'],
    story:
      'Aplikasi checkout mem-publish setiap pesanan ke topic orders. Worker Cloud Run order-worker harus menerima setiap pesan lewat push subscription, tetap privat, dan pesan yang gagal 5 kali dipindah ke dead letter topic.',
    build: () => {
      const { doc, add } = make();
      add('topic', 'orders', 64, 192);
      add('run', 'order-worker', 448, 192, { allowUnauth: false });
      return doc;
    },
    goals: [
      goal('orders terhubung ke order-worker (push subscription)', (g) => hasEdge(g.d, 'topic', 'run')),
      goal('order-worker tetap privat', (g) => ofType(g.d, 'run').every((n) => !isPublic(n))),
      goal('Push memakai service account (OIDC)', (g) => g.d.edges.some((e) => nodeById(g.d, e.from)?.type === 'topic' && nodeById(g.d, e.to)?.type === 'run' && !!str(e.params, 'identity'))),
      goal('Dead letter topic aktif setelah 5 kali gagal', (g) => g.d.edges.some((e) => nodeById(g.d, e.from)?.type === 'topic' && bool(e.params, 'dlq') && Number(e.params.attempts) === 5)),
      DEPLOY_OK,
      goal('Pesan uji diterima order-worker', (g) => reachesName(g, 'orders', 'order-worker'))
    ],
    lesson:
      'Push subscription mengirim pesan sebagai HTTP POST dengan OIDC token dari service account yang dipilih; akun itu butuh roles/run.invoker di service tujuan. Dead letter topic menampung pesan yang terus gagal (5–100 percobaan) supaya tidak terkirim ulang selamanya.',
    hints: ['Sambungkan orders → order-worker.', 'Tambah Service account, lalu pilih akun itu di koneksi topic → service.', 'Di koneksi yang sama, aktifkan Dead letter topic dengan 5 percobaan.']
  },
  {
    id: 'web-serverless',
    title: 'Toko online serverless',
    level: 'Menengah',
    summary: 'Load balancer → Cloud Run → Cloud SQL privat, password di Secret Manager, identitas khusus.',
    topics: ['Load balancing', 'Cloud Run', 'Cloud SQL', 'Secret Manager', 'VPC'],
    story:
      'Bangun backend toko online: pengguna masuk lewat External Application Load Balancer ke Cloud Run shop-api. Cloud Run tidak boleh bisa dipanggil langsung dari internet (hanya lewat LB). Data di Cloud SQL dengan HA dan tanpa IP publik; password database disimpan di Secret Manager. Semua dengan service account khusus.',
    build: () => {
      const { doc, add } = make();
      add('internet', 'Internet', 48, 208);
      return doc;
    },
    goals: [
      goal('Internet → load balancer → Cloud Run shop-api', (g) => hasEdge(g.d, 'internet', 'lb') && g.d.edges.some((e) => nodeById(g.d, e.from)?.type === 'lb' && nodeById(g.d, e.to)?.name === 'shop-api')),
      goal('shop-api hanya menerima trafik internal dan dari load balancer', (g) => ofType(g.d, 'run').some((n) => n.name === 'shop-api' && n.params.ingress === 'internal-and-cloud-load-balancing')),
      goal('shop-api memakai Cloud SQL dan membaca password dari Secret Manager', (g) => hasEdge(g.d, 'run', 'sql') && hasEdge(g.d, 'run', 'secret')),
      goal('Cloud SQL tanpa IP publik, dengan high availability', (g) => ofType(g.d, 'sql').length > 0 && ofType(g.d, 'sql').every((n) => !bool(n.params, 'publicIp') && bool(n.params, 'ha'))),
      goal('shop-api memakai service account khusus', (g) => dedicatedSa(g.d, 'run')),
      DEPLOY_OK,
      goal('Request dari internet sampai ke Cloud SQL', (g) => reaches(g, 'internet', 'sql'))
    ],
    lesson:
      'Ingress "internal-and-cloud-load-balancing" + akses publik membuat Cloud Run hanya bisa dicapai lewat LB. Cloud SQL tanpa IP publik dijangkau lewat Direct VPC egress ke VPC yang sama dengan private services access-nya, dan identitas Cloud Run butuh roles/cloudsql.client serta roles/secretmanager.secretAccessor.',
    hints: [
      'Rangkai Internet → Load balancer → Cloud Run (namai shop-api) → Cloud SQL, dan shop-api → Secret Manager.',
      'Load balancer tidak mengirim ID token: izinkan akses publik di shop-api, lalu kunci dengan ingress internal-and-cloud-load-balancing.',
      'IP privat Cloud SQL butuh koneksi Cloud SQL → VPC; shop-api juga harus dihubungkan ke VPC yang sama (Direct VPC egress).',
      'Pastikan VPC punya subnet di region shop-api.'
    ]
  },
  {
    id: 'cicd',
    title: 'CI/CD: Cloud Build → Artifact Registry → Cloud Run',
    level: 'Lanjut',
    summary: 'Push ke main membangun image, menyimpannya, lalu men-deploy — dengan service account build yang sempit.',
    topics: ['Cloud Build', 'Artifact Registry', 'Cloud Run', 'IAM'],
    story:
      'Setiap push ke branch main harus membangun image, menyimpannya di repository Artifact Registry apps, lalu men-deploy service Cloud Run web. Cloud Build tidak boleh memakai default compute SA; service web juga punya service account sendiri.',
    build: () => {
      const { doc, add } = make();
      add('build', 'deploy-main', 64, 192);
      return doc;
    },
    goals: [
      goal('Cloud Build mendorong image ke repository apps', (g) => g.d.edges.some((e) => nodeById(g.d, e.from)?.type === 'build' && nodeById(g.d, e.to)?.type === 'ar' && nodeById(g.d, e.to)?.name === 'apps')),
      goal('Cloud Build men-deploy service web', (g) => g.d.edges.some((e) => nodeById(g.d, e.from)?.type === 'build' && nodeById(g.d, e.to)?.name === 'web')),
      goal('Image web diambil dari repository apps', (g) => hasEdge(g.d, 'ar', 'run') && ofType(g.d, 'run').some((n) => n.name === 'web' && str(n.params, 'image').includes('/apps/'))),
      goal('Cloud Build dan web masing-masing punya service account khusus', (g) => dedicatedSa(g.d, 'build') && dedicatedSa(g.d, 'run') && new Set([...ofType(g.d, 'build'), ...ofType(g.d, 'run')].map((n) => runtimeSa(g.d, n).email)).size >= 2),
      DEPLOY_OK,
      goal('Push uji: image terkirim dan service ter-deploy', (g) => reaches(g, 'build', 'ar') && reaches(g, 'build', 'run'))
    ],
    lesson:
      'Service account build butuh roles/artifactregistry.writer di repository, roles/run.admin, dan roles/iam.serviceAccountUser pada service account runtime service yang di-deploy (actAs). Sejak 2024 Cloud Build memakai default compute SA kalau tidak diatur — itu yang dihindari.',
    hints: ['Tambahkan Artifact Registry (namai apps) dan Cloud Run (namai web).', 'Hubungkan deploy-main → apps, deploy-main → web, dan apps → web.', 'Ubah image web menjadi us-central1-docker.pkg.dev/ace-lab-123/apps/web:v1.', 'Buat dua service account: satu untuk build, satu untuk web.']
  },
  {
    id: 'fix-push-403',
    title: 'Perbaiki: push Pub/Sub ditolak 403',
    level: 'Menengah',
    summary: 'Pesan menumpuk di subscription; push ke Cloud Run selalu 403. Temukan dan perbaiki tanpa membuka service ke publik.',
    topics: ['Debug', 'Pub/Sub', 'IAM'],
    story:
      'Backlog subscription invoices terus naik dan log Cloud Run billing penuh 403. Deploy sudah jalan. Tekan Deploy & uji untuk melihat di hop mana pesannya ditolak, lalu perbaiki — billing harus tetap privat.',
    build: () => {
      const { doc, add, link } = make();
      const t = add('topic', 'invoices', 64, 224);
      const r = add('run', 'billing', 448, 224, { allowUnauth: false });
      const sa = add('sa', 'push-invoker', 256, 64);
      const app = add('sa', 'billing-runner', 448, 64);
      link(app, r);
      link(t, r, { identity: sa.id, grant: { invoker: false } });
      return doc;
    },
    goals: [
      goal('billing tetap privat', (g) => ofType(g.d, 'run').every((n) => !isPublic(n))),
      DEPLOY_OK,
      goal('Pesan uji dari invoices diterima billing', (g) => reachesName(g, 'invoices', 'billing'))
    ],
    lesson: 'Push subscription memakai service account push-invoker untuk OIDC token, tapi akun itu belum punya roles/run.invoker di billing. Berikan role itu ke push-invoker pada service billing — jangan membuat service publik.',
    hints: ['Jalankan Deploy & uji dan baca hop yang merah.', 'Klik koneksi invoices → billing dan lihat bagian IAM.']
  },
  {
    id: 'fix-sql-timeout',
    title: 'Perbaiki: Cloud Run timeout ke Cloud SQL',
    level: 'Lanjut',
    summary: 'API publik di Cloud Run selalu gagal "dial tcp …: i/o timeout" ke Cloud SQL berIP privat.',
    topics: ['Debug', 'Cloud Run', 'Cloud SQL', 'VPC'],
    story:
      'Tim memindahkan Cloud SQL catalog-db ke IP privat demi keamanan. Sejak itu API catalog-api selalu timeout. Perbaiki jalurnya tanpa menyalakan lagi IP publik database.',
    build: () => {
      const { doc, add, link } = make();
      const inet = add('internet', 'Internet', 48, 208);
      const run = add('run', 'catalog-api', 304, 208, { allowUnauth: true, region: 'asia-southeast2' });
      const sql = add('sql', 'catalog-db', 592, 208, { publicIp: false, privateIp: true, region: 'asia-southeast2', ha: true });
      const vpc = add('vpc', 'prod-vpc', 592, 400, { subnets: [{ name: 'app-subnet', region: 'us-central1', range: '10.10.0.0/24', pga: true }] });
      const sa = add('sa', 'catalog-runner', 304, 48);
      link(inet, run);
      link(sa, run);
      link(run, sql);
      link(sql, vpc);
      return doc;
    },
    goals: [
      goal('catalog-db tetap tanpa IP publik', (g) => ofType(g.d, 'sql').every((n) => !bool(n.params, 'publicIp'))),
      DEPLOY_OK,
      goal('Request dari internet sampai ke catalog-db', (g) => reaches(g, 'internet', 'sql'))
    ],
    lesson:
      'IP privat Cloud SQL hanya bisa dicapai dari VPC tempat private services access-nya. Cloud Run butuh Direct VPC egress ke VPC itu, dan Direct VPC egress butuh subnet di region yang sama dengan service (asia-southeast2) — subnet us-central1 tidak cukup.',
    hints: ['Baca pesan timeout di hop catalog-api → catalog-db.', 'catalog-api belum masuk ke VPC mana pun.', 'Setelah tersambung, cek apakah prod-vpc punya subnet di asia-southeast2.']
  },
  {
    id: 'fix-lb-502',
    title: 'Perbaiki: load balancer 502',
    level: 'Menengah',
    summary: 'Semua backend MIG UNHEALTHY dan pengguna mendapat 502. Buka hanya yang perlu.',
    topics: ['Debug', 'Load balancing', 'Firewall', 'MIG'],
    story:
      'Load balancer web-lb di depan MIG web-mig selalu menjawab 502 Bad Gateway. VM-nya jalan normal. Perbaiki firewall prod-vpc — tapi jangan membuka port 80 ke seluruh internet, karena VM hanya boleh dicapai lewat load balancer.',
    build: () => {
      const { doc, add, link } = make();
      const inet = add('internet', 'Internet', 48, 208);
      const lb = add('lb', 'web-lb', 272, 208);
      const mig = add('mig', 'web-mig', 512, 208, { tags: 'web' });
      const vpc = add('vpc', 'prod-vpc', 512, 400);
      const sa = add('sa', 'web-runner', 512, 48);
      link(inet, lb);
      link(lb, mig);
      link(mig, vpc);
      link(sa, mig);
      return doc;
    },
    goals: [
      goal('Tidak ada firewall yang membuka port 80 dari 0.0.0.0/0', (g) =>
        ofType(g.d, 'vpc').every((v) => !rows(v.params, 'firewall').some((f) => /(^|,)\s*0\.0\.0\.0\/0/.test(String(f.sources)) && /(^|,)(all|tcp|tcp:80)(\s*,|$)/.test(String(f.allow))))
      ),
      DEPLOY_OK,
      goal('Request dari internet sampai ke web-mig', (g) => reaches(g, 'internet', 'mig'))
    ],
    lesson:
      'Health check dan proxy Application Load Balancer datang dari 130.211.0.0/22 dan 35.191.0.0/16. Tanpa firewall yang mengizinkan rentang itu ke port backend (dengan target tag yang benar), semua backend dianggap UNHEALTHY dan LB menjawab 502.',
    hints: ['Baca hop web-lb → web-mig.', 'Tambahkan firewall rule di prod-vpc: port tcp:80, sumber 130.211.0.0/22,35.191.0.0/16, target tag web.']
  },
  {
    id: 'private-vm',
    title: 'VM privat yang tetap bisa bekerja',
    level: 'Menengah',
    summary: 'VM tanpa IP eksternal harus mengunduh update dari internet dan menulis hasil ke bucket.',
    topics: ['Compute Engine', 'Cloud NAT', 'Private Google Access', 'Access scopes'],
    story:
      'VM batch-1 sengaja dibuat tanpa IP eksternal. Ia perlu mengunduh paket dari internet dan menulis hasil ke bucket ace-results-123. Sekarang keduanya gagal. Perbaiki tanpa memberi VM IP eksternal.',
    build: () => {
      const { doc, add, link } = make();
      const vm = add('gce', 'batch-1', 272, 208, { ip: 'none', scopes: 'default' });
      const vpc = add('vpc', 'prod-vpc', 272, 400, { subnets: [{ name: 'batch-subnet', region: 'us-central1', range: '10.20.0.0/24', pga: false }] });
      const inet = add('internet', 'Internet', 576, 112);
      const bucket = add('gcs', 'ace-results-123', 576, 304);
      const sa = add('sa', 'batch-runner', 272, 48);
      link(vm, vpc);
      link(sa, vm);
      link(vm, inet);
      link(vm, bucket);
      return doc;
    },
    goals: [
      goal('batch-1 tetap tanpa IP eksternal', (g) => ofType(g.d, 'gce').every((n) => n.params.ip === 'none')),
      DEPLOY_OK,
      goal('batch-1 bisa mengunduh dari internet', (g) => reaches(g, 'gce', 'internet')),
      goal('batch-1 bisa menulis ke ace-results-123', (g) => reaches(g, 'gce', 'gcs'))
    ],
    lesson:
      'Tanpa IP eksternal, VM butuh Cloud NAT untuk internet dan Private Google Access (atau NAT) untuk Google API. Lalu dua lapis izin: access scope VM harus mencakup API-nya (scope default hanya Storage read-only — pakai cloud-platform), dan service account-nya butuh role di bucket.',
    hints: ['Tes dulu: dua hop gagal dengan alasan berbeda.', 'Tambahkan Cloud NAT dan hubungkan ke prod-vpc (region us-central1).', 'Untuk bucket: aktifkan PGA di batch-subnet, dan ganti access scope batch-1 ke cloud-platform.']
  },
  {
    id: 'log-audit',
    title: 'Simpan audit log ke BigQuery',
    level: 'Dasar',
    summary: 'Teruskan audit log ke dataset BigQuery untuk dianalisis, dengan writer identity yang benar.',
    topics: ['Cloud Logging', 'Log sink', 'BigQuery'],
    story: 'Tim keamanan ingin semua audit log (cloudaudit.googleapis.com) masuk ke dataset BigQuery audit_logs supaya bisa di-query dan disimpan lebih lama dari 30 hari bucket _Default.',
    build: () => {
      const { doc } = make();
      return doc;
    },
    goals: [
      goal('Ada log sink ke dataset audit_logs', (g) => g.d.edges.some((e) => nodeById(g.d, e.from)?.type === 'sink' && nodeById(g.d, e.to)?.name === 'audit_logs')),
      goal('Filter sink memilih audit log', (g) => ofType(g.d, 'sink').some((n) => str(n.params, 'filter').includes('cloudaudit.googleapis.com'))),
      DEPLOY_OK,
      goal('Entri log uji tertulis ke audit_logs', (g) => reaches(g, 'sink', 'bq'))
    ],
    lesson: 'Sink menulis memakai writer identity-nya sendiri, yang butuh roles/bigquery.dataEditor di dataset tujuan. gcloud logging sinks create bahkan mengingatkan untuk memberinya role itu setelah sink dibuat.',
    hints: ['Seret Cloud Logging sink dan BigQuery dataset, namai dataset audit_logs.', 'Hubungkan sink → dataset.']
  }
];

export const CANVAS_BY_ID: Record<string, CanvasScenario> = Object.fromEntries(CANVAS_SCENARIOS.map((s) => [s.id, s]));
