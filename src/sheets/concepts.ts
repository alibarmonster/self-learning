/**
 * Cloud concepts in plain Indonesian: load balancing explained slowly, then the
 * vocabulary the Google Cloud exams assume you know. The terms stay in English,
 * because that is how the exam prints them; every card adds an everyday
 * analogy, a Google Cloud example, and the phrase that signals it in a question.
 */
import type { Cheatsheet } from '@/types';

/** Users → one IP → load balancer → healthy VMs in two zones; one VM fails its health check. */
const LB_FIGURE = `<svg viewBox="0 0 640 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pengguna mengirim permintaan ke satu alamat IP load balancer, yang membaginya ke VM sehat di dua zona dan melewati VM yang gagal health check" style="font: 13px var(--font); letter-spacing: 0">
  <defs>
    <marker id="lb-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/>
    </marker>
  </defs>
  <g fill="none" stroke="currentColor" stroke-width="1.6">
    <circle cx="40" cy="70" r="9"/><path d="M24,98 a16,14 0 0 1 32,0"/>
    <circle cx="40" cy="140" r="9"/><path d="M24,168 a16,14 0 0 1 32,0"/>
    <circle cx="40" cy="210" r="9"/><path d="M24,238 a16,14 0 0 1 32,0"/>
    <path d="M64,84 L186,145" marker-end="url(#lb-arrow)"/>
    <path d="M64,152 L186,150" marker-end="url(#lb-arrow)"/>
    <path d="M64,222 L186,156" marker-end="url(#lb-arrow)"/>
    <rect x="420" y="15" width="210" height="125" stroke-dasharray="5 4" opacity="0.6"/>
    <rect x="420" y="160" width="210" height="125" stroke-dasharray="5 4" opacity="0.6"/>
    <rect x="450" y="42" width="160" height="38"/>
    <rect x="450" y="92" width="160" height="38"/>
    <rect x="450" y="187" width="160" height="38" opacity="0.45"/>
    <rect x="450" y="237" width="160" height="38"/>
    <path d="M332,146 L446,63" marker-end="url(#lb-arrow)"/>
    <path d="M332,149 L446,111" marker-end="url(#lb-arrow)"/>
    <path d="M332,156 L446,254" marker-end="url(#lb-arrow)"/>
    <path d="M332,152 L446,204" stroke-dasharray="3 4" opacity="0.6"/>
    <path d="M588,198 l14,16 M602,198 l-14,16" stroke-width="2"/>
  </g>
  <rect x="190" y="115" width="140" height="70" style="fill: var(--mint)" stroke="currentColor" stroke-width="1.6"/>
  <g fill="currentColor">
    <text x="40" y="285" text-anchor="middle" opacity="0.7">Pengguna</text>
    <text x="260" y="146" text-anchor="middle" style="fill: #1a1a1a; font-weight: 600">Load balancer</text>
    <text x="260" y="166" text-anchor="middle" style="fill: #1a1a1a">1 alamat IP</text>
    <text x="260" y="210" text-anchor="middle" opacity="0.7">membagi permintaan</text>
    <text x="430" y="33" opacity="0.7">Zona A</text>
    <text x="430" y="178" opacity="0.7">Zona B</text>
    <text x="466" y="66">VM 1 · sehat</text>
    <text x="466" y="116">VM 2 · sehat</text>
    <text x="466" y="211" opacity="0.6">VM 3 · gagal cek</text>
    <text x="466" y="261">VM 4 · sehat</text>
    <text x="350" y="155" opacity="0.7" transform="rotate(24.5 350 155)">health check ✗</text>
  </g>
</svg>`;

export const concepts: Cheatsheet = {
  lang: 'id',
  title: 'Konsep cloud, bahasa sehari-hari',
  filterHint: 'Cari — coba “availability”, “zona”, “agility”, “TCO”, “proxy”…',
  intro:
    'Istilah di soal ujian selalu dalam bahasa Inggris, jadi istilahnya tetap dibiarkan Inggris. Penjelasannya pakai bahasa Indonesia sehari-hari: artinya apa, analogi dari kehidupan biasa, contoh nyata di Google Cloud, dan kata kunci yang biasanya muncul di soal. Mulai dari load balancer, lalu kosakata cloud dari yang paling sering keluar.',
  parts: [
    {
      id: 'lb',
      title: 'Load balancer, pelan-pelan',
      blurb: 'Apa itu, bagaimana cara kerjanya, dan cara memilih jenis yang benar di soal.'
    },
    {
      id: 'terms',
      title: 'Kosakata cloud',
      blurb: 'Dikelompokkan per tema. Tiap kartu: arti, analogi, contoh Google Cloud, dan cara istilah itu muncul di soal.'
    }
  ],
  groups: [
    // ── Load balancing ─────────────────────────────────────────────────────
    {
      id: 'lb-what',
      part: 'lb',
      title: 'Apa itu load balancer',
      note: 'Bayangkan restoran ramai dengan satu pintu masuk dan satu petugas penerima tamu. Tamu tidak perlu tahu ada berapa koki di dapur; petugas itu yang mengarahkan tiap pesanan ke koki yang sedang luang, dan tidak mengirim pesanan ke koki yang sedang sakit. Load balancer adalah petugas penerima tamu itu, dan VM atau container di belakangnya adalah para koki.',
      figure: LB_FIGURE,
      figureCaption:
        'Semua pengguna memakai satu alamat IP. Load balancer membagi permintaan ke VM yang sehat di dua zona. VM 3 gagal health check, jadi tidak dikirimi permintaan sampai pulih — pengguna tidak merasakan apa-apa.',
      terms: [
        {
          term: 'Load balancer',
          meaning:
            'Layanan yang menerima semua permintaan di satu alamat, lalu membaginya ke banyak server di belakangnya supaya tidak ada satu server yang kewalahan, dan supaya aplikasi tetap jalan kalau satu server mati.',
          analogy: 'Petugas penerima tamu di restoran yang membagi tamu ke meja dan koki yang sedang kosong.',
          example: 'Toko online punya 4 VM web dalam managed instance group; semua pembeli masuk lewat satu IP Application Load Balancer.',
          exam: '“distribute traffic across instances”, “single IP address”, “highly available web application”'
        },
        {
          term: 'Backend',
          meaning:
            'Kumpulan server yang benar-benar mengerjakan permintaan: instance group (VM), network endpoint group (container, Cloud Run, alamat di luar Google), atau bucket Cloud Storage.',
          analogy: 'Para koki di dapur.',
          example: 'Backend service yang menunjuk ke managed instance group regional berisi VM di tiga zona.',
          exam: '“backend service”, “instance group”, “serverless NEG”, “backend bucket”'
        },
        {
          term: 'Health check',
          meaning:
            'Pemeriksaan rutin yang dilakukan load balancer ke tiap backend (misalnya membuka /healthz tiap 10 detik). Backend yang tidak menjawab dianggap sakit dan dilewati.',
          analogy: 'Manajer dapur yang tiap beberapa menit bertanya “masih bisa masak?” ke tiap koki.',
          example: 'Health check HTTP ke port 80 path /healthz; VM yang gagal 3 kali berturut-turut tidak dikirimi trafik.',
          exam: '“unhealthy instances”, “stop sending traffic to failed VMs”, “autohealing”'
        },
        {
          term: 'Frontend',
          meaning: 'Pintu depan load balancer: alamat IP, port, dan protokol yang dipakai pengguna untuk masuk.',
          analogy: 'Pintu masuk restoran beserta alamatnya.',
          example: 'IP statis global 34.120.x.x di port 443 dengan sertifikat SSL yang dikelola Google.',
          exam: '“forwarding rule”, “static external IP”, “SSL certificate”'
        },
        {
          term: 'Autohealing (beda dengan load balancing)',
          meaning:
            'Load balancer hanya berhenti mengirim trafik ke VM yang sakit. Yang membuat ulang VM itu adalah managed instance group lewat autohealing, dengan health check-nya sendiri.',
          analogy: 'Petugas berhenti mengirim pesanan ke koki yang sakit; manajer HRD yang mencari koki pengganti.',
          example: 'MIG dengan autohealing health check: VM yang tidak menjawab 3 kali dihapus dan dibuat ulang otomatis.',
          exam: '“recreate unresponsive VMs” → autohealing di MIG, bukan setting load balancer'
        }
      ]
    },
    {
      id: 'lb-axes',
      part: 'lb',
      title: 'Tiga pertanyaan untuk membedakan load balancer',
      note: 'Semua jenis load balancer Google Cloud bisa dibedakan dengan tiga pertanyaan. Jawab ketiganya dari kalimat soal, dan pilihannya tinggal satu.',
      terms: [
        {
          term: '1 · External atau internal?',
          meaning:
            'External menerima trafik dari internet. Internal hanya bisa dicapai dari dalam VPC kamu (atau jaringan yang tersambung lewat VPN/Interconnect).',
          analogy: 'Pintu depan untuk tamu umum, atau pintu belakang khusus karyawan.',
          example: 'Situs publik → external. Microservice pembayaran yang hanya dipanggil oleh layanan lain di VPC → internal.',
          exam: '“accessible from the internet” → external · “only from within the VPC / private” → internal'
        },
        {
          term: '2 · HTTP(S) atau protokol lain?',
          meaning:
            'Kalau trafiknya web (HTTP/HTTPS), pakai Application Load Balancer: ia bisa membaca URL, header, dan cookie, jadi bisa mengarahkan /api ke satu backend dan /gambar ke backend lain. Untuk TCP/UDP biasa (game, database, protokol khusus), pakai Network Load Balancer.',
          analogy: 'Resepsionis yang membaca isi surat (Application) dibanding satpam yang hanya melihat nomor pintu tujuan (Network).',
          example: 'example.com/api → Cloud Run, example.com/static → bucket: Application LB dengan URL map. Server game UDP: Network LB.',
          exam: '“route based on URL path”, “HTTPS”, “Cloud CDN”, “Cloud Armor” → Application · “TCP/UDP”, “non-HTTP” → Network'
        },
        {
          term: '3 · Global atau regional?',
          meaning:
            'Global memakai satu IP untuk seluruh dunia dan mengarahkan pengguna ke backend terdekat yang sehat di region mana pun. Regional hanya bekerja di satu region — cukup kalau semua pengguna dan server ada di satu tempat, atau kalau data wajib tetap di region itu.',
          analogy: 'Satu nomor call center nasional yang menyambungkan ke kantor cabang terdekat, dibanding nomor telepon satu kantor cabang.',
          example: 'Pengguna di Asia dan Eropa, backend di asia-southeast1 dan europe-west1 → global. Aplikasi internal kantor Jakarta → regional.',
          exam: '“users worldwide”, “single anycast IP”, “lowest latency globally” → global · “data must stay in one region” → regional'
        },
        {
          term: 'Proxy atau passthrough?',
          meaning:
            'Proxy menerima koneksi pengguna lalu membuat koneksi baru ke backend (bisa membuka SSL, membaca isi). Passthrough meneruskan paket apa adanya, jadi backend melihat IP asli pengguna dan semua protokol (TCP, UDP, ESP, ICMP) bisa lewat.',
          analogy: 'Penerjemah yang mengulang pesanmu ke orang lain (proxy), dibanding pipa yang hanya mengalirkan air (passthrough).',
          example: 'Aplikasi yang wajib melihat IP asli klien dan memakai UDP → passthrough Network LB.',
          exam: '“preserve client IP”, “UDP” → passthrough · “SSL offload”, “TCP with global reach” → proxy'
        }
      ]
    },
    {
      id: 'lb-pick',
      part: 'lb',
      title: 'Memilih jenisnya',
      note: 'Baca dari atas, berhenti di baris pertama yang cocok dengan soal.',
      path: [
        ['Trafik web (HTTP/HTTPS) dari internet, pengguna di banyak negara', 'Global external Application Load Balancer'],
        ['Trafik web dari internet, semua di satu region atau data harus tinggal di region itu', 'Regional external Application Load Balancer'],
        ['Trafik web antar layanan di dalam VPC', 'Internal Application Load Balancer'],
        ['TCP (bukan HTTP) dari internet, ingin satu IP global atau SSL dibuka di load balancer', 'External proxy Network Load Balancer (dulu: TCP/SSL Proxy)'],
        ['TCP/UDP dari internet, perlu IP asli klien atau UDP', 'External passthrough Network Load Balancer (dulu: Network LB)'],
        ['TCP/UDP antar layanan di dalam VPC', 'Internal passthrough Network Load Balancer (dulu: Internal TCP/UDP LB)']
      ],
      tables: [
        {
          caption: 'Nama baru dan nama lama — soal dump masih memakai nama lama',
          columns: ['Nama sekarang', 'Nama lama di soal', 'Lapisan', 'Jangkauan'],
          rows: [
            ['Application Load Balancer (external)', 'HTTP(S) Load Balancer', 'Layer 7 · proxy', 'Global atau regional'],
            ['Application Load Balancer (internal)', 'Internal HTTP(S) Load Balancer', 'Layer 7 · proxy', 'Regional (ada juga cross-region)'],
            ['Proxy Network Load Balancer', 'SSL Proxy / TCP Proxy Load Balancer', 'Layer 4 · proxy', 'Global atau regional'],
            ['Passthrough Network Load Balancer (external)', 'Network Load Balancer, TCP/UDP Load Balancer', 'Layer 4 · passthrough', 'Regional'],
            ['Passthrough Network Load Balancer (internal)', 'Internal TCP/UDP Load Balancer', 'Layer 4 · passthrough', 'Regional']
          ]
        }
      ],
      bullets: [
        ['Cloud CDN dan Cloud Armor', 'Keduanya dipasang di Application Load Balancer external. Kalau soal menyebut cache konten statis dekat pengguna (CDN) atau blokir serangan/aturan WAF (Armor), jawabannya Application LB.'],
        ['Satu IP untuk banyak region', 'Hanya load balancer global yang bisa. Kalau opsinya “Network Load Balancer” untuk pengguna seluruh dunia, biasanya itu jebakan.'],
        ['Di Kubernetes', 'Service bertipe LoadBalancer membuat passthrough Network LB; Ingress (atau Gateway) membuat Application LB.']
      ],
      tip: 'Urutan cepat di soal: cari kata HTTP/URL (Application atau bukan), lalu internet/VPC (external atau internal), lalu worldwide/satu region (global atau regional).'
    },

    // ── Vocabulary ─────────────────────────────────────────────────────────
    {
      id: 'terms-availability',
      part: 'terms',
      title: 'Selalu nyala: availability dan kawan-kawannya',
      note: 'Kelompok yang paling sering tertukar. Intinya: availability soal bisa dipakai atau tidak, durability soal data hilang atau tidak, dan disaster recovery soal bangkit lagi setelah bencana.',
      terms: [
        {
          term: 'Availability',
          meaning:
            'Seberapa sering sistem bisa dipakai ketika dibutuhkan, biasanya ditulis dalam persen waktu. 99,9% berarti boleh mati sekitar 43 menit per bulan; 99,99% hanya sekitar 4 menit.',
          analogy: 'ATM yang bisa dipakai kapan pun kamu datang. ATM yang sering “dalam perbaikan” availability-nya rendah.',
          example: 'Cloud Storage multi-region punya SLA ketersediaan 99,95%.',
          exam: '“available”, “uptime”, “99.9%”, “minimize downtime”'
        },
        {
          term: 'High availability (HA)',
          meaning:
            'Desain supaya sistem tetap jalan walaupun satu bagian rusak, dengan cara menyiapkan cadangan yang langsung mengambil alih. Kuncinya: tidak boleh ada satu titik yang kalau mati, semuanya ikut mati (single point of failure).',
          analogy: 'Rumah sakit yang punya genset: saat listrik PLN padam, genset langsung menyala dan operasi tetap berjalan.',
          example: 'Cloud SQL dengan konfigurasi HA (regional): ada instance standby di zona lain yang otomatis mengambil alih kalau zona utama bermasalah. VM dalam regional MIG di tiga zona di belakang load balancer.',
          exam: '“highly available”, “survive a zonal outage”, “no single point of failure”, “multiple zones”'
        },
        {
          term: 'Fault tolerance',
          meaning:
            'Tingkat yang lebih tinggi dari HA: ketika ada bagian rusak, pengguna sama sekali tidak merasakan gangguan — bukan sekadar pulih cepat.',
          analogy: 'Pesawat bermesin dua yang tetap terbang dengan satu mesin.',
          example: 'Spanner multi-region tetap melayani baca-tulis walaupun satu region tidak bisa dihubungi.',
          exam: '“no interruption”, “continue operating when a component fails”'
        },
        {
          term: 'Redundancy',
          meaning: 'Punya lebih dari satu salinan komponen yang sama, supaya kalau satu rusak masih ada yang lain. Redundancy adalah cara untuk mencapai HA.',
          analogy: 'Menyimpan kunci cadangan di rumah orang tua.',
          example: 'Tiga VM yang sama di tiga zona; Cloud Storage dual-region menyimpan data di dua region.',
          exam: '“redundant”, “replicas”, “multiple copies”'
        },
        {
          term: 'Failover',
          meaning: 'Proses berpindah otomatis dari komponen yang rusak ke cadangannya.',
          analogy: 'Ketika kasir utama sakit, kasir cadangan langsung membuka loket.',
          example: 'Instance primer Cloud SQL HA rusak → standby di zona lain dipromosikan menjadi primer dalam hitungan detik sampai menit.',
          exam: '“automatic failover”, “standby instance”'
        },
        {
          term: 'Reliability',
          meaning:
            'Sistem bekerja dengan benar dan konsisten dalam jangka panjang — bukan hanya menyala, tapi juga memberi hasil yang tepat. Di Google, ini diukur dengan SLI/SLO dan dikelola dengan praktik SRE.',
          analogy: 'Bus yang bukan hanya beroperasi, tapi juga selalu tiba tepat waktu.',
          example: 'Target “99,5% permintaan checkout selesai di bawah 300 ms”.',
          exam: '“reliable”, “SRE”, “error budget”'
        },
        {
          term: 'Resilience',
          meaning: 'Kemampuan bertahan dan pulih dari gangguan: menahan pukulan, lalu kembali normal tanpa banyak campur tangan manusia.',
          analogy: 'Pohon bambu yang melengkung saat angin kencang, lalu tegak lagi.',
          example: 'MIG dengan autohealing dan autoscaling yang memulihkan dan menambah VM sendiri saat ada lonjakan atau kerusakan.',
          exam: '“resilient architecture”, “recover automatically”'
        },
        {
          term: 'Durability',
          meaning:
            'Peluang data kamu tidak hilang. Berbeda dengan availability: data bisa sementara tidak bisa diakses (availability turun) tapi tetap aman tersimpan (durability tetap tinggi).',
          analogy: 'Brankas bank: kadang kantornya tutup (tidak available), tapi uangmu tetap aman di dalam (durable).',
          example: 'Cloud Storage dirancang dengan durability 99,999999999% (“11 sembilan”) per tahun untuk semua storage class.',
          exam: '“durable”, “never lose data”, “11 nines”'
        },
        {
          term: 'Disaster recovery (DR)',
          meaning:
            'Rencana dan persiapan untuk membangun kembali layanan setelah kejadian besar, misalnya satu region lumpuh atau data terhapus. Diukur dengan RTO dan RPO.',
          analogy: 'Asuransi kebakaran plus salinan semua dokumen penting yang disimpan di kota lain.',
          example: 'Backup harian ke bucket Coldline di region lain, ditambah template Terraform untuk membangun ulang infrastruktur.',
          exam: '“disaster recovery”, “backup in another region”, “restore”'
        },
        {
          term: 'RTO dan RPO',
          meaning:
            'RTO (Recovery Time Objective): berapa lama layanan boleh mati sampai pulih. RPO (Recovery Point Objective): berapa banyak data (dihitung dalam waktu) yang boleh hilang. RTO 1 jam dan RPO 15 menit berarti harus hidup lagi dalam 1 jam dan paling banyak kehilangan data 15 menit terakhir.',
          analogy: 'Kalau laptopmu hilang: RTO = berapa lama sampai kamu bisa kerja lagi; RPO = file dari berapa lama terakhir yang ikut hilang karena belum di-backup.',
          example: 'RPO mendekati nol butuh replikasi sinkron (Spanner, Cloud SQL HA). RPO 24 jam cukup dengan backup harian.',
          exam: '“RTO”, “RPO”, “acceptable data loss”, “recovery time”'
        },
        {
          term: 'SLA, SLO, SLI',
          meaning:
            'SLI = angka yang diukur (misalnya persentase permintaan sukses). SLO = target internal untuk angka itu (99,9%). SLA = janji resmi ke pelanggan, biasanya dengan kompensasi kalau dilanggar, dan selalu lebih longgar dari SLO.',
          analogy: 'SLI = kecepatan pengiriman paket yang tercatat; SLO = target tim “95% sampai besok”; SLA = janji ke pelanggan “kalau telat, ongkir dikembalikan”.',
          example: 'Google memberi SLA untuk layanannya; tim kamu menetapkan SLO untuk aplikasimu sendiri di Cloud Monitoring.',
          exam: '“SLA”, “SLO”, “SLI”, “error budget”, “service credits”'
        }
      ]
    },
    {
      id: 'terms-scale',
      part: 'terms',
      title: 'Membesar dan mengecil: scalability dan elasticity',
      terms: [
        {
          term: 'Scalability',
          meaning:
            'Kemampuan sistem menangani beban yang makin besar dengan menambah sumber daya. Bisa direncanakan dan dilakukan manual.',
          analogy: 'Warung yang sanggup melayani lebih banyak pembeli dengan menambah meja dan karyawan.',
          example: 'Menambah node ke cluster GKE ketika jumlah pengguna naik dari 1.000 ke 100.000.',
          exam: '“scale to millions of users”, “handle growth”'
        },
        {
          term: 'Vertical vs horizontal scaling',
          meaning:
            'Vertical (scale up): membuat satu mesin lebih besar — CPU dan RAM ditambah. Horizontal (scale out): menambah jumlah mesin yang sama. Cloud lebih menyukai horizontal karena tidak ada batas ukuran satu mesin dan tidak ada single point of failure.',
          analogy: 'Vertical = mengganti motor dengan truk. Horizontal = menambah lebih banyak motor.',
          example: 'Vertical: ubah VM dari e2-standard-4 ke e2-standard-16 (harus di-stop dulu). Horizontal: MIG dari 3 ke 10 VM.',
          exam: '“scale up / scale out”, “add more instances”, “increase machine type”'
        },
        {
          term: 'Elasticity',
          meaning:
            'Sumber daya bertambah dan berkurang otomatis mengikuti beban saat itu juga, dan kamu hanya membayar yang terpakai. Kalau scalability soal sanggup membesar, elasticity soal membesar-mengecil sendiri.',
          analogy: 'Karet gelang yang memanjang saat ditarik dan kembali kecil saat dilepas.',
          example: 'Toko online saat Harbolnas: Cloud Run naik dari 2 ke 200 instance dalam beberapa menit, lalu turun lagi ke 0 tengah malam.',
          exam: '“unpredictable traffic”, “spikes”, “scale down to zero”, “pay only for what you use”'
        },
        {
          term: 'Autoscaling',
          meaning: 'Fitur yang menjalankan elasticity: menambah atau mengurangi VM, pod, atau instance berdasarkan metrik seperti CPU atau jumlah permintaan.',
          analogy: 'Supermarket yang otomatis membuka kasir tambahan saat antrean lebih dari lima orang.',
          example: 'MIG dengan target CPU 60%; Horizontal Pod Autoscaler di GKE; Cloud Run dengan max-instances.',
          exam: '“autoscaling”, “target CPU utilization”, “min and max instances”'
        },
        {
          term: 'Latency vs throughput',
          meaning: 'Latency = berapa lama satu permintaan selesai (milidetik). Throughput = berapa banyak yang bisa diproses per detik. Bisa cepat tapi sedikit, atau banyak tapi lambat.',
          analogy: 'Latency = lama perjalanan satu mobil di jalan tol. Throughput = berapa mobil yang lewat gerbang tol per jam.',
          example: 'Cloud CDN menurunkan latency dengan menyimpan konten dekat pengguna; Bigtable dipilih untuk throughput tulis yang sangat tinggi.',
          exam: '“low latency”, “high throughput”, “close to users”'
        }
      ]
    },
    {
      id: 'terms-business',
      part: 'terms',
      title: 'Alasan bisnis pindah ke cloud',
      note: 'Bagian ini sangat sering muncul di Cloud Digital Leader: soal biasanya bertanya manfaat apa yang didapat perusahaan.',
      terms: [
        {
          term: 'Agility',
          meaning:
            'Kemampuan bergerak cepat: mencoba ide baru, mengubah, atau membatalkan dalam hitungan menit, bukan bulan. Di cloud, server baru tinggal klik — tidak perlu pesan hardware, menunggu pengiriman, lalu memasang.',
          analogy: 'Menyewa mobil lewat aplikasi (bisa hari ini juga) dibanding membeli mobil (survei, kredit, tunggu inden berbulan-bulan).',
          example: 'Tim data membuat cluster Dataproc untuk eksperimen satu sore, lalu menghapusnya. Di data center sendiri, servernya baru datang bulan depan.',
          exam: '“agility”, “experiment quickly”, “faster time to market”, “respond to change”'
        },
        {
          term: 'Time to market',
          meaning: 'Lama waktu dari ide sampai produk bisa dipakai pelanggan. Cloud memperpendeknya karena infrastruktur siap pakai dan banyak layanan terkelola.',
          analogy: 'Buka usaha katering dengan dapur sewaan yang sudah lengkap, bukan membangun dapur sendiri dulu.',
          example: 'Startup meluncurkan aplikasi di Cloud Run dan Firestore dalam dua minggu tanpa satu pun server sendiri.',
          exam: '“release features faster”, “speed of innovation”'
        },
        {
          term: 'CapEx vs OpEx',
          meaning:
            'CapEx (capital expenditure): biaya besar di depan untuk membeli aset, misalnya server dan gedung data center. OpEx (operational expenditure): biaya rutin sesuai pemakaian. Cloud mengubah sebagian besar CapEx menjadi OpEx.',
          analogy: 'Membeli rumah (CapEx) dibanding menyewa kos bulanan (OpEx).',
          example: 'Daripada membeli 50 server senilai miliaran rupiah, perusahaan membayar tagihan Compute Engine bulanan sesuai yang dipakai.',
          exam: '“shift from capital expenditure to operational expenditure”, “no upfront investment”'
        },
        {
          term: 'Pay-as-you-go',
          meaning: 'Bayar hanya untuk yang dipakai, dihitung per detik, per GB, atau per permintaan. Tidak terpakai, tidak bayar.',
          analogy: 'Listrik PLN pascabayar atau argo taksi.',
          example: 'Cloud Run menagih hanya selama ada permintaan yang diproses; BigQuery on-demand menagih per data yang dipindai query.',
          exam: '“consumption-based pricing”, “only pay for what you use”'
        },
        {
          term: 'TCO (Total Cost of Ownership)',
          meaning:
            'Total biaya sesungguhnya dalam jangka panjang, bukan hanya harga beli: listrik, pendingin, gedung, keamanan, lisensi, gaji tim yang merawat, dan penggantian hardware.',
          analogy: 'Harga mobil bukan hanya harga di dealer, tapi juga bensin, servis, pajak, asuransi, dan parkir.',
          example: 'Server sendiri terlihat lebih murah per bulan, tapi setelah dihitung listrik, AC, dan dua admin, TCO-nya lebih mahal dari Compute Engine.',
          exam: '“total cost of ownership”, “reduce operational overhead”'
        },
        {
          term: 'Economies of scale',
          meaning: 'Google membeli dan mengoperasikan hardware dalam jumlah raksasa, jadi biaya per unitnya jauh lebih murah dari yang bisa dicapai satu perusahaan. Penghematan itu ikut dinikmati pelanggan.',
          analogy: 'Belanja grosir lebih murah per bungkus daripada eceran.',
          example: 'Harga penyimpanan per GB di Cloud Storage jauh di bawah biaya membeli dan merawat storage sendiri.',
          exam: '“economies of scale”, “lower costs”'
        },
        {
          term: 'Managed service',
          meaning: 'Layanan yang urusan beratnya — instalasi, patch, backup, replikasi, scaling — dikerjakan oleh Google. Kamu fokus ke data dan aplikasi.',
          analogy: 'Tinggal di apartemen dengan pengelola gedung, dibanding rumah sendiri yang semua perbaikannya kamu urus.',
          example: 'Cloud SQL (database terkelola) dibanding menginstal MySQL sendiri di VM.',
          exam: '“fully managed”, “reduce operational overhead”, “no infrastructure to manage”'
        },
        {
          term: 'Serverless',
          meaning: 'Kamu menjalankan kode tanpa mengurus server sama sekali: tidak memilih VM, tidak patch OS, scaling otomatis sampai nol, bayar per pemakaian. Servernya tetap ada, tapi bukan urusanmu.',
          analogy: 'Naik ojek online: kamu sampai tujuan tanpa memiliki, merawat, atau memarkir motor.',
          example: 'Cloud Run, Cloud Run functions, BigQuery, App Engine standard.',
          exam: '“serverless”, “no servers to manage”, “scale to zero”'
        },
        {
          term: 'Digital transformation',
          meaning: 'Memakai teknologi modern untuk mengubah cara perusahaan bekerja dan melayani pelanggan — bukan sekadar memindahkan server, tapi mengubah proses dan produk.',
          analogy: 'Bank yang dulu hanya punya kantor cabang, kini sebagian besar layanannya lewat aplikasi.',
          example: 'Retailer memakai BigQuery dan Vertex AI untuk rekomendasi produk personal, bukan hanya laporan penjualan bulanan.',
          exam: '“digital transformation”, “modernize”, “data-driven decisions”'
        },
        {
          term: 'Innovation dan menggeser fokus',
          meaning: 'Karena pekerjaan rutin infrastruktur diambil alih cloud, tim bisa memakai waktunya untuk membangun hal yang membedakan bisnis mereka.',
          analogy: 'Pemilik restoran yang menyewa jasa kebersihan supaya bisa fokus mengembangkan menu.',
          example: 'Tim berhenti mengurus patching server dan mulai membangun fitur rekomendasi berbasis AI.',
          exam: '“focus on core business”, “innovate”, “undifferentiated heavy lifting”'
        }
      ]
    },
    {
      id: 'terms-where',
      part: 'terms',
      title: 'Di mana sumber daya berada',
      terms: [
        {
          term: 'Region',
          meaning: 'Wilayah geografis tempat Google punya beberapa data center, misalnya asia-southeast2 (Jakarta) atau us-central1 (Iowa). Memilih region yang dekat pengguna menurunkan latency.',
          analogy: 'Sebuah kota.',
          example: 'Data pelanggan Indonesia disimpan di asia-southeast2 karena aturan lokasi data.',
          exam: '“region”, “data residency”, “close to users”'
        },
        {
          term: 'Zone',
          meaning: 'Lokasi terpisah di dalam satu region (misalnya asia-southeast2-a, -b, -c) dengan listrik, pendingin, dan jaringan sendiri. Satu zona bisa bermasalah tanpa menjatuhkan zona lain.',
          analogy: 'Gedung-gedung berbeda di satu kota: kalau satu gedung mati listrik, gedung lain tetap menyala.',
          example: 'VM di us-central1-a dan us-central1-b supaya aplikasi bertahan saat satu zona gangguan.',
          exam: '“zonal outage”, “spread across zones”, “zonal vs regional resource”'
        },
        {
          term: 'Multi-region dan dual-region',
          meaning: 'Data atau layanan disebar di beberapa region sekaligus, supaya tetap tersedia walaupun satu region lumpuh total.',
          analogy: 'Menyimpan dokumen penting di rumah, di kantor, dan di rumah saudara di kota lain.',
          example: 'Bucket Cloud Storage lokasi US (multi-region) atau dual-region; Spanner konfigurasi multi-region.',
          exam: '“survive a regional outage”, “geo-redundant”'
        },
        {
          term: 'Edge, PoP, dan CDN',
          meaning: 'Edge location atau Point of Presence (PoP) adalah titik jaringan Google di ratusan kota yang dekat dengan pengguna. CDN memakai titik-titik ini untuk menyimpan salinan konten supaya cepat diambil.',
          analogy: 'Minimarket di setiap gang: barangnya dari gudang pusat, tapi kamu belanja di dekat rumah.',
          example: 'Gambar produk disajikan dari cache Cloud CDN di Jakarta walaupun bucket aslinya di Amerika.',
          exam: '“cache static content”, “edge locations”, “reduce latency for global users”'
        }
      ]
    },
    {
      id: 'terms-models',
      part: 'terms',
      title: 'Model layanan dan model cloud',
      terms: [
        {
          term: 'IaaS, PaaS, SaaS',
          meaning:
            'IaaS: kamu menyewa infrastruktur (VM, jaringan, disk) dan mengurus OS ke atas. PaaS: kamu hanya membawa kode, platform mengurus server dan OS. SaaS: aplikasi jadi, tinggal pakai.',
          analogy: 'Pizza: IaaS = sewa dapur dan bikin sendiri; PaaS = beli pizza beku lalu panggang di rumah; SaaS = pesan pizza antar, tinggal makan.',
          example: 'IaaS: Compute Engine. PaaS: App Engine, Cloud Run. SaaS: Google Workspace (Gmail, Docs).',
          exam: '“IaaS / PaaS / SaaS”, “who manages the operating system”'
        },
        {
          term: 'Shared responsibility model',
          meaning: 'Keamanan adalah tugas bersama: Google mengamankan infrastruktur fisik dan layanan dasarnya, kamu mengamankan apa yang kamu taruh di atasnya — data, akses (IAM), konfigurasi. Makin terkelola layanannya, makin sedikit bagianmu.',
          analogy: 'Penyedia kos menjaga gedung dan gembok pagar; kunci kamar dan barang di dalam kamar tanggung jawabmu.',
          example: 'Di Compute Engine kamu wajib patch OS; di BigQuery tidak, tapi siapa yang boleh membaca dataset tetap urusanmu.',
          exam: '“shared responsibility”, “customer is responsible for”'
        },
        {
          term: 'On-premises',
          meaning: 'Server yang kamu miliki dan jalankan sendiri di gedung atau data center perusahaan.',
          analogy: 'Punya genset dan sumur sendiri, bukan langganan PLN dan PDAM.',
          example: 'Database Oracle di ruang server kantor sebelum dimigrasikan.',
          exam: '“on-premises”, “existing data center”, “legacy”'
        },
        {
          term: 'Public, private, hybrid, multicloud',
          meaning:
            'Public cloud: infrastruktur penyedia seperti Google Cloud, dipakai bersama banyak pelanggan dengan isolasi. Private cloud: infrastruktur khusus satu organisasi. Hybrid: on-premises dan cloud dipakai bersama dan saling terhubung. Multicloud: memakai lebih dari satu penyedia cloud publik.',
          analogy: 'Hybrid = sebagian barang di rumah, sebagian di gudang sewaan. Multicloud = langganan dua ekspedisi sekaligus.',
          example: 'Hybrid: sistem kasir tetap di toko, analitik di BigQuery, tersambung lewat Cloud VPN. Multicloud: GKE Enterprise mengelola cluster di Google Cloud dan AWS dari satu tempat.',
          exam: '“hybrid cloud”, “multicloud”, “avoid vendor lock-in”, “keep some workloads on-premises”'
        },
        {
          term: 'Lift and shift, greenfield, brownfield',
          meaning:
            'Lift and shift (rehost): pindahkan aplikasi ke VM apa adanya. Greenfield: membangun aplikasi baru dari nol di cloud. Brownfield (versi Google untuk CDL): membuat aplikasi baru di cloud untuk menggantikan aplikasi lama yang sudah ada.',
          analogy: 'Lift and shift = pindah rumah membawa semua perabot lama. Greenfield = membangun rumah di tanah kosong. Brownfield = membongkar rumah lama lalu membangun yang baru di tanah yang sama.',
          example: 'Memindahkan VM VMware ke Compute Engine tanpa mengubah kode adalah lift and shift.',
          exam: '“migrate quickly without code changes” → lift and shift · “invent in greenfield / brownfield”'
        }
      ]
    },
    {
      id: 'terms-security',
      part: 'terms',
      title: 'Keamanan dasar',
      terms: [
        {
          term: 'Least privilege',
          meaning: 'Beri setiap orang atau aplikasi hanya izin yang benar-benar dibutuhkan, tidak lebih.',
          analogy: 'Petugas kebersihan kantor diberi kunci ruangan, bukan kunci brankas.',
          example: 'Aplikasi yang hanya membaca bucket diberi roles/storage.objectViewer, bukan Editor.',
          exam: '“principle of least privilege”, “minimum permissions”'
        },
        {
          term: 'Encryption at rest dan in transit',
          meaning: 'At rest: data dienkripsi saat tersimpan di disk. In transit: data dienkripsi saat dikirim lewat jaringan. Google mengenkripsi keduanya secara default; kamu bisa memegang kuncinya sendiri lewat Cloud KMS (CMEK).',
          analogy: 'At rest = surat di dalam brankas. In transit = surat dalam amplop tersegel saat dikirim kurir.',
          example: 'Disk VM dienkripsi otomatis; perusahaan dengan aturan ketat memakai customer-managed encryption keys.',
          exam: '“encryption at rest”, “CMEK”, “Cloud KMS”'
        },
        {
          term: 'Zero trust',
          meaning: 'Tidak ada yang dipercaya hanya karena berada “di dalam jaringan kantor”. Setiap akses dicek identitas dan konteksnya setiap kali.',
          analogy: 'Gedung yang memeriksa kartu akses di setiap pintu ruangan, bukan hanya di pintu depan.',
          example: 'BeyondCorp / Identity-Aware Proxy: karyawan membuka aplikasi internal tanpa VPN, aksesnya dicek per permintaan.',
          exam: '“zero trust”, “BeyondCorp”, “access without a VPN”'
        }
      ]
    }
  ]
};
