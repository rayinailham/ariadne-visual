# Ariadne: visual skripsi FutureGuide

Situs *scrollytelling* yang menjelaskan mekanisme skripsi **"Implementasi Pencarian
Semantik Berbasis Retrieval-Augmented Generation untuk Pemetaan Bakat
Multi-Instrumen Psikometrik pada Ekosistem Backend Microservice"**.

Kolom kiri berisi narasi yang menggulir, kolom kanan berisi panel visual yang
menempel dan berubah mengikuti langkah narasi.

## Menjalankan

```bash
npm install
npm run dev        # server pengembangan
npm run build      # typecheck + build statis ke dist/
npm run preview    # menyajikan hasil build
npm run typecheck  # vue-tsc --noEmit
```

## Aturan isi

1. Angka hanya boleh berasal dari naskah skripsi atau `bab4-results/BAB4_ANGKA_FINAL.md`.
   Setiap entri data membawa field `sumber`. Angka tanpa bukti ditulis `null`.
2. Hasil tidak dipoles. Metrik yang tak terdefinisi, ablasi yang tidak menguntungkan
   RAG, dan pertanyaan obrolan yang gagal tetap ditampilkan.
3. Visual harus menjelaskan mekanisme. Animasi yang tidak mengajarkan cara kerja
   sistem dihapus.
4. Komponen visual tidak boleh menyimpan angka. Semua angka masuk lewat prop dari
   `src/data/`.

## Struktur

```
src/
├── styles/       token sistem desain dan lapisan dasar
├── data/         sumber fakta tunggal (mulai fase F1)
├── composables/  mesin gulir, pengurangan gerak, tema
├── components/   tata letak adegan, blok langkah, rel progres, viz/
└── scenes/       satu berkas per adegan
```

## Sistem desain

- Tipografi: naskah memakai Source Serif 4, antarmuka memakai Instrument Sans,
  identifier teknis memakai JetBrains Mono.
- Warna: latar tinta hangat dengan satu warna sorot ambar. Hijau, kuning, dan merah
  hanya dipakai untuk keadaan sistem, bukan hiasan.
- Tema gelap dan terang, mengikuti `prefers-color-scheme` dan dapat diganti manual.
- `prefers-reduced-motion` dihormati: transisi diperpendek mendekati nol.

## Kemajuan

Papan status fase ada di `rencana/STATUS-WEB-VISUAL.md` pada repositori naskah
skripsi. Rencana lengkap ada di `rencana/08-PLAN-WEB-VISUAL.md`.
