# AGENTS.md

Konteks proyek untuk AI coding agent (Antigravity, Claude Code, atau agent lain). **Wajib baca file ini dan skill `karsa-devops-flow` sebelum mulai implementasi, commit, deploy, atau validasi.**

---

## Ringkasan Proyek

Sistem informasi web (PWA) untuk budgeting & monitoring proyek konstruksi (General EPC & PLTS).
Alur inti: RAB dibuat (Smart BOQ Parser & Historical Price Guardrail) → Approval (Multi-Tier SoD) → Input realisasi biaya lapangan ber-geotag GPS & cuaca → Monitoring variance & EVM (CPI/SPI/EAC) Kurva S → Dibantu lapisan AI Gateway (9Router) untuk pencarian harga, deteksi anomali, forecast, dan chat assistant proyek.

- **URL Produksi Aktif**: `https://karsapantau.com` (AI Gateway: `ai.karsapantau.com`)
- **Server Host Produksi**: DigitalOcean Droplet `170.64.135.11` (Ubuntu 24.04 x64)
- **Path Server**: `/opt/karsa-pantau`
- **Docker Compose File**: `docker-compose.prod.yml`

---

## Peta Dokumen & Panduan

| Dokumen | Isi |
|---|---|
| `.agents/skills/karsa-devops-flow/SKILL.md` | **SOP Lengkap DevOps**: Develop lokal, dual-remote push, deploy droplet, AI SSE, dan live validation |
| `BRD.md` | Latar belakang bisnis, masalah, stakeholder, KPI |
| `PRD.md` | User stories, acceptance criteria, prioritas fitur |
| `01-ringkasan-dan-alur-bisnis.md` | Tujuan, lingkup, aktor & peran, alur proses |
| `02-arsitektur-sistem.md` | Arsitektur teknis frontend/backend/DB/AI/deployment |
| `03-skema-database.md` | Skema tabel PostgreSQL lengkap |
| `04-modul-dan-fitur.md` | Breakdown modul & fitur aplikasi |
| `05-implementasi-ai.md` | Detail tiap fitur AI + contoh prompt |
| `06-roadmap-dan-nonfungsional.md` | Fase pengembangan, non-fungsional, tech stack ringkas |
| `design.md` | Spesifikasi UI, inventaris layar, navigasi |
| `API_SPEC.md` | Daftar endpoint API, request/response, role akses |
| `TESTING.md` | Strategi unit/integration/e2e test, pendekatan uji fitur AI |
| `SETUP.md` | Env variable, Docker Compose lokal & konfigurasi 9Router |
| `DEPLOYMENT_GUIDE.md` | Panduan deployment produksi DigitalOcean & K8s |
| `CONVENTIONS.md` | Struktur folder, penamaan, git workflow, code style |
| `GLOSSARY.md` | Istilah domain (RAB, AHSP, EVM, CCO, EOT, dll) |

---

## Tech Stack & Topologi Produksi Aktual

- **Frontend**: Next.js 14 Standalone (React 18 + TailwindCSS + Lucide Icons + PWA) (`karsa-frontend`, port internal 3000)
- **Backend**: Node.js (NestJS 10), REST API & Server-Sent Events (SSE) (`karsa-backend-api`, port internal 3001)
- **Worker**: Node.js (NestJS + BullMQ) untuk job async — OCR nota belanja, deteksi anomali, batch embedding (`karsa-worker`)
- **Database**: PostgreSQL 16 + pgvector (`karsa-postgres`, user `karsa_user`, db `karsa_db`, port 5432)
- **Queue & Cache**: Redis 7 Alpine (`karsa-redis`, port 6379)
- **AI Gateway**: 9Router (`karsa-nine-router`, internal port 20128) dengan model `karsacombo` (`xmtp/mimo-v2.5`)
- **Storage**: S3-compatible object storage MinIO (`karsa-minio`, port 9000)
- **Reverse Proxy & TLS**: Caddy 2.8 (`karsa-caddy`, port 80 & 443 dengan auto HTTPS Let's Encrypt)
- **Git Remotes**:
  - `origin`: `git@github-personal:skeithnight/karsa-pantau.git`
  - `demo`: `git@github-personal:skeithnight/karsa-pantau-demo.git`

---

## Standar Siklus Kerja DevOps (Develop → Deploy → Validate)

Setiap agen AI yang bekerja pada repo ini **wajib mematuhi 4 tahapan berikut**:

### 1. Fase Develop (Pengujian & Typecheck Lokal)
- Pastikan build TypeScript bersih sebelum commit:
  ```bash
  pnpm --filter @karsa/shared-types run build
  cd apps/backend && npm run build && cd ../..
  cd apps/frontend && npm run build && cd ../..
  ```
- Larangan: Jangan gunakan `window.alert()`. Gunakan toast atau modal interaktif.
- Finansial: Seluruh kalkulasi finansial (total, deviasi, EVM, progress billing) selalu di backend NestJS.

### 2. Fase Commit & Sinkronisasi Git Dual-Remote
- Gunakan format conventional commits (`feat(...)`, `fix(...)`, `refactor(...)`).
- **Wajib push ke KEDUA remote** secara berurutan agar commit SHA tetap identik:
  ```bash
  git add <files>
  git commit -m "feat/fix: deskripsi perubahan"
  git push origin main
  git push demo main
  ```

### 3. Fase Deploy ke DigitalOcean Droplet (`170.64.135.11`)
- Eksekusi SSH deployment dengan flag file produksi `-f docker-compose.prod.yml`:
  ```bash
  ssh -o StrictHostKeyChecking=no root@170.64.135.11 "cd /opt/karsa-pantau && git pull origin main && docker compose -f docker-compose.prod.yml build <service> && docker compose -f docker-compose.prod.yml up -d --no-deps <service>"
  ```
  *(Ganti `<service>` dengan `frontend`, `backend`, `worker`, atau `backend frontend`).*
- Verifikasi kontainer: `ssh -o StrictHostKeyChecking=no root@170.64.135.11 "docker ps && docker logs --tail 30 karsa-backend-api"`

### 4. Fase Live Validation (Verifikasi Browser Riil)
- Uji alur di `https://karsapantau.com`:
  - Akun Admin Produksi: `syafakhosyiah27@gmail.com` / `Password123!`
  - Akun Demo Sandbox: `admin@karsapantau.id` / `Password123!`
- Ambil tangkapan layar bukti visual viewport dan lampirkan ke `walkthrough.md`.

---

## Konvensi Krusial Lainnya

### A. Protokol Streaming AI Gateway (9Router)
- Endpoint SSE `/api/v1/ai/chat` **wajib** memanggil `res.flushHeaders()` dan langsung mengirim `: keep-alive\n\n` agar Caddy/browser tidak menunda atau memutus stream.
- Timeout `nine-router.service.ts` disetel minimal **180 detik (180.000 ms)** dengan `max_tokens: 800` untuk mencegah error abort di tengah reasoning.
- Wajib memiliki *two-tier fallback*: jika stream gagal, coba non-streaming `createChatCompletion`. Jika keduanya gagal, sajikan data proyek riil tanpa pernah menampilkan teks palsu `"[Mode Offline]"`.

### B. Isolasi Multi-Tenant Produksi vs Demo Sandbox
- **Tenant Demo**: Slug `karsa-solar`. Menampilkan tombol switcher demo RBAC di header dan drawer mobile.
- **Tenant Produksi**: Slug selain `karsa-solar` (misal `cipta-daya-engineering`).
  - Hapus flag `karsa_demo_mode` dari `localStorage`.
  - Sembunyikan total seksi pemilih peran RBAC Demo Mode di popover akun.
  - Sembunyikan tombol `Buka Simulasi Demo Live` pada halaman `/docs`.
  - Tombol `Upgrade / Ubah Paket` di `/settings/billing` wajib meluncurkan modal interaktif dengan opsi upgrade langsung via Virtual Account BCA.

---

## Status Proyek

- **Status Saat Ini**: **LIVE IN PRODUCTION** (`https://karsapantau.com`).
- Semua layanan aktif dan sehat: Frontend, Backend API, Worker, PostgreSQL + pgvector, Redis, MinIO, 9Router, dan Caddy Ingress.
- Detail riwayat seluruh penambahan fitur dan perbaikan tercatat secara kronologis pada [walkthrough.md](file:///Users/dwiki.nugraha/.gemini/antigravity-ide/brain/fa5743f7-7ffd-49e2-87aa-94a409984439/walkthrough.md).
