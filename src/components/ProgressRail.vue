<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { RingkasanAdegan } from '@/composables/adegan'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps<{ adegan: RingkasanAdegan[] }>()

const aktif = ref<string>(props.adegan[0]?.id ?? '')
const kemajuan = ref(0)
let pemicu: ScrollTrigger[] = []

const lompat = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ block: 'start' })
}

onMounted(() => {
  props.adegan.forEach((a) => {
    const el = document.getElementById(a.id)
    if (!el) return
    pemicu.push(
      ScrollTrigger.create({
        trigger: el,
        start: 'top 40%',
        end: 'bottom 40%',
        onToggle: (self) => {
          if (self.isActive) aktif.value = a.id
        },
      }),
    )
  })

  pemicu.push(
    ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        kemajuan.value = self.progress
      },
    }),
  )
})

onBeforeUnmount(() => {
  pemicu.forEach((p) => p.kill())
  pemicu = []
})
</script>

<template>
  <!-- Bilah kemajuan seluruh dokumen. -->
  <div
    class="fixed inset-x-0 top-0 z-50 h-px bg-garis"
    role="progressbar"
    aria-label="Kemajuan membaca"
    :aria-valuenow="Math.round(kemajuan * 100)"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div
      class="h-px bg-sorot transition-[width] duration-100 ease-linear"
      :style="{ width: `${kemajuan * 100}%` }"
    />
  </div>

  <!-- Rel adegan. Tersembunyi di layar sempit; navigasi memakai daftar di kepala. -->
  <nav
    aria-label="Daftar adegan"
    class="fixed top-1/2 left-4 z-40 hidden -translate-y-1/2 xl:block"
  >
    <ol class="flex flex-col gap-1">
      <li v-for="a in adegan" :key="a.id">
        <button
          type="button"
          class="group flex w-[var(--lebar-rel)] items-center gap-2.5 rounded-hairline px-1 py-1 text-left"
          :aria-current="aktif === a.id ? 'true' : undefined"
          @click="lompat(a.id)"
        >
          <span
            aria-hidden="true"
            class="h-px transition-all duration-[var(--durasi-sedang)] ease-keluar"
            :class="
              aktif === a.id ? 'w-6 bg-sorot' : 'w-3 bg-garis-tegas group-hover:w-5'
            "
          />
          <span
            class="label-teknis shrink-0 transition-colors duration-[var(--durasi-sedang)]"
            :class="aktif === a.id ? 'text-sorot' : 'text-teks-samar'"
            >{{ a.kode }}</span
          >
          <span
            class="truncate font-antarmuka text-mikro transition-colors duration-[var(--durasi-sedang)]"
            :class="aktif === a.id ? 'text-teks' : 'text-teks-samar'"
            >{{ a.judul }}</span
          >
        </button>
      </li>
    </ol>
  </nav>
</template>
