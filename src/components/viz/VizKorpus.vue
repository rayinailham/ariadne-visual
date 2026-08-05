<script setup lang="ts">
import { computed, ref } from 'vue'
import type {
  Angka,
  Bersumber,
  ContohBarisKorpus,
  KelompokKorpus,
  NilaiKolomContoh,
  ParameterIndeks,
} from '@/data'

const props = defineProps<{
  langkah: number
  jumlahLangkah: number
  gerakDikurangi: boolean
  kelompok: KelompokKorpus[]
  angka: Angka[]
  kolomContoh: NilaiKolomContoh[]
  contoh: ContohBarisKorpus
  langkahIngest: Array<Bersumber & { id: string; judul: string; isi: string }>
  indeks: Bersumber & {
    pernyataan: string
    operatorKelas: string
    parameter: ParameterIndeks[]
  }
  label: Bersumber & {
    judulVisual: string
    akarKnowledge: string
    manifest: string
    tabel: string
    bukaBaris: string
    tutupBaris: string
    anatomiBaris: string
    nilaiTakDipublikasikan: string
    kandidatKonstruksi: string
    tetanggaTersimpan: string
  }
}>()

const barisTerbuka = ref(false)
const kolomAktif = ref('embedding')

const durasi = computed(() => (props.gerakDikurangi ? '0.001ms' : '240ms'))
const angkaDenganId = (id: string) => props.angka.find((item) => item.id === id)
const jumlahUnit = computed(() => angkaDenganId('korpus.unit'))
const jumlahSumber = computed(() => angkaDenganId('korpus.sumber-unik'))
const jumlahBerkas = computed(() => angkaDenganId('korpus.berkas'))
const dimensi = computed(() => angkaDenganId('korpus.dimensi-vektor'))
const norma = computed(() => angkaDenganId('korpus.norma-vektor'))
const parameter = (nama: string) => props.indeks.parameter.find((item) => item.nama === nama)
const m = computed(() => Number(parameter('m')?.nilai ?? 0))
const ef = computed(() => Number(parameter('ef_construction')?.nilai ?? 0))
const kolomTerpilih = computed(
  () => props.kolomContoh.find((kolom) => kolom.nama === kolomAktif.value) ?? props.kolomContoh[0],
)
const ingestAktif = computed(
  () => props.langkahIngest[Math.min(Math.max(props.langkah - 1, 0), props.langkahIngest.length - 1)],
)

const kandidat = computed(() =>
  Array.from({ length: ef.value }, (_, indeks) => {
    const lapisan = indeks % 3
    const posisi = Math.floor(indeks / 3)
    const jumlahLapisan = Math.ceil(ef.value / 3)
    const sudut = (posisi / Math.max(1, jumlahLapisan)) * Math.PI * 2 + lapisan * 0.12
    const radius = 28 + lapisan * 17
    return {
      indeks,
      x: 620 + Math.cos(sudut) * radius,
      y: 124 + Math.sin(sudut) * radius,
    }
  }),
)

const tetangga = computed(() => {
  if (m.value === 0 || kandidat.value.length === 0) return []
  const sela = Math.max(1, Math.floor(kandidat.value.length / m.value))
  return Array.from({ length: m.value }, (_, indeks) => kandidat.value[(indeks * sela) % kandidat.value.length])
})

const kelompokX = (indeks: number) => 38 + indeks * 132
const kelompokAktif = (indeks: number) => props.langkah >= 0 && indeks < props.kelompok.length
const buka = () => {
  barisTerbuka.value = !barisTerbuka.value
  if (barisTerbuka.value) kolomAktif.value = 'embedding'
}
const labelGambar = computed(
  () =>
    `${jumlahBerkas.value?.tampil} berkas menjadi ${jumlahUnit.value?.tampil} unit dari ${jumlahSumber.value?.tampil} sumber unik; ${props.kolomContoh.length} kolom; embedding ${dimensi.value?.tampil} dimensi; HNSW m ${parameter('m')?.nilai} dan ef_construction ${parameter('ef_construction')?.nilai}`,
)
</script>

<template>
  <figure class="relative flex h-full flex-col gap-3 p-4 md:p-5">
    <figcaption class="flex items-baseline justify-between gap-3">
      <span class="label-teknis">{{ label.judulVisual }}</span>
      <span class="label-teknis text-sorot">langkah {{ langkah + 1 }}/{{ jumlahLangkah }}</span>
    </figcaption>

    <svg
      class="min-h-0 w-full flex-1"
      viewBox="0 0 760 360"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      :aria-label="labelGambar"
    >
      <defs>
        <marker id="panah-korpus" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10z" fill="var(--color-sorot)" />
        </marker>
      </defs>

      <text x="34" y="18" font-size="8" letter-spacing="0.12em" fill="var(--color-teks-samar)">{{ label.akarKnowledge }}</text>
      <g
        v-for="(item, indeks) in kelompok"
        :key="item.id"
        :transform="`translate(${kelompokX(indeks)} 32)`"
        :opacity="kelompokAktif(indeks) ? 1 : 0.32"
        :style="{ transition: `opacity ${durasi} var(--ease-keluar)` }"
      >
        <path d="M0 8 H43 L51 15 H112 V72 H0 Z" fill="var(--color-panel-naik)" stroke="var(--color-garis-tegas)" stroke-width="1.2" />
        <text x="10" y="31" font-size="9" fill="var(--color-teks)">{{ item.direktori }}/</text>
        <text x="10" y="48" font-size="7" fill="var(--color-teks-samar)">{{ item.jumlahBerkas }} {{ jumlahBerkas?.satuan }}</text>
        <text x="10" y="61" font-size="12" fill="var(--color-sorot)">{{ item.jumlahUnit }}</text>
        <text x="31" y="61" font-size="7" fill="var(--color-teks-samar)">{{ jumlahUnit?.satuan }}</text>
      </g>

      <g transform="translate(565 32)">
        <rect width="158" height="72" rx="8" fill="var(--color-panel-naik)" stroke="var(--color-sorot)" stroke-width="1.2" />
        <text x="12" y="22" font-size="9" fill="var(--color-teks)">{{ label.manifest }}</text>
        <text x="12" y="45" font-size="17" fill="var(--color-sorot)">{{ jumlahUnit?.tampil }}</text>
        <text x="48" y="44" font-size="7" fill="var(--color-teks-samar)">{{ jumlahUnit?.satuan }}</text>
        <text x="12" y="61" font-size="8" fill="var(--color-teks-redup)">{{ jumlahSumber?.tampil }} {{ jumlahSumber?.satuan }} unik</text>
      </g>

      <path d="M38 116 H716" stroke="var(--color-garis-tegas)" stroke-width="1.2" />
      <text x="34" y="138" font-size="8" letter-spacing="0.12em" fill="var(--color-teks-samar)">{{ label.tabel }}</text>
      <g transform="translate(34 151)">
        <rect width="518" height="72" rx="8" fill="var(--color-panel-naik)" stroke="var(--color-garis-tegas)" />
        <g v-for="(kolom, indeks) in kolomContoh.slice(0, 8)" :key="kolom.nama" :transform="`translate(${12 + (indeks % 4) * 126} ${14 + Math.floor(indeks / 4) * 29})`">
          <rect width="112" height="21" rx="3" :fill="kolom.nama === 'embedding' ? 'color-mix(in oklab, var(--color-sorot) 18%, var(--color-panel))' : 'var(--color-panel)'" :stroke="kolom.nama === 'embedding' ? 'var(--color-sorot)' : 'var(--color-garis)'" />
          <text x="7" y="9" font-size="6.5" fill="var(--color-teks)">{{ kolom.nama }}</text>
          <text x="7" y="17" font-size="5.5" fill="var(--color-teks-samar)">{{ kolom.tipe }}</text>
        </g>
      </g>

      <g transform="translate(570 151)" :opacity="langkah >= 2 ? 1 : 0.34" :style="{ transition: `opacity ${durasi} var(--ease-keluar)` }">
        <rect width="153" height="72" rx="8" fill="var(--color-panel-naik)" stroke="var(--color-sorot)" />
        <text x="12" y="18" font-size="7" fill="var(--color-teks-samar)">{{ contoh.assessmentType }} · {{ contoh.domain }}</text>
        <text x="12" y="37" font-size="9" fill="var(--color-teks)">vector({{ dimensi?.tampil }})</text>
        <text x="12" y="54" font-size="14" fill="var(--color-awas)">null</text>
        <text x="44" y="54" font-size="5.4" fill="var(--color-teks-samar)">{{ label.nilaiTakDipublikasikan }}</text>
      </g>

      <g transform="translate(34 249)" :opacity="langkah >= 3 ? 1 : 0.3" :style="{ transition: `opacity ${durasi} var(--ease-keluar)` }">
        <g v-for="(item, indeks) in langkahIngest" :key="item.id" :transform="`translate(${indeks * 110} 0)`">
          <circle cx="12" cy="12" r="11" :fill="indeks <= Math.max(0, langkah - 1) ? 'var(--color-sorot)' : 'var(--color-panel-naik)'" stroke="var(--color-garis-tegas)" />
          <text x="12" y="15" font-size="7" text-anchor="middle" :fill="indeks <= Math.max(0, langkah - 1) ? 'var(--color-latar-dalam)' : 'var(--color-teks-samar)'">{{ indeks + 1 }}</text>
          <text x="0" y="37" font-size="6.5" fill="var(--color-teks)">{{ item.judul }}</text>
          <line v-if="indeks < langkahIngest.length - 1" x1="25" y1="12" x2="101" y2="12" stroke="var(--color-garis-tegas)" marker-end="url(#panah-korpus)" />
        </g>
        <text x="0" y="60" font-size="7" fill="var(--color-sorot)">{{ ingestAktif?.isi }}</text>
      </g>

      <g transform="translate(0 185)" :opacity="langkah >= 5 ? 1 : 0" :style="{ transition: `opacity ${durasi} var(--ease-keluar)` }">
        <rect x="562" y="50" width="166" height="114" rx="9" fill="var(--color-panel)" stroke="var(--color-sorot)" />
        <line v-for="titik in tetangga" :key="`garis-${titik.indeks}`" x1="620" y1="124" :x2="titik.x" :y2="titik.y" stroke="var(--color-sorot)" stroke-width="0.7" opacity="0.8" />
        <circle v-for="titik in kandidat" :key="titik.indeks" :cx="titik.x" :cy="titik.y" r="1.7" fill="var(--color-teks-samar)" />
        <circle cx="620" cy="124" r="6" fill="var(--color-sorot)" />
        <rect x="657" y="60" width="67" height="69" rx="5" fill="var(--color-panel)" opacity="0.94" />
        <text x="665" y="77" font-size="14" fill="var(--color-teks)">{{ parameter('ef_construction')?.nilai }}</text>
        <text x="665" y="88" font-size="5.8" fill="var(--color-teks-samar)">{{ label.kandidatKonstruksi }}</text>
        <text x="665" y="110" font-size="14" fill="var(--color-sorot)">{{ parameter('m')?.nilai }}</text>
        <text x="665" y="121" font-size="5.8" fill="var(--color-teks-samar)">{{ label.tetanggaTersimpan }}</text>
        <text x="575" y="154" font-size="5.5" fill="var(--color-teks-samar)">{{ indeks.operatorKelas }}</text>
      </g>
    </svg>

    <div class="grid gap-2 border-t border-garis pt-3 lg:grid-cols-[1.1fr_1fr]">
      <section class="min-w-0 rounded-kartu border border-garis bg-panel-naik p-3">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="label-teknis text-teks-redup">{{ label.anatomiBaris }}</p>
            <p class="mt-1 truncate text-mikro text-teks-samar">{{ contoh.title }}</p>
          </div>
          <button type="button" class="label-teknis shrink-0 rounded-hairline border border-garis px-2 py-1 text-sorot active:scale-[0.97]" @click="buka">
            {{ barisTerbuka ? label.tutupBaris : label.bukaBaris }}
          </button>
        </div>
        <p class="label-teknis mt-2">{{ contoh.sumber }}</p>
      </section>

      <section class="min-w-0 rounded-kartu border border-garis bg-panel-naik p-3">
        <div class="flex items-center justify-between gap-2">
          <p class="label-teknis text-teks-redup">{{ ingestAktif?.judul }}</p>
          <p class="label-teknis text-sorot">‖v‖₂ {{ norma?.tampil }}</p>
        </div>
        <p class="mt-2 text-mikro leading-snug text-teks-samar">{{ ingestAktif?.isi }}</p>
        <p class="label-teknis mt-1">{{ ingestAktif?.sumber }}</p>
      </section>
    </div>

    <section v-if="barisTerbuka" class="absolute inset-3 z-10 flex flex-col overflow-hidden rounded-panel border border-sorot bg-panel shadow-2xl" aria-live="polite">
      <header class="flex items-center justify-between border-b border-garis px-4 py-3">
        <div>
          <p class="label-teknis text-sorot">{{ label.tabel }}</p>
          <p class="mt-1 text-kecil text-teks">{{ contoh.title }}</p>
        </div>
        <button type="button" class="label-teknis rounded-hairline border border-garis px-2 py-1 active:scale-[0.97]" @click="buka">{{ label.tutupBaris }}</button>
      </header>
      <div class="grid min-h-0 flex-1 md:grid-cols-[13rem_1fr]">
        <div class="overflow-y-auto border-r border-garis p-2">
          <button
            v-for="kolom in kolomContoh"
            :key="kolom.nama"
            type="button"
            class="flex w-full items-center justify-between gap-2 rounded-hairline px-2 py-1.5 text-left font-mono text-mikro active:scale-[0.99]"
            :class="kolomAktif === kolom.nama ? 'bg-sorot/12 text-sorot' : 'text-teks-samar hover:text-teks'"
            @click="kolomAktif = kolom.nama"
          >
            <span>{{ kolom.nama }}</span><span class="text-[0.6rem]">{{ kolom.tipe }}</span>
          </button>
        </div>
        <article v-if="kolomTerpilih" class="min-w-0 overflow-y-auto p-4">
          <p class="label-teknis text-sorot">{{ kolomTerpilih.nama }} · {{ kolomTerpilih.tipe }}</p>
          <p class="mt-3 break-words font-mono text-kecil leading-relaxed text-teks">{{ kolomTerpilih.nilai }}</p>
          <p class="mt-4 text-mikro leading-relaxed text-teks-redup">{{ kolomTerpilih.arti }}</p>
          <p class="label-teknis mt-4 break-all whitespace-normal">{{ kolomTerpilih.sumber }}</p>
        </article>
      </div>
    </section>
  </figure>
</template>
