<script setup lang="ts">
import { computed } from 'vue'

/**
 * Visual uji mekanik F0. Tidak membawa fakta skripsi apa pun:
 * tugasnya hanya membuktikan kolom kanan berubah mengikuti langkah kolom kiri.
 * Semua label diterima lewat prop, tidak ada yang ditanam di dalam komponen.
 */
const props = defineProps<{
  langkah: number
  jumlahLangkah: number
  progres: number
  gerakDikurangi: boolean
  jalur: string[]
}>()

const TINGGI_JALUR = 46
const ATAS = 34

const posisiY = (i: number) => ATAS + i * TINGGI_JALUR
const aktif = (i: number) => i === props.langkah

const persen = computed(() => Math.round(props.progres * 100))
const durasi = computed(() => (props.gerakDikurangi ? '0.001s' : '0.42s'))
</script>

<template>
  <figure class="flex h-full flex-col justify-between p-5">
    <figcaption class="flex items-baseline justify-between">
      <span class="label-teknis">Panel uji</span>
      <span class="label-teknis text-sorot">
        langkah {{ langkah + 1 }}/{{ jumlahLangkah }}
      </span>
    </figcaption>

    <svg
      class="mt-4 w-full flex-1"
      :viewBox="`0 0 360 ${ATAS + jalur.length * TINGGI_JALUR}`"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      :aria-label="`Panel uji mekanik, jalur aktif nomor ${langkah + 1}`"
    >
      <g v-for="(nama, i) in jalur" :key="nama">
        <!-- rel jalur -->
        <line
          :x1="46"
          :x2="340"
          :y1="posisiY(i)"
          :y2="posisiY(i)"
          stroke="var(--color-garis-tegas)"
          stroke-width="1"
        />
        <!-- pengisi jalur aktif -->
        <line
          :x1="46"
          :x2="aktif(i) ? 340 : 46"
          :y1="posisiY(i)"
          :y2="posisiY(i)"
          stroke="var(--color-sorot)"
          stroke-width="1.5"
          :style="{ transition: `all ${durasi} var(--ease-keluar)` }"
        />
        <circle
          :cx="46"
          :cy="posisiY(i)"
          :r="aktif(i) ? 4.5 : 2.5"
          :fill="aktif(i) ? 'var(--color-sorot)' : 'var(--color-garis-tegas)'"
          :style="{ transition: `all ${durasi} var(--ease-keluar)` }"
        />
        <text
          :x="14"
          :y="posisiY(i) + 4"
          font-size="10"
          letter-spacing="0.08em"
          :fill="aktif(i) ? 'var(--color-sorot)' : 'var(--color-teks-samar)'"
        >
          {{ String(i + 1).padStart(2, '0') }}
        </text>
        <text
          :x="56"
          :y="posisiY(i) - 8"
          font-size="11"
          :fill="aktif(i) ? 'var(--color-teks)' : 'var(--color-teks-samar)'"
          :style="{ transition: `fill ${durasi} var(--ease-keluar)` }"
        >
          {{ nama }}
        </text>
      </g>
    </svg>

    <div class="mt-4 flex items-center gap-3">
      <div class="h-px flex-1 bg-garis-tegas">
        <div
          class="h-px bg-sorot"
          :style="{ width: `${persen}%`, transition: `width 0.1s linear` }"
        />
      </div>
      <span class="label-teknis tabular-nums">{{ persen }}%</span>
    </div>
  </figure>
</template>
