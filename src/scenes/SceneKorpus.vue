<script setup lang="ts">
import SceneLayout from '@/components/SceneLayout.vue'
import StepBlock from '@/components/StepBlock.vue'
import VizKorpus from '@/components/viz/VizKorpus.vue'
import {
  angkaDenganId,
  contohBarisKorpus,
  indeksHnsw,
  kelompokKorpus,
  labelKorpus,
  langkahIngest,
  nilaiKolomContoh,
} from '@/data'

const angkaKorpus = [
  angkaDenganId('korpus.unit'),
  angkaDenganId('korpus.sumber-unik'),
  angkaDenganId('korpus.berkas'),
  angkaDenganId('korpus.dimensi-vektor'),
  angkaDenganId('korpus.norma-vektor'),
]

const langkah = [
  {
    judul: 'Empat direktori menjadi satu korpus',
    isi: [
      'Bahan akademik dikelompokkan menurut RIASEC, OCEAN, VIA-IS, dan cross-reference. Manifest menyatukan 17 berkas itu menjadi 127 unit dari 112 sumber akademik unik.',
      'Satu sumber dapat mendasari beberapa unit. Karena itu jumlah unit lebih besar daripada jumlah sumber; keduanya tidak boleh dipertukarkan.',
    ],
    sumber: 'bab3.tex:90, ecosystem-futureguide/analysis-worker/knowledge/manifest.json:4',
  },
  {
    judul: 'Satu unit menjadi satu baris reference_documents',
    isi: [
      'Baris menyimpan identitas, jenis asesmen, domain, judul, isi, sumber, tag, dan embedding. Metadata siklus hidup menambahkan checksum, model, status, identitas sumber, serta berkas asal.',
      'Kolom embedding bertipe vector(768), bukan array angka PostgreSQL biasa setelah migrasi pgvector.',
    ],
    sumber: 'ecosystem-futureguide/migrations/001_reference_documents.up.sql:3, ecosystem-futureguide/migrations/051_reference_document_lifecycle.up.sql:3',
  },
  {
    judul: 'Baris contoh dapat dibuka sampai tingkat kolom',
    isi: [
      'Tombol “Buka baris contoh” memperlihatkan keempat belas kolom yang diaudit. Contohnya berasal dari unit PMAI The Innocent pada kelompok cross-reference.',
      'Potongan vektor ditampilkan sebagai null. Artefak evaluasi hanya membuktikan dimensi 768 dan norma sampel 1,000000; nilai elemennya tidak pernah dipublikasikan.',
    ],
    sumber: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json:14, bab4.tex:50',
  },
  {
    judul: 'Penyematan memakai peran dokumen',
    isi: [
      'Seeder mengirim isi tiap unit ke gemini-embedding-001 dengan jenis tugas RETRIEVAL_DOCUMENT. Peran RETRIEVAL_QUERY baru dipakai kelak ketika skor dirakit menjadi kueri.',
      'Pemisahan peran membuat dokumen dan kueri direpresentasikan sesuai fungsinya meskipun berada dalam ruang vektor yang sama.',
    ],
    sumber: 'bab3.tex:204, ecosystem-futureguide/analysis-worker/internal/gemini/embedder.go:72',
  },
  {
    judul: 'Normalisasi L2 mendahului penyimpanan',
    isi: [
      'Embedder membagi setiap elemen dengan norma vektornya. Vektor all-zero tidak diterima sebagai embedding siap pakai, sedangkan vektor sah disimpan ke kolom vector(768).',
      'Basis data evaluasi mencatat seluruh unit siap tanpa status NULL dan sampel yang diperiksa bernorma 1,000000.',
    ],
    sumber: 'ecosystem-futureguide/analysis-worker/internal/gemini/embedder.go:58, bab4.tex:50',
  },
  {
    judul: 'HNSW membangun lingkungan kandidat',
    isi: [
      'Indeks memakai vector_cosine_ops. Parameter m = 16 membatasi jumlah tetangga yang disimpan tiap simpul pada satu lapisan graf.',
      'ef_construction = 64 berarti hingga 64 kandidat dipertimbangkan saat graf dibangun. Panel visual membedakan 16 hubungan tersimpan dari kolam 64 kandidat; keduanya bukan jumlah hasil retrieval.',
    ],
    sumber: 'ecosystem-futureguide/migrations/014_pgvector_embeddings.up.sql:44',
  },
]
</script>

<template>
  <SceneLayout
    kode="S05"
    judul="Korpus RAG"
    ikhtisar="Dari 17 berkas akademik menjadi 127 unit ber-vektor 768 dimensi yang tersimpan, terindeks, dan dapat diaudit sampai ke sumbernya."
  >
    <template #visual="{ langkah: aktif, gerakDikurangi }">
      <VizKorpus
        :langkah="aktif"
        :jumlah-langkah="langkah.length"
        :gerak-dikurangi="gerakDikurangi"
        :kelompok="kelompokKorpus"
        :angka="angkaKorpus"
        :kolom-contoh="nilaiKolomContoh"
        :contoh="contohBarisKorpus"
        :langkah-ingest="langkahIngest"
        :indeks="indeksHnsw"
        :label="labelKorpus"
      />
    </template>

    <template #alternatif>
      Diagram menunjukkan empat direktori knowledge dan manifest yang membentuk
      127 unit dari 112 sumber unik. Satu baris reference_documents dapat dibuka
      untuk membaca 14 kolomnya. Nilai elemen embedding tidak dipublikasikan dan
      ditampilkan sebagai null; yang terverifikasi ialah 768 dimensi serta norma
      sampel 1,000000. Alur ingest memakai RETRIEVAL_DOCUMENT, normalisasi L2,
      vector(768), lalu indeks HNSW dengan m 16 dan ef_construction 64.
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
