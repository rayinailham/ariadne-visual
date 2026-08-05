<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import { pisahAngka, useHitungNaik } from '@/composables/useHitungNaik'
import type { Angka } from '@/data'

/**
 * Menampilkan satu angka dari lapisan data.
 *
 * Tiga aturan yang dijaga komponen ini:
 * 1. Sebelum langkahnya dibahas, angka belum ditampilkan sama sekali; yang
 *    tampil adalah tanda pisah, bukan nol.
 * 2. Angka berstatus bukan `terukur` tidak pernah dihitung naik. Bentuk
 *    tampilnya dipakai apa adanya beserta penanda statusnya.
 * 3. Tidak ada bilangan yang ditanam di dalam komponen.
 */
const props = defineProps<{
  angka: Angka
  /** Benar bila langkah pemilik angka ini sudah dilewati. */
  aktif: boolean
  gerakDikurangi: boolean
}>()

const bagian = computed(() => pisahAngka(props.angka.tampil, props.angka.nilai))

/** Sekali dibuka, angka tidak disembunyikan lagi saat penonton menggulir balik. */
const pernah = ref(props.aktif)
watch(
  () => props.aktif,
  (kini) => {
    if (kini) pernah.value = true
  },
  { immediate: true },
)

const { nilaiTampil } = useHitungNaik({
  target: computed(() => (bagian.value.angka === null ? null : props.angka.nilai)),
  jalan: pernah,
  gerakDikurangi: toRef(props, 'gerakDikurangi'),
})

/** Banyak angka di belakang koma diikutkan dari bentuk aslinya, tidak ditambah. */
const desimal = computed(() => {
  const pecahan = String(props.angka.nilai ?? '').split('.')[1]
  return pecahan ? pecahan.length : 0
})

const teksAngka = computed(() =>
  nilaiTampil.value.toLocaleString('id-ID', {
    minimumFractionDigits: desimal.value,
    maximumFractionDigits: desimal.value,
  }),
)

const terukur = computed(() => props.angka.status === 'terukur')
</script>

<template>
  <p class="font-antarmuka text-j3 leading-none tabular-nums lg:text-j2">
    <template v-if="!pernah">
      <span aria-hidden="true" class="opacity-40">—</span>
      <span class="sr-only">{{ angka.label }} belum dibahas</span>
    </template>

    <template v-else-if="bagian.angka === null">
      <span class="font-naskah text-sorotan italic">{{ angka.tampil }}</span>
    </template>

    <template v-else>
      <span v-if="bagian.awalan" class="text-kecil opacity-70">{{ bagian.awalan }}</span
      >{{ teksAngka
      }}<span v-if="bagian.akhiran" class="text-kecil opacity-70">{{ bagian.akhiran }}</span>
    </template>
  </p>

  <p v-if="pernah && !terukur" class="label-teknis mt-1 text-awas">
    {{ angka.status === 'tanpa-bukti' ? 'tanpa angka pasti' : angka.status }}
  </p>
</template>
