<script setup lang="ts">
import SceneLayout from '@/components/SceneLayout.vue'
import StepBlock from '@/components/StepBlock.vue'
import VizSintesis from '@/components/viz/VizSintesis.vue'
import {
  angkaDenganId,
  arketipePmai,
  blokPrompt,
  contohKlaimNyata,
  degradasiAnggun,
  deviasiKelasPelanggaran,
  jalurCadangan,
  kelasPelanggaran,
  kontrakSkema,
  lapisPemaparan,
  langkahKeterlacakan,
  pelabelanReferensi,
  percobaanUlang,
  perlakuanLabelGanda,
  pemicuCadangan,
  referensiTerinjeksi,
  relasiTransaksi,
  skorJalurCadangan,
  temuanLabelDiProsa,
  ujiKonsistensiKunci,
  unitKlaimContoh,
  urutanGerbang,
  labelSintesis,
} from '@/data'

const angka = [
  angkaDenganId('rag.unit-klaim'),
  angkaDenganId('rag.identitas-per-klaim-min'),
  angkaDenganId('rag.identitas-per-klaim-maks'),
  angkaDenganId('rag.kelas-pelanggaran-naskah'),
  angkaDenganId('rag.kelas-pelanggaran-kode'),
  angkaDenganId('rag.label-ganda-dinormalisasi'),
  angkaDenganId('rag.batas-muat-cadangan'),
  angkaDenganId('rag.grup-keterlacakan'),
  angkaDenganId('rag.referensi-pada-penangkapan'),
  angkaDenganId('rag.identitas-pada-penangkapan'),
  angkaDenganId('instrumen.arketipe-pmai'),
  angkaDenganId('keandalan.maks-percobaan'),
]

const langkah = [
  {
    judul: 'Referensi diberi label, lalu diletakkan sebelum instruksi',
    isi: [
      'Referensi yang lolos cap diberi label REF-01 sampai REF-NN menurut urutan kemunculannya, dan label itulah yang dipakai model untuk menyitasi serta di-resolve kembali menjadi identitas dokumen oleh worker.',
      'Blok referensi ditulis sebelum blok instruksi supaya isinya sudah tersedia saat model mulai menalar. Ruang label bersifat tertutup dan diketahui sistem saat permintaan disusun, sehingga label di luar rentang yang diinjeksikan dapat dipastikan fabrikasi tanpa kueri tambahan ke basis data.',
    ],
    sumber: 'bab3.tex:208, ecosystem-futureguide/analysis-worker/internal/gemini/prompt.go:19 + :80',
  },
  {
    judul: 'Skema disusun ulang tiap permintaan',
    isi: [
      'Bentuk keluaran dikunci melalui responseSchema dengan ResponseMIMEType bernilai application/json. Bidang signature_title dibatasi pada himpunan tertutup dua belas arketipe PMAI dan divalidasi harus memuat tepat satu keluarga arketipe.',
      'Skema mewajibkan satu sampai tiga identitas per klaim ketika referensi tersedia, dan mengunci minimum sekaligus maksimum pada nol ketika referensi tidak tersedia. Dua kondisi itu tidak dapat dipenuhi satu bentuk skema tetap, sehingga skema dibangun per permintaan mengikuti jumlah referensi yang benar-benar diinjeksikan. Sembilan unit klaim dinilai: satu ringkasan tanda tangan profil, lima butir kekuatan, dan tiga alasan kecocokan prospek peran.',
    ],
    sumber:
      'bab3.tex:221, ecosystem-futureguide/analysis-worker/internal/gemini/client.go:699, bab4.tex:162',
  },
  {
    judul: 'Gerbang validasi: empat kelas pada naskah, lima galat pada kode',
    isi: [
      'Kontrak sitasi ditegakkan sebelum keluaran dinyatakan berhasil. Empat kelas pelanggaran yang disebut Bab 3 adalah klaim tanpa identitas padahal referensi tersedia, label berformat salah, label di luar himpunan yang diinjeksikan, dan identitas yang muncul pada kondisi tanpa referensi.',
      'Validator pada kode menegakkan satu kelas lagi yang tidak terdaftar di naskah: label yang bocor ke dalam ruas teks klaim. Kelas itu ditampilkan apa adanya karena satu-satunya penolakan yang pernah tercatat pada jalur nyata justru berasal dari sana. Picu tiap keadaan pada panel; label ganda sengaja disediakan sebagai pembanding karena ia dinormalisasi, bukan ditolak.',
    ],
    sumber:
      'bab3.tex:223, ecosystem-futureguide/analysis-worker/internal/gemini/client.go:50, bab4.tex:179',
  },
  {
    judul: 'Ditolak berarti ditolak seluruhnya',
    isi: [
      'Penolakan memicu pembuatan ulang. Sistem tidak pernah membuang identitas yang tidak sah lalu menyajikan sisanya, karena keluaran seperti itu tampak patuh sambil menyembunyikan bagian yang tidak dapat dipertanggungjawabkan. Pada panel, satu label gugur menjatuhkan kesembilan unit klaim sekaligus.',
      'Percobaan ulang memakai jeda yang berlipat ganda dengan jitter, dan pekerjaan hanya dinyatakan gagal ketika seluruh percobaan gagal. Tekan tombol keadaan yang sama berkali-kali untuk menaikkan nomor percobaan sampai batasnya.',
    ],
    sumber:
      'bab3.tex:223, ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:81 + :152',
  },
  {
    judul: 'Empat pemicu memindahkan alur ke jalur cadangan',
    isi: [
      'Ketersediaan pencarian vektor dideteksi saat layanan mulai berjalan dengan memeriksa ekstensi pada katalog pg_extension sekaligus memastikan kolom embedding benar-benar bertipe vektor. Empat keadaan memindahkan alur: pgvector tidak tersedia, pemanggilan embedding gagal, vektor bernilai nol seluruhnya, atau dimensinya bukan 768.',
      'Pada keadaan itu retriever memuat sampai 500 dokumen lalu memberi skor di sisi Go dari kecocokan jenis asesmen, domain, judul, dan tag. Alur analisis tidak berhenti dan keluarannya tetap membawa referensi.',
    ],
    sumber:
      'bab3.tex:231, ecosystem-futureguide/analysis-worker/internal/rag/retriever.go:40 + :164 + :252',
  },
  {
    judul: 'Label ter-resolve menjadi identitas dokumen, lalu dipaparkan',
    isi: [
      'Worker me-resolve label pada keluaran model menjadi identitas dokumen, lalu menyimpan jalur klaim, indeks klaim, identitas dokumen, dan urutan sitasi ke tabel relasi di dalam transaksi yang sama dengan hasil analisis, skor domain, dan daftar referensi asesmen.',
      'Respons hasil asesmen memaparkan tiga lapis sekaligus: daftar referensi tingkat hasil, indeks keterlacakan klaim berisi sembilan grup, dan identitas yang sama tertanam pada tiap unit klaim di dalam pohon hasil. Daftar pada panel dibaca dari satu penangkapan respons nyata, bukan dari contoh yang dikarang.',
    ],
    sumber: 'bab3.tex:237, bab4.tex:186, bab4-results/14-reference-exposure/api-response-sample.json',
  },
]
</script>

<template>
  <SceneLayout
    kode="S09"
    judul="Sintesis, validasi, dan keterlacakan"
    ikhtisar="Referensi berlabel masuk ke prompt sebelum instruksi, skema dibangun per permintaan, gerbang validasi menolak keluaran secara utuh, dan label yang lolos ter-resolve menjadi identitas dokumen yang dipaparkan API."
  >
    <template #visual="{ langkah: aktif, gerakDikurangi }">
      <VizSintesis
        :langkah="aktif"
        :jumlah-langkah="langkah.length"
        :gerak-dikurangi="gerakDikurangi"
        :angka="angka"
        :blok="blokPrompt"
        :skema="kontrakSkema"
        :arketipe="arketipePmai"
        :kelas="kelasPelanggaran"
        :label-ganda="perlakuanLabelGanda"
        :gerbang="urutanGerbang"
        :percobaan="percobaanUlang"
        :referensi="referensiTerinjeksi"
        :unit-klaim="unitKlaimContoh"
        :pemicu="pemicuCadangan"
        :cadangan="jalurCadangan"
        :skor-cadangan="skorJalurCadangan"
        :pemaparan="lapisPemaparan"
        :relasi="relasiTransaksi"
        :label="labelSintesis"
      />
    </template>

    <template #alternatif>
      Visual menampilkan alur satu permintaan sintesis dari kiri ke kanan: jalur
      retrieval, prompt yang memuat blok referensi di atas blok instruksi, model
      generatif dengan skema per permintaan, gerbang validasi, lalu penyimpanan
      satu transaksi dan pemaparan pada titik akhir hasil asesmen. Penonton
      memilih jalur vektor atau salah satu dari empat pemicu jalur cadangan,
      memilih ada atau tidaknya blok referensi, dan memicu lima kelas pelanggaran
      beserta keadaan label ganda dan keluaran patuh. Daftar sembilan unit klaim
      menampilkan jalur klaim dan label referensinya; ketika satu label gugur,
      kesembilan unit ditandai ditolak sekaligus dan panel kanan menampilkan nama
      galat sentinel, jalur klaim yang melanggar, nomor percobaan, serta jeda
      percobaan berikutnya. Pada langkah terakhir, tiap label ditampilkan
      ter-resolve menjadi awalan identitas dokumen, domain, dan nilai kesamaannya.
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

        <p v-if="indeks === 0" class="mt-4 text-mikro text-teks-samar">
          {{ pelabelanReferensi.alasan[1] }}
        </p>
        <p v-if="indeks === 2" class="mt-4 text-mikro text-teks-samar">
          {{ deviasiKelasPelanggaran.catatan }}
        </p>
        <p v-if="indeks === 2" class="mt-2 text-mikro text-teks-samar">
          {{ temuanLabelDiProsa.judul }}: {{ temuanLabelDiProsa.isi }} {{ temuanLabelDiProsa.catatan }}
        </p>
        <p v-if="indeks === 3" class="mt-4 text-mikro text-teks-samar">
          {{ perlakuanLabelGanda.isi }} {{ perlakuanLabelGanda.catatan }}
        </p>
        <p v-if="indeks === 4" class="mt-4 text-mikro text-teks-samar">
          {{ jalurCadangan.batasPembacaan }}
        </p>
        <p v-if="indeks === 5" class="mt-4 text-mikro text-teks-samar">
          {{ ujiKonsistensiKunci.isi }} {{ ujiKonsistensiKunci.catatan }}
        </p>
        <p v-if="indeks === 5" class="mt-2 text-mikro text-teks-samar">
          {{ langkahKeterlacakan[4]!.isi }} {{ degradasiAnggun[2]!.isi }}
        </p>
        <p v-if="indeks === 5" class="mt-2 text-mikro text-teks-samar">
          Contoh nyata: signature_title “{{ contohKlaimNyata.signatureTitle }}”, klaim
          {{ contohKlaimNyata.claimPath }} membawa {{ contohKlaimNyata.label.join(' dan ') }}.
        </p>
      </StepBlock>
    </template>
  </SceneLayout>
</template>
