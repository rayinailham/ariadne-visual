<script setup lang="ts">
import { computed } from 'vue'
import type { Angka, Butir, Instrumen } from '@/data'

/**
 * Adegan S02: 200 butir menjadi 35 skor domain, lalu PMAI sebagai lapisan.
 *
 * Tata letaknya dihitung dari data, bukan digambar dengan angka tetap:
 * lebar tiap blok sebanding dengan jumlah butir instrumennya, jumlah kotak
 * pada satu kolom sama dengan jumlah butir domain itu, dan tinggi batang
 * dibaca dari skor profil. Satu kotak berarti satu butir; ukurannya sama
 * untuk ketiga instrumen supaya perbandingan jumlahnya jujur.
 */
const props = defineProps<{
  langkah: number
  jumlahLangkah: number
  gerakDikurangi: boolean
  instrumen: Instrumen[]
  /** Jumlah butir domain yang tidak seragam, dikunci pada nama domain. */
  butirTakSeragam: Array<{ domain: string; butir: number }>
  /** 35 skor domain profil terpilih, dikunci pada nama domain. */
  skor: Record<string, number>
  arketipe: string[]
  labelPmai: string
  angkaTotalButir: Angka
  angkaTotalSkor: Angka
  angkaSkala: Angka
  angkaBatasBawah: Angka
  angkaBatasAtas: Angka
  angkaArketipe: Angka
  catatanProfil: Butir
  namaProfil: string
  daftarProfil: Array<{ id: string; nama: string }>
}>()

const emit = defineEmits<{ pilihProfil: [id: string] }>()

/* ---------- ukuran bidang gambar ---------- */
const LEBAR = 420
const TINGGI = 288
const MARGIN = 26
const JARAK_BLOK = 10
const KOTAK = 3.2
const SELA = 1.2
const PITCH = KOTAK + SELA
const DASAR_KOTAK = 46
const Y_LABEL = 14
const Y_SKALA = 62
const Y_HUBUNG_ATAS = 52
const DASAR_BATANG = 208
const TINGGI_BATANG = 88
const Y_PMAI_ATAS = 234
const Y_PMAI_BAWAH = 280
const KOLOM_PMAI = 4

const durasi = computed(() => (props.gerakDikurangi ? '0.001s' : '0.42s'))
const tampilSkala = computed(() => props.langkah >= 1)
const tampilBatang = computed(() => props.langkah >= 2)
const tampilSumbu = computed(() => props.langkah >= 3)
const tampilPmai = computed(() => props.langkah >= 4)

/** Skala maksimum sumbu tegak diambil dari batas atas skor pada lapisan data. */
const batasAtas = computed(() => props.angkaBatasAtas.nilai ?? 0)
const y = (nilai: number) =>
  batasAtas.value > 0 ? DASAR_BATANG - (nilai / batasAtas.value) * TINGGI_BATANG : DASAR_BATANG

const jumlahButirDomain = (inst: Instrumen, domain: string) => {
  if (inst.butirPerDomain !== null) return inst.butirPerDomain
  return props.butirTakSeragam.find((b) => b.domain === domain)?.butir ?? 0
}

interface Kotak {
  x: number
  y: number
}

interface Domain {
  nama: string
  pusat: number
  butir: number
  skor: number
  lebarBatang: number
  kotak: Kotak[]
  /** Nomor urut lintas seluruh instrumen; dipakai untuk penundaan bertahap. */
  urut: number
}

interface Blok {
  inst: Instrumen
  x: number
  lebar: number
  domain: Domain[]
  /** Domain berskor tertinggi pada blok ini; dianotasi saat sumbu tampil. */
  puncak: Domain | null
}

const blok = computed<Blok[]>(() => {
  const totalButir = props.instrumen.reduce((jml, i) => jml + i.jumlahButir, 0)
  const lebarIsi =
    LEBAR - 2 * MARGIN - JARAK_BLOK * Math.max(0, props.instrumen.length - 1)

  let x = MARGIN
  let urut = 0

  return props.instrumen.map((inst) => {
    const lebar = totalButir > 0 ? (lebarIsi * inst.jumlahButir) / totalButir : 0
    const pitchDomain = inst.jumlahDomain > 0 ? lebar / inst.jumlahDomain : 0
    const kolom = Math.max(1, Math.floor(pitchDomain / PITCH))
    const lebarBatang = Math.max(2.4, pitchDomain - 2.6)

    const domain: Domain[] = inst.domain.map((nama, j) => {
      const pusat = x + (j + 0.5) * pitchDomain
      const butir = jumlahButirDomain(inst, nama)
      const baris = Math.ceil(butir / kolom)
      const lebarGrid = kolom * PITCH - SELA
      const x0 = pusat - lebarGrid / 2
      const y0 = DASAR_KOTAK - (baris * PITCH - SELA)

      const kotak: Kotak[] = Array.from({ length: butir }, (_, k) => ({
        x: x0 + (k % kolom) * PITCH,
        y: y0 + Math.floor(k / kolom) * PITCH,
      }))

      return {
        nama,
        pusat,
        butir,
        skor: props.skor[nama] ?? 0,
        lebarBatang,
        kotak,
        urut: urut++,
      }
    })

    const puncak = domain.reduce<Domain | null>(
      (teratas, d) => (teratas === null || d.skor > teratas.skor ? d : teratas),
      null,
    )

    const hasil: Blok = { inst, x, lebar, domain, puncak }
    x += lebar + JARAK_BLOK
    return hasil
  })
})

/** Satu warna sorot, tiga tingkat kepekatan, satu tingkat per instrumen. */
const pekat = (i: number) => Math.max(0.42, 0.92 - i * 0.25)

const gaya = (indeks: number) => ({
  transition: `transform ${durasi.value} var(--ease-keluar)`,
  transitionDelay: props.gerakDikurangi ? '0ms' : `${indeks * 8}ms`,
})

const gayaPudar = computed(() => ({
  transition: `opacity ${durasi.value} var(--ease-keluar)`,
}))

const pusatBlok = (b: Blok) => b.x + b.lebar / 2

const petakPmai = computed(() => {
  const lebarBand = LEBAR - 2 * MARGIN + 12
  const kiri = MARGIN - 6
  const lebarPetak = lebarBand / KOLOM_PMAI
  return props.arketipe.map((nama, i) => ({
    nama,
    x: kiri + (i % KOLOM_PMAI) * lebarPetak + 6,
    y: Y_PMAI_ATAS + 24 + Math.floor(i / KOLOM_PMAI) * 9,
  }))
})

const keterangan = computed(() => {
  if (!tampilBatang.value) return `${props.angkaTotalButir.tampil} butir jawaban`
  if (!tampilPmai.value)
    return `${props.angkaTotalButir.tampil} butir menjadi ${props.angkaTotalSkor.tampil} skor domain profil ${props.namaProfil}`
  return `${props.angkaTotalSkor.tampil} skor domain dengan ${props.labelPmai}`
})
</script>

<template>
  <figure class="flex h-full flex-col gap-2 p-4 md:p-5">
    <figcaption class="flex items-baseline justify-between gap-3">
      <span class="label-teknis">Butir dan skor domain</span>
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
      <g v-for="(b, i) in blok" :key="b.inst.id">
        <!-- nama instrumen dan jumlah butirnya -->
        <text
          :x="b.x"
          :y="Y_LABEL"
          font-size="7"
          letter-spacing="0.08em"
          fill="var(--color-teks-samar)"
        >
          {{ b.inst.nama.toUpperCase() }} · {{ b.inst.jumlahButir }}
          {{ angkaTotalButir.satuan }}
        </text>

        <!-- satu kotak = satu butir, dikelompokkan menurut domainnya -->
        <g v-for="d in b.domain" :key="`butir-${d.nama}`">
          <rect
            v-for="(k, ki) in d.kotak"
            :key="ki"
            :x="k.x"
            :y="k.y"
            :width="KOTAK"
            :height="KOTAK"
            fill="var(--color-sorot)"
            :fill-opacity="pekat(i)"
          />
        </g>

        <!-- garis penyalur: satu kelompok butir menuju tepat satu batang -->
        <line
          v-for="d in b.domain"
          :key="`salur-${d.nama}`"
          :x1="d.pusat"
          :x2="d.pusat"
          :y1="Y_HUBUNG_ATAS"
          :y2="DASAR_BATANG"
          stroke="var(--color-garis-tegas)"
          stroke-width="0.4"
          :opacity="tampilBatang ? 1 : 0"
          :style="gayaPudar"
        />

        <!-- batang skor domain -->
        <g v-for="d in b.domain" :key="`batang-${d.nama}`">
          <rect
            class="batang"
            :x="d.pusat - d.lebarBatang / 2"
            :y="DASAR_BATANG - TINGGI_BATANG"
            :width="d.lebarBatang"
            :height="TINGGI_BATANG"
            fill="var(--color-sorot)"
            :fill-opacity="pekat(i)"
            :style="{
              ...gaya(d.urut),
              transform: `scaleY(${tampilBatang ? d.skor / batasAtas : 0})`,
            }"
          />
        </g>

        <!-- jumlah domain per instrumen -->
        <text
          :x="b.x"
          :y="DASAR_BATANG + 10"
          font-size="7"
          letter-spacing="0.08em"
          fill="var(--color-teks-samar)"
        >
          {{ b.inst.jumlahDomain }} {{ angkaTotalSkor.satuan }}
        </text>

        <!-- domain tertinggi blok ini, dianotasi apa adanya dari profil -->
        <text
          v-if="b.puncak"
          :x="b.puncak.pusat"
          :y="y(b.puncak.skor) - 4"
          font-size="6.5"
          text-anchor="middle"
          fill="var(--color-teks)"
          :opacity="tampilSumbu ? 1 : 0"
          :style="gayaPudar"
        >
          {{ b.puncak.nama }} {{ b.puncak.skor }}
        </text>

        <!-- penyalur putus-putus menuju lapisan sintesis -->
        <line
          :x1="pusatBlok(b)"
          :x2="pusatBlok(b)"
          :y1="DASAR_BATANG + 14"
          :y2="Y_PMAI_ATAS"
          stroke="var(--color-sorot)"
          stroke-width="0.6"
          stroke-dasharray="2 2"
          :opacity="tampilPmai ? 0.8 : 0"
          :style="gayaPudar"
        />
      </g>

      <!-- skala jawaban tiap butir; dialasi agar garis penyalur tidak menembusnya -->
      <g :opacity="tampilSkala ? 1 : 0" :style="gayaPudar">
        <rect
          :x="MARGIN - 4"
          :y="Y_SKALA - 7"
          :width="LEBAR - 2 * MARGIN + 8"
          :height="11"
          fill="var(--color-panel)"
        />
        <g v-for="n in angkaSkala.nilai ?? 0" :key="`skala-${n}`">
          <rect
            :x="MARGIN + (n - 1) * 7"
            :y="Y_SKALA - 4"
            :width="4.4"
            :height="4.4"
            fill="var(--color-sorot)"
            :fill-opacity="0.2 + (n - 1) * 0.18"
          />
        </g>
        <text
          :x="MARGIN + (angkaSkala.nilai ?? 0) * 7 + 4"
          :y="Y_SKALA"
          font-size="6.5"
          fill="var(--color-teks-samar)"
        >
          {{ angkaSkala.label }} {{ angkaSkala.tampil }}
        </text>
      </g>

      <!-- sumbu skor: batas bawah dan batas atas rentang teoretis -->
      <g :opacity="tampilSumbu ? 1 : 0" :style="gayaPudar">
        <g v-for="batas in [angkaBatasAtas, angkaBatasBawah]" :key="batas.id">
          <line
            :x1="MARGIN - 4"
            :x2="LEBAR - MARGIN"
            :y1="y(batas.nilai ?? 0)"
            :y2="y(batas.nilai ?? 0)"
            stroke="var(--color-garis-tegas)"
            stroke-width="0.5"
            stroke-dasharray="3 3"
          />
          <text
            :x="MARGIN - 7"
            :y="y(batas.nilai ?? 0) + 2.4"
            font-size="6.5"
            text-anchor="end"
            fill="var(--color-teks-samar)"
          >
            {{ batas.tampil }}
          </text>
        </g>
      </g>

      <!-- garis dasar batang -->
      <line
        :x1="MARGIN - 4"
        :x2="LEBAR - MARGIN"
        :y1="DASAR_BATANG"
        :y2="DASAR_BATANG"
        stroke="var(--color-garis-tegas)"
        stroke-width="0.7"
      />

      <!-- lapisan sintesis: dibingkai putus-putus, membentang di atas ketiga blok -->
      <g :opacity="tampilPmai ? 1 : 0" :style="gayaPudar">
        <rect
          :x="MARGIN - 6"
          :y="Y_PMAI_ATAS"
          :width="LEBAR - 2 * MARGIN + 12"
          :height="Y_PMAI_BAWAH - Y_PMAI_ATAS"
          fill="none"
          stroke="var(--color-sorot)"
          stroke-width="0.6"
          stroke-dasharray="3 3"
          rx="3"
        />
        <text
          :x="MARGIN"
          :y="Y_PMAI_ATAS + 12"
          font-size="7"
          letter-spacing="0.06em"
          fill="var(--color-sorot)"
        >
          {{ labelPmai.toUpperCase() }} · {{ angkaArketipe.tampil }}
          {{ angkaArketipe.satuan }}
        </text>
        <text
          v-for="p in petakPmai"
          :key="p.nama"
          :x="p.x"
          :y="p.y"
          font-size="6"
          fill="var(--color-teks-redup)"
        >
          {{ p.nama }}
        </text>
      </g>
    </svg>

    <div class="flex flex-col gap-2 border-t border-garis pt-3">
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="label-teknis mr-1">{{ catatanProfil.judul }}</span>
        <button
          v-for="p in daftarProfil"
          :key="p.id"
          type="button"
          class="rounded-hairline border px-2 py-0.5 font-antarmuka text-mikro transition-colors duration-[var(--durasi-cepat)] ease-keluar"
          :class="
            p.nama === namaProfil
              ? 'border-sorot text-sorot'
              : 'border-garis-tegas text-teks-samar hover:text-teks-redup'
          "
          :aria-pressed="p.nama === namaProfil"
          @click="emit('pilihProfil', p.id)"
        >
          {{ p.nama }}
        </button>
      </div>
      <p class="text-mikro leading-snug text-teks-samar">
        {{ catatanProfil.isi }}
        <span class="label-teknis ml-1">{{ catatanProfil.sumber }}</span>
      </p>
    </div>
  </figure>
</template>

<style scoped>
/* Batang tumbuh dari garis dasarnya, bukan dari titik tengah bidang gambar. */
.batang {
  transform-box: fill-box;
  transform-origin: bottom;
}
</style>
