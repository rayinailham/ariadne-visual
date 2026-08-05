/**
 * Pintu masuk lapisan data. Adegan dan komponen viz mengimpor dari sini,
 * bukan dari berkas satuan, supaya kontrak lapisan tetap satu arah.
 *
 * Kontrak: viz tidak boleh punya angka hardcoded. Semua angka, label, dan
 * istilah berasal dari berkas di direktori ini.
 */

export * from './tipe'
export * from './masalah'
export * from './instrumen'
export * from './arsitektur'
export * from './korpus'
export * from './rag'
export * from './obrolan'
export * from './hasil'
export * from './batasan'

import { kumpulkanAngka, type Angka } from './tipe'
import { angkaMasalah } from './masalah'
import { angkaInstrumen } from './instrumen'
import { angkaArsitektur } from './arsitektur'
import { angkaKorpus } from './korpus'
import { angkaRag } from './rag'
import { angkaObrolan } from './obrolan'
import { angkaAblasiUntukAudit, angkaHasil, angkaObrolanUntukAudit } from './hasil'

/**
 * Seluruh angka yang tayang di situs, dalam satu daftar.
 * Dipakai `scripts/buat-verifikasi.mjs` untuk membangkitkan tabel audit.
 */
export const semuaAngka: Angka[] = kumpulkanAngka(
  angkaMasalah,
  angkaInstrumen,
  angkaArsitektur,
  angkaKorpus,
  angkaRag,
  angkaObrolan,
  angkaHasil,
  angkaAblasiUntukAudit,
  angkaObrolanUntukAudit,
)

/** Angka yang belum punya bukti angka pasti; ditampilkan apa adanya. */
export const angkaTanpaNilai: Angka[] = semuaAngka.filter((angka) => angka.nilai === null)

/**
 * Mengambil satu angka menurut slug-nya.
 *
 * Sengaja melempar galat bila slug tidak dikenal: adegan yang salah menulis
 * slug harus gagal saat dibuka, bukan menampilkan angka kosong tanpa sebab.
 */
export function angkaDenganId(id: string): Angka {
  const angka = semuaAngka.find((a) => a.id === id)
  if (!angka) throw new Error(`Angka tidak dikenal pada lapisan data: ${id}`)
  return angka
}
