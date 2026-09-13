# 05 — Implementasi AI

Semua request di dokumen ini melewati 9Router sebagai gateway sebelum mencapai model AI manapun. Backend menggunakan Claude SDK yang dikonfigurasi menunjuk base URL 9Router, bukan Anthropic API langsung.

**Catatan provider embedding:** Claude tidak menyediakan endpoint embedding native, jadi pembuatan vektor untuk semantic search (§1) memakai model embedding OpenAI. Provider ini didaftarkan sebagai kombo/routing rule terpisah di 9Router — backend/worker tetap hanya memanggil 9Router, tidak pernah memanggil OpenAI langsung. Ini menjaga konvensi "satu titik kontrol AI" tetap berlaku meski providernya lebih dari satu.

## 1. Semantic Search RAB (harga satuan)

**Alur:**
1. Saat Estimator mengetik deskripsi item (mis. "panel surya 550wp"), backend memanggil 9Router untuk membuat embedding dari teks query (model embedding OpenAI)
2. Query vector dicocokkan (cosine similarity, index HNSW) ke `rab_item_history.embedding` via pgvector, ambil top-5
3. Hasil top-5 dikirim ke Claude (via 9Router) bersama query asli untuk di-rerank & dijelaskan dalam bahasa natural

**Contoh prompt ke Claude (via 9Router):**
```
System: Kamu membantu estimator memilih harga satuan yang paling relevan
dari histori proyek. Jawab singkat: item mana yang paling cocok dan kenapa,
sebut rentang harga dan proyek asalnya.

User: Query: "panel surya 550wp"
Kandidat:
1. Panel monokristalin 550Wp — Rp 2.850.000 (Proyek PLTS Garut 2025)
2. Panel monokristalin 545Wp — Rp 2.790.000 (Proyek PLTS Sumedang 2025)
3. Panel polikristalin 550Wp — Rp 2.400.000 (Proyek PLTS Bandung 2024)
```

Output ditampilkan sebagai saran, bukan auto-fill langsung — Estimator tetap konfirmasi manual.

## 2. Deteksi Anomali

**Alur:**
1. Cron job harian (BullMQ) menghitung variance tiap `rab_item`: `(realisasi - RAB) / RAB`
2. Item dengan variance melewati threshold (mis. ±10%) dikumpulkan
3. Data dikirim ke Claude untuk dirangkum jadi satu ringkasan naratif per proyek, disimpan ke `ai_insights`

**Contoh prompt:**
```
System: Kamu adalah asisten cost control proyek konstruksi. Ringkas temuan
anomali biaya dalam 2-3 kalimat per item, bahasa Indonesia, langsung ke inti.

User: Data variance (item, RAB, realisasi, %):
- Material panel surya, Rp 3.42M, Rp 3.7M, +8.2%
- Sewa alat berat, Rp 1.2M, Rp 1.6M, +33%
```

Hasil ditampilkan sebagai alert di dashboard (lihat 04-modul-dan-fitur §4) dan dikirim via push notification bila di atas threshold kritikal.

## 3. Forecast Biaya (Earned Value Management)

**Formula dasar** (dihitung backend, bukan oleh AI):
- `PV` (Planned Value) = % rencana progres × total RAB
- `EV` (Earned Value) = % progres aktual × total RAB
- `AC` (Actual Cost) = total realisasi sampai saat ini
- `CPI` = EV / AC — di bawah 1 berarti boros
- `SPI` = EV / PV — di bawah 1 berarti terlambat
- `EAC` (Estimate at Completion) = Total RAB / CPI

AI (Claude) hanya menyusun narasi dari angka-angka ini, tidak menghitung ulang — mencegah kesalahan numerik dari LLM.

## 4. Chat Assistant (RAG)

**Alur:**
1. User mengetik pertanyaan di dalam konteks satu proyek
2. Backend retrieve data relevan: ringkasan RAB vs realisasi, anomali aktif, progres terbaru untuk proyek tersebut
3. Data ini dijadikan context dalam system prompt, dikirim ke Claude via 9Router
4. Jawaban di-stream (SSE) ke UI, disimpan ke riwayat chat & `ai_insights`

**Prinsip:** jawaban harus merujuk data yang benar-benar ada di context — bila data tidak tersedia, Claude diarahkan untuk bilang belum ada data tersebut, bukan mengarang.

## 5. OCR Bukti Pembelian

**Alur:**
1. Site Supervisor upload foto nota/invoice saat input actual
2. Foto dikirim ke Claude (vision) via 9Router dengan instruksi ekstrak data terstruktur
3. Hasil (vendor, tanggal, item, qty, harga) diisi otomatis ke form, Supervisor tinggal konfirmasi

**Contoh instruksi:**
```
System: Ekstrak data dari foto nota pembelian ini dalam format JSON:
{vendor, tanggal, item, qty, harga_satuan, total}.
Jika ada field yang tidak terbaca jelas, isi null — jangan menebak.
```

## 6. Guardrail Umum

- Semua output AI disimpan di `ai_insights` untuk audit — bisa dicek ulang bila hasil AI keliru
- Perhitungan finansial (total, variance, EVM) selalu dilakukan di backend, AI hanya menyusun narasi/insight dari angka yang sudah pasti benar
- Setiap fitur AI punya fallback: bila 9Router/Claude gagal merespons, sistem tetap jalan tanpa fitur AI (search manual, input manual tanpa OCR)
