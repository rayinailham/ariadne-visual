/**
 * S05 — Korpus RAG dan penyimpanan dokumen.
 *
 * Nilai vektor tidak pernah dipublikasikan pada artefak evaluasi, jadi
 * `potonganVektor` bernilai `null`. Jangan mengarang angka pengganti.
 */

import type { Angka, Bersumber, Butir } from './tipe'

export interface KelompokKorpus extends Bersumber {
  id: string
  nama: string
  jumlahBerkas: number
  jumlahUnit: number
  fokus: string
}

export const kelompokKorpus: KelompokKorpus[] = [
  {
    id: 'riasec',
    nama: 'RIASEC',
    jumlahBerkas: 4,
    jumlahUnit: 28,
    fokus: 'Teori Holland, validitas minat, konteks remaja dan Asia.',
    sumber: 'bab3-metodologi/tabel-lama/korpus-rag.tex:14',
  },
  {
    id: 'ocean',
    nama: 'OCEAN',
    jumlahBerkas: 4,
    jumlahUnit: 27,
    fokus: 'Fondasi Big Five, luaran karier, facet dan remaja.',
    sumber: 'bab3-metodologi/tabel-lama/korpus-rag.tex:15',
  },
  {
    id: 'via_is',
    nama: 'VIA-IS',
    jumlahBerkas: 4,
    jumlahUnit: 28,
    fokus: 'Klasifikasi 24 kekuatan, kesejahteraan, konteks pelajar.',
    sumber: 'bab3-metodologi/tabel-lama/korpus-rag.tex:16',
  },
  {
    id: 'cross',
    nama: 'Cross',
    jumlahBerkas: 5,
    jumlahUnit: 44,
    fokus: 'Integrasi lintas-instrumen, adaptabilitas karier, PMAI.',
    sumber: 'bab3-metodologi/tabel-lama/korpus-rag.tex:17',
  },
]

/** Sebaran unit per berkas asal, dihitung dari manifest penyemaian. */
export const berkasKorpus: Array<Bersumber & { berkas: string; unit: number }> = [
  { berkas: 'riasec/holland-theory.txt', unit: 8, sumber: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json' },
  { berkas: 'riasec/validation-research.txt', unit: 12, sumber: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json' },
  { berkas: 'riasec/adolescent-and-cross-cultural.txt', unit: 7, sumber: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json' },
  { berkas: 'riasec/recent-interest-evidence.txt', unit: 1, sumber: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json' },
  { berkas: 'ocean/big-five.txt', unit: 6, sumber: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json' },
  { berkas: 'ocean/career-outcomes.txt', unit: 13, sumber: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json' },
  { berkas: 'ocean/adolescent-and-facets.txt', unit: 7, sumber: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json' },
  { berkas: 'ocean/education-and-work-development.txt', unit: 1, sumber: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json' },
  { berkas: 'via-is/character-strengths.txt', unit: 7, sumber: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json' },
  { berkas: 'via-is/wellbeing-research.txt', unit: 13, sumber: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json' },
  { berkas: 'via-is/youth-and-education.txt', unit: 7, sumber: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json' },
  { berkas: 'via-is/vocational-identity-review.txt', unit: 1, sumber: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json' },
  { berkas: 'cross-reference/pmai-archetypes.txt', unit: 15, sumber: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json' },
  { berkas: 'cross-reference/integration-research.txt', unit: 13, sumber: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json' },
  { berkas: 'cross-reference/career-adaptability.txt', unit: 7, sumber: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json' },
  { berkas: 'cross-reference/cross-analysis.txt', unit: 6, sumber: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json' },
  { berkas: 'cross-reference/recent-integration-evidence.txt', unit: 3, sumber: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json' },
]

export interface KolomTabel extends Bersumber {
  nama: string
  tipe: string
  arti: string
}

/** Anatomi baris `reference_documents` sebagaimana terbentuk setelah migrasi. */
export const kolomReferenceDocuments: KolomTabel[] = [
  { nama: 'id', tipe: 'UUID', arti: 'Identitas dokumen; inilah yang dipersist pada relasi keterlacakan.', sumber: 'ecosystem-futureguide/migrations/001_reference_documents.up.sql:4' },
  { nama: 'assessment_type', tipe: 'TEXT', arti: 'riasec, ocean, via_is, atau cross. Dipakai sebagai filter pencarian.', sumber: 'ecosystem-futureguide/migrations/001_reference_documents.up.sql:5' },
  { nama: 'domain', tipe: 'TEXT', arti: 'Domain atau kekuatan karakter yang dibahas unit ini.', sumber: 'ecosystem-futureguide/migrations/001_reference_documents.up.sql:6' },
  { nama: 'title', tipe: 'TEXT', arti: 'Judul unit; ikut dipaparkan pada respons API.', sumber: 'ecosystem-futureguide/migrations/001_reference_documents.up.sql:7' },
  { nama: 'content', tipe: 'TEXT', arti: 'Isi unit yang disematkan dan diinjeksikan ke prompt.', sumber: 'ecosystem-futureguide/migrations/001_reference_documents.up.sql:8' },
  { nama: 'embedding', tipe: 'vector(768)', arti: 'Vektor hasil penyematan; semula DOUBLE PRECISION[], dimigrasikan ke tipe vector.', sumber: 'ecosystem-futureguide/migrations/014_pgvector_embeddings.up.sql:26' },
  { nama: 'source', tipe: 'TEXT', arti: 'Rujukan primer unit ini.', sumber: 'ecosystem-futureguide/migrations/001_reference_documents.up.sql:10' },
  { nama: 'tags', tipe: 'TEXT[]', arti: 'Label tambahan; dipakai skoring jalur cadangan.', sumber: 'ecosystem-futureguide/migrations/001_reference_documents.up.sql:11' },
  { nama: 'checksum', tipe: 'CHAR(64)', arti: 'Checksum isi; menjaga penyemaian tetap idempoten.', sumber: 'ecosystem-futureguide/migrations/051_reference_document_lifecycle.up.sql:4' },
  { nama: 'embedding_model', tipe: 'TEXT', arti: 'Model penyematan yang dipakai unit ini.', sumber: 'ecosystem-futureguide/migrations/051_reference_document_lifecycle.up.sql:5' },
  { nama: 'embedding_status', tipe: 'TEXT', arti: "ready bila vektor ada dan normanya bukan nol, selain itu missing.", sumber: 'ecosystem-futureguide/migrations/051_reference_document_lifecycle.up.sql:6' },
  { nama: 'source_identity', tipe: 'TEXT', arti: 'Identitas sumber akademik; satu sumber dapat mendasari beberapa unit.', sumber: 'ecosystem-futureguide/migrations/051_reference_document_lifecycle.up.sql:7' },
  { nama: 'origin_file', tipe: 'TEXT', arti: 'Berkas asal unit di direktori knowledge.', sumber: 'ecosystem-futureguide/migrations/051_reference_document_lifecycle.up.sql:11' },
  { nama: 'created_at', tipe: 'TIMESTAMPTZ', arti: 'Waktu penyisipan; menjadi urutan pada jalur cadangan.', sumber: 'ecosystem-futureguide/migrations/001_reference_documents.up.sql:12' },
]

export interface ContohBarisKorpus extends Bersumber {
  id: string
  assessmentType: string
  domain: string
  title: string
  source: string
  originFile: string
  embeddingModel: string
  /** Dimensi vektor; nilainya sendiri tidak dipublikasikan. */
  dimensiVektor: number
  /** Selalu `null`: artefak tidak memuat nilai vektor. */
  potonganVektor: number[] | null
  catatanVektor: string
}

export const contohBarisKorpus: ContohBarisKorpus = {
  id: 'unit:2dde45309d4378673b6241ecfa4b4a893d0dd6b7c2d2e85b1813d99a79e368e8',
  assessmentType: 'cross',
  domain: 'Innocent',
  title: 'Archetype 1 — The Innocent: Profile Pattern and Score Indicators',
  source:
    'Pearson, C. S. (1991). Awakening the heroes within: Twelve archetypes to help us find ourselves and transform our world.',
  originFile: 'cross-reference/pmai-archetypes.txt',
  embeddingModel: 'gemini-embedding-001',
  dimensiVektor: 768,
  potonganVektor: null,
  catatanVektor:
    'Artefak evaluasi tidak memuat nilai vektor mana pun. Yang terverifikasi hanya dimensinya 768 dan norma 1,000000 pada sampel yang diperiksa.',
  sumber: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
}

export interface ParameterIndeks extends Bersumber {
  nama: string
  nilai: string
  arti: string
}

export const indeksHnsw: Bersumber & {
  pernyataan: string
  operatorKelas: string
  parameter: ParameterIndeks[]
} = {
  pernyataan:
    'CREATE INDEX idx_ref_docs_embedding_hnsw ON reference_documents USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64)',
  operatorKelas: 'vector_cosine_ops',
  parameter: [
    {
      nama: 'm',
      nilai: '16',
      arti: 'Jumlah maksimum tetangga yang disimpan tiap simpul pada satu lapisan graf.',
      sumber: 'ecosystem-futureguide/migrations/014_pgvector_embeddings.up.sql:47',
    },
    {
      nama: 'ef_construction',
      nilai: '64',
      arti: 'Ukuran daftar kandidat saat graf dibangun; makin besar, graf makin teliti dan makin lambat dibangun.',
      sumber: 'ecosystem-futureguide/migrations/014_pgvector_embeddings.up.sql:47',
    },
  ],
  sumber: 'ecosystem-futureguide/migrations/014_pgvector_embeddings.up.sql:44',
}

export const langkahIngest: Array<Bersumber & { id: string; judul: string; isi: string }> = [
  {
    id: 'uraikan',
    judul: 'Uraikan berkas menjadi unit',
    isi: '17 berkas di direktori knowledge diuraikan menjadi 127 unit dokumen yang berasal dari 112 sumber akademik unik.',
    sumber: 'bab3.tex:90',
  },
  {
    id: 'sematkan',
    judul: 'Sematkan sebagai dokumen',
    isi: 'Setiap unit disematkan dengan jenis tugas RETRIEVAL_DOCUMENT memakai gemini-embedding-001.',
    sumber: 'bab3.tex:204',
  },
  {
    id: 'normalisasi',
    judul: 'Normalisasi L2',
    isi: 'Seluruh vektor dinormalisasi L2, sehingga kesamaan kosinus setara dot product dan operator jarak pgvector dapat dipakai langsung.',
    sumber: 'bab3.tex:204',
  },
  {
    id: 'simpan',
    judul: 'Simpan ke kolom vector(768)',
    isi: 'Program penyemaian idempoten: menjalankannya ulang tidak menggandakan unit dan menolak vektor yang seluruh elemennya nol.',
    sumber: 'bab3.tex:94',
  },
  {
    id: 'indeks',
    judul: 'Bangun indeks HNSW',
    isi: 'Indeks dibangun dengan kelas operator vector_cosine_ops, m = 16, dan ef_construction = 64.',
    sumber: 'ecosystem-futureguide/migrations/014_pgvector_embeddings.up.sql:44',
  },
]

export const angkaKorpus: Angka[] = [
  {
    id: 'korpus.unit',
    adegan: 'S05',
    label: 'Unit dokumen korpus',
    nilai: 127,
    tampil: '127',
    satuan: 'unit',
    status: 'terukur',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:18',
  },
  {
    id: 'korpus.sumber-unik',
    adegan: 'S05',
    label: 'Sumber akademik unik',
    nilai: 112,
    tampil: '112',
    satuan: 'sumber',
    status: 'terukur',
    catatan: 'Satu sumber dapat mendasari lebih dari satu unit.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:19',
  },
  {
    id: 'korpus.berkas',
    adegan: 'S05',
    label: 'Berkas chunk',
    nilai: 17,
    tampil: '17',
    satuan: 'berkas',
    status: 'terukur',
    sumber: 'bab3.tex:90',
  },
  {
    id: 'korpus.dimensi-vektor',
    adegan: 'S05',
    label: 'Dimensi vektor',
    nilai: 768,
    tampil: '768',
    satuan: 'dimensi',
    status: 'terukur',
    sumber: 'bab3.tex:204',
  },
  {
    id: 'korpus.norma-vektor',
    adegan: 'S05',
    label: 'Norma vektor sampel',
    nilai: 1,
    tampil: '1,000000',
    status: 'terukur',
    catatan: 'Sampel vektor yang diperiksa berdimensi 768 dengan norma 1,000000 sesuai normalisasi L2.',
    sumber: 'bab4.tex:50',
  },
  {
    id: 'korpus.hnsw-m',
    adegan: 'S05',
    label: 'Parameter HNSW m',
    nilai: 16,
    tampil: '16',
    status: 'terukur',
    sumber: 'ecosystem-futureguide/migrations/014_pgvector_embeddings.up.sql:47',
  },
  {
    id: 'korpus.hnsw-ef-construction',
    adegan: 'S05',
    label: 'Parameter HNSW ef_construction',
    nilai: 64,
    tampil: '64',
    status: 'terukur',
    sumber: 'ecosystem-futureguide/migrations/014_pgvector_embeddings.up.sql:47',
  },
]

export const catatanKorpus: Butir[] = [
  {
    id: 'status-embedding-manifest',
    judul: 'Manifest mencatat status missing',
    isi: 'Manifest penyemaian bertanggal 22 Juli 2026 mencatat embedding_status "missing" pada seluruh 127 unit, karena manifest ditulis sebelum vektor terpasang. Basis data yang dievaluasi Bab 4 mencatat seluruh unit siap dipakai tanpa nilai NULL pada ruas status.',
    catatan: 'Dua sumber, dua saat pengamatan. Keduanya ditampilkan apa adanya.',
    sumber: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json + bab4.tex:50',
  },
  {
    id: 'kecukupan-korpus',
    judul: 'Kecukupan dinilai deskriptif',
    isi: 'Kecukupan korpus dinilai melalui enam kriteria deskriptif, bukan target jumlah dokumen: cakupan konstruk, kepadatan minimal satu unit per konstruk, kesesuaian dengan lima kueri, kelengkapan sitasi primer, keselarasan dengan anggaran referensi, dan kelayakan beban penilaian manusia.',
    sumber: 'bab3.tex:98',
  },
  {
    id: 'bahan-ditolak',
    judul: 'Empat jenis bahan ditolak',
    isi: 'Bahan tanpa identitas sumber yang jelas, bahan di luar tema kelima kueri, klaim pemasaran penyedia layanan asesmen, dan salinan panjang teks berhak cipta.',
    sumber: 'bab3.tex:100',
  },
  {
    id: 'batas-atas-korpus',
    judul: 'Korpus adalah batas atas penambatan',
    isi: 'Cakupan korpus menjadi batas atas mutu penambatan sumber. Pertanyaan di luar cakupan tetap dijawab, tetapi tanpa dukungan referensi yang memadai.',
    sumber: 'bab3.tex:100',
  },
]
