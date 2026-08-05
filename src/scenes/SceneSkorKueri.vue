<script setup lang="ts">
import SceneLayout from '@/components/SceneLayout.vue'
import StepBlock from '@/components/StepBlock.vue'
import VizSkorKueri from '@/components/viz/VizSkorKueri.vue'
import {
  alasanLimaKueri,
  ambangKodeRuntime,
  ambangHarnessAblasi,
  ambangTerkunci,
  angkaDenganId,
  aturanLabel,
  contohPotonganKueri,
  kalibrasiAmbang,
  kandidatAmbang,
  kueriBertema,
  labelSkorKueri,
  profilSintetis,
} from '@/data'

const angka = [
  angkaDenganId('instrumen.total-skor-domain'),
  angkaDenganId('rag.ambang-riasec'),
  angkaDenganId('rag.ambang-ocean'),
  angkaDenganId('rag.ambang-via'),
  angkaDenganId('rag.kandidat-ambang'),
  angkaDenganId('rag.baris-dominasi-via'),
  angkaDenganId('rag.profil-terdominasi-terpilih'),
  angkaDenganId('rag.jumlah-kueri'),
]

const langkah = [
  {
    judul: 'Tiga puluh lima skor belum menjadi bahasa pencarian',
    isi: [
      'Profil memuat enam skor domain RIASEC, lima OCEAN, dan 24 VIA-IS. Deret angka itu tidak langsung dicocokkan dengan korpus teks akademik.',
      'Sistem lebih dulu menerjemahkan skor terpilih menjadi potongan bahasa alami yang dapat disematkan secara semantik.',
    ],
    sumber: 'bab3.tex:198',
  },
  {
    judul: 'Ambang menyeleksi domain yang masuk kueri',
    isi: [
      'Keputusan Bab 4 memakai RIASEC ≥ 50, OCEAN ≥ 50, dan VIA-IS ≥ 75. Geser ambang VIA-IS pada panel untuk melihat domain yang lolos berubah.',
      'RIASEC dan OCEAN dipertahankan pada nilai terendah yang diuji. Ambang VIA-IS lebih tinggi karena instrumen itu menyumbang 24 dari 35 domain.',
    ],
    sumber: 'bab3.tex:200, bab4.tex:111',
  },
  {
    judul: 'Skor terpilih diberi label kualitatif',
    isi: [
      'Skor 75 ke atas menjadi high, skor di bawah 40 menjadi low, dan sisanya moderate. Label menjelaskan tingkat skor di dalam teks tanpa mengirim deret angka telanjang.',
      'Contoh dalam rancangan: Investigative 84 menjadi “Holland career types investigative (high)”.',
    ],
    sumber: 'bab3.tex:202',
  },
  {
    judul: 'Potongan domain dirakit menjadi lima kueri',
    isi: [
      'Kueri RIASEC, OCEAN, dan VIA-IS menjaga fokus tiap konstruk. Dua kueri cross membaca integrasi lintas-instrumen dan pola arketipe PMAI.',
      'Lima kueri dipakai karena satu kalimat tunggal cenderung menarik dokumen umum dan mengabaikan domain yang menonjol.',
    ],
    sumber: 'bab3.tex:202, ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:684',
  },
  {
    judul: 'Slider memperlihatkan dominasi VIA-IS',
    isi: [
      'Pada kalibrasi lima profil, ambang VIA-IS 60 meloloskan 45 domain VIA-IS secara agregat, sedangkan RIASEC dan OCEAN bersama-sama hanya 28. Seluruh lima profil terdominasi VIA-IS.',
      'Pasangan 50/50/75 menurunkan agregat VIA-IS menjadi 20 dan menjadi satu-satunya dari 27 kandidat dengan nol dari lima profil terdominasi.',
    ],
    sumber: 'bab4.tex:98–100, bab4-results/02-threshold/threshold-distribution.csv',
  },
  {
    judul: 'Ambang rekayasa bukan norma psikometrik',
    isi: [
      'Ambang hanya menentukan domain mana yang masuk kueri retrieval. Ia bukan batas diagnosis, bukan norma populasi, dan bukan pernyataan bahwa seseorang memiliki atau tidak memiliki suatu sifat.',
      'Deviasi tetap dibuka: keputusan naskah dikunci pada 50/50/75, tetapi kode runtime dan harness ablasi memakai VIA-IS 70. Visual tidak mendamaikan selisih itu.',
    ],
    sumber: 'bab4.tex:23, bab4.tex:98',
  },
]
</script>

<template>
  <SceneLayout
    kode="S06"
    judul="Skor menjadi kueri"
    ikhtisar="Tiga puluh lima skor domain diseleksi dengan ambang rekayasa, diberi label kualitatif, lalu dirakit menjadi lima kueri bertema."
  >
    <template #visual="{ langkah: aktif, gerakDikurangi }">
      <VizSkorKueri
        :langkah="aktif"
        :jumlah-langkah="langkah.length"
        :gerak-dikurangi="gerakDikurangi"
        :profil="profilSintetis[0]!"
        :angka="angka"
        :ambang="ambangTerkunci"
        :ambang-runtime="ambangKodeRuntime"
        :ambang-harness="ambangHarnessAblasi"
        :kandidat-via="kandidatAmbang.via"
        :kalibrasi="kalibrasiAmbang"
        :aturan-label="aturanLabel"
        :contoh="contohPotonganKueri"
        :kueri="kueriBertema"
        :label="labelSkorKueri"
      />
    </template>

    <template #alternatif>
      Visual memakai profil uji sintetis Riset dengan 35 skor domain. RIASEC dan
      OCEAN diseleksi pada ambang 50; slider VIA-IS memilih 60, 70, atau 75.
      Pada 60, VIA-IS mendominasi komposisi lintas-instrumen profil dan seluruh
      lima profil kalibrasi terdominasi. Pada keputusan 75, nol dari lima profil
      terdominasi. Domain terpilih diberi label high, moderate, atau low lalu
      dirakit menjadi lima kueri: RIASEC, OCEAN, VIA-IS, integrasi, dan PMAI.
      Ambang ini parameter seleksi kueri, bukan cut-off psikometrik.
    </template>

    <template #narasi>
      <StepBlock
        v-for="(item, indeks) in langkah"
        :key="item.judul"
        :indeks="indeks"
        :judul="item.judul"
        :sumber="item.sumber"
      >
        <p v-for="(paragraf, urut) in item.isi" :key="urut">{{ paragraf }}</p>
        <p v-if="indeks === 3" class="mt-4 text-mikro text-teks-samar">
          {{ alasanLimaKueri[0]?.isi }}
        </p>
      </StepBlock>
    </template>
  </SceneLayout>
</template>
