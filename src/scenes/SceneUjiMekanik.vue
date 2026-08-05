<script setup lang="ts">
import SceneLayout from '@/components/SceneLayout.vue'
import StepBlock from '@/components/StepBlock.vue'
import VizUjiMekanik from '@/components/viz/VizUjiMekanik.vue'

/**
 * Adegan sementara fase F0. Isinya menjelaskan mekanik situs, bukan isi skripsi.
 * Diganti oleh adegan S01 dan seterusnya mulai fase F2.
 */
const langkah = [
  {
    judul: 'Kolom kiri menggulir, kolom kanan tetap',
    isi: 'Narasi mengalir seperti teks biasa. Panel di sebelah kanan menempel di layar sampai adegan berakhir, sehingga penonton tidak kehilangan objek yang sedang dibahas.',
  },
  {
    judul: 'Satu langkah, satu keadaan visual',
    isi: 'Setiap blok narasi menandai satu keadaan. Ketika blok melewati garis baca pada 62 persen tinggi layar, panel kanan berpindah ke keadaan tersebut.',
  },
  {
    judul: 'Angka tidak tinggal di dalam visual',
    isi: 'Komponen visual hanya menerima keadaan dan data lewat prop. Semua angka dan istilah akan datang dari lapisan data yang dibangun pada fase berikutnya, lengkap dengan sumbernya.',
  },
  {
    judul: 'Gerak boleh dimatikan',
    isi: 'Bila sistem meminta pengurangan gerak, transisi diperpendek mendekati nol dan panel langsung memakai keadaan akhir. Isi yang tersampaikan tetap sama.',
  },
]

const jalur = langkah.map((l) => l.judul)
</script>

<template>
  <SceneLayout
    kode="S00"
    judul="Uji mekanik"
    ikhtisar="Adegan sementara untuk membuktikan kolom sticky, penanda langkah, dan sistem token warna bekerja sebelum isi skripsi dimasukkan."
  >
    <template #visual="{ langkah: aktif, progres, gerakDikurangi }">
      <VizUjiMekanik
        :langkah="aktif"
        :jumlah-langkah="jalur.length"
        :progres="progres"
        :gerak-dikurangi="gerakDikurangi"
        :jalur="jalur"
      />
    </template>

    <template #alternatif>
      Panel uji menampilkan empat jalur yang menyala satu per satu mengikuti langkah
      narasi di sebelah kiri.
    </template>

    <template #narasi>
      <StepBlock
        v-for="(l, i) in langkah"
        :key="l.judul"
        :indeks="i"
        :judul="l.judul"
      >
        <p>{{ l.isi }}</p>
      </StepBlock>
    </template>
  </SceneLayout>
</template>
