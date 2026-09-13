# AGENTS.md

Konteks proyek untuk AI coding agent (Antigravity, Claude Code, atau agent lain). Baca file ini dulu sebelum mulai implementasi.

## Ringkasan Proyek

Sistem informasi web (PWA) untuk budgeting & monitoring proyek konstruksi PLTS (pembangkit listrik tenaga surya). Alur inti: RAB dibuat → approval → input realisasi biaya dari lapangan → monitoring variance → dibantu lapisan AI untuk pencarian harga, deteksi anomali, forecast, dan chat assistant.

## Peta Dokumen

| Dokumen | Isi |
|---|---|
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
| `SETUP.md` | Env variable, Docker Compose, langkah setup lokal & konfigurasi 9Router |
| `DEPLOYMENT_GUIDE.md` | Panduan deployment produksi ke DigitalOcean (DOKS/Droplet) & GCP (GKE/Cloud Run) |
| `CONVENTIONS.md` | Struktur folder, penamaan, git workflow, code style |
| `GLOSSARY.md` | Istilah domain (RAB, AHSP, EVM, dll) |
| `SAAS-TRANSITION.md` | Rencana transisi ke model SaaS multi-tenant (fase lanjutan, belum aktif) |

Urutan baca yang disarankan untuk memahami proyek secara utuh: `BRD.md` → `PRD.md` → `01` → `02` → `03` → `04` → `05` → `design.md` → `06` → `API_SPEC.md` → `TESTING.md` → `SETUP.md` → `DEPLOYMENT_GUIDE.md` → `CONVENTIONS.md` → `GLOSSARY.md`. `SAAS-TRANSITION.md` dibaca terpisah saat fase SaaS dimulai — bukan bagian dari MVP awal.

## Tech Stack (ringkas — detail di 02 & 06)

- Frontend: Next.js (React) + PWA (`karsa-frontend-pod`)
- Backend: Node.js (NestJS), REST & SSE API (`karsa-backend-api-pod`)
- Worker: Node.js (NestJS + BullMQ) untuk job async — OCR, anomaly detection, batch embedding (`karsa-worker-pod`)
- Database: PostgreSQL 16 + pgvector, index HNSW (`karsa-postgres`)
- Queue: Redis 7 + BullMQ (`karsa-redis`)
- AI Gateway: 9Router (`karsa-9router-pod`) → Claude (chat, narasi, OCR vision) & OpenAI Embedding (vektor untuk semantic search)
- Storage: S3-compatible object storage (`karsa-minio` / R2 / S3)
- Orkestrasi: Docker Compose untuk lokal/dev; Kubernetes (namespace `karsa-pantau`) untuk produksi — lihat `DEPLOYMENT_GUIDE.md`
- Ingress produksi: Nginx Ingress Controller + TLS cert-manager (dev/staging pakai Caddy)

**Catatan embedding:** Claude tidak menyediakan endpoint embedding native, jadi model embedding untuk semantic search RAB (lihat `05-implementasi-ai.md` §1) memakai OpenAI. Provider ini **tetap didaftarkan & dipanggil lewat 9Router**, bukan langsung dari backend ke OpenAI — supaya berlaku aturan yang sama di bawah (satu titik kontrol kredensial, logging, dan fallback).

## Konvensi Penting

- Semua panggilan AI **wajib** lewat 9Router — termasuk panggilan embedding OpenAI, bukan cuma Claude — tidak pernah ada provider AI yang dipanggil langsung dari backend/worker
- Perhitungan finansial (total, variance, EVM) selalu di backend — AI hanya menyusun narasi/insight, tidak menghitung ulang angka
- Setiap output AI disimpan ke tabel `ai_insights` untuk audit trail
- RAB berstatus `draft`/`submitted` tidak boleh menerima input `actual_entries` — hanya `approved`
- Fitur AI harus punya fallback manual — sistem tetap jalan penuh bila 9Router/Claude tidak tersedia

## Status

Implementasi **sudah dimulai** (scaffolding monorepo, Docker Compose, konfigurasi K8s, dan deployment DigitalOcean sudah ada di repo ini). Perbaiki baris status ini setiap kali fase berpindah — jangan biarkan basi seperti sebelumnya. Cek progres aktual terhadap fase di `06-roadmap-dan-nonfungsional.md` sebelum mengasumsikan fitur mana yang sudah/belum jalan; jangan berasumsi dari dokumen ini saja.
