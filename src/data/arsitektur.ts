/**
 * S03 — Arsitektur, dan S04 — Keandalan pemrosesan asinkron.
 *
 * `shared` bukan microservice: ia modul pustaka yang ditautkan ke beberapa
 * layanan sekaligus (`bab3.tex:130`).
 */

import type { Angka, Bersumber, Butir } from './tipe'

export type PeranLayanan = 'inti' | 'pendukung'

export interface Layanan extends Bersumber {
  id: string
  nama: string
  tanggungJawab: string
  peran: PeranLayanan
  sumberPeran: string
  /** `false` untuk `analysis-worker` yang memang tidak mendefinisikan health check. */
  punyaHealthCheck: boolean
}

export const layanan: Layanan[] = [
  {
    id: 'auth-service',
    nama: 'auth-service',
    tanggungJawab:
      'Registrasi, verifikasi OTP, login, login admin, OAuth Google, JWT, rotasi refresh token.',
    peran: 'pendukung',
    sumberPeran: 'bab3.tex:52',
    punyaHealthCheck: true,
    sumber: 'bab3-metodologi/tabel-lama/layanan.tex:13',
  },
  {
    id: 'assessment-service',
    nama: 'assessment-service',
    tanggungJawab: 'Pengiriman asesmen bertoken, pembacaan hasil, saldo dan riwayat token.',
    peran: 'inti',
    sumberPeran: 'CONTEXT.md:38',
    punyaHealthCheck: true,
    sumber: 'bab3-metodologi/tabel-lama/layanan.tex:14',
  },
  {
    id: 'analysis-worker',
    nama: 'analysis-worker',
    tanggungJawab:
      'Konsumsi antrean Redis, scoring, retrieval RAG, generasi Gemini, persistensi hasil.',
    peran: 'inti',
    sumberPeran: 'CONTEXT.md:38',
    punyaHealthCheck: false,
    sumber: 'bab3-metodologi/tabel-lama/layanan.tex:15',
  },
  {
    id: 'notification-service',
    nama: 'notification-service',
    tanggungJawab: 'SSE event analisis dari Redis Pub/Sub yang terautentikasi.',
    peran: 'pendukung',
    sumberPeran: 'CONTEXT.md:44',
    punyaHealthCheck: true,
    sumber: 'bab3-metodologi/tabel-lama/layanan.tex:16',
  },
  {
    id: 'chat-service',
    nama: 'chat-service',
    tanggungJawab: 'Obrolan asesmen dengan masukan POST dan keluaran SSE.',
    peran: 'inti',
    sumberPeran: 'CONTEXT.md:38',
    punyaHealthCheck: true,
    sumber: 'bab3-metodologi/tabel-lama/layanan.tex:17',
  },
  {
    id: 'payment-service',
    nama: 'payment-service',
    tanggungJawab: 'Pembelian token QRIS melalui Pakasir.',
    peran: 'pendukung',
    sumberPeran: 'CONTEXT.md:44',
    punyaHealthCheck: true,
    sumber: 'bab3-metodologi/tabel-lama/layanan.tex:18',
  },
  {
    id: 'admin-service',
    nama: 'admin-service',
    tanggungJawab: 'API panel administrasi.',
    peran: 'pendukung',
    sumberPeran: 'CONTEXT.md:44',
    punyaHealthCheck: true,
    sumber: 'bab3-metodologi/tabel-lama/layanan.tex:19',
  },
]

export const modulBersama: Bersumber & { nama: string; isi: string; catatan: string } = {
  nama: 'shared',
  isi: 'Kode yang dipakai lebih dari satu layanan, antara lain scorer, client basis data, dan utilitas konfigurasi.',
  catatan: 'Modul pustaka, bukan microservice mandiri, sehingga tidak dihitung sebagai layanan.',
  sumber: 'bab3.tex:130',
}

export interface Infrastruktur extends Bersumber {
  id: string
  nama: string
  peran: string
}

export const infrastruktur: Infrastruktur[] = [
  {
    id: 'postgres',
    nama: 'PostgreSQL + pgvector',
    peran: 'Satu instans dipakai bersama tujuh layanan; vektor embedding disimpan di sini, bukan pada basis data vektor terpisah.',
    sumber: 'bab3.tex:116',
  },
  {
    id: 'redis',
    nama: 'Redis',
    peran: 'Sekaligus antrean pekerjaan dan kanal Pub/Sub notifikasi, sehingga tidak diperlukan message broker tersendiri.',
    sumber: 'bab3.tex:116',
  },
  {
    id: 'gemini',
    nama: 'Gemini',
    peran: 'Sintesis analisis ber-skema dan pembentukan vektor embedding.',
    sumber: 'bab3.tex:116',
  },
  {
    id: 'openrouter',
    nama: 'OpenRouter',
    peran: 'Penyedia model layanan obrolan yang menuntut streaming token.',
    sumber: 'bab3.tex:116',
  },
  {
    id: 'pakasir',
    nama: 'Pakasir (QRIS)',
    peran: 'Pembelian token; komponen pendukung, tidak dievaluasi sebagai kontribusi inti.',
    sumber: 'bab1.tex:44',
  },
]

export interface LangkahJalur extends Bersumber {
  id: string
  dari: string
  ke: string
  keterangan: string
  /** `cepat` untuk transaksi HTTP milidetik, `lambat` untuk pekerjaan puluhan detik. */
  beban: 'cepat' | 'lambat'
}

/** Jalur permintaan yang dinyalakan per langkah narasi pada S03. */
export const jalurPermintaan: LangkahJalur[] = [
  {
    id: 'klien-assessment',
    dari: 'Klien',
    ke: 'assessment-service',
    keterangan: 'Pengiriman 200 jawaban asesmen melalui HTTP, dibayar satu token.',
    beban: 'cepat',
    sumber: 'bab3.tex:254',
  },
  {
    id: 'assessment-outbox',
    dari: 'assessment-service',
    ke: 'tabel outbox',
    keterangan:
      'Satu transaksi PostgreSQL memuat kunci saldo, potong token, catat ledger, simpan asesmen + 200 jawaban, dan sisipkan satu baris outbox.',
    beban: 'cepat',
    sumber: 'bab3.tex:254',
  },
  {
    id: 'poller-redis',
    dari: 'poller outbox',
    ke: 'antrean Redis',
    keterangan:
      'Poller terpisah mengklaim baris dengan FOR UPDATE SKIP LOCKED, menerbitkannya ke Redis, lalu menandainya published.',
    beban: 'cepat',
    sumber: 'bab3.tex:254',
  },
  {
    id: 'redis-worker',
    dari: 'antrean Redis',
    ke: 'analysis-worker',
    keterangan: 'Worker mengklaim pekerjaan dengan HSETNX sebelum memprosesnya.',
    beban: 'lambat',
    sumber: 'bab3.tex:266',
  },
  {
    id: 'worker-gemini',
    dari: 'analysis-worker',
    ke: 'Gemini',
    keterangan:
      'Scoring, retrieval RAG, lalu sintesis ber-skema. Pekerjaan berlangsung puluhan detik dan memanggil layanan eksternal.',
    beban: 'lambat',
    sumber: 'bab3.tex:134',
  },
  {
    id: 'worker-persist',
    dari: 'analysis-worker',
    ke: 'PostgreSQL',
    keterangan:
      'Hasil analisis, skor domain, referensi asesmen, dan relasi keterlacakan klaim ditulis dalam satu transaksi.',
    beban: 'lambat',
    sumber: 'bab3.tex:237',
  },
  {
    id: 'notifikasi-klien',
    dari: 'notification-service',
    ke: 'Klien',
    keterangan: 'Status analisis dialirkan sebagai SSE event dari Redis Pub/Sub yang terautentikasi.',
    beban: 'cepat',
    sumber: 'bab3-metodologi/tabel-lama/layanan.tex:16',
  },
]

/** Lima operasi yang berada dalam satu transaksi PostgreSQL. */
export const operasiTransaksi: Array<Bersumber & { id: string; isi: string }> = [
  { id: 'kunci-saldo', isi: 'Mengunci saldo token pengguna.', sumber: 'bab3.tex:254' },
  { id: 'potong-token', isi: 'Memotong satu token.', sumber: 'bab3.tex:254' },
  { id: 'ledger', isi: 'Mencatat mutasinya pada ledger.', sumber: 'bab3.tex:254' },
  { id: 'simpan-asesmen', isi: 'Menyimpan asesmen beserta 200 jawabannya.', sumber: 'bab3.tex:254' },
  { id: 'outbox', isi: 'Menyisipkan satu baris outbox.', sumber: 'bab3.tex:254' },
]

export interface MekanismeKeandalan extends Bersumber {
  id: string
  judul: string
  isi: string
  kunci?: string
  sumberKode?: string
}

export const mekanismeKeandalan: MekanismeKeandalan[] = [
  {
    id: 'skip-locked',
    judul: 'Klaim baris outbox',
    isi: 'Poller mengklaim baris dengan FOR UPDATE SKIP LOCKED sehingga beberapa instans poller tidak memperebutkan baris yang sama.',
    kunci: 'FOR UPDATE SKIP LOCKED',
    sumber: 'bab3.tex:254',
  },
  {
    id: 'jendela-kegagalan',
    judul: 'Jendela kegagalan yang diakui',
    isi: 'Penandaan published dapat gagal setelah pesan masuk ke Redis, misalnya ketika poller berhenti di antara kedua operasi, sehingga pesan yang sama dapat diterbitkan lagi pada siklus berikutnya.',
    sumber: 'bab3.tex:264',
  },
  {
    id: 'at-least-once',
    judul: 'Semantik at-least-once',
    isi: 'Semantik pengiriman yang dijamin adalah at-least-once, bukan exactly-once. Konsumen wajib idempoten.',
    sumber: 'bab3.tex:264',
  },
  {
    id: 'job-claim',
    judul: 'Klaim pekerjaan di Redis',
    isi: 'Worker hanya boleh memproses pekerjaan bila berhasil menulis identitas pekerjaan dengan HSETNX; operasi itu hanya berhasil pada penulisan pertama. Ini klaim kepemilikan pada tingkat antrean, bukan kunci atas sumber daya bersama.',
    kunci: 'queue:analysis_jobs:claims',
    sumberKode: 'ecosystem-futureguide/shared/models/events.go:41',
    sumber: 'bab3.tex:266',
  },
  {
    id: 'heartbeat',
    judul: 'Heartbeat 20 detik',
    isi: 'Klaim yang sudah diambil dijaga melalui heartbeat setiap 20 detik.',
    kunci: 'worker:analysis:heartbeat:',
    sumberKode:
      'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:83',
    sumber: 'bab3.tex:268',
  },
  {
    id: 'reclaimer',
    judul: 'Reclaimer Lua',
    isi: 'Skrip Lua memeriksa klaim yang heartbeat-nya berhenti, lalu mengembalikan pekerjaan ke keadaan pending atau memindahkannya ke dead-letter queue bila batas percobaan terlampaui.',
    kunci: 'queue:analysis_jobs:dlq',
    sumberKode: 'ecosystem-futureguide/shared/models/events.go:40',
    sumber: 'bab3.tex:268',
  },
  {
    id: 'retry',
    judul: 'Percobaan ulang berjitter',
    isi: 'Generasi analisis yang gagal diulang paling banyak tiga kali dengan exponential backoff berjitter.',
    sumberKode:
      'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:81',
    sumber: 'bab3.tex:268',
  },
]

/** Lima status `analysis_runs`; kelimanya dapat dicapai dari interaksi pada S04. */
export const statusAnalysisRuns: Array<Bersumber & { id: string; nama: string; arti: string }> = [
  {
    id: 'running',
    nama: 'running',
    arti: 'Pekerjaan sedang diproses satu worker yang memegang klaim.',
    sumber: 'bab3.tex:268',
  },
  {
    id: 'completed',
    nama: 'completed',
    arti: 'Pekerjaan selesai; skenario R5 menghasilkan tepat satu baris berstatus ini.',
    sumber: 'bab4.tex:69',
  },
  {
    id: 'failed',
    nama: 'failed',
    arti: 'Percobaan gagal dan dicatat sebagai riwayat.',
    sumber: 'bab3.tex:268',
  },
  {
    id: 'reclaimed',
    nama: 'reclaimed',
    arti: 'Klaim basi diambil alih setelah heartbeat berhenti.',
    sumber: 'bab3.tex:268',
  },
  {
    id: 'dlq',
    nama: 'dlq',
    arti: 'Status terminal yang dapat diaudit setelah batas percobaan terlampaui; R4 menggeser tiga baris percobaan ke sini.',
    sumber: 'bab4.tex:69',
  },
]

export interface SkenarioKeandalan extends Bersumber {
  id: string
  judul: string
  lingkup: string
  hasil: string
}

export const skenarioKeandalan: SkenarioKeandalan[] = [
  {
    id: 'R1',
    judul: 'Kegagalan Redis saat publikasi outbox',
    lingkup: 'Komponen, Redis tiruan',
    hasil: 'Lulus; tidak ada pekerjaan hilang antara transaksi basis data dan antrean.',
    sumber: 'bab4.tex:67',
  },
  {
    id: 'R2',
    judul: 'Dua proses memperebutkan satu identitas pekerjaan',
    lingkup: 'Komponen, Redis tiruan',
    hasil: 'Lulus; pemrosesan serentak terkendali oleh klaim.',
    sumber: 'bab4.tex:67',
  },
  {
    id: 'R3',
    judul: 'Klaim basi milik pekerja yang mati',
    lingkup: 'Komponen, Redis tiruan',
    hasil: 'Lulus; pekerjaan yatim dipulihkan reclaimer.',
    sumber: 'bab4.tex:67',
  },
  {
    id: 'R4',
    judul: 'Kegagalan berulang sampai batas percobaan terlampaui',
    lingkup: 'Komponen + integrasi PostgreSQL `analysis_runs`',
    hasil: 'Lulus; tiga baris percobaan bergeser dari gagal menjadi dlq.',
    sumber: 'bab4.tex:69',
  },
  {
    id: 'R5',
    judul: 'Jalur penyelesaian normal beserta gerbang assessmentCompleted',
    lingkup: 'Komponen + integrasi PostgreSQL `analysis_runs`',
    hasil: 'Lulus; tepat satu baris berstatus completed dengan bukti kueri PostgreSQL langsung.',
    sumber: 'bab4.tex:69',
  },
]

export const angkaArsitektur: Angka[] = [
  {
    id: 'arsitektur.jumlah-layanan',
    adegan: 'S03',
    label: 'Layanan Go',
    nilai: 7,
    tampil: '7',
    satuan: 'layanan',
    status: 'terukur',
    catatan: 'Ditambah satu modul pustaka bersama `shared` yang bukan microservice.',
    sumber: 'bab3.tex:130',
  },
  {
    id: 'arsitektur.jumlah-tabel-inti',
    adegan: 'S03',
    label: 'Tabel inti pada skema',
    nilai: 20,
    tampil: '20',
    satuan: 'tabel',
    status: 'terukur',
    sumber: 'bab3.tex:148',
  },
  {
    id: 'arsitektur.berkas-migrasi-up-bab3',
    adegan: 'S03',
    label: 'Berkas migrasi *.up.sql (Bab 3)',
    nilai: 56,
    tampil: '56',
    satuan: 'berkas',
    status: 'terukur',
    catatan:
      'Bab 3 menulis 56 berkas up; pemeriksaan langsung pada Bab 4 menemukan 54 berkas up. Kedua angka ditampilkan apa adanya, tidak didamaikan.',
    sumber: 'bab3.tex:148',
  },
  {
    id: 'arsitektur.berkas-migrasi-up-bab4',
    adegan: 'S03',
    label: 'Berkas migrasi *.up.sql (pemeriksaan Bab 4)',
    nilai: 54,
    tampil: '54',
    satuan: 'berkas',
    status: 'terukur',
    catatan:
      '98 berkas total: 54 up + 44 down, menghasilkan 44 pasangan lengkap dan 10 berkas up tanpa pasangan turunnya. Bab 4 tidak mengklaim seluruh berkas telah dijalankan.',
    sumber: 'bab4.tex:46',
  },
  {
    id: 'keandalan.skenario-lulus',
    adegan: 'S04',
    label: 'Skenario keandalan lulus',
    nilai: 1,
    tampil: '5 dari 5',
    pembilang: 5,
    penyebut: 5,
    status: 'terukur',
    catatan:
      'R1–R3 pada tingkat komponen dengan Redis tiruan; R4–R5 menambah integrasi PostgreSQL. Bukan uji kekacauan multi-simpul.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:87',
  },
  {
    id: 'keandalan.pekerjaan-hilang',
    adegan: 'S04',
    label: 'Pekerjaan analisis hilang',
    nilai: 0,
    tampil: '0',
    satuan: 'pekerjaan',
    status: 'terukur',
    catatan: 'Nol pada simulasi throughput lokal dan pada skenario R yang diuji.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:88',
  },
  {
    id: 'keandalan.penyelesaian-ganda',
    adegan: 'S04',
    label: 'Penyelesaian ganda',
    nilai: 0,
    tampil: '0',
    satuan: 'pekerjaan',
    status: 'terukur',
    catatan: 'Dijaga klaim/ack + gerbang assessmentCompleted.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:89',
  },
  {
    id: 'keandalan.heartbeat-ttl',
    adegan: 'S04',
    label: 'Selang heartbeat',
    nilai: 20,
    tampil: '20 detik',
    satuan: 'detik',
    status: 'terukur',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:83',
  },
  {
    id: 'keandalan.maks-percobaan',
    adegan: 'S04',
    label: 'Batas percobaan ulang',
    nilai: 3,
    tampil: '3',
    satuan: 'percobaan',
    status: 'terukur',
    catatan: '`maxRetries` dan `maxJobAttempts` sama-sama bernilai 3.',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:81',
  },
  {
    id: 'keandalan.uji-klaim',
    adegan: 'S04',
    label: 'Uji klaim, konfirmasi, percobaan ulang, reklamasi',
    nilai: 21,
    tampil: '21',
    satuan: 'uji',
    status: 'terukur',
    catatan: 'Ditambah enam uji poller outbox pada assessment-service.',
    sumber: 'bab4.tex:69',
  },
]

export const batasArsitektur: Butir[] = [
  {
    id: 'satu-instans-db',
    judul: 'Bukan isolasi basis data per layanan',
    isi: 'Ketujuh layanan berbagi satu instans PostgreSQL dengan skema yang sama, sehingga penelitian tidak mengklaim isolasi basis data penuh per layanan.',
    sumber: 'bab3.tex:144',
  },
  {
    id: 'tanpa-uji-beban',
    judul: 'Skalabilitas tidak diuji',
    isi: 'Jumlah replika worker dapat ditambah, tetapi kemampuan itu tidak diuji sebagai properti skalabilitas karena uji beban tidak dilakukan.',
    sumber: 'bab3.tex:144',
  },
  {
    id: 'health-check-worker',
    judul: 'analysis-worker tanpa health check',
    isi: 'Enam layanan HTTP dan PostgreSQL berstatus healthy, sedangkan analysis-worker tidak mendefinisikan health check pada berkas Compose. Ketiadaan definisi itu bukan kegagalan pemeriksaan.',
    sumber: 'bab4.tex:36',
  },
  {
    id: 'lingkungan-lokal',
    judul: 'Seluruhnya lokal',
    isi: 'Seluruh ekosistem dijalankan pada satu komputer pengembang Linux melalui Docker Compose, sehingga setiap angka waktu mencerminkan lingkungan lokal.',
    sumber: 'bab3.tex:118',
  },
]
