<script setup lang="ts">
import { computed } from 'vue'
import type {
  Angka,
  Bersumber,
  LangkahJalur,
  Layanan,
  TitikJalurArsitektur,
} from '@/data'

/**
 * S03: peta tujuh layanan + shared dan jalur permintaan bertahap.
 *
 * Angka, nama, peran, label jalur, dan sumber datang dari lapisan data. Nilai
 * koordinat di bawah hanya tata letak SVG dan tidak menyatakan fakta sistem.
 */
const props = defineProps<{
  langkah: number
  jumlahLangkah: number
  gerakDikurangi: boolean
  layanan: Layanan[]
  modulBersama: Bersumber & { nama: string; isi: string; catatan: string }
  titikJalur: TitikJalurArsitektur[]
  rincianJalur: LangkahJalur[]
  angkaLayanan: Angka
}>()

const LEBAR = 720
const TINGGI = 430
const LEBAR_SIMPUL = 150
const TINGGI_SIMPUL = 54
const X_KIRI = 34
const X_KANAN = 536
const Y_INTI = 54
const Y_PENDUKUNG = 144
const Y_SHARED = 228
const TINGGI_SHARED = 42
const Y_JALUR = 338
const X_JALUR_AWAL = 42
const X_JALUR_AKHIR = 678

interface SimpulLayanan extends Layanan {
  x: number
  y: number
}

const layananInti = computed(() => props.layanan.filter((item) => item.peran === 'inti'))
const layananPendukung = computed(() =>
  props.layanan.filter((item) => item.peran === 'pendukung'),
)

const sebarX = (indeks: number, jumlah: number) => {
  if (jumlah <= 1) return (LEBAR - LEBAR_SIMPUL) / 2
  return X_KIRI + (indeks * (X_KANAN - X_KIRI)) / (jumlah - 1)
}

const simpulLayanan = computed<SimpulLayanan[]>(() => [
  ...layananInti.value.map((item, indeks, semua) => ({
    ...item,
    x: sebarX(indeks, semua.length),
    y: Y_INTI,
  })),
  ...layananPendukung.value.map((item, indeks, semua) => ({
    ...item,
    x: sebarX(indeks, semua.length),
    y: Y_PENDUKUNG,
  })),
])

const rentangAktif = computed<[number, number] | null>(() => {
  if (props.langkah === 2) return [0, 2]
  if (props.langkah === 3) return [2, 4]
  if (props.langkah === 4) return [4, 5]
  if (props.langkah >= 5) return [5, props.titikJalur.length - 1]
  return null
})

const indeksX = (indeks: number) => {
  const penyebut = Math.max(1, props.titikJalur.length - 1)
  return X_JALUR_AWAL + (indeks * (X_JALUR_AKHIR - X_JALUR_AWAL)) / penyebut
}

const titikAktif = (indeks: number) => {
  const rentang = rentangAktif.value
  return rentang !== null && indeks >= rentang[0] && indeks <= rentang[1]
}

const ruasAktif = (indeks: number) => {
  const rentang = rentangAktif.value
  return rentang !== null && indeks >= rentang[0] && indeks < rentang[1]
}

const idLayananAktif = computed(() =>
  new Set(
    props.titikJalur
      .filter((_, indeks) => titikAktif(indeks))
      .map((titik) => titik.id)
      .filter((id) => props.layanan.some((item) => item.id === id)),
  ),
)

const layananDisorot = (id: string) => props.langkah < 2 || idLayananAktif.value.has(id)

const rincianAktif = computed(() => {
  if (props.langkah === 2) return props.rincianJalur.slice(0, 2)
  if (props.langkah === 3) return props.rincianJalur.slice(2, 4)
  if (props.langkah === 4) return props.rincianJalur.slice(4, 6)
  if (props.langkah >= 5) return props.rincianJalur.slice(6, 7)
  return []
})

const durasi = computed(() => (props.gerakDikurangi ? '0.001ms' : '320ms'))

const keterangan = computed(() => {
  if (props.langkah === 0)
    return `${props.angkaLayanan.tampil} layanan Go dan ${props.modulBersama.nama} sebagai pustaka`
  if (props.langkah === 1)
    return 'Kontribusi inti dibedakan dari komponen pendukung; shared bukan microservice'
  const rentang = rentangAktif.value
  if (!rentang) return 'Jalur permintaan arsitektur FutureGuide'
  return `Jalur aktif dari ${props.titikJalur[rentang[0]]?.nama} ke ${props.titikJalur[rentang[1]]?.nama}`
})
</script>

<template>
  <figure class="flex h-full flex-col gap-2 p-4 md:p-5">
    <figcaption class="flex items-baseline justify-between gap-3">
      <span class="label-teknis">Peta proses dan jalur permintaan</span>
      <span class="label-teknis text-sorot">
        langkah {{ langkah + 1 }}/{{ jumlahLangkah }}
      </span>
    </figcaption>

    <svg
      class="min-h-0 w-full flex-1"
      :viewBox="`0 0 ${LEBAR} ${TINGGI}`"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      :aria-label="keterangan"
    >
      <defs>
        <marker
          id="panah-arsitektur"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-sorot)" />
        </marker>
      </defs>

      <text x="34" y="28" font-size="8" letter-spacing="0.12em" fill="var(--color-teks-samar)">
        KONTRIBUSI INTI
      </text>
      <text x="34" y="128" font-size="8" letter-spacing="0.12em" fill="var(--color-teks-samar)">
        KOMPONEN PENDUKUNG
      </text>

      <!-- Shared ditautkan sebagai pustaka, bukan digambar sebagai proses kedelapan. -->
      <g :opacity="langkah < 2 ? 1 : 0.32" :style="{ transition: `opacity ${durasi} var(--ease-keluar)` }">
        <line
          v-for="simpul in simpulLayanan"
          :key="`shared-${simpul.id}`"
          :x1="simpul.x + LEBAR_SIMPUL / 2"
          :x2="simpul.x + LEBAR_SIMPUL / 2"
          :y1="simpul.y + TINGGI_SIMPUL"
          :y2="Y_SHARED"
          stroke="var(--color-garis-tegas)"
          stroke-width="1"
          stroke-dasharray="3 4"
        />
      </g>

      <g
        v-for="simpul in simpulLayanan"
        :key="simpul.id"
        :opacity="layananDisorot(simpul.id) ? 1 : 0.26"
        :style="{ transition: `opacity ${durasi} var(--ease-keluar)` }"
      >
        <rect
          :x="simpul.x"
          :y="simpul.y"
          :width="LEBAR_SIMPUL"
          :height="TINGGI_SIMPUL"
          rx="7"
          :fill="
            idLayananAktif.has(simpul.id)
              ? 'color-mix(in oklab, var(--color-sorot) 16%, var(--color-panel))'
              : 'var(--color-panel-naik)'
          "
          :stroke="simpul.peran === 'inti' ? 'var(--color-sorot)' : 'var(--color-garis-tegas)'"
          stroke-width="1.5"
          :stroke-dasharray="simpul.peran === 'pendukung' ? '4 3' : undefined"
        />
        <text
          :x="simpul.x + 10"
          :y="simpul.y + 22"
          font-size="9"
          fill="var(--color-teks)"
        >
          {{ simpul.nama }}
        </text>
        <text
          :x="simpul.x + 10"
          :y="simpul.y + 39"
          font-size="7"
          letter-spacing="0.08em"
          :fill="simpul.peran === 'inti' ? 'var(--color-sorot)' : 'var(--color-teks-samar)'"
        >
          {{ simpul.peran.toUpperCase() }}
        </text>
      </g>

      <g :opacity="langkah < 2 ? 1 : 0.32" :style="{ transition: `opacity ${durasi} var(--ease-keluar)` }">
        <rect
          x="34"
          :y="Y_SHARED"
          width="652"
          :height="TINGGI_SHARED"
          rx="7"
          fill="none"
          stroke="var(--color-teks-samar)"
          stroke-width="1.5"
          stroke-dasharray="5 4"
        />
        <text x="48" :y="Y_SHARED + 17" font-size="9" fill="var(--color-teks)">
          {{ modulBersama.nama }} · pustaka, bukan microservice
        </text>
        <text x="48" :y="Y_SHARED + 32" font-size="7" fill="var(--color-teks-samar)">
          {{ modulBersama.isi }}
        </text>
      </g>

      <!-- Jalur utama: garis solid = cepat; garis putus = pekerjaan lambat. -->
      <g
        :opacity="langkah >= 2 ? 1 : 0.16"
        :style="{ transition: `opacity ${durasi} var(--ease-keluar)` }"
      >
        <text x="34" y="304" font-size="8" letter-spacing="0.12em" fill="var(--color-teks-samar)">
          JALUR PERMINTAAN
        </text>
        <line
          v-for="(_, i) in titikJalur.slice(0, -1)"
          :key="`ruas-${i}`"
          :x1="indeksX(i) + 7"
          :x2="indeksX(i + 1) - 9"
          :y1="Y_JALUR"
          :y2="Y_JALUR"
          :stroke="ruasAktif(i) ? 'var(--color-sorot)' : 'var(--color-garis-tegas)'"
          :stroke-width="ruasAktif(i) ? 2.4 : 1.2"
          :stroke-dasharray="rincianJalur[i]?.beban === 'lambat' ? '5 4' : undefined"
          :marker-end="ruasAktif(i) ? 'url(#panah-arsitektur)' : undefined"
          :style="{ transition: `stroke ${durasi} var(--ease-keluar), stroke-width ${durasi} var(--ease-keluar)` }"
          :class="{
            'ruas-lambat-aktif':
              ruasAktif(i) && rincianJalur[i]?.beban === 'lambat' && !gerakDikurangi,
          }"
        />

        <g
          v-for="(titik, i) in titikJalur"
          :key="titik.id"
          :opacity="titikAktif(i) ? 1 : 0.45"
          :style="{ transition: `opacity ${durasi} var(--ease-keluar)` }"
        >
          <circle
            :cx="indeksX(i)"
            :cy="Y_JALUR"
            :r="titikAktif(i) ? 7 : 5"
            :fill="titikAktif(i) ? 'var(--color-sorot)' : 'var(--color-panel-naik)'"
            :stroke="titik.beban === 'lambat' ? 'var(--color-awas)' : 'var(--color-garis-tegas)'"
            stroke-width="1.5"
          />
          <text
            :x="indeksX(i)"
            :y="i % 2 === 0 ? Y_JALUR - 17 : Y_JALUR + 23"
            font-size="7"
            text-anchor="middle"
            :fill="titikAktif(i) ? 'var(--color-teks)' : 'var(--color-teks-samar)'"
          >
            {{ titik.nama }}
          </text>
          <text
            :x="indeksX(i)"
            :y="i % 2 === 0 ? Y_JALUR - 7 : Y_JALUR + 33"
            font-size="6"
            text-anchor="middle"
            :fill="titik.beban === 'lambat' ? 'var(--color-awas)' : 'var(--color-teks-samar)'"
          >
            {{ titik.beban }}
          </text>
        </g>
      </g>

      <g transform="translate(34 408)">
        <line x1="0" x2="30" y1="0" y2="0" stroke="var(--color-sorot)" stroke-width="1.5" />
        <text x="38" y="3" font-size="7" fill="var(--color-teks-samar)">cepat · HTTP / lokal</text>
        <line x1="190" x2="220" y1="0" y2="0" stroke="var(--color-awas)" stroke-width="1.5" stroke-dasharray="5 4" />
        <text x="228" y="3" font-size="7" fill="var(--color-teks-samar)">lambat · eksternal / puluhan detik</text>
      </g>
    </svg>

    <div class="min-h-20 border-t border-garis pt-3">
      <div v-if="rincianAktif.length" class="grid gap-2 sm:grid-cols-2">
        <article
          v-for="rincian in rincianAktif"
          :key="rincian.id"
          class="rounded-kartu border border-garis bg-panel-naik px-3 py-2"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="label-teknis text-teks-redup">{{ rincian.dari }} → {{ rincian.ke }}</span>
            <span
              class="label-teknis"
              :class="rincian.beban === 'lambat' ? 'text-awas' : 'text-sorot'"
            >
              {{ rincian.beban }}
            </span>
          </div>
          <p class="mt-1 text-mikro leading-snug text-teks-samar">{{ rincian.keterangan }}</p>
          <p class="label-teknis mt-1">{{ rincian.sumber }}</p>
        </article>
      </div>
      <div v-else class="flex flex-wrap items-center gap-x-5 gap-y-1 text-mikro text-teks-samar">
        <span><strong class="text-sorot">garis utuh</strong> · kontribusi inti</span>
        <span><strong>garis putus</strong> · komponen pendukung / pustaka</span>
        <span>{{ angkaLayanan.tampil }} {{ angkaLayanan.satuan }} · {{ modulBersama.catatan }}</span>
      </div>
    </div>
  </figure>
</template>

<style scoped>
.ruas-lambat-aktif {
  stroke-dasharray: 7 5;
  animation: alir 620ms linear infinite;
}

@keyframes alir {
  to {
    stroke-dashoffset: -12;
  }
}
</style>
