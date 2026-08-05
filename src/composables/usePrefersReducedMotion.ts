import { onBeforeUnmount, onMounted, readonly, ref } from 'vue'

const KUERI = '(prefers-reduced-motion: reduce)'

/**
 * Menyalakan mode statis ketika sistem pengguna meminta pengurangan gerak.
 * Dipakai setiap adegan untuk memilih antara animasi dan tampilan diam.
 */
export function usePrefersReducedMotion() {
  const gerakDikurangi = ref(
    typeof window !== 'undefined' && window.matchMedia(KUERI).matches,
  )

  let mql: MediaQueryList | null = null
  const tanggapi = (e: MediaQueryListEvent) => {
    gerakDikurangi.value = e.matches
  }

  onMounted(() => {
    mql = window.matchMedia(KUERI)
    gerakDikurangi.value = mql.matches
    mql.addEventListener('change', tanggapi)
  })

  onBeforeUnmount(() => {
    mql?.removeEventListener('change', tanggapi)
    mql = null
  })

  return { gerakDikurangi: readonly(gerakDikurangi) }
}
