<script setup lang="ts">
import { ref } from 'vue'
import SceneLayout from '@/components/SceneLayout.vue'
import StepBlock from '@/components/StepBlock.vue'
import VizKeandalan from '@/components/viz/VizKeandalan.vue'
import {
  angkaDenganId,
  mekanismeKeandalan,
  operasiTransaksi,
  skenarioKeandalan,
  statusAnalysisRuns,
} from '@/data'

/** S04 — Keandalan pekerjaan analisis dari transaksi sampai DLQ. */
const statusAktif = ref('running')
const angkaKeandalan = [
  angkaDenganId('keandalan.skenario-lulus'),
  angkaDenganId('keandalan.pekerjaan-hilang'),
  angkaDenganId('keandalan.penyelesaian-ganda'),
  angkaDenganId('keandalan.heartbeat-ttl'),
  angkaDenganId('keandalan.maks-percobaan'),
  angkaDenganId('keandalan.uji-klaim'),
]

interface LangkahKeandalan {
  judul: string
  isi: string[]
  sumber: string
}

const langkah: LangkahKeandalan[] = [
  {
    judul: 'Satu transaksi menutup celah kehilangan pekerjaan',
    isi: [
      'Assessment-service tidak memotong token dahulu lalu berharap Redis hidup. Token debit, ledger, assessment, 200 jawaban, dan satu baris outbox berada dalam satu transaksi PostgreSQL.',
      'Jika transaksi gagal, seluruh operasi batal. Jika transaksi komit, catatan pekerjaan sudah tersimpan meski Redis belum tersentuh.',
    ],
    sumber: 'bab3.tex:254, ecosystem-futureguide/assessment-service/internal/repository/outbox.go:108',
  },
  {
    judul: 'Poller mengklaim baris, bukan berebut baris',
    isi: [
      'Poller mengambil outbox yang belum terbit memakai FOR UPDATE SKIP LOCKED, menaikkan publish_attempts, lalu LPUSH ke Redis dan menandai published.',
      'Kalau publish berhasil tetapi penandaan published gagal, baris dapat diterbitkan lagi pada siklus berikutnya. Ini jendela kegagalan yang sengaja ditampilkan, bukan disembunyikan.',
    ],
    sumber: 'bab3.tex:254, ecosystem-futureguide/assessment-service/internal/repository/outbox.go:166',
  },
  {
    judul: 'Semantik yang dijamin: at-least-once',
    isi: [
      'Outbox membuat pekerjaan tidak hilang, tetapi tidak menjanjikan exactly-once. Pesan yang sama bisa masuk Redis lebih dari sekali.',
      'Duplikasi dikendalikan di sisi analysis-worker melalui klaim Redis, gerbang status assessmentCompleted, dan idempotensi konsumen.',
    ],
    sumber: 'bab3.tex:264, bab4.tex:243',
  },
  {
    judul: 'HSETNX memilih satu pemilik pekerjaan',
    isi: [
      'Worker hanya memproses job bila HSETNX pada queue:analysis_jobs:claims berhasil. Penulisan pertama menang; worker lain harus mundur.',
      'Klaim ini adalah kepemilikan pekerjaan pada antrean, bukan kunci basis data. Ia menjaga satu ID pekerjaan tidak diproses dua worker hidup sekaligus.',
    ],
    sumber: 'bab3.tex:266, ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:374',
  },
  {
    judul: 'Heartbeat dan reclaimer memulihkan pekerjaan yatim',
    isi: [
      'Klaim hidup dijaga heartbeat 20 detik. Bila heartbeat berhenti dan klaim menjadi basi, reclaimer Lua memindahkan pekerjaan kembali ke pending atau ke DLQ.',
      'Interaksi pada visual dapat memicu status reclaimed untuk menunjukkan klaim yang diambil alih pekerja lain.',
    ],
    sumber: 'bab3.tex:268, ecosystem-futureguide/analysis-worker/internal/consumer/reclaimer.go:20',
  },
  {
    judul: 'Retry berhenti di DLQ, bukan hilang diam-diam',
    isi: [
      'Generasi analisis gagal diulang paling banyak tiga kali dengan exponential backoff berjitter. Sebelum batas, run dicatat failed dan pekerjaan kembali antre.',
      'Setelah batas terlampaui, Redis menerima entry DLQ dan analysis_runs berubah dlq sebagai status terminal yang dapat diaudit.',
    ],
    sumber: 'bab3.tex:268, bab4.tex:69, ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:470',
  },
]
</script>

<template>
  <SceneLayout
    kode="S04"
    judul="Keandalan"
    ikhtisar="Transactional outbox menjaga pekerjaan tidak hilang; klaim Redis, heartbeat, reclaimer, retry, dan DLQ mengendalikan duplikasi serta pemulihan."
  >
    <template #visual="{ langkah: aktif, gerakDikurangi }">
      <VizKeandalan
        v-model:status-aktif="statusAktif"
        :langkah="aktif"
        :jumlah-langkah="langkah.length"
        :gerak-dikurangi="gerakDikurangi"
        :operasi-transaksi="operasiTransaksi"
        :mekanisme="mekanismeKeandalan"
        :status-runs="statusAnalysisRuns"
        :skenario="skenarioKeandalan"
        :angka="angkaKeandalan"
      />
    </template>

    <template #alternatif>
      Visual menunjukkan lima operasi dalam satu transaksi PostgreSQL, poller
      FOR UPDATE SKIP LOCKED yang menerbitkan ke Redis, jendela kegagalan
      at-least-once, klaim HSETNX pada queue:analysis_jobs:claims, heartbeat
      20 detik, reclaimer Lua, retry maksimal 3, dan DLQ. Tombol status dapat
      mencapai running, completed, failed, reclaimed, dan dlq.
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
