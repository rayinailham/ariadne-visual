import { nextTick, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export interface OpsiAdegan {
  /** Elemen pembungkus satu adegan. Semua langkah dicari di dalamnya. */
  akar: Ref<HTMLElement | null>
  /** Pemilih elemen langkah narasi. Bawaan: elemen ber-atribut data-langkah. */
  pemilihLangkah?: string
  /**
   * Garis baca: posisi vertikal viewport tempat sebuah langkah dianggap aktif.
   * 0 = tepi atas, 1 = tepi bawah.
   */
  garisBaca?: number
}

/**
 * Mengikat gulir ke keadaan visual satu adegan.
 *
 * Kontrak lapisan: composable ini hanya menghasilkan angka keadaan
 * (`langkahAktif`, `progres`). Ia tidak menyentuh DOM visual dan tidak tahu
 * apa pun tentang isi adegan.
 */
export function useScrollScene(opsi: OpsiAdegan) {
  const pemilih = opsi.pemilihLangkah ?? '[data-langkah]'
  const garisBaca = opsi.garisBaca ?? 0.62

  const langkahAktif = ref(0)
  const jumlahLangkah = ref(0)
  /** Kemajuan gulir adegan, 0..1. */
  const progres = ref(0)

  let pemicu: ScrollTrigger[] = []

  const bersihkan = () => {
    pemicu.forEach((p) => p.kill())
    pemicu = []
  }

  const bangun = () => {
    bersihkan()
    const akar = opsi.akar.value
    if (!akar) return

    const langkah = Array.from(akar.querySelectorAll<HTMLElement>(pemilih))
    jumlahLangkah.value = langkah.length
    if (langkah.length === 0) return

    const persen = `${Math.round(garisBaca * 100)}%`

    langkah.forEach((el, i) => {
      el.dataset.indeks = String(i)
      pemicu.push(
        ScrollTrigger.create({
          trigger: el,
          start: `top ${persen}`,
          end: `bottom ${persen}`,
          onToggle: (self) => {
            if (self.isActive) langkahAktif.value = i
          },
        }),
      )
    })

    pemicu.push(
      ScrollTrigger.create({
        trigger: akar,
        start: 'top center',
        end: 'bottom center',
        onUpdate: (self) => {
          progres.value = self.progress
        },
      }),
    )

    ScrollTrigger.refresh()
  }

  onMounted(async () => {
    await nextTick()
    bangun()
  })

  onBeforeUnmount(bersihkan)

  return { langkahAktif, jumlahLangkah, progres, bangun }
}
