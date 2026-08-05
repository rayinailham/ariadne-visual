/**
 * S10 — Layanan obrolan berbasis RAG dan SSE.
 *
 * Obrolan memakai ulang vektor dan metadata yang sama dengan analisis. Tidak ada
 * pencarian vektor baru ketika pengguna mengirim pesan (`bab3.tex:281`).
 */

import type { Angka, Bersumber, Butir } from './tipe'

export interface PeristiwaSse extends Bersumber {
  id: string
  nama: string
  urutan: number
  fase: 'pembukaan' | 'per-jawaban' | 'penutup' | 'galat'
  isi: string
}

/** Urutan peristiwa satu koneksi SSE. */
export const peristiwaSse: PeristiwaSse[] = [
  {
    id: 'session_info',
    nama: 'session_info',
    urutan: 1,
    fase: 'pembukaan',
    isi: 'Identitas sesi obrolan dikirim saat aliran terbentuk.',
    sumber: 'ecosystem-futureguide/shared/models/chat.go:56',
  },
  {
    id: 'history',
    nama: 'history',
    urutan: 2,
    fase: 'pembukaan',
    isi: 'Riwayat percakapan yang sudah tersimpan.',
    sumber: 'ecosystem-futureguide/shared/models/chat.go:55',
  },
  {
    id: 'streaming_start',
    nama: 'streaming_start',
    urutan: 3,
    fase: 'per-jawaban',
    isi: 'Penanda bahwa penyusunan satu jawaban dimulai.',
    sumber: 'ecosystem-futureguide/shared/models/chat.go:57',
  },
  {
    id: 'message_references',
    nama: 'message_references',
    urutan: 4,
    fase: 'per-jawaban',
    isi: 'Identitas dokumen, judul, sumber, jenis asesmen, dan domain untuk seluruh referensi yang diinjeksikan. Dipancarkan sebelum potongan teks pertama, sehingga konsumen tahu himpunan sumber sebelum menerima satu kata pun isinya.',
    sumber: 'ecosystem-futureguide/shared/models/chat.go:53',
  },
  {
    id: 'chunk',
    nama: 'chunk',
    urutan: 5,
    fase: 'per-jawaban',
    isi: 'Rangkaian potongan teks jawaban.',
    sumber: 'ecosystem-futureguide/shared/models/chat.go:51',
  },
  {
    id: 'message_complete',
    nama: 'message_complete',
    urutan: 6,
    fase: 'penutup',
    isi: 'Penutup jawaban yang mengulang identitas referensi dengan isi yang sama, sehingga klien yang terlambat menyambung tetap memperolehnya.',
    sumber: 'ecosystem-futureguide/shared/models/chat.go:52',
  },
  {
    id: 'error',
    nama: 'error',
    urutan: 7,
    fase: 'galat',
    isi: 'Menggantikan peristiwa penutup ketika pemrosesan gagal.',
    sumber: 'ecosystem-futureguide/shared/models/chat.go:54',
  },
]

export const catatanPeristiwa: Butir[] = [
  {
    id: 'referensi-kosong',
    judul: 'Peristiwa referensi dilewati saat himpunan kosong',
    isi: 'Peristiwa identitas referensi tidak dikirim ketika himpunan referensi kosong, dan ketiadaannya bukan galat protokol.',
    sumber: 'bab3.tex:287',
  },
  {
    id: 'dua-kontrak',
    judul: 'Identitas dipaparkan pada dua kontrak',
    isi: 'Identitas yang sama muncul pada respons REST riwayat obrolan dan pada aliran SSE; muatan kedua kanal konsisten untuk seluruh jawaban yang terbit.',
    sumber: 'bab4.tex:212',
  },
  {
    id: 'pesan-pengguna',
    judul: 'Pesan pengguna tidak pernah membawa referensi',
    isi: 'Hanya pesan asisten yang membawa daftar referensi.',
    sumber: 'bab3.tex:239',
  },
]

export interface TitikInjeksi extends Bersumber {
  id: string
  nama: string
  cap: number
  alasan: string
}

/** Tiga titik injeksi RAG dengan anggaran token berbeda. */
export const titikInjeksi: TitikInjeksi[] = [
  {
    id: 'analisis',
    nama: 'Analisis Gemini',
    cap: 8,
    alasan: 'Batas hasil kalibrasi k pada Bab 4.',
    sumber: 'CONTEXT.md:80',
  },
  {
    id: 'obrolan',
    nama: 'Layanan obrolan',
    cap: 6,
    alasan: 'Enam referensi dari enam domain skor tertinggi pengguna.',
    sumber: 'ecosystem-futureguide/chat-service/internal/repository/postgres.go:366',
  },
  {
    id: 'pdf',
    nama: 'Laporan PDF',
    cap: 10,
    alasan: 'Anggaran token laporan lebih longgar daripada dua titik lainnya.',
    sumber: 'ecosystem-futureguide/assessment-service/internal/service/assessment_service.go:172',
  },
]

export const konteksPromptObrolan: Array<Bersumber & { id: string; isi: string }> = [
  { id: 'skor', isi: 'Ringkasan skor domain yang sudah dipersist.', sumber: 'bab3.tex:281' },
  { id: 'analisis', isi: 'Ringkasan analisis yang sudah dipersist.', sumber: 'bab3.tex:281' },
  {
    id: 'referensi',
    isi: 'Paling banyak enam referensi akademik dari enam domain skor tertinggi pengguna.',
    sumber: 'bab3.tex:281',
  },
]

export interface BatasanObrolan extends Bersumber {
  id: string
  judul: string
  nilai: string
}

export const batasanObrolan: BatasanObrolan[] = [
  {
    id: 'kepemilikan',
    judul: 'Kepemilikan dan status asesmen',
    nilai: 'Asesmen harus berstatus selesai dan dimiliki pengguna yang meminta.',
    sumber: 'bab3.tex:283',
  },
  {
    id: 'satu-sesi',
    judul: 'Satu sesi per pasangan',
    nilai: 'Hanya ada satu sesi per pasangan pengguna dan asesmen.',
    sumber: 'bab3.tex:283',
  },
  {
    id: 'ukuran-badan',
    judul: 'Ukuran badan permintaan',
    nilai: '8 KB',
    sumber: 'bab3.tex:283',
  },
  {
    id: 'panjang-pesan',
    judul: 'Panjang isi pesan',
    nilai: '4096 karakter',
    sumber: 'bab3.tex:283',
  },
  {
    id: 'jeda',
    judul: 'Jeda minimum antarpesan',
    nilai: '2 detik',
    sumber: 'bab3.tex:283',
  },
  {
    id: 'batas-waktu-sse',
    judul: 'Rute SSE dikecualikan dari batas waktu tulis',
    nilai: 'Koneksi SSE berumur panjang, tetapi aliran dihentikan ketika konteks permintaan dibatalkan.',
    sumber: 'bab3.tex:283',
  },
]

export const angkaObrolan: Angka[] = [
  {
    id: 'obrolan.cap-referensi',
    adegan: 'S10',
    label: 'Maksimum referensi obrolan',
    nilai: 6,
    tampil: '6',
    satuan: 'referensi',
    status: 'terukur',
    catatan: 'Berbeda dari 8 pada analisis karena anggaran token, bukan karena mekanismenya berlainan.',
    sumber: 'ecosystem-futureguide/chat-service/internal/repository/postgres.go:366',
  },
  {
    id: 'obrolan.pertanyaan-dikirim',
    adegan: 'S10',
    label: 'Pertanyaan terkendali dikirim',
    nilai: 12,
    tampil: '12',
    satuan: 'pertanyaan',
    status: 'terukur',
    catatan: 'Tersebar merata pada empat kategori: penjelasan skor, hubungan lintas-instrumen, eksplorasi jurusan dan karier, serta pertanyaan berisiko tinggi.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:108',
  },
  {
    id: 'obrolan.jawaban-terbit',
    adegan: 'S10',
    label: 'Jawaban terbit',
    nilai: 7,
    tampil: '7',
    satuan: 'jawaban',
    status: 'terukur',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:109',
  },
  {
    id: 'obrolan.pertanyaan-gagal',
    adegan: 'S10',
    label: 'Pertanyaan gagal',
    nilai: 5,
    tampil: '5 dari 12',
    pembilang: 5,
    penyebut: 12,
    status: 'terukur',
    catatan:
      'Gagal pada batas waktu hulu 120 detik. Kelimanya berada di luar penyebut ARE dan empat kriteria, dilaporkan apa adanya dan tidak dinilai nol.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:110',
  },
  {
    id: 'obrolan.jumlah-peristiwa',
    adegan: 'S10',
    label: 'Jenis peristiwa pada kontrak aliran',
    nilai: 6,
    tampil: '6',
    satuan: 'jenis peristiwa',
    status: 'terukur',
    catatan:
      'session_info, history, streaming_start, message_references, chunk, message_complete. Peristiwa error menggantikan penutup saat gagal.',
    sumber: 'bab4.tex:216',
  },
]

export const batasObrolan: Butir[] = [
  {
    id: 'atribusi-per-jawaban',
    judul: 'Atribusi per jawaban, bukan per klaim',
    isi: 'Identitas yang dipaparkan menyatakan himpunan sumber yang diinjeksikan ke prompt sistem, tanpa menyatakan pernyataan mana di dalam jawaban yang bersandar pada dokumen mana.',
    sumber: 'bab4.tex:194',
  },
  {
    id: 'bukan-retrieval-baru',
    judul: 'Bukan mekanisme retrieval baru',
    isi: 'Obrolan memakai ulang vektor dan metadata yang sama dengan analisis; tidak ada pencarian vektor tambahan ketika pengguna mengirim pesan.',
    sumber: 'bab3.tex:281',
  },
  {
    id: 'penyedia-berbeda',
    judul: 'Penyedia model berbeda',
    isi: 'Obrolan memakai OpenRouter karena kebutuhannya streaming token, berbeda dari Gemini yang dipakai analisis untuk keluaran ber-skema.',
    sumber: 'bab3.tex:279',
  },
  {
    id: 'tanpa-gerbang-setara',
    judul: 'Tanpa gerbang validasi setara analisis',
    isi: 'Jawaban obrolan berbentuk prosa bebas tanpa skema keluaran, sehingga atribusi deterministik terhadap himpunan yang tercatat lebih dapat diverifikasi daripada meminta sitasi ulang dari model.',
    sumber: 'bab3.tex:287',
  },
  {
    id: 'temuan-kualitatif',
    judul: 'Dua temuan kualitatif',
    isi: 'Satu jawaban degenerate karena hanya memuat penanda status penyaring keamanan tanpa substansi, dan satu penolakan atas permintaan manipulatif dikembalikan dalam bahasa Inggris pada sesi berbahasa Indonesia.',
    sumber: 'bab4.tex:218',
  },
  {
    id: 'profil-datar',
    judul: 'Asesmen uji berprofil datar',
    isi: 'Asesmen uji yang dipakai berprofil datar sehingga tidak mewakili profil pengguna pada umumnya; temuan kualitatif dibaca sebagai catatan mutu pada satu profil uji.',
    sumber: 'bab4.tex:218',
  },
  {
    id: 'probe-jeda',
    judul: 'Probe jeda antarpesan tidak konklusif',
    isi: 'Jeda antarpesan lulus pada uji unit, sedangkan probe langsungnya tidak konklusif karena permintaan kedua menunggu permintaan pertama selesai.',
    sumber: 'bab4.tex:216',
  },
]
