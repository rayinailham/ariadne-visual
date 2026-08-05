/**
 * S02 — Instrumen psikometrik dan lapisan sintesis PMAI.
 *
 * PMAI bukan instrumen keempat: siswa tidak menjawab butir PMAI. Lihat
 * `CONTEXT.md:24` sebelum menulis label apa pun di adegan ini.
 */

import type { Angka, Bersumber, Butir } from './tipe'

export interface Instrumen extends Bersumber {
  id: 'riasec' | 'ocean' | 'via_is'
  nama: string
  namaPanjang: string
  jumlahButir: number
  jumlahDomain: number
  /** `null` bila jumlah butir per domain tidak seragam. */
  butirPerDomain: number | null
  skorMaksimumDomain: number | null
  domain: string[]
  fokus: string
  statusButir: string
  sumberStatus: string
}

/** Enam domain RIASEC, urutan sesuai model Holland. */
export const domainRiasec = [
  'Realistic',
  'Investigative',
  'Artistic',
  'Social',
  'Enterprising',
  'Conventional',
] as const

/** Lima domain OCEAN mengikuti kerangka BFI-44. */
export const domainOcean = [
  'Openness',
  'Conscientiousness',
  'Extraversion',
  'Agreeableness',
  'Neuroticism',
] as const

/** 24 kekuatan karakter VIA-IS, urutan sesuai `retriever_eval_test.go`. */
export const domainVia = [
  'Creativity',
  'Curiosity',
  'Judgment',
  'LoveOfLearning',
  'Perspective',
  'Bravery',
  'Perseverance',
  'Honesty',
  'Zest',
  'Love',
  'Kindness',
  'SocialIntelligence',
  'Teamwork',
  'Fairness',
  'Leadership',
  'Forgiveness',
  'Humility',
  'Prudence',
  'SelfRegulation',
  'AppreciationOfBeauty',
  'Gratitude',
  'Hope',
  'Humor',
  'Spirituality',
] as const

export const instrumen: Instrumen[] = [
  {
    id: 'riasec',
    nama: 'RIASEC',
    namaPanjang: 'Model minat vokasional Holland',
    jumlahButir: 60,
    jumlahDomain: 6,
    butirPerDomain: 10,
    skorMaksimumDomain: 50,
    domain: [...domainRiasec],
    fokus: 'Minat vokasional dalam enam tipe.',
    statusButir:
      'Butir operasional berbasis kerangka enam domain Holland; bukan salinan resmi Self-Directed Search atau inventori Holland berlisensi.',
    sumberStatus: 'bab3-metodologi/tabel-lama/status-butir.tex:14',
    sumber: 'bab3.tex:80',
  },
  {
    id: 'ocean',
    nama: 'OCEAN',
    namaPanjang: 'Big Five, mengikuti kerangka BFI-44',
    jumlahButir: 44,
    jumlahDomain: 5,
    butirPerDomain: null,
    skorMaksimumDomain: null,
    domain: [...domainOcean],
    fokus: 'Lima dimensi kepribadian yang berkaitan dengan perilaku akademik dan pekerjaan.',
    statusButir:
      'Butir operasional berbasis kerangka BFI-44: jumlah butir, sebaran domain, dan pola pembalikan skor mengikuti struktur BFI-44 dalam bahasa Indonesia operasional.',
    sumberStatus: 'bab3-metodologi/tabel-lama/status-butir.tex:15',
    sumber: 'bab3.tex:80',
  },
  {
    id: 'via_is',
    nama: 'VIA-IS',
    namaPanjang: 'Values in Action Inventory of Strengths',
    jumlahButir: 96,
    jumlahDomain: 24,
    butirPerDomain: 4,
    skorMaksimumDomain: 20,
    domain: [...domainVia],
    fokus: '24 kekuatan karakter yang berhubungan dengan kesejahteraan dan pengembangan diri.',
    statusButir:
      'Butir operasional berbasis kerangka 24 kekuatan VIA, masing-masing empat butir; bukan VIA-IS 240 resmi maupun bentuk singkat berlisensi VIA Institute.',
    sumberStatus: 'bab3-metodologi/tabel-lama/status-butir.tex:16',
    sumber: 'bab3.tex:80',
  },
]

/** Jumlah butir OCEAN per domain; penyebut Persamaan skor OCEAN adalah 5n. */
export const butirOceanPerDomain: Array<{ domain: string; butir: number } & Bersumber> = [
  { domain: 'Openness', butir: 10, sumber: 'bab3.tex:182' },
  { domain: 'Conscientiousness', butir: 9, sumber: 'bab3.tex:182' },
  { domain: 'Extraversion', butir: 8, sumber: 'bab3.tex:182' },
  { domain: 'Agreeableness', butir: 9, sumber: 'bab3.tex:182' },
  { domain: 'Neuroticism', butir: 8, sumber: 'bab3.tex:182' },
]

export interface PersamaanSkor extends Bersumber {
  id: string
  instrumen: string
  rumus: string
  penjelasan: string
}

export const persamaanSkor: PersamaanSkor[] = [
  {
    id: 'riasec',
    instrumen: 'RIASEC',
    rumus: 'skor = round((Σ x_i, i = 1..10) / 50 × 100)',
    penjelasan: 'Sepuluh butir per domain dengan nilai maksimum 50.',
    sumber: 'bab3.tex:177',
  },
  {
    id: 'ocean',
    instrumen: 'OCEAN',
    rumus: "skor = round((Σ x'_i, i = 1..n) / (5n) × 100)",
    penjelasan:
      "Jumlah butir n tidak seragam. Butir reverse-keyed lebih dulu ditransformasi menjadi x' = 6 − x.",
    sumber: 'bab3.tex:184',
  },
  {
    id: 'via',
    instrumen: 'VIA-IS',
    rumus: 'skor = round((Σ x_i, i = 1..4) / 20 × 100)',
    penjelasan: 'Empat butir per kekuatan karakter dengan nilai maksimum 20.',
    sumber: 'bab3.tex:189',
  },
]

export const angkaInstrumen: Angka[] = [
  {
    id: 'instrumen.total-butir',
    adegan: 'S02',
    label: 'Butir per sesi asesmen',
    nilai: 200,
    tampil: '200',
    satuan: 'butir',
    status: 'terukur',
    catatan: '60 RIASEC + 44 OCEAN + 96 VIA-IS.',
    sumber: 'bab3.tex:80',
  },
  {
    id: 'instrumen.total-skor-domain',
    adegan: 'S02',
    label: 'Skor domain per profil',
    nilai: 35,
    tampil: '35',
    satuan: 'skor domain',
    status: 'terukur',
    catatan: '6 RIASEC + 5 OCEAN + 24 VIA-IS. Tidak ada skor gabungan lintas instrumen.',
    sumber: 'bab3.tex:80',
  },
  {
    id: 'instrumen.skala-jawaban',
    adegan: 'S02',
    label: 'Skala jawaban',
    nilai: 5,
    tampil: '1 sampai 5',
    status: 'terukur',
    sumber: 'bab3.tex:80',
  },
  {
    id: 'instrumen.rentang-skor-bawah',
    adegan: 'S02',
    label: 'Batas bawah skor domain',
    nilai: 20,
    tampil: '20',
    status: 'terukur',
    catatan:
      'Rentang teoretis 20 sampai 100, bukan 0 sampai 100 dan bukan persentil. Skema basis data memang lebih longgar (0 sampai 100).',
    sumber: 'bab3.tex:80',
  },
  {
    id: 'instrumen.rentang-skor-atas',
    adegan: 'S02',
    label: 'Batas atas skor domain',
    nilai: 100,
    tampil: '100',
    status: 'terukur',
    catatan: 'Diverifikasi uji unit pada `shared/scorer/scorer_test.go`.',
    sumber: 'bab4.tex:58',
  },
  {
    id: 'instrumen.arketipe-pmai',
    adegan: 'S02',
    label: 'Arketipe PMAI',
    nilai: 12,
    tampil: '12',
    satuan: 'arketipe',
    status: 'terukur',
    catatan:
      'Himpunan tertutup. PMAI adalah lapisan sintesis non-psikometrik, bukan instrumen keempat.',
    sumber: 'CONTEXT.md:24',
  },
]

/** Dua belas arketipe PMAI, persis seperti yang diinjeksikan ke prompt. */
export const arketipePmai: string[] = [
  'Innocent',
  'Orphan/Everyperson',
  'Warrior/Hero',
  'Caregiver',
  'Seeker/Explorer',
  'Lover',
  'Destroyer/Rebel',
  'Creator',
  'Ruler',
  'Magician',
  'Sage',
  'Jester/Fool',
]

export const sumberArketipePmai =
  'ecosystem-futureguide/analysis-worker/internal/gemini/prompt.go:141'

export const catatanPmai: Butir[] = [
  {
    id: 'bukan-instrumen',
    judul: 'PMAI bukan instrumen keempat',
    isi: 'Siswa hanya menjawab 200 butir dari RIASEC, OCEAN, dan VIA-IS. PMAI adalah taksonomi 12 arketipe yang dipakai sebagai lapisan sintesis; arketipe diturunkan dari skor tiga instrumen dan korpus RAG.',
    sumber: 'CONTEXT.md:24',
  },
  {
    id: 'himpunan-tertutup',
    judul: 'Himpunan tertutup',
    isi: 'Bidang `signature_title` dibatasi pada 12 arketipe dan divalidasi harus berisi tepat satu nilai dari himpunan itu, sehingga model tidak dapat mengarang nama arketipe baru.',
    sumber: 'bab3.tex:221',
  },
  {
    id: 'batas-pembacaan',
    judul: 'Validator hanya menjamin asal taksonomi',
    isi: 'Validator yang lulus hanya membuktikan bahwa keluarga arketipe yang disebut berasal dari taksonomi tertutup, bukan bahwa penetapannya tepat secara psikologis.',
    sumber: 'bab4.tex:157',
  },
]

export interface ProfilSintetis extends Bersumber {
  id: string
  nama: string
  riasec: Record<string, number>
  ocean: Record<string, number>
  via: Record<string, number>
}

/**
 * Lima profil uji sintetis. Nama profil menandai pola skor yang ditonjolkan,
 * bukan tipe kepribadian yang diklaim ada pada siswa tertentu (`bab3.tex:104`).
 */
export const profilSintetis: ProfilSintetis[] = [
  {
    id: 'riset',
    nama: 'Riset',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/rag/retriever_eval_test.go:122',
    riasec: { Realistic: 35, Investigative: 92, Artistic: 55, Social: 40, Enterprising: 30, Conventional: 25 },
    ocean: { Openness: 90, Conscientiousness: 70, Extraversion: 35, Agreeableness: 55, Neuroticism: 25 },
    via: { Creativity: 60, Curiosity: 95, Judgment: 75, LoveOfLearning: 93, Perspective: 70, Bravery: 40, Perseverance: 65, Honesty: 55, Zest: 45, Love: 40, Kindness: 50, SocialIntelligence: 45, Teamwork: 40, Fairness: 50, Leadership: 35, Forgiveness: 40, Humility: 45, Prudence: 50, SelfRegulation: 55, AppreciationOfBeauty: 50, Gratitude: 45, Hope: 50, Humor: 40, Spirituality: 30 },
  },
  {
    id: 'sosial',
    nama: 'Sosial',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/rag/retriever_eval_test.go:123',
    riasec: { Realistic: 25, Investigative: 40, Artistic: 50, Social: 94, Enterprising: 55, Conventional: 35 },
    ocean: { Openness: 60, Conscientiousness: 55, Extraversion: 88, Agreeableness: 92, Neuroticism: 30 },
    via: { Creativity: 45, Curiosity: 50, Judgment: 55, LoveOfLearning: 50, Perspective: 65, Bravery: 50, Perseverance: 55, Honesty: 60, Zest: 70, Love: 80, Kindness: 96, SocialIntelligence: 94, Teamwork: 88, Fairness: 75, Leadership: 60, Forgiveness: 70, Humility: 55, Prudence: 45, SelfRegulation: 50, AppreciationOfBeauty: 40, Gratitude: 70, Hope: 65, Humor: 60, Spirituality: 40 },
  },
  {
    id: 'kreatif',
    nama: 'Kreatif',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/rag/retriever_eval_test.go:124',
    riasec: { Realistic: 30, Investigative: 50, Artistic: 95, Social: 45, Enterprising: 40, Conventional: 20 },
    ocean: { Openness: 96, Conscientiousness: 45, Extraversion: 55, Agreeableness: 60, Neuroticism: 40 },
    via: { Creativity: 97, Curiosity: 80, Judgment: 55, LoveOfLearning: 70, Perspective: 60, Bravery: 50, Perseverance: 45, Honesty: 55, Zest: 60, Love: 55, Kindness: 50, SocialIntelligence: 55, Teamwork: 40, Fairness: 45, Leadership: 35, Forgiveness: 40, Humility: 40, Prudence: 30, SelfRegulation: 35, AppreciationOfBeauty: 95, Gratitude: 55, Hope: 50, Humor: 65, Spirituality: 45 },
  },
  {
    id: 'terstruktur',
    nama: 'Terstruktur',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/rag/retriever_eval_test.go:125',
    riasec: { Realistic: 45, Investigative: 40, Artistic: 25, Social: 35, Enterprising: 50, Conventional: 93 },
    ocean: { Openness: 35, Conscientiousness: 94, Extraversion: 40, Agreeableness: 55, Neuroticism: 30 },
    via: { Creativity: 30, Curiosity: 40, Judgment: 70, LoveOfLearning: 45, Perspective: 55, Bravery: 40, Perseverance: 80, Honesty: 70, Zest: 40, Love: 45, Kindness: 50, SocialIntelligence: 45, Teamwork: 60, Fairness: 75, Leadership: 50, Forgiveness: 45, Humility: 55, Prudence: 96, SelfRegulation: 94, AppreciationOfBeauty: 30, Gratitude: 50, Hope: 45, Humor: 35, Spirituality: 40 },
  },
  {
    id: 'kepemimpinan',
    nama: 'Kepemimpinan',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/rag/retriever_eval_test.go:126',
    riasec: { Realistic: 40, Investigative: 45, Artistic: 35, Social: 60, Enterprising: 96, Conventional: 50 },
    ocean: { Openness: 55, Conscientiousness: 75, Extraversion: 93, Agreeableness: 50, Neuroticism: 25 },
    via: { Creativity: 55, Curiosity: 50, Judgment: 70, LoveOfLearning: 45, Perspective: 65, Bravery: 94, Perseverance: 80, Honesty: 70, Zest: 75, Love: 45, Kindness: 50, SocialIntelligence: 70, Teamwork: 75, Fairness: 60, Leadership: 97, Forgiveness: 40, Humility: 35, Prudence: 55, SelfRegulation: 70, AppreciationOfBeauty: 35, Gratitude: 50, Hope: 70, Humor: 55, Spirituality: 30 },
  },
]

/** Profil dasar uji sensitivitas: seluruh 35 skor bernilai 50. */
export const profilDasar: Bersumber & { nilaiSeluruhDomain: number } = {
  nilaiSeluruhDomain: 50,
  sumber: 'bab3.tex:108',
}

export const batasInstrumen: Butir[] = [
  {
    id: 'tanpa-validasi',
    judul: 'Mutu pengukuran di luar lingkup',
    isi: 'Penelitian tidak menguji validitas isi butir, tidak menghitung alfa Cronbach, tidak menjalankan analisis faktor, dan tidak menyusun norma populasi Indonesia.',
    sumber: 'bab3.tex:86',
  },
  {
    id: 'bukan-persentil',
    judul: 'Skor adalah persentase, bukan persentil',
    isi: 'Angka yang dihasilkan ketiga persamaan adalah persentase terhadap skor maksimum domain, bukan normalisasi minimum-maksimum dan bukan norma populasi. Skor 60 tidak berarti berada di atas 60 persen populasi mana pun.',
    sumber: 'bab3.tex:194',
  },
  {
    id: 'tanpa-skor-gabungan',
    judul: 'Tidak ada skor gabungan lintas instrumen',
    isi: 'Setiap instrumen dinilai dengan kunci penilaiannya sendiri dan 35 skor domainnya disimpan terpisah, sehingga penelitian tidak mengusulkan konstruk psikometrik baru.',
    sumber: 'bab1.tex:33',
  },
]
