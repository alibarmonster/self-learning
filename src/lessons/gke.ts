/**
 * Getting started with Google Kubernetes Engine — the deep-dive lesson. Prose
 * in plain Indonesian, terms in English as the exam prints them. Written to
 * GKE as of late 2026: Autopilot as the recommended mode, release channels,
 * VPC-native clusters, Workload Identity Federation for GKE, Artifact Registry.
 */
import type { Lesson } from '@/types';

const SVG = (label: string, w: number, h: number, body: string) =>
  `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}" style="font: 13px var(--font); letter-spacing: 0">
  <defs>
    <marker id="gke-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/>
    </marker>
  </defs>${body}
</svg>`;

const MINT = 'style="fill: var(--mint)" stroke="currentColor" stroke-width="1.5"';
const ON_MINT = 'style="fill: #1a1a1a"';

const FIG_ARCH = SVG(
  'Arsitektur cluster GKE: kubectl memanggil kube-apiserver di control plane yang dikelola Google; control plane berisi etcd, scheduler dan controller manager; setiap node menjalankan kubelet, kube-proxy, containerd dan Pod',
  720,
  360,
  `
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="16" y="150" width="124" height="56" rx="6"/>
    <rect x="168" y="16" width="236" height="328" rx="8" stroke-dasharray="6 4"/>
    <rect x="188" y="106" width="196" height="40" rx="5"/>
    <rect x="188" y="160" width="196" height="40" rx="5"/>
    <rect x="188" y="214" width="196" height="40" rx="5"/>
    <rect x="188" y="268" width="196" height="40" rx="5"/>
    <rect x="432" y="16" width="272" height="156" rx="8"/>
    <rect x="432" y="188" width="272" height="156" rx="8"/>
    <rect x="448" y="50" width="116" height="30" rx="4"/>
    <rect x="574" y="50" width="114" height="30" rx="4"/>
    <rect x="448" y="88" width="240" height="26" rx="4"/>
    <rect x="448" y="124" width="74" height="36" rx="12"/>
    <rect x="531" y="124" width="74" height="36" rx="12"/>
    <rect x="614" y="124" width="74" height="36" rx="12"/>
    <rect x="448" y="222" width="116" height="30" rx="4"/>
    <rect x="574" y="222" width="114" height="30" rx="4"/>
    <rect x="448" y="260" width="240" height="26" rx="4"/>
    <rect x="448" y="296" width="74" height="36" rx="12"/>
    <rect x="531" y="296" width="74" height="36" rx="12"/>
    <path d="M140,172 L186,80" marker-end="url(#gke-arrow)"/>
    <path d="M384,66 L446,65" marker-end="url(#gke-arrow)"/>
    <path d="M384,80 C416,80 414,237 446,237" marker-end="url(#gke-arrow)"/>
    <path d="M286,92 L286,105"/>
  </g>
  <rect x="188" y="52" width="196" height="40" rx="5" ${MINT}/>
  <g fill="currentColor" text-anchor="middle">
    <text x="78" y="174" style="font-weight: 600">kubectl</text>
    <text x="78" y="193" opacity="0.7">Console · CI/CD</text>
    <text x="286" y="40" opacity="0.75">Control plane — dikelola Google</text>
    <text x="286" y="77" ${ON_MINT} font-weight="600">kube-apiserver</text>
    <text x="286" y="131">etcd · menyimpan state</text>
    <text x="286" y="185">kube-scheduler</text>
    <text x="286" y="239">kube-controller-manager</text>
    <text x="286" y="293">cloud-controller-manager</text>
    <text x="286" y="331" opacity="0.65">zonal: 1 replika · regional: 3</text>
    <text x="568" y="38" opacity="0.75">Node 1 · VM Compute Engine</text>
    <text x="568" y="210" opacity="0.75">Node 2 · VM Compute Engine</text>
    <text x="506" y="70">kubelet</text>
    <text x="631" y="70">kube-proxy</text>
    <text x="568" y="106">containerd (container runtime)</text>
    <text x="485" y="147">Pod</text>
    <text x="568" y="147">Pod</text>
    <text x="651" y="147">Pod</text>
    <text x="506" y="242">kubelet</text>
    <text x="631" y="242">kube-proxy</text>
    <text x="568" y="278">containerd</text>
    <text x="485" y="319">Pod</text>
    <text x="568" y="319">Pod</text>
    <text x="96" y="132" opacity="0.65">HTTPS + IAM</text>
  </g>`
);

const FIG_OBJECTS = SVG(
  'Deployment membuat ReplicaSet, ReplicaSet menjaga tiga Pod berlabel app=web, dan Service memilih Pod itu lewat selector app=web',
  720,
  240,
  `
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="16" y="88" width="150" height="64" rx="6"/>
    <rect x="206" y="88" width="160" height="64" rx="6"/>
    <rect x="416" y="22" width="128" height="44" rx="12"/>
    <rect x="416" y="98" width="128" height="44" rx="12"/>
    <rect x="416" y="174" width="128" height="44" rx="12"/>
    <path d="M166,120 L204,120" marker-end="url(#gke-arrow)"/>
    <path d="M366,112 L414,46" marker-end="url(#gke-arrow)"/>
    <path d="M366,120 L414,120" marker-end="url(#gke-arrow)"/>
    <path d="M366,128 L414,194" marker-end="url(#gke-arrow)"/>
    <path d="M590,112 L546,46" stroke-dasharray="4 4"/>
    <path d="M590,120 L546,120" stroke-dasharray="4 4"/>
    <path d="M590,128 L546,194" stroke-dasharray="4 4"/>
  </g>
  <rect x="590" y="88" width="114" height="64" rx="6" ${MINT}/>
  <g fill="currentColor" text-anchor="middle">
    <text x="91" y="113" font-weight="600">Deployment</text>
    <text x="91" y="134" opacity="0.75">web · replicas: 3</text>
    <text x="286" y="113" font-weight="600">ReplicaSet</text>
    <text x="286" y="134" opacity="0.75">web-7d4b9</text>
    <text x="480" y="41">Pod</text><text x="480" y="58" opacity="0.65">app=web</text>
    <text x="480" y="117">Pod</text><text x="480" y="134" opacity="0.65">app=web</text>
    <text x="480" y="193">Pod</text><text x="480" y="210" opacity="0.65">app=web</text>
    <text x="647" y="113" ${ON_MINT} font-weight="600">Service web</text>
    <text x="647" y="134" ${ON_MINT}>selector app=web</text>
    <text x="185" y="110" opacity="0.6">membuat</text>
    <text x="388" y="98" opacity="0.6">menjaga</text>
  </g>`
);

const row = (y: number, name: string, desc: string, a: string, b: string, c: string) => `
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="186" y="${y}" width="146" height="46" rx="6"/>
    <rect x="574" y="${y}" width="130" height="46" rx="12"/>
    <path d="M332,${y + 23} L378,${y + 23}" marker-end="url(#gke-arrow)"/>
    <path d="M528,${y + 23} L572,${y + 23}" marker-end="url(#gke-arrow)"/>
  </g>
  <rect x="380" y="${y}" width="148" height="46" rx="6" ${MINT}/>
  <g fill="currentColor">
    <text x="16" y="${y + 20}" font-weight="600">${name}</text>
    <text x="16" y="${y + 38}" opacity="0.7">${desc}</text>
    <text x="259" y="${y + 28}" text-anchor="middle">${a}</text>
    <text x="454" y="${y + 28}" text-anchor="middle" ${ON_MINT}>${b}</text>
    <text x="639" y="${y + 28}" text-anchor="middle">${c}</text>
  </g>`;

const FIG_TRAFFIC = SVG(
  'Empat cara trafik mencapai Pod: ClusterIP dari dalam cluster, NodePort lewat IP node, LoadBalancer lewat Network Load Balancer publik, dan Ingress atau Gateway lewat Application Load Balancer',
  720,
  296,
  row(16, 'ClusterIP', 'hanya dari dalam cluster', 'Pod frontend', '10.12.5.140:80', 'Pod web') +
    row(88, 'NodePort', 'port tinggi di tiap node', 'Klien di VPC', 'IP node :30080', 'Pod web') +
    row(160, 'LoadBalancer', 'L4, satu IP publik', 'Internet', 'Network LB', 'Pod web') +
    row(232, 'Ingress / Gateway', 'L7, host & path', 'Internet', 'Application LB', 'Pod web (NEG)')
);

const layer = (x: number, y: number, label: string, kind: 'google' | 'you' | 'shared') =>
  kind === 'google'
    ? `<rect x="${x}" y="${y}" width="300" height="36" rx="5" ${MINT}/><text x="${x + 150}" y="${y + 23}" text-anchor="middle" ${ON_MINT}>${label}</text>`
    : `<rect x="${x}" y="${y}" width="300" height="36" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"${kind === 'shared' ? ' stroke-dasharray="5 4"' : ''}/><text x="${x + 150}" y="${y + 23}" text-anchor="middle" fill="currentColor">${label}</text>`;

const LAYERS: [string, 'google' | 'you' | 'shared', 'google' | 'you' | 'shared'][] = [
  ['Workload: Pod, Deployment, YAML', 'you', 'you'],
  ['Keamanan & hardening node', 'you', 'google'],
  ['Kapasitas: node pool, autoscaling', 'you', 'google'],
  ['Node: VM, OS, upgrade, repair', 'shared', 'google'],
  ['Control plane', 'google', 'google'],
  ['Infrastruktur Google', 'google', 'google']
];

const FIG_MODES = SVG(
  'Pembagian tanggung jawab: di GKE Standard kamu mengurus node pool, kapasitas dan keamanan node; di Autopilot Google mengurus semuanya kecuali workload',
  720,
  360,
  `
  <g fill="currentColor" text-anchor="middle" font-weight="600">
    <text x="190" y="30">GKE Standard</text>
    <text x="530" y="30">GKE Autopilot</text>
  </g>
  ${LAYERS.map(([l, s, a], i) => layer(40, 46 + i * 44, l, s) + layer(380, 46 + i * 44, l, a)).join('')}
  <g fill="currentColor" opacity="0.8">
    <rect x="40" y="326" width="16" height="16" rx="3" ${MINT}/><text x="64" y="339">Dikelola Google</text>
    <rect x="210" y="326" width="16" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="234" y="339">Tanggung jawabmu</text>
    <rect x="390" y="326" width="16" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/><text x="414" y="339">Kamu atur, Google membantu (auto-upgrade, auto-repair)</text>
  </g>`
);

const zoneBox = (x: number, w: number, label: string, cp: boolean, nodes: number) => `
  <rect x="${x}" y="52" width="${w}" height="150" rx="6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>
  <text x="${x + w / 2}" y="72" text-anchor="middle" fill="currentColor" opacity="0.7">${label}</text>
  ${cp ? `<rect x="${x + w / 2 - 50}" y="82" width="100" height="32" rx="5" ${MINT}/><text x="${x + w / 2}" y="103" text-anchor="middle" ${ON_MINT}>control plane</text>` : ''}
  ${Array.from({ length: nodes }, (_, i) => {
    const total = nodes * 40 + (nodes - 1) * 10;
    const nx = x + w / 2 - total / 2 + i * 50;
    return `<rect x="${nx}" y="134" width="40" height="40" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="${nx + 20}" y="159" text-anchor="middle" fill="currentColor" style="font-size: 11px">node</text>`;
  }).join('')}`;

const FIG_REGIONAL = SVG(
  'Cluster zonal punya satu control plane dan node di satu zone; cluster regional punya tiga replika control plane dan node di tiga zone, sehingga --num-nodes=1 menghasilkan tiga node',
  720,
  250,
  `
  <g fill="currentColor" font-weight="600">
    <text x="16" y="30">Zonal</text>
    <text x="300" y="30">Regional</text>
  </g>
  <g fill="currentColor" opacity="0.75" style="font-size: 12px">
    <text x="70" y="30">--zone=us-central1-a --num-nodes=3</text>
    <text x="370" y="30">--region=us-central1 --num-nodes=1 → 3 node</text>
  </g>
  ${zoneBox(16, 250, 'us-central1-a', true, 3)}
  ${zoneBox(300, 128, 'us-central1-a', true, 1)}
  ${zoneBox(438, 128, 'us-central1-b', true, 1)}
  ${zoneBox(576, 128, 'us-central1-c', true, 1)}
  <g fill="currentColor" opacity="0.7" style="font-size: 12px">
    <text x="141" y="226" text-anchor="middle">zone mati = cluster mati</text>
    <text x="502" y="226" text-anchor="middle">satu zone mati, cluster tetap melayani</text>
  </g>`
);

const FIG_LIFECYCLE = SVG(
  'Fase Pod: Pending lalu Running, lalu Succeeded atau Failed; Unknown bila status node tidak terbaca',
  720,
  210,
  `
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="24" y="56" width="150" height="50" rx="10"/>
    <rect x="540" y="20" width="160" height="44" rx="10"/>
    <rect x="540" y="98" width="160" height="44" rx="10"/>
    <rect x="290" y="150" width="150" height="44" rx="10" stroke-dasharray="5 4"/>
    <path d="M174,81 L288,81" marker-end="url(#gke-arrow)"/>
    <path d="M440,74 L538,46" marker-end="url(#gke-arrow)"/>
    <path d="M440,88 L538,116" marker-end="url(#gke-arrow)"/>
  </g>
  <rect x="290" y="56" width="150" height="50" rx="10" ${MINT}/>
  <g fill="currentColor" text-anchor="middle">
    <text x="99" y="86" font-weight="600">Pending</text>
    <text x="365" y="86" ${ON_MINT} font-weight="600">Running</text>
    <text x="620" y="47" font-weight="600">Succeeded</text>
    <text x="620" y="125" font-weight="600">Failed</text>
    <text x="365" y="177">Unknown</text>
    <text x="99" y="128" opacity="0.7" style="font-size: 12px">belum dijadwalkan /</text>
    <text x="99" y="144" opacity="0.7" style="font-size: 12px">image belum siap</text>
    <text x="231" y="74" opacity="0.6" style="font-size: 12px">dijadwalkan</text>
    <text x="620" y="82" opacity="0.6" style="font-size: 12px">(Job selesai)</text>
    <text x="620" y="160" opacity="0.6" style="font-size: 12px">container keluar dengan error</text>
    <text x="365" y="132" opacity="0.6" style="font-size: 12px">CrashLoopBackOff tetap Running,</text>
    <text x="365" y="146" opacity="0.6" style="font-size: 12px">tapi RESTARTS terus naik</text>
  </g>`
);

const FIG_WI = SVG(
  'Workload Identity: Pod dengan Kubernetes service account meminta token ke metadata server GKE, yang menukarnya lewat workload identity pool menjadi token Google berumur pendek untuk memanggil Cloud Storage',
  720,
  210,
  `
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="16" y="62" width="140" height="60" rx="10"/>
    <rect x="196" y="62" width="150" height="60" rx="6"/>
    <rect x="586" y="62" width="118" height="60" rx="6"/>
    <path d="M156,92 L194,92" marker-end="url(#gke-arrow)"/>
    <path d="M346,92 L384,92" marker-end="url(#gke-arrow)"/>
    <path d="M546,92 L584,92" marker-end="url(#gke-arrow)"/>
    <path d="M86,122 C86,180 645,180 645,124" stroke-dasharray="5 4" marker-end="url(#gke-arrow)"/>
  </g>
  <rect x="386" y="62" width="160" height="60" rx="6" ${MINT}/>
  <g fill="currentColor" text-anchor="middle">
    <text x="86" y="88" font-weight="600">Pod</text>
    <text x="86" y="107" opacity="0.7">KSA shop/app-ksa</text>
    <text x="271" y="88" font-weight="600">Metadata server</text>
    <text x="271" y="107" opacity="0.7">GKE (di tiap node)</text>
    <text x="466" y="88" ${ON_MINT} font-weight="600">IAM</text>
    <text x="466" y="107" ${ON_MINT}>pool PROJECT.svc.id.goog</text>
    <text x="645" y="88" font-weight="600">Cloud Storage</text>
    <text x="645" y="107" opacity="0.7">cek role</text>
    <text x="175" y="52" opacity="0.65" style="font-size: 12px">1 minta token</text>
    <text x="365" y="52" opacity="0.65" style="font-size: 12px">2 tukar</text>
    <text x="565" y="52" opacity="0.65" style="font-size: 12px">3 token Google</text>
    <text x="365" y="196" opacity="0.65" style="font-size: 12px">4 panggil API dengan token berumur pendek — tanpa file kunci</text>
  </g>`
);

export const lesson: Lesson = {
  id: 'gke',
  lang: 'id',
  title: 'Getting Started with Google Kubernetes Engine',
  intro:
    'Cheat sheet memberi singkatannya; halaman ini memberi ceritanya. Kita mulai dari kenapa container butuh Kubernetes, lalu konsep Kubernetes satu per satu, komponen sebuah cluster GKE, perbedaan Autopilot dan Standard, kubectl, cara "introspeksi" — membaca apa yang sebenarnya terjadi di cluster — dan diakhiri studi kasus yang paling sering muncul, di ujian maupun di pekerjaan. Istilah tetap bahasa Inggris seperti di soal.',
  practice: [
    { label: 'Kuis perintah: GKE (sisi gcloud)', href: '#/ace/lab/cmd/gke', note: '16 soal — create-auto, get-credentials, node pool, resize, autoscaling' },
    { label: 'Kuis perintah: kubectl, melihat isi cluster', href: '#/ace/lab/cmd/kubectl-look', note: 'get, describe, logs, exec, top, events' },
    { label: 'Kuis perintah: kubectl, deploy & scale', href: '#/ace/lab/cmd/kubectl-deploy', note: 'apply, expose, scale, autoscale, rollout, drain' },
    { label: 'Terminal: deploy aplikasi ke GKE', href: '#/ace/lab/terminal/gke-deploy', note: 'Cluster, get-credentials, deployment, service' },
    { label: 'Terminal: rollback deployment', href: '#/ace/lab/terminal/gke-rollback', note: 'set image, rollout status, undo' }
  ],
  parts: [
    // ── 1 ─────────────────────────────────────────────────────────────────
    {
      id: 'start',
      title: 'Memulai',
      sections: [
        {
          id: 'why',
          title: 'GKE dalam satu menit',
          blocks: [
            {
              kind: 'p',
              text: 'Aplikasi modern dikemas sebagai **container**: kode, runtime dan library-nya dibungkus jadi satu **image** yang jalan sama persis di laptop, di server, atau di cloud. Masalahnya muncul saat container-nya banyak: siapa yang memutuskan container mana jalan di mesin mana, menyalakan ulang yang mati, menambah salinan saat trafik naik, dan mengganti versi tanpa downtime?'
            },
            {
              kind: 'p',
              text: '**Kubernetes** adalah sistem yang mengerjakan semua itu. Kamu menulis keinginanmu — "jalankan 3 salinan aplikasi web versi 1.4, buka di port 80" — dan Kubernetes terus-menerus memastikan kenyataan sama dengan keinginan itu. **Google Kubernetes Engine (GKE)** adalah Kubernetes yang dikelola Google: control plane-nya dijalankan, di-patch, di-upgrade dan dibuat high-available oleh Google, dan (di mode Autopilot) node-nya juga.'
            },
            {
              kind: 'callout',
              tone: 'analogy',
              title: 'Analogi',
              text: 'Container itu peti kemas, image adalah cetakan petinya. Kubernetes adalah syahbandar pelabuhan: kamu cukup bilang "kirim 3 peti ini ke tujuan", ia yang memilih kapal (node), memindahkan peti saat kapal rusak, dan menambah kapal saat muatan menumpuk. GKE berarti pelabuhannya dikelola Google.'
            },
            {
              kind: 'table',
              caption: 'Kapan GKE, kapan yang lain',
              columns: ['Kebutuhan', 'Pilihan yang biasanya benar', 'Kenapa'],
              rows: [
                ['Satu service HTTP stateless, ingin tanpa ops', 'Cloud Run', 'Tidak ada cluster untuk diurus; skala ke nol.'],
                ['Banyak microservice, butuh kontrol jaringan, sidecar, job, workload stateful', 'GKE', 'Kubernetes memberi semua primitive itu dalam satu platform.'],
                ['Sudah punya manifest Kubernetes / Helm, ingin portabel antar cloud', 'GKE', 'API Kubernetes sama di mana-mana.'],
                ['Software lama yang butuh OS penuh, lisensi per mesin', 'Compute Engine', 'Kontrol penuh atas VM.'],
                ['Kode kecil yang dipicu event', 'Cloud Run functions', 'Paling sedikit yang perlu ditulis.']
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              title: 'Di soal ujian',
              text: 'Kata kunci "microservices", "containerized application yang sudah memakai Kubernetes", "portability", "hybrid/multicloud" mengarah ke GKE. "Without managing infrastructure" + satu service HTTP mengarah ke Cloud Run. "Without managing nodes" tapi tetap Kubernetes mengarah ke **GKE Autopilot**.'
            }
          ]
        },
        {
          id: 'images',
          title: 'Container image dan Artifact Registry',
          blocks: [
            {
              kind: 'p',
              text: 'Sebelum ada yang bisa jalan di GKE, harus ada image. Image dibangun dari `Dockerfile` (dengan `docker build` di laptop atau `gcloud builds submit` di Cloud Build) lalu disimpan di **Artifact Registry**. Alamatnya selalu berbentuk `REGION-docker.pkg.dev/PROJECT/REPOSITORY/IMAGE:TAG`.'
            },
            {
              kind: 'code',
              title: 'Membangun dan menyimpan image tanpa Docker lokal',
              lines: [
                '$ gcloud artifacts repositories create apps --repository-format=docker --location=us-central1',
                'Created repository [apps].',
                '$ gcloud builds submit --tag=us-central1-docker.pkg.dev/ace-lab-123/apps/web:v1',
                '…',
                'DONE',
                'ID            CREATE_TIME                DURATION  SOURCE  IMAGES                                                STATUS',
                '4f2a9c1e-7b3d 2026-10-18T02:40:00+00:00  41S       gs://…  us-central1-docker.pkg.dev/ace-lab-123/apps/web:v1  SUCCESS'
              ]
            },
            {
              kind: 'callout',
              tone: 'warn',
              title: 'Container Registry sudah ditutup',
              text: 'Alamat `gcr.io/…` dari materi lama milik Container Registry, yang sejak 18 Maret 2025 tidak menerima image baru. Untuk image baru, jawabannya selalu Artifact Registry.'
            },
            {
              kind: 'p',
              text: 'Node GKE menarik image memakai service account node-nya. Kalau repository-nya di project yang sama dan service account node punya `roles/artifactregistry.reader`, semuanya berjalan; kalau tidak, Pod berakhir di `ImagePullBackOff` (lihat studi kasus).'
            }
          ]
        }
      ]
    },

    // ── 2 ─────────────────────────────────────────────────────────────────
    {
      id: 'concepts',
      title: 'Konsep Kubernetes',
      sections: [
        {
          id: 'declarative',
          title: 'Berpikir deklaratif: desired state',
          blocks: [
            {
              kind: 'p',
              text: 'Hal terpenting tentang Kubernetes: kamu tidak menyuruh "jalankan container ini sekarang". Kamu **mendeklarasikan state yang diinginkan** dalam sebuah objek (biasanya file YAML), mengirimnya ke API, lalu **controller** di control plane bekerja dalam lingkaran tanpa henti: lihat kenyataan, bandingkan dengan keinginan, perbaiki selisihnya. Pod mati? Controller membuat yang baru. Node hilang? Pod-nya dijadwalkan ulang di node lain.'
            },
            {
              kind: 'callout',
              tone: 'analogy',
              title: 'Analogi',
              text: 'Seperti AC dengan termostat. Kamu tidak menyalakan dan mematikan kompresor sendiri; kamu menyetel "24°C" dan termostat terus menyesuaikan. `replicas: 3` adalah angka di termostat itu.'
            },
            {
              kind: 'code',
              title: 'deployment.yaml — dibaca dari atas',
              lines: [
                'apiVersion: apps/v1          # grup API dan versinya',
                'kind: Deployment             # jenis objek',
                'metadata:',
                '  name: web                  # nama objek',
                'spec:                        # desired state',
                '  replicas: 3                # selalu 3 Pod',
                '  selector:',
                '    matchLabels: {app: web}  # Pod mana yang menjadi milik Deployment ini',
                '  template:                  # cetakan Pod',
                '    metadata:',
                '      labels: {app: web}',
                '    spec:',
                '      containers:',
                '      - name: web',
                '        image: us-central1-docker.pkg.dev/ace-lab-123/apps/web:v1',
                '        ports: [{containerPort: 8080}]',
                '        resources:',
                '          requests: {cpu: 250m, memory: 512Mi}   # yang dijamin; dasar penjadwalan',
                '          limits: {memory: 512Mi}                # batas atas; lewat = OOMKilled',
                '$ kubectl apply -f deployment.yaml',
                'deployment.apps/web created'
              ]
            },
            {
              kind: 'list',
              items: [
                '`kubectl apply -f` bersifat deklaratif: menjalankannya lagi setelah file diubah hanya menerapkan selisihnya. Ini cara yang dianjurkan dan cocok untuk Git.',
                '`kubectl create deployment …` / `kubectl expose …` bersifat imperatif: cepat untuk mencoba, tapi tidak meninggalkan file yang bisa ditinjau.',
                '**requests** menentukan di node mana Pod muat (scheduler hanya melihat requests). **limits** membatasi pemakaian; melewati limit memori membuat container dibunuh (`OOMKilled`).'
              ]
            }
          ]
        },
        {
          id: 'objects',
          title: 'Objek-objek inti',
          blocks: [
            { kind: 'figure', svg: FIG_OBJECTS, caption: 'Kamu biasanya hanya menulis Deployment dan Service. Deployment membuat ReplicaSet, ReplicaSet menjaga jumlah Pod, dan Service menemukan Pod lewat label — bukan lewat nama, karena nama Pod berganti setiap kali dibuat ulang.' },
            {
              kind: 'terms',
              items: [
                {
                  term: 'Pod',
                  meaning: 'Unit terkecil yang dijalankan Kubernetes: satu atau beberapa container yang selalu dijadwalkan bersama di satu node, berbagi IP dan volume.',
                  analogy: 'Satu kamar kos: penghuninya (container) berbagi alamat dan dapur.',
                  example: 'Container aplikasi + container sidecar pengirim log dalam satu Pod.'
                },
                {
                  term: 'Deployment / ReplicaSet',
                  meaning: 'Deployment menjaga sejumlah Pod identik tetap jalan dan mengatur rolling update; di baliknya ia membuat ReplicaSet untuk tiap versi.',
                  analogy: 'Manajer shift yang memastikan selalu ada 3 kasir, dan mengganti mereka satu per satu saat seragam baru datang.',
                  example: 'Frontend web stateless dengan `replicas: 3`.'
                },
                {
                  term: 'Service',
                  meaning: 'Alamat tetap (nama DNS + IP virtual) di depan sekumpulan Pod yang dipilih lewat label; membagi trafik ke Pod yang Ready.',
                  analogy: 'Nomor telepon kantor: pegawainya berganti, nomornya tetap.',
                  example: '`web.default.svc.cluster.local:80` meneruskan ke Pod berlabel `app=web` di port 8080.'
                },
                {
                  term: 'Label & selector',
                  meaning: 'Label adalah pasangan kunci=nilai di objek; selector adalah kueri atas label. Hampir semua hubungan antar objek dibuat dengan cara ini.',
                  example: '`app=web, tier=frontend`; `kubectl get pods -l app=web`.'
                },
                {
                  term: 'Namespace',
                  meaning: 'Ruang nama di dalam satu cluster untuk memisahkan tim atau lingkungan; RBAC, quota dan network policy bisa diatur per namespace.',
                  example: '`dev`, `staging`, `shop`; `kube-system` berisi komponen sistem.'
                },
                {
                  term: 'ConfigMap & Secret',
                  meaning: 'Konfigurasi di luar image, disuntikkan sebagai env var atau file. Secret untuk data sensitif — tapi isinya hanya di-base64, bukan dienkripsi oleh Kubernetes sendiri.',
                  example: 'URL database di ConfigMap, password di Secret (atau lebih baik: Secret Manager).'
                }
              ]
            }
          ]
        },
        {
          id: 'workloads',
          title: 'Jenis workload: pilih controller yang tepat',
          blocks: [
            {
              kind: 'table',
              columns: ['Controller', 'Untuk apa', 'Contoh', 'Ciri khas'],
              rows: [
                ['**Deployment**', 'Aplikasi stateless', 'Web, API', 'Pod bisa saling menggantikan; rolling update'],
                ['**StatefulSet**', 'Aplikasi stateful', 'Database, Kafka, Elasticsearch', 'Nama stabil (`db-0`, `db-1`), disk sendiri per replika, urutan start/stop'],
                ['**DaemonSet**', 'Satu Pod di setiap node', 'Agen log, agen monitoring, CNI', 'Bertambah otomatis saat node bertambah'],
                ['**Job**', 'Tugas yang selesai', 'Migrasi database, batch', 'Selesai = fase Succeeded; bisa paralel dan diulang'],
                ['**CronJob**', 'Job terjadwal', 'Laporan harian, backup', 'Jadwal format cron, membuat Job baru tiap kali']
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              title: 'Di soal ujian',
              text: '"Run a logging agent on every node" → DaemonSet. "Stable network identity and persistent storage per replica" → StatefulSet. "Run a batch task to completion" → Job. "Stateless web tier" → Deployment.'
            },
            {
              kind: 'p',
              text: 'Untuk menjalankan ulang Pod tanpa mengubah spec (misalnya setelah ConfigMap diganti), pakai `kubectl rollout restart deployment/web` — Pod diganti bertahap dengan cara yang sama seperti update image.'
            }
          ]
        },
        {
          id: 'services',
          title: 'Service: bagaimana trafik sampai ke Pod',
          blocks: [
            { kind: 'figure', svg: FIG_TRAFFIC, caption: 'Empat jalan masuk. Di GKE, Service LoadBalancer membuat passthrough Network Load Balancer (L4) dengan IP publik; Ingress atau Gateway membuat Application Load Balancer (L7) yang langsung ke Pod lewat NEG (container-native load balancing).' },
            {
              kind: 'table',
              columns: ['Jenis', 'Dari mana bisa dicapai', 'Kapan dipakai'],
              rows: [
                ['`ClusterIP` (default)', 'Hanya dari dalam cluster', 'Komunikasi antar service internal: frontend → backend'],
                ['`NodePort`', 'IP node + port 30000–32767', 'Jarang dipakai langsung; dasar bagi jenis lain'],
                ['`LoadBalancer`', 'Internet (atau VPC bila internal)', 'Satu service TCP/UDP ke luar dengan satu IP'],
                ['Ingress / Gateway API', 'Internet lewat satu Application LB', 'Banyak service HTTP(S) di bawah satu IP, routing per host/path, TLS, Cloud Armor, IAP'],
                ['`ExternalName`', '—', 'Nama DNS alias ke layanan di luar cluster']
              ]
            },
            {
              kind: 'code',
              title: 'Membuka Deployment ke internet',
              lines: [
                '$ kubectl expose deployment web --type=LoadBalancer --port=80 --target-port=8080',
                'service/web exposed',
                '$ kubectl get service web',
                'NAME   TYPE           CLUSTER-IP    EXTERNAL-IP   PORT(S)        AGE',
                'web    LoadBalancer   10.12.5.140   <pending>     80:31234/TCP   10s',
                '# setelah ±1 menit Google selesai membuat load balancer-nya',
                'web    LoadBalancer   10.12.5.140   34.70.88.21   80:31234/TCP   72s'
              ]
            },
            {
              kind: 'callout',
              tone: 'tip',
              text: '`port` adalah port Service (yang dipanggil klien), `targetPort` adalah port container. Salah satu kesalahan paling umum: aplikasi mendengarkan 8080 tapi `targetPort` dibiarkan 80.'
            }
          ]
        },
        {
          id: 'storage',
          title: 'Storage: data yang bertahan saat Pod mati',
          blocks: [
            {
              kind: 'p',
              text: 'Disk di dalam container hilang ketika container dibuat ulang. Data yang harus bertahan memakai **PersistentVolumeClaim (PVC)**: Pod "meminta" storage, dan **StorageClass** menentukan jenis disk yang dibuat otomatis (dynamic provisioning) oleh driver Compute Engine Persistent Disk CSI.'
            },
            {
              kind: 'table',
              columns: ['Kebutuhan', 'Di GKE', 'Catatan'],
              rows: [
                ['Disk untuk satu Pod (ReadWriteOnce)', 'StorageClass `standard-rwo` (pd-balanced, default) atau `premium-rwo` (pd-ssd)', 'Disk zonal: Pod harus di zone yang sama dengan disk'],
                ['Satu volume dibaca/ditulis banyak Pod (ReadWriteMany)', 'Filestore (NFS) lewat Filestore CSI', 'Untuk konten bersama, upload'],
                ['Disk per replika database', '`volumeClaimTemplates` di StatefulSet', 'Tiap replika mendapat PVC sendiri: `data-db-0`, `data-db-1`'],
                ['Objek/file besar, data lake', 'Cloud Storage (lewat API atau Cloud Storage FUSE CSI)', 'Bukan block storage']
              ]
            }
          ]
        }
      ]
    },

    // ── 3 ─────────────────────────────────────────────────────────────────
    {
      id: 'components',
      title: 'Komponen GKE',
      sections: [
        {
          id: 'architecture',
          title: 'Arsitektur cluster: control plane dan node',
          blocks: [
            { kind: 'figure', svg: FIG_ARCH, caption: 'Semua perintah — kubectl, Console, pipeline CI — masuk lewat kube-apiserver. Di GKE, seluruh kotak putus-putus itu dijalankan Google; kamu tidak bisa SSH ke sana dan tidak membayar VM-nya.' },
            {
              kind: 'table',
              caption: 'Control plane (dikelola Google)',
              columns: ['Komponen', 'Tugasnya'],
              rows: [
                ['kube-apiserver', 'Pintu masuk satu-satunya. Memeriksa autentikasi (IAM) dan otorisasi (RBAC), lalu menyimpan objek ke etcd.'],
                ['etcd', 'Database key-value berisi seluruh state cluster: semua objek dan statusnya.'],
                ['kube-scheduler', 'Memilih node untuk setiap Pod baru berdasarkan requests, affinity, taint/toleration dan zone.'],
                ['kube-controller-manager', 'Menjalankan controller (Deployment, ReplicaSet, Node, Job…) yang terus menyamakan kenyataan dengan desired state.'],
                ['cloud-controller-manager', 'Jembatan ke Google Cloud: membuat load balancer untuk Service, mengatur route, mengenali node yang hilang.']
              ]
            },
            {
              kind: 'table',
              caption: 'Di setiap node (VM Compute Engine)',
              columns: ['Komponen', 'Tugasnya'],
              rows: [
                ['kubelet', 'Agen node: menerima daftar Pod dari API server, menyuruh runtime menjalankannya, melaporkan status dan menjalankan probe.'],
                ['containerd', 'Container runtime yang benar-benar menarik image dan menjalankan container.'],
                ['kube-proxy / GKE Dataplane V2', 'Mengatur jaringan Service ke Pod di node itu (Dataplane V2 memakai eBPF/Cilium dan juga menegakkan NetworkPolicy).'],
                ['Node image', 'Container-Optimized OS dengan containerd (default) atau Ubuntu.']
              ]
            },
            {
              kind: 'steps',
              items: [
                { title: 'Kamu mengirim manifest', text: '`kubectl apply` mengirim Deployment ke kube-apiserver, yang mengecek identitasmu lalu menyimpannya di etcd.' },
                { title: 'Controller bereaksi', text: 'Deployment controller melihat Deployment baru dan membuat ReplicaSet; ReplicaSet controller membuat 3 objek Pod tanpa node.' },
                { title: 'Scheduler memilih node', text: 'Untuk tiap Pod, scheduler mencari node dengan sisa CPU/memori yang cukup untuk requests-nya dan menuliskan pilihannya.' },
                { title: 'kubelet menjalankan', text: 'kubelet di node terpilih menyuruh containerd menarik image dan menjalankan container, lalu melaporkan status Running/Ready.' },
                { title: 'Lingkaran tidak berhenti', text: 'Kalau container mati, kubelet me-restart-nya; kalau node hilang, controller membuat Pod pengganti dan scheduler menaruhnya di node lain.' }
              ]
            }
          ]
        },
        {
          id: 'location',
          title: 'Node pool, lokasi cluster dan upgrade',
          blocks: [
            {
              kind: 'p',
              text: 'Di mode Standard, node dikelompokkan dalam **node pool**: sekumpulan node dengan konfigurasi sama (machine type, disk, label, taint, Spot atau tidak). Satu cluster bisa punya banyak node pool — misalnya `default-pool` untuk aplikasi biasa dan `gpu-pool` atau `spot-pool` untuk pekerjaan khusus.'
            },
            { kind: 'figure', svg: FIG_REGIONAL, caption: 'Perhatikan angkanya. Di cluster regional, `--num-nodes` berlaku per zone: `--num-nodes=1` di tiga zone menghasilkan tiga node, dan `--num-nodes=3` menghasilkan sembilan.' },
            {
              kind: 'table',
              columns: ['Lokasi', 'Control plane', 'Node', 'Cocok untuk'],
              rows: [
                ['Zonal (single-zone)', '1 replika di satu zone', 'Di zone itu', 'Dev/test, biaya minimum'],
                ['Zonal multi-zone', '1 replika di satu zone', 'Di beberapa zone (`--node-locations`)', 'Workload tahan gangguan zone, tapi API cluster bisa sempat tidak tersedia'],
                ['Regional', '3 replika di 3 zone', 'Di setiap zone region', 'Produksi; upgrade control plane tanpa jeda API']
              ]
            },
            {
              kind: 'list',
              items: [
                '**Release channel** (`rapid`, `regular` — default, `stable`, `extended`) menentukan seberapa cepat cluster menerima versi Kubernetes baru. Google meng-upgrade control plane dan node otomatis sesuai channel.',
                '**Maintenance window** dan **maintenance exclusion** mengatur kapan upgrade otomatis boleh terjadi (misalnya tidak saat Black Friday).',
                '**Surge upgrade** mengganti node bertahap: `maxSurge` node baru dibuat dulu, `maxUnavailable` node lama boleh dikeluarkan sekaligus. Pod dipindahkan dengan menghormati PodDisruptionBudget.',
                '**Node auto-repair** membuat ulang node yang terus gagal health check; **auto-upgrade** menjaga versi node mengikuti control plane.'
              ]
            },
            {
              kind: 'code',
              title: 'Membuat cluster Standard regional dengan dua node pool',
              lines: [
                '$ gcloud container clusters create shop --region=us-central1 --num-nodes=1 --release-channel=regular --workload-pool=ace-lab-123.svc.id.goog',
                '$ gcloud container node-pools create spot-pool --cluster=shop --region=us-central1 --spot --machine-type=e2-standard-4 --num-nodes=1 --enable-autoscaling --min-nodes=0 --max-nodes=5',
                '$ gcloud container node-pools list --cluster=shop --region=us-central1',
                'NAME          MACHINE_TYPE   DISK_SIZE_GB  NODE_VERSION',
                'default-pool  e2-medium      100           1.34.1-gke.1080000',
                'spot-pool     e2-standard-4  100           1.34.1-gke.1080000'
              ]
            }
          ]
        },
        {
          id: 'networking',
          title: 'Jaringan cluster',
          blocks: [
            {
              kind: 'p',
              text: 'Cluster GKE modern bersifat **VPC-native**: setiap Pod mendapat IP sungguhan dari VPC (alias IP), sehingga Pod bisa dijangkau langsung dari VM lain dan dari load balancer. Untuk itu subnet cluster punya tiga rentang: rentang primer untuk node, rentang sekunder untuk **Pod**, dan rentang sekunder untuk **Service**.'
            },
            {
              kind: 'table',
              columns: ['Rentang', 'Contoh', 'Habis kalau…'],
              rows: [
                ['Node (primer)', '10.10.0.0/24', 'Node tidak bisa ditambah'],
                ['Pod (sekunder)', '10.40.0.0/14', 'Node baru tidak mendapat blok IP Pod — cluster berhenti tumbuh. Di Standard tiap node mengambil /24 (maks. 110 Pod) secara default.'],
                ['Service (sekunder)', '10.12.0.0/20', 'Service baru tidak mendapat ClusterIP']
              ],
              mono: [1]
            },
            {
              kind: 'list',
              items: [
                '**Private nodes** (`--enable-private-nodes`): node tanpa IP eksternal. Aman, tapi untuk menarik image dari internet (Docker Hub) butuh **Cloud NAT**; image di Artifact Registry tetap bisa lewat Private Google Access.',
                '**Control plane authorized networks**: membatasi IP mana yang boleh memanggil API cluster (misalnya hanya kantor dan Cloud Shell).',
                '**NetworkPolicy**: firewall antar Pod di dalam cluster ("hanya frontend boleh ke backend port 8080"), ditegakkan oleh Dataplane V2.',
                'Firewall VPC tetap berlaku untuk trafik dari luar ke node; GKE membuat rule yang dibutuhkan untuk health check load balancer secara otomatis.'
              ]
            }
          ]
        },
        {
          id: 'identity',
          title: 'Identitas: IAM, RBAC dan Workload Identity',
          blocks: [
            {
              kind: 'p',
              text: 'Ada dua pertanyaan berbeda yang sering tertukar. Pertama, **siapa boleh mengelola cluster** — orang dan pipeline yang memanggil API GKE. Kedua, **apa yang boleh dilakukan aplikasi** di dalam Pod terhadap layanan Google lain (Cloud Storage, BigQuery, Pub/Sub).'
            },
            {
              kind: 'table',
              columns: ['Lapisan', 'Mengatur', 'Contoh'],
              rows: [
                ['IAM (level project)', 'Siapa boleh membuat cluster dan memakai API Kubernetes', '`roles/container.admin`, `roles/container.developer`, `roles/container.viewer`'],
                ['RBAC Kubernetes', 'Detail di dalam cluster, per namespace', '`Role` + `RoleBinding`: tim A boleh mengelola Deployment di namespace `shop` saja'],
                ['Workload Identity Federation for GKE', 'Identitas Google untuk Pod', 'KSA `shop/app-ksa` boleh membaca bucket tertentu']
              ]
            },
            { kind: 'figure', svg: FIG_WI, caption: 'Tanpa file kunci: Pod memakai Kubernetes service account (KSA), GKE menukarnya menjadi token Google berumur pendek, dan Cloud Storage memeriksa role IAM principal itu.' },
            {
              kind: 'code',
              title: 'Memberi Pod akses baca ke satu bucket',
              lines: [
                '# cluster dibuat dengan --workload-pool=ace-lab-123.svc.id.goog (Autopilot: selalu aktif)',
                '$ kubectl create serviceaccount app-ksa -n shop',
                '$ gcloud storage buckets add-iam-policy-binding gs://ace-assets-123 \\',
                '    --role=roles/storage.objectViewer \\',
                '    --member="principal://iam.googleapis.com/projects/123456789012/locations/global/workloadIdentityPools/ace-lab-123.svc.id.goog/subject/ns/shop/sa/app-ksa"',
                '# lalu di spec Pod/Deployment: serviceAccountName: app-ksa'
              ]
            },
            {
              kind: 'callout',
              tone: 'tip',
              title: 'Cara lama yang masih sering muncul',
              text: 'Sebelum role bisa diberikan langsung ke principal KSA, polanya adalah: buat Google service account (GSA), beri GSA role yang dibutuhkan, beri KSA `roles/iam.workloadIdentityUser` pada GSA itu, lalu anotasi KSA dengan `iam.gke.io/gcp-service-account=GSA_EMAIL`. Kedua cara benar; yang penting jangan menyimpan kunci JSON di Secret.'
            },
            {
              kind: 'callout',
              tone: 'exam',
              title: 'Di soal ujian',
              text: '"Pods need to access Google Cloud APIs following best practices / least privilege" → Workload Identity. Jawaban yang salah biasanya: memberi role luas ke service account node, atau menyimpan service account key di Kubernetes Secret.'
            }
          ]
        }
      ]
    },

    // ── 4 ─────────────────────────────────────────────────────────────────
    {
      id: 'modes',
      title: 'Autopilot vs Standard',
      sections: [
        {
          id: 'compare',
          title: 'Siapa mengurus apa',
          blocks: [
            { kind: 'figure', svg: FIG_MODES, caption: 'Di Standard kamu membeli dan mengurus node; di Autopilot kamu hanya menulis workload dan Google menyediakan node yang pas untuk Pod-mu.' },
            {
              kind: 'table',
              columns: ['', 'Autopilot', 'Standard'],
              rows: [
                ['Node', 'Disediakan, di-upgrade dan diamankan Google; tidak terlihat sebagai node pool untuk diatur', 'Kamu membuat node pool, memilih machine type, mengatur autoscaling'],
                ['Bayar untuk', 'CPU, memori dan disk yang di-**request** Pod', 'VM node, terpakai atau tidak'],
                ['Lokasi', 'Selalu regional', 'Zonal atau regional'],
                ['Release channel', 'Wajib', 'Opsional'],
                ['Keamanan default', 'Hardened: tidak ada Pod privileged, tidak ada SSH ke node, Workload Identity selalu aktif', 'Bisa dibuat sama ketatnya, tapi kamu yang mengatur'],
                ['Kustomisasi', 'Lewat compute class (mis. Balanced, Scale-Out, GPU)', 'Bebas: DaemonSet privileged, kernel tuning, OS Ubuntu'],
                ['SLA', 'Control plane dan Pod (multi-zone)', 'Control plane (regional 99,95%, zonal 99,5%)'],
                ['Cocok untuk', 'Default untuk kebanyakan workload baru, tim kecil tanpa ops Kubernetes', 'Kebutuhan khusus node, lisensi per node, agen keamanan privileged']
              ]
            },
            {
              kind: 'list',
              items: [
                'Kedua mode sama-sama dikenai biaya manajemen cluster per jam; ada kredit gratis bulanan yang menutup satu cluster zonal atau Autopilot per billing account.',
                'Di Autopilot, Pod tanpa `resources.requests` diberi nilai default oleh GKE, dan request yang terlalu kecil dinaikkan ke minimum. Tulis requests sendiri supaya biaya dan penjadwalan bisa diprediksi.',
                'Autopilot tetap Kubernetes biasa: manifest, kubectl, Helm dan Service yang sama berlaku. Yang berbeda hanya siapa yang mengurus node.'
              ]
            }
          ]
        },
        {
          id: 'create',
          title: 'Membuat keduanya dan menghubungkan kubectl',
          blocks: [
            {
              kind: 'code',
              title: 'Autopilot',
              lines: [
                '$ gcloud container clusters create-auto shop-auto --region=us-central1',
                'Creating cluster shop-auto in us-central1... Cluster is being health-checked (Kubernetes Control Plane is healthy)...done.',
                'Created [https://container.googleapis.com/v1/projects/ace-lab-123/zones/us-central1/clusters/shop-auto].',
                'kubeconfig entry generated for shop-auto.',
                'NAME       LOCATION     MASTER_VERSION      MASTER_IP     MACHINE_TYPE  NODE_VERSION        NUM_NODES  STATUS',
                'shop-auto  us-central1  1.34.1-gke.1080000  34.70.12.9    e2-small      1.34.1-gke.1080000  3          RUNNING'
              ]
            },
            {
              kind: 'code',
              title: 'Standard zonal, lalu ambil kredensial',
              lines: [
                '$ gcloud container clusters create shop-std --zone=us-central1-a --num-nodes=3 --machine-type=e2-medium',
                '$ gcloud container clusters get-credentials shop-std --zone=us-central1-a',
                'Fetching cluster endpoint and auth data.',
                'kubeconfig entry generated for shop-std.',
                '$ kubectl config current-context',
                'gke_ace-lab-123_us-central1-a_shop-std'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              title: 'Di soal ujian',
              text: '"Minimize operational overhead", "don\'t want to manage nodes", "pay only for running Pods" → Autopilot. "Need to run privileged DaemonSets / specific node configuration" → Standard. Pertanyaan "berapa node yang dibuat" untuk cluster regional selalu dihitung per zone.'
            }
          ]
        }
      ]
    },

    // ── 5 ─────────────────────────────────────────────────────────────────
    {
      id: 'kubectl',
      title: 'kubectl',
      sections: [
        {
          id: 'connect',
          title: 'Menghubungkan kubectl ke cluster',
          blocks: [
            {
              kind: 'p',
              text: '`kubectl` membaca file `~/.kube/config` (kubeconfig). Di dalamnya ada daftar **cluster** (alamat API server), **user** (cara autentikasi) dan **context** (pasangan cluster + user + namespace default). `gcloud container clusters get-credentials` menulis satu context untuk cluster GKE; autentikasinya memakai plugin `gke-gcloud-auth-plugin` dengan kredensial gcloud-mu, jadi aksesmu tetap ditentukan IAM.'
            },
            {
              kind: 'code',
              lines: [
                '$ kubectl get pods',
                'The connection to the server localhost:8080 was refused - did you specify the right host or port?',
                '# belum ada kubeconfig — jalankan get-credentials dulu',
                '$ kubectl config get-contexts',
                'CURRENT   NAME                                     CLUSTER                                  AUTHINFO   NAMESPACE',
                '*         gke_ace-lab-123_us-central1-a_shop-std   gke_ace-lab-123_us-central1-a_shop-std   …          default',
                '          gke_ace-lab-123_us-central1_shop-auto    gke_ace-lab-123_us-central1_shop-auto    …',
                '$ kubectl config use-context gke_ace-lab-123_us-central1_shop-auto',
                'Switched to context "gke_ace-lab-123_us-central1_shop-auto".',
                '$ kubectl config set-context --current --namespace=shop',
                'Context "gke_ace-lab-123_us-central1_shop-auto" modified.'
              ]
            }
          ]
        },
        {
          id: 'anatomy',
          title: 'Anatomi perintah kubectl',
          blocks: [
            {
              kind: 'p',
              text: 'Hampir semua perintah berbentuk `kubectl [perintah] [TYPE] [NAME] [flags]`. TYPE boleh tunggal, jamak atau singkatan (`pod`, `pods`, `po`; `deployment`, `deploy`; `service`, `svc`), dan `TYPE NAME` boleh ditulis `TYPE/NAME`.'
            },
            {
              kind: 'table',
              columns: ['Kelompok', 'Perintah', 'Gunanya'],
              mono: [1],
              rows: [
                ['Melihat', 'kubectl get pods -o wide', 'Daftar Pod plus IP dan node'],
                ['', 'kubectl get all -n shop', 'Pod, Service, Deployment, ReplicaSet di satu namespace'],
                ['', 'kubectl describe pod POD', 'Detail + **Events** (alasan Pending, gagal pull, probe gagal)'],
                ['Mengubah', 'kubectl apply -f FILE.yaml', 'Buat/perbarui dari manifest (deklaratif)'],
                ['', 'kubectl scale deployment web --replicas=5', 'Ubah jumlah Pod'],
                ['', 'kubectl set image deployment/web web=IMAGE:v2', 'Rolling update ke image baru'],
                ['', 'kubectl rollout undo deployment/web', 'Kembali ke revisi sebelumnya'],
                ['Debug', 'kubectl logs POD -f / --previous', 'Log container (yang sedang jalan / yang sebelumnya crash)'],
                ['', 'kubectl exec -it POD -- sh', 'Shell di dalam container'],
                ['', 'kubectl port-forward POD 8080:8080', 'Coba Pod dari laptop tanpa membuka ke internet'],
                ['Node', 'kubectl cordon / drain / uncordon NODE', 'Kosongkan node untuk maintenance']
              ]
            },
            {
              kind: 'list',
              items: [
                '`-o yaml` menampilkan objek lengkap termasuk `status` — sumber kebenaran tentang apa yang terjadi.',
                '`-o jsonpath=\'{.items[*].status.podIP}\'` mengambil satu field untuk skrip.',
                '`-l app=web` memilih berdasarkan label; `-A` melihat semua namespace; `-w` mengikuti perubahan secara live.',
                '`--dry-run=client -o yaml` membuat manifest dari perintah imperatif — cara cepat menulis YAML pertama.'
              ]
            }
          ]
        },
        {
          id: 'lifecycle-cmds',
          title: 'Deploy, expose, scale dan update — dari awal sampai akhir',
          blocks: [
            {
              kind: 'code',
              lines: [
                '$ kubectl create deployment web --image=us-central1-docker.pkg.dev/ace-lab-123/apps/web:v1 --replicas=3',
                'deployment.apps/web created',
                '$ kubectl get pods',
                'NAME                   READY   STATUS    RESTARTS   AGE',
                'web-7d4b9c8f6d-abcde   1/1     Running   0          20s',
                'web-7d4b9c8f6d-fghij   1/1     Running   0          20s',
                'web-7d4b9c8f6d-klmno   1/1     Running   0          20s',
                '$ kubectl expose deployment web --type=LoadBalancer --port=80 --target-port=8080',
                'service/web exposed',
                '$ kubectl autoscale deployment web --min=3 --max=10 --cpu=60%',
                'horizontalpodautoscaler.autoscaling/web autoscaled',
                '$ kubectl set image deployment/web web=us-central1-docker.pkg.dev/ace-lab-123/apps/web:v2',
                'deployment.apps/web image updated',
                '$ kubectl rollout status deployment/web',
                'Waiting for deployment "web" rollout to finish: 1 out of 3 new replicas have been updated...',
                'deployment "web" successfully rolled out',
                '$ kubectl rollout history deployment/web',
                'REVISION  CHANGE-CAUSE',
                '1         <none>',
                '2         <none>'
              ]
            },
            {
              kind: 'callout',
              tone: 'warn',
              title: 'Tiga skala yang berbeda',
              text: '`kubectl scale` mengubah jumlah **Pod** sekali. HorizontalPodAutoscaler (`kubectl autoscale`) mengubah jumlah Pod **otomatis** berdasarkan CPU/memori. **Cluster autoscaler** (`gcloud container clusters update … --enable-autoscaling`) menambah/mengurangi **node** saat Pod tidak muat. `gcloud container clusters resize` mengubah jumlah node sekali. Di Autopilot, urusan node sepenuhnya otomatis.'
            },
            {
              kind: 'callout',
              tone: 'tip',
              text: 'kubectl 1.34 menulis target CPU sebagai `--cpu=60%`. Materi lama memakai `--cpu-percent=60`; itu masih jalan tapi diberi peringatan deprecated.'
            }
          ]
        }
      ]
    },

    // ── 6 ─────────────────────────────────────────────────────────────────
    {
      id: 'introspection',
      title: 'Introspection',
      sections: [
        {
          id: 'status',
          title: 'Membaca status Pod',
          blocks: [
            {
              kind: 'p',
              text: '"Introspection" berarti melihat ke dalam: mengumpulkan informasi tentang objek yang sedang jalan supaya tahu kenapa ia berperilaku seperti itu. Titik awalnya selalu status Pod, yang punya tiga lapis: **phase** Pod, **state** tiap container (dengan *reason*), dan **conditions**.'
            },
            { kind: 'figure', svg: FIG_LIFECYCLE, caption: 'Fase Pod hanya lima. Detail yang paling berguna justru ada di state container dan reason-nya.' },
            {
              kind: 'table',
              caption: 'Reason yang paling sering kamu lihat di kolom STATUS',
              columns: ['STATUS', 'Artinya', 'Langkah pertama'],
              rows: [
                ['`Pending`', 'Belum ada node yang muat, atau menunggu volume', '`kubectl describe pod` → lihat Events `FailedScheduling`'],
                ['`ContainerCreating`', 'Sedang menarik image / memasang volume', 'Tunggu; kalau lama, `describe` untuk melihat volume/image'],
                ['`ImagePullBackOff` / `ErrImagePull`', 'Image tidak bisa ditarik: nama/tag salah atau tidak ada izin', '`describe` → pesan "Failed to pull image"'],
                ['`CrashLoopBackOff`', 'Container start lalu mati berulang; jeda restart makin panjang', '`kubectl logs POD --previous`'],
                ['`OOMKilled`', 'Container melewati limit memori', '`describe` → Last State: Terminated, Reason: OOMKilled, Exit Code 137'],
                ['`Running` tapi READY `0/1`', 'Container jalan tapi readiness probe gagal — tidak menerima trafik', '`describe` → Events "Readiness probe failed"'],
                ['`Completed`', 'Container selesai dengan exit code 0 (wajar untuk Job)', 'Tidak ada, kecuali seharusnya terus jalan']
              ]
            },
            {
              kind: 'code',
              title: 'kubectl describe pod — bagian yang perlu dibaca',
              lines: [
                '$ kubectl describe pod web-7d4b9c8f6d-abcde',
                'Name:         web-7d4b9c8f6d-abcde',
                'Namespace:    default',
                'Node:         gke-shop-std-default-pool-1a2b/10.128.0.4',
                'Status:       Running',
                'Containers:',
                '  web:',
                '    Image:          us-central1-docker.pkg.dev/ace-lab-123/apps/web:v2',
                '    State:          Running',
                '    Last State:     Terminated',
                '      Reason:       OOMKilled',
                '      Exit Code:    137',
                '    Restart Count:  4',
                '    Limits:         memory: 512Mi',
                'Conditions:',
                '  Type              Status',
                '  Ready             False',
                'Events:',
                '  Type     Reason   Age   From     Message',
                '  ----     ------   ----  ----     -------',
                '  Warning  BackOff  12s   kubelet  Back-off restarting failed container web in pod web-7d4b9c8f6d-abcde'
              ]
            }
          ]
        },
        {
          id: 'tools',
          title: 'Alat introspeksi dan urutan memakainya',
          blocks: [
            {
              kind: 'steps',
              items: [
                { title: 'Gambaran besar', text: 'Apa saja yang ada dan bagaimana statusnya.', code: ['kubectl get pods -o wide', 'kubectl get deploy,svc,hpa'] },
                { title: 'Detail dan Events', text: 'Hampir semua masalah penjadwalan, image, volume dan probe tertulis di Events.', code: ['kubectl describe pod POD', 'kubectl get events --sort-by=.metadata.creationTimestamp'] },
                { title: 'Log aplikasi', text: 'Untuk error di dalam aplikasi. `--previous` untuk container yang sudah mati; `-c` untuk memilih container di Pod multi-container.', code: ['kubectl logs POD', 'kubectl logs POD --previous', 'kubectl logs -l app=web --tail=50'] },
                { title: 'Masuk ke dalam', text: 'Cek konfigurasi, file, DNS dan koneksi dari sudut pandang Pod.', code: ['kubectl exec -it POD -- sh', 'kubectl port-forward svc/web 8080:80'] },
                { title: 'Pemakaian resource', text: 'Apakah Pod mendekati limit, node mana yang penuh.', code: ['kubectl top pods', 'kubectl top nodes'] },
                { title: 'State lengkap', text: 'Status mentah objek: conditions, IP, waktu start.', code: ['kubectl get pod POD -o yaml'] }
              ]
            },
            {
              kind: 'p',
              text: 'Di luar kubectl, GKE mengirim log container (stdout/stderr) dan log sistem ke **Cloud Logging**, serta metrik ke **Cloud Monitoring** secara default. Halaman Workloads di Console menampilkan hal yang sama dengan `describe`, dan Logs Explorer bisa menyaring per namespace, Pod atau container — berguna untuk Pod yang sudah dihapus dan tidak bisa di-`logs` lagi.'
            },
            {
              kind: 'callout',
              tone: 'exam',
              title: 'Di soal ujian',
              text: '"Pod is in Pending state, how to find out why" → `kubectl describe pod`. "Application in the Pod is crashing, see the error" → `kubectl logs` (dengan `--previous` untuk crash). "View logs of Pods that were deleted" → Cloud Logging.'
            }
          ]
        }
      ]
    },

    // ── 7 ─────────────────────────────────────────────────────────────────
    {
      id: 'cases',
      title: 'Studi kasus',
      sections: [
        {
          id: 'case-first-deploy',
          title: 'Kasus 1 — Deploy aplikasi pertama ke Autopilot',
          blocks: [
            {
              kind: 'case',
              title: 'Dari source code sampai bisa dibuka di browser',
              situation: 'Tim punya aplikasi web Python dengan Dockerfile. Mereka ingin menjalankannya di GKE tanpa mengurus node, dan bisa dibuka dari internet.',
              diagnose: [
                'Pilih mode: tidak ingin mengurus node → **Autopilot**.',
                'Image disimpan di Artifact Registry; dibangun dengan Cloud Build supaya tidak perlu Docker lokal.',
                'Aplikasi stateless → **Deployment**; dibuka ke internet → **Service LoadBalancer** (atau Ingress bila nanti butuh HTTPS dan banyak path).'
              ],
              fix: [
                '$ gcloud artifacts repositories create apps --repository-format=docker --location=us-central1',
                '$ gcloud builds submit --tag=us-central1-docker.pkg.dev/ace-lab-123/apps/web:v1',
                '$ gcloud container clusters create-auto shop --region=us-central1',
                '$ gcloud container clusters get-credentials shop --region=us-central1',
                '$ kubectl create deployment web --image=us-central1-docker.pkg.dev/ace-lab-123/apps/web:v1',
                '$ kubectl expose deployment web --type=LoadBalancer --port=80 --target-port=8080',
                '$ kubectl get service web -w',
                'web    LoadBalancer   10.12.5.140   34.70.88.21   80:31234/TCP   75s',
                '$ curl http://34.70.88.21/'
              ],
              why: 'Urutannya selalu: image → cluster → kredensial kubectl → workload → Service. Di Autopilot, Pod pertama bisa sempat Pending sebentar sementara Google menyiapkan kapasitas; itu normal.',
              exam: 'Soal sering mengacak urutan langkah ini, atau menghilangkan `get-credentials` sehingga kubectl tidak terhubung.'
            }
          ]
        },
        {
          id: 'case-pending',
          title: 'Kasus 2 — Pod nyangkut di Pending',
          blocks: [
            {
              kind: 'case',
              title: 'Deployment baru di-scale ke 10, tapi 4 Pod tidak pernah jalan',
              situation: 'Cluster Standard dengan satu node pool 3 node e2-medium, cluster autoscaler tidak aktif. Tim menaikkan replicas ke 10.',
              symptom: [
                '$ kubectl get pods',
                'NAME                   READY   STATUS    RESTARTS   AGE',
                'web-7d4b9c8f6d-q8m4n   0/1     Pending   0          4m',
                '$ kubectl describe pod web-7d4b9c8f6d-q8m4n',
                'Events:',
                '  Warning  FailedScheduling  4m  default-scheduler  0/3 nodes are available: 3 Insufficient cpu.'
              ],
              diagnose: [
                'Pending = scheduler tidak menemukan node. Pesan Events-nya menyebut alasannya: **Insufficient cpu**.',
                'Scheduler melihat **requests**, bukan pemakaian sebenarnya: 10 Pod × 500m CPU tidak muat di 3 × e2-medium.',
                'Alasan lain yang mungkin tertulis: `didn\'t match Pod\'s node affinity/selector`, `had untolerated taint`, atau `pod has unbound immediate PersistentVolumeClaims`.'
              ],
              fix: [
                '# Pilihan A: biarkan GKE menambah node sendiri',
                '$ gcloud container clusters update shop-std --zone=us-central1-a --enable-autoscaling --node-pool=default-pool --min-nodes=3 --max-nodes=8',
                '# Pilihan B: tambah node manual',
                '$ gcloud container clusters resize shop-std --zone=us-central1-a --node-pool=default-pool --num-nodes=5',
                '# Pilihan C: requests memang terlalu besar — perkecil di manifest lalu apply ulang'
              ],
              why: 'HPA atau `kubectl scale` hanya menambah Pod; kalau node penuh, Pod baru akan Pending. Yang menambah node adalah cluster autoscaler (atau kamu, lewat resize). Di Autopilot, kasus ini selesai sendiri karena Google menambah kapasitas.',
              exam: '"Pods remain Pending after HPA scales out" → aktifkan cluster autoscaler pada node pool.'
            }
          ]
        },
        {
          id: 'case-crashloop',
          title: 'Kasus 3 — CrashLoopBackOff',
          blocks: [
            {
              kind: 'case',
              title: 'Versi baru terus restart',
              situation: 'Setelah deploy image v2, Pod berstatus CrashLoopBackOff dan RESTARTS terus naik.',
              symptom: [
                '$ kubectl get pods',
                'NAME                   READY   STATUS             RESTARTS      AGE',
                'web-5c9f8d7b6-klmno    0/1     CrashLoopBackOff   5 (40s ago)   6m'
              ],
              diagnose: [
                'Container sempat jalan lalu mati. Log container yang **sudah mati** dilihat dengan `--previous`.',
                '`kubectl logs web-5c9f8d7b6-klmno --previous` → misalnya `KeyError: DATABASE_URL` (env var tidak ada) atau stack trace aplikasi.',
                'Kalau log kosong, `describe` → Last State: Terminated, **Reason: OOMKilled, Exit Code: 137** berarti melewati limit memori. Exit Code 1 biasanya error aplikasi.'
              ],
              fix: [
                '# Env var hilang: pasang dari ConfigMap/Secret, lalu restart',
                '$ kubectl create configmap web-config --from-literal=DATABASE_URL=postgres://10.40.0.3/app',
                '# (tambahkan envFrom: configMapRef web-config di manifest, lalu kubectl apply)',
                '# OOMKilled: naikkan limit memori di manifest, atau perbaiki kebocoran memori',
                '# Darurat: kembali ke versi yang sehat',
                '$ kubectl rollout undo deployment/web'
              ],
              why: 'CrashLoopBackOff bukan penyebab, melainkan gejala: kubelet menunggu makin lama sebelum mencoba lagi. Penyebabnya hampir selalu ada di log container sebelumnya atau di Last State.',
              exam: '"View the logs of the previous instance of a container" → `kubectl logs POD --previous`.'
            }
          ]
        },
        {
          id: 'case-imagepull',
          title: 'Kasus 4 — ImagePullBackOff',
          blocks: [
            {
              kind: 'case',
              title: 'Pod tidak pernah mulai karena image tidak bisa ditarik',
              situation: 'Deployment baru di cluster Standard dengan node privat; image disimpan di Artifact Registry project lain.',
              symptom: [
                '$ kubectl describe pod api-6d8f7c9b5-x2k4p',
                'Events:',
                '  Warning  Failed   20s  kubelet  Failed to pull image "us-central1-docker.pkg.dev/shared-images/apps/api:v3": … 403 Forbidden',
                '  Warning  Failed   20s  kubelet  Error: ErrImagePull',
                '  Normal   BackOff  5s   kubelet  Back-off pulling image …'
              ],
              diagnose: [
                '**403 Forbidden** → masalah izin: service account node tidak boleh membaca repository itu.',
                '**not found / manifest unknown** → nama atau tag image salah ketik.',
                '**i/o timeout** ke registry di internet (mis. Docker Hub) dari node privat → tidak ada Cloud NAT.'
              ],
              fix: [
                '$ gcloud artifacts repositories add-iam-policy-binding apps --project=shared-images --location=us-central1 \\',
                '    --member=serviceAccount:gke-nodes@ace-lab-123.iam.gserviceaccount.com --role=roles/artifactregistry.reader',
                '# Tag salah: perbaiki image di manifest, kubectl apply ulang',
                '# Docker Hub dari node privat: pasang Cloud NAT di region cluster, atau salin image ke Artifact Registry'
              ],
              why: 'Yang menarik image adalah node (kubelet), memakai service account node — bukan identitas Pod dan bukan akunmu. Karena itu izin harus diberikan ke service account node.',
              exam: '"GKE cannot pull images from Artifact Registry in another project" → beri `roles/artifactregistry.reader` ke service account node.'
            }
          ]
        },
        {
          id: 'case-service',
          title: 'Kasus 5 — Service ada, tapi aplikasinya tidak bisa diakses',
          blocks: [
            {
              kind: 'case',
              title: 'EXTERNAL-IP sudah muncul, tapi curl timeout atau 502',
              situation: 'Service LoadBalancer sudah punya IP publik. Pod berstatus Running. Tapi request ke IP itu tidak pernah dijawab.',
              symptom: ['$ kubectl get endpoints web', 'NAME   ENDPOINTS   AGE', 'web    <none>      5m'],
              diagnose: [
                'Endpoints kosong berarti **selector Service tidak cocok dengan label Pod** satu pun.',
                'Bandingkan: `kubectl describe svc web` (Selector: `app=web`) dengan `kubectl get pods --show-labels` (ternyata `app=web-app`).',
                'Kalau endpoints terisi tapi tetap gagal: cek `targetPort` sama dengan port yang didengarkan container, dan readiness probe tidak gagal (Pod yang belum Ready dikeluarkan dari endpoints).',
                'Kalau EXTERNAL-IP lama `<pending>`: lihat `kubectl describe svc web` → Events (misalnya kuota IP habis).'
              ],
              fix: [
                '# Samakan label: perbaiki selector Service atau label di template Pod, lalu apply',
                '$ kubectl get endpoints web',
                'NAME   ENDPOINTS                                       AGE',
                'web    10.40.0.12:8080,10.40.1.7:8080,10.40.2.3:8080   6m',
                '# Uji dari dalam cluster tanpa load balancer',
                '$ kubectl port-forward svc/web 8080:80'
              ],
              why: 'Service tidak tahu nama Pod; ia hanya menjalankan selector atas label. Satu karakter beda di label membuat Service "kosong" padahal semuanya terlihat sehat.',
              exam: 'Pertanyaan "Pods are running but the Service returns no response" hampir selalu soal selector/label atau targetPort.'
            }
          ]
        },
        {
          id: 'case-rollback',
          title: 'Kasus 6 — Update gagal di tengah jalan',
          blocks: [
            {
              kind: 'case',
              title: 'Rolling update tertahan; kembalikan versi lama secepatnya',
              situation: 'Tim menjalankan `kubectl set image` ke tag v3 yang ternyata tidak ada. Rollout tidak selesai.',
              symptom: [
                '$ kubectl rollout status deployment/web',
                'Waiting for deployment "web" rollout to finish: 1 out of 3 new replicas have been updated...',
                '$ kubectl get pods',
                'web-7d4b9c8f6d-abcde   1/1   Running            0   2h',
                'web-7d4b9c8f6d-fghij   1/1   Running            0   2h',
                'web-84f6c7d9b-zz9q1    0/1   ImagePullBackOff   0   3m'
              ],
              diagnose: [
                'Rolling update default (`maxUnavailable: 25%`, `maxSurge: 25%`) baru menghentikan Pod lama setelah Pod baru Ready — karena itu dua Pod lama masih melayani. Inilah alasan rolling update aman.',
                '`kubectl rollout history deployment/web` menunjukkan revisi yang tersedia.'
              ],
              fix: ['$ kubectl rollout undo deployment/web', 'deployment.apps/web rolled back', '# atau ke revisi tertentu:', '$ kubectl rollout undo deployment/web --to-revision=2'],
              why: 'Setiap perubahan template Pod membuat ReplicaSet baru; ReplicaSet lama tetap disimpan dengan 0 replika. Undo hanya menaikkan kembali ReplicaSet lama — cepat dan tanpa build ulang.',
              exam: '"Quickly revert a Deployment to the previous version" → `kubectl rollout undo`.'
            }
          ]
        },
        {
          id: 'case-scale',
          title: 'Kasus 7 — Lonjakan trafik',
          blocks: [
            {
              kind: 'case',
              title: 'Promo jam 12 siang: trafik naik 5×',
              situation: 'Toko online di GKE Standard. Saat promo, CPU Pod web 95% dan respons melambat. Tim ingin skala otomatis, naik saat ramai dan turun lagi setelahnya.',
              diagnose: [
                'Dua lapis skala: **Pod** (HPA) dan **node** (cluster autoscaler). HPA tanpa cluster autoscaler membuat Pod baru Pending saat node penuh (Kasus 2).',
                'HPA butuh `requests` CPU di container, karena persentase dihitung terhadap requests.',
                'VerticalPodAutoscaler membantu menebak requests yang pas, tapi jangan dipakai bersama HPA pada metrik CPU/memori yang sama.'
              ],
              fix: [
                '$ kubectl autoscale deployment web --min=3 --max=30 --cpu=60%',
                '$ gcloud container clusters update shop-std --zone=us-central1-a --enable-autoscaling --node-pool=default-pool --min-nodes=3 --max-nodes=15',
                '$ kubectl get hpa',
                'NAME   REFERENCE        TARGETS       MINPODS   MAXPODS   REPLICAS   AGE',
                'web    Deployment/web   cpu: 58%/60%  3         30        14         20m'
              ],
              why: 'HPA menambah Pod saat rata-rata CPU melewati target; Pod yang tidak muat memicu cluster autoscaler menambah node; saat sepi keduanya turun lagi. Di Autopilot cukup HPA — kapasitas node mengikuti otomatis.',
              exam: 'Pembeda klasik: `kubectl scale`/HPA = Pod, cluster autoscaler/`clusters resize` = node.'
            }
          ]
        },
        {
          id: 'case-wi',
          title: 'Kasus 8 — Aplikasi perlu membaca Cloud Storage',
          blocks: [
            {
              kind: 'case',
              title: 'Tanpa kunci, dengan least privilege',
              situation: 'Service `report` di namespace `shop` perlu membaca file dari bucket `ace-assets-123`. Developer berencana membuat kunci JSON service account dan menyimpannya di Secret.',
              diagnose: [
                'Kunci JSON adalah kredensial jangka panjang yang bisa bocor; banyak organisasi memblokir pembuatannya.',
                'Memberi role ke service account node membuat **semua** Pod di node itu ikut mendapat akses — melanggar least privilege.',
                'Yang benar: **Workload Identity Federation for GKE** — role diberikan ke identitas KSA milik aplikasi itu saja.'
              ],
              fix: [
                '$ kubectl create serviceaccount report-ksa -n shop',
                '$ gcloud storage buckets add-iam-policy-binding gs://ace-assets-123 --role=roles/storage.objectViewer \\',
                '    --member="principal://iam.googleapis.com/projects/123456789012/locations/global/workloadIdentityPools/ace-lab-123.svc.id.goog/subject/ns/shop/sa/report-ksa"',
                '# di Deployment report: spec.template.spec.serviceAccountName: report-ksa',
                '$ kubectl rollout restart deployment/report -n shop'
              ],
              why: 'Client library Google di dalam Pod otomatis mengambil token dari metadata server GKE; kode aplikasi tidak berubah sama sekali dan tidak ada rahasia yang disimpan.',
              exam: 'Jawaban "store a service account key as a Kubernetes Secret" hampir selalu salah; "use Workload Identity" hampir selalu benar.'
            }
          ]
        },
        {
          id: 'case-maintenance',
          title: 'Kasus 9 — Maintenance node tanpa downtime',
          blocks: [
            {
              kind: 'case',
              title: 'Mengosongkan satu node dengan aman',
              situation: 'Satu node di cluster Standard perlu dikeluarkan (misalnya mau diganti machine type-nya lewat node pool baru). Aplikasi tidak boleh down.',
              diagnose: [
                '`cordon` menghentikan Pod baru ditaruh di node itu; `drain` mengusir Pod yang ada supaya dijadwalkan ulang di node lain.',
                'Node GKE selalu menjalankan DaemonSet sistem (log, metrik, CSI), jadi `drain` butuh `--ignore-daemonsets`.',
                '**PodDisruptionBudget** (mis. `minAvailable: 2`) membuat drain menunggu supaya replika tidak turun di bawah batas.'
              ],
              fix: [
                '$ kubectl cordon gke-shop-std-default-pool-1a2b',
                'node/gke-shop-std-default-pool-1a2b cordoned',
                '$ kubectl drain gke-shop-std-default-pool-1a2b --ignore-daemonsets --delete-emptydir-data',
                'evicting pod default/web-7d4b9c8f6d-abcde',
                'pod/web-7d4b9c8f6d-abcde evicted',
                'node/gke-shop-std-default-pool-1a2b drained',
                '$ kubectl uncordon gke-shop-std-default-pool-1a2b   # bila node dipakai lagi'
              ],
              why: 'Upgrade otomatis GKE melakukan hal yang sama untuk setiap node (surge upgrade) dan juga menghormati PodDisruptionBudget — karena itu PDB penting untuk aplikasi produksi.',
              exam: '"Safely evict all Pods from a node before maintenance" → `kubectl drain`.'
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
          title: 'Sepuluh soal singkat',
          blocks: [
            {
              kind: 'quiz',
              q: 'Perusahaan ingin menjalankan aplikasi container di Kubernetes tanpa mengurus node sama sekali dan hanya membayar resource yang dipakai Pod. Mode apa?',
              options: ['GKE Standard dengan cluster autoscaler', 'GKE Autopilot', 'Cloud Run', 'Compute Engine dengan managed instance group'],
              answer: 1,
              explain: 'Autopilot: Google mengelola node, dan biaya dihitung dari requests Pod. Cloud Run juga tanpa node, tapi soal menyebut Kubernetes.'
            },
            {
              kind: 'quiz',
              q: 'Perintah `gcloud container clusters create web --region=us-central1 --num-nodes=2` — berapa node yang dibuat (region punya 3 zone)?',
              options: ['2', '3', '6', '1'],
              answer: 2,
              explain: 'Di cluster regional, `--num-nodes` berlaku per zone: 2 × 3 zone = 6 node.'
            },
            {
              kind: 'quiz',
              q: 'Pod berstatus Pending. Perintah pertama untuk mengetahui alasannya?',
              options: ['kubectl logs POD', 'kubectl describe pod POD', 'kubectl exec -it POD -- sh', 'kubectl top pod POD'],
              answer: 1,
              explain: 'Pod Pending belum pernah jalan, jadi belum ada log. Alasannya (Insufficient cpu, taint, PVC) tertulis di Events pada describe.'
            },
            {
              kind: 'quiz',
              q: 'Container terus restart (CrashLoopBackOff). Bagaimana melihat error dari container yang barusan mati?',
              options: ['kubectl logs POD --previous', 'kubectl get pod POD -o wide', 'kubectl rollout status deployment/web', 'kubectl get events -A'],
              answer: 0,
              explain: '`--previous` menampilkan log instance container sebelumnya, yang crash. Log container yang sedang start sering masih kosong.'
            },
            {
              kind: 'quiz',
              q: 'Agen pengumpul log harus berjalan tepat satu di setiap node, termasuk node baru. Objek apa?',
              options: ['Deployment dengan replicas = jumlah node', 'StatefulSet', 'DaemonSet', 'CronJob'],
              answer: 2,
              explain: 'DaemonSet menjalankan satu Pod per node dan otomatis menambah Pod saat node bertambah.'
            },
            {
              kind: 'quiz',
              q: 'HPA menaikkan jumlah Pod, tapi Pod baru Pending karena node penuh. Apa yang perlu diaktifkan?',
              options: ['VerticalPodAutoscaler', 'Cluster autoscaler pada node pool', 'kubectl scale dengan replicas lebih besar', 'Release channel rapid'],
              answer: 1,
              explain: 'Cluster autoscaler menambah node saat ada Pod yang tidak bisa dijadwalkan. HPA dan kubectl scale hanya mengatur Pod.'
            },
            {
              kind: 'quiz',
              q: 'Pod perlu membaca bucket Cloud Storage mengikuti best practice. Caranya?',
              options: [
                'Simpan kunci JSON service account di Kubernetes Secret',
                'Beri roles/storage.admin ke service account node',
                'Pakai Workload Identity: beri role ke identitas KSA aplikasi',
                'Buat bucket publik'
              ],
              answer: 2,
              explain: 'Workload Identity memberi token berumur pendek untuk KSA tertentu — tanpa kunci, dan hanya Pod itu yang mendapat akses.'
            },
            {
              kind: 'quiz',
              q: 'Service LoadBalancer punya EXTERNAL-IP, Pod Running, tapi `kubectl get endpoints web` menunjukkan `<none>`. Penyebab paling mungkin?',
              options: ['Kuota IP habis', 'Selector Service tidak cocok dengan label Pod', 'Cluster autoscaler mati', 'Release channel terlalu lama'],
              answer: 1,
              explain: 'Endpoints kosong = tidak ada Pod (yang Ready) yang cocok dengan selector Service.'
            },
            {
              kind: 'quiz',
              q: 'Image versi baru membuat aplikasi error di produksi. Cara tercepat kembali ke versi sebelumnya?',
              options: ['Hapus Deployment lalu buat ulang', 'kubectl rollout undo deployment/web', 'gcloud container clusters upgrade --master', 'kubectl delete pods --all'],
              answer: 1,
              explain: 'Undo menaikkan kembali ReplicaSet revisi sebelumnya — tanpa build ulang, dengan rolling update.'
            },
            {
              kind: 'quiz',
              q: 'Di Cloud Shell, `kubectl get pods` menjawab "The connection to the server localhost:8080 was refused". Apa yang terlupa?',
              options: ['gcloud container clusters get-credentials', 'gcloud services enable container.googleapis.com', 'kubectl apply -f', 'gcloud auth configure-docker'],
              answer: 0,
              explain: 'Tanpa kubeconfig, kubectl mencoba localhost:8080. get-credentials menulis context untuk cluster GKE.'
            }
          ]
        }
      ]
    }
  ]
};
