<script setup lang="ts">
import AngkaNaik from './AngkaNaik.vue'
import type { Butir, KartuStatistik } from '@/data'

/**
 * Papan statistik adegan S01.
 *
 * Kartu dibuka satu per satu mengikuti langkah narasi. Tidak ada bilangan,
 * label, maupun sumber yang ditanam di komponen ini: semuanya datang lewat
 * prop dari `src/data/masalah.ts`.
 */
const props = defineProps<{
  langkah: number
  jumlahLangkah: number
  gerakDikurangi: boolean
  kartu: KartuStatistik[]
  /** Langkah tempat tiap kartu pertama kali dibuka, dikunci pada id kartu. */
  langkahKartu: Record<string, number>
  /** Butir konteks yang menyertai langkah yang sedang berjalan. */
  konteks: Butir[]
}>()

const dibuka = (id: string) => props.langkah >= (props.langkahKartu[id] ?? 0)
const disorot = (id: string) => props.langkah === props.langkahKartu[id]
</script>

<template>
  <figure class="flex h-full flex-col gap-3 p-4 md:p-5">
    <figcaption class="flex items-baseline justify-between gap-3">
      <span class="label-teknis">Papan statistik</span>
      <span class="label-teknis text-sorot">
        langkah {{ langkah + 1 }}/{{ jumlahLangkah }}
      </span>
    </figcaption>

    <ul class="grid min-h-0 flex-1 grid-cols-2 gap-2 md:gap-3">
      <li
        v-for="k in kartu"
        :key="k.id"
        class="flex min-h-0 flex-col justify-between gap-2 overflow-hidden rounded-kartu border p-3 transition-colors duration-[var(--durasi-sedang)] ease-keluar"
        :class="
          disorot(k.id)
            ? 'border-sorot bg-panel-naik text-teks'
            : dibuka(k.id)
              ? 'border-garis-tegas text-teks-redup'
              : 'border-garis text-teks-samar'
        "
      >
        <p class="text-mikro leading-snug">{{ k.judul }}</p>

        <div>
          <AngkaNaik
            :angka="k.angka"
            :aktif="dibuka(k.id)"
            :gerak-dikurangi="gerakDikurangi"
          />
        </div>

        <p
          v-if="disorot(k.id) && k.angka.catatan"
          class="text-mikro leading-snug text-teks-samar"
        >
          {{ k.angka.catatan }}
        </p>

        <p class="label-teknis truncate" :title="k.sumber">{{ k.sumber }}</p>
      </li>
    </ul>

    <Transition mode="out-in" name="silang">
      <div :key="langkah" class="min-h-[6.5rem] border-t border-garis pt-3">
        <ul class="flex flex-col gap-2">
          <li v-for="b in konteks" :key="b.id">
            <p class="font-antarmuka text-mikro text-teks">{{ b.judul }}</p>
            <p class="text-mikro leading-snug text-teks-redup">{{ b.isi }}</p>
            <p class="label-teknis mt-0.5">{{ b.sumber }}</p>
          </li>
        </ul>
      </div>
    </Transition>
  </figure>
</template>

<style scoped>
/* Pergantian keterangan: silang cepat, tanpa perpindahan posisi. */
.silang-enter-active,
.silang-leave-active {
  transition: opacity 160ms var(--ease-keluar);
}

.silang-enter-from,
.silang-leave-to {
  opacity: 0;
}
</style>
