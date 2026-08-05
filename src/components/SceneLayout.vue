<script setup lang="ts">
import { provide, ref, toRef } from 'vue'
import { useScrollScene } from '@/composables/useScrollScene'
import { usePrefersReducedMotion } from '@/composables/usePrefersReducedMotion'
import { KUNCI_ADEGAN } from '@/composables/adegan'

const props = defineProps<{
  /** Kode adegan pada peta adegan, misalnya S03. */
  kode: string
  judul: string
  /** Kalimat tunggal yang menyatakan apa yang dijelaskan adegan ini. */
  ikhtisar?: string
}>()

const akar = ref<HTMLElement | null>(null)
const { langkahAktif, jumlahLangkah, progres } = useScrollScene({ akar })
const { gerakDikurangi } = usePrefersReducedMotion()

provide(KUNCI_ADEGAN, {
  kode: props.kode,
  langkahAktif,
  jumlahLangkah,
  progres,
  gerakDikurangi,
})

const idAdegan = toRef(props, 'kode')
</script>

<template>
  <section
    :id="idAdegan"
    ref="akar"
    data-adegan
    :data-kode="kode"
    :aria-label="`Adegan ${kode}: ${judul}`"
    class="relative border-t border-garis"
  >
    <header
      class="mx-auto flex max-w-[92rem] flex-col gap-2 px-5 pt-[var(--napas-adegan)] pb-8 md:px-8 lg:px-12"
    >
      <p class="label-teknis">{{ kode }}</p>
      <h2 class="text-j2 text-teks">{{ judul }}</h2>
      <p v-if="ikhtisar" class="max-w-[52ch] text-kecil text-teks-redup">
        {{ ikhtisar }}
      </p>
    </header>

    <div
      class="mx-auto grid max-w-[92rem] gap-y-6 px-5 pb-[var(--napas-adegan)] md:px-8 lg:grid-cols-[minmax(0,38ch)_minmax(0,1fr)] lg:gap-x-14 lg:px-12"
    >
      <!--
        Di bawah 1024 px kolom visual naik ke atas narasi (bukan disembunyikan)
        dan tetap menempel sebagai panel tipis di puncak layar.
      -->
      <div
        class="sticky top-[var(--tinggi-kepala)] z-20 order-1 lg:order-2 lg:z-auto lg:h-[calc(100vh-var(--tinggi-kepala))] lg:py-[12vh]"
      >
        <div
          class="h-[42vh] overflow-hidden rounded-panel border border-garis bg-panel shadow-[0_1px_0_0_var(--color-garis-tegas)_inset] lg:h-full"
        >
          <slot
            name="visual"
            :langkah="langkahAktif"
            :jumlah-langkah="jumlahLangkah"
            :progres="progres"
            :gerak-dikurangi="gerakDikurangi"
          />
        </div>
        <p class="sr-only"><slot name="alternatif" /></p>
      </div>

      <div class="order-2 flex flex-col lg:order-1">
        <slot name="narasi" />
      </div>
    </div>
  </section>
</template>
