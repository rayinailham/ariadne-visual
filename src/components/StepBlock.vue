<script setup lang="ts">
import { computed } from 'vue'
import { pakaiAdegan } from '@/composables/adegan'

const props = defineProps<{
  /** Urutan langkah dalam adegan, dimulai dari 0. */
  indeks: number
  /** Judul singkat langkah. Muncul sebagai penanda, bukan hiasan. */
  judul: string
}>()

const { langkahAktif, kode } = pakaiAdegan()
const aktif = computed(() => langkahAktif.value === props.indeks)
const nomor = computed(() => String(props.indeks + 1).padStart(2, '0'))
</script>

<template>
  <article
    data-langkah
    :id="`${kode}-L${nomor}`"
    :aria-current="aktif ? 'step' : undefined"
    class="min-h-[68vh] py-[6vh] transition-opacity duration-[var(--durasi-sedang)] ease-keluar"
    :class="aktif ? 'opacity-100' : 'opacity-85'"
  >
    <div class="flex items-baseline gap-3">
      <span
        class="label-teknis transition-colors duration-[var(--durasi-sedang)]"
        :class="aktif ? 'text-sorot' : 'text-teks-samar'"
        >{{ kode }}.{{ nomor }}</span
      >
      <span
        aria-hidden="true"
        class="h-px flex-1 transition-colors duration-[var(--durasi-lambat)] ease-keluar"
        :class="aktif ? 'bg-sorot' : 'bg-garis'"
      />
    </div>

    <h3 class="mt-3 text-j3 text-teks">{{ judul }}</h3>

    <div class="mt-4 flex flex-col gap-4 text-badan text-teks-redup">
      <slot />
    </div>
  </article>
</template>
