/**
 * Tipe dasar lapisan data.
 *
 * Aturan yang tidak boleh dilanggar di fase mana pun:
 * 1. Setiap objek data membawa `sumber`: berkas + baris asalnya.
 * 2. Angka yang belum ada buktinya ditulis `nilai: null`, bukan ditebak.
 * 3. Metrik yang penyebutnya nol ditulis `tak-terdefinisi`, bukan 0.
 */

/** Kode adegan pada peta adegan `rencana/08-PLAN-WEB-VISUAL.md`. */
export type KodeAdegan =
  | 'S01'
  | 'S02'
  | 'S03'
  | 'S04'
  | 'S05'
  | 'S06'
  | 'S07'
  | 'S08'
  | 'S09'
  | 'S10'
  | 'S11'
  | 'S12'

/**
 * Status sebuah angka.
 *
 * - `terukur`         : ada nilai dan ada buktinya.
 * - `tak-terdefinisi` : penyebut nol, jadi nilainya memang tidak ada (bukan nol).
 * - `tidak-diukur`    : pengukurannya tidak dijalankan (n/a pada naskah).
 * - `tanpa-bukti`     : naskah menyebut besaran ini tanpa angka pasti.
 */
export type StatusAngka = 'terukur' | 'tak-terdefinisi' | 'tidak-diukur' | 'tanpa-bukti'

/** Objek apa pun di lapisan data wajib membawa asal-usulnya. */
export interface Bersumber {
  /** Berkas + baris, mis. `bab3.tex:206`. */
  sumber: string
}

/** Satu angka beserta bukti dan batasnya. */
export interface Angka extends Bersumber {
  /** Slug unik; dipakai tabel audit `scripts/verifikasi-angka.md`. */
  id: string
  /** Adegan yang memakai angka ini. */
  adegan: KodeAdegan
  label: string
  /** `null` bila status bukan `terukur`. Jangan pernah diisi tebakan. */
  nilai: number | null
  /** Bentuk siap tayang, memakai koma desimal sesuai register naskah. */
  tampil: string
  status: StatusAngka
  satuan?: string
  pembilang?: number
  penyebut?: number
  /** Batas pembacaan, deviasi, atau alasan status non-`terukur`. */
  catatan?: string
}

/** Butir naratif ber-sumber, dipakai daftar mekanisme dan batasan. */
export interface Butir extends Bersumber {
  id: string
  judul: string
  isi: string
  catatan?: string
}

/** Mengumpulkan angka dari beberapa kelompok menjadi satu daftar audit. */
export function kumpulkanAngka(...kelompok: Angka[][]): Angka[] {
  return kelompok.flat()
}
