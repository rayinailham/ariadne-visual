<script setup lang="ts">
import SceneLayout from '@/components/SceneLayout.vue'
import StepBlock from '@/components/StepBlock.vue'
import VizArsitektur from '@/components/viz/VizArsitektur.vue'
import {
  angkaDenganId,
  jalurPermintaan,
  layanan,
  modulBersama,
  titikJalurArsitektur,
} from '@/data'

/**
 * S03 — Arsitektur ekosistem dan pemisahan jalur cepat dari pekerjaan lambat.
 */
const angkaLayanan = angkaDenganId('arsitektur.jumlah-layanan')

interface LangkahArsitektur {
  judul: string
  isi: string[]
  sumber: string
}

const langkah: LangkahArsitektur[] = [
  {
    judul: 'Tujuh proses Go, satu pustaka bersama',
    isi: [
      'FutureGuide direalisasikan sebagai tujuh layanan Go yang berjalan sebagai proses terpisah. Di bawahnya ada shared: kode yang ditautkan ke beberapa layanan, bukan proses mandiri dan bukan microservice kedelapan.',
      'Garis putus-putus dari shared menunjukkan pemakaian pustaka. Garis itu bukan komunikasi jaringan antarlayanan.',
    ],
    sumber: 'bab3.tex:130, bab4.tex:36',
  },
  {
    judul: 'Kontribusi inti dibedakan dari komponen pendukung',
    isi: [
      'Assessment-service, analysis-worker, dan chat-service menopang tiga kontribusi yang dievaluasi: arsitektur andal, pipeline RAG analisis, dan obrolan SSE berbasis RAG.',
      'Auth-service, notification-service, payment-service, dan admin-service tetap diimplementasikan penuh, tetapi tidak dievaluasi sebagai kontribusi inti. Perbedaan garis pada diagram menyatakan lingkup evaluasi, bukan tingkat kepentingan operasional.',
    ],
    sumber: 'CONTEXT.md:38, CONTEXT.md:44',
  },
  {
    judul: 'Jalur HTTP berhenti setelah outbox tersimpan',
    isi: [
      'Klien mengirim 200 jawaban ke assessment-service. Di dalam satu transaksi PostgreSQL, layanan menyimpan asesmen dan jawaban sekaligus menyisipkan pekerjaan ke transactional outbox.',
      'Jalur ini berlangsung dalam hitungan milidetik. Klien tidak menunggu scoring, retrieval, atau Gemini selesai.',
    ],
    sumber: 'bab3.tex:134, bab3.tex:254',
  },
  {
    judul: 'Outbox memindahkan pekerjaan ke antrean',
    isi: [
      'Poller terpisah membaca outbox, menerbitkan pekerjaan ke Redis, lalu analysis-worker mengklaim pekerjaan sebelum memprosesnya. Batas ini memisahkan transaksi cepat dari pekerjaan latar yang lambat.',
      'Redis berperan sebagai antrean dan kanal Pub/Sub; sistem tidak memakai message broker tersendiri.',
    ],
    sumber: 'bab3.tex:116, bab3.tex:254, bab3.tex:266',
  },
  {
    judul: 'Pekerjaan lambat hidup di analysis-worker',
    isi: [
      'Analysis-worker menghitung skor, mengambil referensi melalui RAG, lalu meminta Gemini menyusun keluaran ber-skema. Hasil, skor domain, dan relasi sumber dipersist ke PostgreSQL.',
      'Pekerjaan ini berlangsung puluhan detik dan bergantung pada layanan eksternal. Pemisahan proses mencegah kegagalan Gemini ikut menahan transaksi HTTP pengiriman asesmen.',
    ],
    sumber: 'bab3.tex:134, bab3.tex:237',
  },
  {
    judul: 'Status kembali ke klien melalui SSE',
    isi: [
      'Setelah hasil kembali ke worker dan dipersist, perubahan status diterbitkan melalui Redis Pub/Sub. Notification-service meneruskannya sebagai SSE yang terautentikasi kepada klien.',
      'Diagram jalur merangkum urutan klien → assessment-service → outbox → Redis → analysis-worker → Gemini → notification-service → klien; keterangan aktif tetap menunjukkan hop internal yang diringkas.',
    ],
    sumber: 'bab3.tex:116, bab4.tex:38',
  },
]
</script>

<template>
  <SceneLayout
    kode="S03"
    judul="Arsitektur"
    ikhtisar="Tujuh layanan Go, satu pustaka bersama, dan batas tegas antara transaksi HTTP cepat dengan analisis puluhan detik."
  >
    <template #visual="{ langkah: aktif, gerakDikurangi }">
      <VizArsitektur
        :langkah="aktif"
        :jumlah-langkah="langkah.length"
        :gerak-dikurangi="gerakDikurangi"
        :layanan="layanan"
        :modul-bersama="modulBersama"
        :titik-jalur="titikJalurArsitektur"
        :rincian-jalur="jalurPermintaan"
        :angka-layanan="angkaLayanan"
      />
    </template>

    <template #alternatif>
      Diagram menempatkan tiga layanan kontribusi inti dengan garis utuh dan
      empat komponen pendukung dengan garis putus-putus. Modul shared berada
      pada lapisan pustaka terpisah dan terhubung ke seluruh layanan dengan
      garis putus-putus yang bukan koneksi jaringan. Jalur permintaan bergerak
      dari klien ke assessment-service, transactional outbox, Redis,
      analysis-worker, Gemini, notification-service, lalu kembali ke klien.
      Jalur cepat dan pekerjaan lambat dibedakan dengan label serta pola garis.
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
