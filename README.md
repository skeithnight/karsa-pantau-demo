# Karsa Pantau 🏗️⚡

> **Platform SaaS Manajemen Anggaran, RAB AHSP & Monitoring Realisasi Biaya Proyek Konstruksi (General EPC)**

[![Live Production](https://img.shields.io/badge/Production-karsapantau.com-emerald)](https://karsapantau.com)
[![AI Gateway](https://img.shields.io/badge/9Router%20AI-ai.karsapantau.com-violet)](https://ai.karsapantau.com)
[![Documentation](https://img.shields.io/badge/Docs-Panduan%20Pengguna-sky)](./docs/PANDUAN_PENGGUNA.md)

---

## 🌟 Ikhtisar

**Karsa Pantau** adalah solusi perangkat lunak berbasis cloud dan mobile (Progressive Web App - PWA) yang dirancang untuk mengatasi blindspot biaya pada proyek konstruksi, infrastruktur, mekanikal elektrikal (MEP), bangunan komersial, dan energi terbarukan.

Dengan menyatukan siklus hidup proyek mulai dari penyusunan **RAB berstandar AHSP**, verifikasi **approval berjenjang**, pencatatan **realisasi lapangan secara real-time (dengan offline-sync)**, hingga kalkulasi deterministik **Earned Value Management (EVM)** dan deteksi deviasi biaya berbasis **AI (via 9Router)**.

---

## 📚 Dokumentasi Lengkap

Untuk panduan lengkap penggunaan aplikasi dan panduan teknis, silakan merujuk ke dokumen berikut:

| Dokumen | Deskripsi |
|---|---|
| 📖 [**Buku Panduan Pengguna (User Guide)**](./docs/PANDUAN_PENGGUNA.md) | **Panduan lengkap cara pakai tiap halaman & fitur untuk Estimator, Supervisor Lapangan, PM, dan Tim Finance.** |
| 📋 [**Peta Dokumen & Aturan (AGENTS.md)**](./AGENTS.md) | Konteks proyek, panduan teknis agen AI, dan aturan pengembangan. |
| 🏛️ [**Arsitektur Sistem**](./docs/02-arsitektur-sistem.md) | Arsitektur monorepo, aliran data PWA, backend NestJS, database PostgreSQL + pgvector, dan 9Router. |
| 🤖 [**Implementasi AI**](./docs/05-implementasi-ai.md) | Spesifikasi modul AI (Semantic Search RAB, Deteksi Anomali, Deterministik EVM Forecast, Streaming SSE Chat). |
| 🚀 [**Panduan Deployment**](./docs/DEPLOYMENT_GUIDE.md) | Prosedur rilis produksi ke DigitalOcean Droplet / Kubernetes (DOKS) & Cloud GCP. |
| 🛠️ [**Panduan Setup Lokal**](./docs/SETUP.md) | Cara menjalankan Karsa Pantau di mesin lokal menggunakan Docker Compose & pnpm. |

---

## 🚀 Fitur Utama

1. **RAB & AHSP Builder**:
   - Struktur WBS berjenjang (Divisi, Sub-Pekerjaan, Item).
   - Klasifikasi biaya standar: Material, Upah (Labor), Alat (Equipment), Subkontraktor, dan Operasional.
   - Perhitungan subtotal dan grand total otomatis.
2. **Input Realisasi Lapangan & Budget Guardrail (PWA)**:
   - Pencatatan transaksi belanja langsung dari lokasi proyek oleh mandor atau supervisor.
   - Peringatan instan (*Live Guardrail Warning*) jika pengeluaran melebihi sisa pagu anggaran RAB.
   - Dukungan mode *Offline-First* dengan antrean sinkronisasi IndexedDB saat sinyal internet tidak stabil.
3. **Executive Dashboard & EVM Deterministik**:
   - Monitoring indikator performa proyek: **CPI (Cost Performance Index)**, **SPI (Schedule Performance Index)**, **PV**, **EV**, dan **AC**.
   - Visualisasi Kurva S kumulatif rencana vs realisasi belanja.
4. **Lapisan AI Gateway (9Router Terintegrasi)**:
   - Akses mandiri via `ai.karsapantau.com`.
   - Pencarian semantik harga historis pengadaan dengan index pgvector HNSW.
   - Deteksi otomatis anomali biaya dan narasi rekomendasi mitigasi risiko proyek.
   - Chat Assistant interaktif berbasis RAG dengan respon streaming real-time (SSE).
5. **Portal Keuangan & Ekspor Akuntansi**:
   - Monitoring Gross Margin proyek secara real-time.
   - Rekapitulasi hutang vendor (Accounts Payable) dan jatuh tempo nota belanja.
   - Ekspor jurnal transaksi 1-klik ke format spreadsheet (.xlsx / CSV) siap impor ke Accurate, Zahir, atau SAP.

---

## 💻 Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS, Lucide Icons, PWA Support.
- **Backend**: Node.js, NestJS (Modular Architecture, REST API & Server-Sent Events).
- **Database**: PostgreSQL 16 dengan ekstensi `pgvector` (Index HNSW).
- **Queue & Async**: Redis 7, BullMQ.
- **AI Gateway**: 9Router (`ai.karsapantau.com`) mengorkestrasi Claude & OpenAI Embedding.
- **Reverse Proxy**: Caddy Server (Automatic HTTPS Let's Encrypt).
- **Orkestrasi**: Docker Compose & Kubernetes (DigitalOcean DOKS).

---

## 🏃 Cara Mencoba (Demo Live)

Anda dapat mencoba aplikasi secara langsung tanpa registrasi akun:
1. Akses **[https://karsapantau.com/demo](https://karsapantau.com/demo)**.
2. Jelajahi dashboard monitoring proyek aktif, uji form input realisasi biaya lapangan, dan buka RAB builder.

---
© 2026 Karsa Pantau. Hak Cipta Dilindungi Undang-Undang.
