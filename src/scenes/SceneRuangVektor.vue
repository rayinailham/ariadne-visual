<script setup lang="ts">
import SceneLayout from '@/components/SceneLayout.vue'
import StepBlock from '@/components/StepBlock.vue'
import VizRuangVektor from '@/components/viz/VizRuangVektor.vue'
import {
  angkaDenganId,
  contohKesamaanVektor,
  jenisTugasEmbedding,
  labelRuangVektor,
  ruangVektor,
} from '@/data'

const angka = [
  angkaDenganId('korpus.unit'),
  angkaDenganId('korpus.norma-vektor'),
  angkaDenganId('rag.jumlah-kueri'),
  angkaDenganId('rag.dimensi-embedding'),
]

const langkah = [
  {
    judul: 'Teks menjadi koordinat berdimensi tinggi',
    isi: ['Setiap kueri bertema diubah oleh gemini-embedding-001 menjadi vektor 768 dimensi. Korpus telah disematkan ke ruang yang sama saat penyemaian.'],
    sumber: 'bab3.tex:204, bab4.tex:15',
  },
  {
    judul: 'Dokumen membawa peran retrieval document',
    isi: ['Unit korpus memakai RETRIEVAL_DOCUMENT. Jenis tugas ini memberi tahu model bahwa teks berperan sebagai bahan yang akan ditemukan.'],
    sumber: jenisTugasEmbedding[0]!.sumber,
  },
  {
    judul: 'Kueri membawa peran retrieval query',
    isi: ['Lima kueri saat analisis memakai RETRIEVAL_QUERY. Perannya berbeda, tetapi keluarannya tetap berada dalam ruang embedding yang sama dengan dokumen.'],
    sumber: jenisTugasEmbedding[1]!.sumber,
  },
  {
    judul: 'Normalisasi L2 memindahkan vektor ke bola satuan',
    isi: ['Setiap vektor dibagi normanya. Sampel basis data yang diperiksa mempunyai norma 1,000000; pada ruang tampilan, ujung vektor karena itu berada di permukaan bola satuan.'],
    sumber: 'ecosystem-futureguide/analysis-worker/internal/gemini/embedder.go:58–69, bab4.tex:50',
  },
  {
    judul: 'Sudut mengungkap kesamaan arah',
    isi: ['Busur menunjukkan sudut antara satu kueri dan dokumen. Nilai contoh 0,823767 berasal dari hasil retrieval profil Riset, bukan angka ilustratif.'],
    sumber: contohKesamaanVektor.sumber,
  },
  {
    judul: 'Kosinus menjadi dot product setelah normalisasi',
    isi: ['Karena kedua norma bernilai satu, penyebut persamaan kosinus hilang: kesamaan kosinus sama dengan dot product. Proyeksi tiga dimensi hanya menjelaskan hubungan ini, bukan menggantikan ruang 768-D sistem.'],
    sumber: ruangVektor[1]!.sumber,
  },
]
</script>

<template>
  <SceneLayout
    kode="S07"
    judul="Embedding dan ruang vektor"
    ikhtisar="Dokumen dan kueri disematkan dengan peran berbeda ke ruang 768 dimensi yang sama, lalu dinormalisasi untuk membandingkan arah."
  >
    <template #visual="{ langkah: aktif, gerakDikurangi }">
      <VizRuangVektor
        :langkah="aktif"
        :jumlah-langkah="langkah.length"
        :gerak-dikurangi="gerakDikurangi"
        :angka="angka"
        :jenis-tugas="jenisTugasEmbedding"
        :contoh="contohKesamaanVektor"
        :label="labelRuangVektor"
      />
    </template>

    <template #alternatif>
      Proyeksi tiga dimensi dari ruang embedding 768 dimensi. Seratus dua puluh
      tujuh unit korpus bertipe RETRIEVAL_DOCUMENT dan lima kueri bertipe
      RETRIEVAL_QUERY berada pada bola satuan setelah normalisasi L2. Satu pasangan
      terukur memiliki kesamaan kosinus 0,823767, setara dot product karena kedua
      vektor bernorma satu. Posisi awan lainnya ilustratif karena elemen vektor
      korpus tidak dipublikasikan.
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
      </StepBlock>
    </template>
  </SceneLayout>
</template>
