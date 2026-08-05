/**
 * S12 — Apa yang dibuktikan dan apa yang tidak dibuktikan.
 *
 * Bagian ini tidak boleh dipoles. Metrik tak terdefinisi, ablasi yang tidak
 * menguntungkan RAG, dan pertanyaan obrolan yang gagal tetap tampil.
 */

import type { Bersumber, Butir } from './tipe'

export interface Klaim extends Bersumber {
  id: string
  judul: string
  isi: string
  buktiDi: string
}

/** Yang dibuktikan: mekanisme teknis pada lingkup uji. */
export const yangDibuktikan: Klaim[] = [
  {
    id: 'integrasi-layanan',
    judul: 'Tujuh layanan berjalan terintegrasi',
    isi: 'Ketujuh layanan berjalan sebagai proses terpisah yang saling terhubung sesuai arah ketergantungan rancangan, dan alur intinya lulus uji end-to-end pada stack Docker Compose lokal.',
    buktiDi: 'Subbab 4.2 dan 4.11',
    sumber: 'bab4.tex:241',
  },
  {
    id: 'keandalan-antrean',
    judul: 'Tidak ada pekerjaan hilang atau selesai ganda pada lingkup uji',
    isi: 'Kelima skenario kegagalan lulus pada lingkup komponen dan integrasi basis data lokal, dengan semantik at-least-once yang dikendalikan klaim dan konsumen idempoten.',
    buktiDi: 'Subbab 4.3',
    sumber: 'bab4.tex:241',
  },
  {
    id: 'translasi-kueri',
    judul: 'Profil numerik dapat diterjemahkan menjadi kueri bertema',
    isi: 'Rantai translasi menghasilkan lima kueri bertema yang tidak kosong pada seluruh 27 pasangan ambang kandidat.',
    buktiDi: 'Subbab 4.5',
    sumber: 'bab4.tex:111',
  },
  {
    id: 'relevansi-retrieval',
    judul: 'Retrieval vektor relevan menurut rubrik',
    isi: 'Precision@k jalur vektor bernilai penuh pada seluruh rentang k, dan batas referensi dipilih pada titik ketika penambahan dokumen berhenti menambah dukungan kuat secara sepadan.',
    buktiDi: 'Subbab 4.6',
    sumber: 'bab4.tex:250',
  },
  {
    id: 'keterlacakan-identitas',
    judul: 'Keterlacakan identitas dapat diperiksa secara terprogram',
    isi: 'Setiap klaim yang dinilai membawa identitas referensi yang lolos validasi pada saat sintesis, dan identitas itu diproduksi skema keluaran, bukan dilekatkan pada tahap pengukuran.',
    buktiDi: 'Subbab 4.8 dan 4.9',
    sumber: 'bab4.tex:252',
  },
  {
    id: 'ketersediaan-cadangan',
    judul: 'Pipeline tetap berjalan tanpa pencarian vektor',
    isi: 'Jalur cadangan deterministik menjaga pipeline tetap menghasilkan keluaran ber-referensi, dengan mutu relevansi yang lebih rendah dan tidak diklaim setara.',
    buktiDi: 'Subbab 4.6',
    sumber: 'bab4.tex:142',
  },
  {
    id: 'kontrak-obrolan',
    judul: 'Kontrak aliran obrolan dan penegakan batasnya',
    isi: 'Kontrak aliran terpenuhi dan seluruh penegakan batas berperilaku sesuai rancangan, dengan identitas referensi dipaparkan pada respons API sekaligus aliran SSE.',
    buktiDi: 'Subbab 4.10',
    sumber: 'bab4.tex:259',
  },
]

/** Yang tidak dibuktikan: seluruhnya di luar lingkup, bukan hasil yang buruk. */
export const yangTidakDibuktikan: Klaim[] = [
  {
    id: 'validitas-psikometrik',
    judul: 'Validitas psikometrik butir',
    isi: 'Tidak ada uji validitas isi, koefisien alfa Cronbach, analisis faktor, maupun norma populasi Indonesia.',
    buktiDi: 'Tidak ada; dinyatakan di luar lingkup',
    sumber: 'bab4.tex:284',
  },
  {
    id: 'ketepatan-pemetaan',
    judul: 'Ketepatan pemetaan bakat sebagai pembacaan psikologis',
    isi: 'Bukti pada Bab 4 seluruhnya teknis. Tidak ada pengujian yang menyatakan bahwa penafsiran sistem tepat sebagai pembacaan psikologis atas seorang siswa.',
    buktiDi: 'Tidak ada; dinyatakan di luar lingkup',
    sumber: 'bab4.tex:284',
  },
  {
    id: 'efektivitas-rekomendasi',
    judul: 'Efektivitas rekomendasi bagi siswa',
    isi: 'Tidak ada pengukuran dampak rekomendasi terhadap keputusan atau hasil pendidikan siswa.',
    buktiDi: 'Tidak ada; dinyatakan di luar lingkup',
    sumber: 'bab4.tex:284',
  },
  {
    id: 'keunggulan-rag-isi',
    judul: 'Keunggulan RAG atas keterdukungan isi klaim',
    isi: 'ΔGCR = 0 dengan p dua sisi 1,000. Injeksi blok referensi tidak menaikkan proporsi klaim berdukungan penuh pada rancangan ini.',
    buktiDi: 'Subbab 4.9; dilaporkan apa adanya',
    sumber: 'bab4.tex:164',
  },
  {
    id: 'skalabilitas',
    judul: 'Skalabilitas dan kinerja produksi',
    isi: 'Throughput memakai model tiruan pada satu mesin lokal tanpa infrastruktur nyata, sehingga bukan tolok ukur produksi dan bukan bukti penskalaan otomatis.',
    buktiDi: 'Subbab 4.4; dinyatakan sebagai batas',
    sumber: 'bab4.tex:283',
  },
  {
    id: 'perbandingan-konselor',
    judul: 'Perbandingan dengan penilaian konselor manusia',
    isi: 'Perbandingan langsung antara analisis sistem dan penilaian konselor tidak dilakukan, sehingga tidak ada pengujian yang dapat menyimpulkan keunggulan salah satunya.',
    buktiDi: 'Tidak ada; dinyatakan di luar lingkup',
    sumber: 'bab3.tex:326',
  },
  {
    id: 'keterdukungan-semantik-otomatis',
    judul: 'Keterdukungan semantik yang dijamin mesin',
    isi: 'Validasi menjamin bahwa identitas ter-resolve ke dokumen yang benar-benar diambil, bukan bahwa dokumen itu mendukung makna klaim. Keterdukungan semantik tetap bergantung pada penilaian rubrik.',
    buktiDi: 'Subbab 4.13 butir 3',
    sumber: 'bab4.tex:281',
  },
]

/** Enam keterbatasan penelitian, disalin urut dari Subbab 4.13. */
export const keterbatasan: Butir[] = [
  {
    id: 'satu-evaluator',
    judul: 'Satu evaluator',
    isi: 'Penilaian relevansi retrieval, dukungan klaim, dan isi obrolan memakai satu evaluator berbantuan atas delegasi eksplisit; tidak ada panel independen dan reliabilitas antarpenilai tidak diukur.',
    sumber: 'bab4.tex:279',
  },
  {
    id: 'profil-sintetis',
    judul: 'Lima profil sintetis',
    isi: 'Eksperimen retrieval, sensitivitas, dan ablasi memakai lima profil sintetis, bukan responden siswa SMA, sehingga hasilnya tidak dapat dibaca sebagai perilaku sistem terhadap pengguna nyata.',
    sumber: 'bab4.tex:280',
  },
  {
    id: 'identitas-bukan-makna',
    judul: 'Identitas bukan makna',
    isi: 'Validasi identitas menjamin bahwa referensi yang disitasi berada di dalam himpunan yang diambil pipeline, tetapi tidak menjamin bahwa referensi tersebut secara semantik mendukung klaim.',
    sumber: 'bab4.tex:281',
  },
  {
    id: 'granularitas',
    judul: 'Granularitas keterlacakan',
    isi: 'Keterlacakan tingkat klaim mencakup sembilan unit klaim per keluaran analisis, sedangkan ruas naratif lain tidak membawa identitas referensi. Pada layanan obrolan, atribusi berada pada tingkat jawaban.',
    sumber: 'bab4.tex:282',
  },
  {
    id: 'throughput-tiruan',
    judul: 'Throughput memakai model tiruan',
    isi: 'Pengukuran berjalan pada satu mesin lokal tanpa infrastruktur nyata, sehingga bukan tolok ukur produksi dan bukan bukti penskalaan otomatis.',
    sumber: 'bab4.tex:283',
  },
  {
    id: 'bukti-teknis',
    judul: 'Seluruh bukti bersifat teknis',
    isi: 'Penelitian tidak menguji validitas psikometrik butir, norma populasi Indonesia, ketepatan pemetaan bakat sebagai pembacaan psikologis, maupun efektivitas rekomendasi bagi siswa.',
    sumber: 'bab4.tex:284',
  },
]

/** Hal yang wajib tetap tampil meskipun tidak menguntungkan. */
export const wajibTampil: Butir[] = [
  {
    id: 'delta-gcr-nol',
    judul: 'ΔGCR = 0 (p = 1,000)',
    isi: 'Kenaikan GCR terjadi pada kedua lengan dengan besar yang sama persis dan merupakan efek perbaikan prompt, bukan keunggulan RAG.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:62',
  },
  {
    id: 'rrr-tak-terdefinisi',
    judul: 'RRR tak terdefinisi pada rerun',
    isi: 'Seluruh 30 keluaran diterima gerbang validasi pada percobaan pertama, sehingga penyebutnya nol. Nilai itu tidak boleh dibaca sebagai 0,0000. Kemampuan pemulihan tetap terbukti pada putaran sebelumnya dengan RRR 1/1.',
    sumber: 'bab4.tex:179',
  },
  {
    id: 'flr-tanpa-rag',
    judul: 'FLR tanpa RAG tak terdefinisi',
    isi: 'Tidak ada label yang dihasilkan pada kondisi tanpa RAG, sehingga penyebutnya nol.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:71',
  },
  {
    id: 'lima-pertanyaan-gagal',
    judul: 'Lima dari dua belas pertanyaan obrolan gagal',
    isi: 'Kelimanya gagal pada batas waktu hulu 120 detik dan berada di luar penyebut seluruh metrik obrolan; kegagalan itu dilaporkan apa adanya dan tidak dinilai nol.',
    sumber: 'bab4.tex:199',
  },
  {
    id: 'cache-tidak-terukur',
    judul: 'Context cache tidak terukur',
    isi: 'Cache hit ratio, token saving ratio, dan latency change ratio berstatus n/a karena provider cache tidak tersedia pada gate live.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:102',
  },
  {
    id: 'deviasi-ambang',
    judul: 'Deviasi ambang VIA-IS pada harness ablasi',
    isi: 'Harness ablasi memakai ambang VIA-IS 70, lebih rendah daripada 75 yang dikunci. Deviasi dilaporkan apa adanya dan tidak ditutup dengan penyesuaian retroaktif, karena mengubah keputusan ambang setelah pengukuran akan merusak keterlacakan artefak.',
    sumber: 'bab4.tex:274',
  },
  {
    id: 'order-pembayaran-gagal',
    judul: 'Order pembayaran gagal pada penjalanan awal e2e',
    isi: 'Kegagalan itu tidak dijadikan penghalang bagi evaluasi kontribusi inti, sesuai perlakuan komponen pendukung pada Ruang Lingkup Bab 1.',
    sumber: 'bab4.tex:227',
  },
  {
    id: 'e2e-nondeterministik',
    judul: 'Jawaban asisten bergantung penyedia nondeterministik',
    isi: 'Satu penjalanan menemukan jawaban asisten, sedangkan penjalanan lain belum menemukannya dalam jendela waktu pengujian. Harness melaporkan kondisi waktu habis secara eksplisit, bukan sebagai kelulusan semu.',
    sumber: 'bab4.tex:225',
  },
]

export const statusTujuan: Array<Bersumber & { id: string; tujuan: string; status: string; kualifikasi: string }> = [
  {
    id: 'tujuan-1',
    tujuan: 'Arsitektur microservice yang andal',
    status: 'Tercapai pada lingkup uji',
    kualifikasi:
      'Sebagai kontribusi penopang. Bukti menunjukkan semantik at-least-once, bukan exactly-once. Hasil throughput sengaja tidak dipakai memperkuat penilaian ini.',
    sumber: 'bab4.tex:245',
  },
  {
    id: 'tujuan-2',
    tujuan: 'Pipeline pencarian semantik berbasis RAG',
    status: 'Tercapai dengan kualifikasi',
    kualifikasi:
      'Kualifikasinya menyangkut batas semantik validasi: validasi menjamin resolvabilitas identitas, bukan bahwa dokumen mendukung makna klaim.',
    sumber: 'bab4.tex:254',
  },
  {
    id: 'tujuan-3',
    tujuan: 'Layanan obrolan kontekstual berbasis SSE',
    status: 'Tercapai pada lingkup fungsional',
    kualifikasi:
      'Dengan batas granularitas atribusi jawaban, dan satu kegagalan konsistensi yang berasal dari penalaran jawaban atas profil berskor rata.',
    sumber: 'bab4.tex:265',
  },
]
