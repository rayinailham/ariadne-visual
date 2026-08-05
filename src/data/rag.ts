/**
 * S06–S09 — Pipeline RAG: skor menjadi kueri, embedding, pencarian, sintesis.
 *
 * Ambang 50/50/75 adalah parameter rekayasa seleksi kueri, bukan cut-off
 * psikometrik (`bab4.tex:98`). Jalur cadangan bukan keyword search dan bukan
 * BM25 (`CONTEXT.md:65`).
 */

import type { Angka, Bersumber, Butir } from './tipe'

// ---------------------------------------------------------------------------
// S06 — Skor menjadi kueri
// ---------------------------------------------------------------------------

export interface AmbangSeleksi extends Bersumber {
  riasec: number
  ocean: number
  via: number
  keterangan: string
}

/** Ambang yang dikunci untuk Bab 4. */
export const ambangTerkunci: AmbangSeleksi = {
  riasec: 50,
  ocean: 50,
  via: 75,
  keterangan:
    'Ambang seleksi domain yang dikunci untuk seluruh angka Bab 4; dasar keputusannya pada kalibrasi 27 pasangan kandidat.',
  sumber: 'bab4.tex:19',
}

/** Ambang yang benar-benar tertulis pada kode runtime. */
export const ambangKodeRuntime: AmbangSeleksi = {
  riasec: 50,
  ocean: 50,
  via: 70,
  keterangan:
    'Konstanta initialVIAQueryThreshold pada kode bernilai 70, berbeda dari 75 yang dikunci naskah. Deviasi dicatat apa adanya, tidak didamaikan.',
  sumber: 'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:89',
}

/** Ambang yang dipakai harness ablasi keterlacakan klaim. */
export const ambangHarnessAblasi: AmbangSeleksi = {
  riasec: 50,
  ocean: 50,
  via: 70,
  keterangan:
    'Harness ablasi menyusun kueri dengan ambang VIA-IS 70, sehingga komposisi domain pada himpunan referensi yang dinilai dapat lebih luas daripada komposisi ambang terkunci.',
  sumber: 'bab4.tex:23',
}

export const kandidatAmbang: Bersumber & {
  riasec: number[]
  ocean: number[]
  via: number[]
} = {
  riasec: [50, 60, 70],
  ocean: [50, 60, 70],
  via: [60, 70, 75],
  sumber: 'bab3.tex:200',
}

export interface BarisKalibrasiAmbang {
  riasec: number
  ocean: number
  via: number
  /** Agregat domain lolos pada lima profil. */
  domainRiasec: number
  domainOcean: number
  domainVia: number
  /** Jumlah profil (dari lima) yang kueri lintas-instrumennya didominasi VIA-IS. */
  profilTerdominasi: number
}

/**
 * 27 pasangan kandidat × 5 profil = 135 baris ruang uji, diagregasi per pasangan.
 * Dihitung dari `bab4-results/02-threshold/threshold-distribution.csv`.
 */
export const kalibrasiAmbang: BarisKalibrasiAmbang[] = [
  { riasec: 50, ocean: 50, via: 60, domainRiasec: 12, domainOcean: 16, domainVia: 45, profilTerdominasi: 5 },
  { riasec: 50, ocean: 50, via: 70, domainRiasec: 12, domainOcean: 16, domainVia: 32, profilTerdominasi: 3 },
  { riasec: 50, ocean: 50, via: 75, domainRiasec: 12, domainOcean: 16, domainVia: 20, profilTerdominasi: 0 },
  { riasec: 50, ocean: 60, via: 60, domainRiasec: 12, domainOcean: 10, domainVia: 45, profilTerdominasi: 5 },
  { riasec: 50, ocean: 60, via: 70, domainRiasec: 12, domainOcean: 10, domainVia: 32, profilTerdominasi: 3 },
  { riasec: 50, ocean: 60, via: 75, domainRiasec: 12, domainOcean: 10, domainVia: 20, profilTerdominasi: 1 },
  { riasec: 50, ocean: 70, via: 60, domainRiasec: 12, domainOcean: 8, domainVia: 45, profilTerdominasi: 5 },
  { riasec: 50, ocean: 70, via: 70, domainRiasec: 12, domainOcean: 8, domainVia: 32, profilTerdominasi: 4 },
  { riasec: 50, ocean: 70, via: 75, domainRiasec: 12, domainOcean: 8, domainVia: 20, profilTerdominasi: 1 },
  { riasec: 60, ocean: 50, via: 60, domainRiasec: 6, domainOcean: 16, domainVia: 45, profilTerdominasi: 5 },
  { riasec: 60, ocean: 50, via: 70, domainRiasec: 6, domainOcean: 16, domainVia: 32, profilTerdominasi: 3 },
  { riasec: 60, ocean: 50, via: 75, domainRiasec: 6, domainOcean: 16, domainVia: 20, profilTerdominasi: 1 },
  { riasec: 60, ocean: 60, via: 60, domainRiasec: 6, domainOcean: 10, domainVia: 45, profilTerdominasi: 5 },
  { riasec: 60, ocean: 60, via: 70, domainRiasec: 6, domainOcean: 10, domainVia: 32, profilTerdominasi: 5 },
  { riasec: 60, ocean: 60, via: 75, domainRiasec: 6, domainOcean: 10, domainVia: 20, profilTerdominasi: 3 },
  { riasec: 60, ocean: 70, via: 60, domainRiasec: 6, domainOcean: 8, domainVia: 45, profilTerdominasi: 5 },
  { riasec: 60, ocean: 70, via: 70, domainRiasec: 6, domainOcean: 8, domainVia: 32, profilTerdominasi: 5 },
  { riasec: 60, ocean: 70, via: 75, domainRiasec: 6, domainOcean: 8, domainVia: 20, profilTerdominasi: 4 },
  { riasec: 70, ocean: 50, via: 60, domainRiasec: 5, domainOcean: 16, domainVia: 45, profilTerdominasi: 5 },
  { riasec: 70, ocean: 50, via: 70, domainRiasec: 5, domainOcean: 16, domainVia: 32, profilTerdominasi: 3 },
  { riasec: 70, ocean: 50, via: 75, domainRiasec: 5, domainOcean: 16, domainVia: 20, profilTerdominasi: 1 },
  { riasec: 70, ocean: 60, via: 60, domainRiasec: 5, domainOcean: 10, domainVia: 45, profilTerdominasi: 5 },
  { riasec: 70, ocean: 60, via: 70, domainRiasec: 5, domainOcean: 10, domainVia: 32, profilTerdominasi: 5 },
  { riasec: 70, ocean: 60, via: 75, domainRiasec: 5, domainOcean: 10, domainVia: 20, profilTerdominasi: 3 },
  { riasec: 70, ocean: 70, via: 60, domainRiasec: 5, domainOcean: 8, domainVia: 45, profilTerdominasi: 5 },
  { riasec: 70, ocean: 70, via: 70, domainRiasec: 5, domainOcean: 8, domainVia: 32, profilTerdominasi: 5 },
  { riasec: 70, ocean: 70, via: 75, domainRiasec: 5, domainOcean: 8, domainVia: 20, profilTerdominasi: 4 },
]

export const sumberKalibrasiAmbang = 'bab4-results/02-threshold/threshold-distribution.csv'

/** Domain terpilih tiap profil pada ambang terkunci 50/50/75. */
export const domainTerpilihPerProfil: Array<
  Bersumber & { profil: string; riasec: string[]; ocean: string[]; via: string[] }
> = [
  {
    profil: 'riset',
    riasec: ['Artistic', 'Investigative'],
    ocean: ['Agreeableness', 'Conscientiousness', 'Openness'],
    via: ['Curiosity', 'Judgment', 'LoveOfLearning'],
    sumber: 'bab4-results/02-threshold/threshold-distribution.csv',
  },
  {
    profil: 'sosial',
    riasec: ['Artistic', 'Enterprising', 'Social'],
    ocean: ['Agreeableness', 'Conscientiousness', 'Extraversion', 'Openness'],
    via: ['Fairness', 'Kindness', 'Love', 'SocialIntelligence', 'Teamwork'],
    sumber: 'bab4-results/02-threshold/threshold-distribution.csv',
  },
  {
    profil: 'kreatif',
    riasec: ['Artistic', 'Investigative'],
    ocean: ['Agreeableness', 'Extraversion', 'Openness'],
    via: ['AppreciationOfBeauty', 'Creativity', 'Curiosity'],
    sumber: 'bab4-results/02-threshold/threshold-distribution.csv',
  },
  {
    profil: 'terstruktur',
    riasec: ['Conventional', 'Enterprising'],
    ocean: ['Agreeableness', 'Conscientiousness'],
    via: ['Fairness', 'Perseverance', 'Prudence', 'SelfRegulation'],
    sumber: 'bab4-results/02-threshold/threshold-distribution.csv',
  },
  {
    profil: 'kepemimpinan',
    riasec: ['Conventional', 'Enterprising', 'Social'],
    ocean: ['Agreeableness', 'Conscientiousness', 'Extraversion', 'Openness'],
    via: ['Bravery', 'Leadership', 'Perseverance', 'Teamwork', 'Zest'],
    sumber: 'bab4-results/02-threshold/threshold-distribution.csv',
  },
]

export interface AturanLabel extends Bersumber {
  label: 'high' | 'moderate' | 'low'
  syarat: string
  batasBawah: number | null
  batasAtas: number | null
}

export const aturanLabel: AturanLabel[] = [
  { label: 'high', syarat: 'skor ≥ 75', batasBawah: 75, batasAtas: null, sumber: 'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:761' },
  { label: 'moderate', syarat: '40 ≤ skor < 75', batasBawah: 40, batasAtas: 75, sumber: 'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:759' },
  { label: 'low', syarat: 'skor < 40', batasBawah: null, batasAtas: 40, sumber: 'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:763' },
]

export const contohPotonganKueri: Bersumber & {
  domain: string
  skor: number
  label: string
  teks: string
} = {
  domain: 'Investigative',
  skor: 84,
  label: 'high',
  teks: 'Holland career types investigative (high)',
  sumber: 'bab3.tex:202',
}

export interface KueriBertema extends Bersumber {
  id: string
  nama: string
  assessmentType: 'riasec' | 'ocean' | 'via_is' | 'cross'
  konteks: string
  kerangka: string
}

/** Lima kueri bertema; teks konteks dan kerangka disalin dari kode. */
export const kueriBertema: KueriBertema[] = [
  {
    id: 'riasec',
    nama: 'RIASEC',
    assessmentType: 'riasec',
    konteks: 'RIASEC vocational interests and career fit research',
    kerangka: 'Holland career types',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:684',
  },
  {
    id: 'ocean',
    nama: 'OCEAN',
    assessmentType: 'ocean',
    konteks: 'Big Five personality traits and workplace outcomes research',
    kerangka: 'OCEAN personality dimensions',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:685',
  },
  {
    id: 'via_is',
    nama: 'VIA-IS',
    assessmentType: 'via_is',
    konteks: 'VIA character strengths well-being and career applications',
    kerangka: 'virtue classification strengths',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:686',
  },
  {
    id: 'integrasi',
    nama: 'Integrasi lintas-instrumen',
    assessmentType: 'cross',
    konteks:
      'Cross-framework integration combining personality interests and strengths for career development',
    kerangka: 'combined psychological assessment',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:687',
  },
  {
    id: 'pmai',
    nama: 'Arketipe PMAI',
    assessmentType: 'cross',
    konteks:
      'Pearson-Marr Archetype Indicator PMAI twelve archetypes lead archetype selection from RIASEC OCEAN VIA profile signature pattern',
    kerangka:
      'Jungian archetype taxonomy Innocent Orphan Warrior Caregiver Seeker Lover Destroyer Creator Ruler Magician Sage Jester',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:688',
  },
]

export const alasanLimaKueri: Butir[] = [
  {
    id: 'kenapa-dipecah',
    judul: 'Mengapa kueri dipecah lima',
    isi: 'Satu kalimat tunggal sulit mewakili 35 skor dari tiga konstruk berbeda, dan kueri gabungan cenderung menarik dokumen umum sambil mengabaikan domain yang menonjol.',
    sumber: 'bab3.tex:202',
  },
  {
    id: 'kenapa-via-lebih-tinggi',
    judul: 'Mengapa ambang VIA-IS lebih tinggi',
    isi: 'VIA-IS memiliki 24 domain, sehingga seleksi yang longgar membuat kueri lintas-instrumen didominasi kekuatan karakter. Pada seluruh ruang uji, dominasi itu terjadi pada 99 dari 135 baris.',
    sumber: 'bab3.tex:200 + bab4.tex:100',
  },
  {
    id: 'bukan-cutoff',
    judul: 'Bukan cut-off psikometrik',
    isi: 'Ketiga angka ambang adalah parameter rekayasa untuk menyeleksi kueri, bukan batas yang menyatakan seseorang memiliki atau tidak memiliki suatu sifat, bukan batas diagnosis, dan bukan norma populasi.',
    sumber: 'bab3.tex:200',
  },
]

/** Label visual S06; ditempatkan di lapisan data agar viz tidak menulis istilah sendiri. */
export const labelSkorKueri: Bersumber & {
  judulVisual: string
  profil: string
  namaKelompok: { riasec: string; ocean: string; via_is: string }
  skorMasuk: string
  domainLolos: string
  ambangVia: string
  komposisiLimaProfil: string
  dominasi: string
  seimbang: string
  teksKueri: string
  peringatanAmbang: string
  deviasiRuntime: string
} = {
  judulVisual: 'Translasi skor menjadi kueri',
  profil: 'Profil uji sintetis',
  namaKelompok: { riasec: 'RIASEC', ocean: 'OCEAN', via_is: 'VIA-IS' },
  skorMasuk: 'skor domain masuk',
  domainLolos: 'domain lolos seleksi',
  ambangVia: 'Ambang seleksi VIA-IS',
  komposisiLimaProfil: 'Agregat domain lolos · 5 profil',
  dominasi: 'VIA-IS mendominasi kueri lintas-instrumen',
  seimbang: 'VIA-IS tidak mendominasi kueri lintas-instrumen',
  teksKueri: 'Teks kueri yang dikirim ke penyemat',
  peringatanAmbang: 'Parameter rekayasa seleksi kueri — bukan cut-off psikometrik',
  deviasiRuntime: 'Naskah dikunci pada 50/50/75; kode runtime dan harness ablasi memakai 50/50/70.',
  sumber: 'bab3.tex:198–202 + bab4.tex:23',
}

// ---------------------------------------------------------------------------
// S07 — Embedding dan ruang vektor
// ---------------------------------------------------------------------------

export interface JenisTugasEmbedding extends Bersumber {
  id: string
  taskType: string
  dipakaiUntuk: string
}

export const jenisTugasEmbedding: JenisTugasEmbedding[] = [
  {
    id: 'dokumen',
    taskType: 'RETRIEVAL_DOCUMENT',
    dipakaiUntuk: 'Penyematan unit korpus pada saat penyemaian.',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/gemini/embedder.go:73',
  },
  {
    id: 'kueri',
    taskType: 'RETRIEVAL_QUERY',
    dipakaiUntuk: 'Penyematan kelima kueri bertema pada saat analisis berjalan.',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/gemini/embedder.go:77',
  },
]

export const ruangVektor: Butir[] = [
  {
    id: 'peran-berbeda',
    judul: 'Dua peran, satu ruang',
    isi: 'Dokumen dan kueri memerlukan representasi berbeda meskipun ruang vektornya sama, sehingga jenis tugas penyematannya dibedakan.',
    sumber: 'bab3.tex:204',
  },
  {
    id: 'normalisasi',
    judul: 'Normalisasi L2',
    isi: 'Seluruh vektor dinormalisasi L2, sehingga seluruhnya mendarat pada permukaan bola satuan dan kesamaan kosinus setara dot product.',
    sumber: 'bab3.tex:204',
  },
  {
    id: 'proyeksi',
    judul: 'Proyeksi 3D hanya untuk tampilan',
    isi: 'Ruang sesungguhnya berdimensi 768. Setiap tampilan tiga dimensi pada halaman ini adalah proyeksi untuk keperluan tampilan, bukan ruang yang dipakai sistem.',
    sumber: 'rencana/08-PLAN-WEB-VISUAL.md:184',
  },
]

export const contohKesamaanVektor: Bersumber & {
  profil: string
  judulDokumen: string
  similarity: number
} = {
  profil: 'Riset',
  judulDokumen: 'Pearson-Marr Archetype Indicator (PMAI): A Twelve-Archetype Framework for Profile Identification',
  similarity: 0.823767,
  sumber: 'bab4-results/03-retrieval/retrieval-top-k.csv:2',
}

/** Label visual S07. Posisi titik selain pasangan terukur bersifat ilustratif. */
export const labelRuangVektor: Bersumber & {
  judulVisual: string
  proyeksi: string
  dokumen: string
  kueri: string
  bolaSatuan: string
  norma: string
  sudut: string
  kosinus: string
  dotProduct: string
  pasanganTerukur: string
  batasProyeksi: string
  modeBergerak: string
  modeStatis: string
} = {
  judulVisual: 'Embedding dalam satu ruang vektor',
  proyeksi: 'Proyeksi 3D dari 768-D untuk keperluan tampilan',
  dokumen: 'unit korpus · RETRIEVAL_DOCUMENT',
  kueri: 'kueri bertema · RETRIEVAL_QUERY',
  bolaSatuan: 'permukaan bola satuan',
  norma: 'norma L2',
  sudut: 'sudut θ',
  kosinus: 'cos(θ)',
  dotProduct: 'dot product setelah normalisasi',
  pasanganTerukur: 'pasangan kueri–dokumen terukur',
  batasProyeksi: 'Posisi awan merupakan tata letak ilustratif. Hanya dimensi, norma sampel, dan pasangan kesamaan yang ditampilkan sebagai hasil terukur; nilai 768-D korpus tidak dipublikasikan.',
  modeBergerak: 'mode bergerak',
  modeStatis: 'mode statis · prefers-reduced-motion',
  sumber: 'bab3.tex:204 + bab4.tex:50 + bab4-results/03-retrieval/retrieval-top-k.csv:2',
}

// ---------------------------------------------------------------------------
// S08 — Pencarian HNSW dan top-k
// ---------------------------------------------------------------------------

export interface LangkahPencarian extends Bersumber {
  id: string
  judul: string
  isi: string
  nilai?: string
}

export const langkahPencarian: LangkahPencarian[] = [
  {
    id: 'jarak',
    judul: 'Operator jarak kosinus',
    isi: 'Operator <=> pgvector mengembalikan jarak kosinus, sehingga kesamaan dihitung sebagai satu dikurangi jarak itu.',
    nilai: '1 - (embedding <=> $1::vector)',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/rag/retriever.go:82',
  },
  {
    id: 'cutoff',
    judul: 'Buang di bawah ambang kesamaan',
    isi: 'Dokumen dengan kesamaan di bawah 0,3 dibuang di dalam kueri SQL, bukan setelahnya.',
    nilai: 'MinSimilarity = 0.3',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/rag/retriever.go:76',
  },
  {
    id: 'filter-jenis',
    judul: 'Filter jenis asesmen',
    isi: 'Hanya dokumen yang jenis asesmennya sesuai atau bertipe cross yang ikut dipertimbangkan.',
    nilai: "assessment_type = $2 OR assessment_type = 'cross'",
    sumber: 'ecosystem-futureguide/analysis-worker/internal/rag/retriever.go:84',
  },
  {
    id: 'maks-per-kueri',
    judul: 'Maksimum tiga dokumen per kueri',
    isi: 'Tiap kueri mengambil paling banyak tiga dokumen; dedup dan pemotongan cap dikerjakan setelah kelimanya digabung.',
    nilai: 'topK = 3',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:691',
  },
  {
    id: 'dedup',
    judul: 'Dedup lintas lima kueri',
    isi: 'Hasil kelima kueri didedup menurut identitas dokumen, mempertahankan instans dengan kesamaan tertinggi.',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/rag/retriever.go:110',
  },
  {
    id: 'potong-k',
    judul: 'Potong pada k teratas',
    isi: 'Sisa hasil dipotong pada k teratas; k dikendalikan parameter runtime analysis.rag_top_k.',
    nilai: 'k = 8',
    sumber: 'bab3.tex:206',
  },
]

export const parameterK: Bersumber & {
  nama: string
  rentangSah: [number, number]
  nilaiCadangan: number
  kandidat: number[]
  final: number
  sumberKode: string
} = {
  nama: 'analysis.rag_top_k',
  rentangSah: [1, 20],
  nilaiCadangan: 8,
  kandidat: [4, 6, 8, 10, 12],
  final: 8,
  sumberKode: 'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:84',
  sumber: 'bab3.tex:206',
}

export interface MetrikPerK {
  k: number
  /** Rerata lima profil. */
  precision: number
  strongRasio: number
  /** Jumlah absolut referensi berdukungan kuat, yaitu rasio × k. */
  strongAbsolut: number
  /** Rerata token konteks yang benar-benar dikirim. */
  tokenKonteks: number
}

/** Jalur vektor: metrik rubrik per nilai k. */
export const metrikPerKVektor: MetrikPerK[] = [
  { k: 4, precision: 1.0, strongRasio: 0.55, strongAbsolut: 2.2, tokenKonteks: 1415.4 },
  { k: 6, precision: 1.0, strongRasio: 0.4333, strongAbsolut: 2.6, tokenKonteks: 1954.6 },
  { k: 8, precision: 1.0, strongRasio: 0.5, strongAbsolut: 4.0, tokenKonteks: 2580.0 },
  { k: 10, precision: 1.0, strongRasio: 0.48, strongAbsolut: 4.8, tokenKonteks: 3078.4 },
  { k: 12, precision: 1.0, strongRasio: 0.4333, strongAbsolut: 5.2, tokenKonteks: 3601.6 },
]

/** Jalur cadangan: dilaporkan terpisah karena skornya bukan kesamaan kosinus. */
export const metrikPerKCadangan: MetrikPerK[] = [
  { k: 4, precision: 0.9, strongRasio: 0.7, strongAbsolut: 2.8, tokenKonteks: 1306.8 },
  { k: 6, precision: 0.8667, strongRasio: 0.5667, strongAbsolut: 3.4, tokenKonteks: 1975.0 },
  { k: 8, precision: 0.9, strongRasio: 0.575, strongAbsolut: 4.6, tokenKonteks: 2636.4 },
  { k: 10, precision: 0.84, strongRasio: 0.56, strongAbsolut: 5.6, tokenKonteks: 3278.6 },
  { k: 12, precision: 0.8167, strongRasio: 0.5333, strongAbsolut: 6.4, tokenKonteks: 3887.2 },
]

export const sumberMetrikPerK =
  'bab4-results/04-relevance-human/retrieval-relevance-metrics.csv + bab4-results/03-retrieval/retrieval-top-k.csv'

export const alasanKFinal: Butir[] = [
  {
    id: 'precision-datar',
    judul: 'Precision tidak dapat menjadi pembeda',
    isi: 'Precision@k jalur vektor bernilai 1,0000 sejak k terkecil dan datar sepanjang rentang, sehingga keputusan batas referensi tidak dapat bersandar pada metrik itu.',
    sumber: 'bab4.tex:118',
  },
  {
    id: 'lonjakan-6-8',
    judul: 'Lonjakan efisien 6 ke 8',
    isi: 'Kenaikan dari enam ke delapan referensi menambah rerata 1,4 referensi berdukungan kuat, lonjakan terbesar pada seluruh rentang yang diuji.',
    sumber: 'bab4.tex:131',
  },
  {
    id: 'pengenceran-8-10',
    judul: 'Pengenceran 8 ke 10',
    isi: 'Kenaikan dari delapan ke sepuluh hanya menambah 0,8 referensi kuat sambil menurunkan rasio Strong-Relevance sebesar 0,02 dan menambah sekitar 500 token konteks.',
    sumber: 'bab4.tex:131',
  },
  {
    id: 'k-terkecil',
    judul: 'Delapan adalah k terkecil pada plateau',
    isi: 'Delapan dipilih sebagai nilai terkecil yang sudah berada pada plateau dukungan kuat. Nilai itu terbatas pada lima profil, satu model, dan satu korpus, sehingga bukan optimum yang berlaku umum.',
    sumber: 'bab4.tex:140',
  },
]

// ---------------------------------------------------------------------------
// S09 — Sintesis, validasi, jalur cadangan, keterlacakan
// ---------------------------------------------------------------------------

export const pelabelanReferensi: Bersumber & {
  pola: string
  urutan: string
  alasan: string[]
} = {
  pola: 'REF-01 sampai REF-NN',
  urutan: 'Mengikuti urutan kemunculan referensi pada blok referensi, yang diletakkan sebelum instruksi penyusunan.',
  alasan: [
    'Ruang label bersifat tertutup dan diketahui sistem saat permintaan disusun, sehingga label di luar rentang yang diinjeksikan dapat dipastikan fabrikasi tanpa kueri tambahan.',
    'Pengenal panjang seperti UUID tidak dapat direproduksi model generatif secara andal dan memboroskan anggaran token.',
  ],
  sumber: 'bab3.tex:208',
}

export interface UnitKlaim extends Bersumber {
  id: string
  nama: string
  jumlah: number
}

/** Sembilan unit klaim per keluaran analisis. */
export const unitKlaim: UnitKlaim[] = [
  { id: 'signature', nama: 'Ringkasan tanda tangan profil', jumlah: 1, sumber: 'bab4.tex:162' },
  { id: 'kekuatan', nama: 'Butir kekuatan', jumlah: 5, sumber: 'bab4.tex:162' },
  { id: 'prospek', nama: 'Alasan kecocokan prospek peran', jumlah: 3, sumber: 'bab4.tex:162' },
]

export const kontrakKeluaran: Butir[] = [
  {
    id: 'response-schema',
    judul: 'responseSchema dan MIME JSON',
    isi: 'Bentuk keluaran dikunci melalui responseSchema dengan ResponseMIMEType bernilai application/json serta anggaran panjang per bidang.',
    sumber: 'bab3.tex:221',
  },
  {
    id: 'signature-title',
    judul: 'signature_title tertutup',
    isi: 'Bidang signature_title dibatasi pada himpunan tertutup 12 arketipe PMAI dan divalidasi harus berisi tepat satu nilai dari himpunan tersebut.',
    sumber: 'bab3.tex:221',
  },
  {
    id: 'identitas-per-klaim',
    judul: 'Satu sampai tiga identitas per klaim',
    isi: 'Skema mewajibkan 1 sampai 3 identitas referensi per klaim ketika referensi tersedia, dan melarang identitas apa pun ketika referensi tidak tersedia. Karena itu skema disusun per permintaan mengikuti jumlah referensi yang benar-benar diinjeksikan.',
    sumber: 'bab3.tex:221',
  },
  {
    id: 'pentahapan',
    judul: 'Arketipe dipilih setelah pola dibaca',
    isi: 'Model diminta bekerja bertahap: menelaah blok referensi, memetakan hubungan antar-instrumen, memilih satu arketipe, lalu menyusun analisis. Pentahapan itu mencegah label dipasang lebih dulu lalu dicarikan pembenarannya.',
    sumber: 'bab3.tex:219',
  },
]

export interface KelasPelanggaran extends Bersumber {
  id: string
  nomor: number
  judul: string
  isi: string
}

/** Empat kelas pelanggaran yang menyebabkan keluaran ditolak. */
export const kelasPelanggaran: KelasPelanggaran[] = [
  {
    id: 'tanpa-identitas',
    nomor: 1,
    judul: 'Klaim tanpa identitas padahal referensi tersedia',
    isi: 'Referensi diinjeksikan, tetapi ada klaim yang tidak membawa satu pun identitas.',
    sumber: 'bab3.tex:223',
  },
  {
    id: 'format-salah',
    nomor: 2,
    judul: 'Label berformat salah',
    isi: 'Label tidak mengikuti pola REF-NN yang disepakati.',
    sumber: 'bab3.tex:223',
  },
  {
    id: 'di-luar-himpunan',
    nomor: 3,
    judul: 'Label di luar himpunan yang diinjeksikan',
    isi: 'Label berformat benar tetapi menunjuk referensi yang tidak diinjeksikan pada permintaan itu. Inilah fabrikasi label.',
    sumber: 'bab3.tex:223',
  },
  {
    id: 'identitas-tanpa-referensi',
    nomor: 4,
    judul: 'Identitas muncul pada kondisi tanpa referensi',
    isi: 'Skema melarang sitasi ketika referensi tidak tersedia, sehingga identitas apa pun adalah pelanggaran.',
    sumber: 'bab3.tex:223',
  },
]

export const perlakuanLabelGanda: Butir = {
  id: 'label-ganda',
  judul: 'Label ganda bukan pelanggaran',
  isi: 'Label ganda di dalam satu klaim dinormalisasi dengan mempertahankan kemunculan pertama, dan jumlahnya dicatat pada metadata retrieval.',
  catatan: 'Pada rerun 31 Juli 2026, jumlah label yang dinormalisasi karena duplikasi adalah nol.',
  sumber: 'bab3.tex:223 + bab4.tex:179',
}

export const perilakuPenolakan: Butir[] = [
  {
    id: 'retry',
    judul: 'Penolakan memicu pembuatan ulang',
    isi: 'Penolakan memicu pembuatan ulang melalui mekanisme percobaan ulang, dan pekerjaan hanya dinyatakan gagal ketika seluruh percobaan gagal.',
    sumber: 'bab3.tex:223',
  },
  {
    id: 'tanpa-buang-sebagian',
    judul: 'Tidak pernah membuang identitas tak sah lalu menyajikan sisanya',
    isi: 'Sistem menolak keluaran secara utuh. Keluaran yang identitas tak sahnya dibuang akan tampak patuh sambil menyembunyikan bagian yang tidak dapat dipertanggungjawabkan.',
    sumber: 'bab3.tex:223',
  },
  {
    id: 'batas-jaminan',
    judul: 'Yang dijamin dan yang tidak',
    isi: 'Kepatuhan skema menjamin bentuk keluaran dan validasi identitas menjamin bahwa identitas yang tercantum ter-resolve ke dokumen yang benar-benar diambil. Keduanya tidak menjamin bahwa dokumen itu secara semantik mendukung klaimnya.',
    sumber: 'bab3.tex:225',
  },
]

export interface PemicuCadangan extends Bersumber {
  id: string
  nomor: number
  isi: string
  sumberKode?: string
}

/** Empat keadaan yang memindahkan alur ke jalur cadangan deterministik. */
export const pemicuCadangan: PemicuCadangan[] = [
  {
    id: 'tanpa-pgvector',
    nomor: 1,
    isi: 'Ekstensi pgvector tidak tersedia pada katalog pg_extension, atau kolom embedding belum bertipe vektor.',
    sumberKode: 'ecosystem-futureguide/analysis-worker/internal/rag/retriever.go:40',
    sumber: 'bab3.tex:231',
  },
  {
    id: 'embedding-gagal',
    nomor: 2,
    isi: 'Pemanggilan layanan embedding gagal.',
    sumberKode:
      'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:703',
    sumber: 'bab3.tex:231',
  },
  {
    id: 'vektor-nol',
    nomor: 3,
    isi: 'Vektor yang dihasilkan bernilai nol seluruhnya.',
    sumberKode: 'ecosystem-futureguide/analysis-worker/internal/rag/retriever.go:68',
    sumber: 'bab3.tex:231',
  },
  {
    id: 'dimensi-salah',
    nomor: 4,
    isi: 'Dimensi vektor tidak sama dengan 768.',
    sumberKode: 'ecosystem-futureguide/analysis-worker/internal/rag/retriever.go:68',
    sumber: 'bab3.tex:231',
  },
]

export const jalurCadangan: Bersumber & {
  batasMuat: number
  dasarSkor: string[]
  batasPembacaan: string
  sumberKode: string
} = {
  batasMuat: 500,
  dasarSkor: ['kecocokan jenis asesmen', 'domain', 'judul', 'tag'],
  batasPembacaan:
    'Skor internal jalur cadangan dihitung dari kecocokan label dan bukan dari kedekatan makna, sehingga nilainya tidak disetarakan dengan kesamaan kosinus pgvector dan kedua angka itu tidak dibandingkan pada skala yang sama.',
  sumberKode: 'ecosystem-futureguide/analysis-worker/internal/rag/retriever.go:170',
  sumber: 'bab3.tex:231',
}

/** Jalur yang benar-benar dipakai satu pekerjaan, dicatat pada retrieval_metadata. */
export const jalurRetrieval: Array<Bersumber & { nama: string; arti: string }> = [
  { nama: 'vector', arti: 'Seluruh kueri terlayani pencarian vektor.', sumber: 'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:743' },
  { nama: 'fallback', arti: 'Seluruh kueri jatuh ke jalur cadangan deterministik.', sumber: 'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:745' },
  { nama: 'mixed', arti: 'Sebagian kueri vektor, sebagian jalur cadangan.', sumber: 'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:747' },
]

export const langkahKeterlacakan: Array<Bersumber & { id: string; judul: string; isi: string }> = [
  {
    id: 'label',
    judul: 'Pelabelan',
    isi: 'Referensi yang lolos cap diberi label REF-01..REF-NN per permintaan sebelum diinjeksikan ke prompt.',
    sumber: 'bab3.tex:208',
  },
  {
    id: 'validasi',
    judul: 'Validasi saat sintesis',
    isi: 'Keluaran diperiksa terhadap empat kelas pelanggaran sebelum dinyatakan berhasil.',
    sumber: 'bab3.tex:223',
  },
  {
    id: 'resolusi',
    judul: 'Resolusi label',
    isi: 'Worker me-resolve label pada keluaran model menjadi identitas dokumen.',
    sumber: 'bab3.tex:237',
  },
  {
    id: 'persist',
    judul: 'Persist satu transaksi',
    isi: 'Pasangan identitas asesmen, jalur klaim, identitas dokumen, dan urutan sitasi disimpan dalam transaksi yang sama dengan hasil analisis, skor domain, dan daftar referensi asesmen.',
    sumber: 'bab3.tex:237',
  },
  {
    id: 'papar',
    judul: 'Pemaparan pada API',
    isi: 'assessment-service menggabungkan tabel relasi dengan reference_documents lalu mengembalikan identitas dokumen, judul, sumber, jenis asesmen, domain, dan similarity pada /assessments/{job_id} bagi pemilik asesmen.',
    sumber: 'bab3.tex:239',
  },
]

export const degradasiAnggun: Butir[] = [
  {
    id: 'baca-klaim',
    judul: 'Gagal membaca keterlacakan klaim',
    isi: 'Dicatat sebagai peringatan; hasil asesmen utama tetap dikembalikan tanpa indeks klaim.',
    sumber: 'bab3.tex:248',
  },
  {
    id: 'simpan-referensi-obrolan',
    judul: 'Gagal menyimpan referensi jawaban obrolan',
    isi: 'Tidak menggagalkan jawaban yang sudah tersimpan; jawaban dikembalikan dengan daftar referensi kosong.',
    sumber: 'bab3.tex:248',
  },
  {
    id: 'batas-degradasi',
    judul: 'Hanya berlaku pada metadata',
    isi: 'Perlakuan ini berlaku pada pembacaan dan pencatatan metadata, bukan pada validasi identitas saat sintesis yang justru menolak keluaran.',
    sumber: 'bab3.tex:248',
  },
]

export const angkaRag: Angka[] = [
  {
    id: 'rag.ambang-riasec',
    adegan: 'S06',
    label: 'Ambang RIASEC',
    nilai: 50,
    tampil: '50',
    status: 'terukur',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:23',
  },
  {
    id: 'rag.ambang-ocean',
    adegan: 'S06',
    label: 'Ambang OCEAN',
    nilai: 50,
    tampil: '50',
    status: 'terukur',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:24',
  },
  {
    id: 'rag.ambang-via',
    adegan: 'S06',
    label: 'Ambang VIA-IS',
    nilai: 75,
    tampil: '75',
    status: 'terukur',
    catatan:
      'Terkunci 75 untuk Bab 4. Kode runtime memakai 70 dan harness ablasi memakai 70; deviasi dicatat, bukan didamaikan.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:25',
  },
  {
    id: 'rag.kandidat-ambang',
    adegan: 'S06',
    label: 'Pasangan ambang kandidat',
    nilai: 27,
    tampil: '27',
    satuan: 'pasangan',
    status: 'terukur',
    catatan: 'Lima profil × 27 pasangan = 135 baris ruang uji.',
    sumber: 'bab4.tex:98',
  },
  {
    id: 'rag.baris-dominasi-via',
    adegan: 'S06',
    label: 'Baris terdominasi VIA-IS',
    nilai: 0.7333,
    tampil: '99 dari 135',
    pembilang: 99,
    penyebut: 135,
    status: 'terukur',
    catatan: 'Dominasi = jumlah domain VIA-IS lolos melebihi gabungan RIASEC dan OCEAN.',
    sumber: 'bab4.tex:100',
  },
  {
    id: 'rag.profil-terdominasi-terpilih',
    adegan: 'S06',
    label: 'Profil terdominasi pada 50/50/75',
    nilai: 0,
    tampil: '0 dari 5',
    pembilang: 0,
    penyebut: 5,
    status: 'terukur',
    catatan: 'Satu-satunya kandidat dengan nol dominasi, sambil mempertahankan 5 dari 5 domain target.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:26',
  },
  {
    id: 'rag.jumlah-kueri',
    adegan: 'S06',
    label: 'Kueri bertema per profil',
    nilai: 5,
    tampil: '5',
    satuan: 'kueri',
    status: 'terukur',
    sumber: 'bab3.tex:202',
  },
  {
    id: 'rag.dimensi-embedding',
    adegan: 'S07',
    label: 'Dimensi vektor kueri',
    nilai: 768,
    tampil: '768',
    satuan: 'dimensi',
    status: 'terukur',
    sumber: 'bab3.tex:204',
  },
  {
    id: 'rag.min-similarity',
    adegan: 'S08',
    label: 'Ambang kesamaan minimum',
    nilai: 0.3,
    tampil: '0,3',
    status: 'terukur',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/rag/retriever.go:76',
  },
  {
    id: 'rag.maks-dokumen-per-kueri',
    adegan: 'S08',
    label: 'Maksimum dokumen per kueri',
    nilai: 3,
    tampil: '3',
    satuan: 'dokumen',
    status: 'terukur',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:691',
  },
  {
    id: 'rag.k-final',
    adegan: 'S08',
    label: 'Batas referensi analisis (k)',
    nilai: 8,
    tampil: '8',
    satuan: 'referensi',
    status: 'terukur',
    catatan: 'Runtime sebelum kalibrasi bernilai 6; setelah kalibrasi 8, diterapkan pada DB dan retrieval_cap worker.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:31',
  },
  {
    id: 'rag.kondisi-retrieval',
    adegan: 'S08',
    label: 'Kondisi evaluasi retrieval',
    nilai: 50,
    tampil: '50',
    satuan: 'kondisi',
    status: 'terukur',
    catatan: '5 profil × 2 jalur × 5 nilai k; seluruhnya berstatus ok tanpa no_result.',
    sumber: 'bab4.tex:116',
  },
  {
    id: 'rag.token-konteks-min',
    adegan: 'S08',
    label: 'Token konteks terendah',
    nilai: 1249,
    tampil: '1.249',
    satuan: 'token',
    status: 'terukur',
    sumber: 'bab4.tex:116',
  },
  {
    id: 'rag.token-konteks-maks',
    adegan: 'S08',
    label: 'Token konteks tertinggi',
    nilai: 4022,
    tampil: '4.022',
    satuan: 'token',
    status: 'terukur',
    sumber: 'bab4.tex:116',
  },
  {
    id: 'rag.unit-klaim',
    adegan: 'S09',
    label: 'Unit klaim per keluaran',
    nilai: 9,
    tampil: '9',
    satuan: 'unit klaim',
    status: 'terukur',
    catatan: '1 ringkasan tanda tangan + 5 butir kekuatan + 3 alasan kecocokan prospek peran.',
    sumber: 'bab4.tex:162',
  },
  {
    id: 'rag.batas-muat-cadangan',
    adegan: 'S09',
    label: 'Batas muat jalur cadangan',
    nilai: 500,
    tampil: '500',
    satuan: 'dokumen',
    status: 'terukur',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/rag/retriever.go:170',
  },
  {
    id: 'rag.grup-keterlacakan',
    adegan: 'S09',
    label: 'Grup indeks keterlacakan klaim pada respons',
    nilai: 9,
    tampil: '9',
    satuan: 'grup',
    status: 'terukur',
    sumber: 'bab4.tex:186',
  },
]
