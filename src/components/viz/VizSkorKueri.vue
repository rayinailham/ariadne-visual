<script setup lang="ts">
import { computed, ref } from 'vue'
import type {
  AmbangSeleksi,
  Angka,
  AturanLabel,
  BarisKalibrasiAmbang,
  Bersumber,
  KueriBertema,
  ProfilSintetis,
} from '@/data'

const props = defineProps<{
  langkah: number
  jumlahLangkah: number
  gerakDikurangi: boolean
  profil: ProfilSintetis
  angka: Angka[]
  ambang: AmbangSeleksi
  ambangRuntime: AmbangSeleksi
  ambangHarness: AmbangSeleksi
  kandidatVia: number[]
  kalibrasi: BarisKalibrasiAmbang[]
  aturanLabel: AturanLabel[]
  contoh: Bersumber & { domain: string; skor: number; label: string; teks: string }
  kueri: KueriBertema[]
  label: Bersumber & {
    judulVisual: string
    profil: string
    namaKelompok: { riasec: string; ocean: string; via_is: string }
    skorMasuk: string
    domainLolos: string
    ambangVia: string
    komposisiLimaProfil: string
    dominasi: string
    seimbang: string
    teksKueri: string
    peringatanAmbang: string
    deviasiRuntime: string
  }
}>()

type KelompokId = 'riasec' | 'ocean' | 'via_is'
type SkorDomain = { kelompok: KelompokId; domain: string; skor: number; x: number }

const indeksAmbangVia = ref(props.kandidatVia.indexOf(props.ambang.via))
const kueriAktif = ref(props.kueri[0]?.id ?? '')
const nilaiAmbangVia = computed(() => props.kandidatVia[indeksAmbangVia.value] ?? props.ambang.via)
const ambangKelompok = computed<Record<KelompokId, number>>(() => ({
  riasec: props.ambang.riasec,
  ocean: props.ambang.ocean,
  via_is: nilaiAmbangVia.value,
}))

const kelompok = computed(() => [
  { id: 'riasec' as const, nama: props.label.namaKelompok.riasec, skor: props.profil.riasec, x: 24, lebar: 128 },
  { id: 'ocean' as const, nama: props.label.namaKelompok.ocean, skor: props.profil.ocean, x: 174, lebar: 108 },
  { id: 'via_is' as const, nama: props.label.namaKelompok.via_is, skor: props.profil.via, x: 304, lebar: 432 },
])

const skorDomain = computed<SkorDomain[]>(() =>
  kelompok.value.flatMap((grup) => {
    const entri = Object.entries(grup.skor)
    const sela = grup.lebar / entri.length
    return entri.map(([domain, skor], indeks) => ({
      kelompok: grup.id,
      domain,
      skor,
      x: grup.x + indeks * sela + sela / 2,
    }))
  }),
)

const terpilih = computed(() =>
  Object.fromEntries(
    kelompok.value.map((grup) => [
      grup.id,
      Object.entries(grup.skor).filter(([, skor]) => skor >= ambangKelompok.value[grup.id]),
    ]),
  ) as Record<KelompokId, Array<[string, number]>>,
)

const jumlahLolos = computed(() => ({
  riasec: terpilih.value.riasec.length,
  ocean: terpilih.value.ocean.length,
  via_is: terpilih.value.via_is.length,
}))
const didominasi = computed(
  () => jumlahLolos.value.via_is > jumlahLolos.value.riasec + jumlahLolos.value.ocean,
)
const kalibrasiAktif = computed(
  () =>
    props.kalibrasi.find(
      (baris) =>
        baris.riasec === props.ambang.riasec &&
        baris.ocean === props.ambang.ocean &&
        baris.via === nilaiAmbangVia.value,
    ) ?? props.kalibrasi[0]!,
)

const level = (skor: number) =>
  skor >= (props.aturanLabel.find((item) => item.label === 'high')?.batasBawah ?? Infinity)
    ? 'high'
    : skor < (props.aturanLabel.find((item) => item.label === 'low')?.batasAtas ?? -Infinity)
      ? 'low'
      : 'moderate'
const potongan = (kerangka: string, domain: string, skor: number) =>
  `${kerangka} ${domain.toLowerCase()} (${level(skor)})`
const gabunganDomain = computed(() => [
  ...terpilih.value.riasec,
  ...terpilih.value.ocean,
  ...terpilih.value.via_is,
])
const teksKueri = computed(() =>
  Object.fromEntries(
    props.kueri.map((item) => {
      const domain =
        item.id === 'riasec'
          ? terpilih.value.riasec
          : item.id === 'ocean'
            ? terpilih.value.ocean
            : item.id === 'via_is'
              ? terpilih.value.via_is
              : gabunganDomain.value
      const bagian = domain.map(([nama, skor]) => potongan(item.kerangka, nama, skor)).sort()
      return [item.id, [item.konteks, ...bagian].join('. ')]
    }),
  ) as Record<string, string>,
)
const kueriTerpilih = computed(() => props.kueri.find((item) => item.id === kueriAktif.value) ?? props.kueri[0]!)

const ySkor = (skor: number) => 150 - skor * 0.9
const dipilih = (item: SkorDomain) => item.skor >= ambangKelompok.value[item.kelompok]
const durasi = computed(() => (props.gerakDikurangi ? '0.001ms' : '220ms'))
const jumlahSkor = computed(() => props.angka.find((item) => item.id === 'instrumen.total-skor-domain'))
const jumlahKueri = computed(() => props.angka.find((item) => item.id === 'rag.jumlah-kueri'))
const jumlahProfil = computed(
  () => props.angka.find((item) => item.id === 'rag.profil-terdominasi-terpilih')?.penyebut,
)
const labelGambar = computed(
  () =>
    `${jumlahSkor.value?.tampil} skor domain profil ${props.profil.nama}; ambang RIASEC ${props.ambang.riasec}, OCEAN ${props.ambang.ocean}, VIA-IS ${nilaiAmbangVia.value}; lolos ${jumlahLolos.value.riasec} RIASEC, ${jumlahLolos.value.ocean} OCEAN, ${jumlahLolos.value.via_is} VIA-IS; ${didominasi.value ? props.label.dominasi : props.label.seimbang}; ${jumlahKueri.value?.tampil} kueri bertema`,
)
</script>

<template>
  <figure class="relative flex h-full min-h-0 flex-col gap-3 p-4 md:p-5">
    <figcaption class="flex items-baseline justify-between gap-3">
      <span class="label-teknis">{{ label.judulVisual }}</span>
      <span class="label-teknis text-sorot">langkah {{ langkah + 1 }}/{{ jumlahLangkah }}</span>
    </figcaption>

    <svg
      class="w-full shrink-0"
      viewBox="0 0 760 245"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      :aria-label="labelGambar"
    >
      <defs>
        <marker id="panah-kueri" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10z" fill="var(--color-sorot)" />
        </marker>
      </defs>

      <text x="24" y="13" font-size="7" letter-spacing="0.12em" fill="var(--color-teks-samar)">
        {{ label.profil }} · {{ profil.nama }} · {{ jumlahSkor?.tampil }} {{ label.skorMasuk }}
      </text>
      <g v-for="grup in kelompok" :key="grup.id">
        <rect :x="grup.x" y="25" :width="grup.lebar" height="139" rx="7" fill="var(--color-panel-naik)" stroke="var(--color-garis-tegas)" />
        <text :x="grup.x + 7" y="39" font-size="7" fill="var(--color-teks)">{{ grup.nama }}</text>
        <text :x="grup.x + grup.lebar - 7" y="39" text-anchor="end" font-size="7" fill="var(--color-sorot)">
          {{ jumlahLolos[grup.id] }}/{{ Object.keys(grup.skor).length }}
        </text>
        <line
          :x1="grup.x + 5"
          :x2="grup.x + grup.lebar - 5"
          :y1="ySkor(ambangKelompok[grup.id])"
          :y2="ySkor(ambangKelompok[grup.id])"
          stroke="var(--color-awas)"
          stroke-width="1"
          stroke-dasharray="3 3"
        />
        <text :x="grup.x + grup.lebar - 7" :y="ySkor(ambangKelompok[grup.id]) - 3" text-anchor="end" font-size="5.5" fill="var(--color-awas)">
          ≥ {{ ambangKelompok[grup.id] }}
        </text>
      </g>

      <g v-for="item in skorDomain" :key="`${item.kelompok}-${item.domain}`">
        <line
          :x1="item.x"
          :x2="item.x"
          y1="151"
          :y2="ySkor(item.skor)"
          :stroke="dipilih(item) ? 'var(--color-sorot)' : 'var(--color-garis-tegas)'"
          :stroke-width="item.kelompok === 'via_is' ? 5 : 10"
          stroke-linecap="round"
          :style="{ transition: `stroke ${durasi} var(--ease-keluar)` }"
        />
      </g>

      <g transform="translate(24 181)" :opacity="langkah >= 2 ? 1 : 0.32" :style="{ transition: `opacity ${durasi} var(--ease-keluar)` }">
        <rect width="270" height="48" rx="7" fill="var(--color-panel-naik)" stroke="var(--color-garis-tegas)" />
        <text x="11" y="15" font-size="6" fill="var(--color-teks-samar)">{{ contoh.domain }} · {{ contoh.skor }} → {{ contoh.label }}</text>
        <text x="11" y="33" font-size="7.5" fill="var(--color-sorot)">{{ contoh.teks }}</text>
      </g>

      <path d="M306 205 H345" stroke="var(--color-sorot)" marker-end="url(#panah-kueri)" :opacity="langkah >= 3 ? 1 : 0.25" />
      <g transform="translate(356 181)" :opacity="langkah >= 3 ? 1 : 0.3" :style="{ transition: `opacity ${durasi} var(--ease-keluar)` }">
        <g v-for="(item, indeks) in kueri" :key="item.id" :transform="`translate(${indeks * 77} 0)`">
          <rect width="69" height="48" rx="7" fill="var(--color-panel-naik)" stroke="var(--color-sorot)" />
          <text x="34.5" y="21" text-anchor="middle" font-size="6.5" fill="var(--color-teks)">{{ item.nama }}</text>
          <text x="34.5" y="35" text-anchor="middle" font-size="5.5" fill="var(--color-teks-samar)">{{ item.assessmentType }}</text>
        </g>
      </g>
    </svg>

    <section class="grid min-h-0 flex-1 gap-3 border-t border-garis pt-3 lg:grid-cols-[0.82fr_1.18fr]">
      <div class="flex min-h-0 flex-col gap-2 rounded-kartu border border-garis bg-panel-naik p-3">
        <div class="flex items-center justify-between gap-3">
          <label for="ambang-via" class="label-teknis text-teks-redup">{{ label.ambangVia }}</label>
          <output for="ambang-via" class="font-mono text-sorotan text-sorot">{{ nilaiAmbangVia }}</output>
        </div>
        <input
          id="ambang-via"
          v-model.number="indeksAmbangVia"
          type="range"
          :min="0"
          :max="kandidatVia.length - 1"
          :step="1"
          :aria-valuetext="`${nilaiAmbangVia}`"
          class="w-full accent-sorot"
        />
        <div class="flex justify-between font-mono text-[0.6rem] text-teks-samar" aria-hidden="true">
          <span v-for="nilai in kandidatVia" :key="nilai">{{ nilai }}</span>
        </div>

        <div class="mt-1 grid grid-cols-3 gap-1.5" :aria-label="label.komposisiLimaProfil">
          <div v-for="item in [
            [label.namaKelompok.riasec, kalibrasiAktif.domainRiasec],
            [label.namaKelompok.ocean, kalibrasiAktif.domainOcean],
            [label.namaKelompok.via_is, kalibrasiAktif.domainVia],
          ]" :key="String(item[0])" class="rounded-hairline border border-garis bg-panel px-2 py-1.5 text-center">
            <p class="font-mono text-kecil text-teks">{{ item[1] }}</p>
            <p class="text-[0.58rem] text-teks-samar">{{ item[0] }}</p>
          </div>
        </div>
        <p class="text-mikro leading-snug" :class="kalibrasiAktif.profilTerdominasi ? 'text-awas' : 'text-benar'">
          {{ kalibrasiAktif.profilTerdominasi }}/{{ jumlahProfil }} profil terdominasi ·
          {{ didominasi ? label.dominasi : label.seimbang }} pada profil {{ profil.nama }}.
        </p>
        <p v-if="langkah >= 5" class="border-t border-garis pt-2 text-[0.65rem] leading-snug text-teks-samar">
          {{ label.deviasiRuntime }}
        </p>
      </div>

      <div class="flex min-h-0 flex-col overflow-hidden rounded-kartu border border-garis bg-panel-naik p-3">
        <div class="flex flex-wrap gap-1 pb-2" role="tablist" :aria-label="`${jumlahKueri?.tampil} kueri bertema`">
          <button
            v-for="item in kueri"
            :key="item.id"
            type="button"
            role="tab"
            :aria-selected="kueriAktif === item.id"
            class="label-teknis shrink-0 rounded-hairline border px-2 py-1 transition-[transform,color,border-color] duration-150 active:scale-[0.97]"
            :class="kueriAktif === item.id ? 'border-sorot text-sorot' : 'border-garis text-teks-samar'"
            @click="kueriAktif = item.id"
          >
            {{ item.nama }}
          </button>
        </div>
        <p class="label-teknis text-teks-redup">{{ label.teksKueri }}</p>
        <code class="mt-2 min-h-0 flex-1 overflow-y-auto text-[0.68rem] leading-relaxed text-teks">{{ teksKueri[kueriTerpilih.id] }}</code>
        <p class="label-teknis mt-2 break-all whitespace-normal">{{ kueriTerpilih.sumber }}</p>
      </div>
    </section>

    <p class="rounded-hairline border border-awas/45 bg-awas/8 px-3 py-1.5 text-center text-mikro font-semibold text-awas">
      {{ label.peringatanAmbang }}
    </p>
  </figure>
</template>
