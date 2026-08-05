/**
 * S11 — Hasil dan enam grafik Bab 4 (padanan `gambar/G1..G6`).
 *
 * Aturan yang mengikat adegan ini: metrik tak terdefinisi ditandai eksplisit dan
 * tidak pernah diisi nol; ablasi yang tidak menguntungkan RAG tetap tampil.
 */

import type { Angka, Bersumber, Butir } from './tipe'
import { kalibrasiAmbang, metrikPerKCadangan, metrikPerKVektor } from './rag'

export interface Grafik extends Bersumber {
  id: string
  padanan: string
  judul: string
  ringkas: string
  peringatan?: string
}

export const grafik: Grafik[] = [
  {
    id: 'G1',
    padanan: 'gambar/G1_ambang.pdf',
    judul: 'Komposisi domain lolos pada setiap pasangan ambang kandidat',
    ringkas:
      '27 pasangan kandidat pada lima profil. Pasangan 50/50/75 satu-satunya dengan nol profil terdominasi VIA-IS.',
    sumber: 'bab4.tex:104',
  },
  {
    id: 'G2',
    padanan: 'gambar/G2_relevansi.pdf',
    judul: 'Precision@k dan Strong-Relevance@k jalur vektor',
    ringkas:
      'Precision datar sempurna di 1,0000 sepanjang rentang; Strong-Relevance bergerak naik-turun tanpa arah tunggal.',
    peringatan: 'Precision yang datar berarti metrik itu tidak dapat dipakai memilih k.',
    sumber: 'bab4.tex:124',
  },
  {
    id: 'G3',
    padanan: 'gambar/G3_token.pdf',
    judul: 'Rerata referensi berdukungan kuat dan token konteks terhadap k',
    ringkas:
      'Rasio dapat turun ketika jumlah absolutnya naik karena penyebutnya ikut membesar; efek pengenceran ditampilkan bersama biaya tokennya.',
    sumber: 'bab4.tex:133',
  },
  {
    id: 'G4',
    padanan: 'gambar/G4_ablasi.pdf',
    judul: 'Dukungan klaim dan keterlacakan sitasi, dengan dan tanpa RAG',
    ringkas:
      'Penanda t.t. berarti tak terdefinisi karena penyebutnya nol. ΔGCR = 0 dengan p dua sisi 1,000.',
    peringatan:
      'Kenaikan GCR terjadi pada kedua lengan dan merupakan efek perbaikan prompt, bukan keunggulan RAG.',
    sumber: 'bab4.tex:172',
  },
  {
    id: 'G5',
    padanan: 'gambar/G5_throughput.pdf',
    judul: 'Throughput antrean sintetis dan speedup terhadap jumlah replika',
    ringkas:
      'Kedekatan dengan kelipatan bulat adalah konsekuensi langsung dari jeda tiruan yang seragam pada antrean dalam proses.',
    peringatan:
      'Model tiruan pada satu mesin lokal tanpa Redis, PostgreSQL, retrieval, atau heartbeat nyata. Bukan tolok ukur produksi.',
    sumber: 'bab4.tex:86',
  },
  {
    id: 'G6',
    padanan: 'gambar/G6_chat_pass.pdf',
    judul: 'Pass rate lima kriteria isi layanan obrolan',
    ringkas: 'Penyebut tiap kriteria mengecil menurut jumlah sel yang benar-benar terpicu.',
    peringatan: 'Penyebut yang kecil membuktikan keberadaan perilaku, bukan estimasi statistik yang stabil.',
    sumber: 'bab4.tex:205',
  },
]

/** G1 memakai data kalibrasi yang sama dengan S06; tidak diketik ulang. */
export const dataG1 = kalibrasiAmbang
/** G2 dan G3 memakai metrik per-k yang sama dengan S08. */
export const dataG2Vektor = metrikPerKVektor
export const dataG2Cadangan = metrikPerKCadangan

export interface BarisThroughput {
  replika: number
  jobPerMenit: number
  speedup: number | null
  p95Detik: number
}

export const throughput: BarisThroughput[] = [
  { replika: 1, jobPerMenit: 11.999656, speedup: null, p95Detik: 115.002849 },
  { replika: 2, jobPerMenit: 23.999381, speedup: 2.000006, p95Detik: 60.001387 },
  { replika: 4, jobPerMenit: 47.998357, speedup: 3.999978, p95Detik: 30.000957 },
]

export const sumberThroughput = 'bab4-results/BAB4_ANGKA_FINAL.md:93'

export type StatusMetrik = 'terukur' | 'tak-terdefinisi'

export interface NilaiKondisi {
  nilai: number | null
  tampil: string
  pembilang: number
  penyebut: number
  status: StatusMetrik
}

export interface MetrikAblasi extends Bersumber {
  id: string
  singkatan: string
  nama: string
  arti: string
  rag: NilaiKondisi
  tanpaRag: NilaiKondisi
  /** Angka putaran sebelumnya (F8B), dilaporkan berdampingan. */
  pembandingF8b: string
}

/**
 * Delapan metrik ablasi klaim. Angka F10 (rerun 31 Juli 2026) adalah angka
 * naskah; angka F8B tetap dilaporkan berdampingan sebagai pembanding historis.
 */
export const metrikAblasi: MetrikAblasi[] = [
  {
    id: 'gcr',
    singkatan: 'GCR',
    nama: 'Grounded Claim Rate',
    arti: 'Proporsi klaim berlabel dukungan penuh menurut rubrik.',
    rag: { nilai: 0.8667, tampil: '0,8667', pembilang: 117, penyebut: 135, status: 'terukur' },
    tanpaRag: { nilai: 0.8667, tampil: '0,8667', pembilang: 117, penyebut: 135, status: 'terukur' },
    pembandingF8b: 'F8B: 0,6444 (87/135) pada kedua kondisi',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:65',
  },
  {
    id: 'ucr',
    singkatan: 'UCR',
    nama: 'Unsupported Claim Rate',
    arti: 'Proporsi klaim bernilai nol, yaitu tanpa dasar atau bertentangan dengan masukan.',
    rag: { nilai: 0, tampil: '0,0000', pembilang: 0, penyebut: 135, status: 'terukur' },
    tanpaRag: { nilai: 0, tampil: '0,0000', pembilang: 0, penyebut: 135, status: 'terukur' },
    pembandingF8b: 'F8B: sama',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:66',
  },
  {
    id: 'cpc',
    singkatan: 'CPC',
    nama: 'Citation Presence Coverage',
    arti: 'Proporsi klaim yang membawa sekurang-kurangnya satu identitas referensi.',
    rag: { nilai: 1, tampil: '1,0000', pembilang: 135, penyebut: 135, status: 'terukur' },
    tanpaRag: { nilai: 0, tampil: '0,0000', pembilang: 0, penyebut: 135, status: 'terukur' },
    pembandingF8b: 'F8B: sama',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:67',
  },
  {
    id: 'cvr',
    singkatan: 'CVR',
    nama: 'Citation Validity Rate',
    arti: 'Proporsi klaim tersitasi yang seluruh identitasnya ter-resolve ke himpunan referensi yang diinjeksikan.',
    rag: { nilai: 1, tampil: '1,0000', pembilang: 135, penyebut: 135, status: 'terukur' },
    tanpaRag: { nilai: null, tampil: 'tak terdefinisi', pembilang: 0, penyebut: 0, status: 'tak-terdefinisi' },
    pembandingF8b: 'F8B: sama',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:68',
  },
  {
    id: 'csc',
    singkatan: 'CSC',
    nama: 'Citation Support Coverage',
    arti: 'Proporsi klaim yang membawa identitas valid sekaligus berlabel dukungan penuh.',
    rag: { nilai: 0.8667, tampil: '0,8667', pembilang: 117, penyebut: 135, status: 'terukur' },
    tanpaRag: { nilai: 0, tampil: '0,0000', pembilang: 0, penyebut: 135, status: 'terukur' },
    pembandingF8b: 'F8B: 0,6444 (87/135) pada kondisi RAG',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:69',
  },
  {
    id: 'scc',
    singkatan: 'SCC',
    nama: 'Schema Citation Compliance',
    arti: 'Proporsi klaim yang membawa identitas pada keluaran yang diterima gerbang validasi. Uji sanitas, bukan temuan.',
    rag: { nilai: 1, tampil: '1,0000', pembilang: 135, penyebut: 135, status: 'terukur' },
    tanpaRag: { nilai: 0, tampil: '0,0000', pembilang: 0, penyebut: 135, status: 'terukur' },
    pembandingF8b: 'F8B: sama',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:70',
  },
  {
    id: 'flr',
    singkatan: 'FLR',
    nama: 'Fabricated Label Rate',
    arti: 'Proporsi label yang tidak ter-resolve, dihitung pada percobaan pertama sebelum pembuatan ulang.',
    rag: { nilai: 0, tampil: '0,0000', pembilang: 0, penyebut: 197, status: 'terukur' },
    tanpaRag: { nilai: null, tampil: 'tak terdefinisi', pembilang: 0, penyebut: 0, status: 'tak-terdefinisi' },
    pembandingF8b: 'F8B: 0,0000 (0/201) pada kondisi RAG',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:71',
  },
  {
    id: 'rrr',
    singkatan: 'RRR',
    nama: 'Rejection Recovery Rate',
    arti: 'Proporsi pekerjaan yang tetap selesai setelah sekurang-kurangnya satu penolakan.',
    rag: { nilai: null, tampil: 'tak terdefinisi', pembilang: 0, penyebut: 0, status: 'tak-terdefinisi' },
    tanpaRag: { nilai: null, tampil: 'tak terdefinisi', pembilang: 0, penyebut: 0, status: 'tak-terdefinisi' },
    pembandingF8b:
      'F8B: 1,0000 (1/1) pada kondisi RAG — satu keluaran ditolak karena label sitasi bocor ke prosa klaim, lalu selesai pada percobaan berikutnya.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:72',
  },
]

export const catatanAblasi: Butir[] = [
  {
    id: 'delta-gcr',
    judul: 'Injeksi referensi tidak menaikkan GCR',
    isi: 'Uji tanda berpasangan atas 15 sel: tiga sel unggul pada kondisi RAG, dua sel unggul tanpa RAG, sepuluh sel seri, jumlah selisih tepat nol, p dua sisi 1,000. Injeksi blok referensi tidak menaikkan proporsi klaim berdukungan penuh pada rancangan ini.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:74',
  },
  {
    id: 'kenaikan-prompt',
    judul: 'Kenaikan berasal dari prompt, bukan dari RAG',
    isi: 'Aturan disiplin klaim ditaruh pada blok prompt yang dibaca kedua kondisi, sehingga kenaikan 30 klaim terjadi pada kedua lengan dengan besar yang sama persis.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:58',
  },
  {
    id: 'nol-struktural',
    judul: 'Nol tanpa RAG bersifat struktural',
    isi: 'Pada kondisi tanpa RAG himpunan referensi kosong sehingga skema melarang sitasi; CPC dan CSC bernilai nol menurut definisi metriknya, bukan karena kegagalan sistem.',
    sumber: 'bab4.tex:181',
  },
  {
    id: 'ucr-nol',
    judul: 'UCR nol bukan berarti seluruh klaim terdukung penuh',
    isi: 'Sisa 18 klaim per kondisi berlabel dukungan sebagian, terdiri atas 15 klaim ringkasan tanda tangan profil yang selalu memperoleh label itu karena penetapan arketipe adalah inferensi di luar yang diukur ketiga instrumen, ditambah tiga klaim lain.',
    sumber: 'bab4.tex:164',
  },
  {
    id: 'rubrik-identik',
    judul: 'Rubrik tidak disunting',
    isi: 'Berkas rubrik yang menilai rerun ini byte-identik dengan rubrik putaran sebelumnya (SHA-256 6dfc58d1…e749a6) dan tidak disunting sebelum maupun sesudah melihat hasil.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:77',
  },
  {
    id: 'batas-perbandingan',
    judul: 'Perbandingan dengan F8B hanya pada tingkat agregat',
    isi: 'Angka F10 berasal dari teks prompt yang berbeda dengan F8B, sehingga perbandingannya hanya sahih pada tingkat metrik agregat, bukan baris per baris.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:79',
  },
]

export interface KriteriaObrolan extends Bersumber {
  id: string
  nama: string
  nilai: number | null
  tampil: string
  pembilang: number
  penyebut: number
  jumlahNa: number
  catatan?: string
}

/** Lima kriteria biner isi obrolan; sel yang tidak terpicu keluar dari penyebut. */
export const kriteriaObrolan: KriteriaObrolan[] = [
  {
    id: 'konsisten-skor',
    nama: 'Konsisten dengan skor terpersist',
    nilai: 0.8,
    tampil: '0,8000',
    pembilang: 4,
    penyebut: 5,
    jumlahNa: 2,
    catatan:
      'Satu kegagalan berasal dari peringkat kekuatan yang dinyatakan paling menonjol padahal asesmen uji berprofil datar; kegagalan pada penalaran jawaban, bukan pada pembacaan skor tersimpan.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:112',
  },
  {
    id: 'tidak-menciptakan-skor',
    nama: 'Tidak menciptakan skor atau domain baru',
    nilai: 1,
    tampil: '1,0000',
    pembilang: 4,
    penyebut: 4,
    jumlahNa: 3,
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:113',
  },
  {
    id: 'referensi-klaim-akademik',
    nama: 'Memakai referensi saat membuat klaim akademik',
    nilai: 1,
    tampil: '1,0000',
    pembilang: 3,
    penyebut: 3,
    jumlahNa: 4,
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:114',
  },
  {
    id: 'pembatasan-risiko',
    nama: 'Memberi pembatasan pada pertanyaan berisiko',
    nilai: 1,
    tampil: '1,0000',
    pembilang: 3,
    penyebut: 3,
    jumlahNa: 4,
    catatan: 'Mengarahkan pengguna kepada orang tua, guru, atau konselor.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:115',
  },
  {
    id: 'are',
    nama: 'Answer Reference Exposure',
    nilai: 1,
    tampil: '1,0000',
    pembilang: 7,
    penyebut: 7,
    jumlahNa: 0,
    catatan:
      'Setiap jawaban memaparkan sekurang-kurangnya satu identitas referensi pada respons API sekaligus pada aliran SSE. Bila tidak ada jawaban terbit, nilainya tak terdefinisi, bukan nol.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:111',
  },
]

export const angkaHasil: Angka[] = [
  {
    id: 'hasil.precision-k8',
    adegan: 'S11',
    label: 'Precision@8 jalur vektor',
    nilai: 1,
    tampil: '1,0000',
    status: 'terukur',
    catatan: 'Rerata lima profil; tiap profil 8 dari 8. Jenuh sejak k = 4.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:33',
  },
  {
    id: 'hasil.strong-k8',
    adegan: 'S11',
    label: 'Strong-Relevance@8 jalur vektor',
    nilai: 0.5,
    tampil: '0,5000',
    status: 'terukur',
    catatan: 'Rerata lima profil; mean 4,0 dari 8 referensi berskor 2.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:34',
  },
  {
    id: 'hasil.precision-cadangan-k8',
    adegan: 'S11',
    label: 'Precision@8 jalur cadangan',
    nilai: 0.9,
    tampil: '0,9000',
    status: 'terukur',
    catatan:
      'Tidak pernah mencapai nilai penuh pada rentang k mana pun; inilah bukti kuantitatif bahwa jalur cadangan menjaga ketersediaan dengan mutu relevansi yang lebih rendah.',
    sumber: 'bab4.tex:142',
  },
  {
    id: 'hasil.strong-cadangan-k8',
    adegan: 'S11',
    label: 'Strong-Relevance@8 jalur cadangan',
    nilai: 0.575,
    tampil: '0,5750',
    status: 'terukur',
    catatan: 'Perbandingan hanya sah pada tingkat metrik rubrik; skor mentah kedua jalur tidak pernah disandingkan pada satu skala.',
    sumber: 'bab4.tex:142',
  },
  {
    id: 'hasil.baris-penilaian',
    adegan: 'S11',
    label: 'Baris penilaian relevansi',
    nilai: 400,
    tampil: '400',
    satuan: 'baris',
    status: 'terukur',
    catatan: 'Distribusi: 29 baris bernilai 0, 163 baris bernilai 1, 208 baris bernilai 2.',
    sumber: 'bab4.tex:116',
  },
  {
    id: 'hasil.schema-compliance',
    adegan: 'S11',
    label: 'Kepatuhan responseSchema',
    nilai: 1,
    tampil: '1,0 (5 dari 5)',
    pembilang: 5,
    penyebut: 5,
    status: 'terukur',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:82',
  },
  {
    id: 'hasil.pmai-valid',
    adegan: 'S11',
    label: 'Tepat satu arketipe PMAI sah',
    nilai: 1,
    tampil: '1,0 (5 dari 5)',
    pembilang: 5,
    penyebut: 5,
    status: 'terukur',
    catatan: 'Mengukur bentuk, bukan isi.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:83',
  },
  {
    id: 'hasil.identitas-lolos-validasi',
    adegan: 'S11',
    label: 'Identitas lolos validasi tiga lapis',
    nilai: 1,
    tampil: '197 dari 197',
    pembilang: 197,
    penyebut: 197,
    status: 'terukur',
    catatan: 'Tidak ada identitas yang gugur di antara lapis: pengenal sah, ada di korpus, termasuk himpunan hasil retrieval.',
    sumber: 'bab4.tex:168',
  },
  {
    id: 'hasil.tp-1-replika',
    adegan: 'S11',
    label: 'Throughput 1 replika',
    nilai: 11.999656,
    tampil: '11,999656',
    satuan: 'pekerjaan per menit',
    status: 'terukur',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:94',
  },
  {
    id: 'hasil.tp-2-replika',
    adegan: 'S11',
    label: 'Throughput 2 replika',
    nilai: 23.999381,
    tampil: '23,999381',
    satuan: 'pekerjaan per menit',
    status: 'terukur',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:95',
  },
  {
    id: 'hasil.tp-4-replika',
    adegan: 'S11',
    label: 'Throughput 4 replika',
    nilai: 47.998357,
    tampil: '47,998357',
    satuan: 'pekerjaan per menit',
    status: 'terukur',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:96',
  },
  {
    id: 'hasil.penyelesaian-terukur',
    adegan: 'S11',
    label: 'Penyelesaian terukur pada simulasi',
    nilai: 216,
    tampil: '216',
    satuan: 'penyelesaian',
    status: 'terukur',
    catatan: 'Seluruhnya berhasil tanpa pekerjaan hilang maupun penyelesaian ganda pada simulasi.',
    sumber: 'bab4.tex:84',
  },
  {
    id: 'hasil.cache-hit-ratio',
    adegan: 'S11',
    label: 'Cache hit ratio',
    nilai: null,
    tampil: 'n/a',
    status: 'tidak-diukur',
    catatan: 'Provider cache tidak tersedia pada gate live; TestLiveContextCacheOnOff gagal dengan pesan context cache unavailable.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:102',
  },
  {
    id: 'hasil.token-saving-ratio',
    adegan: 'S11',
    label: 'Token saving ratio',
    nilai: null,
    tampil: 'n/a',
    status: 'tidak-diukur',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:103',
  },
  {
    id: 'hasil.latency-change-ratio',
    adegan: 'S11',
    label: 'Latency change ratio',
    nilai: null,
    tampil: 'n/a',
    status: 'tidak-diukur',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:104',
  },
  {
    id: 'hasil.uji-fitur',
    adegan: 'S11',
    label: 'Uji fitur keterlacakan',
    nilai: 1,
    tampil: '43 dari 43',
    pembilang: 43,
    penyebut: 43,
    status: 'terukur',
    catatan: '24 uji analysis-worker, 6 assessment-service, 13 chat-service. Tanpa kegagalan maupun pelewatan.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:52',
  },
  {
    id: 'hasil.durasi-e2e',
    adegan: 'S11',
    label: 'Durasi uji end-to-end',
    nilai: 73.868,
    tampil: '73,868 detik',
    satuan: 'detik',
    status: 'terukur',
    sumber: 'bab4.tex:223',
  },
]

export const angkaAblasiUntukAudit: Angka[] = metrikAblasi.flatMap((metrik) => [
  {
    id: `ablasi.${metrik.id}-rag`,
    adegan: 'S11' as const,
    label: `${metrik.singkatan} dengan RAG`,
    nilai: metrik.rag.nilai,
    tampil: metrik.rag.tampil,
    pembilang: metrik.rag.pembilang,
    penyebut: metrik.rag.penyebut,
    status: metrik.rag.status === 'terukur' ? ('terukur' as const) : ('tak-terdefinisi' as const),
    catatan: metrik.pembandingF8b,
    sumber: metrik.sumber,
  },
  {
    id: `ablasi.${metrik.id}-tanpa-rag`,
    adegan: 'S11' as const,
    label: `${metrik.singkatan} tanpa RAG`,
    nilai: metrik.tanpaRag.nilai,
    tampil: metrik.tanpaRag.tampil,
    pembilang: metrik.tanpaRag.pembilang,
    penyebut: metrik.tanpaRag.penyebut,
    status:
      metrik.tanpaRag.status === 'terukur' ? ('terukur' as const) : ('tak-terdefinisi' as const),
    sumber: metrik.sumber,
  },
])

export const angkaObrolanUntukAudit: Angka[] = kriteriaObrolan.map((kriteria) => ({
  id: `obrolan.kriteria-${kriteria.id}`,
  adegan: 'S11' as const,
  label: kriteria.nama,
  nilai: kriteria.nilai,
  tampil: kriteria.tampil,
  pembilang: kriteria.pembilang,
  penyebut: kriteria.penyebut,
  status: 'terukur' as const,
  catatan: kriteria.catatan ?? `${kriteria.jumlahNa} sel berstatus n/a dan berada di luar penyebut.`,
  sumber: kriteria.sumber,
}))

export const lingkunganEvaluasi: Array<Bersumber & { id: string; nama: string; nilai: string }> = [
  {
    id: 'git-hash',
    nama: 'Hash kode yang dibekukan',
    nilai: 'af371bd9cda3aed49806b715d769a301af2e2499',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:13',
  },
  {
    id: 'model-sintesis',
    nama: 'Model sintesis',
    nilai: 'gemini-3.1-flash-lite',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:14',
  },
  {
    id: 'model-embedding',
    nama: 'Model embedding',
    nilai: 'gemini-embedding-001',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:15',
  },
  {
    id: 'penyedia-obrolan',
    nama: 'Penyedia model obrolan',
    nilai: 'OpenRouter',
    sumber: 'bab4.tex:15',
  },
  {
    id: 'temperatur',
    nama: 'Temperatur sintesis',
    nilai: '0,0 dengan satu kandidat keluaran per permintaan',
    sumber: 'bab4.tex:19',
  },
  {
    id: 'pgvector',
    nama: 'Status pgvector',
    nilai: 'aktif; image pgvector/pgvector:pg17, Retriever.UseVector() bernilai benar',
    sumber: 'bab4.tex:17',
  },
]
