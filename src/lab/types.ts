/** Shared shapes for the three lab modes. */

export type LabMode = 'terminal' | 'network' | 'arch';

export type LabLevel = 'Dasar' | 'Menengah' | 'Lanjut';

/** What every scenario shows on the lab hub. */
export interface LabMeta {
  id: string;
  title: string;
  level: LabLevel;
  /** One line for the card. */
  summary: string;
  /** Exam topics practised, shown as small labels. */
  topics: string[];
}

export const LAB_MODES: { id: LabMode; title: string; blurb: string; icon: string }[] = [
  {
    id: 'terminal',
    title: 'Terminal',
    icon: '>_',
    blurb:
      'Cloud Shell tiruan: ketik perintah gcloud, kubectl, gsutil dan bq sungguhan. Setiap task dicek otomatis dari state project, bukan dari teks perintahnya.'
  },
  {
    id: 'network',
    title: 'Topologi jaringan',
    icon: '⇄',
    blurb:
      'Seperti Packet Tracer untuk VPC: susun subnet, VM, firewall, NAT, peering, VPN dan load balancer, lalu kirim paket dan lihat di hop mana ia lolos atau ditolak.'
  },
  {
    id: 'arch',
    title: 'Skenario arsitektur',
    icon: '◫',
    blurb:
      'Studi kasus gaya soal ujian: pilih layanan untuk tiap komponen desain. Jawaban dinilai per komponen, lengkap dengan alasan kenapa pilihan lain kurang tepat.'
  }
];
