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
| `SETUP.md` | Env variable, Docker Compose, langkah setup lokal & deployment |
| `DEPLOYMENT_GUIDE.md` | Panduan deployment produksi ke DigitalOcean (DOKS/Droplet) & GCP (GKE/Cloud Run) |
| `CONVENTIONS.md` | Struktur folder, penamaan, git workflow, code style |
| `GLOSSARY.md` | Istilah domain (RAB, AHSP, EVM, dll) |

Urutan baca yang disarankan untuk memahami proyek secara utuh: `BRD.md` → `PRD.md` → `01` → `02` → `03` → `04` → `05` → `design.md` → `06` → `API_SPEC.md` → `TESTING.md` → `SETUP.md` → `DEPLOYMENT_GUIDE.md` → `CONVENTIONS.md` → `GLOSSARY.md`.

## Tech Stack (ringkas — detail di 02 & 06)

- Frontend: Next.js (React) + PWA (`karsa-frontend-pod`)
- Backend: Node.js (NestJS), REST & SSE API (`karsa-backend-api-pod`)
- Worker: Node.js (NestJS + BullMQ), OCR/Batch (`karsa-worker-pod`)
- Database: PostgreSQL 16 + pgvector (HNSW) (`karsa-postgres` StatefulSet)
- Queue: Redis 7 + BullMQ (`karsa-redis` StatefulSet)
- AI Gateway: 9Router Pod (`karsa-9router-pod`) → Claude 3.5 & OpenAI Embedding
- Storage: S3-compatible object storage (`karsa-minio` StatefulSet / R2 / S3)
- Orchestration: Kubernetes Pods & Namespace (`karsa-pantau`) / Docker Compose
- Ingress: Nginx Ingress Controller + TLS cert-manager

## Konvensi Penting

- Semua layanan dipecah ke dalam **Kubernetes Pod** independen dengan alokasi resources dan liveness/readiness probes
- Semua panggilan AI **wajib** lewat 9Router Pod (ClusterIP internal), tidak pernah langsung ke provider AI eksternal
- Perhitungan finansial (total, variance, EVM) selalu di backend — AI hanya menyusun narasi/insight, tidak menghitung ulang angka
- Setiap output AI disimpan ke tabel `ai_insights` untuk audit trail
- RAB berstatus `draft`/`submitted` tidak boleh menerima input `actual_entries` — hanya `approved`
- Fitur AI harus punya fallback manual — sistem tetap jalan penuh bila 9Router/Claude tidak tersedia

## Status

Dokumen ini adalah spesifikasi tahap desain — implementasi belum dimulai. Ikuti urutan fase di `06-roadmap-dan-nonfungsional.md` (Fase 1: MVP inti tanpa AI, baru fase berikutnya menambahkan AI).
