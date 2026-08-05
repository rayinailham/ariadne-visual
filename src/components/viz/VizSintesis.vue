<script setup lang="ts">
import { computed, ref } from 'vue'
import type {
  Angka,
  Bersumber,
  Butir,
  KelasPelanggaran,
  PemicuCadangan,
  ReferensiTerinjeksi,
  UnitKlaimContoh,
} from '@/data'

const props = defineProps<{
  langkah: number
  jumlahLangkah: number
  gerakDikurangi: boolean
  angka: Angka[]
  blok: Array<{ id: string; nama: string; keterangan: string; opsional?: boolean; referensi?: boolean }>
  skema: Bersumber & {
    mime: string
    identitasMin: number
    identitasMaks: number
    identitasTanpaReferensi: number
    panjangMaksLabel: number
    unitKlaim: number
    sumberKode: string
  }
  arketipe: string[]
  kelas: KelasPelanggaran[]
  labelGanda: Butir
  gerbang: Array<Bersumber & { id: string; judul: string; isi: string }>
  percobaan: Bersumber & {
    maksPercobaanUlang: number
    totalPemanggilan: number
    rumusJeda: string
    jeda: Array<{ percobaan: number; minDetik: number; maksDetik: number }>
    sumberKode: string
  }
  referensi: ReferensiTerinjeksi[]
  unitKlaim: UnitKlaimContoh[]
  pemicu: PemicuCadangan[]
  cadangan: Bersumber & { batasMuat: number; dasarSkor: string[]; batasPembacaan: string; sumberKode: string }
  skorCadangan: Bersumber & {
    komponen: Array<{ id: string; syarat: string; bobot: string }>
    urutanMuat: string
  }
  pemaparan: Array<Bersumber & { id: string; nama: string; isi: string }>
  relasi: Array<Bersumber & { tabel: string; isi: string }>
  label: Bersumber & {
    judulVisual: string
    prompt: string
    blokReferensi: string
    blokInstruksi: string
    model: string
    skema: string
    gerbang: string
    terima: string
    tolak: string
    persist: string
    papar: string
    buatUlang: string
    unitKlaim: string
    identitas: string
    jalur: string
    jalurVektor: string
    jalurCadangan: string
    kondisiReferensi: string
    denganReferensi: string
    tanpaReferensi: string
    picu: string
    patuh: string
    labelGanda: string
    percobaan: string
    gagalTotal: string
    keterlacakan: string
    dokumen: string
    bukanPelanggaran: string
    batasJaminan: string
  }
}>()

// ---------------------------------------------------------------------------
// Keadaan yang dikendalikan penonton
// ---------------------------------------------------------------------------

type Skenario = 'patuh' | 'label-ganda' | string

const jalurAktif = ref('vektor')
const adaReferensi = ref(true)
const skenario = ref<Skenario>('patuh')
const percobaanKe = ref(1)

const memakaiCadangan = computed(() => jalurAktif.value !== 'vektor')
const pemicuAktif = computed(() => props.pemicu.find((item) => item.id === jalurAktif.value))

/** Himpunan label sah dibangkitkan ulang dari jumlah referensi yang diinjeksikan. */
const labelSah = computed(() =>
  adaReferensi.value ? props.referensi.map((item) => item.label) : [],
)

function pilihJalur(id: string) {
  jalurAktif.value = id
}

function pilihReferensi(ada: boolean) {
  adaReferensi.value = ada
  const kelas = props.kelas.find((item) => item.id === skenario.value)
  // Kelas yang tidak dapat terjadi pada kondisi ini dikembalikan ke keluaran patuh.
  if (kelas && kelas.kondisi !== 'keduanya' && kelas.kondisi !== (ada ? 'dengan-referensi' : 'tanpa-referensi')) {
    skenario.value = 'patuh'
  }
  percobaanKe.value = 1
}

function pilihSkenario(id: Skenario) {
  const kelas = props.kelas.find((item) => item.id === id)
  // Kelas 4 hanya dapat terjadi tanpa blok referensi, kelas 1–3 hanya dengan.
  if (kelas && kelas.kondisi !== 'keduanya') {
    adaReferensi.value = kelas.kondisi === 'dengan-referensi'
  }
  if (id === 'label-ganda') adaReferensi.value = true

  if (id === skenario.value) {
    // Menekan tombol yang sama berarti percobaan berikutnya atas keadaan yang sama.
    if (ditolak.value) {
      percobaanKe.value = Math.min(percobaanKe.value + 1, props.percobaan.totalPemanggilan)
    }
    return
  }
  // Keluaran patuh setelah penolakan mempertahankan nomor percobaan, supaya
  // pemulihan terbaca sebagai "diterima pada percobaan ke-n".
  if (kelas) percobaanKe.value = 1
  skenario.value = id
}

// ---------------------------------------------------------------------------
// Simulasi keluaran model
//
// Bentuk keluaran mengikuti sembilan unit klaim pada penangkapan respons nyata.
// Satu unit dimutasi sesuai keadaan yang dipicu penonton; sisanya tetap.
// ---------------------------------------------------------------------------

const unitUji: Record<string, number> = {
  'tanpa-identitas': 0,
  'format-salah': 1,
  'di-luar-himpunan': 6,
  'identitas-tanpa-referensi': 0,
  'label-di-prosa': 0,
  'label-ganda': 3,
}

interface UnitSimulasi {
  claimPath: string
  claimIndex: number
  kelompok: string
  label: string[]
  prosaBocor: boolean
}

const unitSimulasi = computed<UnitSimulasi[]>(() =>
  props.unitKlaim.map((unit, indeks) => {
    const dasar: UnitSimulasi = {
      claimPath: unit.claimPath,
      claimIndex: unit.claimIndex,
      kelompok: unit.kelompok,
      label: adaReferensi.value ? [...unit.label] : [],
      prosaBocor: false,
    }
    if (unitUji[skenario.value] !== indeks) return dasar
    const kelas = props.kelas.find((item) => item.id === skenario.value)
    if (skenario.value === 'label-ganda') {
      dasar.label = [unit.label[0]!, unit.label[0]!]
      return dasar
    }
    if (!kelas) return dasar
    if (kelas.id === 'tanpa-identitas') dasar.label = []
    if (kelas.id === 'format-salah') dasar.label = ['REF-3']
    if (kelas.id === 'di-luar-himpunan') dasar.label = ['REF-11']
    if (kelas.id === 'identitas-tanpa-referensi') dasar.label = [props.referensi[0]!.label]
    if (kelas.id === 'label-di-prosa') dasar.prosaBocor = true
    return dasar
  }),
)

// ---------------------------------------------------------------------------
// Gerbang validasi — urutan pemeriksaan mengikuti validator pada kode
// ---------------------------------------------------------------------------

const polaLabel = /^REF-\d{2}$/

interface HasilGerbang {
  status: 'diterima' | 'ditolak'
  kelas?: KelasPelanggaran
  claimPath?: string
  labelPelanggar?: string
  dinormalisasi: number
}

const hasil = computed<HasilGerbang>(() => {
  let dinormalisasi = 0
  const sah = new Set(labelSah.value)
  for (const unit of unitSimulasi.value) {
    if (unit.prosaBocor) {
      return {
        status: 'ditolak',
        kelas: props.kelas.find((item) => item.id === 'label-di-prosa'),
        claimPath: unit.claimPath,
        labelPelanggar: 'Ref-02',
        dinormalisasi,
      }
    }
    if (sah.size === 0) {
      if (unit.label.length > 0) {
        return {
          status: 'ditolak',
          kelas: props.kelas.find((item) => item.id === 'identitas-tanpa-referensi'),
          claimPath: unit.claimPath,
          labelPelanggar: unit.label[0],
          dinormalisasi,
        }
      }
      continue
    }
    if (unit.label.length === 0) {
      return {
        status: 'ditolak',
        kelas: props.kelas.find((item) => item.id === 'tanpa-identitas'),
        claimPath: unit.claimPath,
        dinormalisasi,
      }
    }
    const terlihat = new Set<string>()
    for (const label of unit.label) {
      if (!polaLabel.test(label)) {
        return {
          status: 'ditolak',
          kelas: props.kelas.find((item) => item.id === 'format-salah'),
          claimPath: unit.claimPath,
          labelPelanggar: label,
          dinormalisasi,
        }
      }
      if (!sah.has(label)) {
        return {
          status: 'ditolak',
          kelas: props.kelas.find((item) => item.id === 'di-luar-himpunan'),
          claimPath: unit.claimPath,
          labelPelanggar: label,
          dinormalisasi,
        }
      }
      if (terlihat.has(label)) {
        dinormalisasi += 1
        continue
      }
      terlihat.add(label)
    }
  }
  return { status: 'diterima', dinormalisasi }
})

const ditolak = computed(() => hasil.value.status === 'ditolak')
const pekerjaanGagal = computed(
  () => ditolak.value && percobaanKe.value >= props.percobaan.totalPemanggilan,
)
const jedaBerikutnya = computed(() =>
  props.percobaan.jeda.find((item) => item.percobaan === percobaanKe.value + 1),
)

/** Keadaan satu label pada daftar unit klaim, untuk pewarnaan. */
function keadaanLabel(unit: UnitSimulasi, label: string, urut: number): 'sah' | 'gugur' | 'duplikat' {
  if (labelSah.value.length === 0) return 'gugur'
  if (!polaLabel.test(label) || !labelSah.value.includes(label)) return 'gugur'
  if (unit.label.indexOf(label) !== urut) return 'duplikat'
  return 'sah'
}

function dokumenUntukLabel(label: string): ReferensiTerinjeksi | undefined {
  return props.referensi.find((item) => item.label === label)
}

// ---------------------------------------------------------------------------
// Fokus adegan
// ---------------------------------------------------------------------------

const fokus = computed(() => {
  const peta = ['prompt', 'skema', 'gerbang', 'retry', 'cadangan', 'keterlacakan'] as const
  return peta[Math.min(props.langkah, peta.length - 1)]!
})
const redup = (aktif: boolean) => (aktif ? 1 : 0.34)
const durasi = computed(() => (props.gerakDikurangi ? '0.001ms' : '260ms'))
const transisi = computed(() => `opacity ${durasi.value} var(--ease-keluar)`)

const warnaGerbang = computed(() =>
  ditolak.value ? 'var(--color-salah)' : 'var(--color-benar)',
)

const angkaDengan = (id: string) => props.angka.find((item) => item.id === id)
const desimal = (nilai: number, digit: number) => nilai.toFixed(digit).replace('.', ',')

const labelGambar = computed(() => {
  const jalur = memakaiCadangan.value
    ? `${props.label.jalurCadangan} (${pemicuAktif.value?.isi ?? ''})`
    : props.label.jalurVektor
  const kondisi = adaReferensi.value
    ? `${props.referensi.length} ${props.label.identitas}`
    : props.label.tanpaReferensi
  const putusan = ditolak.value
    ? `${props.label.tolak}: ${hasil.value.kelas?.judul} pada ${hasil.value.claimPath}`
    : `${props.label.terima}; ${hasil.value.dinormalisasi} label dinormalisasi`
  return `${props.label.judulVisual}: jalur ${jalur}; blok referensi ${kondisi}; ${props.unitKlaim.length} unit klaim; gerbang validasi ${putusan}; ${props.label.percobaan} ${percobaanKe.value} dari ${props.percobaan.totalPemanggilan}`
})
</script>

<template>
  <figure class="relative flex h-full min-h-0 flex-col gap-2 p-4 md:p-5">
    <figcaption class="flex items-baseline justify-between gap-3">
      <span class="label-teknis">{{ label.judulVisual }}</span>
      <span class="label-teknis text-sorot">langkah {{ langkah + 1 }}/{{ jumlahLangkah }}</span>
    </figcaption>

    <svg
      class="w-full shrink-0"
      viewBox="0 0 560 128"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      :aria-label="labelGambar"
    >
      <defs>
        <marker id="panah-alir" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto">
          <path d="M0 0 L10 5 L0 10z" fill="var(--color-sorot)" />
        </marker>
        <marker id="panah-ulang" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto">
          <path d="M0 0 L10 5 L0 10z" fill="var(--color-salah)" />
        </marker>
      </defs>

      <!-- Retrieval: jalur vektor atau jalur cadangan deterministik -->
      <g :opacity="redup(fokus === 'cadangan' || fokus === 'prompt')" :style="{ transition: transisi }">
        <rect
          x="6"
          y="34"
          width="92"
          height="32"
          rx="3"
          fill="none"
          :stroke="memakaiCadangan ? 'var(--color-awas)' : 'var(--color-sorot)'"
          stroke-width="1"
        />
        <text x="52" y="47" font-size="7" text-anchor="middle" fill="var(--color-teks-redup)">
          {{ label.jalur }}
        </text>
        <text
          x="52"
          y="59"
          font-size="8"
          text-anchor="middle"
          font-family="var(--font-teknis)"
          :fill="memakaiCadangan ? 'var(--color-awas)' : 'var(--color-sorot)'"
        >
          {{ memakaiCadangan ? label.jalurCadangan : label.jalurVektor }}
        </text>
        <text v-if="memakaiCadangan" x="6" y="76" font-size="6" fill="var(--color-teks-samar)">
          ≤ {{ cadangan.batasMuat }} {{ label.dokumen }}
        </text>
      </g>

      <line x1="100" y1="50" x2="114" y2="50" stroke="var(--color-sorot)" stroke-width="1" marker-end="url(#panah-alir)" />

      <!-- Prompt: blok referensi berada sebelum blok instruksi -->
      <g :opacity="redup(fokus === 'prompt' || fokus === 'skema')" :style="{ transition: transisi }">
        <rect x="120" y="16" width="122" height="68" rx="3" fill="none" stroke="var(--color-garis-tegas)" stroke-width="0.9" />
        <text x="124" y="13" font-size="7" fill="var(--color-teks-redup)">{{ label.prompt }}</text>
        <rect
          x="126"
          y="22"
          width="110"
          height="26"
          rx="2"
          fill="none"
          :stroke="adaReferensi ? 'var(--color-sorot)' : 'var(--color-garis-tegas)'"
          stroke-width="1"
          :stroke-dasharray="adaReferensi ? '0' : '2 2'"
        />
        <text
          x="181"
          y="33"
          font-size="6.5"
          text-anchor="middle"
          :fill="adaReferensi ? 'var(--color-sorot)' : 'var(--color-teks-samar)'"
        >
          {{ label.blokReferensi }}
        </text>
        <text
          x="181"
          y="43"
          font-size="7"
          text-anchor="middle"
          font-family="var(--font-teknis)"
          :fill="adaReferensi ? 'var(--color-sorot)' : 'var(--color-teks-samar)'"
        >
          {{ adaReferensi ? `${referensi[0]!.label} … ${referensi[referensi.length - 1]!.label}` : label.tanpaReferensi }}
        </text>
        <rect x="126" y="52" width="110" height="26" rx="2" fill="none" stroke="var(--color-garis-tegas)" stroke-width="0.9" />
        <text x="181" y="63" font-size="6.5" text-anchor="middle" fill="var(--color-teks-redup)">
          {{ label.blokInstruksi }}
        </text>
        <text x="181" y="73" font-size="6" text-anchor="middle" fill="var(--color-teks-samar)">
          Langkah 0 → 6
        </text>
      </g>

      <line x1="244" y1="50" x2="258" y2="50" stroke="var(--color-sorot)" stroke-width="1" marker-end="url(#panah-alir)" />

      <!-- Model generatif + skema per permintaan -->
      <g :opacity="redup(fokus === 'skema' || fokus === 'gerbang' || fokus === 'retry')" :style="{ transition: transisi }">
        <rect x="264" y="34" width="92" height="32" rx="3" fill="none" stroke="var(--color-garis-tegas)" stroke-width="0.9" />
        <text x="310" y="47" font-size="7" text-anchor="middle" fill="var(--color-teks-redup)">{{ label.model }}</text>
        <text x="310" y="59" font-size="6.5" text-anchor="middle" font-family="var(--font-teknis)" fill="var(--color-teks)">
          {{ adaReferensi ? `${skema.identitasMin}–${skema.identitasMaks}` : skema.identitasTanpaReferensi }}
          {{ label.identitas }}
        </text>
        <text x="264" y="28" font-size="6" fill="var(--color-teks-samar)">{{ label.skema }}</text>
      </g>

      <line x1="358" y1="50" x2="372" y2="50" stroke="var(--color-sorot)" stroke-width="1" marker-end="url(#panah-alir)" />

      <!-- Gerbang validasi -->
      <g :opacity="redup(fokus === 'gerbang' || fokus === 'retry')" :style="{ transition: transisi }">
        <rect
          x="378"
          y="34"
          width="92"
          height="32"
          rx="3"
          fill="none"
          :stroke="warnaGerbang"
          stroke-width="1.2"
          :style="{ transition: `stroke ${durasi} var(--ease-keluar)` }"
        />
        <text x="424" y="47" font-size="7" text-anchor="middle" fill="var(--color-teks-redup)">{{ label.gerbang }}</text>
        <text x="424" y="59" font-size="8" text-anchor="middle" font-family="var(--font-teknis)" :fill="warnaGerbang">
          {{ ditolak ? label.tolak : label.terima }}
        </text>
      </g>

      <!-- Jalur pembuatan ulang; hanya menyala ketika keluaran ditolak -->
      <g :opacity="ditolak ? 1 : 0.18" :style="{ transition: transisi }">
        <path
          d="M424 68 L424 96 L310 96 L310 70"
          fill="none"
          stroke="var(--color-salah)"
          stroke-width="1"
          stroke-dasharray="3 2"
          marker-end="url(#panah-ulang)"
        />
        <text x="367" y="106" font-size="6.5" text-anchor="middle" fill="var(--color-salah)">
          {{ label.buatUlang }} · {{ label.percobaan }} {{ percobaanKe }}/{{ percobaan.totalPemanggilan }}
        </text>
      </g>

      <line
        x1="472"
        y1="50"
        x2="484"
        y2="50"
        :stroke="ditolak ? 'var(--color-garis-tegas)' : 'var(--color-sorot)'"
        stroke-width="1"
        marker-end="url(#panah-alir)"
      />

      <!-- Persist satu transaksi lalu pemaparan pada API -->
      <g :opacity="redup(fokus === 'keterlacakan')" :style="{ transition: transisi }">
        <rect
          x="488"
          y="18"
          width="66"
          height="26"
          rx="3"
          fill="none"
          :stroke="ditolak ? 'var(--color-garis-tegas)' : 'var(--color-benar)'"
          stroke-width="1"
        />
        <text x="521" y="30" font-size="6.5" text-anchor="middle" fill="var(--color-teks-redup)">
          {{ label.persist }}
        </text>
        <text x="521" y="39" font-size="6.5" text-anchor="middle" font-family="var(--font-teknis)" fill="var(--color-teks)">
          {{ relasi.length }} tabel
        </text>
        <line x1="521" y1="46" x2="521" y2="58" stroke="var(--color-sorot)" stroke-width="1" marker-end="url(#panah-alir)" />
        <rect x="488" y="60" width="66" height="26" rx="3" fill="none" stroke="var(--color-garis-tegas)" stroke-width="0.9" />
        <text x="521" y="70" font-size="5.6" text-anchor="middle" fill="var(--color-teks-redup)">{{ label.papar }}</text>
        <text x="521" y="80" font-size="6.5" text-anchor="middle" font-family="var(--font-teknis)" fill="var(--color-teks)">
          {{ pemaparan.length }} lapis
        </text>
      </g>
    </svg>

    <!-- Kendali: jalur retrieval, kondisi blok referensi, keadaan yang dipicu -->
    <div class="flex shrink-0 flex-col gap-1">
      <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span class="label-teknis text-teks-samar">{{ label.jalur }}</span>
        <button
          type="button"
          class="label-teknis rounded-hairline border px-1.5 py-0.5 transition-[color,border-color] duration-150 active:scale-[0.97]"
          :class="!memakaiCadangan ? 'border-sorot text-sorot' : 'border-garis text-teks-samar'"
          :aria-pressed="!memakaiCadangan"
          @click="pilihJalur('vektor')"
        >
          {{ label.jalurVektor }}
        </button>
        <button
          v-for="item in pemicu"
          :key="item.id"
          type="button"
          class="label-teknis rounded-hairline border px-1.5 py-0.5 transition-[color,border-color] duration-150 active:scale-[0.97]"
          :class="jalurAktif === item.id ? 'border-awas text-awas' : 'border-garis text-teks-samar'"
          :aria-pressed="jalurAktif === item.id"
          :title="item.isi"
          @click="pilihJalur(item.id)"
        >
          {{ item.nomor }}
        </button>

        <span class="ml-auto label-teknis text-teks-samar">{{ label.kondisiReferensi }}</span>
        <button
          type="button"
          class="label-teknis rounded-hairline border px-1.5 py-0.5 transition-[color,border-color] duration-150 active:scale-[0.97]"
          :class="adaReferensi ? 'border-sorot text-sorot' : 'border-garis text-teks-samar'"
          :aria-pressed="adaReferensi"
          @click="pilihReferensi(true)"
        >
          {{ label.denganReferensi }} · {{ referensi.length }}
        </button>
        <button
          type="button"
          class="label-teknis rounded-hairline border px-1.5 py-0.5 transition-[color,border-color] duration-150 active:scale-[0.97]"
          :class="!adaReferensi ? 'border-sorot text-sorot' : 'border-garis text-teks-samar'"
          :aria-pressed="!adaReferensi"
          @click="pilihReferensi(false)"
        >
          {{ label.tanpaReferensi }}
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <span class="label-teknis text-teks-samar">{{ label.picu }}</span>
        <button
          type="button"
          class="label-teknis rounded-hairline border px-1.5 py-0.5 transition-[color,border-color] duration-150 active:scale-[0.97]"
          :class="skenario === 'patuh' ? 'border-benar text-benar' : 'border-garis text-teks-samar'"
          :aria-pressed="skenario === 'patuh'"
          @click="pilihSkenario('patuh')"
        >
          {{ label.patuh }}
        </button>
        <button
          v-for="item in kelas"
          :key="item.id"
          type="button"
          class="label-teknis rounded-hairline border px-1.5 py-0.5 transition-[color,border-color] duration-150 active:scale-[0.97]"
          :class="skenario === item.id ? 'border-salah text-salah' : 'border-garis text-teks-samar'"
          :aria-pressed="skenario === item.id"
          :title="item.judul"
          @click="pilihSkenario(item.id)"
        >
          {{ item.nomor }}{{ item.diLuarNaskah ? '*' : '' }}
        </button>
        <button
          type="button"
          class="label-teknis rounded-hairline border px-1.5 py-0.5 transition-[color,border-color] duration-150 active:scale-[0.97]"
          :class="skenario === 'label-ganda' ? 'border-awas text-awas' : 'border-garis text-teks-samar'"
          :aria-pressed="skenario === 'label-ganda'"
          @click="pilihSkenario('label-ganda')"
        >
          {{ label.labelGanda }}
        </button>
        <span class="ml-auto font-mono text-[0.6rem]" :class="ditolak ? 'text-salah' : 'text-benar'">
          {{ label.percobaan }} {{ percobaanKe }}/{{ percobaan.totalPemanggilan }}
        </span>
      </div>
    </div>

    <section class="grid min-h-0 flex-1 gap-2 lg:grid-cols-[1.02fr_0.98fr]">
      <!-- Sembilan unit klaim; ditolak berarti kesembilannya ditolak -->
      <div class="flex min-h-0 flex-col rounded-kartu border border-garis bg-panel-naik p-2">
        <div class="flex items-baseline justify-between gap-2 pb-1">
          <p class="label-teknis text-teks-redup">{{ label.unitKlaim }}</p>
          <p class="font-mono text-[0.6rem]" :class="ditolak ? 'text-salah' : 'text-benar'">
            {{ unitSimulasi.length }}
          </p>
        </div>
        <ol class="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          <li
            v-for="unit in unitSimulasi"
            :key="unit.claimPath"
            class="grid grid-cols-[1.1rem_1fr] items-baseline gap-1 border-b border-garis pb-1"
            :class="ditolak ? 'opacity-60' : ''"
            :style="{ transition: `opacity ${durasi} var(--ease-keluar)` }"
          >
            <span class="font-mono text-[0.58rem] text-teks-samar">{{ unit.claimIndex }}</span>
            <span class="min-w-0">
              <span
                class="block truncate font-mono text-[0.6rem] leading-tight"
                :class="hasil.claimPath === unit.claimPath && ditolak ? 'text-salah' : 'text-teks'"
                :title="unit.claimPath"
              >
                {{ unit.claimPath }}
              </span>
              <span class="flex flex-wrap items-baseline gap-1 pt-0.5">
                <span
                  v-for="(item, urut) in unit.label"
                  :key="`${unit.claimPath}-${urut}`"
                  class="rounded-hairline border px-1 font-mono text-[0.55rem]"
                  :class="{
                    'border-garis-tegas text-sorot': keadaanLabel(unit, item, urut) === 'sah',
                    'border-salah/60 text-salah': keadaanLabel(unit, item, urut) === 'gugur',
                    'border-awas/60 text-awas': keadaanLabel(unit, item, urut) === 'duplikat',
                  }"
                >
                  {{ item }}<span v-if="keadaanLabel(unit, item, urut) === 'duplikat'"> ·
                    {{ label.labelGanda }}</span>
                </span>
                <span v-if="unit.label.length === 0" class="font-mono text-[0.55rem] text-teks-samar">
                  reference_ids: []
                </span>
                <span v-if="unit.prosaBocor" class="font-mono text-[0.55rem] text-salah">
                  text: “… Ref-02 …”
                </span>
              </span>
            </span>
          </li>
        </ol>
      </div>

      <!-- Panel kanan berganti isi mengikuti langkah narasi -->
      <div class="flex min-h-0 flex-col overflow-y-auto rounded-kartu border border-garis bg-panel-naik p-2">
        <template v-if="fokus === 'prompt'">
          <p class="label-teknis pb-1 text-teks-redup">{{ label.prompt }}</p>
          <ol class="space-y-0.5">
            <li
              v-for="(item, indeks) in blok"
              :key="item.id"
              class="grid grid-cols-[1.1rem_1fr] gap-1 text-[0.58rem] leading-tight"
              :class="item.referensi ? 'text-sorot' : 'text-teks-samar'"
            >
              <span class="font-mono">{{ indeks + 1 }}</span>
              <span class="min-w-0">
                <span class="font-mono">{{ item.nama }}</span>
                <span v-if="item.opsional" class="text-[0.52rem]"> · opsional</span>
                <span class="block text-[0.52rem] leading-[1.25] text-teks-samar">{{ item.keterangan }}</span>
              </span>
            </li>
          </ol>
        </template>

        <template v-else-if="fokus === 'skema'">
          <p class="label-teknis pb-1 text-teks-redup">{{ label.skema }}</p>
          <p class="font-mono text-[0.6rem] text-teks">ResponseMIMEType: {{ skema.mime }}</p>
          <p class="font-mono text-[0.6rem] text-teks">
            reference_ids: minItems {{ adaReferensi ? skema.identitasMin : skema.identitasTanpaReferensi }} ·
            maxItems {{ adaReferensi ? skema.identitasMaks : skema.identitasTanpaReferensi }} ·
            maxLength {{ skema.panjangMaksLabel }}
          </p>
          <p class="pt-1 text-[0.6rem] leading-snug text-teks-samar">
            signature_title dikunci pada {{ arketipe.length }} arketipe tertutup dan divalidasi harus memuat tepat
            satu keluarga arketipe.
          </p>
          <p class="flex flex-wrap gap-1 pt-1">
            <span
              v-for="nama in arketipe"
              :key="nama"
              class="rounded-hairline border border-garis-tegas px-1 font-mono text-[0.53rem] text-teks-redup"
            >
              {{ nama }}
            </span>
          </p>
        </template>

        <template v-else-if="fokus === 'gerbang'">
          <p class="label-teknis pb-1 text-teks-redup">{{ label.gerbang }}</p>
          <ol class="space-y-0.5 pb-1">
            <li
              v-for="(item, indeks) in gerbang"
              :key="item.id"
              class="grid grid-cols-[1.1rem_1fr] gap-1 text-[0.58rem] leading-tight text-teks-samar"
            >
              <span class="font-mono">{{ indeks + 1 }}</span>
              <span class="min-w-0 truncate" :title="item.isi">{{ item.judul }}</span>
            </li>
          </ol>
          <div
            class="mt-auto rounded-hairline border p-1.5"
            :class="ditolak ? 'border-salah/60' : 'border-benar/60'"
          >
            <p class="font-mono text-[0.62rem]" :class="ditolak ? 'text-salah' : 'text-benar'">
              {{ ditolak ? hasil.kelas?.sentinel : 'validateClaimReferences → nil' }}
            </p>
            <p v-if="ditolak" class="pt-0.5 text-[0.58rem] leading-snug text-teks-redup">
              {{ hasil.kelas?.nomor }}. {{ hasil.kelas?.judul }}
            </p>
            <p v-if="ditolak" class="font-mono text-[0.55rem] text-teks-samar">
              {{ hasil.claimPath }}<span v-if="hasil.labelPelanggar"> · {{ hasil.labelPelanggar }}</span>
            </p>
            <p v-else class="pt-0.5 text-[0.58rem] leading-snug text-teks-redup">
              {{ labelGanda.judul }}: {{ hasil.dinormalisasi }} label dinormalisasi
              <span v-if="skenario === 'label-ganda'"> · {{ label.bukanPelanggaran }}</span>
            </p>
          </div>
        </template>

        <template v-else-if="fokus === 'retry'">
          <p class="label-teknis pb-1 text-teks-redup">{{ label.buatUlang }}</p>
          <ol class="space-y-0.5">
            <li
              v-for="nomor in percobaan.totalPemanggilan"
              :key="nomor"
              class="flex items-baseline justify-between gap-2 border-b border-garis pb-0.5 text-[0.6rem]"
              :class="nomor <= percobaanKe ? '' : 'opacity-45'"
            >
              <span class="font-mono text-teks-redup">{{ label.percobaan }} {{ nomor }}</span>
              <span
                class="font-mono text-[0.58rem]"
                :class="
                  nomor > percobaanKe
                    ? 'text-teks-samar'
                    : nomor < percobaanKe || ditolak
                      ? 'text-salah'
                      : 'text-benar'
                "
              >
                {{
                  nomor > percobaanKe
                    ? '—'
                    : nomor < percobaanKe || ditolak
                      ? label.tolak
                      : label.terima
                }}
              </span>
            </li>
          </ol>
          <p v-if="jedaBerikutnya && ditolak" class="pt-1 font-mono text-[0.58rem] text-teks-samar">
            jeda {{ desimal(jedaBerikutnya.minDetik, 1) }}–{{ desimal(jedaBerikutnya.maksDetik, 1) }} detik
          </p>
          <p
            class="mt-auto rounded-hairline border px-1.5 py-1 text-[0.58rem] leading-snug"
            :class="pekerjaanGagal ? 'border-salah/60 text-salah' : 'border-garis text-teks-samar'"
          >
            <span v-if="pekerjaanGagal">{{ label.gagalTotal }}</span>
            <span v-else>{{ percobaan.rumusJeda }}</span>
          </p>
        </template>

        <template v-else-if="fokus === 'cadangan'">
          <p class="label-teknis pb-1 text-teks-redup">{{ label.jalurCadangan }}</p>
          <ol class="space-y-0.5 pb-1">
            <li
              v-for="item in pemicu"
              :key="item.id"
              class="grid grid-cols-[1.1rem_1fr] gap-1 text-[0.58rem] leading-tight"
              :class="jalurAktif === item.id ? 'text-awas' : 'text-teks-samar'"
            >
              <span class="font-mono">{{ item.nomor }}</span>
              <span class="min-w-0">{{ item.isi }}</span>
            </li>
          </ol>
          <p class="font-mono text-[0.58rem] text-teks-redup">{{ skorCadangan.urutanMuat }}</p>
          <ul class="space-y-0.5 pt-1">
            <li
              v-for="item in skorCadangan.komponen"
              :key="item.id"
              class="flex items-baseline justify-between gap-2 text-[0.58rem] text-teks-samar"
            >
              <span class="min-w-0 truncate">{{ item.syarat }}</span>
              <span class="font-mono text-teks">{{ item.bobot }}</span>
            </li>
          </ul>
        </template>

        <template v-else>
          <p class="label-teknis pb-1 text-teks-redup">{{ label.keterlacakan }}</p>
          <ol class="space-y-1">
            <li
              v-for="unit in unitSimulasi"
              :key="`lacak-${unit.claimPath}`"
              class="text-[0.58rem] leading-tight"
            >
              <span class="font-mono text-teks-samar">{{ unit.claimIndex }}</span>
              <span
                v-for="(item, urut) in unit.label"
                :key="`lacak-${unit.claimPath}-${urut}`"
                class="pl-1"
              >
                <span class="font-mono text-sorot">{{ item }}</span>
                <span class="font-mono text-teks-samar"> → {{ dokumenUntukLabel(item)?.id.slice(0, 8) }}</span>
                <span class="text-teks-redup"> · {{ dokumenUntukLabel(item)?.domain }}</span>
                <span class="font-mono text-teks-samar">
                  · {{ desimal(dokumenUntukLabel(item)?.similarity ?? 0, 6) }}
                </span>
              </span>
              <span v-if="unit.label.length === 0" class="pl-1 text-teks-samar">
                {{ label.tanpaReferensi }}
              </span>
            </li>
          </ol>
          <p class="mt-auto border-t border-garis pt-1 text-[0.55rem] leading-snug text-teks-samar">
            {{ label.persist }}:
            <span v-for="(item, urut) in relasi" :key="item.tabel" class="font-mono" :title="item.isi">
              {{ urut ? ' · ' : '' }}{{ item.tabel }}
            </span>
          </p>
        </template>
      </div>
    </section>

    <p class="shrink-0 text-[0.58rem] leading-snug text-teks-samar">
      <span v-if="fokus === 'gerbang' && ditolak">
        {{ hasil.kelas?.isi }}
      </span>
      <span v-else-if="fokus === 'retry'">
        {{ label.tolak }}: seluruh {{ unitSimulasi.length }} unit dikembalikan. Sistem tidak pernah membuang
        identitas tak sah lalu menyajikan sisanya.
      </span>
      <span v-else-if="fokus === 'cadangan'">{{ cadangan.batasPembacaan }}</span>
      <span v-else-if="fokus === 'keterlacakan'">{{ label.batasJaminan }}</span>
      <span v-else>
        {{ angkaDengan('rag.unit-klaim')?.catatan }}
      </span>
    </p>
  </figure>
</template>
