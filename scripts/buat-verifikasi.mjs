/**
 * Membangkitkan `scripts/verifikasi-angka.md` dari `src/data/`.
 *
 * Tabelnya sengaja tidak ditulis tangan: kalau angka di lapisan data berubah,
 * tabel auditnya ikut berubah tanpa peluang melenceng.
 *
 * Jalankan: npm run verifikasi
 */

import { build } from 'esbuild'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const AKAR = resolve(import.meta.dirname, '..')
const KELUARAN = join(AKAR, 'scripts', 'verifikasi-angka.md')

const URUTAN_ADEGAN = [
  ['S01', 'Masalah'],
  ['S02', 'Instrumen'],
  ['S03', 'Arsitektur'],
  ['S04', 'Keandalan'],
  ['S05', 'Korpus RAG'],
  ['S06', 'Skor menjadi kueri'],
  ['S07', 'Embedding'],
  ['S08', 'Pencarian dan top-k'],
  ['S09', 'Sintesis dan keterlacakan'],
  ['S10', 'Obrolan SSE'],
  ['S11', 'Hasil'],
  ['S12', 'Batasan'],
]

const LABEL_STATUS = {
  terukur: 'terukur',
  'tak-terdefinisi': 'tak terdefinisi (penyebut nol)',
  'tidak-diukur': 'tidak diukur (n/a)',
  'tanpa-bukti': 'tanpa angka pasti pada naskah',
}

function sel(teks) {
  return String(teks ?? '—').replaceAll('|', '\\|').replaceAll('\n', ' ')
}

async function muatData() {
  const dir = await mkdtemp(join(tmpdir(), 'ariadne-data-'))
  const berkas = join(dir, 'data.mjs')
  await build({
    entryPoints: [join(AKAR, 'src', 'data', 'index.ts')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile: berkas,
    logLevel: 'silent',
  })
  try {
    return await import(pathToFileURL(berkas).href)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

function bangunMarkdown({ semuaAngka, angkaTanpaNilai }) {
  const baris = []
  baris.push('# Verifikasi angka — lapisan data web visual')
  baris.push('')
  baris.push(
    '**Berkas ini dibangkitkan mesin.** Jangan disunting tangan; ubah `src/data/*.ts` lalu jalankan `npm run verifikasi`.',
  )
  baris.push('')
  baris.push(
    'Setiap angka yang tayang di situs wajib muncul di sini beserta berkas dan baris asalnya. Angka tanpa bukti ditulis kosong, tidak ditebak. Metrik yang penyebutnya nol ditulis tak terdefinisi, bukan nol.',
  )
  baris.push('')
  baris.push(
    `Total angka terdaftar: **${semuaAngka.length}**. Tanpa nilai numerik: **${angkaTanpaNilai.length}**.`,
  )
  baris.push('')

  for (const [kode, judul] of URUTAN_ADEGAN) {
    const kelompok = semuaAngka.filter((angka) => angka.adegan === kode)
    if (kelompok.length === 0) continue
    baris.push(`## ${kode} — ${judul}`)
    baris.push('')
    baris.push('| Angka | Tampil | Status | Sumber | Catatan |')
    baris.push('| --- | --- | --- | --- | --- |')
    for (const angka of kelompok) {
      const tampil =
        angka.pembilang !== undefined && angka.penyebut !== undefined
          ? `${angka.tampil} (${angka.pembilang}/${angka.penyebut})`
          : angka.tampil
      baris.push(
        `| ${sel(angka.label)} | ${sel(tampil)} | ${sel(LABEL_STATUS[angka.status] ?? angka.status)} | \`${sel(angka.sumber)}\` | ${sel(angka.catatan)} |`,
      )
    }
    baris.push('')
  }

  baris.push('## Angka tanpa nilai numerik')
  baris.push('')
  if (angkaTanpaNilai.length === 0) {
    baris.push('_Tidak ada._')
  } else {
    baris.push('| Angka | Adegan | Status | Sumber |')
    baris.push('| --- | --- | --- | --- |')
    for (const angka of angkaTanpaNilai) {
      baris.push(
        `| ${sel(angka.label)} | ${sel(angka.adegan)} | ${sel(LABEL_STATUS[angka.status] ?? angka.status)} | \`${sel(angka.sumber)}\` |`,
      )
    }
  }
  baris.push('')
  return baris.join('\n')
}

const data = await muatData()
await writeFile(KELUARAN, bangunMarkdown(data), 'utf8')
console.log(
  `tulis scripts/verifikasi-angka.md — ${data.semuaAngka.length} angka, ${data.angkaTanpaNilai.length} tanpa nilai`,
)
