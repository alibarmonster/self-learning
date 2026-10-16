/**
 * The service palette for the architecture lab. Each blurb says what the
 * service is FOR in one line — that line doubles as the feedback when it is
 * placed somewhere it doesn't fit.
 */

export type Category = 'compute' | 'database' | 'storage' | 'analytics' | 'network' | 'security' | 'devops' | 'ai' | 'migration' | 'integration';

export interface Service {
  id: string;
  name: string;
  category: Category;
  blurb: string;
}

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'compute', label: 'Compute' },
  { id: 'database', label: 'Database' },
  { id: 'storage', label: 'Storage' },
  { id: 'analytics', label: 'Analitik' },
  { id: 'integration', label: 'Integrasi' },
  { id: 'network', label: 'Jaringan' },
  { id: 'security', label: 'Keamanan' },
  { id: 'devops', label: 'DevOps & Ops' },
  { id: 'ai', label: 'AI/ML' },
  { id: 'migration', label: 'Migrasi' }
];

const S = (id: string, name: string, category: Category, blurb: string): Service => ({ id, name, category, blurb });

export const SERVICES: Service[] = [
  // compute
  S('gce', 'Compute Engine', 'compute', 'VM penuh: kontrol OS, software lama, lisensi khusus. Kamu yang mengurus patch dan skala (atau lewat MIG).'),
  S('gke', 'Google Kubernetes Engine', 'compute', 'Kubernetes terkelola untuk banyak container/microservice; fleksibel tapi butuh keahlian Kubernetes.'),
  S('run', 'Cloud Run', 'compute', 'Container stateless tanpa server: HTTP/event, skala otomatis sampai nol, bayar per pemakaian.'),
  S('functions', 'Cloud Run functions', 'compute', 'Potongan kode kecil yang dipicu event (upload file, pesan Pub/Sub, HTTP). Tanpa server.'),
  S('appengine', 'App Engine', 'compute', 'PaaS lama untuk aplikasi web dari source code; skala otomatis.'),
  S('gcve', 'Google Cloud VMware Engine', 'compute', 'Menjalankan workload VMware (vSphere) apa adanya di Google Cloud — tanpa ubah VM.'),
  S('bms', 'Bare Metal Solution', 'compute', 'Server fisik khusus di dekat region Google untuk Oracle dan workload yang butuh hardware/lisensi khusus.'),
  // database
  S('cloudsql', 'Cloud SQL', 'database', 'MySQL/PostgreSQL/SQL Server terkelola, regional. Cocok untuk OLTP relasional skala sedang.'),
  S('alloydb', 'AlloyDB for PostgreSQL', 'database', 'PostgreSQL berperforma tinggi untuk OLTP berat plus analitik ringan; regional.'),
  S('spanner', 'Spanner', 'database', 'Relasional, konsisten kuat, skala horizontal, bisa multi-region dengan SLA 99,999%.'),
  S('firestore', 'Firestore', 'database', 'Database dokumen NoSQL serverless; sinkron real-time dan offline untuk aplikasi mobile/web.'),
  S('bigtable', 'Bigtable', 'database', 'NoSQL wide-column untuk throughput sangat tinggi dan latensi rendah: IoT, time-series, ad-tech. Bukan relasional.'),
  S('memorystore', 'Memorystore', 'database', 'Redis/Valkey/Memcached terkelola: cache dan session in-memory, latensi sub-milidetik.'),
  // storage
  S('gcs', 'Cloud Storage', 'storage', 'Object storage untuk file, gambar, backup, data lake; kelas Standard/Nearline/Coldline/Archive.'),
  S('filestore', 'Filestore', 'storage', 'File share NFS terkelola untuk aplikasi yang butuh sistem file bersama.'),
  S('pd', 'Persistent Disk / Hyperdisk', 'storage', 'Block storage untuk boot disk dan data VM.'),
  // analytics
  S('bigquery', 'BigQuery', 'analytics', 'Data warehouse serverless: SQL atas data besar, bayar per data diproses atau slot.'),
  S('dataflow', 'Dataflow', 'analytics', 'Pipeline Apache Beam terkelola untuk ETL streaming dan batch, skala otomatis.'),
  S('dataproc', 'Dataproc', 'analytics', 'Spark/Hadoop terkelola — untuk memindahkan job Spark/Hive yang sudah ada.'),
  S('composer', 'Cloud Composer', 'analytics', 'Apache Airflow terkelola untuk mengorkestrasi dan menjadwalkan pipeline data.'),
  S('looker', 'Looker', 'analytics', 'Platform BI dengan model semantik (LookML) dan dashboard terkelola; Looker Studio untuk laporan cepat.'),
  S('dts', 'BigQuery Data Transfer Service', 'analytics', 'Memuat data terjadwal dari SaaS (Google Ads, YouTube, S3, dll.) langsung ke BigQuery.'),
  S('datastream', 'Datastream', 'analytics', 'Change data capture (CDC) serverless dari MySQL/PostgreSQL/Oracle ke BigQuery atau Cloud Storage.'),
  // integration
  S('pubsub', 'Pub/Sub', 'integration', 'Messaging asinkron global: memisahkan pengirim dan penerima, menampung jutaan event per detik.'),
  S('eventarc', 'Eventarc', 'integration', 'Merutekan event dari layanan Google (mis. upload ke Cloud Storage) ke Cloud Run/functions.'),
  S('workflows', 'Workflows', 'integration', 'Mengorkestrasi urutan panggilan API/layanan serverless dengan langkah dan retry.'),
  S('scheduler', 'Cloud Scheduler', 'integration', 'Cron terkelola: memicu job/HTTP/Pub/Sub sesuai jadwal.'),
  S('apigee', 'Apigee', 'integration', 'API management: publikasi, keamanan, kuota dan monetisasi API untuk partner.'),
  // network
  S('lb', 'Cloud Load Balancing', 'network', 'Satu IP anycast global, membagi trafik ke backend sehat di banyak region (Application/Network LB).'),
  S('cdn', 'Cloud CDN', 'network', 'Cache konten statis di edge Google dekat pengguna; dipasang di depan load balancer.'),
  S('armor', 'Cloud Armor', 'network', 'WAF dan perlindungan DDoS di load balancer: blok IP/negara, aturan OWASP, rate limit.'),
  S('dns', 'Cloud DNS', 'network', 'DNS terkelola publik/privat dengan SLA 100%.'),
  S('vpn', 'Cloud VPN', 'network', 'Tunnel IPsec terenkripsi lewat internet ke on-prem; cepat dipasang, bandwidth per tunnel terbatas.'),
  S('interconnect', 'Cloud Interconnect', 'network', 'Koneksi privat fisik (Dedicated/Partner) 10–100 Gbps ke on-prem, tidak lewat internet.'),
  S('nat', 'Cloud NAT', 'network', 'Akses keluar ke internet untuk VM/GKE tanpa external IP.'),
  // security
  S('iam', 'IAM', 'security', 'Siapa boleh melakukan apa pada resource mana: role dan binding.'),
  S('iap', 'Identity-Aware Proxy', 'security', 'Akses ke aplikasi web/SSH internal berdasarkan identitas dan konteks, tanpa VPN (zero trust/BeyondCorp).'),
  S('kms', 'Cloud KMS', 'security', 'Mengelola kunci enkripsi; CMEK agar pelanggan memegang dan bisa mencabut kunci.'),
  S('secrets', 'Secret Manager', 'security', 'Menyimpan password, API key dan sertifikat dengan versi dan kontrol akses IAM.'),
  S('vpcsc', 'VPC Service Controls', 'security', 'Perimeter di sekitar layanan Google (BigQuery, Storage) untuk mencegah eksfiltrasi data.'),
  S('sdp', 'Sensitive Data Protection', 'security', 'Menemukan, mengklasifikasi dan menyamarkan PII (dulu Cloud DLP).'),
  S('scc', 'Security Command Center', 'security', 'Dasbor postur keamanan dan deteksi ancaman terpusat untuk seluruh organisasi.'),
  // devops
  S('build', 'Cloud Build', 'devops', 'CI serverless: build, test dan buat image dari repositori.'),
  S('ar', 'Artifact Registry', 'devops', 'Menyimpan image container dan paket (Maven, npm, Python) dengan pemindaian kerentanan.'),
  S('deploy', 'Cloud Deploy', 'devops', 'Continuous delivery terkelola ke GKE/Cloud Run dengan promosi dev → staging → prod dan rollback.'),
  S('monitoring', 'Cloud Monitoring', 'devops', 'Metrik, dashboard, uptime check dan alert.'),
  S('logging', 'Cloud Logging', 'devops', 'Mengumpulkan, mencari dan merutekan log (sink ke BigQuery/Storage).'),
  // ai
  S('vertex', 'Vertex AI', 'ai', 'Platform ML: melatih, men-tune dan melayani model kustom serta model Gemini.'),
  S('bqml', 'BigQuery ML', 'ai', 'Membuat model ML dengan SQL langsung di BigQuery — tanpa memindahkan data.'),
  S('docai', 'Document AI', 'ai', 'Ekstraksi data terstruktur dari dokumen (invoice, KTP, formulir).'),
  S('vision', 'Vision AI', 'ai', 'Model siap pakai untuk label, teks (OCR) dan deteksi objek pada gambar.'),
  S('translation', 'Translation AI', 'ai', 'Terjemahan mesin siap pakai lewat API.'),
  // migration
  S('m2vm', 'Migrate to Virtual Machines', 'migration', 'Memindahkan VM (VMware, AWS, Azure, fisik) ke Compute Engine apa adanya (lift and shift).'),
  S('dms', 'Database Migration Service', 'migration', 'Migrasi MySQL/PostgreSQL/SQL Server/Oracle ke Cloud SQL atau AlloyDB dengan downtime minimal.'),
  S('sts', 'Storage Transfer Service', 'migration', 'Menyalin data online dari S3, Azure, HTTP atau on-prem ke Cloud Storage secara terjadwal.'),
  S('appliance', 'Transfer Appliance', 'migration', 'Perangkat fisik yang dikirim ke data center untuk memindahkan ratusan TB–PB secara offline.')
];

export const SERVICE_BY_ID: Record<string, Service> = Object.fromEntries(SERVICES.map((s) => [s.id, s]));
