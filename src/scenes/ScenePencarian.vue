<script setup lang="ts">
import SceneLayout from '@/components/SceneLayout.vue'
import StepBlock from '@/components/StepBlock.vue'
import VizPencarian from '@/components/viz/VizPencarian.vue'
import {
  angkaDenganId,
  batasRubrikRetrieval,
  catatanKomposisiDokumen,
  deviasiHarnessRetrieval,
  dokumenRetrieval,
  indeksHnsw,
  komposisiJenisDokumen,
  labelPencarian,
  langkahPencarian,
  metrikPerKCadangan,
  metrikPerKVektor,
  parameterK,
  retrievalVektor,
  traversalHnsw,
} from '@/data'

const angka = [
  angkaDenganId('rag.min-similarity'),
  angkaDenganId('rag.maks-dokumen-per-kueri'),
  angkaDenganId('rag.k-final'),
  angkaDenganId('rag.kondisi-retrieval'),
  angkaDenganId('rag.token-konteks-min'),
  angkaDenganId('rag.token-konteks-maks'),
  angkaDenganId('rag.batas-per-kueri-harness'),
  angkaDenganId('rag.dokumen-unik-vektor'),
  angkaDenganId('rag.precision-k-final'),
  angkaDenganId('rag.strong-k-final'),
  angkaDenganId('rag.delta-kuat-6-8'),
  angkaDenganId('rag.delta-kuat-8-10'),
]

const langkah = [
  {
    judul: 'Pencarian menuruni graf berlapis, bukan memindai satu per satu',
    isi: [
      'Pengurutan menurut jarak kosinus dilayani indeks HNSW yang dibangun pada kolom embedding dengan kelas operator vector_cosine_ops.',
      'Struktur itu berlapis: pencarian masuk dari lapisan atas yang jarang, turun ke lapisan yang makin padat, lalu mengunci kandidat tetangga terdekat pada lapisan dasar. Parameter m membatasi jumlah tetangga yang disimpan tiap simpul.',
    ],
    sumber: 'ecosystem-futureguide/migrations/014_pgvector_embeddings.up.sql:47, bab3.tex:206',
  },
  {
    judul: 'Operator mengembalikan jarak, bukan kesamaan',
    isi: [
      'Operator <=> pgvector mengembalikan jarak kosinus. Kesamaan yang dipakai seluruh angka pada halaman ini adalah satu dikurangi jarak itu.',
      'Karena vektor sudah dinormalisasi L2, kesamaan kosinus setara dot product, sehingga tidak ada penyesuaian tambahan sebelum perbandingan.',
    ],
    sumber:
      'ecosystem-futureguide/analysis-worker/internal/rag/retriever.go:82, bab3.tex:204',
  },
  {
    judul: 'Empat saringan sebelum apa pun sampai ke prompt',
    isi: [
      'Dokumen dengan kesamaan di bawah 0,3 dibuang di dalam kueri SQL, bukan sesudahnya. Saringan kedua hanya meloloskan dokumen yang jenis asesmennya sesuai atau bertipe cross.',
      'Runtime mengambil paling banyak tiga dokumen per kueri, lalu hasil kelima kueri didedup menurut identitas dokumen dengan mempertahankan instans berkesamaan tertinggi.',
    ],
    sumber:
      'ecosystem-futureguide/analysis-worker/internal/rag/retriever.go:76, :84, :110, ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:691',
  },
  {
    judul: 'Potong pada k teratas',
    isi: [
      'Hasil dedup diurutkan menurut kesamaan menurun dengan identitas dokumen sebagai pemecah seri, lalu dipotong pada k. Geser k pada panel: daftar referensi dan seluruh metriknya ikut berubah.',
      'Daftar yang tampil berasal dari harness kalibrasi, yang mengambil sampai 500 dokumen per kueri sebelum penggabungan, bukan tiga seperti runtime. Deviasi itu ditampilkan apa adanya.',
    ],
    sumber:
      'ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:851, ecosystem-futureguide/analysis-worker/internal/rag/retriever_eval_test.go:28',
  },
  {
    judul: 'Precision tidak dapat memilih k',
    isi: [
      'Pada jalur vektor, Precision@k bernilai 1,0000 sejak k terkecil untuk seluruh profil dan datar sepanjang rentang, sehingga keputusan batas referensi tidak dapat bersandar pada metrik itu.',
      'Pembeda sesungguhnya adalah Strong-Relevance beserta jumlah absolutnya dan biaya token. Dari enam ke delapan, rerata referensi berdukungan kuat naik 1,4; dari delapan ke sepuluh hanya 0,8 sambil rasio Strong turun 0,02 dan token bertambah sekitar 500.',
    ],
    sumber: 'bab4.tex:118, bab4.tex:131',
  },
  {
    judul: 'Delapan, beserta batas pembacaannya',
    isi: [
      'Delapan dipilih sebagai nilai terkecil yang sudah berada pada plateau dukungan kuat, bukan nilai terbesar dengan sedikit tambahan referensi kuat.',
      'Nilai itu terbatas pada lima profil sintetis, satu model, dan satu korpus, sehingga bukan optimum yang berlaku umum. Sebaran per profil tidak seragam dan tetap ditampilkan: pada k=8 profil riset memperoleh dukungan kuat tertinggi dan profil terstruktur terendah.',
    ],
    sumber: 'bab4.tex:140, bab4-results/11-decisions/k-final.md',
  },
]
</script>

<template>
  <SceneLayout
    kode="S08"
    judul="Pencarian HNSW dan potong k"
    ikhtisar="Vektor kueri menuruni indeks berlapis, jarak kosinus menjadi kesamaan, empat saringan berurutan menyusut kandidat, lalu hasilnya dipotong pada k."
  >
    <template #visual="{ langkah: aktif, gerakDikurangi }">
      <VizPencarian
        :langkah="aktif"
        :jumlah-langkah="langkah.length"
        :gerak-dikurangi="gerakDikurangi"
        :angka="angka"
        :dokumen="dokumenRetrieval"
        :retrieval="retrievalVektor"
        :saringan="langkahPencarian"
        :parameter-indeks="indeksHnsw.parameter"
        :traversal="traversalHnsw"
        :kandidat-k="parameterK.kandidat"
        :k-final="parameterK.final"
        :metrik-vektor="metrikPerKVektor"
        :metrik-cadangan="metrikPerKCadangan"
        :komposisi-jenis="komposisiJenisDokumen"
        :batas-rubrik="batasRubrikRetrieval"
        :deviasi-harness="deviasiHarnessRetrieval"
        :label="labelPencarian"
      />
    </template>

    <template #alternatif>
      Visual menampilkan traversal indeks HNSW berlapis sebagai tata letak
      ilustratif, lalu sumbu kesamaan nol sampai satu dengan ambang 0,3 dan
      jendela kesamaan yang benar-benar diterima pada nilai k yang dipilih.
      Lima saringan berurutan ditampilkan sebagai rangkaian: buang di bawah
      ambang, filter jenis asesmen, maksimum tiga dokumen per kueri, dedup
      lintas lima kueri, lalu potong pada k. Penonton memilih satu dari lima
      profil uji sintetis dan satu nilai k dari 4, 6, 8, 10, dan 12. Daftar
      referensi menampilkan peringkat, judul, jenis asesmen, domain, nilai
      rubrik, dan nilai kesamaan yang tercatat pada artefak Bab 4, sedangkan
      panel metrik menampilkan Precision@k, Strong-Relevance@k, jumlah
      referensi berdukungan kuat, dan token konteks beserta selisihnya terhadap
      k sebelumnya. Nilai k final Bab 4 adalah delapan.
    </template>

    <template #narasi>
      <StepBlock
        v-for="(item, indeks) in langkah"
        :key="item.judul"
        :indeks="indeks"
        :judul="item.judul"
        :sumber="item.sumber"
      >
        <p v-for="(paragraf, urut) in item.isi" :key="urut">{{ paragraf }}</p>
        <p v-if="indeks === 2" class="mt-4 text-mikro text-teks-samar">
          {{ catatanKomposisiDokumen.isi }}
        </p>
        <p v-if="indeks === 3" class="mt-4 text-mikro text-teks-samar">
          {{ deviasiHarnessRetrieval.catatan }}
        </p>
        <p v-if="indeks === 5" class="mt-4 text-mikro text-teks-samar">
          {{ batasRubrikRetrieval.catatan }}
        </p>
      </StepBlock>
    </template>
  </SceneLayout>
</template>
