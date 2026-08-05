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
    id: 'traversal',
    judul: 'Traversal indeks HNSW',
    isi: 'Pengurutan menurut jarak kosinus dilayani indeks HNSW pada kolom embedding. Pencarian masuk dari lapisan atas yang jarang, turun ke lapisan yang makin padat, lalu menelusuri tetangga terdekat pada lapisan dasar.',
    nilai: 'ORDER BY embedding <=> $1::vector',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/rag/retriever.go:87',
  },
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
    isi: 'Hanya dokumen yang jenis asesmennya sesuai atau bertipe cross yang ikut dipertimbangkan. Karena itu dokumen berjenis riasec hanya dapat berasal dari kueri RIASEC, sedangkan dokumen cross dapat berasal dari kueri mana pun.',
    nilai: "assessment_type = $2 OR assessment_type = 'cross'",
    sumber: 'ecosystem-futureguide/analysis-worker/internal/rag/retriever.go:84',
  },
  {
    id: 'maks-per-kueri',
    judul: 'Maksimum tiga dokumen per kueri',
    isi: 'Pada runtime, tiap kueri mengambil paling banyak tiga dokumen; dedup dan pemotongan cap dikerjakan setelah kelimanya digabung.',
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
    judul: 'Urutkan menurun lalu potong pada k',
    isi: 'Hasil dedup diurutkan menurut kesamaan menurun dengan identitas dokumen sebagai pemecah seri, lalu dipotong pada k teratas. Nilai k dikendalikan parameter runtime analysis.rag_top_k.',
    nilai: 'k = 8',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:851',
  },
]

/**
 * Traversal HNSW yang digambarkan pada S08.
 *
 * Parameter m dan ef_construction dibaca dari migrasi indeks (lihat `korpus.ts`).
 * Jumlah simpul per lapisan pada gambar bersifat ilustratif: pgvector tidak
 * memaparkan struktur graf, dan artefak Bab 4 tidak merekam jalur traversal.
 */
export const traversalHnsw: Bersumber & {
  lapisan: Array<{ nama: string; simpul: number; keterangan: string }>
  batasPembacaan: string
  catatanEfSearch: string
} = {
  lapisan: [
    { nama: 'lapisan atas', simpul: 3, keterangan: 'Jarang. Titik masuk pencarian; satu lompatan menutup jarak besar.' },
    { nama: 'lapisan tengah', simpul: 7, keterangan: 'Makin padat. Pencarian pindah ke tetangga yang lebih dekat ke vektor kueri.' },
    { nama: 'lapisan dasar', simpul: 15, keterangan: 'Memuat seluruh unit korpus. Kandidat tetangga terdekat dikunci di sini.' },
  ],
  batasPembacaan:
    'Jumlah simpul, posisi titik, dan jalur pada gambar adalah tata letak ilustratif untuk menjelaskan arti pencarian berlapis. pgvector tidak memaparkan isi graf dan artefak Bab 4 tidak merekam traversal yang sesungguhnya.',
  catatanEfSearch:
    'Migrasi hanya menyetel m dan ef_construction; hnsw.ef_search tidak diatur di migrasi maupun kode worker, sehingga nilai bawaan pgvector yang berlaku.',
  sumber: 'ecosystem-futureguide/migrations/014_pgvector_embeddings.up.sql:47',
}

export interface DokumenRetrieval extends Bersumber {
  /** Identitas pendek untuk tampilan; urut menurut judul. */
  id: string
  idBasisData: string
  judul: string
  kutipan: string
  assessmentType: 'riasec' | 'ocean' | 'via_is' | 'cross'
  domain: string
  berkasAsal: string
  sumberMetadata: string
}

export interface PeringkatDokumen {
  idDok: string
  similarity: number
}

export interface KondisiK {
  k: number
  status: string
  tokenKonteks: number
  precision: number
  strongRasio: number
  /** Jumlah referensi bernilai rubrik 2 pada kondisi ini. */
  strongAbsolut: number
  /** Jumlah referensi bernilai rubrik 1 atau 2 pada kondisi ini. */
  relevanAbsolut: number
  /** Nilai rubrik per peringkat, urut sesuai peringkat aslinya. */
  nilaiRubrik: number[]
}

export interface ProfilRetrieval extends Bersumber {
  profil: string
  peringkat: PeringkatDokumen[]
  kondisi: KondisiK[]
  sumberRubrik: string
}

/** Registri dokumen yang benar-benar terambil pada jalur vektor, lintas lima profil dan lima nilai k. */
export const dokumenRetrieval: DokumenRetrieval[] = [
  {
    id: 'D01',
    idBasisData: 'dabb42bd-0cd8-4754-8490-659f12bf66fa',
    judul: 'Archetype 1 — The Innocent: Profile Pattern and Score Indicators',
    kutipan: 'Pearson, C. S. (1991). Awakening the heroes within: Twelve archetypes to help us find ourselves and transform our world. HarperOne. (PMAI archetype: Innocent)',
    assessmentType: 'cross',
    domain: 'Innocent',
    berkasAsal: 'cross-reference/pmai-archetypes.txt',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberMetadata: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
  },
  {
    id: 'D02',
    idBasisData: '7745f393-be78-43ad-be17-84f5503ad740',
    judul: 'Archetype 2 — The Orphan/Everyperson: Profile Pattern and Score Indicators',
    kutipan: 'Mark, M., & Pearson, C. S. (2001). The hero and the outlaw: Building extraordinary brands through the power of archetypes. McGraw-Hill. (PMAI archetype: Orphan/Everyperson)',
    assessmentType: 'cross',
    domain: 'Orphan/Everyperson',
    berkasAsal: 'cross-reference/pmai-archetypes.txt',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberMetadata: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
  },
  {
    id: 'D03',
    idBasisData: '40723d12-050b-41ac-87ad-05e674fc16ff',
    judul: 'Character Strengths and Resilience Under Adversity',
    kutipan: 'Martinez-Marti, M. L., & Ruch, W. (2017). Character strengths predict resilience over and above positive affect, self-efficacy, optimism, social support, self-esteem, and life satisfaction. The Journal of Positive Psychology, 12(2), 110-119.',
    assessmentType: 'via_is',
    domain: 'VIA',
    berkasAsal: 'via-is/wellbeing-research.txt',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberMetadata: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
  },
  {
    id: 'D04',
    idBasisData: '668c16cb-98fe-4eba-99bd-a345e10ac01b',
    judul: 'Compatibility Between Person and Environment: Congruence Theory in Career Outcomes',
    kutipan: 'Nye, C. D., Su, R., Rounds, J., & Drasgow, F. (2012). Vocational interests and performance: A quantitative summary of over 60 years of research. Perspectives on Psychological Science, 7(4), 384-403. https://doi.org/10.1177/1745691612449021',
    assessmentType: 'riasec',
    domain: 'RIASEC',
    berkasAsal: 'riasec/adolescent-and-cross-cultural.txt',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberMetadata: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
  },
  {
    id: 'D05',
    idBasisData: 'a66445fd-0bf4-4317-b24e-03f34edf711d',
    judul: 'Courage Virtue Strengths — Bravery, Perseverance, Honesty, Zest',
    kutipan: 'Peterson, C., & Seligman, M. E. P. (2004). Character strengths and virtues. Oxford University Press.',
    assessmentType: 'via_is',
    domain: 'Bravery',
    berkasAsal: 'via-is/character-strengths.txt',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberMetadata: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
  },
  {
    id: 'D06',
    idBasisData: '2aa66fd4-553d-43f0-a471-af6a7d5c70fd',
    judul: 'Holistic Profile Patterns: Common Archetypes in Combined RIASEC-OCEAN-VIA Assessment',
    kutipan: 'Armstrong, P. I., Day, S. X., McVay, J. P., & Rounds, J. (2008). Holland\'s RIASEC model as an integrative framework for individual differences research. Journal of Career Assessment, 16(1), 3-18.',
    assessmentType: 'cross',
    domain: 'PMAI',
    berkasAsal: 'cross-reference/integration-research.txt',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberMetadata: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
  },
  {
    id: 'D07',
    idBasisData: '1213083d-ee13-46fb-a3eb-73a7697d2943',
    judul: 'Holland Code Stability from High School to Mid-Career',
    kutipan: 'Low, K. S. D., Yoon, M., Roberts, B. W., & Rounds, J. (2005). The stability of vocational interests from early adolescence to middle adulthood: A quantitative review of longitudinal studies. Psychological Bulletin, 131(5), 713-737. https://doi.org/10.1037/0033-2909.131.5.713',
    assessmentType: 'riasec',
    domain: 'RIASEC',
    berkasAsal: 'riasec/adolescent-and-cross-cultural.txt',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberMetadata: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
  },
  {
    id: 'D08',
    idBasisData: 'f9d6b4b1-28e9-429b-a092-d9b19c8402e7',
    judul: 'Holland\'s RIASEC Theory of Vocational Personalities and Work Environments',
    kutipan: 'Holland, J. L. (1997). Making vocational choices: A theory of vocational personalities and work environments (3rd ed.). Psychological Assessment Resources.',
    assessmentType: 'riasec',
    domain: 'RIASEC',
    berkasAsal: 'riasec/holland-theory.txt',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberMetadata: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
  },
  {
    id: 'D09',
    idBasisData: '4bb08218-2e30-460e-819f-419ea7bb5e63',
    judul: 'Integrating RIASEC, OCEAN, and VIA-IS for Comprehensive Psychological Profiling',
    kutipan: 'Armstrong, P. I., Day, S. X., McVay, J. P., & Rounds, J. (2008). Holland\'s RIASEC model as an integrative framework for individual differences research. Journal of Career Assessment, 16(1), 3-18.',
    assessmentType: 'cross',
    domain: 'RIASEC-OCEAN',
    berkasAsal: 'cross-reference/cross-analysis.txt',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberMetadata: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
  },
  {
    id: 'D10',
    idBasisData: '178d813b-5041-400b-a447-860966541188',
    judul: 'Interest-Ability Congruence and Career Satisfaction',
    kutipan: 'Tracey, T. J. G. (2002). Personal Globe Inventory: Measurement of the spherical model of interests and competence beliefs. Journal of Vocational Behavior, 60(1), 113-172.',
    assessmentType: 'riasec',
    domain: 'RIASEC',
    berkasAsal: 'riasec/validation-research.txt',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberMetadata: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
  },
  {
    id: 'D11',
    idBasisData: '8cf66397-b696-4b45-ab4a-d385f4a76271',
    judul: 'Justice Virtue Strengths — Teamwork, Fairness, Leadership',
    kutipan: 'Peterson, C., & Seligman, M. E. P. (2004). Character strengths and virtues. Oxford University Press.',
    assessmentType: 'via_is',
    domain: 'Teamwork',
    berkasAsal: 'via-is/character-strengths.txt',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberMetadata: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
  },
  {
    id: 'D12',
    idBasisData: 'ad4792a6-b08f-4171-acbd-8c6a76bc4435',
    judul: 'Multi-Trait Multi-Method Validation of Combined Psychological Assessment',
    kutipan: 'Staggs, G. D., Larson, L. M., & Borgen, F. H. (2007). Convergence of personality and interests: Meta-analysis of the Multidimensional Personality Questionnaire and the Strong Interest Inventory. Journal of Career Assessment, 15(4), 423-445.',
    assessmentType: 'cross',
    domain: 'integration',
    berkasAsal: 'cross-reference/integration-research.txt',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberMetadata: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
  },
  {
    id: 'D13',
    idBasisData: '384a13a3-1cac-46ec-b8dc-5e6ca2aacfdd',
    judul: 'PMAI Archetype Selection Algorithm: How to Identify the Lead Archetype from a Combined Profile',
    kutipan: 'Pearson, C. S., & Marr, M. (2003). What story are you living? A workbook and guide to interpreting results from the Pearson-Marr Archetype Indicator. CAPT.',
    assessmentType: 'cross',
    domain: 'PMAI',
    berkasAsal: 'cross-reference/pmai-archetypes.txt',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberMetadata: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
  },
  {
    id: 'D14',
    idBasisData: '4d9b358c-68c0-49bc-abe3-34802f5424f8',
    judul: 'Pearson-Marr Archetype Indicator (PMAI): A Twelve-Archetype Framework for Profile Identification',
    kutipan: 'Pearson, C. S., & Marr, M. (2003). What story are you living? A workbook and guide to interpreting results from the Pearson-Marr Archetype Indicator instrument. Center for Applications of Psychological Type (CAPT).',
    assessmentType: 'cross',
    domain: 'PMAI',
    berkasAsal: 'cross-reference/pmai-archetypes.txt',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberMetadata: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
  },
  {
    id: 'D15',
    idBasisData: '27cceb62-30b2-451a-9b62-0c8e86c02c8a',
    judul: 'RIASEC Congruence and Person-Environment Fit',
    kutipan: 'Nye, C. D., Su, R., Rounds, J., & Drasgow, F. (2012). Vocational interests and performance: A quantitative summary of over 60 years of research. Perspectives on Psychological Science, 7(4), 384-403.',
    assessmentType: 'riasec',
    domain: 'Realistic',
    berkasAsal: 'riasec/holland-theory.txt',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberMetadata: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
  },
  {
    id: 'D16',
    idBasisData: 'ce44de40-dbfa-4a32-97ee-bec7922c01a2',
    judul: 'RIASEC Interests and Academic Major Choice: Longitudinal Prediction',
    kutipan: 'Allen, J., & Robbins, S. B. (2010). Effects of interest-major congruence, motivation, and academic performance on timely degree attainment. Journal of Counseling Psychology, 57(1), 23-35.',
    assessmentType: 'riasec',
    domain: 'RIASEC',
    berkasAsal: 'riasec/validation-research.txt',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberMetadata: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
  },
  {
    id: 'D17',
    idBasisData: '41e6a0ac-3148-4106-9b35-43a47240e7e7',
    judul: 'RIASEC Interests in Multicultural and Cross-Cultural Contexts',
    kutipan: 'Rounds, J., & Tracey, T. J. (1996). Cross-cultural structural equivalence of RIASEC models and measures. Journal of Counseling Psychology, 43(3), 310-329.',
    assessmentType: 'riasec',
    domain: 'RIASEC',
    berkasAsal: 'riasec/validation-research.txt',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberMetadata: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
  },
  {
    id: 'D18',
    idBasisData: '516cbb36-0a2f-4421-838e-6336ec6334ec',
    judul: 'RIASEC Type Combinations and Specific Career Pathway Predictions',
    kutipan: 'Nauta, M. M. (2010). The development, evolution, and status of Holland\'s theory of vocational personalities: Reflections and future directions for counseling psychology. Journal of Counseling Psychology, 57(1), 11-22.',
    assessmentType: 'riasec',
    domain: 'RIASEC',
    berkasAsal: 'riasec/validation-research.txt',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberMetadata: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
  },
  {
    id: 'D19',
    idBasisData: '0ee2aa71-0394-4c72-a2c1-69615860554e',
    judul: 'RIASEC ↔ OCEAN Cross-Reference: Holland\'s Six Types Mapped to the Big Five',
    kutipan: 'Larson, L. M., Rottinghaus, P. J., & Borgen, F. H. (2002). Meta-analyses of Big Six interests and Big Five personality factors. Journal of Vocational Behavior, 61(2), 217-239.',
    assessmentType: 'cross',
    domain: 'RIASEC-OCEAN',
    berkasAsal: 'cross-reference/cross-analysis.txt',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberMetadata: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
  },
  {
    id: 'D20',
    idBasisData: '30acc7b4-605d-4039-a0de-989ab3ca1f2f',
    judul: 'Temperance Virtue Strengths — Forgiveness, Humility, Prudence, Self-Regulation',
    kutipan: 'Peterson, C., & Seligman, M. E. P. (2004). Character strengths and virtues. Oxford University Press.',
    assessmentType: 'via_is',
    domain: 'Self-Regulation',
    berkasAsal: 'via-is/character-strengths.txt',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberMetadata: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
  },
  {
    id: 'D21',
    idBasisData: 'ad36f5ab-d9d1-4fe9-a28f-015327de94aa',
    judul: 'VIA Strengths Differential Validity for Career Domains',
    kutipan: 'Littman-Ovadia, H., Lavy, S., & Boiman-Meshita, M. (2017). When theory and research collide: Examining correlates of signature strengths use at work. Journal of Happiness Studies, 18, 527-548. https://doi.org/10.1007/s10902-016-9739-8',
    assessmentType: 'via_is',
    domain: 'VIA',
    berkasAsal: 'via-is/youth-and-education.txt',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberMetadata: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
  },
  {
    id: 'D22',
    idBasisData: '44f91aa2-efb8-4db2-8869-24a178dcce33',
    judul: 'VIA Strengths and Team Composition: Complementary Strengths in Work Groups',
    kutipan: 'Ruch, W., Gander, F., Platt, T., & Hofmann, J. (2018). Team roles: Their relationships to character strengths and job satisfaction. The Journal of Positive Psychology, 13(2), 190-199.',
    assessmentType: 'via_is',
    domain: 'VIA',
    berkasAsal: 'via-is/wellbeing-research.txt',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberMetadata: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
  },
  {
    id: 'D23',
    idBasisData: 'ef43e5bd-6cb6-48d2-af78-6ad04aae7eb0',
    judul: 'Vocational Interest Fit Is Moderate and Unequally Distributed Across Education Groups',
    kutipan: 'Hanna, A., Morris, M. L., Hoff, K. A., Nye, C. D., Jones, K. S., & Rounds, J. (2024). Can everyone get interesting jobs? Estimating interest fit and group differences across race/ethnicity, gender, and education. Applied Psychology. https://doi.org/10.1111/apps.12567',
    assessmentType: 'riasec',
    domain: 'RIASEC',
    berkasAsal: 'riasec/recent-interest-evidence.txt',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberMetadata: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
  },
  {
    id: 'D24',
    idBasisData: '5fc7d34c-b18e-4baa-b83e-b1c0b51a8f73',
    judul: 'Wisdom Virtue Strengths — Creativity, Curiosity, Judgment, Love of Learning, Perspective',
    kutipan: 'Peterson, C., & Seligman, M. E. P. (2004). Character strengths and virtues. Oxford University Press.',
    assessmentType: 'via_is',
    domain: 'Love of Learning',
    berkasAsal: 'via-is/character-strengths.txt',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberMetadata: 'ecosystem-futureguide/analysis-worker/knowledge/manifest.json',
  },
]

/**
 * Hasil retrieval jalur vektor per profil. Peringkat bersifat bersarang: daftar
 * pada k kecil adalah awalan daftar pada k besar, sehingga cukup disimpan sekali.
 * Nilai rubrik dibaca per kondisi menurut peringkat aslinya.
 */
export const retrievalVektor: ProfilRetrieval[] = [
  {
    profil: 'riset',
    peringkat: [
      { idDok: 'D14', similarity: 0.823767 },
      { idDok: 'D24', similarity: 0.816777 },
      { idDok: 'D13', similarity: 0.793336 },
      { idDok: 'D09', similarity: 0.788272 },
      { idDok: 'D18', similarity: 0.785980 },
      { idDok: 'D15', similarity: 0.782663 },
      { idDok: 'D19', similarity: 0.777126 },
      { idDok: 'D06', similarity: 0.770914 },
      { idDok: 'D08', similarity: 0.770369 },
      { idDok: 'D12', similarity: 0.769943 },
      { idDok: 'D07', similarity: 0.768372 },
      { idDok: 'D21', similarity: 0.768194 },
    ],
    kondisi: [
      {
        k: 4,
        status: 'ok',
        tokenKonteks: 1377,
        precision: 1.000000,
        strongRasio: 0.750000,
        strongAbsolut: 3,
        relevanAbsolut: 4,
        nilaiRubrik: [1, 2, 2, 2],
      },
      {
        k: 6,
        status: 'ok',
        tokenKonteks: 1946,
        precision: 1.000000,
        strongRasio: 0.500000,
        strongAbsolut: 3,
        relevanAbsolut: 6,
        nilaiRubrik: [1, 2, 2, 2, 1, 1],
      },
      {
        k: 8,
        status: 'ok',
        tokenKonteks: 2612,
        precision: 1.000000,
        strongRasio: 0.625000,
        strongAbsolut: 5,
        relevanAbsolut: 8,
        nilaiRubrik: [1, 2, 2, 2, 1, 1, 2, 2],
      },
      {
        k: 10,
        status: 'ok',
        tokenKonteks: 3078,
        precision: 1.000000,
        strongRasio: 0.600000,
        strongAbsolut: 6,
        relevanAbsolut: 10,
        nilaiRubrik: [1, 2, 2, 2, 1, 1, 2, 2, 1, 2],
      },
      {
        k: 12,
        status: 'ok',
        tokenKonteks: 3708,
        precision: 1.000000,
        strongRasio: 0.500000,
        strongAbsolut: 6,
        relevanAbsolut: 12,
        nilaiRubrik: [1, 2, 2, 2, 1, 1, 2, 2, 1, 2, 1, 1],
      },
    ],
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberRubrik: 'bab4-results/04-relevance-human/retrieval-relevance-unblinded.csv',
  },
  {
    profil: 'sosial',
    peringkat: [
      { idDok: 'D14', similarity: 0.814790 },
      { idDok: 'D13', similarity: 0.792105 },
      { idDok: 'D18', similarity: 0.783353 },
      { idDok: 'D19', similarity: 0.776415 },
      { idDok: 'D15', similarity: 0.773915 },
      { idDok: 'D09', similarity: 0.768132 },
      { idDok: 'D08', similarity: 0.768058 },
      { idDok: 'D02', similarity: 0.764761 },
      { idDok: 'D22', similarity: 0.763158 },
      { idDok: 'D01', similarity: 0.762218 },
      { idDok: 'D11', similarity: 0.760320 },
      { idDok: 'D17', similarity: 0.759986 },
    ],
    kondisi: [
      {
        k: 4,
        status: 'ok',
        tokenKonteks: 1458,
        precision: 1.000000,
        strongRasio: 0.500000,
        strongAbsolut: 2,
        relevanAbsolut: 4,
        nilaiRubrik: [1, 2, 1, 2],
      },
      {
        k: 6,
        status: 'ok',
        tokenKonteks: 2051,
        precision: 1.000000,
        strongRasio: 0.500000,
        strongAbsolut: 3,
        relevanAbsolut: 6,
        nilaiRubrik: [1, 2, 1, 2, 1, 2],
      },
      {
        k: 8,
        status: 'ok',
        tokenKonteks: 2540,
        precision: 1.000000,
        strongRasio: 0.500000,
        strongAbsolut: 4,
        relevanAbsolut: 8,
        nilaiRubrik: [1, 2, 1, 2, 1, 2, 1, 2],
      },
      {
        k: 10,
        status: 'ok',
        tokenKonteks: 3075,
        precision: 1.000000,
        strongRasio: 0.500000,
        strongAbsolut: 5,
        relevanAbsolut: 10,
        nilaiRubrik: [1, 2, 1, 2, 1, 2, 1, 2, 2, 1],
      },
      {
        k: 12,
        status: 'ok',
        tokenKonteks: 3575,
        precision: 1.000000,
        strongRasio: 0.500000,
        strongAbsolut: 6,
        relevanAbsolut: 12,
        nilaiRubrik: [1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1],
      },
    ],
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberRubrik: 'bab4-results/04-relevance-human/retrieval-relevance-unblinded.csv',
  },
  {
    profil: 'kreatif',
    peringkat: [
      { idDok: 'D14', similarity: 0.820109 },
      { idDok: 'D13', similarity: 0.790355 },
      { idDok: 'D09', similarity: 0.785053 },
      { idDok: 'D15', similarity: 0.784309 },
      { idDok: 'D18', similarity: 0.782158 },
      { idDok: 'D24', similarity: 0.777271 },
      { idDok: 'D19', similarity: 0.772479 },
      { idDok: 'D07', similarity: 0.771977 },
      { idDok: 'D16', similarity: 0.769999 },
      { idDok: 'D10', similarity: 0.769815 },
      { idDok: 'D08', similarity: 0.767802 },
      { idDok: 'D23', similarity: 0.766973 },
    ],
    kondisi: [
      {
        k: 4,
        status: 'ok',
        tokenKonteks: 1427,
        precision: 1.000000,
        strongRasio: 0.500000,
        strongAbsolut: 2,
        relevanAbsolut: 4,
        nilaiRubrik: [1, 2, 2, 1],
      },
      {
        k: 6,
        status: 'ok',
        tokenKonteks: 1946,
        precision: 1.000000,
        strongRasio: 0.500000,
        strongAbsolut: 3,
        relevanAbsolut: 6,
        nilaiRubrik: [1, 2, 2, 1, 1, 2],
      },
      {
        k: 8,
        status: 'ok',
        tokenKonteks: 2628,
        precision: 1.000000,
        strongRasio: 0.500000,
        strongAbsolut: 4,
        relevanAbsolut: 8,
        nilaiRubrik: [1, 2, 2, 1, 1, 2, 2, 1],
      },
      {
        k: 10,
        status: 'ok',
        tokenKonteks: 3129,
        precision: 1.000000,
        strongRasio: 0.400000,
        strongAbsolut: 4,
        relevanAbsolut: 10,
        nilaiRubrik: [1, 2, 2, 1, 1, 2, 2, 1, 1, 1],
      },
      {
        k: 12,
        status: 'ok',
        tokenKonteks: 3558,
        precision: 1.000000,
        strongRasio: 0.333333,
        strongAbsolut: 4,
        relevanAbsolut: 12,
        nilaiRubrik: [1, 2, 2, 1, 1, 2, 2, 1, 1, 1, 1, 1],
      },
    ],
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberRubrik: 'bab4-results/04-relevance-human/retrieval-relevance-unblinded.csv',
  },
  {
    profil: 'terstruktur',
    peringkat: [
      { idDok: 'D14', similarity: 0.820225 },
      { idDok: 'D13', similarity: 0.792642 },
      { idDok: 'D15', similarity: 0.784597 },
      { idDok: 'D09', similarity: 0.779644 },
      { idDok: 'D18', similarity: 0.779605 },
      { idDok: 'D08', similarity: 0.774276 },
      { idDok: 'D19', similarity: 0.771973 },
      { idDok: 'D05', similarity: 0.771478 },
      { idDok: 'D20', similarity: 0.770541 },
      { idDok: 'D12', similarity: 0.770492 },
      { idDok: 'D04', similarity: 0.770052 },
      { idDok: 'D17', similarity: 0.767370 },
    ],
    kondisi: [
      {
        k: 4,
        status: 'ok',
        tokenKonteks: 1427,
        precision: 1.000000,
        strongRasio: 0.500000,
        strongAbsolut: 2,
        relevanAbsolut: 4,
        nilaiRubrik: [1, 2, 1, 2],
      },
      {
        k: 6,
        status: 'ok',
        tokenKonteks: 1873,
        precision: 1.000000,
        strongRasio: 0.333333,
        strongAbsolut: 2,
        relevanAbsolut: 6,
        nilaiRubrik: [1, 2, 1, 2, 1, 1],
      },
      {
        k: 8,
        status: 'ok',
        tokenKonteks: 2515,
        precision: 1.000000,
        strongRasio: 0.375000,
        strongAbsolut: 3,
        relevanAbsolut: 8,
        nilaiRubrik: [1, 2, 1, 2, 1, 1, 2, 1],
      },
      {
        k: 10,
        status: 'ok',
        tokenKonteks: 3067,
        precision: 1.000000,
        strongRasio: 0.500000,
        strongAbsolut: 5,
        relevanAbsolut: 10,
        nilaiRubrik: [1, 2, 1, 2, 1, 1, 2, 1, 2, 2],
      },
      {
        k: 12,
        status: 'ok',
        tokenKonteks: 3631,
        precision: 1.000000,
        strongRasio: 0.416667,
        strongAbsolut: 5,
        relevanAbsolut: 12,
        nilaiRubrik: [1, 2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 1],
      },
    ],
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberRubrik: 'bab4-results/04-relevance-human/retrieval-relevance-unblinded.csv',
  },
  {
    profil: 'kepemimpinan',
    peringkat: [
      { idDok: 'D14', similarity: 0.817616 },
      { idDok: 'D13', similarity: 0.797241 },
      { idDok: 'D05', similarity: 0.795801 },
      { idDok: 'D03', similarity: 0.788132 },
      { idDok: 'D15', similarity: 0.781207 },
      { idDok: 'D18', similarity: 0.779666 },
      { idDok: 'D09', similarity: 0.773752 },
      { idDok: 'D19', similarity: 0.773260 },
      { idDok: 'D08', similarity: 0.773079 },
      { idDok: 'D17', similarity: 0.772066 },
      { idDok: 'D22', similarity: 0.765948 },
      { idDok: 'D23', similarity: 0.765262 },
    ],
    kondisi: [
      {
        k: 4,
        status: 'ok',
        tokenKonteks: 1388,
        precision: 1.000000,
        strongRasio: 0.500000,
        strongAbsolut: 2,
        relevanAbsolut: 4,
        nilaiRubrik: [1, 2, 2, 1],
      },
      {
        k: 6,
        status: 'ok',
        tokenKonteks: 1957,
        precision: 1.000000,
        strongRasio: 0.333333,
        strongAbsolut: 2,
        relevanAbsolut: 6,
        nilaiRubrik: [1, 2, 2, 1, 1, 1],
      },
      {
        k: 8,
        status: 'ok',
        tokenKonteks: 2605,
        precision: 1.000000,
        strongRasio: 0.500000,
        strongAbsolut: 4,
        relevanAbsolut: 8,
        nilaiRubrik: [1, 2, 2, 1, 1, 1, 2, 2],
      },
      {
        k: 10,
        status: 'ok',
        tokenKonteks: 3043,
        precision: 1.000000,
        strongRasio: 0.400000,
        strongAbsolut: 4,
        relevanAbsolut: 10,
        nilaiRubrik: [1, 2, 2, 1, 1, 1, 2, 2, 1, 1],
      },
      {
        k: 12,
        status: 'ok',
        tokenKonteks: 3536,
        precision: 1.000000,
        strongRasio: 0.416667,
        strongAbsolut: 5,
        relevanAbsolut: 12,
        nilaiRubrik: [1, 2, 2, 1, 1, 1, 2, 2, 1, 1, 2, 1],
      },
    ],
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
    sumberRubrik: 'bab4-results/04-relevance-human/retrieval-relevance-unblinded.csv',
  },
]

/** Mencari satu dokumen pada registri; identitas yang tidak dikenal harus gagal keras. */
export function dokumenDenganId(id: string): DokumenRetrieval {
  const dokumen = dokumenRetrieval.find((item) => item.id === id)
  if (!dokumen) throw new Error(`Dokumen retrieval tidak dikenal: ${id}`)
  return dokumen
}

/** Komposisi jenis asesmen pada dokumen yang benar-benar terambil; dihitung dari registri. */
export const komposisiJenisDokumen: Array<{ jenis: string; jumlah: number }> = (
  ['riasec', 'ocean', 'via_is', 'cross'] as const
).map((jenis) => ({
  jenis,
  jumlah: dokumenRetrieval.filter((dokumen) => dokumen.assessmentType === jenis).length,
}))

export const catatanKomposisiDokumen: Butir = {
  id: 'komposisi-jenis-dokumen',
  judul: 'Tidak ada dokumen berjenis ocean yang pernah terambil',
  isi: 'Dari seluruh dokumen unik yang terambil pada jalur vektor lintas lima profil dan lima nilai k, tidak satu pun berjenis ocean. Kueri OCEAN tetap dijalankan dan tetap mengembalikan hasil, tetapi hasil teratasnya berjenis cross.',
  catatan:
    'Ini dibaca sebagai cakupan korpus, bukan sebagai kegagalan kueri: seluruh 50 kondisi berstatus ok tanpa no_result.',
  sumber: 'bab4-results/03-retrieval/retrieval-top-k.json + bab4.tex:116',
}

/**
 * Deviasi yang tidak didamaikan: harness kalibrasi k tidak memakai batas tiga
 * dokumen per kueri seperti runtime, melainkan mengambil sampai 500 lalu
 * menggabung, dedup, mengurutkan, dan memotong pada k.
 */
export const deviasiHarnessRetrieval: Butir = {
  id: 'deviasi-batas-per-kueri',
  judul: 'Batas per kueri pada harness berbeda dengan runtime',
  isi: 'Runtime memakai batas tiga dokumen per kueri sebelum penggabungan. Harness kalibrasi k memakai batas 500 per kueri, lalu menggabung kelima hasil, dedup, mengurutkan menurut kesamaan menurun, dan memotong pada k. Daftar dokumen yang ditampilkan adegan ini berasal dari harness itu, bukan dari jalur runtime.',
  catatan:
    'Akibatnya daftar per k bersarang: daftar pada k kecil adalah awalan daftar pada k besar. Pada runtime dengan batas tiga per kueri, kandidat sebelum dedup paling banyak 15.',
  sumber:
    'ecosystem-futureguide/analysis-worker/internal/rag/retriever_eval_test.go:28 + ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:691',
}

/** Batas pembacaan penilaian rubrik yang wajib tampil bersama nilai per dokumen. */
export const batasRubrikRetrieval: Butir = {
  id: 'batas-rubrik-retrieval',
  judul: 'Rubrik dinilai per kondisi, oleh satu penilai',
  isi: 'Penilaian relevansi dikerjakan buta per kondisi, dengan jalur, peringkat, dan nilai kesamaan disembunyikan. Karena itu dokumen yang sama dapat menerima nilai berbeda pada nilai k yang berbeda, dan nilai itu tidak dapat dibaca sebagai sifat tetap dokumen.',
  catatan:
    'Penilaian dikerjakan satu penilai berbantuan atas delegasi eksplisit; reliabilitas antarpenilai tidak diukur.',
  sumber: 'bab4.tex:144 + bab4-results/04-relevance-human/summary-metrics.md',
}

/** Label visual S08; ditempatkan di lapisan data agar viz tidak menulis istilah sendiri. */
export const labelPencarian: Bersumber & {
  judulVisual: string
  traversal: string
  titikMasuk: string
  tetangga: string
  ilustratif: string
  jarak: string
  kesamaan: string
  ambangBuang: string
  saringan: string
  kandidat: string
  potong: string
  daftarReferensi: string
  peringkat: string
  nilaiRubrik: string
  rubrik: Record<string, string>
  metrik: string
  rerata: string
  precision: string
  strongRasio: string
  strongAbsolut: string
  token: string
  deltaDariSebelumnya: string
  kFinal: string
  jalurCadangan: string
  profil: string
  jenisDokumen: string
} = {
  judulVisual: 'Pencarian HNSW sampai potong k',
  traversal: 'Traversal berlapis',
  titikMasuk: 'titik masuk',
  tetangga: 'tetangga terkunci',
  ilustratif: 'tata letak ilustratif',
  jarak: 'jarak kosinus',
  kesamaan: 'kesamaan',
  ambangBuang: 'dibuang di bawah ambang',
  saringan: 'Saringan berurutan',
  kandidat: 'kandidat',
  potong: 'potong pada k',
  daftarReferensi: 'Referensi terpilih pada k ini',
  peringkat: 'peringkat',
  nilaiRubrik: 'rubrik',
  rubrik: {
    '0': 'tidak relevan',
    '1': 'relevan longgar',
    '2': 'dukungan kuat',
  },
  metrik: 'Metrik pada k ini',
  rerata: 'rerata 5 profil',
  precision: 'Precision@k',
  strongRasio: 'Strong-Relevance@k',
  strongAbsolut: 'referensi berdukungan kuat',
  token: 'token konteks',
  deltaDariSebelumnya: 'selisih dari k sebelumnya',
  kFinal: 'k final Bab 4',
  jalurCadangan: 'jalur cadangan · rubrik yang sama, skala skor mentah berbeda',
  profil: 'Profil uji sintetis',
  jenisDokumen: 'Jenis asesmen dokumen terambil',
  sumber: 'bab3.tex:206 + bab4.tex:116–140 + bab4-results/04-relevance-human/summary-metrics.md',
}

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
  /** Nama galat sentinel pada kode worker. */
  sentinel: string
  sumberKode: string
  /** Kondisi blok referensi tempat kelas ini dapat terjadi. */
  kondisi: 'dengan-referensi' | 'tanpa-referensi' | 'keduanya'
  /** Bentuk keluaran model yang memicu penolakan; dipakai simulasi di layar. */
  contoh: string
  /** Benar bila kelas ini ada pada kode tetapi tidak termasuk empat kelas naskah. */
  diLuarNaskah?: boolean
}

/**
 * Empat kelas pelanggaran yang disebut naskah, ditambah satu kelas kelima yang
 * hanya ada pada kode. Kelas kelima tidak dihapus dan tidak digabungkan ke
 * salah satu dari empat: satu-satunya penolakan yang pernah tercatat pada jalur
 * nyata justru berasal dari kelas itu (`bab4.tex:179`).
 */
export const kelasPelanggaran: KelasPelanggaran[] = [
  {
    id: 'tanpa-identitas',
    nomor: 1,
    judul: 'Klaim tanpa identitas padahal referensi tersedia',
    isi: 'Referensi diinjeksikan, tetapi ada klaim yang tidak membawa satu pun identitas.',
    sentinel: 'ErrClaimWithoutReference',
    sumberKode: 'ecosystem-futureguide/analysis-worker/internal/gemini/client.go:510',
    kondisi: 'dengan-referensi',
    contoh: 'reference_ids: []',
    sumber: 'bab3.tex:223',
  },
  {
    id: 'format-salah',
    nomor: 2,
    judul: 'Label berformat salah',
    isi: 'Label tidak mengikuti pola REF-NN yang disepakati. Pemeriksanya adalah pola ^REF-\\d{2}$, sehingga REF-3 gugur karena hanya membawa satu digit.',
    sentinel: 'ErrMalformedReferenceLabel',
    sumberKode: 'ecosystem-futureguide/analysis-worker/internal/gemini/client.go:517',
    kondisi: 'dengan-referensi',
    contoh: 'reference_ids: ["REF-3"]',
    sumber: 'bab3.tex:223',
  },
  {
    id: 'di-luar-himpunan',
    nomor: 3,
    judul: 'Label di luar himpunan yang diinjeksikan',
    isi: 'Label berformat benar tetapi menunjuk referensi yang tidak diinjeksikan pada permintaan itu. Inilah fabrikasi label.',
    sentinel: 'ErrUnknownReferenceLabel',
    sumberKode: 'ecosystem-futureguide/analysis-worker/internal/gemini/client.go:521',
    kondisi: 'dengan-referensi',
    contoh: 'reference_ids: ["REF-11"]',
    sumber: 'bab3.tex:223',
  },
  {
    id: 'identitas-tanpa-referensi',
    nomor: 4,
    judul: 'Identitas muncul pada kondisi tanpa referensi',
    isi: 'Skema melarang sitasi ketika referensi tidak tersedia, sehingga identitas apa pun adalah pelanggaran.',
    sentinel: 'ErrCitationWithoutRetrieval',
    sumberKode: 'ecosystem-futureguide/analysis-worker/internal/gemini/client.go:505',
    kondisi: 'tanpa-referensi',
    contoh: 'reference_ids: ["REF-01"]',
    sumber: 'bab3.tex:223',
  },
  {
    id: 'label-di-prosa',
    nomor: 5,
    judul: 'Label bocor ke dalam prosa klaim',
    isi: 'Label hanya boleh berada pada ruas reference_ids. Ruas text adalah prosa yang dibaca siswa dan tidak boleh memuat kode sitasi internal. Pemeriksanya sengaja lebih longgar daripada pemeriksa format, yaitu \\bREF[-\\s]?\\d tanpa membedakan huruf besar-kecil, supaya bentuk salah ketik seperti Ref-02 atau REF 1 ikut tertangkap.',
    sentinel: 'ErrReferenceLabelInClaimText',
    sumberKode: 'ecosystem-futureguide/analysis-worker/internal/gemini/client.go:499',
    kondisi: 'keduanya',
    contoh: 'text: "… Ref-02 dan Ref-05 mencatat bahwa …"',
    diLuarNaskah: true,
    sumber: 'ecosystem-futureguide/analysis-worker/internal/gemini/client.go:55 + bab4.tex:179',
  },
]

/**
 * Deviasi yang tidak didamaikan: naskah menyebut empat kelas pelanggaran,
 * kode menegakkan lima.
 */
export const deviasiKelasPelanggaran: Butir = {
  id: 'deviasi-kelas-pelanggaran',
  judul: 'Naskah menyebut empat kelas, kode menegakkan lima',
  isi: 'Bab 3 mendaftar empat kelas pelanggaran. Validator pada kode memiliki lima galat sentinel: keempat kelas itu ditambah label yang bocor ke dalam prosa klaim. Kelas kelima ditampilkan apa adanya dan tidak dilebur ke dalam empat kelas naskah.',
  catatan:
    'Satu-satunya penolakan gerbang validasi yang pernah tercatat pada jalur nyata, yaitu pada putaran F8B, justru berasal dari kelas kelima itu; pekerjaan yang sama selesai pada percobaan berikutnya.',
  sumber:
    'bab3.tex:223 + ecosystem-futureguide/analysis-worker/internal/gemini/client.go:50–56 + bab4.tex:179',
}

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

/**
 * Urutan blok pada prompt sintesis, persis seperti yang ditulis pembangun
 * prompt. Yang penting bagi adegan ini: blok referensi berada sebelum blok
 * instruksi, sehingga isinya sudah tersedia saat model mulai menalar.
 */
export const blokPrompt: Array<{
  id: string
  nama: string
  keterangan: string
  opsional?: boolean
  referensi?: boolean
}> = [
  { id: 'peran', nama: 'PERAN', keterangan: 'Peran analis psikometri dan konselor karier.' },
  { id: 'konteks', nama: 'KONTEKS', keterangan: 'Tiga instrumen beserta jumlah butir dan skala skornya.' },
  { id: 'identitas', nama: 'IDENTITAS ASESI', keterangan: 'Hanya ditulis bila nama asesi tersedia.', opsional: true },
  { id: 'skor', nama: 'SKOR PENGGUNA', keterangan: '35 skor domain, terurut menurun per instrumen.' },
  { id: 'referensi', nama: 'REFERENSI AKADEMIK', keterangan: 'Blok referensi berlabel REF-01..REF-NN menurut urutan kemunculan.', referensi: true },
  { id: 'instruksi', nama: 'INSTRUKSI', keterangan: 'Langkah 0 sampai 6: telaah referensi, sitasi wajib, pemetaan lintas-instrumen, pemilihan arketipe, lalu penyusunan.' },
  { id: 'batasan', nama: 'BATASAN + DISIPLIN KLAIM', keterangan: 'Aturan disiplin klaim dibaca kedua kondisi ablasi, bukan hanya kondisi berbasis RAG.' },
  { id: 'anggaran', nama: 'ANGGARAN PANJANG', keterangan: 'Kontrak panjang per bidang; tidak dapat ditimpa penyimpan prompt.' },
  { id: 'panduan', nama: 'PANDUAN INTERPRETASI + KORELASI', keterangan: 'Rentang label skor dan aturan penopangan skor 70.' },
  { id: 'format', nama: 'FORMAT KELUARAN', keterangan: 'JSON murni tanpa markdown, beserta contoh parsial.' },
]

export const sumberBlokPrompt =
  'ecosystem-futureguide/analysis-worker/internal/gemini/prompt.go:32–340'

export const kontrakSkema: Bersumber & {
  mime: string
  identitasMin: number
  identitasMaks: number
  identitasTanpaReferensi: number
  panjangMaksLabel: number
  unitKlaim: number
  sumberKode: string
} = {
  mime: 'application/json',
  identitasMin: 1,
  identitasMaks: 3,
  identitasTanpaReferensi: 0,
  panjangMaksLabel: 8,
  unitKlaim: 9,
  sumberKode: 'ecosystem-futureguide/analysis-worker/internal/gemini/client.go:699–729',
  sumber: 'bab3.tex:221',
}

/**
 * Urutan pemeriksaan gerbang validasi, dibaca dari `validateClaimReferences`.
 * Urutannya penting: pemeriksaan prosa dikerjakan sebelum isi reference_ids,
 * dan pemeriksaan format dikerjakan sebelum keanggotaan himpunan.
 */
export const urutanGerbang: Array<Bersumber & { id: string; judul: string; isi: string }> = [
  {
    id: 'unit-lengkap',
    judul: 'Sembilan unit klaim harus lengkap',
    isi: 'Keluaran yang tidak memuat sembilan unit klaim ditolak sebelum label apa pun diperiksa.',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/gemini/client.go:490',
  },
  {
    id: 'himpunan-sah',
    judul: 'Himpunan label sah disusun ulang per permintaan',
    isi: 'Label sah dibangkitkan dari jumlah referensi yang benar-benar diinjeksikan, sehingga ruang label tertutup dan diketahui sebelum keluaran dibaca.',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/gemini/client.go:493',
  },
  {
    id: 'prosa',
    judul: 'Prosa klaim diperiksa lebih dulu',
    isi: 'Ruas text diperiksa terhadap pola label yang longgar sebelum reference_ids dibaca.',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/gemini/client.go:499',
  },
  {
    id: 'kondisi-referensi',
    judul: 'Cabang menurut ada atau tidaknya referensi',
    isi: 'Tanpa referensi, satu label pun adalah pelanggaran. Dengan referensi, daftar kosong adalah pelanggaran.',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/gemini/client.go:503',
  },
  {
    id: 'format-lalu-himpunan',
    judul: 'Format dahulu, keanggotaan kemudian',
    isi: 'Tiap label diuji terhadap pola REF-NN, lalu diuji keanggotaannya pada himpunan yang diinjeksikan.',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/gemini/client.go:517',
  },
  {
    id: 'duplikat',
    judul: 'Duplikat dinormalisasi, bukan ditolak',
    isi: 'Kemunculan pertama dipertahankan, sisanya dibuang, dan jumlahnya dicatat pada metadata retrieval.',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/gemini/client.go:530',
  },
]

/** Percobaan ulang saat keluaran ditolak gerbang validasi. */
export const percobaanUlang: Bersumber & {
  maksPercobaanUlang: number
  totalPemanggilan: number
  rumusJeda: string
  jeda: Array<{ percobaan: number; minDetik: number; maksDetik: number }>
  sumberKode: string
} = {
  maksPercobaanUlang: 3,
  totalPemanggilan: 4,
  rumusJeda: 'base = 2^(n-1) detik, ditambah jitter acak antara nol dan setengah base',
  jeda: [
    { percobaan: 2, minDetik: 1, maksDetik: 1.5 },
    { percobaan: 3, minDetik: 2, maksDetik: 3 },
    { percobaan: 4, minDetik: 4, maksDetik: 6 },
  ],
  sumberKode: 'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:81 + :152 + :278',
  sumber: 'bab3.tex:223',
}

export interface ReferensiTerinjeksi extends Bersumber {
  label: string
  id: string
  judul: string
  assessmentType: 'riasec' | 'ocean' | 'via_is' | 'cross'
  domain: string
  similarity: number
}

/**
 * Delapan referensi yang benar-benar diinjeksikan pada satu pekerjaan nyata,
 * dibaca dari penangkapan respons API. Urutan label mengikuti urutan kemunculan
 * pada respons, yang terurut menurun menurut similarity.
 */
export const referensiTerinjeksi: ReferensiTerinjeksi[] = [
  { label: 'REF-01', id: '4d9b358c-68c0-49bc-abe3-34802f5424f8', judul: 'Pearson-Marr Archetype Indicator (PMAI): A Twelve-Archetype Framework for Profile Identification', assessmentType: 'cross', domain: 'PMAI', similarity: 0.801124, sumber: 'bab4-results/14-reference-exposure/api-response-sample.json' },
  { label: 'REF-02', id: '384a13a3-1cac-46ec-b8dc-5e6ca2aacfdd', judul: 'PMAI Archetype Selection Algorithm: How to Identify the Lead Archetype from a Combined Profile', assessmentType: 'cross', domain: 'PMAI', similarity: 0.788690, sumber: 'bab4-results/14-reference-exposure/api-response-sample.json' },
  { label: 'REF-03', id: 'dabb42bd-0cd8-4754-8490-659f12bf66fa', judul: 'Archetype 1 — The Innocent: Profile Pattern and Score Indicators', assessmentType: 'cross', domain: 'Innocent', similarity: 0.788372, sumber: 'bab4-results/14-reference-exposure/api-response-sample.json' },
  { label: 'REF-04', id: '27cceb62-30b2-451a-9b62-0c8e86c02c8a', judul: 'RIASEC Congruence and Person-Environment Fit', assessmentType: 'riasec', domain: 'Realistic', similarity: 0.784022, sumber: 'bab4-results/14-reference-exposure/api-response-sample.json' },
  { label: 'REF-05', id: '4bb08218-2e30-460e-819f-419ea7bb5e63', judul: 'Integrating RIASEC, OCEAN, and VIA-IS for Comprehensive Psychological Profiling', assessmentType: 'cross', domain: 'RIASEC-OCEAN', similarity: 0.780140, sumber: 'bab4-results/14-reference-exposure/api-response-sample.json' },
  { label: 'REF-06', id: 'f17658e2-0924-40b0-89a3-f990c8a0c357', judul: 'Transcendence Virtue Strengths — Appreciation of Beauty, Gratitude, Hope, Humor, Spirituality', assessmentType: 'via_is', domain: 'Appreciation of Beauty', similarity: 0.778144, sumber: 'bab4-results/14-reference-exposure/api-response-sample.json' },
  { label: 'REF-07', id: '516cbb36-0a2f-4421-838e-6336ec6334ec', judul: 'RIASEC Type Combinations and Specific Career Pathway Predictions', assessmentType: 'riasec', domain: 'RIASEC', similarity: 0.775171, sumber: 'bab4-results/14-reference-exposure/api-response-sample.json' },
  { label: 'REF-08', id: 'a66445fd-0bf4-4317-b24e-03f34edf711d', judul: 'Courage Virtue Strengths — Bravery, Perseverance, Honesty, Zest', assessmentType: 'via_is', domain: 'Bravery', similarity: 0.772551, sumber: 'bab4-results/14-reference-exposure/api-response-sample.json' },
]

export interface UnitKlaimContoh extends Bersumber {
  claimPath: string
  claimIndex: number
  kelompok: string
  label: string[]
}

/**
 * Sembilan unit klaim beserta label yang benar-benar dipakai pada pekerjaan
 * yang sama. Label diturunkan dari identitas dokumen pada indeks keterlacakan
 * klaim, dipetakan balik ke posisi dokumen pada daftar referensi.
 */
export const unitKlaimContoh: UnitKlaimContoh[] = [
  { claimPath: 'profile_summary.signature_description', claimIndex: 0, kelompok: 'Ringkasan tanda tangan profil', label: ['REF-02', 'REF-05'], sumber: 'bab4-results/14-reference-exposure/api-response-sample.json' },
  { claimPath: 'detailed_analysis.strengths[0]', claimIndex: 1, kelompok: 'Butir kekuatan', label: ['REF-05', 'REF-07'], sumber: 'bab4-results/14-reference-exposure/api-response-sample.json' },
  { claimPath: 'detailed_analysis.strengths[1]', claimIndex: 2, kelompok: 'Butir kekuatan', label: ['REF-06'], sumber: 'bab4-results/14-reference-exposure/api-response-sample.json' },
  { claimPath: 'detailed_analysis.strengths[2]', claimIndex: 3, kelompok: 'Butir kekuatan', label: ['REF-08'], sumber: 'bab4-results/14-reference-exposure/api-response-sample.json' },
  { claimPath: 'detailed_analysis.strengths[3]', claimIndex: 4, kelompok: 'Butir kekuatan', label: ['REF-06', 'REF-08'], sumber: 'bab4-results/14-reference-exposure/api-response-sample.json' },
  { claimPath: 'detailed_analysis.strengths[4]', claimIndex: 5, kelompok: 'Butir kekuatan', label: ['REF-08'], sumber: 'bab4-results/14-reference-exposure/api-response-sample.json' },
  { claimPath: 'career_pathing.role_prospects[0].match_reason', claimIndex: 6, kelompok: 'Alasan kecocokan prospek peran', label: ['REF-07'], sumber: 'bab4-results/14-reference-exposure/api-response-sample.json' },
  { claimPath: 'career_pathing.role_prospects[1].match_reason', claimIndex: 7, kelompok: 'Alasan kecocokan prospek peran', label: ['REF-03'], sumber: 'bab4-results/14-reference-exposure/api-response-sample.json' },
  { claimPath: 'career_pathing.role_prospects[2].match_reason', claimIndex: 8, kelompok: 'Alasan kecocokan prospek peran', label: ['REF-06'], sumber: 'bab4-results/14-reference-exposure/api-response-sample.json' },
]

/** Satu klaim nyata dari penangkapan respons, dipakai sebagai contoh di layar. */
export const contohKlaimNyata: Bersumber & {
  signatureTitle: string
  claimPath: string
  teks: string
  label: string[]
} = {
  signatureTitle: 'The Seeker',
  claimPath: 'profile_summary.signature_description',
  teks: 'Bab4, profil Anda mencerminkan integrasi langka antara minat yang luas di seluruh domain RIASEC dan kekuatan karakter berbasis transendensi. Dengan skor 80 pada seluruh dimensi RIASEC dan VIA-IS, Anda menunjukkan pola motivasi tinggi untuk belajar dan berkontribusi. Ref-02 dan Ref-05 mencatat bahwa keseimbangan ini menandakan individu yang eksploratif namun memiliki keterikatan kuat pada nilai kemanusiaan.',
  label: ['REF-02', 'REF-05'],
  sumber: 'bab4-results/14-reference-exposure/api-response-sample.json',
}

/** Temuan pada artefak yang ditampilkan apa adanya, bukan dirapikan. */
export const temuanLabelDiProsa: Butir = {
  id: 'temuan-label-di-prosa',
  judul: 'Penangkapan respons memuat label di dalam prosa klaim',
  isi: 'Ruas text pada klaim ringkasan tanda tangan profil di penangkapan respons memuat frasa "Ref-02 dan Ref-05". Kedua label itu ter-resolve ke dua dokumen yang sama dengan yang tercatat pada reference_ids klaim tersebut, sehingga sitasinya benar; yang salah adalah tempatnya. Pola prosa pada validator hari ini, yaitu \\bREF[-\\s]?\\d tanpa membedakan huruf besar-kecil, menolak bentuk itu.',
  catatan:
    'Penangkapan bertanggal 29 Juli 2026, sedangkan larangan menuliskan label di dalam ruas text ditulis pada prompt yang dipakai rerun 31 Juli 2026. Artefak tidak disunting dan tidak dibuang.',
  sumber:
    'bab4-results/14-reference-exposure/api-response-sample.json + ecosystem-futureguide/analysis-worker/internal/gemini/client.go:64 + bab4.tex:179',
}

/**
 * Bobot skor jalur cadangan, dibaca dari `scoreByDomains`. Nilai-nilai ini
 * adalah bobot kecocokan label, bukan kesamaan makna.
 */
export const skorJalurCadangan: Bersumber & {
  komponen: Array<{ id: string; syarat: string; bobot: string }>
  urutanMuat: string
} = {
  komponen: [
    { id: 'cross', syarat: 'jenis asesmen dokumen bernilai cross', bobot: '+0,3' },
    { id: 'domain', syarat: 'nama domain cocok pada judul, isi, atau kolom domain', bobot: '+ skor domain / 100 × 0,7' },
    { id: 'tag', syarat: 'tag dokumen termasuk domain teratas profil', bobot: '+0,15 per tag' },
  ],
  urutanMuat: 'Dokumen dimuat menurut created_at menurun, dibatasi 500 baris, lalu diskor, diurutkan menurun, dan dipotong pada k.',
  sumber: 'ecosystem-futureguide/analysis-worker/internal/rag/retriever.go:252–275',
}

/** Tiga lapis pemaparan pada respons hasil asesmen. */
export const lapisPemaparan: Array<Bersumber & { id: string; nama: string; isi: string }> = [
  {
    id: 'daftar-referensi',
    nama: 'Daftar referensi tingkat hasil',
    isi: 'Identitas dokumen, judul, sumber, jenis asesmen, domain, dan nilai kesamaan, terurut menurun menurut similarity.',
    sumber: 'bab4.tex:186',
  },
  {
    id: 'indeks-klaim',
    nama: 'Indeks keterlacakan klaim',
    isi: 'Sembilan grup, masing-masing membawa jalur klaim, indeks klaim, dan daftar identitas dokumen penopangnya.',
    sumber: 'bab4.tex:186',
  },
  {
    id: 'pohon-hasil',
    nama: 'Identitas tertanam pada pohon hasil',
    isi: 'Identitas yang sama tertanam pada tiap unit klaim di dalam hasil, sehingga konsumen tidak perlu merekonstruksi apa pun dari teks.',
    sumber: 'bab4.tex:186',
  },
]

export const ujiKonsistensiKunci: Butir = {
  id: 'uji-konsistensi-kunci',
  judul: 'Kedua lapis tidak dapat saling bertentangan',
  isi: 'Setiap identitas yang muncul pada indeks keterlacakan klaim benar-benar ada di dalam daftar referensi tingkat hasil.',
  catatan:
    'Sumber kebenarannya adalah relasi yang ditulis worker di dalam satu transaksi, bukan sitasi yang diminta ulang dari model saat pembacaan.',
  sumber: 'bab4.tex:186',
}

/** Baris yang ditulis satu transaksi bersama hasil analisis. */
export const relasiTransaksi: Array<Bersumber & { tabel: string; isi: string }> = [
  { tabel: 'assessments', isi: 'Status, hasil analisis, dan waktu selesai.', sumber: 'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:938' },
  { tabel: 'assessment_domain_scores', isi: '35 skor domain per asesmen.', sumber: 'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:953' },
  { tabel: 'assessment_references', isi: 'Dokumen yang diambil pipeline beserta nilai similarity-nya.', sumber: 'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:982' },
  { tabel: 'assessment_claim_references', isi: 'Jalur klaim, indeks klaim, identitas dokumen, dan urutan sitasi.', sumber: 'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:1000' },
]

/** Label visual S09; ditempatkan di lapisan data agar viz tidak menulis istilah sendiri. */
export const labelSintesis: Bersumber & {
  judulVisual: string
  prompt: string
  blokReferensi: string
  blokInstruksi: string
  model: string
  skema: string
  gerbang: string
  terima: string
  tolak: string
  persist: string
  papar: string
  buatUlang: string
  unitKlaim: string
  identitas: string
  jalur: string
  jalurVektor: string
  jalurCadangan: string
  kondisiReferensi: string
  denganReferensi: string
  tanpaReferensi: string
  picu: string
  patuh: string
  labelGanda: string
  percobaan: string
  gagalTotal: string
  keterlacakan: string
  dokumen: string
  bukanPelanggaran: string
  batasJaminan: string
} = {
  judulVisual: 'Sintesis, gerbang validasi, dan keterlacakan',
  prompt: 'Prompt sintesis',
  blokReferensi: 'blok referensi',
  blokInstruksi: 'blok instruksi',
  model: 'Model generatif',
  skema: 'responseSchema per permintaan',
  gerbang: 'Gerbang validasi',
  terima: 'diterima',
  tolak: 'ditolak utuh',
  persist: 'Satu transaksi',
  papar: 'GET /assessments/{job_id}',
  buatUlang: 'buat ulang',
  unitKlaim: 'Sembilan unit klaim',
  identitas: 'identitas referensi',
  jalur: 'Jalur retrieval',
  jalurVektor: 'vektor',
  jalurCadangan: 'cadangan',
  kondisiReferensi: 'Blok referensi',
  denganReferensi: 'diinjeksikan',
  tanpaReferensi: 'tidak diinjeksikan',
  picu: 'Picu keadaan',
  patuh: 'keluaran patuh',
  labelGanda: 'label ganda',
  percobaan: 'percobaan',
  gagalTotal: 'pekerjaan dinyatakan gagal',
  keterlacakan: 'Label ter-resolve menjadi identitas dokumen',
  dokumen: 'dokumen',
  bukanPelanggaran: 'bukan pelanggaran',
  batasJaminan: 'Validasi menjamin identitas ter-resolve ke dokumen yang benar-benar diambil, bukan bahwa dokumen itu mendukung klaimnya secara makna.',
  sumber: 'bab3.tex:208–239 + bab4.tex:186',
}

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
    id: 'rag.batas-per-kueri-harness',
    adegan: 'S08',
    label: 'Batas dokumen per kueri pada harness kalibrasi k',
    nilai: 500,
    tampil: '500',
    satuan: 'dokumen',
    status: 'terukur',
    catatan:
      'Harness memakai batas tak terkapkan 500 per kueri, berbeda dari runtime yang memakai 3. Deviasi dicatat, bukan didamaikan.',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/rag/retriever_eval_test.go:28',
  },
  {
    id: 'rag.dokumen-unik-vektor',
    adegan: 'S08',
    label: 'Dokumen unik terambil pada jalur vektor',
    nilai: dokumenRetrieval.length,
    tampil: String(dokumenRetrieval.length),
    satuan: 'dokumen',
    status: 'terukur',
    catatan: 'Gabungan lima profil × lima nilai k pada jalur vektor; dihitung dari artefak, bukan diketik.',
    sumber: 'bab4-results/03-retrieval/retrieval-top-k.json',
  },
  {
    id: 'rag.precision-k-final',
    adegan: 'S08',
    label: 'Precision@k pada k final',
    nilai: 1,
    tampil: '1,0000',
    status: 'terukur',
    catatan: 'Jalur vektor, rerata lima profil; tiap profil 8 dari 8. Datar sejak k=4 sehingga tidak dapat menjadi pembeda.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:33',
  },
  {
    id: 'rag.strong-k-final',
    adegan: 'S08',
    label: 'Strong-Relevance@k pada k final',
    nilai: 0.5,
    tampil: '0,5000',
    status: 'terukur',
    pembilang: 4,
    penyebut: 8,
    catatan: 'Jalur vektor, rerata lima profil; setara 4,0 dari 8 referensi per profil.',
    sumber: 'bab4-results/BAB4_ANGKA_FINAL.md:34',
  },
  {
    id: 'rag.delta-kuat-6-8',
    adegan: 'S08',
    label: 'Tambahan referensi berdukungan kuat dari k=6 ke k=8',
    nilai: 1.4,
    tampil: '+1,4',
    satuan: 'referensi',
    status: 'terukur',
    catatan: 'Lonjakan terbesar pada seluruh rentang yang diuji.',
    sumber: 'bab4.tex:131',
  },
  {
    id: 'rag.delta-kuat-8-10',
    adegan: 'S08',
    label: 'Tambahan referensi berdukungan kuat dari k=8 ke k=10',
    nilai: 0.8,
    tampil: '+0,8',
    satuan: 'referensi',
    status: 'terukur',
    catatan: 'Disertai penurunan rasio Strong-Relevance 0,02 dan tambahan sekitar 500 token konteks.',
    sumber: 'bab4.tex:131',
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
  {
    id: 'rag.identitas-per-klaim-min',
    adegan: 'S09',
    label: 'Identitas referensi minimum per klaim',
    nilai: 1,
    tampil: '1',
    satuan: 'identitas',
    status: 'terukur',
    catatan: 'Berlaku ketika referensi tersedia; pada kondisi tanpa referensi skema mengunci minimum dan maksimum pada nol.',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/gemini/client.go:686',
  },
  {
    id: 'rag.identitas-per-klaim-maks',
    adegan: 'S09',
    label: 'Identitas referensi maksimum per klaim',
    nilai: 3,
    tampil: '3',
    satuan: 'identitas',
    status: 'terukur',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/gemini/client.go:687',
  },
  {
    id: 'rag.kelas-pelanggaran-naskah',
    adegan: 'S09',
    label: 'Kelas pelanggaran menurut naskah',
    nilai: 4,
    tampil: '4',
    satuan: 'kelas',
    status: 'terukur',
    sumber: 'bab3.tex:223',
  },
  {
    id: 'rag.kelas-pelanggaran-kode',
    adegan: 'S09',
    label: 'Galat sentinel penolakan pada kode',
    nilai: kelasPelanggaran.length,
    tampil: String(kelasPelanggaran.length),
    satuan: 'kelas',
    status: 'terukur',
    catatan:
      'Empat kelas naskah ditambah label yang bocor ke dalam prosa klaim. Deviasi dicatat, bukan didamaikan.',
    sumber: 'ecosystem-futureguide/analysis-worker/internal/gemini/client.go:50–56',
  },
  {
    id: 'rag.label-ganda-dinormalisasi',
    adegan: 'S09',
    label: 'Label dinormalisasi karena duplikasi',
    nilai: 0,
    tampil: '0',
    satuan: 'label',
    status: 'terukur',
    catatan: 'Rerun 31 Juli 2026; tidak ada klaim pada keluaran yang diterima yang membawa identitas ganda.',
    sumber: 'bab4.tex:179',
  },
  {
    id: 'rag.referensi-pada-penangkapan',
    adegan: 'S09',
    label: 'Referensi pada penangkapan respons',
    nilai: referensiTerinjeksi.length,
    tampil: String(referensiTerinjeksi.length),
    satuan: 'referensi',
    status: 'terukur',
    catatan: 'Satu pekerjaan nyata bertanggal 29 Juli 2026; sama dengan k final, tetapi dibaca dari artefak yang berbeda.',
    sumber: 'bab4-results/14-reference-exposure/api-response-sample.json',
  },
  {
    id: 'rag.identitas-pada-penangkapan',
    adegan: 'S09',
    label: 'Identitas referensi pada sembilan unit klaim',
    nilai: unitKlaimContoh.reduce((jumlah, unit) => jumlah + unit.label.length, 0),
    tampil: String(unitKlaimContoh.reduce((jumlah, unit) => jumlah + unit.label.length, 0)),
    satuan: 'identitas',
    status: 'terukur',
    catatan: 'Dihitung dari indeks keterlacakan klaim pada penangkapan respons, bukan diketik ulang.',
    sumber: 'bab4-results/14-reference-exposure/api-response-sample.json',
  },
]
