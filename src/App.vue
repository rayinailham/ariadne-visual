<script setup lang="ts">
import ProgressRail from '@/components/ProgressRail.vue'
import SceneUjiMekanik from '@/scenes/SceneUjiMekanik.vue'
import { useTema } from '@/composables/useTema'
import type { RingkasanAdegan } from '@/composables/adegan'
import { angkaTanpaNilai, semuaAngka } from '@/data'

const { gantiTema } = useTema()

/** Ringkasan lapisan data; buktinya ada di `scripts/verifikasi-angka.md`. */
const jumlahAngka = semuaAngka.length
const jumlahAngkaTanpaNilai = angkaTanpaNilai.length

/**
 * Daftar adegan yang sudah tayang. Bertambah tiap fase sesuai peta adegan
 * di rencana/08-PLAN-WEB-VISUAL.md.
 */
const adegan: RingkasanAdegan[] = [{ id: 'S00', kode: 'S00', judul: 'Uji mekanik' }]
</script>

<template>
  <a
    href="#isi"
    class="sr-only rounded-kartu focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-60 focus-visible:bg-panel-naik focus-visible:px-3 focus-visible:py-2"
  >
    Lompat ke isi
  </a>

  <ProgressRail :adegan="adegan" />

  <header
    class="fixed top-0 right-0 left-[var(--sisipan-rel)] z-40 flex h-[var(--tinggi-kepala)] items-center justify-between border-b border-garis bg-latar/92 px-5 backdrop-blur-sm md:px-8"
  >
    <p class="label-teknis">Ariadne / visual skripsi</p>
    <button
      type="button"
      class="label-teknis rounded-hairline px-2 py-1 hover:text-sorot"
      @click="gantiTema"
    >
      Ganti tema
    </button>
  </header>

  <main id="isi" class="pt-[var(--tinggi-kepala)]">
    <section
      class="mx-auto flex min-h-[78vh] max-w-[92rem] flex-col justify-center gap-6 px-5 py-[var(--napas-adegan)] md:px-8 lg:px-12"
    >
      <p class="label-teknis">Skripsi S1 Informatika</p>
      <h1 class="max-w-[22ch] text-j1 text-teks">
        Pencarian semantik berbasis RAG untuk pemetaan bakat
      </h1>
      <p class="max-w-[58ch] text-sorotan text-teks-redup">
        Situs ini membongkar mekanisme di balik sistem FutureGuide: bagaimana 200
        jawaban psikometrik berubah menjadi kueri, vektor, dokumen rujukan, lalu
        narasi profil yang bisa dilacak sampai ke sumbernya.
      </p>
      <p class="max-w-[58ch] text-kecil text-teks-samar">
        Setiap angka yang muncul di halaman ini membawa sumbernya. Angka yang belum
        punya bukti ditulis apa adanya sebagai kosong.
      </p>
    </section>

    <SceneUjiMekanik />
  </main>

  <footer
    class="mx-auto max-w-[92rem] border-t border-garis px-5 py-12 text-mikro text-teks-samar md:px-8 lg:px-12"
  >
    <p>
      Fase F1: lapisan data terpasang sebagai sumber fakta tunggal.
      <span class="font-mono">{{ jumlahAngka }}</span> angka terdaftar, di antaranya
      <span class="font-mono">{{ jumlahAngkaTanpaNilai }}</span> tanpa nilai numerik dan
      ditampilkan apa adanya. Peta bukti tiap angka ada di
      <span class="font-mono">scripts/verifikasi-angka.md</span>. Adegan isi menyusul
      sesuai peta adegan.
    </p>
  </footer>
</template>
