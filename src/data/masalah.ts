/**
 * S01 — Masalah.
 *
 * Seluruh angka berasal dari Bab 1. Naskah tidak memuat persentase pasti untuk
 * ketidaksesuaian bidang kerja, jadi angkanya `null` dan tidak ditebak.
 */

import type { Angka, Bersumber, Butir } from './tipe'

export interface KartuStatistik extends Bersumber {
  id: string
  judul: string
  angka: Angka
  keterangan: string
}

export const kartuMasalah: KartuStatistik[] = [
  {
    id: 'ketidaksesuaian',
    judul: 'Bekerja di luar bidang studi',
    keterangan:
      'Data Survei Angkatan Kerja Nasional (Sakernas) menunjukkan hampir separuh pekerja Indonesia bekerja di luar bidang studinya.',
    sumber: 'bab1.tex:5',
    angka: {
      id: 'masalah.ketidaksesuaian-bidang',
      adegan: 'S01',
      label: 'Pekerja di luar bidang studi',
      nilai: null,
      tampil: 'hampir separuh',
      status: 'tanpa-bukti',
      catatan:
        'Naskah menulis "hampir separuh" tanpa persentase. Angka Sakernas tidak dikutip persis, jadi tidak boleh dinyatakan sebagai bilangan.',
      sumber: 'bab1.tex:5',
    },
  },
  {
    id: 'penalti-sebagian',
    judul: 'Selisih pendapatan, ketidaksesuaian sebagian',
    keterangan:
      'Ketidaksesuaian bidang berkaitan dengan pendapatan yang lebih rendah sekitar 11 persen pada ketidaksesuaian sebagian.',
    sumber: 'bab1.tex:5',
    angka: {
      id: 'masalah.penalti-pendapatan-sebagian',
      adegan: 'S01',
      label: 'Pendapatan lebih rendah (sebagian)',
      nilai: 11,
      tampil: '11%',
      satuan: 'persen',
      status: 'terukur',
      sumber: 'bab1.tex:5',
    },
  },
  {
    id: 'penalti-penuh',
    judul: 'Selisih pendapatan, ketidaksesuaian penuh',
    keterangan:
      'Pada ketidaksesuaian penuh, selisih pendapatannya lebih dari 25 persen.',
    sumber: 'bab1.tex:5',
    angka: {
      id: 'masalah.penalti-pendapatan-penuh',
      adegan: 'S01',
      label: 'Pendapatan lebih rendah (penuh)',
      nilai: 25,
      tampil: 'lebih dari 25%',
      satuan: 'persen',
      status: 'terukur',
      catatan: 'Naskah menulis batas bawah ("lebih dari"), bukan nilai persis.',
      sumber: 'bab1.tex:5',
    },
  },
  {
    id: 'rasio-bk',
    judul: 'Rasio ideal guru BK terhadap siswa',
    keterangan:
      'Permendikbud Nomor 111 Tahun 2014 menetapkan rasio ideal guru Bimbingan dan Konseling terhadap siswa sebesar 1:150.',
    sumber: 'bab1.tex:7',
    angka: {
      id: 'masalah.rasio-guru-bk',
      adegan: 'S01',
      label: 'Rasio ideal guru BK : siswa',
      nilai: 150,
      tampil: '1 : 150',
      satuan: 'siswa per guru BK',
      status: 'terukur',
      catatan:
        'Ini rasio ideal menurut regulasi, bukan rasio yang terukur di lapangan. Naskah tidak memuat rasio aktual.',
      sumber: 'bab1.tex:7',
    },
  },
]

/** Konteks yang tidak berupa angka, tetap tayang agar kartu tidak berdiri sendiri. */
export const konteksMasalah: Butir[] = [
  {
    id: 'lulusan-smk',
    judul: 'Lulusan SMK lebih tinggi',
    isi: 'Angka ketidaksesuaian lebih tinggi pada lulusan SMK.',
    catatan: 'Naskah tidak memuat besarannya, jadi tidak ada angka yang boleh ditampilkan.',
    sumber: 'bab1.tex:5',
  },
  {
    id: 'akar-masalah',
    judul: 'Masalahnya bermula sebelum bekerja',
    isi: 'Ketidaksesuaian dapat bermula saat siswa SMA memilih pendidikan tinggi tanpa cukup mengenali minat, kepribadian, dan kekuatan karakternya.',
    sumber: 'bab1.tex:5',
  },
  {
    id: 'beban-bimbingan',
    judul: 'Bimbingan karier menuntut lebih dari waktu',
    isi: 'Bimbingan karier menuntut waktu, kemampuan menafsirkan hasil pengukuran, serta instrumen psikometrik yang sesuai; layanan psikologi profesional belum tentu terjangkau setiap keluarga.',
    sumber: 'bab1.tex:7',
  },
  {
    id: 'tiga-kerangka',
    judul: 'Tiga kerangka yang saling melengkapi',
    isi: 'RIASEC membagi minat vokasional ke enam tipe, OCEAN mengukur lima dimensi kepribadian, dan VIA-IS mengenali 24 kekuatan karakter. Ketiganya mengukur hal yang berbeda, sehingga pembacaan bersama memberi gambaran yang lebih utuh.',
    sumber: 'bab1.tex:9',
  },
  {
    id: 'risiko-llm',
    judul: 'Model bahasa tanpa sumber berisiko',
    isi: 'Model bahasa dapat menghasilkan informasi keliru bila tidak didukung sumber yang jelas; RAG menekan risiko itu dengan mengambil informasi dari basis pengetahuan sebelum jawaban disusun.',
    sumber: 'bab1.tex:11',
  },
  {
    id: 'celah-penelitian',
    judul: 'Celah yang dituju',
    isi: 'Dari literatur yang ditinjau, penggunaan RAG untuk membaca profil dari beberapa kerangka sekaligus dalam satu sistem bimbingan karier masih jarang dibahas.',
    sumber: 'bab1.tex:11',
  },
]

export const angkaMasalah: Angka[] = kartuMasalah.map((kartu) => kartu.angka)
