# Verifikasi angka — lapisan data web visual

**Berkas ini dibangkitkan mesin.** Jangan disunting tangan; ubah `src/data/*.ts` lalu jalankan `npm run verifikasi`.

Setiap angka yang tayang di situs wajib muncul di sini beserta berkas dan baris asalnya. Angka tanpa bukti ditulis kosong, tidak ditebak. Metrik yang penyebutnya nol ditulis tak terdefinisi, bukan nol.

Total angka terdaftar: **93**. Tanpa nilai numerik: **8**.

## S01 — Masalah

| Angka | Tampil | Status | Sumber | Catatan |
| --- | --- | --- | --- | --- |
| Pekerja di luar bidang studi | hampir separuh | tanpa angka pasti pada naskah | `bab1.tex:5` | Naskah menulis "hampir separuh" tanpa persentase. Angka Sakernas tidak dikutip persis, jadi tidak boleh dinyatakan sebagai bilangan. |
| Pendapatan lebih rendah (sebagian) | 11% | terukur | `bab1.tex:5` | — |
| Pendapatan lebih rendah (penuh) | lebih dari 25% | terukur | `bab1.tex:5` | Naskah menulis batas bawah ("lebih dari"), bukan nilai persis. |
| Rasio ideal guru BK : siswa | 1 : 150 | terukur | `bab1.tex:7` | Ini rasio ideal menurut regulasi, bukan rasio yang terukur di lapangan. Naskah tidak memuat rasio aktual. |

## S02 — Instrumen

| Angka | Tampil | Status | Sumber | Catatan |
| --- | --- | --- | --- | --- |
| Butir per sesi asesmen | 200 | terukur | `bab3.tex:80` | 60 RIASEC + 44 OCEAN + 96 VIA-IS. |
| Skor domain per profil | 35 | terukur | `bab3.tex:80` | 6 RIASEC + 5 OCEAN + 24 VIA-IS. Tidak ada skor gabungan lintas instrumen. |
| Skala jawaban | 1 sampai 5 | terukur | `bab3.tex:80` | — |
| Batas bawah skor domain | 20 | terukur | `bab3.tex:80` | Rentang teoretis 20 sampai 100, bukan 0 sampai 100 dan bukan persentil. Skema basis data memang lebih longgar (0 sampai 100). |
| Batas atas skor domain | 100 | terukur | `bab4.tex:58` | Diverifikasi uji unit pada `shared/scorer/scorer_test.go`. |
| Arketipe PMAI | 12 | terukur | `CONTEXT.md:24` | Himpunan tertutup. PMAI adalah lapisan sintesis non-psikometrik, bukan instrumen keempat. |

## S03 — Arsitektur

| Angka | Tampil | Status | Sumber | Catatan |
| --- | --- | --- | --- | --- |
| Layanan Go | 7 | terukur | `bab3.tex:130` | Ditambah satu modul pustaka bersama `shared` yang bukan microservice. |
| Tabel inti pada skema | 20 | terukur | `bab3.tex:148` | — |
| Berkas migrasi *.up.sql (Bab 3) | 56 | terukur | `bab3.tex:148` | Bab 3 menulis 56 berkas up; pemeriksaan langsung pada Bab 4 menemukan 54 berkas up. Kedua angka ditampilkan apa adanya, tidak didamaikan. |
| Berkas migrasi *.up.sql (pemeriksaan Bab 4) | 54 | terukur | `bab4.tex:46` | 98 berkas total: 54 up + 44 down, menghasilkan 44 pasangan lengkap dan 10 berkas up tanpa pasangan turunnya. Bab 4 tidak mengklaim seluruh berkas telah dijalankan. |

## S04 — Keandalan

| Angka | Tampil | Status | Sumber | Catatan |
| --- | --- | --- | --- | --- |
| Skenario keandalan lulus | 5 dari 5 (5/5) | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:87` | R1–R3 pada tingkat komponen dengan Redis tiruan; R4–R5 menambah integrasi PostgreSQL. Bukan uji kekacauan multi-simpul. |
| Pekerjaan analisis hilang | 0 | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:88` | Nol pada simulasi throughput lokal dan pada skenario R yang diuji. |
| Penyelesaian ganda | 0 | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:89` | Dijaga klaim/ack + gerbang assessmentCompleted. |
| Selang heartbeat | 20 detik | terukur | `ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:83` | — |
| Batas percobaan ulang | 3 | terukur | `ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:81` | `maxRetries` dan `maxJobAttempts` sama-sama bernilai 3. |
| Uji klaim, konfirmasi, percobaan ulang, reklamasi | 21 | terukur | `bab4.tex:69` | Ditambah enam uji poller outbox pada assessment-service. |

## S05 — Korpus RAG

| Angka | Tampil | Status | Sumber | Catatan |
| --- | --- | --- | --- | --- |
| Unit dokumen korpus | 127 | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:18` | — |
| Sumber akademik unik | 112 | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:19` | Satu sumber dapat mendasari lebih dari satu unit. |
| Berkas chunk | 17 | terukur | `bab3.tex:90` | — |
| Dimensi vektor | 768 | terukur | `bab3.tex:204` | — |
| Norma vektor sampel | 1,000000 | terukur | `bab4.tex:50` | Sampel vektor yang diperiksa berdimensi 768 dengan norma 1,000000 sesuai normalisasi L2. |
| Parameter HNSW m | 16 | terukur | `ecosystem-futureguide/migrations/014_pgvector_embeddings.up.sql:47` | — |
| Parameter HNSW ef_construction | 64 | terukur | `ecosystem-futureguide/migrations/014_pgvector_embeddings.up.sql:47` | — |

## S06 — Skor menjadi kueri

| Angka | Tampil | Status | Sumber | Catatan |
| --- | --- | --- | --- | --- |
| Ambang RIASEC | 50 | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:23` | — |
| Ambang OCEAN | 50 | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:24` | — |
| Ambang VIA-IS | 75 | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:25` | Terkunci 75 untuk Bab 4. Kode runtime memakai 70 dan harness ablasi memakai 70; deviasi dicatat, bukan didamaikan. |
| Pasangan ambang kandidat | 27 | terukur | `bab4.tex:98` | Lima profil × 27 pasangan = 135 baris ruang uji. |
| Baris terdominasi VIA-IS | 99 dari 135 (99/135) | terukur | `bab4.tex:100` | Dominasi = jumlah domain VIA-IS lolos melebihi gabungan RIASEC dan OCEAN. |
| Profil terdominasi pada 50/50/75 | 0 dari 5 (0/5) | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:26` | Satu-satunya kandidat dengan nol dominasi, sambil mempertahankan 5 dari 5 domain target. |
| Kueri bertema per profil | 5 | terukur | `bab3.tex:202` | — |

## S07 — Embedding

| Angka | Tampil | Status | Sumber | Catatan |
| --- | --- | --- | --- | --- |
| Dimensi vektor kueri | 768 | terukur | `bab3.tex:204` | — |

## S08 — Pencarian dan top-k

| Angka | Tampil | Status | Sumber | Catatan |
| --- | --- | --- | --- | --- |
| Ambang kesamaan minimum | 0,3 | terukur | `ecosystem-futureguide/analysis-worker/internal/rag/retriever.go:76` | — |
| Maksimum dokumen per kueri | 3 | terukur | `ecosystem-futureguide/analysis-worker/internal/consumer/job_consumer.go:691` | — |
| Batas referensi analisis (k) | 8 | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:31` | Runtime sebelum kalibrasi bernilai 6; setelah kalibrasi 8, diterapkan pada DB dan retrieval_cap worker. |
| Kondisi evaluasi retrieval | 50 | terukur | `bab4.tex:116` | 5 profil × 2 jalur × 5 nilai k; seluruhnya berstatus ok tanpa no_result. |
| Batas dokumen per kueri pada harness kalibrasi k | 500 | terukur | `ecosystem-futureguide/analysis-worker/internal/rag/retriever_eval_test.go:28` | Harness memakai batas tak terkapkan 500 per kueri, berbeda dari runtime yang memakai 3. Deviasi dicatat, bukan didamaikan. |
| Dokumen unik terambil pada jalur vektor | 24 | terukur | `bab4-results/03-retrieval/retrieval-top-k.json` | Gabungan lima profil × lima nilai k pada jalur vektor; dihitung dari artefak, bukan diketik. |
| Precision@k pada k final | 1,0000 | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:33` | Jalur vektor, rerata lima profil; tiap profil 8 dari 8. Datar sejak k=4 sehingga tidak dapat menjadi pembeda. |
| Strong-Relevance@k pada k final | 0,5000 (4/8) | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:34` | Jalur vektor, rerata lima profil; setara 4,0 dari 8 referensi per profil. |
| Tambahan referensi berdukungan kuat dari k=6 ke k=8 | +1,4 | terukur | `bab4.tex:131` | Lonjakan terbesar pada seluruh rentang yang diuji. |
| Tambahan referensi berdukungan kuat dari k=8 ke k=10 | +0,8 | terukur | `bab4.tex:131` | Disertai penurunan rasio Strong-Relevance 0,02 dan tambahan sekitar 500 token konteks. |
| Token konteks terendah | 1.249 | terukur | `bab4.tex:116` | — |
| Token konteks tertinggi | 4.022 | terukur | `bab4.tex:116` | — |

## S09 — Sintesis dan keterlacakan

| Angka | Tampil | Status | Sumber | Catatan |
| --- | --- | --- | --- | --- |
| Unit klaim per keluaran | 9 | terukur | `bab4.tex:162` | 1 ringkasan tanda tangan + 5 butir kekuatan + 3 alasan kecocokan prospek peran. |
| Batas muat jalur cadangan | 500 | terukur | `ecosystem-futureguide/analysis-worker/internal/rag/retriever.go:170` | — |
| Grup indeks keterlacakan klaim pada respons | 9 | terukur | `bab4.tex:186` | — |

## S10 — Obrolan SSE

| Angka | Tampil | Status | Sumber | Catatan |
| --- | --- | --- | --- | --- |
| Maksimum referensi obrolan | 6 | terukur | `ecosystem-futureguide/chat-service/internal/repository/postgres.go:366` | Berbeda dari 8 pada analisis karena anggaran token, bukan karena mekanismenya berlainan. |
| Pertanyaan terkendali dikirim | 12 | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:108` | Tersebar merata pada empat kategori: penjelasan skor, hubungan lintas-instrumen, eksplorasi jurusan dan karier, serta pertanyaan berisiko tinggi. |
| Jawaban terbit | 7 | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:109` | — |
| Pertanyaan gagal | 5 dari 12 (5/12) | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:110` | Gagal pada batas waktu hulu 120 detik. Kelimanya berada di luar penyebut ARE dan empat kriteria, dilaporkan apa adanya dan tidak dinilai nol. |
| Jenis peristiwa pada kontrak aliran | 6 | terukur | `bab4.tex:216` | session_info, history, streaming_start, message_references, chunk, message_complete. Peristiwa error menggantikan penutup saat gagal. |

## S11 — Hasil

| Angka | Tampil | Status | Sumber | Catatan |
| --- | --- | --- | --- | --- |
| Precision@8 jalur vektor | 1,0000 | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:33` | Rerata lima profil; tiap profil 8 dari 8. Jenuh sejak k = 4. |
| Strong-Relevance@8 jalur vektor | 0,5000 | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:34` | Rerata lima profil; mean 4,0 dari 8 referensi berskor 2. |
| Precision@8 jalur cadangan | 0,9000 | terukur | `bab4.tex:142` | Tidak pernah mencapai nilai penuh pada rentang k mana pun; inilah bukti kuantitatif bahwa jalur cadangan menjaga ketersediaan dengan mutu relevansi yang lebih rendah. |
| Strong-Relevance@8 jalur cadangan | 0,5750 | terukur | `bab4.tex:142` | Perbandingan hanya sah pada tingkat metrik rubrik; skor mentah kedua jalur tidak pernah disandingkan pada satu skala. |
| Baris penilaian relevansi | 400 | terukur | `bab4.tex:116` | Distribusi: 29 baris bernilai 0, 163 baris bernilai 1, 208 baris bernilai 2. |
| Kepatuhan responseSchema | 1,0 (5 dari 5) (5/5) | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:82` | — |
| Tepat satu arketipe PMAI sah | 1,0 (5 dari 5) (5/5) | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:83` | Mengukur bentuk, bukan isi. |
| Identitas lolos validasi tiga lapis | 197 dari 197 (197/197) | terukur | `bab4.tex:168` | Tidak ada identitas yang gugur di antara lapis: pengenal sah, ada di korpus, termasuk himpunan hasil retrieval. |
| Throughput 1 replika | 11,999656 | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:94` | — |
| Throughput 2 replika | 23,999381 | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:95` | — |
| Throughput 4 replika | 47,998357 | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:96` | — |
| Penyelesaian terukur pada simulasi | 216 | terukur | `bab4.tex:84` | Seluruhnya berhasil tanpa pekerjaan hilang maupun penyelesaian ganda pada simulasi. |
| Cache hit ratio | n/a | tidak diukur (n/a) | `bab4-results/BAB4_ANGKA_FINAL.md:102` | Provider cache tidak tersedia pada gate live; TestLiveContextCacheOnOff gagal dengan pesan context cache unavailable. |
| Token saving ratio | n/a | tidak diukur (n/a) | `bab4-results/BAB4_ANGKA_FINAL.md:103` | — |
| Latency change ratio | n/a | tidak diukur (n/a) | `bab4-results/BAB4_ANGKA_FINAL.md:104` | — |
| Uji fitur keterlacakan | 43 dari 43 (43/43) | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:52` | 24 uji analysis-worker, 6 assessment-service, 13 chat-service. Tanpa kegagalan maupun pelewatan. |
| Durasi uji end-to-end | 73,868 detik | terukur | `bab4.tex:223` | — |
| GCR dengan RAG | 0,8667 (117/135) | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:65` | F8B: 0,6444 (87/135) pada kedua kondisi |
| GCR tanpa RAG | 0,8667 (117/135) | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:65` | — |
| UCR dengan RAG | 0,0000 (0/135) | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:66` | F8B: sama |
| UCR tanpa RAG | 0,0000 (0/135) | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:66` | — |
| CPC dengan RAG | 1,0000 (135/135) | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:67` | F8B: sama |
| CPC tanpa RAG | 0,0000 (0/135) | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:67` | — |
| CVR dengan RAG | 1,0000 (135/135) | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:68` | F8B: sama |
| CVR tanpa RAG | tak terdefinisi (0/0) | tak terdefinisi (penyebut nol) | `bab4-results/BAB4_ANGKA_FINAL.md:68` | — |
| CSC dengan RAG | 0,8667 (117/135) | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:69` | F8B: 0,6444 (87/135) pada kondisi RAG |
| CSC tanpa RAG | 0,0000 (0/135) | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:69` | — |
| SCC dengan RAG | 1,0000 (135/135) | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:70` | F8B: sama |
| SCC tanpa RAG | 0,0000 (0/135) | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:70` | — |
| FLR dengan RAG | 0,0000 (0/197) | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:71` | F8B: 0,0000 (0/201) pada kondisi RAG |
| FLR tanpa RAG | tak terdefinisi (0/0) | tak terdefinisi (penyebut nol) | `bab4-results/BAB4_ANGKA_FINAL.md:71` | — |
| RRR dengan RAG | tak terdefinisi (0/0) | tak terdefinisi (penyebut nol) | `bab4-results/BAB4_ANGKA_FINAL.md:72` | F8B: 1,0000 (1/1) pada kondisi RAG — satu keluaran ditolak karena label sitasi bocor ke prosa klaim, lalu selesai pada percobaan berikutnya. |
| RRR tanpa RAG | tak terdefinisi (0/0) | tak terdefinisi (penyebut nol) | `bab4-results/BAB4_ANGKA_FINAL.md:72` | — |
| Konsisten dengan skor terpersist | 0,8000 (4/5) | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:112` | Satu kegagalan berasal dari peringkat kekuatan yang dinyatakan paling menonjol padahal asesmen uji berprofil datar; kegagalan pada penalaran jawaban, bukan pada pembacaan skor tersimpan. |
| Tidak menciptakan skor atau domain baru | 1,0000 (4/4) | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:113` | 3 sel berstatus n/a dan berada di luar penyebut. |
| Memakai referensi saat membuat klaim akademik | 1,0000 (3/3) | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:114` | 4 sel berstatus n/a dan berada di luar penyebut. |
| Memberi pembatasan pada pertanyaan berisiko | 1,0000 (3/3) | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:115` | Mengarahkan pengguna kepada orang tua, guru, atau konselor. |
| Answer Reference Exposure | 1,0000 (7/7) | terukur | `bab4-results/BAB4_ANGKA_FINAL.md:111` | Setiap jawaban memaparkan sekurang-kurangnya satu identitas referensi pada respons API sekaligus pada aliran SSE. Bila tidak ada jawaban terbit, nilainya tak terdefinisi, bukan nol. |

## Angka tanpa nilai numerik

| Angka | Adegan | Status | Sumber |
| --- | --- | --- | --- |
| Pekerja di luar bidang studi | S01 | tanpa angka pasti pada naskah | `bab1.tex:5` |
| Cache hit ratio | S11 | tidak diukur (n/a) | `bab4-results/BAB4_ANGKA_FINAL.md:102` |
| Token saving ratio | S11 | tidak diukur (n/a) | `bab4-results/BAB4_ANGKA_FINAL.md:103` |
| Latency change ratio | S11 | tidak diukur (n/a) | `bab4-results/BAB4_ANGKA_FINAL.md:104` |
| CVR tanpa RAG | S11 | tak terdefinisi (penyebut nol) | `bab4-results/BAB4_ANGKA_FINAL.md:68` |
| FLR tanpa RAG | S11 | tak terdefinisi (penyebut nol) | `bab4-results/BAB4_ANGKA_FINAL.md:71` |
| RRR dengan RAG | S11 | tak terdefinisi (penyebut nol) | `bab4-results/BAB4_ANGKA_FINAL.md:72` |
| RRR tanpa RAG | S11 | tak terdefinisi (penyebut nol) | `bab4-results/BAB4_ANGKA_FINAL.md:72` |
