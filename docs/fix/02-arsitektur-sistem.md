# 02 — Arsitektur Sistem

## 1. Gambaran Umum

```
[PWA Client] ⇄ [API Gateway/Backend (NestJS)] ⇄ [PostgreSQL + pgvector]
                        │                    ⇄ [Redis + BullMQ (job async)]
                        │                    ⇄ [Object Storage (bukti/nota)]
                        └──────────────────⇄ [9Router] ⇄ [Claude API]
```

Semua request AI dari backend wajib lewat 9Router — backend tidak pernah memanggil provider AI langsung. Ini memberi satu titik kontrol untuk logging, fallback provider, dan kontrol biaya token.

## 2. Frontend

- **Framework:** Next.js (React) — SSR untuk dashboard data-heavy, dan dukungan PWA matang lewat `next-pwa`
- **State/data fetching:** React Query untuk caching data dashboard & sinkronisasi ulang otomatis
- **PWA:**
  - Service worker meng-cache app shell + data terakhir yang diakses (read-only saat offline)
  - Installable di Android/iOS/desktop (manifest.json, icon set)
  - Push notification (Web Push API) untuk alert overbudget & approval pending
- **Offline write:** input baru (RAB, actual) yang dibuat saat offline disimpan ke IndexedDB sebagai queue, disinkron otomatis saat koneksi kembali; UI menandai entri sebagai "belum tersinkron"

## 3. Backend

- **Framework:** NestJS (Node.js) — struktur modular per domain (RAB, Actual, Manpower, AI, Auth)
- **API style:** REST untuk sebagian besar operasi CRUD; endpoint khusus untuk streaming respons chat assistant (SSE)
- **Auth:** JWT access token + refresh token, RBAC per role (lihat 01-ringkasan-dan-alur-bisnis)
- **Job queue:** Redis + BullMQ untuk proses AI yang tidak perlu realtime (OCR, forecast harian, cron anomaly detection) — request user tidak menunggu proses ini selesai

## 4. Database

- **PostgreSQL** sebagai penyimpanan utama — cocok untuk data finansial relasional dengan kebutuhan konsistensi transaksi (approval, realisasi)
- **Ekstensi pgvector** — menyimpan embedding vector untuk semantic search item RAB & histori harga (detail di 03-skema-database)

## 5. Lapisan AI

- **Gateway:** 9Router — reverse proxy yang mengekspos endpoint OpenAI-compatible, backend memanggil endpoint ini alih-alih Anthropic API langsung
- **Model:** Claude untuk chat/narasi/OCR vision, diakses lewat Claude SDK yang dikonfigurasi menunjuk base URL 9Router. Model embedding (OpenAI) untuk semantic search juga didaftarkan di 9Router — lihat `05-implementasi-ai.md` catatan provider embedding
- **Modul AI** (detail lengkap di 05-implementasi-ai): RAB Search Service, Anomaly Detector, Forecast Engine, Chat Assistant (RAG), Invoice OCR

## 6. Storage & Notifikasi

- Object storage S3-compatible (MinIO/Cloudflare R2) untuk foto bukti pembelian & lampiran
- Notifikasi: Web Push (PWA) untuk alert realtime, email untuk ringkasan mingguan

## 7. Deployment

- Kontainerisasi tiap layanan dengan Docker (frontend, backend, worker queue, Postgres, Redis, 9Router)
- **Lokal/dev:** Docker Compose + Caddy sebagai reverse proxy
- **Produksi:** Kubernetes (namespace `karsa-pantau`), tiap layanan sebagai Pod terpisah dengan resource limit & liveness/readiness probe sendiri; Nginx Ingress Controller + cert-manager untuk TLS — langkah detail di `DEPLOYMENT_GUIDE.md` (target DigitalOcean DOKS/Droplet & GCP GKE/Cloud Run)
- Environment terpisah: `development`, `staging`, `production` — kredensial AI provider (Anthropic & OpenAI) hanya disimpan di level 9Router, tidak pernah di kode atau `.env` backend
