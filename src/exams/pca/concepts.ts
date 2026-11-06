/**
 * Architecture concepts for the Professional Cloud Architect exam, in plain
 * Indonesian like the ACE concepts sheet: the ideas a design question assumes
 * rather than the basic cloud vocabulary. Terms stay in English, because that
 * is how the exam prints them; every card adds an everyday analogy, a Google
 * Cloud example, and the phrase that signals it in a question.
 */
import type { Cheatsheet } from '@/types';

export const concepts: Cheatsheet = {
  lang: 'id',
  title: 'Konsep arsitektur, bahasa sehari-hari',
  filterHint: 'Cari — coba “coupling”, “RPO”, “zero trust”, “TCO”, “grounding”…',
  intro:
    'Ide-ide yang diasumsikan soal desain PCA: bukan "apa itu VM", tapi kenapa satu arsitektur lebih tepat dari yang lain. Istilahnya tetap bahasa Inggris seperti di soal. Tiap kartu berisi arti, analogi sehari-hari, contoh di Google Cloud, dan frasa yang menandainya di soal.',
  parts: [
    { id: 'design', title: 'Cara arsitek berpikir', blurb: 'Kebutuhan, trade-off dan prinsip desain.' },
    { id: 'reliability', title: 'Keandalan dan pemulihan', blurb: 'SRE, pola DR dan konsistensi data.' },
    { id: 'security', title: 'Keamanan dan kepatuhan', blurb: 'Prinsip yang membuat jawaban keamanan terlihat jelas.' },
    { id: 'data-ai', title: 'Data dan AI', blurb: 'Pola data dan cara memakai model generatif.' },
    { id: 'business', title: 'Bisnis, biaya dan migrasi', blurb: 'Alasan di balik keputusan, bukan hanya teknologinya.' }
  ],
  groups: [
    {
      id: 'requirements',
      part: 'design',
      title: 'Kebutuhan dan trade-off',
      note: 'Hampir setiap soal PCA dimulai dari kebutuhan. Jawaban yang benar adalah yang memenuhi kebutuhan yang tertulis dengan paling sedikit yang harus dioperasikan.',
      terms: [
        {
          term: 'Functional vs non-functional requirement',
          meaning: 'Functional = apa yang dilakukan sistem (fitur). Non-functional = seberapa baik sistem melakukannya: latensi, ketersediaan, keamanan, biaya, skala.',
          analogy: 'Mobil harus bisa mengangkut 7 orang (fungsional); harus irit dan aman (non-fungsional).',
          example: '"Pelanggan bisa mengunduh invoice" vs "halaman checkout merespons di bawah 300 ms pada p95".',
          exam: '“must”, “within”, “at least 99.9%”, “without paying for idle capacity”'
        },
        {
          term: 'Trade-off',
          meaning: 'Setiap pilihan memberi sesuatu dan mengorbankan sesuatu. Tugas arsitek adalah memilih yang pengorbanannya paling bisa diterima bisnis, lalu mencatat alasannya.',
          analogy: 'Ojek lebih cepat di jalan macet, taksi lebih nyaman saat hujan.',
          example: 'Spanner multi-region memberi RPO nol tapi lebih mahal dan sedikit lebih lambat menulis dibanding Cloud SQL satu region.',
          exam: '“cost-effective”, “while minimizing”, “balance”'
        },
        {
          term: 'Managed service first',
          meaning: 'Jika layanan terkelola memenuhi kebutuhan, ia hampir selalu jawaban yang benar, karena patching, scaling dan failover diurus Google.',
          analogy: 'Menyewa gedung yang sudah ada satpam dan teknisinya, daripada membangun dan menjaga sendiri.',
          example: 'Cloud SQL daripada MySQL di VM; Cloud Run daripada cluster yang dikelola sendiri.',
          exam: '“minimize operational overhead”, “small team”, “no servers to manage”'
        },
        {
          term: 'Well-Architected Framework',
          meaning: 'Kerangka Google untuk menilai desain: operational excellence, security, reliability, cost optimization dan performance optimization, ditambah perspektif khusus seperti AI dan keberlanjutan.',
          analogy: 'Daftar periksa kelaikan kendaraan sebelum perjalanan jauh.',
          example: 'Review arsitektur berkala yang memeriksa setiap pilar dan rekomendasi Active Assist.',
          exam: '“best practices”, “well-architected”, nama salah satu pilar'
        }
      ]
    },
    {
      id: 'principles',
      part: 'design',
      title: 'Prinsip desain',
      terms: [
        {
          term: 'Loose coupling',
          meaning: 'Komponen saling bergantung lewat kontrak yang jelas (API, event), bukan lewat database bersama atau panggilan langsung yang menunggu. Satu bagian bisa diubah, diskalakan atau gagal tanpa menyeret yang lain.',
          analogy: 'Kotak surat: pengirim tidak perlu menunggu penerima ada di rumah.',
          example: 'Pesanan ditulis ke Pub/Sub, lalu sistem dealer membacanya sesuai kecepatannya sendiri.',
          exam: '“decouple”, “independently scale”, “downstream system is slow”'
        },
        {
          term: 'Stateless',
          meaning: 'Server tidak menyimpan data sesi di dirinya sendiri; semua state ada di database atau cache. Instance mana pun bisa melayani permintaan mana pun, jadi mudah ditambah, dikurangi atau diganti.',
          analogy: 'Loket bank yang semua datanya ada di sistem pusat: nasabah bisa dilayani di loket mana saja.',
          example: 'Sesi di Memorystore, aplikasi di Cloud Run atau MIG yang bisa autoscale.',
          exam: '“scale horizontally”, “any instance can be replaced”'
        },
        {
          term: 'Idempotency',
          meaning: 'Menjalankan operasi yang sama dua kali memberi hasil yang sama seperti sekali. Penting karena pesan bisa terkirim lebih dari sekali dan retry pasti terjadi.',
          analogy: 'Menekan tombol lift berkali-kali tetap memanggil satu lift.',
          example: 'Konsumen Pub/Sub memeriksa ID pesanan sebelum menyimpan, sehingga pesan duplikat tidak membuat pesanan ganda.',
          exam: '“duplicate messages”, “retries”, “at-least-once”'
        },
        {
          term: 'Infrastructure as code (IaC)',
          meaning: 'Infrastruktur ditulis sebagai kode yang direview dan disimpan di Git, lalu diterapkan otomatis. Lingkungan bisa dibuat ulang persis sama, dan setiap perubahan tercatat.',
          analogy: 'Resep masakan tertulis: siapa pun bisa memasak hasil yang sama.',
          example: 'Modul Terraform untuk project factory, dijalankan dari pipeline, state di bucket Cloud Storage dengan locking.',
          exam: '“repeatable”, “consistent environments”, “drift”'
        },
        {
          term: 'Immutable infrastructure',
          meaning: 'Server atau image tidak diubah setelah dibuat. Untuk berubah, buat versi baru dan ganti yang lama. Rollback berarti kembali ke versi sebelumnya yang sudah teruji.',
          analogy: 'Mengganti bola lampu baru, bukan memperbaiki filamennya.',
          example: 'Satu image container per rilis dipromosikan dari staging ke produksi; template MIG baru dengan rolling update.',
          exam: '“golden image”, “same artifact in every environment”'
        }
      ]
    },
    {
      id: 'sre',
      part: 'reliability',
      title: 'SRE: keandalan yang diukur',
      terms: [
        {
          term: 'Error budget',
          meaning: 'Selisih antara 100% dan SLO. SLO 99,9% berarti boleh gagal 0,1%. Selama anggaran masih ada, tim boleh merilis fitur; jika habis, fokus pindah ke keandalan.',
          analogy: 'Jatah cuti: boleh dipakai, tapi kalau habis harus masuk kerja.',
          example: 'SLO checkout 99,9% per bulan; alert burn-rate saat anggaran terpakai terlalu cepat.',
          exam: '“error budget exhausted”, “balance velocity and reliability”'
        },
        {
          term: 'Toil',
          meaning: 'Pekerjaan operasional manual dan berulang yang tidak menambah nilai jangka panjang. SRE mengukurnya dan mengotomatiskannya.',
          analogy: 'Menyalin data dari satu buku ke buku lain setiap hari dengan tangan.',
          example: 'Restart job yang macet setiap pagi → diganti autohealing atau perbaikan akar masalah.',
          exam: '“manual, repetitive tasks”, “operations team spends most of its time”'
        },
        {
          term: 'Symptom-based alerting',
          meaning: 'Alert yang membangunkan orang hanya ketika pengguna terdampak (SLO terancam), bukan setiap kali CPU tinggi. Penyebab teknis cukup di dashboard.',
          analogy: 'Alarm kebakaran berbunyi saat ada asap, bukan setiap kali kompor dinyalakan.',
          example: 'Alert burn-rate SLO dengan runbook; CPU per node hanya di dashboard.',
          exam: '“alert fatigue”, “too many alerts”, “page only when users are affected”'
        },
        {
          term: 'Blameless postmortem',
          meaning: 'Setelah insiden, tim menulis apa yang terjadi, dampaknya, akar masalah dan tindakan perbaikan — tanpa mencari kambing hitam — supaya orang jujur dan sistemnya yang diperbaiki.',
          analogy: 'Investigasi kecelakaan pesawat yang mencari penyebab, bukan pelaku.',
          example: 'Dokumen postmortem dengan action item yang dilacak sampai selesai.',
          exam: '“learn from incidents”, “prevent recurrence”'
        }
      ]
    },
    {
      id: 'dr',
      part: 'reliability',
      title: 'Pola disaster recovery',
      note: 'Pilih dari angka bisnis: RTO (berapa lama boleh mati) dan RPO (berapa banyak data boleh hilang). Makin kecil angkanya, makin mahal polanya.',
      terms: [
        {
          term: 'Backup and restore',
          meaning: 'Region cadangan kosong; hanya backup yang disalin ke sana. Saat bencana, infrastruktur dibangun ulang (idealnya dengan IaC) dan data dipulihkan. RTO berjam-jam, biaya paling rendah.',
          analogy: 'Menyimpan fotokopi dokumen di rumah saudara.',
          example: 'Backup harian Cloud SQL ke region lain plus Terraform untuk membangun ulang.',
          exam: '“RTO of 24 hours”, “lowest cost”'
        },
        {
          term: 'Pilot light',
          meaning: 'Data direplikasi terus ke region cadangan, tapi server aplikasi mati. Saat bencana, aplikasi dinyalakan di sekitar data yang sudah siap.',
          analogy: 'Api kecil di kompor gas yang selalu menyala, siap dibesarkan.',
          example: 'Replika Cloud SQL lintas region aktif; tier aplikasi dibuat dari IaC saat failover.',
          exam: '“RPO of minutes, RTO of an hour”'
        },
        {
          term: 'Warm standby',
          meaning: 'Salinan lengkap yang lebih kecil sudah berjalan di region cadangan dan tinggal diperbesar saat dibutuhkan.',
          analogy: 'Mobil cadangan yang mesinnya sudah dipanaskan.',
          example: 'MIG kecil di region kedua di belakang load balancer global, ditambah replika database.',
          exam: '“minutes of downtime”'
        },
        {
          term: 'Active-active',
          meaning: 'Dua region atau lebih melayani pengguna bersamaan dengan kapasitas penuh. RTO dan RPO mendekati nol, biaya tertinggi.',
          analogy: 'Dua cabang toko yang sama-sama buka; jika satu tutup, pelanggan pindah ke yang lain.',
          example: 'Spanner multi-region dan backend di dua region di belakang load balancer global.',
          exam: '“near-zero RTO and RPO”, “cost is not the main concern”'
        },
        {
          term: 'Strong vs eventual consistency',
          meaning: 'Strong: setiap pembacaan melihat tulisan terakhir. Eventual: salinan lain menyusul beberapa saat kemudian, jadi pembacaan sebentar bisa melihat data lama. Replikasi asinkron (eventual) murah dan cepat tapi bisa kehilangan data terakhir saat failover.',
          analogy: 'Telepon langsung (strong) vs kirim surat (eventual).',
          example: 'Spanner: strong lintas region. Replika baca Cloud SQL dan replikasi Bigtable: eventual.',
          exam: '“strongly consistent”, “globally consistent transactions”, “replication lag”'
        }
      ]
    },
    {
      id: 'security',
      part: 'security',
      title: 'Prinsip keamanan',
      terms: [
        {
          term: 'Least privilege',
          meaning: 'Setiap identitas hanya mendapat izin yang benar-benar dibutuhkan, selama dibutuhkan. Hindari role dasar (Owner, Editor) di produksi.',
          analogy: 'Petugas kebersihan memegang kunci ruangan, bukan kunci brankas.',
          example: 'Role terpisah per tugas, IAM Conditions yang berakhir otomatis, akses darurat lewat Privileged Access Manager.',
          exam: '“minimum permissions”, “only what is needed”'
        },
        {
          term: 'Defense in depth',
          meaning: 'Beberapa lapis kontrol, supaya jika satu jebol yang lain masih menahan: identitas, jaringan, enkripsi, perimeter, logging.',
          analogy: 'Rumah dengan pagar, pintu terkunci, dan brankas di dalam.',
          example: 'IAM ketat + VPC Service Controls + CMEK + audit log + Model Armor untuk aplikasi AI.',
          exam: '“layered security”, “multiple controls”'
        },
        {
          term: 'Zero trust (BeyondCorp)',
          meaning: 'Tidak ada yang dipercaya hanya karena berada di jaringan kantor. Setiap permintaan diperiksa identitas dan konteksnya (perangkat, lokasi).',
          analogy: 'Setiap ruangan di gedung memeriksa kartu akses, bukan hanya pintu depan.',
          example: 'Identity-Aware Proxy di depan aplikasi internal, tanpa VPN; Chrome Enterprise Premium untuk akses berbasis konteks.',
          exam: '“without a VPN”, “context-aware access”'
        },
        {
          term: 'Shared responsibility',
          meaning: 'Google mengamankan infrastruktur dan bertanggung jawab atas sertifikasinya; pelanggan bertanggung jawab atas konfigurasi, identitas dan data di dalamnya. Makin terkelola layanannya, makin banyak bagian Google.',
          analogy: 'Apartemen: pengelola menjaga gedung, penghuni mengunci pintunya sendiri.',
          example: 'Cloud Storage tersertifikasi HIPAA, tapi bucket publik tetap kesalahan pelanggan.',
          exam: '“compliant service”, “who is responsible”'
        },
        {
          term: 'Data residency vs sovereignty',
          meaning: 'Residency: data harus disimpan di wilayah tertentu. Sovereignty: lebih luas, termasuk siapa yang boleh mengakses dan hukum mana yang berlaku.',
          analogy: 'Residency = barang disimpan di gudang dalam negeri; sovereignty = juga hanya staf lokal yang boleh membuka gudangnya.',
          example: 'Organization policy `gcp.resourceLocations`; Assured Workloads untuk kontrol akses personel.',
          exam: '“must stay in the EU”, “data residency”, “regulator”'
        },
        {
          term: 'Data exfiltration',
          meaning: 'Data disalin keluar oleh orang atau kode yang punya akses sah tapi tidak semestinya. IAM saja tidak cukup, karena kredensialnya memang valid.',
          analogy: 'Karyawan yang membawa pulang dokumen rahasia dengan kartu aksesnya sendiri.',
          example: 'VPC Service Controls memblokir penyalinan dari BigQuery ke project di luar perimeter.',
          exam: '“prevent data exfiltration”, “copy data to a personal project”'
        }
      ]
    },
    {
      id: 'data',
      part: 'data-ai',
      title: 'Pola data',
      terms: [
        {
          term: 'OLTP vs OLAP',
          meaning: 'OLTP: banyak transaksi kecil yang cepat (pesanan, pembayaran). OLAP: kueri analitik besar atas data historis.',
          analogy: 'Kasir yang mencatat setiap penjualan (OLTP) vs akuntan yang menyusun laporan tahunan (OLAP).',
          example: 'Cloud SQL, AlloyDB, Spanner untuk OLTP; BigQuery untuk OLAP.',
          exam: '“transactional”, “analytics”, “reporting on historical data”'
        },
        {
          term: 'Change data capture (CDC)',
          meaning: 'Menyalin setiap perubahan di database sumber ke sistem lain secara terus-menerus, dengan membaca log transaksinya, tanpa membebani database dengan ekspor besar.',
          analogy: 'Notulen rapat yang dikirim setiap ada keputusan, bukan menunggu laporan bulanan.',
          example: 'Datastream dari MySQL atau Oracle ke BigQuery dalam hitungan menit.',
          exam: '“near real-time replication to BigQuery”, “without impacting the source”'
        },
        {
          term: 'Batch vs streaming',
          meaning: 'Batch memproses data yang sudah terkumpul pada jadwal tertentu; streaming memproses setiap event begitu datang.',
          analogy: 'Mencuci baju seminggu sekali vs mencuci piring setiap selesai makan.',
          example: 'Dataflow menjalankan keduanya dengan kode Beam yang sama; streaming memakai window dan watermark untuk data terlambat.',
          exam: '“real-time”, “nightly”, “late-arriving data”'
        },
        {
          term: 'Lakehouse',
          meaning: 'Data mentah dan terstruktur disimpan murah di object storage, tapi bisa dikueri dan diatur seperti gudang data, dengan satu tata kelola.',
          analogy: 'Gudang yang barangnya tetap di rak masing-masing tapi tercatat di satu katalog.',
          example: 'Cloud Storage + BigLake + BigQuery, dikelola lewat Knowledge Catalog.',
          exam: '“data silos”, “unified analytics”, “governance and lineage”'
        }
      ]
    },
    {
      id: 'genai',
      part: 'data-ai',
      title: 'Memakai AI generatif',
      terms: [
        {
          term: 'Grounding dan RAG',
          meaning: 'Model diberi dokumen relevan yang diambil dari sumber terpercaya saat menjawab (retrieval-augmented generation), sehingga jawabannya terkini dan bisa mengutip sumber, bukan mengarang.',
          analogy: 'Ujian open book: jawab berdasarkan buku, bukan ingatan.',
          example: 'Agent Search mengindeks dokumen perusahaan dan Gemini menjawab berdasarkan bagian yang ditemukan.',
          exam: '“hallucination”, “answers must cite company documents”, “content changes daily”'
        },
        {
          term: 'Prompting vs fine-tuning',
          meaning: 'Mulai dari prompt yang baik dan grounding. Fine-tuning mengubah perilaku atau gaya model dengan contoh, tapi mahal dan tidak membuat model tahu data yang berubah setiap hari.',
          analogy: 'Memberi instruksi jelas ke karyawan baru vs mengirimnya kursus panjang.',
          example: 'Format keluaran yang konsisten → response schema; gaya bahasa merek → fine-tuning bila prompt tidak cukup.',
          exam: '“least effort”, “specialized style”, “frequently changing data”'
        },
        {
          term: 'Batch vs online inference',
          meaning: 'Online: satu permintaan, satu jawaban, segera. Batch: ribuan atau jutaan permintaan diproses sekaligus dengan harga lebih murah, hasilnya menyusul.',
          analogy: 'Pesan makanan di tempat vs pesan katering untuk acara besar.',
          example: 'Ringkasan untuk 400.000 arsip lama dengan batch prediction dan model Flash; item baru secara online.',
          exam: '“large backlog”, “cost is a priority”'
        },
        {
          term: 'Human in the loop',
          meaning: 'Keluaran AI ditinjau manusia sebelum berdampak (dipublikasikan, dikirim ke pelanggan), terutama jika kesalahan mahal.',
          analogy: 'Editor yang membaca naskah sebelum dicetak.',
          example: 'Atribut produk hasil Gemini masuk antrean review dan hanya yang disetujui dipublikasikan.',
          exam: '“review before publishing”, “approve or reject”'
        }
      ]
    },
    {
      id: 'cost',
      part: 'business',
      title: 'Biaya',
      terms: [
        {
          term: 'TCO',
          meaning: 'Total cost of ownership: seluruh biaya selama umur sistem — bukan hanya harga server, tapi juga listrik, gedung, lisensi, staf dan waktu henti.',
          analogy: 'Harga mobil + bensin + servis + asuransi, bukan hanya harga di dealer.',
          example: 'Membandingkan pusat data sendiri dengan Google Cloud sebelum migrasi.',
          exam: '“total cost”, “business case for migration”'
        },
        {
          term: 'CapEx vs OpEx',
          meaning: 'CapEx: belanja modal besar di muka (membeli server). OpEx: biaya operasional yang mengikuti pemakaian. Cloud menggeser CapEx ke OpEx.',
          analogy: 'Membeli rumah vs menyewa per bulan.',
          example: 'Tidak ada lagi pembelian perangkat keras lima tahunan; tagihan bulanan sesuai pemakaian.',
          exam: '“upfront investment”, “pay as you go”'
        },
        {
          term: 'FinOps',
          meaning: 'Praktik bersama antara keuangan, teknik dan bisnis untuk melihat, mengalokasikan dan mengoptimalkan biaya cloud secara terus-menerus.',
          analogy: 'Anggaran rumah tangga yang dibahas bersama setiap bulan.',
          example: 'Label tim dan lingkungan, ekspor billing ke BigQuery, budget per tim dengan alert forecast, rekomendasi rightsizing.',
          exam: '“chargeback”, “cost visibility per team”'
        },
        {
          term: 'Committed vs flexible capacity',
          meaning: 'Komitmen (CUD) memberi diskon untuk beban tetap yang selalu jalan; on-demand dan Spot untuk sisanya. Komit untuk baseline, bukan untuk puncak.',
          analogy: 'Langganan bulanan untuk perjalanan harian, tiket eceran untuk perjalanan sesekali.',
          example: 'CUD untuk 200 vCPU baseline; autoscaling on-demand untuk lonjakan malam; Spot untuk batch.',
          exam: '“steady baseline”, “predictable usage”, “fault-tolerant batch”'
        }
      ]
    },
    {
      id: 'migration',
      part: 'business',
      title: 'Migrasi dan perubahan',
      terms: [
        {
          term: 'Rehost, replatform, refactor (dan kawan-kawan)',
          meaning: 'Rehost = pindah apa adanya (lift and shift). Replatform = sedikit diubah untuk memakai layanan terkelola. Refactor = ditulis ulang untuk cloud. Ditambah retire (dimatikan), retain (dibiarkan) dan repurchase (diganti SaaS).',
          analogy: 'Pindah rumah dengan semua perabot (rehost), mengganti kompor ke yang cocok dengan rumah baru (replatform), atau merenovasi total (refactor).',
          example: 'VM ke Compute Engine dengan Migrate to Virtual Machines; MySQL ke Cloud SQL; CRM yang bukan pembeda bisnis → SaaS.',
          exam: '“quickly”, “least change”, “data center lease expires”, “not a differentiator”'
        },
        {
          term: 'Strangler pattern',
          meaning: 'Sistem lama diganti sedikit demi sedikit: fungsi baru dibangun di samping, lalu lalu lintas dipindahkan bertahap sampai sistem lama bisa dimatikan.',
          analogy: 'Mengganti tiang jembatan satu per satu tanpa menutup jembatannya.',
          example: 'Apigee di depan mainframe; endpoint dipindahkan ke layanan cloud satu per satu.',
          exam: '“cannot be replaced at once”, “modernize gradually”'
        },
        {
          term: 'Change management',
          meaning: 'Teknologi baru berhasil jika orangnya ikut berubah: alasan yang jelas, pelatihan, tim pilot sebagai juara, dan peluncuran bertahap.',
          analogy: 'Mengajak satu keluarga pindah rumah: jelaskan alasannya dulu, jangan langsung angkut barangnya.',
          example: 'Cloud centre of excellence, jalur pelatihan per peran, sertifikasi.',
          exam: '“teams resist”, “upskill”, “adoption”'
        }
      ]
    }
  ]
};
