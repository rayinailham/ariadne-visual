<script setup lang="ts">
import { computed } from 'vue'
import SceneLayout from '@/components/SceneLayout.vue'
import StepBlock from '@/components/StepBlock.vue'
import VizMasalah from '@/components/viz/VizMasalah.vue'
import { kartuMasalah, konteksMasalah, type Butir } from '@/data'

/**
 * S01 — Masalah.
 *
 * Adegan ini hanya menyusun narasi dan memilih butir data yang menyertai tiap
 * langkah. Seluruh angka dan kalimat konteks datang dari `src/data/masalah.ts`.
 */
const butir = (id: string): Butir => {
  const hasil = konteksMasalah.find((k) => k.id === id)
  if (!hasil) throw new Error(`Butir konteks tidak dikenal: ${id}`)
  return hasil
}

interface LangkahMasalah {
  judul: string
  isi: string[]
  sumber: string
  /** Kartu yang dibuka pada langkah ini. */
  kartu: string[]
  konteks: Butir[]
}

const langkah: LangkahMasalah[] = [
  {
    judul: 'Bidang studi dan pekerjaan sering tidak bertemu',
    isi: [
      'Ketidaksesuaian antara bidang studi dan pekerjaan yang dijalani masih menjadi masalah ketenagakerjaan di Indonesia. Data Survei Angkatan Kerja Nasional menunjukkan hampir separuh pekerja Indonesia bekerja di luar bidang studinya.',
      'Naskah tidak memuat persentase pasti untuk besaran itu, sehingga kartu di sebelah kanan menampilkan bunyinya apa adanya dan tidak menggantinya dengan bilangan.',
    ],
    sumber: 'bab1.tex:5',
    kartu: ['ketidaksesuaian'],
    konteks: [butir('lulusan-smk')],
  },
  {
    judul: 'Ketidaksesuaian itu ada harganya',
    isi: [
      'Ketidaksesuaian bidang berkaitan dengan pendapatan yang lebih rendah, yaitu sekitar 11 persen pada ketidaksesuaian sebagian dan lebih dari 25 persen pada ketidaksesuaian penuh.',
      'Angka kedua adalah batas bawah, bukan nilai persis, sehingga bentuk tampilnya tetap membawa kata "lebih dari".',
    ],
    sumber: 'bab1.tex:5',
    kartu: ['penalti-sebagian', 'penalti-penuh'],
    konteks: [butir('akar-masalah')],
  },
  {
    judul: 'Layanan bimbingan belum menjangkau semua siswa',
    isi: [
      'Permendikbud Nomor 111 Tahun 2014 menetapkan rasio ideal guru Bimbingan dan Konseling terhadap siswa sebesar 1:150. Rasio itu adalah ketetapan regulasi, bukan hasil pengukuran di lapangan.',
      'Bimbingan karier juga menuntut waktu, kemampuan menafsirkan hasil pengukuran, serta instrumen psikometrik yang sesuai.',
    ],
    sumber: 'bab1.tex:7',
    kartu: ['rasio-bk'],
    konteks: [butir('beban-bimbingan')],
  },
  {
    judul: 'Tiga kerangka mengukur hal yang berbeda',
    isi: [
      'Psikologi vokasional menyediakan beberapa kerangka yang saling melengkapi, dan penelitian ini memakai tiga di antaranya: RIASEC untuk minat vokasional, OCEAN untuk lima dimensi kepribadian, dan VIA-IS untuk 24 kekuatan karakter.',
      'Membaca ketiganya sekaligus memberi gambaran diri yang lebih utuh, tetapi menuntut waktu dan pemahaman yang memadai.',
    ],
    sumber: 'bab1.tex:9',
    kartu: [],
    konteks: [butir('tiga-kerangka')],
  },
  {
    judul: 'Model bahasa perlu ditambatkan pada sumber',
    isi: [
      'Model bahasa besar membuka peluang untuk membantu pembacaan profil, tetapi dapat menghasilkan informasi keliru bila tidak didukung sumber yang jelas. Retrieval-Augmented Generation menekan risiko itu dengan mengambil informasi dari basis pengetahuan sebelum jawaban disusun.',
      'Dari literatur yang ditinjau, penggunaan RAG untuk membaca profil dari beberapa kerangka sekaligus dalam satu sistem bimbingan karier masih jarang dibahas. Celah itulah yang dituju penelitian ini.',
    ],
    sumber: 'bab1.tex:11',
    kartu: [],
    konteks: [butir('risiko-llm'), butir('celah-penelitian')],
  },
]

/** Langkah tempat tiap kartu dibuka; dipakai viz untuk menahan angka. */
const langkahKartu = computed<Record<string, number>>(() => {
  const peta: Record<string, number> = {}
  langkah.forEach((l, i) => l.kartu.forEach((id) => (peta[id] = i)))
  return peta
})

const konteksLangkah = (i: number) => langkah[i]?.konteks ?? []
</script>

<template>
  <SceneLayout
    kode="S01"
    judul="Masalah"
    ikhtisar="Empat besaran dari Bab 1 yang menjelaskan mengapa pemetaan bakat berbasis tiga instrumen perlu dibantu sistem."
  >
    <template #visual="{ langkah: aktif, gerakDikurangi }">
      <VizMasalah
        :langkah="aktif"
        :jumlah-langkah="langkah.length"
        :gerak-dikurangi="gerakDikurangi"
        :kartu="kartuMasalah"
        :langkah-kartu="langkahKartu"
        :konteks="konteksLangkah(aktif)"
      />
    </template>

    <template #alternatif>
      Papan statistik membuka empat kartu satu per satu: besaran pekerja di luar
      bidang studi yang tidak memuat angka pasti, selisih pendapatan pada
      ketidaksesuaian sebagian dan penuh, serta rasio ideal guru Bimbingan dan
      Konseling terhadap siswa. Setiap kartu membawa berkas dan baris sumbernya.
    </template>

    <template #narasi>
      <StepBlock
        v-for="(l, i) in langkah"
        :key="l.judul"
        :indeks="i"
        :judul="l.judul"
        :sumber="l.sumber"
      >
        <p v-for="(paragraf, j) in l.isi" :key="j">{{ paragraf }}</p>
      </StepBlock>
    </template>
  </SceneLayout>
</template>
