import { onMounted, ref } from 'vue'

export type Tema = 'gelap' | 'terang' | 'sistem'

const KUNCI_SIMPAN = 'ariadne-tema'

/**
 * Tema tersimpan di localStorage dan dipasang sebagai atribut data-tema di <html>.
 * Nilai "sistem" berarti mengikuti prefers-color-scheme.
 */
export function useTema() {
  const tema = ref<Tema>('sistem')

  const terapkan = (nilai: Tema) => {
    tema.value = nilai
    const akar = document.documentElement
    if (nilai === 'sistem') {
      akar.removeAttribute('data-tema')
      localStorage.removeItem(KUNCI_SIMPAN)
    } else {
      akar.setAttribute('data-tema', nilai)
      localStorage.setItem(KUNCI_SIMPAN, nilai)
    }
  }

  const gantiTema = () => {
    const sistemGelap = window.matchMedia('(prefers-color-scheme: dark)').matches
    const sekarangGelap = tema.value === 'gelap' || (tema.value === 'sistem' && sistemGelap)
    terapkan(sekarangGelap ? 'terang' : 'gelap')
  }

  onMounted(() => {
    const tersimpan = localStorage.getItem(KUNCI_SIMPAN)
    if (tersimpan === 'gelap' || tersimpan === 'terang') terapkan(tersimpan)
  })

  return { tema, terapkan, gantiTema }
}
