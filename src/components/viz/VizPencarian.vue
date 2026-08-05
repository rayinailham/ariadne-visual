<script setup lang="ts">
import { computed, ref } from 'vue'
import type {
  Angka,
  Bersumber,
  Butir,
  DokumenRetrieval,
  LangkahPencarian,
  MetrikPerK,
  ParameterIndeks,
  ProfilRetrieval,
} from '@/data'

const props = defineProps<{
  langkah: number
  jumlahLangkah: number
  gerakDikurangi: boolean
  angka: Angka[]
  dokumen: DokumenRetrieval[]
  retrieval: ProfilRetrieval[]
  saringan: LangkahPencarian[]
  parameterIndeks: ParameterIndeks[]
  traversal: Bersumber & {
    lapisan: Array<{ nama: string; simpul: number; keterangan: string }>
    batasPembacaan: string
    catatanEfSearch: string
  }
  kandidatK: number[]
  kFinal: number
  metrikVektor: MetrikPerK[]
  metrikCadangan: MetrikPerK[]
  komposisiJenis: Array<{ jenis: string; jumlah: number }>
  batasRubrik: Butir
  deviasiHarness: Butir
  label: Bersumber & {
    judulVisual: string
    traversal: string
    titikMasuk: string
    tetangga: string
    ilustratif: string
    jarak: string
    kesamaan: string
    ambangBuang: string
    saringan: string
    kandidat: string
    potong: string
    daftarReferensi: string
    peringkat: string
    nilaiRubrik: string
    rubrik: Record<string, string>
    metrik: string
    rerata: string
    precision: string
    strongRasio: string
    strongAbsolut: string
    token: string
    deltaDariSebelumnya: string
    kFinal: string
    jalurCadangan: string
    profil: string
    jenisDokumen: string
  }
}>()

// ---------------------------------------------------------------------------
// Keadaan yang dikendalikan penonton
// ---------------------------------------------------------------------------

const indeksK = ref(props.kandidatK.indexOf(props.kFinal))
const profilAktif = ref(props.retrieval[0]?.profil ?? '')

const nilaiK = computed(() => props.kandidatK[indeksK.value] ?? props.kFinal)
const profil = computed(
  () => props.retrieval.find((item) => item.profil === profilAktif.value) ?? props.retrieval[0]!,
)
const kondisi = computed(
  () => profil.value.kondisi.find((item) => item.k === nilaiK.value) ?? profil.value.kondisi[0]!,
)

/** Referensi yang benar-benar terkirim pada k ini, lengkap dengan nilai rubriknya. */
const referensi = computed(() =>
  profil.value.peringkat.slice(0, nilaiK.value).map((item, indeks) => ({
    peringkat: indeks + 1,
    similarity: item.similarity,
    nilai: kondisi.value.nilaiRubrik[indeks] ?? null,
    dokumen: props.dokumen.find((d) => d.id === item.idDok)!,
  })),
)

const metrikAktif = computed(
  () => props.metrikVektor.find((item) => item.k === nilaiK.value) ?? props.metrikVektor[0]!,
)
const metrikSebelumnya = computed(() =>
  indeksK.value > 0 ? props.metrikVektor.find((item) => item.k === props.kandidatK[indeksK.value - 1]) : undefined,
)
const cadanganAktif = computed(() => props.metrikCadangan.find((item) => item.k === nilaiK.value))

// ---------------------------------------------------------------------------
// Fokus adegan: satu langkah narasi menyalakan satu bagian gambar
// ---------------------------------------------------------------------------

const fokus = computed(() => {
  const peta = ['traversal', 'jarak', 'saringan', 'potong', 'metrik', 'putusan'] as const
  return peta[Math.min(props.langkah, peta.length - 1)]!
})
const redup = (aktif: boolean) => (aktif ? 1 : 0.32)
const durasi = computed(() => (props.gerakDikurangi ? '0.001ms' : '260ms'))
const transisi = computed(() => `opacity ${durasi.value} var(--ease-keluar)`)

// ---------------------------------------------------------------------------
// Tata letak graf HNSW — koordinat gambar, bukan data
// ---------------------------------------------------------------------------

const lapisan = computed(() =>
  props.traversal.lapisan.map((baris, indeks) => {
    const y = 40 + indeks * 30
    const kiri = 26
    const kanan = 268
    const sela = (kanan - kiri) / Math.max(baris.simpul - 1, 1)
    return {
      ...baris,
      y,
      simpulX: Array.from({ length: baris.simpul }, (_, i) => kiri + i * sela),
    }
  }),
)

/** Jalur turun: satu simpul per lapisan, makin ke kanan makin dekat sasaran. */
const jalurTurun = computed(() =>
  lapisan.value.map((baris, indeks) => ({
    x: baris.simpulX[Math.min(indeks + 1, baris.simpulX.length - 1)]!,
    y: baris.y,
  })),
)
const simpulSasaran = computed(() => jalurTurun.value[jalurTurun.value.length - 1]!)
const lapisanDasar = computed(() => lapisan.value[lapisan.value.length - 1]!)
const tetanggaSasaran = computed(() =>
  lapisanDasar.value.simpulX
    .filter((x) => Math.abs(x - simpulSasaran.value.x) < 46 && x !== simpulSasaran.value.x)
    .map((x) => ({ x, y: lapisanDasar.value.y })),
)
const parameterM = computed(() => props.parameterIndeks.find((item) => item.nama === 'm'))

// ---------------------------------------------------------------------------
// Sumbu kesamaan
// ---------------------------------------------------------------------------

const ambangKesamaan = computed(() => props.angka.find((item) => item.id === 'rag.min-similarity'))
const sumbuKiri = 330
const sumbuKanan = 546
const posisiSumbu = (nilai: number) => sumbuKiri + nilai * (sumbuKanan - sumbuKiri)
const kesamaanTeratas = computed(() => profil.value.peringkat[0]!.similarity)
const kesamaanTerakhir = computed(() => referensi.value[referensi.value.length - 1]!.similarity)

// ---------------------------------------------------------------------------
// Angka siap tayang
// ---------------------------------------------------------------------------

const desimal = (nilai: number, digit: number) => nilai.toFixed(digit).replace('.', ',')
const ribuan = (nilai: number) => Math.round(nilai).toLocaleString('id-ID')
const selisih = (sekarang: number, sebelum: number | undefined, digit: number) =>
  sebelum === undefined ? null : `${sekarang - sebelum >= 0 ? '+' : '−'}${desimal(Math.abs(sekarang - sebelum), digit)}`

const kelasRubrik = (nilai: number | null) =>
  nilai === 2 ? 'text-benar' : nilai === 0 ? 'text-salah' : 'text-teks-redup'

const angkaMaksPerKueri = computed(() =>
  props.angka.find((item) => item.id === 'rag.maks-dokumen-per-kueri'),
)
const angkaDokumenUnik = computed(() => props.angka.find((item) => item.id === 'rag.dokumen-unik-vektor'))

const labelGambar = computed(
  () =>
    `${props.label.judulVisual}: profil ${profil.value.profil}, k ${nilaiK.value}; ambang kesamaan ${ambangKesamaan.value?.tampil}; kesamaan peringkat 1 ${desimal(kesamaanTeratas.value, 6)} dan peringkat ${nilaiK.value} ${desimal(kesamaanTerakhir.value, 6)}; ${props.label.precision} ${desimal(kondisi.value.precision, 4)}; ${props.label.strongRasio} ${desimal(kondisi.value.strongRasio, 4)}; ${kondisi.value.strongAbsolut} ${props.label.strongAbsolut}; ${ribuan(kondisi.value.tokenKonteks)} ${props.label.token}; ${props.label.rerata} ${desimal(metrikAktif.value.strongRasio, 4)}`,
)
</script>
<template>
  <figure class="relative flex h-full min-h-0 flex-col gap-2 p-4 md:p-5">
    <figcaption class="flex items-baseline justify-between gap-3">
      <span class="label-teknis">{{ label.judulVisual }}</span>
      <span class="label-teknis text-sorot">langkah {{ langkah + 1 }}/{{ jumlahLangkah }}</span>
    </figcaption>

    <svg
      class="w-full shrink-0"
      viewBox="0 0 560 136"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      :aria-label="labelGambar"
    >
      <defs>
        <marker id="panah-turun" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto">
          <path d="M0 0 L10 5 L0 10z" fill="var(--color-sorot)" />
        </marker>
      </defs>

      <!-- Zona kiri: traversal HNSW berlapis. Tata letak titik bersifat ilustratif. -->
      <g :opacity="redup(fokus === 'traversal')" :style="{ transition: transisi }">
        <text x="6" y="12" font-size="8.5" fill="var(--color-teks-redup)">{{ label.traversal }}</text>
        <g v-for="(baris, indeks) in lapisan" :key="baris.nama">
          <line x1="18" x2="272" :y1="baris.y" :y2="baris.y" stroke="var(--color-garis-tegas)" stroke-width="0.8" />
          <text x="278" :y="baris.y + 2.5" font-size="6.5" fill="var(--color-teks-samar)">{{ baris.simpul }}</text>
          <circle
            v-for="x in baris.simpulX"
            :key="`${baris.nama}-${x}`"
            :cx="x"
            :cy="baris.y"
            r="2.6"
            :fill="x === jalurTurun[indeks]?.x ? 'var(--color-sorot)' : 'var(--color-garis-tegas)'"
          />
        </g>

        <line
          v-for="tetangga in tetanggaSasaran"
          :key="`tetangga-${tetangga.x}`"
          :x1="simpulSasaran.x"
          :y1="simpulSasaran.y"
          :x2="tetangga.x"
          :y2="tetangga.y"
          stroke="var(--color-sorot)"
          stroke-width="0.7"
          stroke-dasharray="2 2"
        />
        <polyline
          :points="jalurTurun.map((titik) => `${titik.x},${titik.y}`).join(' ')"
          fill="none"
          stroke="var(--color-sorot)"
          stroke-width="1.1"
          marker-end="url(#panah-turun)"
        />
        <text :x="jalurTurun[0]!.x - 2" :y="jalurTurun[0]!.y - 7" font-size="6.5" fill="var(--color-sorot)">
          {{ label.titikMasuk }}
        </text>
        <text :x="simpulSasaran.x + 8" :y="simpulSasaran.y + 12" font-size="6.5" fill="var(--color-sorot)">
          {{ label.tetangga }} · {{ parameterM?.nama }} = {{ parameterM?.nilai }}
        </text>
        <text x="6" y="130" font-size="6" fill="var(--color-teks-samar)">{{ label.ilustratif }}</text>
      </g>

      <line x1="302" y1="6" x2="302" y2="130" stroke="var(--color-garis)" stroke-width="0.8" />

      <!-- Zona kanan: jarak kosinus menjadi kesamaan, lalu jendela yang diterima pada k -->
      <g :opacity="redup(fokus === 'jarak' || fokus === 'potong')" :style="{ transition: transisi }">
        <text x="314" y="12" font-size="8.5" fill="var(--color-teks-redup)">
          {{ label.jarak }} → {{ label.kesamaan }}
        </text>
        <text x="314" y="26" font-size="7.5" font-family="var(--font-teknis)" fill="var(--color-teks)">
          {{ saringan[1]?.nilai }}
        </text>

        <rect
          :x="sumbuKiri"
          y="40"
          :width="posisiSumbu(ambangKesamaan?.nilai ?? 0) - sumbuKiri"
          height="13"
          fill="var(--color-garis)"
        />
        <rect
          :x="posisiSumbu(kesamaanTerakhir)"
          y="40"
          :width="posisiSumbu(kesamaanTeratas) - posisiSumbu(kesamaanTerakhir)"
          height="13"
          fill="var(--color-sorot)"
          opacity="0.35"
          :style="{ transition: `all ${durasi} var(--ease-keluar)` }"
        />
        <line :x1="sumbuKiri" :x2="sumbuKanan" y1="53" y2="53" stroke="var(--color-garis-tegas)" stroke-width="0.9" />
        <text :x="sumbuKiri" y="63" font-size="6" fill="var(--color-teks-samar)">0</text>
        <text :x="sumbuKanan" y="63" font-size="6" text-anchor="end" fill="var(--color-teks-samar)">1</text>

        <line
          :x1="posisiSumbu(ambangKesamaan?.nilai ?? 0)"
          :x2="posisiSumbu(ambangKesamaan?.nilai ?? 0)"
          y1="36"
          y2="57"
          stroke="var(--color-awas)"
          stroke-width="1"
        />
        <text
          :x="posisiSumbu(ambangKesamaan?.nilai ?? 0)"
          y="34"
          font-size="6.5"
          text-anchor="middle"
          fill="var(--color-awas)"
        >
          ≥ {{ ambangKesamaan?.tampil }}
        </text>
        <text x="314" y="72" font-size="6" fill="var(--color-teks-samar)">{{ label.ambangBuang }}</text>

        <line
          :x1="posisiSumbu(kesamaanTeratas)"
          :x2="posisiSumbu(kesamaanTeratas)"
          y1="38"
          y2="55"
          stroke="var(--color-sorot)"
          stroke-width="1.1"
        />
        <line
          :x1="posisiSumbu(kesamaanTerakhir)"
          :x2="posisiSumbu(kesamaanTerakhir)"
          y1="38"
          y2="55"
          stroke="var(--color-sorot)"
          stroke-width="1.1"
          :style="{ transition: `all ${durasi} var(--ease-keluar)` }"
        />

        <text x="314" y="90" font-size="6.5" fill="var(--color-teks-samar)">
          {{ label.peringkat }} 1 · {{ label.kesamaan }}
        </text>
        <text x="314" y="101" font-size="8.5" font-family="var(--font-teknis)" fill="var(--color-sorot)">
          {{ desimal(kesamaanTeratas, 6) }}
        </text>
        <text x="314" y="117" font-size="6.5" fill="var(--color-teks-samar)">
          {{ label.peringkat }} {{ nilaiK }} · {{ label.kesamaan }}
        </text>
        <text x="314" y="128" font-size="8.5" font-family="var(--font-teknis)" fill="var(--color-sorot)">
          {{ desimal(kesamaanTerakhir, 6) }}
        </text>

        <text x="444" y="90" font-size="6.5" fill="var(--color-teks-samar)">{{ label.jarak }}</text>
        <text x="444" y="101" font-size="8.5" font-family="var(--font-teknis)" fill="var(--color-teks)">
          {{ desimal(1 - kesamaanTeratas, 6) }}
        </text>
        <text x="444" y="117" font-size="6.5" fill="var(--color-teks-samar)">{{ label.jarak }}</text>
        <text x="444" y="128" font-size="8.5" font-family="var(--font-teknis)" fill="var(--color-teks)">
          {{ desimal(1 - kesamaanTerakhir, 6) }}
        </text>
      </g>
    </svg>

    <!--
      Angka besar = kondisi profil yang sedang tampil, sehingga dapat dihitung
      ulang dari daftar referensi di bawahnya. Baris kecil = rerata lima profil,
      yaitu angka yang dipakai Bab 4 untuk memutuskan k.
    -->
    <div class="grid shrink-0 grid-cols-4 gap-1" :aria-label="label.metrik">
      <div class="rounded-hairline border border-garis bg-panel-naik px-2 py-1">
        <p class="font-mono text-kecil text-teks">{{ desimal(kondisi.precision, 4) }}</p>
        <p class="text-[0.55rem] leading-tight text-teks-samar">{{ label.precision }}</p>
        <p class="text-[0.55rem] leading-tight text-teks-samar">
          {{ label.rerata }} {{ desimal(metrikAktif.precision, 4) }}
          <span v-if="metrikSebelumnya">· {{ selisih(metrikAktif.precision, metrikSebelumnya.precision, 4) }}</span>
        </p>
      </div>
      <div class="rounded-hairline border border-garis bg-panel-naik px-2 py-1">
        <p class="font-mono text-kecil text-teks">{{ desimal(kondisi.strongRasio, 4) }}</p>
        <p class="text-[0.55rem] leading-tight text-teks-samar">{{ label.strongRasio }}</p>
        <p class="text-[0.55rem] leading-tight text-teks-samar">
          {{ label.rerata }} {{ desimal(metrikAktif.strongRasio, 4) }}
          <span v-if="metrikSebelumnya">· {{ selisih(metrikAktif.strongRasio, metrikSebelumnya.strongRasio, 4) }}</span>
        </p>
      </div>
      <div class="rounded-hairline border border-garis bg-panel-naik px-2 py-1">
        <p class="font-mono text-kecil text-teks">{{ kondisi.strongAbsolut }}</p>
        <p class="text-[0.55rem] leading-tight text-teks-samar">{{ label.strongAbsolut }}</p>
        <p class="text-[0.55rem] leading-tight text-teks-samar">
          {{ label.rerata }} {{ desimal(metrikAktif.strongAbsolut, 1) }}
          <span v-if="metrikSebelumnya">· {{ selisih(metrikAktif.strongAbsolut, metrikSebelumnya.strongAbsolut, 1) }}</span>
        </p>
      </div>
      <div class="rounded-hairline border border-garis bg-panel-naik px-2 py-1">
        <p class="font-mono text-kecil text-teks">{{ ribuan(kondisi.tokenKonteks) }}</p>
        <p class="text-[0.55rem] leading-tight text-teks-samar">{{ label.token }}</p>
        <p class="text-[0.55rem] leading-tight text-teks-samar">
          {{ label.rerata }} {{ ribuan(metrikAktif.tokenKonteks) }}
          <span v-if="metrikSebelumnya">· {{ selisih(metrikAktif.tokenKonteks, metrikSebelumnya.tokenKonteks, 0) }}</span>
        </p>
      </div>
    </div>

    <div class="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5">
      <div class="flex flex-wrap gap-1" role="tablist" :aria-label="label.profil">
        <button
          v-for="item in retrieval"
          :key="item.profil"
          type="button"
          role="tab"
          :aria-selected="profilAktif === item.profil"
          class="label-teknis shrink-0 rounded-hairline border px-1.5 py-0.5 transition-[transform,color,border-color] duration-150 active:scale-[0.97]"
          :class="profilAktif === item.profil ? 'border-sorot text-sorot' : 'border-garis text-teks-samar'"
          @click="profilAktif = item.profil"
        >
          {{ item.profil }}
        </button>
      </div>

      <div class="ml-auto flex items-center gap-2">
        <label for="batas-k" class="label-teknis text-teks-redup">{{ label.potong }}</label>
        <div class="flex w-36 flex-col">
          <input
            id="batas-k"
            v-model.number="indeksK"
            type="range"
            :min="0"
            :max="kandidatK.length - 1"
            :step="1"
            :aria-valuetext="`k ${nilaiK}`"
            class="w-full accent-sorot"
          />
          <div class="flex justify-between font-mono text-[0.58rem] text-teks-samar" aria-hidden="true">
            <span v-for="nilai in kandidatK" :key="nilai" :class="nilai === kFinal ? 'text-sorot' : ''">
              {{ nilai }}
            </span>
          </div>
        </div>
        <output for="batas-k" class="w-8 text-right font-mono text-sorotan text-sorot">{{ nilaiK }}</output>
      </div>
    </div>

    <section class="grid min-h-0 flex-1 gap-2 lg:grid-cols-[0.82fr_1.18fr]">
      <!-- Saringan berurutan; satu ruas menyala mengikuti langkah narasi -->
      <div class="flex min-h-0 flex-col gap-1 rounded-kartu border border-garis bg-panel-naik p-2">
        <ol class="flex flex-col gap-1" :aria-label="label.saringan">
        <li
          v-for="(item, indeks) in saringan.slice(2)"
          :key="item.id"
          class="min-w-0 rounded-hairline border px-1.5 py-1"
          :class="
            (item.id === 'potong-k' ? fokus === 'potong' : fokus === 'saringan')
              ? 'border-sorot text-teks'
              : 'border-garis text-teks-samar'
          "
          :style="{ transition: `color ${durasi} var(--ease-keluar), border-color ${durasi} var(--ease-keluar)` }"
        >
          <span class="block truncate text-[0.6rem] leading-tight">{{ indeks + 1 }}. {{ item.judul }}</span>
          <code v-if="item.nilai" class="block truncate text-[0.58rem] text-sorot">{{
            item.id === 'potong-k' ? `k = ${nilaiK}` : item.nilai
          }}</code>
        </li>
        </ol>
        <p
          class="mt-auto rounded-hairline border px-1.5 py-1 text-center text-[0.6rem] font-semibold"
          :class="nilaiK === kFinal ? 'border-sorot/60 bg-sorot/10 text-sorot' : 'border-garis text-teks-samar'"
        >
          {{ label.kFinal }} = {{ kFinal }}
        </p>
      </div>

      <div class="flex min-h-0 flex-col rounded-kartu border border-garis bg-panel-naik p-2">
        <div class="flex items-baseline justify-between gap-2 pb-1">
          <p class="label-teknis text-teks-redup">{{ label.daftarReferensi }}</p>
          <p class="font-mono text-[0.6rem] text-sorot">{{ referensi.length }}</p>
        </div>
        <ol class="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
          <li
            v-for="item in referensi"
            :key="item.dokumen.id"
            class="grid grid-cols-[1.4rem_1fr_auto] items-baseline gap-1.5 border-b border-garis pb-1"
          >
            <span class="font-mono text-[0.6rem] text-teks-samar">{{ item.peringkat }}.</span>
            <span class="min-w-0">
              <span class="block truncate text-[0.66rem] leading-tight text-teks" :title="item.dokumen.judul">
                {{ item.dokumen.judul }}
              </span>
              <span class="block truncate text-[0.55rem] text-teks-samar">
                {{ item.dokumen.assessmentType }} · {{ item.dokumen.domain }} ·
                <span :class="kelasRubrik(item.nilai)">
                  {{ label.nilaiRubrik }} {{ item.nilai }} · {{ label.rubrik[String(item.nilai)] }}
                </span>
              </span>
            </span>
            <span class="font-mono text-[0.62rem] text-sorot">{{ desimal(item.similarity, 6) }}</span>
          </li>
        </ol>
        <p class="mt-1 border-t border-garis pt-1 text-[0.55rem] leading-snug text-teks-samar">
          {{ label.jenisDokumen }} ({{ angkaDokumenUnik?.tampil }}):
          <span v-for="(item, indeks) in komposisiJenis" :key="item.jenis">
            {{ indeks ? ' · ' : '' }}{{ item.jenis }} {{ item.jumlah }}
          </span>
          <span class="block">
            {{ label.jalurCadangan }}: {{ desimal(cadanganAktif?.precision ?? 0, 4) }} ·
            {{ desimal(cadanganAktif?.strongRasio ?? 0, 4) }}
          </span>
        </p>
      </div>
    </section>

    <p class="shrink-0 text-[0.58rem] leading-snug text-teks-samar">
      <span v-if="fokus === 'traversal'">{{ traversal.batasPembacaan }} {{ traversal.catatanEfSearch }}</span>
      <span v-else-if="fokus === 'saringan'">
        {{ saringan[4]?.judul }}: {{ angkaMaksPerKueri?.tampil }} dokumen. {{ deviasiHarness.catatan }}
      </span>
      <span v-else-if="fokus === 'potong'">{{ deviasiHarness.isi }}</span>
      <span v-else>{{ batasRubrik.isi }}</span>
    </p>
  </figure>
</template>
