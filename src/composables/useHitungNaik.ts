import { onBeforeUnmount, ref, watch, type Ref } from 'vue'

/**
 * Bagian sebuah angka siap tayang.
 *
 * `angka` bernilai `null` bila bentuk tampilnya tidak memuat bilangan yang
 * dapat dihitung naik, misalnya "hampir separuh". Dalam keadaan itu bentuk
 * tampilnya dipakai apa adanya, tidak diganti bilangan tebakan.
 */
export interface BagianAngka {
  awalan: string
  angka: string | null
  akhiran: string
}

/**
 * Memisahkan bentuk tampil menjadi awalan, bilangan, dan akhiran.
 *
 * Pemisahan dilakukan terhadap bilangan yang benar-benar tercatat pada
 * `nilai`, bukan terhadap digit pertama yang ditemukan. "1 : 150" dengan
 * `nilai` 150 karena itu menghasilkan awalan "1 : ", bukan awalan kosong.
 */
export function pisahAngka(tampil: string, nilai: number | null): BagianAngka {
  if (nilai === null) return { awalan: '', angka: null, akhiran: '' }

  const teks = String(nilai)
  const posisi = tampil.indexOf(teks)
  if (posisi < 0) return { awalan: '', angka: null, akhiran: '' }

  return {
    awalan: tampil.slice(0, posisi),
    angka: teks,
    akhiran: tampil.slice(posisi + teks.length),
  }
}

export interface OpsiHitungNaik {
  /** Nilai akhir. `null` berarti tidak ada yang dihitung. */
  target: Ref<number | null>
  /** Hitungan berjalan sekali saat nilai ini berubah menjadi benar. */
  jalan: Ref<boolean>
  gerakDikurangi: Ref<boolean>
  /**
   * Panjang hitungan. Sengaja lebih panjang daripada transisi antarmuka biasa
   * karena gerakannya adalah pembacaan data, bukan umpan balik kendali.
   */
  durasi?: number
}

/**
 * Menghitung sebuah angka dari nol sampai nilai akhirnya.
 *
 * Composable ini tidak tahu angka apa yang dihitung dan tidak menyimpan angka
 * apa pun; nilainya selalu datang dari lapisan data lewat `target`.
 */
export function useHitungNaik(opsi: OpsiHitungNaik) {
  const durasi = opsi.durasi ?? 720
  const nilaiTampil = ref(0)

  let bingkai = 0

  const hentikan = () => {
    if (bingkai) cancelAnimationFrame(bingkai)
    bingkai = 0
  }

  const jalankan = () => {
    const akhir = opsi.target.value
    if (akhir === null) return

    hentikan()

    if (opsi.gerakDikurangi.value) {
      nilaiTampil.value = akhir
      return
    }

    const mulai = performance.now()
    const langkah = (waktu: number) => {
      const bagian = Math.min(1, (waktu - mulai) / durasi)
      // Melambat di ujung: pembacaan berhenti pelan, bukan terpotong.
      const laju = 1 - Math.pow(1 - bagian, 3)
      nilaiTampil.value = akhir * laju
      if (bagian < 1) {
        bingkai = requestAnimationFrame(langkah)
      } else {
        nilaiTampil.value = akhir
        bingkai = 0
      }
    }
    bingkai = requestAnimationFrame(langkah)
  }

  watch(
    () => opsi.jalan.value,
    (kini, dulu) => {
      if (kini && !dulu) jalankan()
    },
    { immediate: true },
  )

  onBeforeUnmount(hentikan)

  return { nilaiTampil }
}
