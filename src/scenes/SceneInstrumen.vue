<script setup lang="ts">
import { computed, ref } from 'vue'
import SceneLayout from '@/components/SceneLayout.vue'
import StepBlock from '@/components/StepBlock.vue'
import VizInstrumen from '@/components/viz/VizInstrumen.vue'
import {
  angkaDenganId,
  arketipePmai,
  butirOceanPerDomain,
  catatanPmai,
  catatanProfilSintetis,
  instrumen,
  profilSintetis,
  type Butir,
} from '@/data'

/**
 * S02 — Instrumen psikometrik dan lapisan sintesis PMAI.
 *
 * Skor yang tampil pada batang diambil dari profil uji sintetis, bukan dari
 * siswa mana pun. PMAI digambar sebagai lapisan yang membentang di atas
 * ketiga instrumen, bukan sebagai blok keempat di sebelahnya.
 */
const catatan = (id: string): Butir => {
  const hasil = catatanPmai.find((c) => c.id === id)
  if (!hasil) throw new Error(`Catatan PMAI tidak dikenal: ${id}`)
  return hasil
}

const angka = {
  totalButir: angkaDenganId('instrumen.total-butir'),
  totalSkor: angkaDenganId('instrumen.total-skor-domain'),
  skala: angkaDenganId('instrumen.skala-jawaban'),
  batasBawah: angkaDenganId('instrumen.rentang-skor-bawah'),
  batasAtas: angkaDenganId('instrumen.rentang-skor-atas'),
  arketipe: angkaDenganId('instrumen.arketipe-pmai'),
}

const idProfil = ref(profilSintetis[0].id)
const profil = computed(
  () => profilSintetis.find((p) => p.id === idProfil.value) ?? profilSintetis[0],
)

/** 35 skor domain profil terpilih, digabung menjadi satu peta nama → skor. */
const skor = computed<Record<string, number>>(() => ({
  ...profil.value.riasec,
  ...profil.value.ocean,
  ...profil.value.via,
}))

const daftarProfil = profilSintetis.map((p) => ({ id: p.id, nama: p.nama }))

interface LangkahInstrumen {
  judul: string
  isi: string[]
  sumber: string
}

const langkah: LangkahInstrumen[] = [
  {
    judul: 'Satu sesi asesmen berisi tepat 200 butir',
    isi: [
      'Sesi asesmen memuat 60 butir RIASEC, 44 butir OCEAN yang mengikuti kerangka BFI-44, dan 96 butir VIA-IS. Lebar tiap blok di sebelah kanan sebanding dengan jumlah butirnya, dan satu kotak berarti satu butir.',
      'Butir yang dipakai berstatus operasional berbasis kerangka: jumlah butir, sebaran domain, dan pola pembalikan skor mengikuti struktur instrumen bakunya, tetapi teksnya bukan salinan resmi berlisensi.',
    ],
    sumber: 'bab3.tex:80',
  },
  {
    judul: 'Seluruh butir dijawab pada skala 1 sampai 5',
    isi: [
      'Skala jawaban yang seragam membuat rentang teoretis skor domain menjadi 20 sampai 100, bukan 0 sampai 100 dan bukan persentil. Jawaban bernilai 1 pada seluruh butir sebuah domain menghasilkan skor 20, sedangkan jawaban bernilai 5 menghasilkan skor 100.',
      'Skema basis data membatasi kolom skor pada rentang 0 sampai 100, jadi batas skema memang lebih longgar daripada rentang algoritmanya.',
    ],
    sumber: 'bab3.tex:80',
  },
  {
    judul: '200 butir menjadi 35 skor domain',
    isi: [
      'Modul penilaian pada pustaka bersama mengubah jawaban menjadi 35 skor domain: enam domain RIASEC dengan sepuluh butir per domain, lima domain OCEAN dengan jumlah butir tidak seragam, dan 24 kekuatan karakter VIA-IS dengan empat butir per kekuatan.',
      'Setiap kelompok kotak menyalur ke tepat satu batang tepat di bawahnya. Tinggi batang dibaca dari profil uji sintetis yang sedang dipilih, sehingga tidak ada nilai yang dikarang di dalam gambar.',
    ],
    sumber: 'bab3.tex:80, bab3.tex:175',
  },
  {
    judul: 'Skor itu persentase, bukan persentil',
    isi: [
      'Angka yang dihasilkan ketiga persamaan adalah persentase terhadap skor maksimum domainnya, bukan normalisasi minimum-maksimum, bukan persentil, dan bukan norma populasi. Skor 60 pada satu domain tidak berarti responden berada di atas 60 persen populasi mana pun.',
      'Penelitian tidak menguji validitas isi butir, tidak menghitung koefisien alfa Cronbach, tidak menjalankan analisis faktor, dan tidak menyusun norma populasi Indonesia. Sistem juga tidak menghitung skor gabungan lintas instrumen: 35 skor domain disimpan terpisah.',
    ],
    sumber: 'bab3.tex:194, bab3.tex:86',
  },
  {
    judul: 'PMAI adalah lapisan di atas, bukan instrumen keempat',
    isi: [
      'Siswa hanya menjawab 200 butir dari tiga instrumen. PMAI adalah taksonomi 12 arketipe yang dipakai sebagai lapisan sintesis: arketipe diturunkan dari kombinasi skor ketiga instrumen dan korpus rujukan, bukan dari butir jawaban tersendiri.',
      'Karena itu lapisan itu digambar dengan garis putus-putus yang membentang di atas ketiga blok sekaligus. Bidang signature_title dibatasi pada 12 arketipe dan divalidasi harus berisi tepat satu nilai dari himpunan itu, sehingga model tidak dapat mengarang nama arketipe baru.',
      'Validator yang lulus hanya membuktikan bahwa arketipe yang disebut berasal dari taksonomi tertutup, bukan bahwa penetapannya tepat secara psikologis.',
    ],
    sumber: 'CONTEXT.md:24, bab3.tex:221, bab4.tex:157',
  },
]
</script>

<template>
  <SceneLayout
    kode="S02"
    judul="Instrumen"
    ikhtisar="Jalan dari 200 butir jawaban menuju 35 skor domain, dan tempat PMAI berdiri terhadap ketiganya."
  >
    <template #visual="{ langkah: aktif, gerakDikurangi }">
      <VizInstrumen
        :langkah="aktif"
        :jumlah-langkah="langkah.length"
        :gerak-dikurangi="gerakDikurangi"
        :instrumen="instrumen"
        :butir-tak-seragam="butirOceanPerDomain"
        :skor="skor"
        :arketipe="arketipePmai"
        :label-pmai="catatan('bukan-instrumen').judul"
        :angka-total-butir="angka.totalButir"
        :angka-total-skor="angka.totalSkor"
        :angka-skala="angka.skala"
        :angka-batas-bawah="angka.batasBawah"
        :angka-batas-atas="angka.batasAtas"
        :angka-arketipe="angka.arketipe"
        :catatan-profil="catatanProfilSintetis"
        :nama-profil="profil.nama"
        :daftar-profil="daftarProfil"
        @pilih-profil="(id: string) => (idProfil = id)"
      />
    </template>

    <template #alternatif>
      Gambar menyusun 200 kotak butir dalam tiga blok yang lebarnya sebanding
      dengan jumlah butir tiap instrumen, lalu menyalurkan setiap kelompok butir
      ke satu batang skor domain di bawahnya sehingga terbentuk 35 batang. Di
      bawah seluruh batang terdapat bingkai putus-putus berisi 12 arketipe PMAI
      sebagai lapisan sintesis yang membentang di atas ketiga instrumen, bukan
      blok keempat yang berdiri sejajar.
    </template>

    <template #narasi>
      <StepBlock
        v-for="(l, i) in langkah"
        :key="l.judul"
        :indeks="i"
        :judul="l.judul"
        :sumber="l.sumber"
      >
        <p v-for="(paragraf, j) in l.isi" :key="j">{{ paragraf }}</p>
      </StepBlock>
    </template>
  </SceneLayout>
</template>
