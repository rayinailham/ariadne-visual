<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import type { Angka, Bersumber, JenisTugasEmbedding } from '@/data'
import { useThree } from '@/composables/useThree'

const props = defineProps<{
  langkah: number
  jumlahLangkah: number
  gerakDikurangi: boolean
  angka: Angka[]
  jenisTugas: JenisTugasEmbedding[]
  contoh: Bersumber & { profil: string; judulDokumen: string; similarity: number }
  label: Bersumber & {
    judulVisual: string
    proyeksi: string
    dokumen: string
    kueri: string
    bolaSatuan: string
    norma: string
    sudut: string
    kosinus: string
    dotProduct: string
    pasanganTerukur: string
    batasProyeksi: string
    modeBergerak: string
    modeStatis: string
  }
}>()

const wadah = ref<HTMLElement | null>(null)
const angkaDenganId = (id: string) => props.angka.find((item) => item.id === id)
const jumlahDokumen = computed(() => angkaDenganId('korpus.unit')?.nilai ?? 0)
const jumlahKueri = computed(() => angkaDenganId('rag.jumlah-kueri')?.nilai ?? 0)
const dimensi = computed(() => angkaDenganId('rag.dimensi-embedding'))
const norma = computed(() => angkaDenganId('korpus.norma-vektor'))
const sudut = computed(() => (Math.acos(props.contoh.similarity) * 180) / Math.PI)
const labelGambar = computed(() =>
  `${props.label.proyeksi}; ${jumlahDokumen.value} ${props.label.dokumen}; ${jumlahKueri.value} ${props.label.kueri}; ${props.label.norma} ${norma.value?.tampil}; ${props.label.kosinus} ${props.contoh.similarity.toFixed(6)}`,
)

useThree({
  wadah,
  jumlahDokumen: jumlahDokumen.value,
  jumlahKueri: jumlahKueri.value,
  similarity: props.contoh.similarity,
  gerakDikurangi: toRef(props, 'gerakDikurangi'),
  langkah: toRef(props, 'langkah'),
})
</script>

<template>
  <figure class="relative flex h-full min-h-0 flex-col p-4 md:p-5" :aria-label="labelGambar">
    <figcaption class="relative z-10 flex items-baseline justify-between gap-3">
      <span class="label-teknis">{{ label.judulVisual }}</span>
      <span class="label-teknis text-sorot">langkah {{ langkah + 1 }}/{{ jumlahLangkah }}</span>
    </figcaption>

    <div class="relative mt-3 min-h-0 flex-1 overflow-hidden rounded-kartu border border-garis bg-latar-dalam">
      <div ref="wadah" class="absolute inset-0" data-webgl-state="menunggu" />
      <p class="absolute top-3 left-3 max-w-[30ch] rounded-hairline border border-garis bg-panel/90 px-2 py-1 label-teknis text-teks-redup backdrop-blur-sm">
        {{ label.proyeksi }}
      </p>
      <p class="absolute top-3 right-3 rounded-hairline border border-garis bg-panel/90 px-2 py-1 font-mono text-[0.62rem] text-teks-samar backdrop-blur-sm">
        {{ gerakDikurangi ? label.modeStatis : label.modeBergerak }}
      </p>

      <div class="absolute bottom-3 left-3 grid gap-1.5 font-mono text-[0.64rem]">
        <p class="flex items-center gap-2 text-teks-redup"><span class="h-2 w-2 rounded-full bg-teks-redup" />{{ jumlahDokumen }} {{ label.dokumen }}</p>
        <p class="flex items-center gap-2 text-sorot"><span class="h-2 w-2 rounded-full bg-sorot" />{{ jumlahKueri }} {{ label.kueri }}</p>
        <p class="flex items-center gap-2 text-benar"><span class="h-2 w-2 rounded-full bg-benar" />{{ label.pasanganTerukur }}</p>
      </div>

      <div
        class="absolute right-3 bottom-3 w-[min(48%,18rem)] rounded-kartu border border-garis bg-panel/92 p-3 backdrop-blur-sm transition-opacity duration-200"
        :class="langkah >= 3 ? 'opacity-100' : 'opacity-35'"
      >
        <p class="label-teknis">{{ label.sudut }} = {{ sudut.toFixed(2).replace('.', ',') }}°</p>
        <p class="mt-1 font-mono text-sorotan text-sorot">{{ label.kosinus }} = {{ contoh.similarity.toFixed(6) }}</p>
        <p class="mt-1 text-mikro text-teks-redup">{{ label.dotProduct }} = {{ contoh.similarity.toFixed(6) }}</p>
      </div>
    </div>

    <section class="mt-3 grid shrink-0 gap-2 sm:grid-cols-2">
      <div
        v-for="(jenis, indeks) in jenisTugas"
        :key="jenis.id"
        class="rounded-kartu border bg-panel-naik p-3 transition-[opacity,border-color] duration-200"
        :class="langkah >= indeks + 1 ? 'border-sorot opacity-100' : 'border-garis opacity-55'"
      >
        <code class="text-kecil text-sorot">{{ jenis.taskType }}</code>
        <p class="mt-1 text-mikro text-teks-redup">{{ jenis.dipakaiUntuk }}</p>
      </div>
    </section>

    <div class="mt-2 flex shrink-0 items-center justify-between gap-3 border-t border-garis pt-2 text-mikro text-teks-samar">
      <span>{{ dimensi?.tampil }}-D → 3D</span>
      <span>{{ label.bolaSatuan }} · {{ label.norma }} = {{ norma?.tampil }}</span>
    </div>
    <p v-if="langkah >= 5" class="mt-2 shrink-0 text-[0.64rem] leading-snug text-awas">{{ label.batasProyeksi }}</p>
  </figure>
</template>
