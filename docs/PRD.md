# PRD — Product Requirements Document

Referensi bisnis: lihat BRD.md. Referensi arsitektur & AI: lihat 02-arsitektur-sistem.md dan 05-implementasi-ai.md.

## 1. Target Pengguna

Internal tim proyek PLTS: Estimator, Project Manager, Approver (Direktur/GM), Site Supervisor, Admin sistem. Detail hak akses di 01-ringkasan-dan-alur-bisnis.md §4.

## 2. User Stories & Acceptance Criteria

### RAB Builder
- **Sebagai Estimator**, saya ingin mencari harga satuan lewat AI saat mengetik deskripsi item, **agar** saya tidak perlu cek spreadsheet histori manual.
  - AC: hasil pencarian muncul dalam <3 detik, menampilkan minimal 3 kandidat dengan sumber proyek asal
- **Sebagai Estimator**, saya ingin menyimpan RAB sebagai draft sebelum diajukan, **agar** saya bisa melanjutkan nanti.
  - AC: draft tersimpan otomatis, muncul di daftar "RAB saya" dengan status `draft`

### Approval Workflow
- **Sebagai Approver**, saya ingin melihat daftar RAB yang menunggu approval, **agar** saya bisa memprosesnya tanpa harus dicari manual.
  - AC: daftar terurut berdasarkan tanggal pengajuan, ada notifikasi saat RAB baru masuk
- **Sebagai Estimator**, saya ingin tahu alasan penolakan RAB, **agar** saya bisa revisi dengan tepat.
  - AC: reject wajib disertai catatan, catatan tampil di halaman RAB yang direject

### Actual Input
- **Sebagai Site Supervisor**, saya ingin upload foto nota dan datanya terisi otomatis, **agar** saya tidak perlu input manual satu-satu.
  - AC: hasil OCR mengisi field vendor/qty/harga, field tetap bisa diedit manual sebelum disimpan
- **Sebagai Site Supervisor**, saya ingin tahu langsung kalau item yang saya input sudah melebihi RAB, **agar** saya bisa lapor ke PM segera.
  - AC: warning muncul di form sebelum data disimpan, bukan setelah

### Monitoring Dashboard
- **Sebagai PM**, saya ingin melihat ringkasan RAB vs realisasi per kategori dalam satu layar, **agar** saya tidak perlu buka banyak laporan.
  - AC: dashboard memuat dalam <2 detik untuk proyek dengan hingga 200 item RAB
- **Sebagai PM**, saya ingin menerima alert otomatis saat ada anomali biaya, **agar** saya bisa bertindak lebih cepat.
  - AC: alert dikirim via push notification dalam waktu maksimal 1 hari setelah data actual di-input

### AI Assistant
- **Sebagai PM**, saya ingin bertanya ke AI tentang status proyek dalam bahasa natural, **agar** saya tidak perlu menyusun query manual.
  - AC: jawaban AI merujuk data aktual proyek yang sedang dibuka, bukan jawaban generik; bila data tidak tersedia AI menyatakan demikian

### Manpower Tracker
- **Sebagai Site Supervisor**, saya ingin mencatat headcount tim harian, **agar** data manpower tercatat rapi per tahapan.
  - AC: input harian per tim, riwayat bisa dilihat per rentang tanggal

## 3. Prioritas Fitur (MoSCoW)

| Fitur | Prioritas |
|---|---|
| RAB Builder (manual) | Must |
| Approval Workflow | Must |
| Actual Input (manual) | Must |
| Monitoring Dashboard dasar | Must |
| Semantic search harga (AI) | Should |
| Anomaly Detector (AI) | Should |
| Manpower Tracker | Should |
| Chat Assistant (AI) | Could |
| Invoice OCR (AI) | Could |
| Forecast EVM + narasi AI | Could |
| Integrasi ERP/akuntansi eksternal | Won't (fase ini) |

## 4. Non-Goals

- Bukan sistem akuntansi/payroll
- Bukan sistem manajemen kontrak legal
- Tidak menggantikan keputusan manusia — AI hanya memberi insight & rekomendasi, keputusan final tetap di PM/Approver
