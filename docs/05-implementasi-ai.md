# 05 — Implementasi AI & AI Gateway (9Router)

Semua request AI di dokumen ini melewati **9Router Pod** (`http://karsa-9router-svc:20128/v1`) sebagai proxy gateway internal cluster. Backend dan Worker tidak pernah memanggil provider AI secara langsung.

## 0. Konfigurasi Dual-Model pada 9Router
9Router dikonfigurasi dengan dua model upstream terpisah:
1. **LLM Engine (Reasoning, Vision, Chat):** Anthropic Claude 3.5 Sonnet / Haiku via Claude SDK yang menunjuk endpoint 9Router.
2. **Vector Embedding Engine:** OpenAI `text-embedding-3-small` (1536 dimensi) via endpoint OpenAI-compatible di 9Router (karena Anthropic tidak memiliki model embedding native).

---

## 1. Semantic Search RAB (Harga Satuan Historis)

**Alur:**
1. Saat Estimator mengetik deskripsi item (mis. *"panel surya 550wp monokristalin"*), backend API mengirim request ke 9Router embedding model untuk menghasilkan vector 1536 dimensi.
2. Query vector dicocokkan ke `rab_item_history` menggunakan operator cosine distance (`<=>`) dengan index **HNSW** di pgvector, mengambil top-5 kandidat terdekat (`ef_search = 40`).
3. Hasil top-5 dikirim ke Claude (Haiku/Sonnet) bersama query asli untuk di-rerank dan dijelaskan konteks kewajaran harganya.

**Prompt Template ke Claude:**
```
System: Kamu adalah asisten ahli estimasi biaya konstruksi PLTS. Analisis 5 kandidat harga historis ini terhadap deskripsi pekerjaan yang dicari pengguna. Pilih 1 rekomendasi terbaik dan jelaskan mengapa harga tersebut relevan, perhatikan spesifikasi teknis dan inflasi waktu.

User: 
Deskripsi Dicari: "Panel Surya 550Wp Tier-1 Monofacial"
Kandidat Historis:
1. [Proyek Garut 2025] Panel Surya Mono 550Wp — Rp 2.850.000 / unit (skor similarity: 0.94)
2. [Proyek Sumedang 2025] Modul PV 545Wp Monocrystalline — Rp 2.790.000 / unit (skor similarity: 0.89)
3. [Proyek Bandung 2024] Panel Poly 550Wp — Rp 2.400.000 / unit (skor similarity: 0.82)
```

Output ditampilkan sebagai rekomendasi cerdas (*suggestion badge*) di RAB Builder, konfirmasi harga tetap dilakukan manual oleh Estimator.

---

## 2. Deteksi Anomali Biaya (Scheduled Worker)

**Alur:**
1. Cron job harian di `karsa-worker-pod` menghitung variance tiap `rab_item` aktif: `variance = (total_actual_amount - subtotal) / subtotal`.
2. Item dengan variance melampaui ambang batas toleransi (mis. > +10% overbudget atau lonjakan harga satuan > 15%) dikumpulkan.
3. Data dikirim ke Claude untuk menghasilkan ringkasan naratif terstruktur dengan **JSON Schema Enforcement**.

**JSON Schema Response:**
```json
{
  "anomalies": [
    {
      "rab_item_id": "uuid",
      "severity": "CRITICAL | WARNING",
      "summary": "Biaya sewa crane melonjak 33% akibat keterlambatan delivery panel di lokasi terjal.",
      "suggested_mitigation": "Review jadwal mobilisasi alat berat atau negosiasi ulang rate harian vendor."
    }
  ]
}
```

Hasil disimpan ke `ai_insights`, memicu badge peringatan di dashboard PM, serta mengirim push notification untuk temuan berstatus `CRITICAL`.

---

## 3. Forecast Biaya (Earned Value Management)

**Prinsip Utama:** Perhitungan numerik 100% deterministik di Backend API / Worker, **bukan oleh AI**.

**Formula Dasar:**
- `PV` (Planned Value) = `kumulatif planned_progress_pct * total_rab`
- `EV` (Earned Value) = `kumulatif actual_progress_pct * total_rab`
- `AC` (Actual Cost) = `sum(actual_entries.total_actual_amount)` sampai tanggal pelaporan
- `CPI` (Cost Performance Index) = `EV / AC` (CPI < 1.0: Biaya melebihi anggaran)
- `SPI` (Schedule Performance Index) = `EV / PV` (SPI < 1.0: Jadwal terlambat)
- `EAC` (Estimate at Completion) = `total_rab / CPI`
- `VAC` (Variance at Completion) = `total_rab - EAC`

AI (Claude) hanya bertindak sebagai narator eksekutif yang membaca matriks metrik numerik yang sudah pasti valid ini untuk menyusun memo mingguan bagi Direktur/PM.

---

## 4. Chat Assistant Proyek (Grounded RAG)

**Alur:**
1. User (PM / Estimator / Direktur) mengajukan pertanyaan di dalam konteks proyek tertentu.
2. Backend API Pod mengumpulkan context snapshot proyek:
   - Metadata proyek & kapasitas (MWp).
   - Ringkasan RAB baseline aktif vs total realisasi per WBS package.
   - Metrik EVM minggu terakhir (CPI, SPI, EAC).
   - 5 log realisasi pengeluaran dan anomali terbaru.
3. Context disusun ke dalam format prompt terisolasi.
4. Jawaban di-stream ke frontend via Server-Sent Events (SSE) dan disimpan ke riwayat chat & `ai_insights`.

**Strict Anti-Hallucination Guardrail:**
```
System: Kamu adalah asisten data resmi proyek Karsa Pantau. 
Jawab pertanyaan HANYA berdasarkan data JSON konteks proyek yang diberikan di bawah.
ATURAN KETAT:
1. Jangan berasumsi atau mengarang angka yang tidak tertera di konteks.
2. Jika pengguna menanyakan informasi yang tidak ada di dalam konteks, jawab: "Data tersebut belum tercatat dalam sistem untuk proyek ini."
3. Setiap klaim angka harus menyertakan referensi (misal: "Berdasarkan entri pembelian tanggal 12 September...").
```

---

## 5. OCR & Ekstraksi Bukti Pembelian (Vision Pipeline)

**Alur:**
1. Site Supervisor mengunggah foto nota/faktur lewat PWA (kamera/galeri).
2. File diunggah ke Object Storage (MinIO / S3) dan job dimasukkan ke BullMQ `queue-ocr`.
3. Worker mengirimkan gambar dalam format base64/URL ke Claude 3.5 Sonnet (Vision) via 9Router dengan instruksi JSON extraction terstruktur.

**Instruksi Ekstraksi Terstruktur:**
```json
{
  "vendor": "CV Mandiri Teknik",
  "invoice_number": "INV-2026-089",
  "date": "2026-09-12",
  "items": [
    {
      "description": "Kabel Solar PV1-F 4mm2 Black",
      "qty": 500,
      "unit": "meter",
      "unit_price": 14500,
      "subtotal": 7250000
    }
  ],
  "total_amount": 7250000,
  "confidence_score": 0.95
}
```
Field terisi otomatis pada form input realisasi di layar Supervisor untuk diverifikasi dan dikonfirmasi sebelum disimpan.

---

## 6. Tata Kelola & Ketahanan Sistem (Circuit Breakers & Fallback)

1. **Pemisahan Finansial Mutlak:** Tidak ada data uang yang diubah secara otomatis oleh output AI. Semua saran AI memerlukan *human-in-the-loop* confirmation.
2. **Auditability Penuh:** Seluruh prompt, response, latency, token consumption, dan model version dicatat di tabel `ai_insights`.
3. **Graceful Fallback:**
   - Bila 9Router atau provider AI mengalami downtime/timeout (timeout limit 10 detik):
     - **RAB Search**: Berpindah otomatis ke keyword search teks biasa (PostgreSQL ILIKE / Full-Text Search).
     - **Actual Input**: Form beralih ke input manual tanpa OCR otomatis.
     - **Monitoring**: Dashboard tetap menampilkan metrik matematis tanpa narasi AI.
4. **Rate Limiting & Token Budget:**
   - Batas panggilan AI per user/menit dikontrol di level 9Router.
   - Panggilan berat (batch anomaly scan) dijadwalkan pada jam non-sibuk (pukul 01:00 WIB) untuk efisiensi kuota.
