/**
 * Cloud Run — the deep-dive lesson. Follows the life of a container on the
 * platform: what you hand over, how a service is modelled, what happens to an
 * instance from start to stop, how it scales, how releases move traffic, and
 * who may reach it. Built from the "Fundamentals of Cloud Run" module (overview,
 * resource model, container lifecycle, autoscaling, access control), updated to
 * current names — request-based and instance-based billing, Direct VPC egress.
 */
import type { Lesson, ScaleInput } from '@/types';

const SVG = (label: string, w: number, h: number, body: string) =>
  `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}" style="font: 13px var(--font); letter-spacing: 0">
  <defs>
    <marker id="run-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/>
    </marker>
  </defs>${body}
</svg>`;

const MINT = 'style="fill: var(--mint)" stroke="currentColor" stroke-width="1.5"';
const ON = 'style="fill: #1a1a1a"';
const ON_SM = 'style="fill: #1a1a1a; font-size: 12px"';
const BOX = 'fill="none" stroke="currentColor" stroke-width="1.5"';
const LINE = 'fill="none" stroke="currentColor" stroke-width="1.5"';
const A = 'marker-end="url(#run-arrow)"';
const SM = 'style="font-size: 12px"';

const FIG_CONTRACT = SVG(
  'Klien mengirim HTTPS ke endpoint run.app; Cloud Run mengurus TLS dan meneruskan HTTP ke port 8080 container milikmu',
  720,
  220,
  `
  <rect x="16" y="70" width="156" height="60" rx="6" ${BOX}/>
  <rect x="216" y="56" width="180" height="88" rx="8" ${MINT}/>
  <rect x="488" y="36" width="216" height="128" rx="8" ${BOX} stroke-dasharray="6 4"/>
  <rect x="504" y="66" width="184" height="36" rx="5" ${BOX}/>
  <rect x="504" y="112" width="184" height="36" rx="5" ${BOX}/>
  <path d="M172,100 L214,100" ${LINE} ${A}/>
  <path d="M396,100 L486,100" ${LINE} ${A}/>
  <path d="M16,170 L396,170 M16,164 L16,176 M396,164 L396,176" ${LINE} opacity="0.5"/>
  <path d="M488,170 L704,170 M488,164 L488,176 M704,164 L704,176" ${LINE} opacity="0.5"/>
  <g fill="currentColor" text-anchor="middle">
    <text x="94" y="97" font-weight="600">Klien</text>
    <text x="94" y="115" opacity="0.7" ${SM}>browser, app, service lain</text>
    <text x="193" y="90" ${SM}>HTTPS</text>
    <text x="306" y="86" ${ON} font-weight="600">Cloud Run</text>
    <text x="306" y="106" ${ON_SM}>*.run.app · TLS · HTTP/2</text>
    <text x="306" y="124" ${ON_SM}>gRPC · WebSockets</text>
    <text x="441" y="90" ${SM}>HTTP :8080</text>
    <text x="596" y="56" opacity="0.7" ${SM}>revision · instance</text>
    <text x="596" y="89">container milikmu</text>
    <text x="596" y="135">container milikmu</text>
    <text x="206" y="196" ${SM}>Diurus Cloud Run: endpoint, sertifikat, load balancing, scaling</text>
    <text x="596" y="196" ${SM}>Urusanmu: kode yang listen di $PORT</text>
  </g>`
);

const FIG_MODEL = SVG(
  'Model resource Cloud Run: service regional berisi revision; revision aktif punya instance. Job berisi execution yang menjalankan beberapa task paralel',
  720,
  300,
  `
  <rect x="16" y="16" width="688" height="268" rx="10" ${BOX} stroke-dasharray="7 5"/>
  <rect x="36" y="44" width="320" height="226" rx="8" ${BOX} opacity="0.55"/>
  <rect x="374" y="44" width="310" height="226" rx="8" ${BOX} opacity="0.55"/>
  <rect x="52" y="80" width="288" height="176" rx="6" ${BOX}/>
  <rect x="68" y="114" width="256" height="40" rx="5" ${BOX} opacity="0.6"/>
  <rect x="68" y="164" width="256" height="80" rx="5" ${MINT}/>
  <g fill="#1a1a1a">
    <rect x="80" y="204" width="24" height="24"/><rect x="112" y="204" width="24" height="24"/><rect x="144" y="204" width="24" height="24"/>
  </g>
  <rect x="390" y="80" width="278" height="176" rx="6" ${BOX}/>
  <rect x="406" y="114" width="246" height="130" rx="5" ${MINT}/>
  <g fill="none" stroke="#1a1a1a" stroke-width="1.5">
    <rect x="418" y="146" width="52" height="36"/><rect x="476" y="146" width="52" height="36"/><rect x="534" y="146" width="52" height="36"/><rect x="592" y="146" width="52" height="36"/>
  </g>
  <g fill="currentColor">
    <text x="32" y="36" font-weight="600">Project ace-lab-123</text>
    <text x="52" y="66" opacity="0.75">Region asia-southeast2</text>
    <text x="390" y="66" opacity="0.75">Region us-central1</text>
    <text x="64" y="102" font-weight="600">Service shop · URL tetap</text>
    <text x="80" y="139" opacity="0.7">shop-00001-abc · 0% traffic</text>
    <text x="80" y="186" ${ON} font-weight="600">shop-00002-xyz · 100%</text>
    <text x="178" y="221" ${ON_SM}>3 instance aktif</text>
    <text x="402" y="102" font-weight="600">Job nightly-report</text>
    <text x="418" y="134" ${ON} font-weight="600">Execution 02:00</text>
    <g text-anchor="middle" ${ON_SM}>
      <text x="444" y="168">task 0</text><text x="502" y="168">task 1</text><text x="560" y="168">task 2</text><text x="618" y="168">task 3</text>
      <text x="529" y="208">tiap task = 1 container, paralel</text>
      <text x="529" y="226">sukses jika semua task sukses</text>
    </g>
  </g>`
);

const FIG_LIFECYCLE = SVG(
  'Siklus hidup container: Starting, Serving, Idle, Shutting down, Stopped. Idle setelah 100 ms tanpa request, kembali Serving saat request datang, SIGTERM memberi 10 detik, crash atau memori penuh langsung Stopped',
  720,
  240,
  `
  <rect x="16" y="94" width="128" height="52" rx="8" ${BOX}/>
  <rect x="200" y="30" width="150" height="52" rx="8" ${MINT}/>
  <rect x="200" y="158" width="150" height="52" rx="8" ${BOX}/>
  <rect x="420" y="158" width="150" height="52" rx="8" ${BOX}/>
  <rect x="596" y="94" width="108" height="52" rx="8" ${BOX}/>
  <g ${LINE}>
    <path d="M144,110 C172,96 176,60 198,58" ${A}/>
    <path d="M258,82 L258,156" ${A}/>
    <path d="M292,158 L292,84" ${A}/>
    <path d="M350,184 L418,184" ${A}/>
    <path d="M570,178 C606,174 636,164 646,148" ${A}/>
    <path d="M350,48 C470,38 610,46 646,92" stroke-dasharray="5 4" ${A}/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="80" y="116" font-weight="600">Starting</text>
    <text x="80" y="134" opacity="0.7" ${SM}>menyalakan app</text>
    <text x="275" y="52" ${ON} font-weight="600">Serving</text>
    <text x="275" y="70" ${ON_SM}>CPU penuh</text>
    <text x="275" y="180" font-weight="600">Idle</text>
    <text x="275" y="198" opacity="0.7" ${SM}>CPU hampir 0</text>
    <text x="495" y="180" font-weight="600">Shutting down</text>
    <text x="495" y="198" opacity="0.7" ${SM}>bersih-bersih</text>
    <text x="650" y="125" font-weight="600">Stopped</text>
    <text x="252" y="124" text-anchor="end" ${SM}>sepi 100 ms</text>
    <text x="298" y="124" text-anchor="start" ${SM}>request masuk</text>
    <text x="384" y="176" ${SM}>SIGTERM</text>
    <text x="616" y="200" ${SM}>maks 10 detik</text>
    <text x="490" y="30" ${SM}>crash / memori penuh</text>
  </g>`
);

const FIG_IMAGE = SVG(
  'Saat deploy, Cloud Run menyalin image dari Artifact Registry ke penyimpanan internalnya; setiap instance baru ditarik dari penyimpanan internal itu',
  720,
  190,
  `
  <rect x="16" y="66" width="170" height="56" rx="6" ${BOX}/>
  <rect x="276" y="66" width="190" height="56" rx="6" ${MINT}/>
  <rect x="556" y="24" width="148" height="36" rx="5" ${BOX}/>
  <rect x="556" y="76" width="148" height="36" rx="5" ${BOX}/>
  <rect x="556" y="128" width="148" height="36" rx="5" ${BOX}/>
  <g ${LINE}>
    <path d="M186,94 L274,94" ${A}/>
    <path d="M466,90 C500,80 520,44 554,42" ${A}/>
    <path d="M466,94 L554,94" ${A}/>
    <path d="M466,98 C500,108 520,144 554,146" ${A}/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="101" y="91" font-weight="600">Artifact Registry</text>
    <text x="101" y="109" opacity="0.7" ${SM}>image kamu</text>
    <text x="230" y="84" ${SM}>deploy: disalin</text>
    <text x="371" y="91" ${ON} font-weight="600">Penyimpanan internal</text>
    <text x="371" y="109" ${ON_SM}>Cloud Run</text>
    <text x="630" y="47">instance baru</text>
    <text x="630" y="99">instance baru</text>
    <text x="630" y="151">instance baru</text>
    <text x="230" y="150" opacity="0.7" ${SM}>image besar dan kecil</text>
    <text x="230" y="166" opacity="0.7" ${SM}>dimuat sama cepat</text>
  </g>`
);

const sq = (x: number, y: number, kind: 'on' | 'idle' | 'off') =>
  kind === 'on'
    ? `<rect x="${x}" y="${y}" width="40" height="40" fill="currentColor" opacity="0.85"/>`
    : kind === 'idle'
      ? `<rect x="${x}" y="${y}" width="40" height="40" ${MINT}/>`
      : `<rect x="${x}" y="${y}" width="40" height="40" ${BOX} stroke-dasharray="4 4" opacity="0.6"/>`;

const FIG_SCALE = SVG(
  'Autoscaling: request masuk ke load balancer internal yang membaginya ke instance aktif; instance idle dijaga oleh min instances; instance baru bisa ditambah sampai max instances; request menunggu di antrean saat belum ada instance',
  720,
  230,
  `
  <g ${LINE}>
    <path d="M16,76 L96,96" ${A}/><path d="M16,104 L96,104" ${A}/><path d="M16,132 L96,112" ${A}/>
    <path d="M170,104 L206,104" ${A}/>
    <path d="M336,90 C350,70 356,66 370,66" ${A}/>
    <path d="M336,100 C352,84 410,80 418,86"/>
    <path d="M336,110 C352,110 452,96 466,86"/>
  </g>
  <rect x="98" y="82" width="72" height="44" rx="5" ${BOX} stroke-dasharray="5 4"/>
  <rect x="208" y="64" width="128" height="80" rx="6" ${MINT}/>
  ${sq(372, 46, 'on')}${sq(420, 46, 'on')}${sq(468, 46, 'on')}${sq(516, 46, 'on')}${sq(564, 46, 'idle')}${sq(612, 46, 'idle')}
  ${sq(372, 118, 'off')}${sq(420, 118, 'off')}${sq(468, 118, 'off')}${sq(516, 118, 'off')}${sq(564, 118, 'off')}${sq(612, 118, 'off')}${sq(660, 118, 'off')}
  <g fill="currentColor">
    <text x="16" y="62" ${SM}>request</text>
    <text x="134" y="108" text-anchor="middle" ${SM}>antrean</text>
    <text x="272" y="98" text-anchor="middle" ${ON} font-weight="600">Load balancer</text>
    <text x="272" y="116" text-anchor="middle" ${ON_SM}>internal</text>
    <text x="372" y="34" ${SM}>aktif (≤ concurrency request masing-masing)</text>
    <text x="604" y="104" text-anchor="middle" ${SM}>idle · min instances</text>
    <text x="372" y="176" ${SM}>belum dinyalakan — bisa ditambah sampai max instances</text>
    <text x="360" y="212" text-anchor="middle" opacity="0.7">Tanpa request sama sekali, semua instance dimatikan (scale to zero) — kecuali yang dijaga min instances.</text>
  </g>`
);

const FIG_TRAFFIC = SVG(
  'Traffic split: URL service membagi 90 persen ke revision lama dan 10 persen ke revision baru bertag canary; URL tag langsung menuju revision canary',
  720,
  230,
  `
  <rect x="16" y="84" width="120" height="56" rx="6" ${BOX}/>
  <rect x="196" y="82" width="160" height="60" rx="6" ${MINT}/>
  <rect x="452" y="30" width="252" height="56" rx="6" ${BOX}/>
  <rect x="452" y="118" width="252" height="56" rx="6" ${BOX}/>
  <g ${LINE}>
    <path d="M136,112 L194,112" ${A}/>
    <path d="M356,102 C400,98 410,60 450,58" ${A}/>
    <path d="M356,122 C400,126 410,146 450,146" ${A}/>
    <path d="M600,204 L600,176" stroke-dasharray="5 4" ${A}/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="76" y="117" font-weight="600">Pengguna</text>
    <text x="276" y="108" ${ON} font-weight="600">URL service</text>
    <text x="276" y="126" ${ON_SM}>traffic split</text>
    <text x="410" y="66" ${SM}>90%</text>
    <text x="410" y="160" ${SM}>10%</text>
    <text x="578" y="55" font-weight="600">shop-00007-plq</text>
    <text x="578" y="73" opacity="0.7" ${SM}>versi stabil</text>
    <text x="578" y="143" font-weight="600">shop-00008-wfx</text>
    <text x="578" y="161" opacity="0.7" ${SM}>versi baru · tag canary</text>
    <text x="400" y="218" ${SM}>URL tag langsung ke revisi itu: https://canary---shop-…run.app</text>
  </g>`
);

const FIG_VPC = SVG(
  'Cloud Run keluar ke VPC: Direct VPC egress menaruh antarmuka langsung di subnet (direkomendasikan); connector Serverless VPC Access memakai VM perantara di rentang /28',
  720,
  240,
  `
  <rect x="16" y="86" width="150" height="64" rx="6" ${BOX}/>
  <rect x="230" y="36" width="190" height="40" rx="6" ${MINT}/>
  <rect x="230" y="160" width="190" height="40" rx="6" ${BOX} stroke-dasharray="5 4"/>
  <rect x="480" y="24" width="224" height="192" rx="10" ${BOX} stroke-dasharray="7 5"/>
  <rect x="496" y="62" width="192" height="38" rx="5" ${BOX}/>
  <rect x="496" y="112" width="192" height="38" rx="5" ${BOX}/>
  <rect x="496" y="162" width="192" height="38" rx="5" ${BOX}/>
  <g ${LINE}>
    <path d="M166,108 C200,100 204,58 228,56" ${A}/>
    <path d="M420,56 C450,56 456,80 478,84" ${A}/>
    <path d="M166,130 C200,140 204,180 228,180" stroke-dasharray="5 4" ${A}/>
    <path d="M420,180 C450,180 456,170 478,166" stroke-dasharray="5 4" ${A}/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="91" y="114" font-weight="600">Cloud Run</text>
    <text x="91" y="132" opacity="0.7" ${SM}>service / job</text>
    <text x="325" y="61" ${ON} font-weight="600">Direct VPC egress</text>
    <text x="325" y="96" opacity="0.7" ${SM}>direkomendasikan · subnet ≥ /26</text>
    <text x="325" y="185">Connector</text>
    <text x="325" y="222" opacity="0.7" ${SM}>cara lama · VM perantara di /28</text>
    <text x="592" y="48" font-weight="600">VPC prod-vpc</text>
    <text x="592" y="86">Memorystore 10.20.0.5</text>
    <text x="592" y="136">Cloud SQL · IP privat</text>
    <text x="592" y="186">VM internal</text>
  </g>`
);

/** Every preset talks to the same small Cloud SQL instance, which takes about 100 connections. */
const S = (rps: number, latencyMs: number, concurrency: number, min: number, max: number, pool: number): ScaleInput => ({
  rps,
  latencyMs,
  concurrency,
  min,
  max,
  pool,
  dbMax: 100
});

const IMG = 'asia-southeast2-docker.pkg.dev/ace-lab-123/apps';
const REGION = '--region=asia-southeast2';

export const lesson: Lesson = {
  id: 'cloud-run',
  lang: 'id',
  title: 'Fundamentals of Cloud Run',
  intro:
    'Cloud Run menjalankan container tanpa server yang harus kamu urus: kamu menyerahkan image, Google menyediakan endpoint HTTPS, menyalakan container saat ada request, menambah dan mematikannya mengikuti traffic. Pelajaran ini mengikuti hidup sebuah container di Cloud Run — dari bentuk resource-nya, siklus hidup dari start sampai berhenti, cara ia di-scale, cara rilis memindahkan traffic, sampai siapa yang boleh memanggilnya. Ada kalkulator autoscaling untuk mencoba sendiri efek concurrency, min dan max instances.',
  practice: [
    { label: 'Terminal: Cloud Run publik tanpa cold start', href: '#/ace/lab/terminal/cloud-run', note: 'deploy, allow-unauthenticated, min instances' },
    { label: 'Kuis perintah: Cloud Run, functions dan App Engine', href: '#/ace/lab/cmd/serverless', note: '21 soal gcloud run' },
    { label: 'Kanvas: toko online serverless', href: '#/ace/lab/canvas/web-serverless', note: 'Cloud Run + database + storage' },
    { label: 'Kanvas: CI/CD ke Cloud Run', href: '#/ace/lab/canvas/cicd', note: 'Cloud Build → Artifact Registry → Cloud Run' },
    { label: 'Kanvas: perbaiki push Pub/Sub 403', href: '#/ace/lab/canvas/fix-push-403', note: 'run.invoker untuk akun push' },
    { label: 'Kanvas: perbaiki timeout ke Cloud SQL', href: '#/ace/lab/canvas/fix-sql-timeout', note: 'Koneksi privat dari Cloud Run' },
    { label: 'Kanvas: laporan harian terjadwal', href: '#/ace/lab/canvas/cron', note: 'Cloud Scheduler memanggil Cloud Run' }
  ],
  parts: [
    // ── 1 ─────────────────────────────────────────────────────────────────
    {
      id: 'intro',
      title: 'Apa itu Cloud Run',
      sections: [
        {
          id: 'what',
          title: 'Kontraknya sederhana: kamu bawa container, Google bawa sisanya',
          blocks: [
            {
              kind: 'p',
              text: '**Cloud Run** adalah platform compute terkelola yang menjalankan **container** langsung di infrastruktur Google. Selama aplikasimu bisa dikemas menjadi image container — bahasa apa pun, framework apa pun — ia bisa jalan di Cloud Run. Tidak ada VM, node, atau cluster yang perlu disiapkan, di-patch, atau di-scale.'
            },
            { kind: 'figure', svg: FIG_CONTRACT, caption: 'Pembagian tugasnya jelas: Cloud Run menyediakan endpoint HTTPS dengan sertifikat TLS yang valid, mendekripsi request, dan meneruskannya sebagai HTTP ke container. Tugasmu hanya memastikan aplikasi mendengarkan port yang diberikan dan menjawab request.' },
            {
              kind: 'table',
              columns: ['Diurus Cloud Run', 'Diurus kamu'],
              rows: [
                ['Endpoint HTTPS unik di `*.run.app` (atau domain sendiri), sertifikat TLS', 'Image container untuk Linux 64-bit'],
                ['Menyalakan container saat ada request, mematikannya saat sepi', 'Aplikasi yang mendengarkan `$PORT` (default 8080) di `0.0.0.0`'],
                ['Load balancing dan autoscaling sampai ratusan instance', 'Aplikasi **stateless** — data disimpan di database atau Cloud Storage, bukan di disk container'],
                ['Menyebar instance ke beberapa zone di satu region', 'Memilih region, memory, CPU, concurrency, dan siapa yang boleh memanggil'],
                ['Log dan error reporting otomatis ke Cloud Logging', 'Menulis log ke stdout/stderr']
              ]
            },
            {
              kind: 'callout',
              tone: 'analogy',
              title: 'Analogi',
              text: 'Cloud Run itu seperti dapur bersama (cloud kitchen). Kamu membawa resep yang sudah dikemas rapi (image). Pengelola menyediakan dapur, kompor, kasir dan kurir. Kompor baru dinyalakan saat ada pesanan, ditambah saat pesanan membludak, dan dimatikan saat sepi — kamu membayar hanya selama kompor menyala.'
            },
            {
              kind: 'list',
              items: [
                '**Bayar sesuai pemakaian**: dengan pengaturan default, biaya hanya dihitung selama container memproses request.',
                '**Setiap deploy membuat revision baru** yang tidak bisa diubah — rollback dan pembagian traffic jadi mudah.',
                'Terintegrasi dengan layanan lain: Cloud SQL, Firestore, Cloud Storage, Pub/Sub, Secret Manager, IAM, Cloud Logging.',
                'Mendukung continuous deployment dari repositori seperti GitHub lewat Cloud Build.'
              ]
            }
          ]
        },
        {
          id: 'service-job',
          title: 'Dua bentuk: service dan job',
          blocks: [
            {
              kind: 'p',
              text: 'Kode di Cloud Run berjalan sebagai **service** atau **job**. Keduanya memakai lingkungan yang sama dan bisa memakai integrasi yang sama; bedanya ada pada kapan kode berhenti.'
            },
            {
              kind: 'table',
              columns: ['', 'Service', 'Job'],
              rows: [
                ['Untuk', 'Kode yang **menjawab** request web atau event', 'Kode yang **mengerjakan** sesuatu lalu selesai'],
                ['Punya URL', 'Ya, HTTPS tetap', 'Tidak'],
                ['Kapan jalan', 'Saat ada request; di-scale otomatis', 'Saat dieksekusi: manual, terjadwal (Cloud Scheduler), atau dari Workflows'],
                ['Paralel', 'Banyak instance sesuai traffic', 'Satu atau banyak **task** paralel (array job)'],
                ['Contoh', 'REST API, website, webhook, microservice gRPC', 'Migrasi database, laporan malam, memproses ribuan gambar di bucket']
              ]
            },
            {
              kind: 'code',
              title: 'Job yang memproses gambar dengan 20 task, 5 jalan bersamaan',
              lines: [
                `$ gcloud run jobs create resize-images --image=${IMG}/resize:1.0 ${REGION} --tasks=20 --parallelism=5 --max-retries=3 --task-timeout=15m`,
                `$ gcloud run jobs execute resize-images ${REGION}`,
                '# di dalam container, CLOUD_RUN_TASK_INDEX (0–19) dan CLOUD_RUN_TASK_COUNT (20)',
                '# menentukan potongan pekerjaan mana yang diambil task itu'
              ]
            }
          ]
        },
        {
          id: 'container',
          title: 'Syarat container dan cara deploy',
          blocks: [
            {
              kind: 'list',
              items: [
                'Image harus berisi binary untuk **Linux 64-bit** — semua yang dibutuhkan aplikasi ikut di dalamnya: kode, runtime, library, paket sistem.',
                'Aplikasi harus **mendengarkan port dari variabel `PORT`** (default 8080) di `0.0.0.0`, bukan `localhost`.',
                'Buka port itu **hanya setelah aplikasi benar-benar siap** — begitu port menerima koneksi, Cloud Run mulai mengirim request.',
                'Filesystem container bisa ditulis, tapi isinya **di memori** (ikut menghabiskan memory limit) dan hilang saat instance berhenti.',
                'Image biasanya disimpan di **Artifact Registry**.'
              ]
            },
            {
              kind: 'code',
              title: 'Dua cara deploy yang paling sering',
              lines: [
                '# dari image yang sudah ada di Artifact Registry',
                `$ gcloud run deploy shop --image=${IMG}/shop:1.4 ${REGION} --allow-unauthenticated`,
                '# langsung dari source code: Cloud Build membangun image dari Dockerfile atau buildpacks',
                `$ gcloud run deploy shop --source=. ${REGION}`,
                'Service [shop] revision [shop-00001-x7d] has been deployed and is serving 100 percent of traffic.',
                'Service URL: https://shop-123456789012.asia-southeast2.run.app'
              ]
            },
            {
              kind: 'callout',
              tone: 'tip',
              text: 'Selain gcloud, service bisa dibuat dari Console, dari file YAML (`gcloud run services replace service.yaml`), atau dengan Terraform. **Cloud Run functions** (dulu Cloud Functions) juga berjalan di atas Cloud Run: kamu cukup menulis fungsi, image-nya dibangunkan untukmu.'
            }
          ]
        },
        {
          id: 'invoke',
          title: 'Cara memanggil sebuah service',
          blocks: [
            {
              kind: 'table',
              columns: ['Cara', 'Cocok untuk'],
              rows: [
                ['**HTTPS** ke URL service', 'REST API, website, webhook, reverse proxy, microservice privat'],
                ['**gRPC** (HTTP/2)', 'Komunikasi cepat antar microservice internal, streaming'],
                ['**WebSockets**', 'Chat, notifikasi real-time — tanpa konfigurasi tambahan'],
                ['**Pub/Sub push**', 'Pesan dikirim sebagai request HTTP: memproses upload, mengolah log yang diekspor, event buatan sendiri'],
                ['**Cloud Scheduler**', 'Seperti cron: backup rutin, membuat ulang sitemap, menghapus data lama, membuat tagihan'],
                ['**Cloud Tasks**', 'Antrean tugas asinkron dengan retry dan pembatasan laju'],
                ['**Eventarc**', 'Event dari layanan Google, misalnya objek baru di Cloud Storage atau job BigQuery selesai']
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              title: 'Di soal ujian',
              text: '"Run a containerized task every night at 2 AM" → Cloud Scheduler memanggil service atau mengeksekusi job. "Process each file uploaded to a bucket" → Eventarc (atau notifikasi Pub/Sub) ke Cloud Run. "Long-running batch that finishes and exits" → Cloud Run job, bukan service.'
            }
          ]
        },
        {
          id: 'when',
          title: 'Kapan memilih Cloud Run',
          blocks: [
            {
              kind: 'table',
              columns: ['Kebutuhan', 'Pilihan yang biasanya tepat'],
              rows: [
                ['Container stateless lewat HTTP atau event, traffic naik-turun, ingin scale to zero', '**Cloud Run**'],
                ['Satu fungsi kecil yang bereaksi pada event, ditulis langsung dari source', '**Cloud Run functions**'],
                ['Banyak microservice yang butuh Kubernetes API, StatefulSet, kontrol node, atau GPU khusus di node pool', '**GKE**'],
                ['Kontrol OS dan kernel, software berlisensi per VM, aplikasi lama yang tidak bisa di-container-kan', '**Compute Engine**'],
                ['Aplikasi web lama yang sudah berjalan di sana', 'App Engine (untuk yang baru, Cloud Run lebih disarankan)']
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              title: 'Di soal ujian',
              text: 'Kata kunci "containerized", "stateless", "without managing infrastructure", "scale to zero", "pay only when requests are processed" hampir selalu menunjuk Cloud Run. Kalau ada "needs Kubernetes" atau "node-level control", pilih GKE.'
            }
          ]
        }
      ]
    },

    // ── 2 ─────────────────────────────────────────────────────────────────
    {
      id: 'model',
      title: 'Model resource',
      sections: [
        {
          id: 'resources',
          title: 'Service, revision, instance — dan job, execution, task',
          blocks: [
            { kind: 'figure', svg: FIG_MODEL, caption: 'Service adalah resource utama dan bersifat regional. Setiap deploy menambah revision; request dikirim ke revision yang mendapat traffic, dan revision itu di-scale menjadi sejumlah instance. Job punya rantai sendiri: setiap eksekusi menjalankan semua task-nya.' },
            {
              kind: 'terms',
              items: [
                {
                  term: 'Service',
                  meaning: 'Resource utama Cloud Run. Tinggal di satu region, punya URL HTTPS yang **tetap** selama service ada. Semua pekerjaan sehari-hari — deploy, rollback, mengubah env var atau scaling — dilakukan terhadap service.',
                  analogy: 'Nama sebuah warung yang terpasang di papan; isinya boleh berganti, alamatnya tetap.',
                  example: '`shop` di asia-southeast2 dengan URL `https://shop-123456789012.asia-southeast2.run.app`.'
                },
                {
                  term: 'Revision',
                  meaning: 'Potret **tidak bisa diubah** dari satu image container plus konfigurasinya: env var, memory, CPU, concurrency, service account. Setiap deploy, dan setiap perubahan konfigurasi, membuat revision baru.',
                  analogy: 'Edisi buku: edisi 2 tidak mengubah edisi 1, keduanya tetap ada di rak.',
                  example: '`shop-00001-abc`, `shop-00002-xyz`.'
                },
                {
                  term: 'Instance',
                  meaning: 'Satu container yang sedang berjalan untuk sebuah revision. Satu instance bisa melayani banyak request sekaligus, sampai batas **concurrency**.',
                  analogy: 'Satu kasir yang bisa melayani beberapa pembeli bergantian.',
                  example: 'Saat ramai revision `shop-00002-xyz` punya 12 instance; tengah malam nol.'
                },
                {
                  term: 'Job · execution · task',
                  meaning: 'Job juga regional. Mengeksekusi job membuat **execution**, yang menjalankan semua **task**-nya; tiap task adalah satu container. Execution sukses hanya jika semua task sukses; task yang gagal dicoba ulang sesuai `--max-retries` dan dibatasi `--task-timeout`.',
                  analogy: 'Satu shift kerja (execution) dengan beberapa pekerja (task) yang membagi tumpukan pekerjaan.',
                  example: 'Execution `nightly-report-x8k2p` dengan 4 task.'
                }
              ]
            }
          ]
        },
        {
          id: 'regions',
          title: 'Regional, tapi tahan gangguan zone',
          blocks: [
            {
              kind: 'p',
              text: 'Region adalah lokasi geografis (misalnya `asia-southeast2` di Jakarta atau `us-central1` di Iowa) yang terdiri dari tiga zone atau lebih. Zone adalah satu domain kegagalan. Service Cloud Run dibuat **per region**, dan instance-nya bisa dinyalakan di zone mana pun di region itu — service yang ramai otomatis tersebar ke beberapa zone, sehingga tetap melayani walau satu zone bermasalah.'
            },
            {
              kind: 'list',
              items: [
                'Satu project boleh punya banyak service di banyak region.',
                'Ingin melayani dari **beberapa region** sekaligus? Deploy service yang sama ke tiap region, lalu taruh **global external Application Load Balancer** dengan serverless NEG di depannya.',
                'Pilih region dekat pengguna dan dekat database-nya — latensi ke Cloud SQL di region lain terasa di setiap request.'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              title: 'Di soal ujian',
              text: '"Cloud Run must survive a zone outage" → tidak perlu apa-apa, sudah multi-zone. "Must survive a region outage / serve users globally with one IP" → beberapa region + global load balancer.'
            }
          ]
        },
        {
          id: 'settings',
          title: 'Pengaturan revision yang paling sering dipakai',
          blocks: [
            {
              kind: 'table',
              columns: ['Flag', 'Default', 'Batas / catatan'],
              mono: [0],
              rows: [
                ['--memory', '512Mi', 'Sampai 32Gi; termasuk file yang ditulis ke filesystem container'],
                ['--cpu', '1', 'Sampai 8'],
                ['--concurrency', '80', '1 sampai 1000 request sekaligus per instance'],
                ['--timeout', '300s', 'Sampai 3600s per request'],
                ['--min-instances', '0', 'Instance yang selalu dijaga hidup (ditagih walau idle)'],
                ['--max-instances', '100', 'Batas atas jumlah instance'],
                ['--port', '8080', 'Port yang dibuka aplikasi; dikirim ke container sebagai `PORT`'],
                ['--set-env-vars / --set-secrets', '—', 'Env var biasa, atau nilai dari Secret Manager'],
                ['--service-account', 'Default compute SA', 'Identitas yang dipakai kode saat memanggil API Google'],
                ['--cpu-throttling / --no-cpu-throttling', 'throttling', 'Request-based atau instance-based billing'],
                ['--cpu-boost', 'mati', 'CPU ekstra saat start untuk memperpendek cold start']
              ]
            },
            {
              kind: 'code',
              lines: [
                `$ gcloud run services update shop ${REGION} --memory=1Gi --cpu=2 --concurrency=40 --set-env-vars=LOG_LEVEL=info`,
                '# perubahan konfigurasi pun membuat revision baru: shop-00003-...'
              ]
            }
          ]
        }
      ]
    },

    // ── 3 ─────────────────────────────────────────────────────────────────
    {
      id: 'lifecycle',
      title: 'Siklus hidup container',
      sections: [
        {
          id: 'states',
          title: 'Lima keadaan sebuah container',
          blocks: [
            { kind: 'figure', svg: FIG_LIFECYCLE, caption: 'Container bisa bolak-balik antara Serving dan Idle berkali-kali. Ia hanya berhenti dari Idle — atau mendadak, kalau aplikasi crash atau memori penuh.' },
            {
              kind: 'table',
              columns: ['Keadaan', 'Yang terjadi', 'CPU', 'Ditagih (request-based)'],
              rows: [
                ['Starting', 'Image diwujudkan menjadi filesystem, aplikasi dijalankan, Cloud Run menunggu port terbuka', 'Penuh', 'Ya'],
                ['Serving', 'Memproses request', 'Penuh', 'Ya'],
                ['Idle', 'Tidak ada request selama 100 ms', 'Ditekan hampir nol', 'Tidak'],
                ['Shutting down', 'Aplikasi menerima `SIGTERM` dan punya 10 detik untuk bersih-bersih', 'Penuh', 'Ya'],
                ['Stopped', 'Container hilang', '—', 'Tidak']
              ]
            }
          ]
        },
        {
          id: 'start',
          title: 'Starting: dari image sampai request pertama',
          blocks: [
            {
              kind: 'steps',
              items: [
                { title: 'Wujudkan image', text: 'Cloud Run membuat root filesystem container dari image.' },
                { title: 'Jalankan entrypoint', text: 'Program utama di image — aplikasimu — dijalankan.' },
                { title: 'Tunggu port terbuka', text: 'Cloud Run terus mencoba port 8080 (atau port yang kamu atur). Bisa juga ditambah **startup probe** HTTP, TCP atau gRPC, dan **liveness probe** untuk memeriksa container yang sudah jalan.' },
                { title: 'Teruskan request', text: 'Begitu aplikasi menerima koneksi TCP, request mulai dikirim. Karena itu jangan buka port sebelum koneksi database dan cache siap.' }
              ]
            },
            { kind: 'figure', svg: FIG_IMAGE, caption: 'Image ditarik dua kali dari dua tempat berbeda: sekali dari Artifact Registry saat deploy, lalu dari penyimpanan internal Cloud Run setiap kali instance baru dinyalakan. Efek sampingnya bagus: menghapus image di Artifact Registry tidak merusak revision yang sudah ada.' },
            {
              kind: 'callout',
              tone: 'tip',
              text: 'Yang membuat cold start lambat biasanya bukan ukuran image, tapi **inisialisasi aplikasi**: memuat framework besar, membuka koneksi, membaca konfigurasi. Inisialisasi secukupnya saat start, sisanya saat dibutuhkan, dan pertimbangkan `--cpu-boost`.'
            }
          ]
        },
        {
          id: 'idle',
          title: 'Idle: hemat, tapi CPU nyaris berhenti',
          blocks: [
            {
              kind: 'p',
              text: 'Setelah 100 ms tanpa request, container masuk keadaan **idle**. Dengan pengaturan default (**request-based billing**), container idle tidak ditagih, tapi CPU-nya ditekan hampir nol, permintaan jaringan ke luar cenderung gagal, dan ia boleh dimatikan kapan saja. Cloud Run bisa menyimpan instance idle sampai sekitar 15 menit untuk menyambut lonjakan berikutnya tanpa cold start; saat request datang, CPU langsung dikembalikan penuh.'
            },
            {
              kind: 'table',
              caption: 'Dua mode penagihan',
              columns: ['', 'Request-based (default)', 'Instance-based'],
              rows: [
                ['Flag', '`--cpu-throttling`', '`--no-cpu-throttling`'],
                ['CPU di luar request', 'Hampir nol', 'Tetap tersedia'],
                ['Ditagih', 'Hanya selama memproses request (plus start dan shutdown)', 'Selama instance hidup'],
                ['Cocok untuk', 'Traffic jarang, naik-turun, berlonjak', 'Traffic stabil, atau pekerjaan latar belakang setelah response dikirim']
              ]
            },
            {
              kind: 'callout',
              tone: 'warn',
              text: 'Pola "kirim response dulu, kerjakan sisanya di background" tidak bisa diandalkan dengan request-based billing. Kerjakan sebelum menjawab, lempar ke **Cloud Tasks** atau Pub/Sub, atau pakai instance-based billing.'
            }
          ]
        },
        {
          id: 'stop',
          title: 'Berhenti: dengan anggun atau mendadak',
          blocks: [
            {
              kind: 'p',
              text: 'Kamu tidak bisa menentukan kapan container dimatikan, tapi bisa bersiap. Sebelum mematikan container idle, Cloud Run mengirim sinyal **`SIGTERM`**. Kalau aplikasi menangkapnya, ia punya **10 detik** untuk menutup koneksi database dan file, mengirim data yang masih ditampung di buffer (misalnya telemetri), dan menulis log terakhir. Kalau tidak ditangkap, prosesnya langsung hilang.'
            },
            {
              kind: 'code',
              title: 'Menangkap SIGTERM di Node.js',
              lines: [
                "process.on('SIGTERM', async () => {",
                "  console.log('SIGTERM diterima, menutup koneksi');",
                '  await pool.end();      // tutup koneksi database',
                '  await metrics.flush(); // kirim data yang masih di buffer',
                '  process.exit(0);',
                '});'
              ]
            },
            {
              kind: 'list',
              items: [
                'Dalam keadaan normal, Cloud Run **tidak pernah mematikan container yang sedang melayani request**.',
                'Container bisa berhenti mendadak bila **aplikasi keluar** (misalnya error yang tidak ditangani) atau **melebihi memory limit** (default 512 MiB, bisa sampai 32 GiB). Semua request yang sedang diproses gagal, dan request baru mungkin menunggu instance pengganti.',
                'Menutup koneksi dengan rapi penting: kalau instance sering naik-turun, koneksi yang dibiarkan menggantung di database bisa menghabiskan batas koneksinya.'
              ]
            }
          ]
        }
      ]
    },

    // ── 4 ─────────────────────────────────────────────────────────────────
    {
      id: 'scaling',
      title: 'Autoscaling',
      sections: [
        {
          id: 'how',
          title: 'Cara Cloud Run menambah dan mengurangi instance',
          blocks: [
            { kind: 'figure', svg: FIG_SCALE, caption: 'Load balancer internal membagi request ke instance sebuah revision. Kalau semua sibuk, instance ditambah; kalau permintaan turun, sebagian berhenti diberi traffic lalu dimatikan.' },
            {
              kind: 'list',
              items: [
                'Jumlah instance dipengaruhi **laju request**, **penggunaan CPU** instance yang ada (targetnya sekitar 60%), **max concurrency**, serta **min dan max instances**.',
                'Default max instances adalah **100** per service. Batas jumlah instance per region dalam project diatur kuota, yang bisa diajukan kenaikannya.',
                'Semua ini berlaku per revision: saat traffic dibagi ke dua revision, masing-masing di-scale sendiri.'
              ]
            }
          ]
        },
        {
          id: 'zero',
          title: 'Scale to zero, antrean, dan cold start',
          blocks: [
            {
              kind: 'p',
              text: 'Tanpa request sama sekali, instance terakhir pun dimatikan — **scale to zero**. Secara biaya ini menarik: tidak ada yang dibayar saat tidak ada yang dipakai. Harganya ada di request pertama setelah sepi: request itu menunggu di **antrean** sampai instance selesai dinyalakan. Inilah **cold start**.'
            },
            {
              kind: 'p',
              text: 'Obatnya adalah **min instances**: Cloud Run selalu menjaga sejumlah instance tetap hidup dan siap, walau sedang idle. Saat request datang, instance aktif bertambah dan yang idle berkurang. Instance yang dijaga ini **tetap ditagih**.'
            },
            { kind: 'code', lines: [`$ gcloud run services update shop ${REGION} --min-instances=1`] }
          ]
        },
        {
          id: 'limits',
          title: 'Max instances dan concurrency: rem dan kapasitas',
          blocks: [
            {
              kind: 'p',
              text: '**Max instances** membatasi berapa banyak instance yang boleh dinyalakan. Gunanya dua: mengendalikan biaya, dan **melindungi sistem di belakangmu** — database yang hanya menerima sekian koneksi, atau API pihak ketiga yang membatasi laju. Terlalu rendah, dan request yang tidak tertampung akan gagal.'
            },
            {
              kind: 'p',
              text: '**Max concurrency** menentukan berapa request yang boleh diproses satu instance sekaligus — default **80**, maksimal **1000**. Concurrency tinggi berarti lebih sedikit instance (lebih murah), tapi setiap request butuh memori tambahan, dan lonjakan bisa langsung diteruskan ke sistem hilir.'
            },
            {
              kind: 'table',
              caption: 'Kapan menurunkan concurrency sampai 1',
              columns: ['Tanda', 'Kenapa'],
              rows: [
                ['Satu request memakai hampir semua CPU atau memori instance', 'Request kedua akan membuat keduanya lambat atau kehabisan memori'],
                ['Kode tidak dirancang untuk banyak request sekaligus', 'Misalnya library yang tidak thread-safe'],
                ['Kode bergantung pada state global yang tidak boleh dibagi antar request', 'Request saling menimpa data']
              ]
            },
            { kind: 'code', lines: [`$ gcloud run services update shop ${REGION} --max-instances=20 --concurrency=80`] },
            {
              kind: 'callout',
              tone: 'tip',
              text: 'Cari concurrency yang pas dengan **load test** yang bisa mengatur jumlah request paralel. Mulai dari default, naikkan selama latensi dan memori tetap sehat.'
            }
          ]
        },
        {
          id: 'calc',
          title: 'Coba sendiri: berapa instance yang menyala?',
          blocks: [
            {
              kind: 'p',
              text: 'Hitungan kasarnya: **request yang sedang diproses = traffic × waktu per request**. 200 request/detik yang masing-masing butuh 0,5 detik berarti sekitar 100 request sedang diproses pada satu saat. Bagi dengan max concurrency, dan kamu dapat jumlah instance minimum yang dibutuhkan. Pilih sebuah situasi, lalu ubah angkanya.'
            },
            {
              kind: 'scaling',
              start: S(40, 250, 80, 0, 100, 5),
              presets: [
                { label: 'Siang biasa', values: S(40, 250, 80, 0, 100, 5), note: '40 request/detik × 0,25 detik = 10 request sedang diproses. Satu instance dengan concurrency 80 sudah cukup.' },
                { label: 'Lonjakan promo', values: S(2000, 400, 80, 0, 100, 5), note: 'Traffic naik 50 kali lipat. Cloud Run menambah instance sendiri sampai sekitar 10 — tidak ada yang perlu disentuh.' },
                { label: 'Concurrency 1', values: S(300, 500, 1, 0, 100, 1), note: 'Aplikasi yang hanya sanggup satu request sekaligus butuh satu instance per request. Dengan max 100, kelebihannya ditolak.' },
                { label: 'Database kecil', values: S(2000, 400, 10, 0, 100, 10), note: 'Cloud SQL kecil ini hanya menerima sekitar 100 koneksi, padahal 80 instance × 10 koneksi = 800. Coba max instances 10 dan concurrency 80.' },
                { label: 'Malam, min 0', values: S(0, 250, 80, 0, 100, 5), note: 'Tidak ada traffic: semua instance mati, biaya nol, tapi pengunjung pertama besok pagi merasakan cold start.' },
                { label: 'Malam, min 2', values: S(0, 250, 80, 2, 100, 5), note: 'Dua instance tetap hidup sepanjang malam: tidak ada cold start, tapi keduanya ditagih walau tidak melayani siapa pun.' }
              ]
            }
          ]
        }
      ]
    },

    // ── 5 ─────────────────────────────────────────────────────────────────
    {
      id: 'release',
      title: 'Rilis dan traffic',
      sections: [
        {
          id: 'revisions',
          title: 'Revision membuat rilis bisa dibatalkan',
          blocks: [
            {
              kind: 'p',
              text: 'Karena revision tidak bisa diubah dan revision lama tetap tersimpan, merilis versi baru sebenarnya hanya soal **ke revision mana traffic dikirim**. Secara default, traffic langsung dipindah ke revision terbaru yang sehat. Kamu bisa membaginya ke beberapa revision sekaligus, atau mengembalikannya ke revision lama dalam hitungan detik.'
            },
            { kind: 'figure', svg: FIG_TRAFFIC, caption: 'Satu URL service, dua revision. Tag memberi revision URL-nya sendiri, sehingga versi baru bisa dicoba tim sebelum menerima traffic pengguna.' },
            {
              kind: 'code',
              title: 'Melihat revision dan traffic',
              lines: [
                `$ gcloud run revisions list --service=shop ${REGION}`,
                '   REVISION        ACTIVE  SERVICE  DEPLOYED                 DEPLOYED BY',
                '✔  shop-00008-wfx  yes     shop     2026-10-18 09:12:40 UTC  dev@example.com',
                '✔  shop-00007-plq  yes     shop     2026-10-17 15:02:11 UTC  dev@example.com',
                `$ gcloud run services describe shop ${REGION} --format="yaml(status.traffic)"`
              ]
            }
          ]
        },
        {
          id: 'canary',
          title: 'Rilis bertahap (canary) dan rollback',
          blocks: [
            {
              kind: 'steps',
              items: [
                { title: 'Deploy tanpa traffic, beri tag', text: 'Revision baru dibuat dan bisa dicoba lewat URL tag, tapi pengguna belum melihatnya.', code: [`gcloud run deploy shop --image=${IMG}/shop:1.5 ${REGION} --no-traffic --tag=canary`] },
                { title: 'Kirim sebagian kecil traffic', text: 'Pantau error rate dan latensi di Cloud Monitoring.', code: [`gcloud run services update-traffic shop ${REGION} --to-tags=canary=10`] },
                { title: 'Naikkan bertahap', text: '10% → 50% → 100% selama metrik sehat.', code: [`gcloud run services update-traffic shop ${REGION} --to-latest`] },
                { title: 'Ada masalah? Kembalikan', text: 'Rollback hanyalah memindah traffic ke revision lama — tanpa build ulang.', code: [`gcloud run services update-traffic shop ${REGION} --to-revisions=shop-00007-plq=100`] }
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              title: 'Di soal ujian',
              text: '"Test a new version with 5% of users" → `update-traffic` dengan persentase (atau tag). "Roll back quickly after a bad release" → arahkan traffic ke revision sebelumnya; tidak perlu deploy ulang image lama.'
            }
          ]
        }
      ]
    },

    // ── 6 ─────────────────────────────────────────────────────────────────
    {
      id: 'access',
      title: 'Akses dan jaringan',
      sections: [
        {
          id: 'iam',
          title: 'Semua lewat API, dan IAM yang memutuskan',
          blocks: [
            {
              kind: 'p',
              text: 'Google Cloud pada dasarnya kumpulan **API**. Console, gcloud, Terraform dan client library hanyalah cara memanggilnya. `gcloud run deploy` pun hanya sebuah panggilan ke `run.googleapis.com`. Setiap panggilan diperiksa **IAM**: siapa pemanggilnya, dan apakah ia punya izin untuk tindakan itu — sama saja apakah kamu men-deploy revision atau aplikasimu menerbitkan pesan ke Pub/Sub.'
            },
            {
              kind: 'steps',
              items: [
                { title: 'Policy menempel di resource', text: 'Setiap resource (project, service Cloud Run, topik Pub/Sub) punya **IAM policy**.' },
                { title: 'Policy berisi binding', text: 'Satu **binding** memberikan satu **role** kepada satu atau beberapa **member** (user, group, service account, `allUsers`).' },
                { title: 'Role berisi permission', text: 'Misalnya `roles/run.invoker` berisi permission untuk memanggil service.' },
                { title: 'Akses diberikan', text: 'Kamu boleh melakukan sesuatu pada resource bila ada binding di policy resource itu (atau di atasnya: project, folder, organisasi) yang memberimu role dengan permission tersebut.' }
              ]
            },
            {
              kind: 'table',
              caption: 'Role Cloud Run yang perlu dikenal',
              columns: ['Role', 'Untuk'],
              mono: [0],
              rows: [
                ['roles/run.admin', 'Mengelola semuanya, termasuk IAM policy service dan job'],
                ['roles/run.developer', 'Membuat dan mengubah service dan job, tanpa mengatur IAM'],
                ['roles/run.invoker', 'Memanggil service'],
                ['roles/run.viewer', 'Melihat saja'],
                ['roles/iam.serviceAccountUser', 'Diberikan pada service account yang dipakai service — syarat untuk deploy dengan `--service-account`']
              ]
            }
          ]
        },
        {
          id: 'invoke-auth',
          title: 'Publik atau privat: siapa boleh memanggil',
          blocks: [
            {
              kind: 'p',
              text: 'Service baru **privat**: hanya identitas dengan permission memanggil (Owner, Editor, atau `roles/run.invoker`) yang diterima. Untuk website publik, berikan `roles/run.invoker` kepada **`allUsers`** — atau pakai `--allow-unauthenticated` saat deploy.'
            },
            {
              kind: 'code',
              title: 'Membuka, membatasi, dan memanggil service',
              lines: [
                '# publik',
                `$ gcloud run services add-iam-policy-binding web ${REGION} --member=allUsers --role=roles/run.invoker`,
                '# hanya service lain, lewat service account-nya',
                `$ gcloud run services add-iam-policy-binding orders ${REGION} --member=serviceAccount:checkout-sa@ace-lab-123.iam.gserviceaccount.com --role=roles/run.invoker`,
                '# untuk semua service di project',
                '$ gcloud projects add-iam-policy-binding ace-lab-123 --member=group:qa@example.com --role=roles/run.invoker',
                '# memanggil service privat dari terminal: sertakan ID token',
                '$ curl -H "Authorization: Bearer $(gcloud auth print-identity-token)" https://orders-123456789012.asia-southeast2.run.app'
              ]
            },
            {
              kind: 'list',
              items: [
                '**Service ke service**: beri service account pemanggil `roles/run.invoker` di service tujuan; pemanggil mengirim ID token di header `Authorization`.',
                '**Pub/Sub push, Cloud Scheduler, Cloud Tasks**: konfigurasikan mereka dengan service account (token OIDC) yang punya `roles/run.invoker`.',
                'Mencabut akses: `gcloud run services remove-iam-policy-binding` (atau `gcloud run jobs remove-iam-policy-binding` untuk job).'
              ]
            }
          ]
        },
        {
          id: 'identity',
          title: 'Identitas service: siapa aplikasimu di mata Google',
          blocks: [
            {
              kind: 'p',
              text: 'Kebalikan dari siapa yang boleh memanggil service, ada pertanyaan **sebagai siapa service itu memanggil API lain** — membaca bucket, menulis ke Firestore, menerbitkan pesan. Jawabannya adalah **service account** revision. Tanpa diatur, Cloud Run memakai Compute Engine default service account, yang sering punya izin terlalu luas.'
            },
            {
              kind: 'code',
              title: 'Least privilege: service account khusus per service',
              lines: [
                '$ gcloud iam service-accounts create shop-sa --display-name="Cloud Run shop"',
                '$ gcloud storage buckets add-iam-policy-binding gs://ace-shop-images --member=serviceAccount:shop-sa@ace-lab-123.iam.gserviceaccount.com --role=roles/storage.objectViewer',
                `$ gcloud run services update shop ${REGION} --service-account=shop-sa@ace-lab-123.iam.gserviceaccount.com`
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              title: 'Di soal ujian',
              text: '"Cloud Run service needs to read from a bucket following least privilege" → service account khusus dengan role sempit di bucket itu, dipasang lewat `--service-account`. Bukan kunci JSON di dalam image, dan bukan default compute SA.'
            }
          ]
        },
        {
          id: 'ingress',
          title: 'Ingress: dari jaringan mana request boleh datang',
          blocks: [
            {
              kind: 'p',
              text: 'IAM menjawab **siapa**, ingress menjawab **dari mana**. Keduanya independen; pakai bersama untuk pertahanan berlapis. Ingress diatur per service dengan `--ingress`.'
            },
            {
              kind: 'table',
              columns: ['Sumber request', 'all (default)', 'internal-and-cloud-load-balancing', 'internal'],
              rows: [
                ['Internet langsung ke URL run.app atau domain sendiri', '✓', '✗', '✗'],
                ['External Application Load Balancer', '✓', '✓', '✗'],
                ['Internal Application Load Balancer, VPC di project atau perimeter VPC SC yang sama', '✓', '✓', '✓'],
                ['Pub/Sub, Eventarc, Cloud Tasks, Workflows di project atau perimeter yang sama', '✓', '✓', '✓']
              ]
            },
            { kind: 'code', lines: [`$ gcloud run services update shop ${REGION} --ingress=internal-and-cloud-load-balancing`] },
            {
              kind: 'callout',
              tone: 'exam',
              title: 'Di soal ujian',
              text: '"Traffic must go through the load balancer (with Cloud Armor), not directly to the run.app URL" → `--ingress=internal-and-cloud-load-balancing`. "Only reachable from inside the VPC" → `--ingress=internal`.'
            }
          ]
        },
        {
          id: 'vpc',
          title: 'Keluar ke VPC: menjangkau IP privat',
          blocks: [
            {
              kind: 'p',
              text: 'Secara default Cloud Run tidak berada di VPC-mu, jadi tidak bisa menjangkau resource ber-IP privat — Memorystore, Cloud SQL dengan IP privat, VM internal. Untuk itu service atau job perlu jalan **keluar ke VPC**.'
            },
            { kind: 'figure', svg: FIG_VPC, caption: 'Dua jalan keluar ke VPC. Keduanya hanya untuk trafik keluar; request yang datang dari VPC ke Cloud Run tetap lewat ingress.' },
            {
              kind: 'table',
              columns: ['', 'Direct VPC egress', 'Serverless VPC Access connector'],
              rows: [
                ['Status', 'Direkomendasikan', 'Cara lama, masih didukung'],
                ['Cara kerja', 'Instance mendapat IP langsung dari subnet', 'Trafik lewat VM perantara milik connector'],
                ['Kebutuhan', 'Subnet di region yang sama, minimal /26', 'Connector di region yang sama, rentang /28 khusus'],
                ['Biaya', 'Hanya biaya trafik jaringan', 'Ditambah biaya VM connector, walau idle'],
                ['Flag', '`--network --subnet --vpc-egress`', '`--vpc-connector`']
              ]
            },
            {
              kind: 'code',
              lines: [
                `$ gcloud run services update cart ${REGION} --network=prod-vpc --subnet=run-jkt --vpc-egress=private-ranges-only`,
                '# private-ranges-only: hanya tujuan IP privat yang lewat VPC',
                '# all-traffic: semua trafik keluar lewat VPC — misalnya agar keluar dengan IP statis Cloud NAT'
              ]
            }
          ]
        }
      ]
    },

    // ── 7 ─────────────────────────────────────────────────────────────────
    {
      id: 'scenarios',
      title: 'Skenario troubleshooting',
      sections: [
        {
          id: 'sc-port',
          title: 'Skenario 1 — Deploy gagal: container tidak mendengarkan port',
          blocks: [
            {
              kind: 'case',
              title: 'Revision tidak pernah siap',
              situation: 'Tim men-deploy API Node.js yang di laptop berjalan di `localhost:3000`.',
              symptom: [
                `$ gcloud run deploy orders --image=${IMG}/orders:1.0 ${REGION}`,
                'Deploying container to Cloud Run service [orders] in project [ace-lab-123] region [asia-southeast2]',
                "ERROR: (gcloud.run.deploy) Revision 'orders-00001-k2m' is not ready and cannot serve traffic. The user-provided container failed to start and listen on the port defined provided by the PORT=8080 environment variable within the allocated timeout."
              ],
              diagnose: [
                'Cloud Run menunggu koneksi TCP di port 8080 (`$PORT`), sedangkan aplikasi membuka port 3000 — dan hanya di `localhost`.',
                'Buka log revision di Cloud Logging: kalau aplikasi crash saat start (env var hilang, gagal konek database), pesannya ada di sana.',
                'Image dibangun di laptop ARM? Cloud Run butuh image `linux/amd64`; image yang salah arsitektur juga gagal start.'
              ],
              fix: [
                '# di kode: baca PORT dan dengarkan semua interface',
                'const port = process.env.PORT || 8080;',
                "app.listen(port, '0.0.0.0');",
                '# atau beri tahu Cloud Run port yang dipakai aplikasi',
                `$ gcloud run deploy orders --image=${IMG}/orders:1.0 ${REGION} --port=3000`
              ],
              why: 'Cloud Run menganggap container siap hanya ketika port yang diatur menerima koneksi. Selama itu belum terjadi, revision tidak menerima traffic dan deploy gagal setelah batas waktu.',
              exam: 'Pesan "failed to start and listen on the port defined by the PORT environment variable" selalu soal port atau aplikasi yang crash saat start.'
            }
          ]
        },
        {
          id: 'sc-403',
          title: 'Skenario 2 — Website publik menjawab 403',
          blocks: [
            {
              kind: 'case',
              title: 'Deploy sukses, pengunjung ditolak',
              situation: 'Landing page di-deploy tanpa `--allow-unauthenticated`. Tim membuka URL-nya dari browser.',
              symptom: ['$ curl -i https://web-123456789012.asia-southeast2.run.app', 'HTTP/2 403', 'Error: Forbidden', 'Your client does not have permission to get URL / from this server.'],
              diagnose: [
                'Service baru privat. IAM memeriksa `roles/run.invoker`, dan pengunjung anonim tidak punya.',
                'Ingress sudah `all` — masalahnya di lapisan IAM, bukan jaringan.',
                'Kalau menambah `allUsers` justru ditolak dengan pesan anggota tidak diizinkan, organisasi memakai org policy **domain restricted sharing**: perlu pengecualian, atau taruh load balancer + IAP di depan.'
              ],
              fix: [`$ gcloud run services add-iam-policy-binding web ${REGION} --member=allUsers --role=roles/run.invoker`],
              why: 'Akses memanggil service adalah IAM biasa: binding role invoker kepada member. `allUsers` berarti siapa pun, tanpa login.',
              exam: '"Make a Cloud Run service publicly accessible" → `allUsers` + `roles/run.invoker`, atau `--allow-unauthenticated`.'
            }
          ]
        },
        {
          id: 'sc-cold',
          title: 'Skenario 3 — Request pertama setiap pagi lambat',
          blocks: [
            {
              kind: 'case',
              title: 'Enam detik untuk pengguna pertama',
              situation: 'API internal dipakai jam kerja saja. Request pertama setiap pagi butuh sekitar 6 detik; berikutnya 80 ms.',
              symptom: ['$ curl -s -o /dev/null -w "%{time_total}\\n" https://reports-123456789012.asia-southeast2.run.app/health', '6.214', '$ curl -s -o /dev/null -w "%{time_total}\\n" https://reports-123456789012.asia-southeast2.run.app/health', '0.083'],
              diagnose: [
                'Semalaman tidak ada request → scale to zero. Request pertama menunggu cold start.',
                'Cold start = menyalakan container + inisialisasi aplikasi. Lihat log start untuk mengetahui bagian mana yang lama: memuat framework, koneksi database, mengunduh konfigurasi.'
              ],
              fix: [
                `$ gcloud run services update reports ${REGION} --min-instances=1 --cpu-boost`,
                '# dan di kode: tunda inisialisasi yang tidak dibutuhkan request pertama'
              ],
              why: 'Min instances menjaga instance tetap hangat sehingga tidak ada cold start (dengan biaya instance idle). Startup CPU boost memberi CPU ekstra saat start sehingga cold start yang tersisa lebih singkat.',
              exam: '"Reduce cold start latency for a Cloud Run service" → min instances.'
            }
          ]
        },
        {
          id: 'sc-db',
          title: 'Skenario 4 — Database kehabisan koneksi saat promo',
          blocks: [
            {
              kind: 'case',
              title: 'Lonjakan traffic, database menolak',
              situation: 'Service `checkout` memakai Cloud SQL PostgreSQL kecil (sekitar 100 koneksi). Tiap instance membuka pool 10 koneksi, concurrency diatur 10. Saat promo, error 500 berhamburan.',
              symptom: ['FATAL:  sorry, too many clients already'],
              diagnose: [
                'Traffic tinggi + concurrency rendah → Cloud Run menyalakan puluhan instance. 80 instance × 10 koneksi = 800 koneksi.',
                'Coba situasi "Database kecil" di kalkulator autoscaling di atas.'
              ],
              fix: [
                `$ gcloud run services update checkout ${REGION} --max-instances=10 --concurrency=80`,
                '# kecilkan pool per instance; untuk traffic lebih besar, perbesar database atau pakai connection pooler'
              ],
              why: 'Max instances adalah rem untuk melindungi sistem hilir. Concurrency yang lebih tinggi memungkinkan instance yang lebih sedikit menampung traffic yang sama.',
              exam: '"Cloud Run overwhelms the database during traffic spikes" → batasi max instances.'
            }
          ]
        },
        {
          id: 'sc-background',
          title: 'Skenario 5 — Email konfirmasi kadang tidak terkirim',
          blocks: [
            {
              kind: 'case',
              title: 'Pekerjaan setelah response menghilang',
              situation: 'Handler pesanan langsung menjawab 200, lalu mengirim email konfirmasi "di belakang" tanpa menunggu.',
              symptom: ['Order 4812 created', 'Sending confirmation email to customer…', '# tidak ada log "email sent", kadang muncul timeout jaringan'],
              diagnose: [
                'Dengan request-based billing, CPU ditekan hampir nol begitu tidak ada request yang diproses — pekerjaan latar belakang berjalan sangat lambat.',
                'Instance idle bisa dimatikan kapan saja, dan permintaan jaringan saat idle cenderung gagal.'
              ],
              fix: [
                '# pilihan 1: kirim email sebelum menjawab',
                '# pilihan 2: masukkan ke Cloud Tasks / Pub/Sub, yang memanggil endpoint pengirim email',
                '# pilihan 3: CPU tetap tersedia (ditagih selama instance hidup)',
                `$ gcloud run services update orders ${REGION} --no-cpu-throttling`
              ],
              why: 'Cloud Run menjamin CPU selama request diproses. Di luar itu, hanya instance-based billing yang menjaga CPU tetap ada.',
              exam: '"Background processing after the response is unreliable" → Cloud Tasks, atau CPU always allocated (instance-based billing).'
            }
          ]
        },
        {
          id: 'sc-oom',
          title: 'Skenario 6 — Instance mati saat memproses file besar',
          blocks: [
            {
              kind: 'case',
              title: 'File kecil lancar, file besar gagal',
              situation: 'Service mengubah PDF yang diunggah menjadi gambar, memproses semuanya di memori dan menulis file sementara ke filesystem container.',
              symptom: ['Memory limit of 512 MiB exceeded with 731 MiB used. Consider increasing the memory limit, see https://cloud.google.com/run/docs/configuring/memory-limits'],
              diagnose: [
                'Default memory 512 MiB. File yang ditulis ke filesystem container ikut memakan memori.',
                'Concurrency 80 berarti beberapa file besar bisa diproses bersamaan di instance yang sama.',
                'Saat instance dihentikan karena memori, semua request di instance itu ikut gagal.'
              ],
              fix: [
                `$ gcloud run services update pdf2img ${REGION} --memory=2Gi --cpu=2 --concurrency=4`,
                '# di kode: proses secara streaming, simpan hasil ke Cloud Storage, bukan filesystem container'
              ],
              why: 'Memory limit berlaku per instance untuk semua request yang sedang diprosesnya. Memori lebih besar dan concurrency lebih kecil memberi ruang untuk request berat.',
              exam: 'Container berhenti dengan "memory limit exceeded" → naikkan `--memory` (sampai 32 GiB), turunkan concurrency.'
            }
          ]
        },
        {
          id: 'sc-rollback',
          title: 'Skenario 7 — Rilis baru menaikkan error',
          blocks: [
            {
              kind: 'case',
              title: 'Kembalikan dalam satu perintah',
              situation: 'Versi 1.5 di-deploy dan langsung menerima 100% traffic. Error rate melonjak ke 20%.',
              symptom: [
                `$ gcloud run revisions list --service=shop ${REGION}`,
                '   REVISION        ACTIVE  SERVICE  DEPLOYED',
                '✔  shop-00008-wfx  yes     shop     2026-10-18 09:12:40 UTC',
                '✔  shop-00007-plq          shop     2026-10-17 15:02:11 UTC'
              ],
              diagnose: ['Revision lama `shop-00007-plq` masih ada dan tidak berubah.', 'Rollback tidak butuh build atau deploy ulang — cukup pindahkan traffic.'],
              fix: [
                `$ gcloud run services update-traffic shop ${REGION} --to-revisions=shop-00007-plq=100`,
                '# lain kali: --no-traffic --tag=canary, lalu naikkan persentase bertahap'
              ],
              why: 'Revision immutable membuat setiap versi yang pernah di-deploy siap dipakai lagi. Traffic split adalah tombol pengaturnya.',
              exam: '"Quickly roll back a Cloud Run deployment" → `update-traffic` ke revision sebelumnya.'
            }
          ]
        },
        {
          id: 'sc-vpc',
          title: 'Skenario 8 — Tidak bisa konek ke Redis ber-IP privat',
          blocks: [
            {
              kind: 'case',
              title: 'Timeout ke Memorystore',
              situation: 'Service `cart` butuh Memorystore for Redis di `10.20.0.5`, di jaringan `prod-vpc` region asia-southeast2.',
              symptom: ['Error: connect ETIMEDOUT 10.20.0.5:6379'],
              diagnose: [
                'Cloud Run tidak berada di VPC; paket ke IP privat tidak punya jalan.',
                'Butuh Direct VPC egress (atau connector) di region yang sama dengan service.',
                'Setelah tersambung, firewall VPC juga harus mengizinkan trafik dari subnet yang dipakai Cloud Run.'
              ],
              fix: [`$ gcloud run services update cart ${REGION} --network=prod-vpc --subnet=run-jkt --vpc-egress=private-ranges-only`, '# subnet run-jkt minimal /26, di region yang sama'],
              why: 'Direct VPC egress memberi instance alamat di subnet VPC, sehingga ia bisa menjangkau resource internal lewat IP privat tanpa melewati internet.',
              exam: '"Cloud Run must connect to Memorystore / a VM with an internal IP" → Direct VPC egress atau Serverless VPC Access connector.'
            }
          ]
        },
        {
          id: 'sc-push',
          title: 'Skenario 9 — Pub/Sub push ke service privat ditolak',
          blocks: [
            {
              kind: 'case',
              title: 'Pesan menumpuk, service tidak pernah dipanggil',
              situation: 'Service `orders-worker` sengaja privat. Subscription push dibuat ke URL-nya tanpa pengaturan autentikasi.',
              symptom: ['The request was not authenticated. Either allow unauthenticated invocations or set the proper Authorization header.'],
              diagnose: [
                'Push tanpa token OIDC → request datang tanpa identitas → 403.',
                'Yang dibutuhkan: service account untuk push, dengan `roles/run.invoker` di service tujuan.'
              ],
              fix: [
                '$ gcloud iam service-accounts create push-invoker',
                `$ gcloud run services add-iam-policy-binding orders-worker ${REGION} --member=serviceAccount:push-invoker@ace-lab-123.iam.gserviceaccount.com --role=roles/run.invoker`,
                '$ gcloud pubsub subscriptions update orders-push --push-endpoint=https://orders-worker-123456789012.asia-southeast2.run.app --push-auth-service-account=push-invoker@ace-lab-123.iam.gserviceaccount.com'
              ],
              why: 'Pub/Sub menandatangani token OIDC atas nama service account itu; Cloud Run memeriksa token dan IAM seperti untuk pemanggil lain.',
              exam: 'Pola yang sama berlaku untuk Cloud Scheduler dan Cloud Tasks: service account dengan `roles/run.invoker`, bukan membuka service ke `allUsers`.'
            }
          ]
        }
      ]
    },

    // ── 8 ─────────────────────────────────────────────────────────────────
    {
      id: 'check',
      title: 'Cek pemahaman',
      sections: [
        {
          id: 'quiz',
          title: 'Dua belas soal singkat',
          blocks: [
            { kind: 'quiz', q: 'Apa yang terjadi setiap kali kamu men-deploy image baru ke sebuah service Cloud Run?', options: ['Revision yang ada diperbarui di tempat', 'Revision baru yang tidak bisa diubah dibuat', 'Service baru dengan URL baru dibuat', 'Semua instance di-restart dengan image baru'], answer: 1, explain: 'Setiap deploy (dan setiap perubahan konfigurasi) membuat revision baru yang immutable; URL service tetap.' },
            { kind: 'quiz', q: 'Berapa max concurrency default per instance?', options: ['1', '10', '80', '1000'], answer: 2, explain: 'Default 80, bisa diatur dari 1 sampai 1000.' },
            { kind: 'quiz', q: 'Deploy gagal dengan pesan container "failed to start and listen on the port defined by the PORT environment variable". Penyebab paling mungkin?', options: ['Service account tidak punya role', 'Aplikasi mendengarkan port lain atau hanya localhost', 'Max instances terlalu kecil', 'Ingress diatur internal'], answer: 1, explain: 'Cloud Run menunggu koneksi TCP di `$PORT` (default 8080) pada semua interface.' },
            { kind: 'quiz', q: 'Request pertama setelah malam yang sepi butuh beberapa detik. Pengaturan apa yang paling langsung menghilangkannya?', options: ['--max-instances', '--concurrency=1', '--min-instances=1', '--timeout=3600'], answer: 2, explain: 'Min instances menjaga instance tetap hangat sehingga tidak ada cold start — dengan biaya instance idle.' },
            { kind: 'quiz', q: 'Saat traffic memuncak, Cloud SQL menolak koneksi karena terlalu banyak klien. Pengaturan Cloud Run apa yang membatasinya?', options: ['--min-instances', '--max-instances', '--cpu-boost', '--ingress'], answer: 1, explain: 'Max instances membatasi jumlah instance, sehingga jumlah koneksi ke database ikut terbatas.' },
            { kind: 'quiz', q: 'Aplikasi tidak aman dipakai banyak request sekaligus karena memakai state global. Apa yang diubah?', options: ['Concurrency menjadi 1', 'Memory menjadi 32Gi', 'Min instances menjadi 0', 'Ingress menjadi internal'], answer: 0, explain: 'Concurrency 1 membuat setiap instance memproses satu request pada satu waktu.' },
            { kind: 'quiz', q: 'Bagaimana membuat service Cloud Run bisa diakses publik tanpa login?', options: ['Beri roles/run.admin ke allAuthenticatedUsers', 'Beri roles/run.invoker ke allUsers', 'Ubah ingress ke all', 'Matikan IAM di project'], answer: 1, explain: '`allUsers` + `roles/run.invoker`, atau `--allow-unauthenticated` saat deploy.' },
            { kind: 'quiz', q: 'Service A harus memanggil service B yang privat. Apa yang dibutuhkan?', options: ['Buka B ke allUsers', 'Service account A diberi roles/run.invoker di B, dan A mengirim ID token', 'Taruh keduanya di region yang sama', 'Beri A roles/editor di project'], answer: 1, explain: 'Service-to-service memakai IAM: invoker di service tujuan, ID token di header Authorization.' },
            { kind: 'quiz', q: 'Skrip yang memproses semua file di bucket setiap malam lalu selesai paling cocok dijalankan sebagai…', options: ['Service Cloud Run dengan min instances 1', 'Cloud Run job yang dipicu Cloud Scheduler', 'Service dengan concurrency 1000', 'VM yang selalu menyala'], answer: 1, explain: 'Job menjalankan task sampai selesai lalu berhenti; Cloud Scheduler menjadwalkannya.' },
            { kind: 'quiz', q: 'Pekerjaan yang dijalankan setelah response dikirim sering tidak selesai. Kenapa?', options: ['Request timeout terlalu pendek', 'Dengan request-based billing, CPU ditekan hampir nol di luar request', 'Concurrency terlalu tinggi', 'Image terlalu besar'], answer: 1, explain: 'Gunakan Cloud Tasks / Pub/Sub, kerjakan sebelum menjawab, atau pakai instance-based billing (`--no-cpu-throttling`).' },
            { kind: 'quiz', q: 'Service hanya boleh diakses lewat external Application Load Balancer (dengan Cloud Armor), bukan langsung ke URL run.app. Pengaturannya?', options: ['--ingress=all', '--ingress=internal', '--ingress=internal-and-cloud-load-balancing', '--no-allow-unauthenticated'], answer: 2, explain: 'Pengaturan ini menerima request dari load balancer dan sumber internal, tapi menolak internet langsung.' },
            { kind: 'quiz', q: 'Kamu ingin 10% pengguna mencoba revision baru sebelum rilis penuh. Perintahnya?', options: ['gcloud run deploy --traffic=10', 'gcloud run services update-traffic … --to-revisions=REV=10', 'gcloud run revisions update REV --percent=10', 'gcloud run services update … --max-instances=10'], answer: 1, explain: '`update-traffic` membagi traffic antar revision (atau tag) dalam persen.' }
          ]
        }
      ]
    }
  ]
};
