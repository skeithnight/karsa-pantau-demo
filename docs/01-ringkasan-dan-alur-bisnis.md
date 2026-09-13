# 01 — Ringkasan & Alur Bisnis

## 1. Ringkasan

Sistem informasi berbasis web (PWA) untuk mengelola siklus anggaran proyek pembangunan PLTS: penyusunan RAB → approval → monitoring realisasi biaya, procurement, dan tenaga kerja secara real-time. Dilengkapi lapisan AI (9Router + Claude SDK) untuk pencarian cerdas, deteksi anomali, forecasting, dan asisten tanya-jawab.

Dokumen ini adalah bagian 1 dari 6. Dokumen lain: 02-arsitektur-sistem, 03-skema-database, 04-modul-dan-fitur, 05-implementasi-ai, 06-roadmap-dan-nonfungsional.

## 2. Tujuan

- Mempercepat & menstandarkan penyusunan RAB proyek PLTS
- Memberi visibilitas real-time terhadap realisasi biaya vs RAB
- Deteksi dini overbudget, keterlambatan, dan kekurangan tenaga kerja
- Mengurangi input manual lewat bantuan AI (pencarian harga, OCR bukti)

## 3. Lingkup

**Termasuk (fase awal — lihat 06-roadmap):**
Penyusunan RAB, approval, input realisasi, dashboard monitoring, manpower tracking, AI search/anomali/chat/OCR/forecast.

**Di luar lingkup:**
- Integrasi akuntansi/ERP pihak ketiga
- Payroll & penggajian tenaga kerja
- Manajemen kontrak legal

## 4. Aktor & Peran

| Peran | Hak akses utama |
|---|---|
| Admin | Kelola user, kelola master data (kategori, satuan), lihat semua proyek |
| PM (Project Manager) | Buat/edit RAB, lihat dashboard, terima alert AI, chat assistant |
| Estimator | Susun item RAB, gunakan AI search harga satuan |
| Approver (Direktur/GM) | Approve/reject RAB yang diajukan |
| Site Supervisor | Input realisasi (actual), upload bukti, catat manpower harian |

## 5. Alur Proses Bisnis

```
Buat RAB → Approval → Proyek berjalan → Input actual (procurement, upah, progres)
   → AI engine (9Router + Claude SDK) → Deteksi anomali & Chat asisten
   → Dashboard PM → (siklus berulang ke Input actual)
```

**Aturan bisnis kunci:**
- RAB berstatus `draft` tidak bisa menerima input realisasi — harus `approved` dulu
- Setiap perubahan RAB setelah approval butuh revisi baru (versioning), bukan overwrite langsung
- Satu item RAB bisa punya banyak `actual_entries` (pembelian bertahap)
- Input actual dari lapangan bersifat kontinu selama status proyek `ongoing`
