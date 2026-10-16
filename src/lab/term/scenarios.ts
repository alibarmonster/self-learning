/**
 * Terminal lab scenarios. Tasks are checked against the project's state, the
 * way Killercoda/Skills Boost verify a step: it doesn't matter whether you
 * typed `gsutil mb` or `gcloud storage buckets create`, only that the bucket
 * exists with the right settings.
 */
import { probe } from '../net/engine';
import type { LabMeta } from '../types';
import {
  addDefaultNetwork,
  config,
  emptyKube,
  hasBinding,
  kubeCluster,
  newProject,
  newState,
  type CloudState,
  type Project
} from './state';
import { toTopology } from './topology';

export interface TermTask {
  label: string;
  check: (s: CloudState) => boolean;
  /** Shown by `hint`: what to do, not always the exact command. */
  hint: string;
}

export interface TermScenario extends LabMeta {
  story: string;
  build: () => CloudState;
  tasks: TermTask[];
  /** A command sequence that completes every task; the regression script runs it. */
  solution: string[];
  lesson: string;
}

const P = (s: CloudState, id: string): Project | undefined => s.projects.find((p) => p.id === id);
const vm = (s: CloudState, id: string, name: string) => P(s, id)?.instances.find((i) => i.name === name);

/** Can the project's network carry this probe? Uses the topology engine. */
function reach(s: CloudState, id: string, from: string, to: string, port: number): boolean {
  const p = P(s, id);
  if (!p) return false;
  const t = toTopology(p);
  const end = (e: string) => (e === 'internet' || e === 'iap' || e === 'google' ? { kind: e } : { kind: 'vm' as const, id: `vm:${e}` });
  return probe(t, { from: end(from) as never, to: end(to) as never, proto: 'tcp', port }).ok;
}

const SALES_CSV = [
  'order_id,customer,amount,order_date',
  ...Array.from({ length: 48 }, (_, i) => `${1001 + i},pelanggan_${(i * 7) % 23},${(15 + ((i * 37) % 120)) * 1000},2026-09-${String((i % 28) + 1).padStart(2, '0')}`)
].join('\n');

export const TERM_SCENARIOS: TermScenario[] = [
  {
    id: 'first-vm',
    title: 'Hari pertama: project, zone, VM',
    level: 'Dasar',
    summary: 'Set project dan zone default, aktifkan Compute Engine, buat VM web dan buka port 80.',
    topics: ['gcloud config', 'APIs', 'Compute Engine', 'Firewall'],
    story:
      'Kamu baru dapat akses ke project kopi-dev-3141. Cloud Shell masih kosong: belum ada project aktif dan Compute Engine API belum dinyalakan. Buat VM web-1 (e2-micro) di Jakarta, lalu buka HTTP untuk VM itu saja.',
    build() {
      return newState([newProject('kopi-dev-3141')]);
    },
    tasks: [
      { label: 'Project aktif: kopi-dev-3141', check: (s) => config(s).project === 'kopi-dev-3141', hint: 'gcloud config set project kopi-dev-3141' },
      { label: 'Zone default: asia-southeast2-a', check: (s) => config(s).zone === 'asia-southeast2-a', hint: 'gcloud config set compute/zone asia-southeast2-a' },
      { label: 'Compute Engine API aktif', check: (s) => !!P(s, 'kopi-dev-3141')?.services.includes('compute.googleapis.com'), hint: 'gcloud services enable compute.googleapis.com' },
      {
        label: 'VM web-1, e2-micro, di asia-southeast2-a, bertag http-server',
        check: (s) => {
          const i = vm(s, 'kopi-dev-3141', 'web-1');
          return !!i && i.machineType === 'e2-micro' && i.zone === 'asia-southeast2-a' && i.tags.includes('http-server');
        },
        hint: 'gcloud compute instances create web-1 --machine-type=e2-micro --tags=http-server'
      },
      {
        label: 'Rule firewall membuka tcp:80 hanya untuk tag http-server',
        check: (s) =>
          !!P(s, 'kopi-dev-3141')?.firewalls.some((f) => f.direction === 'INGRESS' && f.action === 'ALLOW' && /tcp:80\b/.test(f.rules) && f.targetTags.includes('http-server') && !f.disabled),
        hint: 'gcloud compute firewall-rules create allow-http --network=default --allow=tcp:80 --target-tags=http-server --source-ranges=0.0.0.0/0'
      }
    ],
    solution: [
      'gcloud config set project kopi-dev-3141',
      'gcloud config set compute/region asia-southeast2',
      'gcloud config set compute/zone asia-southeast2-a',
      'gcloud services enable compute.googleapis.com',
      'gcloud compute instances create web-1 --machine-type=e2-micro --tags=http-server',
      'gcloud compute firewall-rules create allow-http --network=default --allow=tcp:80 --target-tags=http-server'
    ],
    lesson:
      'Urutan khas project baru: pilih project, set region/zone default, nyalakan API, baru buat resource. Network tag + target-tags membuat rule firewall hanya mengenai VM yang membutuhkannya.'
  },
  {
    id: 'billing',
    title: 'Project baru tanpa billing',
    level: 'Dasar',
    summary: 'Buat project, hubungkan ke billing account, lalu aktifkan Compute Engine.',
    topics: ['Resource Manager', 'Cloud Billing', 'APIs'],
    story:
      'Tim analitik butuh project terpisah dengan ID kopi-analytics. Buat project-nya dari CLI, hubungkan ke billing account perusahaan, jadikan project aktif, lalu nyalakan Compute Engine API. Perhatikan apa yang terjadi kalau billing belum terhubung.',
    build() {
      return newState([newProject('kopi-dev-3141', { compute: true })], { project: 'kopi-dev-3141' });
    },
    tasks: [
      { label: 'Project kopi-analytics ada', check: (s) => !!P(s, 'kopi-analytics'), hint: 'gcloud projects create kopi-analytics' },
      { label: 'Billing account terhubung', check: (s) => !!P(s, 'kopi-analytics')?.billing, hint: 'gcloud billing accounts list lalu gcloud billing projects link kopi-analytics --billing-account=ID' },
      { label: 'kopi-analytics jadi project aktif', check: (s) => config(s).project === 'kopi-analytics', hint: 'gcloud config set project kopi-analytics' },
      { label: 'Compute Engine API aktif di kopi-analytics', check: (s) => !!P(s, 'kopi-analytics')?.services.includes('compute.googleapis.com'), hint: 'gcloud services enable compute.googleapis.com' }
    ],
    solution: [
      'gcloud projects create kopi-analytics',
      'gcloud billing accounts list',
      'gcloud billing projects link kopi-analytics --billing-account=0X0X0X-0X0X0X-0X0X0X',
      'gcloud config set project kopi-analytics',
      'gcloud services enable compute.googleapis.com'
    ],
    lesson:
      'API berbayar (Compute, GKE, Cloud Run, Cloud SQL) tidak bisa dinyalakan sebelum project terhubung ke billing account. Membuat project juga tidak otomatis menjadikannya project aktif di gcloud.'
  },
  {
    id: 'custom-vpc',
    title: 'VPC custom, NAT dan SSH lewat IAP',
    level: 'Menengah',
    summary: 'Bangun jaringan private: subnet dengan PGA, VM tanpa external IP, Cloud NAT, SSH via IAP.',
    topics: ['VPC', 'Subnet', 'Cloud NAT', 'IAP', 'Private Google Access'],
    story:
      'Keamanan meminta VM aplikasi tanpa external IP. Buat VPC custom prod-vpc dengan subnet app-jkt (10.10.0.0/24, asia-southeast2, Private Google Access aktif). VM app-1 di subnet itu harus bisa apt-get (keluar ke internet) dan bisa di-SSH admin lewat IAP — tapi tidak bisa dijangkau langsung dari internet.',
    build() {
      return newState([newProject('kopi-prod-2718', { compute: true })], { project: 'kopi-prod-2718', region: 'asia-southeast2', zone: 'asia-southeast2-a' });
    },
    tasks: [
      {
        label: 'VPC prod-vpc dengan subnet mode custom',
        check: (s) => P(s, 'kopi-prod-2718')?.networks.find((n) => n.name === 'prod-vpc')?.mode === 'custom',
        hint: 'gcloud compute networks create prod-vpc --subnet-mode=custom'
      },
      {
        label: 'Subnet app-jkt 10.10.0.0/24 di asia-southeast2, Private Google Access aktif',
        check: (s) => !!P(s, 'kopi-prod-2718')?.subnets.some((x) => x.name === 'app-jkt' && x.network === 'prod-vpc' && x.region === 'asia-southeast2' && x.range === '10.10.0.0/24' && x.pga),
        hint: 'gcloud compute networks subnets create app-jkt --network=prod-vpc --region=asia-southeast2 --range=10.10.0.0/24 --enable-private-ip-google-access'
      },
      {
        label: 'VM app-1 di app-jkt tanpa external IP',
        check: (s) => {
          const i = vm(s, 'kopi-prod-2718', 'app-1');
          return !!i && i.subnet === 'app-jkt' && !i.externalIp;
        },
        hint: 'gcloud compute instances create app-1 --network=prod-vpc --subnet=app-jkt --no-address'
      },
      {
        label: 'SSH lewat IAP ke app-1 berhasil (tcp:22 dari 35.235.240.0/20)',
        check: (s) => reach(s, 'kopi-prod-2718', 'iap', 'app-1', 22),
        hint: 'gcloud compute firewall-rules create allow-iap-ssh --network=prod-vpc --allow=tcp:22 --source-ranges=35.235.240.0/20'
      },
      {
        label: 'app-1 bisa keluar ke internet (Cloud NAT di asia-southeast2)',
        check: (s) => reach(s, 'kopi-prod-2718', 'app-1', 'internet', 443),
        hint: 'gcloud compute routers create nat-router --network=prod-vpc --region=asia-southeast2, lalu gcloud compute routers nats create nat-jkt --router=nat-router --region=asia-southeast2 --auto-allocate-nat-external-ips --nat-all-subnet-ip-ranges'
      },
      {
        label: 'Internet → app-1 tcp:22 tetap tertutup',
        check: (s) => !!vm(s, 'kopi-prod-2718', 'app-1') && !reach(s, 'kopi-prod-2718', 'internet', 'app-1', 22),
        hint: 'Jangan beri app-1 external IP dan jangan buka tcp:22 ke 0.0.0.0/0.'
      }
    ],
    solution: [
      'gcloud compute networks create prod-vpc --subnet-mode=custom',
      'gcloud compute networks subnets create app-jkt --network=prod-vpc --region=asia-southeast2 --range=10.10.0.0/24 --enable-private-ip-google-access',
      'gcloud compute instances create app-1 --network=prod-vpc --subnet=app-jkt --no-address',
      'gcloud compute firewall-rules create allow-iap-ssh --network=prod-vpc --allow=tcp:22 --source-ranges=35.235.240.0/20',
      'gcloud compute routers create nat-router --network=prod-vpc --region=asia-southeast2',
      'gcloud compute routers nats create nat-jkt --router=nat-router --region=asia-southeast2 --auto-allocate-nat-external-ips --nat-all-subnet-ip-ranges',
      'gcloud compute ssh app-1 --tunnel-through-iap'
    ],
    lesson:
      'Pola VM private: tanpa external IP, keluar lewat Cloud NAT (regional, dipasang di Cloud Router), masuk untuk admin lewat IAP dari 35.235.240.0/20, dan Private Google Access untuk API Google. Coba juga lihat hasilnya di lab Topologi.'
  },
  {
    id: 'storage-lifecycle',
    title: 'Bucket arsip invoice',
    level: 'Dasar',
    summary: 'Buat bucket regional, upload, nyalakan versioning dan lifecycle, beri akses baca ke tim finance.',
    topics: ['Cloud Storage', 'Lifecycle', 'Versioning', 'IAM'],
    story:
      'Invoice harus disimpan di Jakarta, dilindungi dari tertimpa tidak sengaja, otomatis pindah ke kelas yang lebih murah setelah 30 hari, dan bisa dibaca (tapi tidak diubah) oleh grup finance@kopi.example. File invoice-001.pdf dan lifecycle.json sudah ada di home Cloud Shell.',
    build() {
      const s = newState([newProject('kopi-dev-3141', { compute: true })], { project: 'kopi-dev-3141' });
      s.files['invoice-001.pdf'] = '%PDF-1.7 … (invoice Oktober)';
      s.files['lifecycle.json'] = JSON.stringify({ rule: [{ action: { type: 'SetStorageClass', storageClass: 'NEARLINE' }, condition: { age: 30 } }, { action: { type: 'Delete' }, condition: { age: 2555 } }] }, null, 2);
      return s;
    },
    tasks: [
      {
        label: 'Bucket gs://kopi-invoices-3141 di ASIA-SOUTHEAST2 dengan uniform bucket-level access',
        check: (s) => {
          const b = P(s, 'kopi-dev-3141')?.buckets.find((x) => x.name === 'kopi-invoices-3141');
          return !!b && b.location === 'ASIA-SOUTHEAST2' && b.uniformAccess;
        },
        hint: 'gsutil mb -l asia-southeast2 -b on gs://kopi-invoices-3141'
      },
      { label: 'invoice-001.pdf ter-upload', check: (s) => !!P(s, 'kopi-dev-3141')?.buckets.find((x) => x.name === 'kopi-invoices-3141')?.objects['invoice-001.pdf'], hint: 'gsutil cp invoice-001.pdf gs://kopi-invoices-3141/' },
      { label: 'Object versioning aktif', check: (s) => !!P(s, 'kopi-dev-3141')?.buckets.find((x) => x.name === 'kopi-invoices-3141')?.versioning, hint: 'gsutil versioning set on gs://kopi-invoices-3141' },
      {
        label: 'Lifecycle: pindah ke NEARLINE setelah 30 hari',
        check: (s) => !!P(s, 'kopi-dev-3141')?.buckets.find((x) => x.name === 'kopi-invoices-3141')?.lifecycle.some((r) => r.action === 'SetStorageClass' && r.storageClass === 'NEARLINE' && r.age === 30),
        hint: 'gsutil lifecycle set lifecycle.json gs://kopi-invoices-3141'
      },
      {
        label: 'group:finance@kopi.example punya roles/storage.objectViewer di bucket',
        check: (s) => !!P(s, 'kopi-dev-3141')?.buckets.find((x) => x.name === 'kopi-invoices-3141')?.iam.some((x) => x.member === 'group:finance@kopi.example' && x.role === 'roles/storage.objectViewer'),
        hint: 'gsutil iam ch group:finance@kopi.example:objectViewer gs://kopi-invoices-3141'
      }
    ],
    solution: [
      'gsutil mb -l asia-southeast2 -b on gs://kopi-invoices-3141',
      'gsutil cp invoice-001.pdf gs://kopi-invoices-3141/',
      'gsutil versioning set on gs://kopi-invoices-3141',
      'gsutil lifecycle set lifecycle.json gs://kopi-invoices-3141',
      'gsutil iam ch group:finance@kopi.example:objectViewer gs://kopi-invoices-3141'
    ],
    lesson:
      'Lokasi bucket ditentukan saat dibuat (default multi-region US!). Versioning melindungi dari overwrite/hapus; lifecycle memindahkan kelas otomatis berdasarkan umur objek. Beri akses ke grup, bukan orang per orang, dan pakai role terkecil (objectViewer).'
  },
  {
    id: 'bq-sales',
    title: 'BigQuery: load CSV lalu query',
    level: 'Menengah',
    summary: 'Muat sales.csv dari Cloud Storage ke BigQuery, perkirakan biaya, lalu jalankan query.',
    topics: ['BigQuery', 'bq', 'Locations', 'Standard SQL'],
    story:
      'File penjualan ada di gs://kopi-raw-3141/sales.csv (bucket di asia-southeast2). Buat dataset sales di lokasi yang cocok, muat file itu ke tabel sales.orders dengan deteksi skema otomatis, cek perkiraan byte yang diproses dengan dry run, lalu hitung jumlah pesanan dengan GoogleSQL.',
    build() {
      const p = newProject('kopi-dev-3141', { compute: true });
      p.buckets.push({
        name: 'kopi-raw-3141',
        location: 'ASIA-SOUTHEAST2',
        storageClass: 'STANDARD',
        versioning: false,
        uniformAccess: true,
        objects: { 'sales.csv': { size: SALES_CSV.length, storageClass: 'STANDARD', rows: 48 } },
        lifecycle: [],
        iam: [],
        retentionSeconds: 0
      });
      const s = newState([p], { project: 'kopi-dev-3141' });
      s.files['sales.csv'] = SALES_CSV;
      return s;
    },
    tasks: [
      { label: 'Dataset sales di asia-southeast2', check: (s) => P(s, 'kopi-dev-3141')?.datasets.find((d) => d.id === 'sales')?.location === 'asia-southeast2', hint: 'bq --location=asia-southeast2 mk -d sales' },
      { label: 'Tabel sales.orders terisi dari CSV', check: (s) => (P(s, 'kopi-dev-3141')?.datasets.find((d) => d.id === 'sales')?.tables.orders?.rows ?? 0) > 0, hint: 'bq load --source_format=CSV --autodetect --skip_leading_rows=1 sales.orders gs://kopi-raw-3141/sales.csv' },
      { label: 'Dry run untuk memperkirakan biaya', check: (s) => s.events.includes('bq.dryrun'), hint: "bq query --use_legacy_sql=false --dry_run 'SELECT COUNT(*) FROM sales.orders'" },
      { label: 'Query GoogleSQL (standard SQL) berhasil', check: (s) => s.events.includes('bq.query.standard'), hint: "bq query --use_legacy_sql=false 'SELECT COUNT(*) FROM sales.orders'" }
    ],
    solution: [
      'bq --location=asia-southeast2 mk -d sales',
      'bq load --source_format=CSV --autodetect --skip_leading_rows=1 sales.orders gs://kopi-raw-3141/sales.csv',
      "bq query --use_legacy_sql=false --dry_run 'SELECT customer, SUM(amount) FROM sales.orders GROUP BY customer'",
      "bq query --use_legacy_sql=false 'SELECT COUNT(*) FROM `kopi-dev-3141.sales.orders`'"
    ],
    lesson:
      'Dataset harus satu lokasi dengan bucket sumber (dan lokasi dataset tidak bisa diubah). bq query memakai legacy SQL secara default — tambahkan --use_legacy_sql=false. --dry_run menunjukkan byte yang akan diproses tanpa biaya.'
  },
  {
    id: 'gke-deploy',
    title: 'GKE: deploy, expose, autoscale',
    level: 'Menengah',
    summary: 'Buat cluster zonal, deploy nginx 3 replika, expose dengan LoadBalancer, pasang HPA.',
    topics: ['GKE', 'kubectl', 'Service', 'HPA'],
    story:
      'Toko online butuh frontend di GKE. Buat cluster shop-cluster (zonal, asia-southeast2-a, 2 node). Deploy web dari image nginx:1.27 dengan 3 replika, buka ke internet di port 80, dan pasang autoscaler 3–10 Pod pada CPU 60%.',
    build() {
      return newState([newProject('kopi-prod-2718', { compute: true })], { project: 'kopi-prod-2718', region: 'asia-southeast2', zone: 'asia-southeast2-a' });
    },
    tasks: [
      { label: 'Kubernetes Engine API aktif', check: (s) => !!P(s, 'kopi-prod-2718')?.services.includes('container.googleapis.com'), hint: 'gcloud services enable container.googleapis.com' },
      {
        label: 'Cluster shop-cluster di asia-southeast2-a dengan 2 node',
        check: (s) => {
          const k = P(s, 'kopi-prod-2718')?.clusters.find((c) => c.name === 'shop-cluster');
          return !!k && k.location === 'asia-southeast2-a' && k.nodes === 2;
        },
        hint: 'gcloud container clusters create shop-cluster --zone=asia-southeast2-a --num-nodes=2'
      },
      {
        label: 'Deployment web, image nginx:1.27, 3 replika',
        check: (s) => {
          const d = kubeCluster(s)?.kube.deployments.find((x) => x.name === 'web' && x.ns === 'default');
          return !!d && d.image === 'nginx:1.27' && d.replicas >= 3;
        },
        hint: 'kubectl create deployment web --image=nginx:1.27 --replicas=3'
      },
      {
        label: 'Service LoadBalancer di port 80',
        check: (s) => !!kubeCluster(s)?.kube.services.some((v) => v.selector === 'web' && v.type === 'LoadBalancer' && v.port === 80),
        hint: 'kubectl expose deployment web --type=LoadBalancer --port=80'
      },
      {
        label: 'HPA web: min 3, max 10, CPU 60%',
        check: (s) => !!kubeCluster(s)?.kube.hpas.some((h) => h.target === 'web' && h.min === 3 && h.max === 10 && h.cpu === 60),
        hint: 'kubectl autoscale deployment web --min=3 --max=10 --cpu-percent=60'
      }
    ],
    solution: [
      'gcloud services enable container.googleapis.com',
      'gcloud container clusters create shop-cluster --zone=asia-southeast2-a --num-nodes=2',
      'kubectl create deployment web --image=nginx:1.27 --replicas=3',
      'kubectl expose deployment web --type=LoadBalancer --port=80',
      'kubectl autoscale deployment web --min=3 --max=10 --cpu-percent=60',
      'kubectl get all'
    ],
    lesson:
      'gcloud membuat cluster dan kredensial; kubectl mengurus isi cluster. Service type LoadBalancer membuat load balancer Google dengan IP publik. HPA menskalakan Pod; cluster autoscaler (flag --enable-autoscaling) menskalakan node — dua hal yang berbeda.'
  },
  {
    id: 'gke-rollback',
    title: 'Rilis v2 gagal — rollback',
    level: 'Menengah',
    summary: 'Ambil kredensial cluster yang sudah ada, rilis image baru, diagnosa, lalu rollback.',
    topics: ['GKE', 'Rolling update', 'Rollback', 'kubectl'],
    story:
      'Cluster prod-gke (regional, asia-southeast2) sudah menjalankan deployment checkout dengan image …/checkout:v1. Tim minta kamu merilis …/checkout:v2. Lakukan rilisnya, periksa statusnya, dan kalau Pod gagal, kembalikan ke versi sebelumnya. Setelah stabil, naikkan replika ke 5 untuk promo malam ini.',
    build() {
      const p = newProject('kopi-prod-2718', { compute: true });
      p.services.push('container.googleapis.com');
      const kube = emptyKube();
      kube.deployments.push({ name: 'checkout', ns: 'default', image: 'asia-southeast2-docker.pkg.dev/kopi-prod-2718/apps/checkout:v1', replicas: 3, history: [], labels: { app: 'checkout' } });
      kube.services.push({ name: 'checkout', ns: 'default', type: 'LoadBalancer', port: 80, targetPort: 8080, selector: 'checkout', externalIp: '34.128.66.10' });
      p.clusters.push({ name: 'prod-gke', location: 'asia-southeast2', mode: 'standard', nodes: 3, machineType: 'e2-standard-4', autoscaling: { min: 1, max: 3 }, release: 'regular', kube });
      const s = newState([p], { project: 'kopi-prod-2718', region: 'asia-southeast2' });
      s.brokenImages.push('asia-southeast2-docker.pkg.dev/kopi-prod-2718/apps/checkout:v2');
      return s;
    },
    tasks: [
      { label: 'kubectl terhubung ke prod-gke', check: (s) => s.kubeContext === 'prod-gke@kopi-prod-2718', hint: 'gcloud container clusters get-credentials prod-gke --region=asia-southeast2' },
      {
        label: 'Rilis v2 sudah dicoba',
        check: (s) => s.events.some((e) => e.startsWith('rollout-undo:checkout:') && e.endsWith(':v2')) || kubeCluster(s)?.kube.deployments.find((d) => d.name === 'checkout')?.image.endsWith(':v2') === true,
        hint: 'kubectl set image deployment/checkout checkout=asia-southeast2-docker.pkg.dev/kopi-prod-2718/apps/checkout:v2'
      },
      {
        label: 'Rollback ke v1 dengan rollout undo',
        check: (s) => s.events.some((e) => e.startsWith('rollout-undo:checkout:') && e.endsWith(':v2')) && !!kubeCluster(s)?.kube.deployments.find((d) => d.name === 'checkout')?.image.endsWith(':v1'),
        hint: 'kubectl rollout status deployment/checkout, kubectl get pods, lalu kubectl rollout undo deployment/checkout'
      },
      { label: 'checkout berjalan dengan 5 replika', check: (s) => kubeCluster(s)?.kube.deployments.find((d) => d.name === 'checkout')?.replicas === 5, hint: 'kubectl scale deployment checkout --replicas=5' }
    ],
    solution: [
      'gcloud container clusters get-credentials prod-gke --region=asia-southeast2',
      'kubectl set image deployment/checkout checkout=asia-southeast2-docker.pkg.dev/kopi-prod-2718/apps/checkout:v2',
      'kubectl rollout undo deployment/checkout',
      'kubectl scale deployment checkout --replicas=5'
    ],
    lesson:
      'Deployment melakukan rolling update: Pod lama baru diganti kalau Pod baru siap, jadi image rusak tidak langsung menjatuhkan layanan. kubectl rollout status/history/undo adalah alat utama untuk rilis dan rollback.'
  },
  {
    id: 'iam-sa',
    title: 'Service account dengan least privilege',
    level: 'Menengah',
    summary: 'Buat service account untuk job laporan, beri role sekecil mungkin, pasang ke VM tanpa file kunci.',
    topics: ['IAM', 'Service accounts', 'Least privilege'],
    story:
      'Job laporan di VM report-1 perlu membaca file di Cloud Storage dan menjalankan query BigQuery. Buat service account report-runner, beri hanya roles/storage.objectViewer dan roles/bigquery.jobUser di project, lalu buat VM report-1 (tanpa external IP) yang berjalan sebagai service account itu. Jangan buat file kunci JSON.',
    build() {
      return newState([newProject('kopi-prod-2718', { compute: true })], { project: 'kopi-prod-2718', region: 'asia-southeast2', zone: 'asia-southeast2-a' });
    },
    tasks: [
      { label: 'Service account report-runner ada', check: (s) => !!P(s, 'kopi-prod-2718')?.serviceAccounts.some((x) => x.name === 'report-runner'), hint: 'gcloud iam service-accounts create report-runner --display-name="Report runner"' },
      { label: 'roles/storage.objectViewer untuk SA itu', check: (s) => !!P(s, 'kopi-prod-2718') && hasBinding(P(s, 'kopi-prod-2718')!, 'roles/storage.objectViewer', 'serviceAccount:report-runner@kopi-prod-2718.iam.gserviceaccount.com'), hint: 'gcloud projects add-iam-policy-binding kopi-prod-2718 --member=serviceAccount:report-runner@kopi-prod-2718.iam.gserviceaccount.com --role=roles/storage.objectViewer' },
      { label: 'roles/bigquery.jobUser untuk SA itu', check: (s) => !!P(s, 'kopi-prod-2718') && hasBinding(P(s, 'kopi-prod-2718')!, 'roles/bigquery.jobUser', 'serviceAccount:report-runner@kopi-prod-2718.iam.gserviceaccount.com'), hint: 'Sama seperti sebelumnya, dengan --role=roles/bigquery.jobUser' },
      {
        label: 'Tidak ada role basic (owner/editor) untuk SA itu',
        check: (s) => {
          const p = P(s, 'kopi-prod-2718');
          const m = 'serviceAccount:report-runner@kopi-prod-2718.iam.gserviceaccount.com';
          return !!p && !!p.serviceAccounts.some((x) => x.name === 'report-runner') && !hasBinding(p, 'roles/owner', m) && !hasBinding(p, 'roles/editor', m);
        },
        hint: 'Kalau terlanjur: gcloud projects remove-iam-policy-binding … --role=roles/editor'
      },
      {
        label: 'VM report-1 berjalan sebagai report-runner, tanpa external IP',
        check: (s) => {
          const i = vm(s, 'kopi-prod-2718', 'report-1');
          return !!i && i.serviceAccount === 'report-runner@kopi-prod-2718.iam.gserviceaccount.com' && !i.externalIp;
        },
        hint: 'gcloud compute instances create report-1 --no-address --service-account=report-runner@kopi-prod-2718.iam.gserviceaccount.com --scopes=cloud-platform'
      },
      { label: 'Tidak ada kunci JSON yang dibuat', check: (s) => !!P(s, 'kopi-prod-2718')?.serviceAccounts.some((x) => x.name === 'report-runner' && x.keys === 0), hint: 'VM memakai service account terpasang; kunci tidak diperlukan.' }
    ],
    solution: [
      'gcloud iam service-accounts create report-runner --display-name="Report runner"',
      'gcloud projects add-iam-policy-binding kopi-prod-2718 --member=serviceAccount:report-runner@kopi-prod-2718.iam.gserviceaccount.com --role=roles/storage.objectViewer',
      'gcloud projects add-iam-policy-binding kopi-prod-2718 --member=serviceAccount:report-runner@kopi-prod-2718.iam.gserviceaccount.com --role=roles/bigquery.jobUser',
      'gcloud compute instances create report-1 --no-address --service-account=report-runner@kopi-prod-2718.iam.gserviceaccount.com --scopes=cloud-platform'
    ],
    lesson:
      'Workload di Google Cloud sebaiknya memakai service account terpasang (attached), bukan file kunci. Beri predefined role yang paling sempit; scope cloud-platform + IAM adalah praktik yang disarankan, karena IAM yang membatasi akses.'
  },
  {
    id: 'mig-autoscale',
    title: 'Instance template + MIG autoscaling',
    level: 'Menengah',
    summary: 'Buat template, managed instance group regional, dan autoscaling berbasis CPU.',
    topics: ['Instance templates', 'Managed instance groups', 'Autoscaling'],
    story:
      'Website katalog harus tahan kegagalan satu zone dan menyesuaikan kapasitas otomatis. Buat instance template web-tpl (e2-small, tag http-server), lalu managed instance group web-mig regional di asia-southeast2 dengan 2 VM, dan autoscaling 2–6 VM pada target CPU 60%.',
    build() {
      return newState([newProject('kopi-prod-2718', { compute: true })], { project: 'kopi-prod-2718', region: 'asia-southeast2', zone: 'asia-southeast2-a' });
    },
    tasks: [
      {
        label: 'Template web-tpl: e2-small, tag http-server',
        check: (s) => !!P(s, 'kopi-prod-2718')?.templates.some((t) => t.name === 'web-tpl' && t.machineType === 'e2-small' && t.tags.includes('http-server')),
        hint: 'gcloud compute instance-templates create web-tpl --machine-type=e2-small --tags=http-server'
      },
      {
        label: 'MIG web-mig regional di asia-southeast2 dari web-tpl',
        check: (s) => !!P(s, 'kopi-prod-2718')?.migs.some((m) => m.name === 'web-mig' && m.location === 'asia-southeast2' && m.template === 'web-tpl'),
        hint: 'gcloud compute instance-groups managed create web-mig --template=web-tpl --size=2 --region=asia-southeast2'
      },
      {
        label: 'Autoscaling 2–6 VM, target CPU 0.6',
        check: (s) => !!P(s, 'kopi-prod-2718')?.migs.some((m) => m.name === 'web-mig' && m.autoscaling?.min === 2 && m.autoscaling.max === 6 && Math.abs(m.autoscaling.cpu - 0.6) < 1e-9),
        hint: 'gcloud compute instance-groups managed set-autoscaling web-mig --region=asia-southeast2 --min-num-replicas=2 --max-num-replicas=6 --target-cpu-utilization=0.6'
      }
    ],
    solution: [
      'gcloud compute instance-templates create web-tpl --machine-type=e2-small --tags=http-server',
      'gcloud compute instance-groups managed create web-mig --template=web-tpl --size=2 --region=asia-southeast2',
      'gcloud compute instance-groups managed set-autoscaling web-mig --region=asia-southeast2 --min-num-replicas=2 --max-num-replicas=6 --target-cpu-utilization=0.6'
    ],
    lesson:
      'MIG regional menyebar VM ke beberapa zone (tahan kegagalan zone). Instance template tidak bisa diedit — buat template baru lalu lakukan rolling update. Target CPU di gcloud ditulis 0.0–1.0.'
  },
  {
    id: 'cloud-run',
    title: 'Cloud Run publik tanpa cold start',
    level: 'Dasar',
    summary: 'Deploy container ke Cloud Run, izinkan akses publik, dan jaga satu instance tetap hangat.',
    topics: ['Cloud Run', 'Serverless', 'IAM invoker'],
    story:
      'Halaman promo perlu online cepat tanpa mengurus server. Deploy service hello dari image us-docker.pkg.dev/cloudrun/container/hello di asia-southeast2, buat bisa diakses publik, lalu set minimal 1 instance supaya pengunjung pertama tidak kena cold start.',
    build() {
      return newState([newProject('kopi-dev-3141', { compute: true })], { project: 'kopi-dev-3141' });
    },
    tasks: [
      { label: 'Cloud Run Admin API aktif', check: (s) => !!P(s, 'kopi-dev-3141')?.services.includes('run.googleapis.com'), hint: 'gcloud services enable run.googleapis.com' },
      { label: 'Service hello di asia-southeast2', check: (s) => !!P(s, 'kopi-dev-3141')?.run.some((r) => r.name === 'hello' && r.region === 'asia-southeast2'), hint: 'gcloud run deploy hello --image=us-docker.pkg.dev/cloudrun/container/hello --region=asia-southeast2' },
      { label: 'Akses publik (allUsers → roles/run.invoker)', check: (s) => !!P(s, 'kopi-dev-3141')?.run.some((r) => r.name === 'hello' && r.allowUnauthenticated), hint: 'Tambahkan --allow-unauthenticated saat deploy, atau gcloud run services add-iam-policy-binding hello --member=allUsers --role=roles/run.invoker' },
      { label: 'Minimal 1 instance', check: (s) => !!P(s, 'kopi-dev-3141')?.run.some((r) => r.name === 'hello' && r.minInstances >= 1), hint: 'gcloud run services update hello --region=asia-southeast2 --min-instances=1' }
    ],
    solution: [
      'gcloud services enable run.googleapis.com',
      'gcloud run deploy hello --image=us-docker.pkg.dev/cloudrun/container/hello --region=asia-southeast2 --allow-unauthenticated',
      'gcloud run services update hello --region=asia-southeast2 --min-instances=1'
    ],
    lesson:
      'Cloud Run menskalakan container sampai nol. --allow-unauthenticated memberi roles/run.invoker ke allUsers. min-instances menghilangkan cold start dengan biaya instance yang selalu menyala.'
  },
  {
    id: 'sandbox',
    title: 'Sandbox bebas',
    level: 'Dasar',
    summary: 'Project dengan billing dan Compute Engine aktif. Coba perintah apa pun — tanpa task.',
    topics: ['Bebas'],
    story:
      'Project kopi-sandbox sudah aktif dengan network default. Ketik help untuk daftar perintah, atau buka cheat sheet Commands di tab lain dan coba satu per satu.',
    build() {
      const p = newProject('kopi-sandbox', { compute: true });
      addDefaultNetwork(p);
      const s = newState([p], { project: 'kopi-sandbox', region: 'asia-southeast2', zone: 'asia-southeast2-a' });
      s.files['sales.csv'] = SALES_CSV;
      s.files['lifecycle.json'] = JSON.stringify({ rule: [{ action: { type: 'SetStorageClass', storageClass: 'COLDLINE' }, condition: { age: 90 } }] }, null, 2);
      s.files['deployment.yaml'] = [
        'apiVersion: apps/v1',
        'kind: Deployment',
        'metadata:',
        '  name: api',
        'spec:',
        '  replicas: 2',
        '  selector:',
        '    matchLabels:',
        '      app: api',
        '  template:',
        '    metadata:',
        '      labels:',
        '        app: api',
        '    spec:',
        '      containers:',
        '      - name: api',
        '        image: us-docker.pkg.dev/cloudrun/container/hello',
        '---',
        'apiVersion: v1',
        'kind: Service',
        'metadata:',
        '  name: api',
        'spec:',
        '  type: LoadBalancer',
        '  selector:',
        '    app: api',
        '  ports:',
        '  - port: 80',
        '    targetPort: 8080'
      ].join('\n');
      return s;
    },
    tasks: [],
    solution: [],
    lesson: ''
  }
];

export const TERM_BY_ID: Record<string, TermScenario> = Object.fromEntries(TERM_SCENARIOS.map((s) => [s.id, s]));
