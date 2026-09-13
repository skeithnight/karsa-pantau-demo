# SETUP.md — Setup & Deployment Guide

## 1. Prasyarat

- Node.js LTS terbaru, pnpm/yarn
- Docker & Docker Compose
- Akun/API key provider AI yang akan didaftarkan ke 9Router (mis. Anthropic API key)

## 2. Struktur Environment Variable

**Backend (`.env`):**
```
DATABASE_URL=postgresql://user:pass@localhost:5432/plts_budgeting
REDIS_URL=redis://localhost:6379
JWT_SECRET=
JWT_REFRESH_SECRET=
OBJECT_STORAGE_ENDPOINT=
OBJECT_STORAGE_BUCKET=
OBJECT_STORAGE_KEY=
OBJECT_STORAGE_SECRET=
NINE_ROUTER_BASE_URL=http://localhost:20128/v1
NINE_ROUTER_API_KEY=
```

**Frontend (`.env.local`):**
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1
```

Kredensial provider AI asli (Anthropic API key) hanya didaftarkan di dashboard 9Router, tidak pernah masuk ke `.env` backend/frontend.

## 3. Docker Compose (layanan lokal)

Layanan yang perlu didefinisikan di `docker-compose.yml`:
- `postgres` (image dengan ekstensi pgvector, mis. `pgvector/pgvector`)
- `redis`
- `9router` (self-hosted, expose port 20128)
- `minio` (object storage lokal, untuk simulasi S3)
- `backend` (build dari `Dockerfile` NestJS)
- `frontend` (build dari `Dockerfile` Next.js)

## 4. Langkah Setup Lokal

1. Clone repo, salin `.env.example` jadi `.env` di masing-masing service
2. Jalankan `docker compose up -d postgres redis minio 9router`
3. Buka dashboard 9Router (`http://localhost:20128/dashboard`), ganti password default, tambahkan provider key Anthropic
4. Jalankan migrasi database: `pnpm --filter backend run migration:run`
5. (Opsional) jalankan seed data proyek contoh: `pnpm --filter backend run seed`
6. Jalankan backend: `pnpm --filter backend run start:dev`
7. Jalankan frontend: `pnpm --filter frontend run dev`

## 5. Konfigurasi 9Router

- Tambahkan provider Anthropic di dashboard 9Router dengan API key yang valid
- Tambahkan juga provider **OpenAI** (khusus model embedding) — dipakai untuk fitur semantic search RAB, lihat `05-implementasi-ai.md` §1. Jangan simpan API key OpenAI ini di `.env` backend/worker; cukup didaftarkan di 9Router
- Buat "combo"/routing rule terpisah: satu mengarah ke model Claude (chat, narasi, OCR vision), satu ke model embedding OpenAI
- Catat API key internal 9Router (`nr-...`) untuk diisi ke `NINE_ROUTER_API_KEY` backend — satu key ini cukup untuk kedua provider di atas
- Set base URL Claude SDK & pemanggilan embedding di backend menunjuk `NINE_ROUTER_BASE_URL`, tidak pernah langsung ke endpoint Anthropic atau OpenAI

## 6. Deployment (Staging/Production)

- Build image Docker tiap service lewat CI, push ke registry
- Deploy dengan orkestrator pilihan (Docker Compose di VPS untuk skala kecil, atau Kubernetes bila multi-instance)
- Reverse proxy (Nginx/Caddy) menangani TLS & routing ke `frontend`/`backend`
- Jalankan migrasi database sebagai job terpisah sebelum rollout versi baru backend
- Environment variable produksi dikelola lewat secret manager (bukan file `.env` di server)

## 7. Checklist Sebelum Rilis

- [ ] Migrasi database sudah dijalankan di environment target
- [ ] 9Router sudah dikonfigurasi dengan provider key produksi (terpisah dari staging)
- [ ] Backup database terjadwal aktif
- [ ] Push notification (Web Push) sudah dikonfigurasi dengan VAPID key produksi
- [ ] Test E2E kritikal (lihat TESTING.md §4) lulus di staging
