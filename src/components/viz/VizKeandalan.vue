<script setup lang="ts">
import { computed } from 'vue'
import type { Angka, Bersumber, MekanismeKeandalan, SkenarioKeandalan } from '@/data'

/**
 * S04: diagram keandalan asinkron.
 * Angka, status, istilah mekanisme, dan sumber datang dari lapisan data.
 */
const props = defineProps<{
  langkah: number
  jumlahLangkah: number
  gerakDikurangi: boolean
  operasiTransaksi: Array<Bersumber & { id: string; isi: string }>
  mekanisme: MekanismeKeandalan[]
  statusRuns: Array<Bersumber & { id: string; nama: string; arti: string }>
  skenario: SkenarioKeandalan[]
  angka: Angka[]
  statusAktif: string
}>()

const emit = defineEmits<{
  'update:statusAktif': [status: string]
}>()

const LEBAR = 760
const TINGGI = 430
const Y_ALUR = 124
const X_AWAL = 54
const X_AKHIR = 706

const simpul = computed(() => [
  { id: 'tx', nama: 'transaksi PostgreSQL', ringkas: props.operasiTransaksi.length.toString() },
  { id: 'outbox', nama: 'analysis_job_outbox', ringkas: props.mekanisme[0]?.kunci ?? '' },
  { id: 'redis', nama: 'Redis pending', ringkas: 'LPUSH' },
  { id: 'claims', nama: 'Redis claims', ringkas: props.mekanisme[3]?.kunci ?? '' },
  { id: 'worker', nama: 'analysis-worker', ringkas: props.mekanisme[4]?.kunci ?? '' },
  { id: 'runs', nama: 'analysis_runs', ringkas: props.statusAktif },
])

const durasi = computed(() => (props.gerakDikurangi ? '0.001ms' : '300ms'))
const statusTerpilih = computed(
  () => props.statusRuns.find((item) => item.id === props.statusAktif) ?? props.statusRuns[0],
)
const statusIndex = computed(() => Math.max(0, props.statusRuns.findIndex((s) => s.id === props.statusAktif)))
const skenarioAktif = computed(() => props.skenario[Math.min(statusIndex.value, props.skenario.length - 1)])
const mekanismeAktif = computed(() => {
  if (props.langkah <= 0) return props.mekanisme.slice(0, 1)
  if (props.langkah === 1) return props.mekanisme.slice(0, 3)
  if (props.langkah === 2) return props.mekanisme.slice(1, 4)
  if (props.langkah === 3) return props.mekanisme.slice(3, 5)
  if (props.langkah === 4) return props.mekanisme.slice(4, 6)
  return props.mekanisme.slice(5, 7)
})
const angkaUtama = computed(() => props.angka.slice(0, 3))
const angkaOperasional = computed(() => props.angka.slice(3))
const xSimpul = (indeks: number) => X_AWAL + (indeks * (X_AKHIR - X_AWAL)) / Math.max(1, simpul.value.length - 1)
const simpulAktif = (indeks: number) => indeks <= Math.min(props.langkah + 1, simpul.value.length - 1)
const statusKelas = (id: string) => ({
  'border-sorot text-sorot': props.statusAktif === id,
  'border-garis text-teks-samar hover:text-teks': props.statusAktif !== id,
})
const labelGambar = computed(
  () =>
    `Keandalan asinkron: status ${statusTerpilih.value?.nama ?? props.statusAktif}; ${props.operasiTransaksi.length} operasi dalam satu transaksi; semantik at-least-once`,
)
</script>

<template>
  <figure class="flex h-full flex-col gap-3 p-4 md:p-5">
    <figcaption class="flex items-baseline justify-between gap-3">
      <span class="label-teknis">Outbox, klaim, heartbeat, reclaimer, DLQ</span>
      <span class="label-teknis text-sorot">langkah {{ langkah + 1 }}/{{ jumlahLangkah }}</span>
    </figcaption>

    <svg
      class="min-h-0 w-full flex-1"
      :viewBox="`0 0 ${LEBAR} ${TINGGI}`"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      :aria-label="labelGambar"
    >
      <defs>
        <marker id="panah-keandalan" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-sorot)" />
        </marker>
      </defs>

      <text x="34" y="28" font-size="8" letter-spacing="0.12em" fill="var(--color-teks-samar)">SATU TRANSAKSI ATOMIK</text>
      <g transform="translate(34 44)">
        <rect x="0" y="0" width="692" height="44" rx="8" fill="var(--color-panel-naik)" stroke="var(--color-sorot)" stroke-width="1.2" />
        <g v-for="(operasi, i) in operasiTransaksi" :key="operasi.id" :transform="`translate(${14 + i * 134} 11)`">
          <circle :cx="0" cy="9" r="6" fill="var(--color-sorot)" />
          <text x="13" y="6" font-size="7" fill="var(--color-teks)">{{ operasi.id }}</text>
          <text x="13" y="18" font-size="6" fill="var(--color-teks-samar)">{{ operasi.sumber }}</text>
        </g>
      </g>

      <g transform="translate(0 0)">
        <text x="34" y="112" font-size="8" letter-spacing="0.12em" fill="var(--color-teks-samar)">ALUR ASINKRON</text>
        <line
          v-for="(_, i) in simpul.slice(0, -1)"
          :key="`ruas-${i}`"
          :x1="xSimpul(i) + 13"
          :x2="xSimpul(i + 1) - 15"
          :y1="Y_ALUR"
          :y2="Y_ALUR"
          :stroke="simpulAktif(i + 1) ? 'var(--color-sorot)' : 'var(--color-garis-tegas)'"
          :stroke-width="simpulAktif(i + 1) ? 2.3 : 1.2"
          :stroke-dasharray="i >= 3 ? '5 4' : undefined"
          :marker-end="simpulAktif(i + 1) ? 'url(#panah-keandalan)' : undefined"
          :style="{ transition: `stroke ${durasi} var(--ease-keluar), stroke-width ${durasi} var(--ease-keluar)` }"
          :class="{ 'ruas-pulih': simpulAktif(i + 1) && i >= 3 && !gerakDikurangi }"
        />
        <g v-for="(item, i) in simpul" :key="item.id" :opacity="simpulAktif(i) ? 1 : 0.36" :style="{ transition: `opacity ${durasi} var(--ease-keluar)` }">
          <circle :cx="xSimpul(i)" :cy="Y_ALUR" :r="simpulAktif(i) ? 13 : 10" :fill="simpulAktif(i) ? 'color-mix(in oklab, var(--color-sorot) 28%, var(--color-panel))' : 'var(--color-panel-naik)'" stroke="var(--color-garis-tegas)" stroke-width="1.4" />
          <text :x="xSimpul(i)" :y="Y_ALUR + 36" font-size="7" text-anchor="middle" :fill="simpulAktif(i) ? 'var(--color-teks)' : 'var(--color-teks-samar)'">{{ item.nama }}</text>
          <text :x="xSimpul(i)" :y="Y_ALUR + 48" font-size="6" text-anchor="middle" fill="var(--color-teks-samar)">{{ item.ringkas }}</text>
        </g>
      </g>

      <g transform="translate(34 196)">
        <text x="0" y="0" font-size="8" letter-spacing="0.12em" fill="var(--color-teks-samar)">STATUS analysis_runs</text>
        <g v-for="(status, i) in statusRuns" :key="status.id" :transform="`translate(${i * 138} 18)`" :opacity="status.id === statusAktif ? 1 : 0.48">
          <rect x="0" y="0" width="122" height="46" rx="7" :fill="status.id === statusAktif ? 'color-mix(in oklab, var(--color-sorot) 16%, var(--color-panel))' : 'var(--color-panel-naik)'" :stroke="status.id === statusAktif ? 'var(--color-sorot)' : 'var(--color-garis-tegas)'" />
          <text x="10" y="18" font-size="9" fill="var(--color-teks)">{{ status.nama }}</text>
          <text x="10" y="33" font-size="6" fill="var(--color-teks-samar)">{{ status.sumber }}</text>
        </g>
      </g>

      <g transform="translate(34 288)">
        <text x="0" y="0" font-size="8" letter-spacing="0.12em" fill="var(--color-teks-samar)">BUKTI BAB 4</text>
        <g v-for="(item, i) in angkaUtama" :key="item.id" :transform="`translate(${i * 226} 17)`">
          <rect x="0" y="0" width="206" height="56" rx="8" fill="var(--color-panel-naik)" stroke="var(--color-garis)" />
          <text x="12" y="19" font-size="16" fill="var(--color-sorot)">{{ item.tampil }}</text>
          <text x="12" y="35" font-size="7" fill="var(--color-teks)">{{ item.label }}</text>
          <text x="12" y="48" font-size="6" fill="var(--color-teks-samar)">{{ item.sumber }}</text>
        </g>
      </g>
    </svg>

    <div class="grid gap-2 border-t border-garis pt-3 lg:grid-cols-[1fr_1.1fr]">
      <section class="rounded-kartu border border-garis bg-panel-naik p-3">
        <p class="label-teknis text-teks-redup">Picu keadaan</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <button
            v-for="status in statusRuns"
            :key="status.id"
            type="button"
            class="label-teknis rounded-hairline border px-2 py-1"
            :class="statusKelas(status.id)"
            @click="emit('update:statusAktif', status.id)"
          >
            {{ status.nama }}
          </button>
        </div>
        <p class="mt-2 text-mikro leading-snug text-teks-samar">{{ statusTerpilih?.arti }}</p>
        <p class="label-teknis mt-1">{{ statusTerpilih?.sumber }}</p>
      </section>

      <section class="rounded-kartu border border-garis bg-panel-naik p-3">
        <div class="flex items-center justify-between gap-2">
          <p class="label-teknis text-teks-redup">Mekanisme aktif</p>
          <p class="label-teknis text-sorot">{{ skenarioAktif?.id }} · {{ skenarioAktif?.hasil }}</p>
        </div>
        <div class="mt-2 grid gap-2 sm:grid-cols-2">
          <article v-for="item in mekanismeAktif" :key="item.id" class="rounded-hairline border border-garis px-2 py-1.5">
            <p class="label-teknis text-teks">{{ item.judul }}</p>
            <p class="mt-1 text-mikro leading-snug text-teks-samar">{{ item.isi }}</p>
            <p class="label-teknis mt-1">{{ item.kunci ?? item.sumberKode ?? item.sumber }}</p>
          </article>
        </div>
        <p class="mt-2 text-mikro text-teks-samar">
          Operasional: <span v-for="item in angkaOperasional" :key="item.id" class="mr-3"><strong class="text-sorot">{{ item.tampil }}</strong> {{ item.label }}</span>
        </p>
      </section>
    </div>
  </figure>
</template>

<style scoped>
.ruas-pulih {
  animation: pulih 680ms linear infinite;
}

@keyframes pulih {
  to {
    stroke-dashoffset: -12;
  }
}
</style>
