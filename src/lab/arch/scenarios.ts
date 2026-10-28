/**
 * Architecture scenarios: an exam-style case, a board of empty slots laid out
 * as a flow, and a key per slot. Grading is per slot — best fit, acceptable
 * with a caveat, or wrong with the reason — so the feedback teaches the same
 * trade-offs the exam's case questions test.
 */
import type { LabMeta } from '../types';
import { SERVICE_BY_ID } from './catalog';

export interface Slot {
  id: string;
  stage: string;
  /** What the slot does, shown on the empty box. */
  label: string;
  /** The requirement it answers, quoted from the case. */
  need: string;
  best: string[];
  /** Workable picks with the caveat that costs them a point. */
  ok?: Record<string, string>;
  /** Why the best answer is best. */
  why: string;
  /** Classic traps, with a targeted explanation. */
  traps?: Record<string, string>;
}

export interface ArchScenario extends LabMeta {
  story: string;
  requirements: string[];
  stages: { id: string; label: string }[];
  slots: Slot[];
  lesson: string;
}

export type Verdict = 'best' | 'ok' | 'wrong' | 'empty';

export interface SlotResult {
  slot: Slot;
  pick: string | null;
  verdict: Verdict;
  points: number;
  note: string;
}

export function gradeSlot(slot: Slot, pick: string | null): SlotResult {
  const best = slot.best.map((b) => SERVICE_BY_ID[b]?.name ?? b).join(' / ');
  if (!pick) return { slot, pick, verdict: 'empty', points: 0, note: `Belum diisi. Jawaban terbaik: ${best}. ${slot.why}` };
  if (slot.best.includes(pick)) return { slot, pick, verdict: 'best', points: 2, note: slot.why };
  if (slot.ok?.[pick]) return { slot, pick, verdict: 'ok', points: 1, note: `${slot.ok[pick]} Pilihan terbaik: ${best}.` };
  const svc = SERVICE_BY_ID[pick];
  return {
    slot,
    pick,
    verdict: 'wrong',
    points: 0,
    note: `${slot.traps?.[pick] ?? `${svc?.name ?? pick}: ${svc?.blurb ?? ''}`} Untuk kebutuhan ini: ${best} — ${slot.why}`
  };
}

export function grade(sc: ArchScenario, picks: Record<string, string | null>) {
  const results = sc.slots.map((s) => gradeSlot(s, picks[s.id] ?? null));
  const points = results.reduce((n, r) => n + r.points, 0);
  const max = sc.slots.length * 2;
  return { results, points, max, percent: Math.round((points / max) * 100) };
}

export const PASS_PERCENT = 80;

export const ARCH_SCENARIOS: ArchScenario[] = [
  {
    id: 'global-shop',
    title: 'Toko online untuk pembeli di seluruh dunia',
    level: 'Menengah',
    summary: 'Front door global, keamanan di edge, aplikasi container, database transaksi global.',
    topics: ['Load Balancing', 'Cloud CDN', 'Cloud Armor', 'Spanner', 'Cloud Run'],
    story:
      'KopiKita menjual biji kopi ke pelanggan di Asia, Eropa dan Amerika. Tim kecil (3 engineer) tidak mau mengurus server. Saat flash sale trafik naik 20×, dan bot sering mencoba credential stuffing.',
    requirements: [
      'Satu alamat IP global, pengguna dilayani region terdekat yang sehat',
      'Foto produk cepat dimuat di mana pun',
      'Blok serangan web dan DDoS sebelum sampai aplikasi',
      'API berbasis container, skala otomatis, tanpa mengurus cluster',
      'Stok dan pesanan konsisten kuat di semua region, ketersediaan 99,999%',
      'Keranjang belanja dan session dengan latensi sub-milidetik'
    ],
    stages: [
      { id: 'edge', label: 'Edge' },
      { id: 'app', label: 'Aplikasi' },
      { id: 'data', label: 'Data' }
    ],
    slots: [
      { id: 'front', stage: 'edge', label: 'Front door global', need: 'Satu IP global, ke region terdekat yang sehat', best: ['lb'], why: 'External Application Load Balancer global memberi satu IP anycast dan merutekan ke backend sehat terdekat.', traps: { dns: 'Cloud DNS hanya menerjemahkan nama; ia tidak memeriksa kesehatan backend atau membagi beban per request.' } },
      { id: 'cache', stage: 'edge', label: 'Cache konten statis', need: 'Foto produk cepat di mana pun', best: ['cdn'], why: 'Cloud CDN menyimpan konten di edge Google dekat pengguna, dipasang di load balancer.', ok: { gcs: 'Cloud Storage menyimpan fotonya, tapi tanpa CDN pengguna jauh tetap mengambil dari satu lokasi.' } },
      { id: 'waf', stage: 'edge', label: 'WAF dan anti-DDoS', need: 'Blok serangan sebelum sampai aplikasi', best: ['armor'], why: 'Cloud Armor berjalan di load balancer: aturan WAF (OWASP), blok IP/negara, rate limiting dan proteksi DDoS.', traps: { iap: 'IAP mengontrol akses pengguna internal berdasarkan identitas — bukan untuk pelanggan publik atau DDoS.' } },
      { id: 'api', stage: 'app', label: 'API container', need: 'Container, skala otomatis, tanpa urus cluster', best: ['run'], why: 'Cloud Run menjalankan container stateless, skala dari nol ke ribuan instance tanpa cluster.', ok: { gke: 'GKE Autopilot bisa, tapi tetap ada konsep cluster dan Kubernetes yang harus dikuasai tim kecil.', appengine: 'App Engine tanpa server juga, tapi tidak berbasis image container milikmu.' }, traps: { gce: 'VM berarti mengurus OS, patch dan autoscaling sendiri — kebalikan dari "tidak mau mengurus server".' } },
      { id: 'db', stage: 'data', label: 'Database pesanan', need: 'Konsisten kuat lintas region, 99,999%', best: ['spanner'], why: 'Spanner adalah database relasional dengan konsistensi kuat global dan SLA 99,999% pada konfigurasi multi-region.', ok: { cloudsql: 'Cloud SQL relasional, tapi regional — replika lintas region hanya untuk baca, tanpa SLA 99,999%.' }, traps: { firestore: 'Firestore bisa multi-region, tapi model dokumen NoSQL — kurang pas untuk transaksi stok-pesanan relasional.', bigquery: 'BigQuery untuk analitik, bukan transaksi (OLTP).' } },
      { id: 'session', stage: 'data', label: 'Cache session', need: 'Latensi sub-milidetik', best: ['memorystore'], why: 'Memorystore (Redis/Valkey) menyimpan data di memori — latensi sub-milidetik untuk session dan keranjang.' }
    ],
    lesson:
      'Pola web global: Load Balancer + CDN + Armor di edge, compute serverless untuk tim kecil, Spanner kalau butuh transaksi global konsisten kuat, Memorystore untuk cache.'
  },
  {
    id: 'iot',
    title: 'Telemetri jutaan sensor mesin kopi',
    level: 'Lanjut',
    summary: 'Ingest event streaming, olah real-time, simpan time-series, analitik SQL dan dashboard.',
    topics: ['Pub/Sub', 'Dataflow', 'Bigtable', 'BigQuery', 'Looker'],
    story:
      '200.000 mesin kopi di kafe partner mengirim suhu dan tekanan tiap detik. Teknisi butuh grafik per mesin dalam milidetik, tim bisnis butuh laporan SQL mingguan, dan data mentah wajib disimpan 7 tahun dengan biaya serendah mungkin.',
    requirements: [
      'Menerima jutaan pesan per detik dari perangkat, tahan lonjakan',
      'Membersihkan dan mengagregasi data secara streaming',
      'Baca/tulis time-series per mesin dengan latensi milidetik',
      'Analisis SQL atas seluruh histori',
      'Dashboard bisnis yang terkelola',
      'Arsip data mentah 7 tahun, jarang dibuka'
    ],
    stages: [
      { id: 'ingest', label: 'Ingest' },
      { id: 'process', label: 'Proses' },
      { id: 'serve', label: 'Simpan & sajikan' }
    ],
    slots: [
      { id: 'queue', stage: 'ingest', label: 'Penampung event', need: 'Jutaan pesan per detik, tahan lonjakan', best: ['pubsub'], why: 'Pub/Sub adalah messaging global yang skala otomatis dan memisahkan perangkat dari pemrosesan.', traps: { scheduler: 'Cloud Scheduler menjalankan job terjadwal, bukan menampung aliran event.' } },
      { id: 'stream', stage: 'process', label: 'Pemrosesan streaming', need: 'Bersihkan dan agregasi secara streaming', best: ['dataflow'], why: 'Dataflow (Apache Beam) memproses streaming dengan windowing dan skala otomatis.', ok: { dataproc: 'Dataproc bisa menjalankan Spark Streaming, tapi kamu mengurus cluster; Dataflow serverless dan lebih cocok untuk pipeline baru.' }, traps: { functions: 'Functions memproses per event tanpa windowing/agregasi stateful; tidak cocok untuk jutaan event per detik.' } },
      { id: 'ts', stage: 'serve', label: 'Penyimpanan time-series', need: 'Latensi milidetik per mesin, throughput sangat tinggi', best: ['bigtable'], why: 'Bigtable dirancang untuk time-series/IoT: tulis sangat cepat, baca per row key dalam milidetik.', traps: { bigquery: 'BigQuery untuk analitik ad-hoc, bukan lookup per perangkat dalam milidetik.', cloudsql: 'Cloud SQL tidak akan sanggup menampung jutaan tulisan per detik.' } },
      { id: 'dw', stage: 'serve', label: 'Data warehouse', need: 'SQL atas seluruh histori', best: ['bigquery'], why: 'BigQuery adalah warehouse serverless untuk SQL atas petabyte data.' },
      { id: 'bi', stage: 'serve', label: 'Dashboard bisnis', need: 'Dashboard terkelola', best: ['looker'], why: 'Looker (dan Looker Studio) membangun dashboard di atas BigQuery.' },
      { id: 'archive', stage: 'serve', label: 'Arsip mentah 7 tahun', need: 'Jarang dibuka, biaya serendah mungkin', best: ['gcs'], why: 'Cloud Storage kelas Archive adalah tempat termurah untuk data yang hampir tidak pernah dibaca; lifecycle bisa memindahkan otomatis.', traps: { pd: 'Persistent Disk mahal dan terikat ke VM — bukan untuk arsip.' } }
    ],
    lesson: 'Pipeline IoT klasik di Google Cloud: Pub/Sub → Dataflow → Bigtable (operasional) + BigQuery (analitik) → Looker, dengan arsip di Cloud Storage Archive.'
  },
  {
    id: 'migration',
    title: 'Keluar dari data center dalam 6 bulan',
    level: 'Menengah',
    summary: 'Lift-and-shift VM, VMware, Oracle, data besar dan database dengan downtime minimal.',
    topics: ['Migrate to VMs', 'VMware Engine', 'Bare Metal Solution', 'Transfer Appliance', 'Interconnect'],
    story:
      'Kontrak data center berakhir 6 bulan lagi. Ada 400 VM Linux/Windows, satu cluster VMware yang tim ops ingin tetap dikelola dengan vCenter, Oracle RAC dengan lisensi yang terikat hardware, arsip 500 TB di NAS dengan uplink 1 Gbps, dan MySQL penjualan yang hanya boleh down beberapa menit.',
    requirements: [
      'Pindahkan VM apa adanya, cepat',
      'Workload VMware tanpa ubah alat dan proses',
      'Oracle RAC dengan lisensi terikat hardware',
      '500 TB lewat uplink 1 Gbps',
      'MySQL dengan downtime menit',
      'Koneksi privat 10 Gbps ke kantor selama transisi'
    ],
    stages: [
      { id: 'compute', label: 'Workload' },
      { id: 'data', label: 'Data' },
      { id: 'link', label: 'Konektivitas' }
    ],
    slots: [
      { id: 'vms', stage: 'compute', label: 'Migrasi 400 VM', need: 'Lift and shift cepat', best: ['m2vm'], why: 'Migrate to Virtual Machines mereplikasi VM ke Compute Engine dengan downtime kecil, tanpa menulis ulang aplikasi.', traps: { gke: 'Memindahkan ke GKE berarti containerisasi — itu modernisasi, bukan lift and shift cepat.' } },
      { id: 'vmware', stage: 'compute', label: 'Cluster VMware', need: 'Tetap pakai vCenter', best: ['gcve'], why: 'Google Cloud VMware Engine menjalankan stack VMware asli, jadi alat dan proses tim tidak berubah.', ok: { m2vm: 'Bisa memindahkan VM-nya ke Compute Engine, tapi tim kehilangan vCenter — tidak sesuai syarat.' } },
      { id: 'oracle', stage: 'compute', label: 'Oracle RAC', need: 'Lisensi terikat hardware', best: ['bms'], why: 'Bare Metal Solution menyediakan server fisik khusus untuk Oracle RAC dan lisensi yang terikat hardware.', traps: { cloudsql: 'Cloud SQL tidak mendukung Oracle.' } },
      { id: 'bulk', stage: 'data', label: 'Arsip 500 TB', need: '500 TB, uplink 1 Gbps', best: ['appliance'], why: '500 TB di 1 Gbps butuh lebih dari sebulan penuh; Transfer Appliance dikirim, diisi dan dikembalikan secara offline.', ok: { sts: 'Storage Transfer Service bekerja online — di 1 Gbps butuh ~46 hari tanpa jeda, terlalu mepet.' } },
      { id: 'db', stage: 'data', label: 'MySQL penjualan', need: 'Downtime menit', best: ['dms'], why: 'Database Migration Service mereplikasi terus-menerus ke Cloud SQL lalu cutover singkat.', traps: { appliance: 'Transfer Appliance untuk file offline; database yang terus berubah butuh replikasi berkelanjutan.' } },
      { id: 'link', stage: 'link', label: 'Koneksi ke kantor', need: 'Privat, 10 Gbps', best: ['interconnect'], why: 'Dedicated/Partner Interconnect memberi koneksi privat berkapasitas tinggi yang tidak lewat internet.', ok: { vpn: 'HA VPN aman tapi lewat internet, dan tiap tunnel hanya sekitar 1–3 Gbps — perlu banyak tunnel untuk 10 Gbps.' } }
    ],
    lesson: 'Cocokkan alat migrasi dengan jenis workload: VM → Migrate to VMs, VMware → VMware Engine, Oracle → Bare Metal, data besar offline → Transfer Appliance, database online → DMS.'
  },
  {
    id: 'mobile-startup',
    title: 'Aplikasi mobile startup',
    level: 'Dasar',
    summary: 'Data pengguna real-time dan offline, API serverless, upload foto dan proses otomatis.',
    topics: ['Firestore', 'Cloud Run', 'Cloud Storage', 'Eventarc', 'BigQuery'],
    story:
      'Startup membuat aplikasi review kafe. Pengguna menulis review saat offline di kereta, foto diunggah dan otomatis dibuat thumbnail-nya, dan founder ingin tahu kafe mana yang paling populer tiap minggu. Budget sangat kecil; trafik malam hampir nol.',
    requirements: [
      'Data review sinkron real-time dan bisa ditulis offline',
      'API backend tanpa server, bayar per pemakaian',
      'Simpan foto ukuran penuh',
      'Buat thumbnail otomatis setiap ada foto baru',
      'Laporan mingguan dengan SQL'
    ],
    stages: [
      { id: 'app', label: 'Aplikasi' },
      { id: 'media', label: 'Media' },
      { id: 'insight', label: 'Insight' }
    ],
    slots: [
      { id: 'db', stage: 'app', label: 'Database aplikasi', need: 'Real-time + offline', best: ['firestore'], why: 'Firestore punya SDK mobile dengan sinkron real-time dan cache offline bawaan.', traps: { cloudsql: 'Cloud SQL tidak punya sinkron offline ke perangkat dan selalu menyala (biaya tetap).', bigtable: 'Bigtable untuk throughput sangat besar; terlalu mahal dan tanpa SDK mobile.' } },
      { id: 'api', stage: 'app', label: 'API backend', need: 'Serverless, bayar per pemakaian', best: ['run'], ok: { appengine: 'App Engine standard juga bisa skala ke nol, tapi Cloud Run lebih fleksibel (container apa saja).', functions: 'Functions cocok untuk endpoint kecil; untuk API lengkap Cloud Run lebih rapi.' }, why: 'Cloud Run skala ke nol saat sepi, jadi biaya malam hampir nol.' },
      { id: 'photos', stage: 'media', label: 'Penyimpanan foto', need: 'File ukuran penuh', best: ['gcs'], why: 'Cloud Storage adalah object storage untuk file seperti gambar, murah dan tahan lama.', traps: { firestore: 'Firestore membatasi dokumen 1 MiB; simpan foto di Cloud Storage dan URL-nya di Firestore.' } },
      { id: 'thumb', stage: 'media', label: 'Pembuat thumbnail', need: 'Otomatis tiap ada foto baru', best: ['functions'], ok: { run: 'Cloud Run + Eventarc juga tepat; functions lebih ringkas untuk satu tugas kecil.' }, why: 'Function yang dipicu event finalize di Cloud Storage berjalan hanya saat ada foto baru.', traps: { scheduler: 'Scheduler berjalan sesuai jadwal, bukan saat file masuk — thumbnail bisa telat.' } },
      { id: 'report', stage: 'insight', label: 'Laporan mingguan', need: 'SQL', best: ['bigquery'], why: 'Ekspor/stream data ke BigQuery dan jalankan SQL; bayar sesuai data yang diproses.', traps: { looker: 'Looker untuk menampilkan dashboard; datanya tetap perlu warehouse seperti BigQuery.' } }
    ],
    lesson: 'Untuk startup: layanan serverless yang skala ke nol (Firestore, Cloud Run, functions, BigQuery) menekan biaya saat sepi dan menghapus kerja operasional.'
  },
  {
    id: 'secure-data',
    title: 'Data pasien klinik: keamanan dan compliance',
    level: 'Lanjut',
    summary: 'Kunci milik pelanggan, rahasia aplikasi, perimeter data, PII, postur keamanan, akses tanpa VPN.',
    topics: ['Cloud KMS', 'Secret Manager', 'VPC Service Controls', 'Sensitive Data Protection', 'IAP'],
    story:
      'Jaringan klinik memindahkan rekam medis ke BigQuery dan Cloud Storage. Regulator minta: klinik memegang kunci enkripsi, data tidak boleh disalin ke project di luar organisasi, nomor KTP disamarkan untuk analis, dan dokter mengakses portal internal dari rumah tanpa VPN.',
    requirements: [
      'Klinik mengelola dan bisa mencabut kunci enkripsi',
      'Password database tidak ada di source code',
      'Cegah data BigQuery/Storage disalin keluar organisasi',
      'Temukan dan samarkan NIK/KTP untuk analis',
      'Pantau miskonfigurasi dan ancaman di seluruh organisasi',
      'Portal internal diakses berdasarkan identitas, tanpa VPN'
    ],
    stages: [
      { id: 'protect', label: 'Lindungi data' },
      { id: 'detect', label: 'Deteksi' },
      { id: 'access', label: 'Akses' }
    ],
    slots: [
      { id: 'keys', stage: 'protect', label: 'Kunci enkripsi', need: 'Dikelola klinik, bisa dicabut', best: ['kms'], why: 'Cloud KMS dengan CMEK: klinik memegang kunci; mencabutnya membuat data tak terbaca.', traps: { secrets: 'Secret Manager menyimpan rahasia aplikasi, bukan kunci enkripsi data at rest (CMEK).' } },
      { id: 'secrets', stage: 'protect', label: 'Rahasia aplikasi', need: 'Password tidak di source code', best: ['secrets'], why: 'Secret Manager menyimpan rahasia dengan versi, audit log dan akses IAM.', traps: { kms: 'KMS mengelola kunci kriptografi; untuk menyimpan password utuh pakai Secret Manager.' } },
      { id: 'perimeter', stage: 'protect', label: 'Cegah eksfiltrasi', need: 'Data tidak keluar organisasi', best: ['vpcsc'], why: 'VPC Service Controls membuat perimeter: API BigQuery/Storage menolak penyalinan ke project di luar perimeter, bahkan oleh user yang punya IAM.', traps: { iam: 'IAM mengatur siapa yang boleh membaca — tapi orang yang boleh membaca tetap bisa menyalin ke project lain. Perimeter yang mencegahnya.', armor: 'Cloud Armor melindungi aplikasi web di load balancer, bukan API data Google.' } },
      { id: 'pii', stage: 'detect', label: 'Temukan & samarkan PII', need: 'NIK/KTP disamarkan', best: ['sdp'], why: 'Sensitive Data Protection mendeteksi info sensitif dan melakukan masking/tokenisasi.' },
      { id: 'posture', stage: 'detect', label: 'Postur & ancaman', need: 'Seluruh organisasi', best: ['scc'], why: 'Security Command Center menampilkan miskonfigurasi, kerentanan dan ancaman secara terpusat.', ok: { logging: 'Audit log penting, tapi kamu harus membangun deteksinya sendiri; SCC sudah menyediakannya.' } },
      { id: 'portal', stage: 'access', label: 'Akses portal internal', need: 'Berbasis identitas, tanpa VPN', best: ['iap'], why: 'Identity-Aware Proxy memeriksa identitas dan konteks tiap request — model zero trust BeyondCorp.', ok: { vpn: 'VPN berfungsi, tapi justru yang ingin dihindari; akses berbasis jaringan, bukan identitas.' } }
    ],
    lesson: 'Defense in depth: KMS/CMEK untuk kunci, Secret Manager untuk rahasia, VPC-SC untuk eksfiltrasi, SDP untuk PII, SCC untuk postur, IAP untuk akses zero trust.'
  },
  {
    id: 'retail-analytics',
    title: 'Analitik dan forecasting ritel',
    level: 'Menengah',
    summary: 'Muat data iklan, pindahkan job Spark, warehouse, orkestrasi, model forecast, dashboard.',
    topics: ['BigQuery', 'Dataproc', 'Composer', 'Agent Platform', 'Data Transfer Service'],
    story:
      'Jaringan kafe ingin satu sumber kebenaran untuk penjualan dan iklan. Data Google Ads harus masuk tiap hari tanpa kode. Tim data punya 40 job Spark yang sudah jalan di Hadoop on-prem. Semua langkah harus dijadwalkan berurutan, dan data scientist ingin melatih model forecast permintaan kustom.',
    requirements: [
      'Data Google Ads masuk harian tanpa menulis kode',
      'Jalankan 40 job Spark yang sudah ada dengan perubahan minimal',
      'Warehouse SQL pusat',
      'Orkestrasi pipeline berurutan dengan retry',
      'Melatih dan melayani model forecast kustom',
      'Dashboard dengan definisi metrik yang konsisten'
    ],
    stages: [
      { id: 'in', label: 'Masuk' },
      { id: 'core', label: 'Inti' },
      { id: 'out', label: 'Hasil' }
    ],
    slots: [
      { id: 'ads', stage: 'in', label: 'Data Google Ads harian', need: 'Tanpa kode', best: ['dts'], why: 'BigQuery Data Transfer Service punya konektor Google Ads terjadwal tanpa kode.', ok: { dataflow: 'Dataflow bisa, tapi kamu harus menulis pipeline sendiri.' } },
      { id: 'spark', stage: 'in', label: 'Job Spark lama', need: 'Perubahan minimal', best: ['dataproc'], why: 'Dataproc menjalankan Spark/Hadoop terkelola — job lama bisa dipindah hampir tanpa ubahan.', ok: { dataflow: 'Dataflow serverless, tapi job Spark harus ditulis ulang ke Apache Beam.' } },
      { id: 'dw', stage: 'core', label: 'Warehouse', need: 'SQL pusat', best: ['bigquery'], why: 'BigQuery adalah warehouse serverless; data Ads dan hasil Spark berkumpul di sini.', traps: { cloudsql: 'Cloud SQL untuk transaksi; tidak dirancang untuk analitik skala warehouse.' } },
      { id: 'orchestrate', stage: 'core', label: 'Orkestrasi', need: 'Berurutan dengan retry', best: ['composer'], ok: { workflows: 'Workflows bagus untuk rangkaian panggilan API; untuk DAG data yang kompleks Airflow (Composer) adalah standar.' }, why: 'Cloud Composer (Airflow) menjadwalkan DAG dengan dependensi, retry dan monitoring.', traps: { scheduler: 'Cloud Scheduler hanya memicu pada jadwal; tidak mengelola dependensi antar langkah.' } },
      { id: 'ml', stage: 'out', label: 'Model forecast kustom', need: 'Melatih dan melayani model kustom', best: ['vertex'], ok: { bqml: 'BigQuery ML bisa membuat model forecast (ARIMA_PLUS) dengan SQL — cocok kalau tidak butuh model kustom.' }, why: 'Agent Platform untuk training kustom, registry dan endpoint serving.' },
      { id: 'bi', stage: 'out', label: 'Dashboard', need: 'Definisi metrik konsisten', best: ['looker'], why: 'Looker dengan model semantik LookML menjaga definisi metrik tetap sama di semua dashboard.' }
    ],
    lesson: 'Pilih alat yang meminimalkan kerja: DTS untuk SaaS, Dataproc untuk Spark yang ada, BigQuery sebagai pusat, Composer untuk orkestrasi, Agent Platform atau BigQuery ML untuk model.'
  },
  {
    id: 'devops',
    title: 'Pipeline rilis aplikasi container',
    level: 'Dasar',
    summary: 'Build, simpan image, rilis bertahap ke GKE, pantau metrik dan log.',
    topics: ['Cloud Build', 'Artifact Registry', 'Cloud Deploy', 'Monitoring', 'Logging'],
    story:
      'Tim aplikasi kasir ingin setiap commit di-build otomatis, image disimpan dan dipindai kerentanannya, rilis dipromosikan dev → staging → prod dengan persetujuan, aplikasi berjalan di Kubernetes, dan on-call dapat alert saat error naik.',
    requirements: [
      'Build dan test otomatis tiap commit',
      'Simpan image dan pindai kerentanan',
      'Promosi bertahap dengan persetujuan dan rollback',
      'Runtime Kubernetes',
      'Alert saat tingkat error naik',
      'Cari log semua service di satu tempat'
    ],
    stages: [
      { id: 'ci', label: 'CI' },
      { id: 'cd', label: 'CD & runtime' },
      { id: 'ops', label: 'Operasi' }
    ],
    slots: [
      { id: 'build', stage: 'ci', label: 'Build & test', need: 'Tiap commit', best: ['build'], why: 'Cloud Build menjalankan langkah build/test serverless yang dipicu commit.' },
      { id: 'registry', stage: 'ci', label: 'Registry image', need: 'Simpan + pindai', best: ['ar'], why: 'Artifact Registry menyimpan image dan memindai kerentanan.', traps: { gcs: 'Cloud Storage menyimpan file biasa, bukan registry container.' } },
      { id: 'cd', stage: 'cd', label: 'Continuous delivery', need: 'Promosi bertahap + rollback', best: ['deploy'], why: 'Cloud Deploy mengelola pipeline promosi antar target dengan approval dan rollback.', ok: { build: 'Cloud Build bisa melakukan deploy, tapi promosi bertahap, approval dan rollback harus kamu rakit sendiri.' } },
      { id: 'runtime', stage: 'cd', label: 'Runtime', need: 'Kubernetes', best: ['gke'], why: 'GKE adalah Kubernetes terkelola.', traps: { run: 'Cloud Run menjalankan container tanpa Kubernetes API — syaratnya Kubernetes.' } },
      { id: 'alert', stage: 'ops', label: 'Alert error', need: 'Alert saat error naik', best: ['monitoring'], why: 'Cloud Monitoring membuat alerting policy dari metrik (termasuk metrik berbasis log).' },
      { id: 'logs', stage: 'ops', label: 'Log terpusat', need: 'Cari log semua service', best: ['logging'], why: 'Cloud Logging mengumpulkan log semua layanan dan bisa dicari dengan Logs Explorer.' }
    ],
    lesson: 'CI/CD di Google Cloud: Cloud Build → Artifact Registry → Cloud Deploy → GKE/Cloud Run, dipantau dengan Cloud Monitoring dan Cloud Logging.'
  }
];

export const ARCH_BY_ID: Record<string, ArchScenario> = Object.fromEntries(ARCH_SCENARIOS.map((s) => [s.id, s]));
