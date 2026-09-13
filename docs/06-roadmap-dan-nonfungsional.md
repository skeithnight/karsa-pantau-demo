# 06 — Roadmap Pengembangan & Non-Fungsional (Cloud-Native Edition)

## 1. Tahapan Pengembangan

### Fase 1 — Fondasi Core & Cloud-Native Pods (MVP)
- Scaffolding Monorepo (pnpm workspaces): `backend`, `frontend`, `k8s`.
- Pod Deployment & Local Dev Environment (`docker-compose` & manifes K8s).
- Setup PostgreSQL 16 + `pgvector` (HNSW extension) & Redis 7 (BullMQ).
- Modul Auth (JWT, Refresh Token, RBAC Guard).
- Modul Projects & RAB Builder (Hierarki WBS & kalkulasi numerik deterministik).
- Approval Workflow (Draft, Submit, Approve, Reject dengan catatan).
- Actual Input manual (Offline-First queue via IndexedDB + UUIDv7 + Idempotency-Key).
- Monitoring Dashboard dasar (Ringkasan RAB vs Realisasi per WBS).

### Fase 2 — AI Pencarian & Deteksi Anomali
- Setup `karsa-9router-pod` dengan dual upstream: Claude 3.5 & OpenAI Embedding.
- Embedding pipeline otomatis untuk `rab_item_history` (HNSW cosine search).
- Semantic search harga satuan pada form RAB Builder.
- `karsa-worker-pod`: Scheduled cron job pemindai variance biaya + rangkuman naratif Claude (JSON Schema) yang tersimpan di `ai_insights`.

### Fase 3 — AI Lapangan & Interaktif
- Worker Job: OCR Vision nota/faktur pembelian via Claude 3.5 Sonnet untuk auto-fill form actual.
- Chat Assistant proyek berbasis RAG kontekstual (SSE streaming ke UI).
- Modul Manpower Tracker (Presensi & output terpasang per hari).
- Modul Kurva S & pencatatan progres fisik mingguan.

### Fase 4 — Enterprise Intelligence & Scale
- Forecast Engine otomatis (Kalkulasi EVM: PV, EV, AC, CPI, SPI, EAC).
- Generator laporan mingguan/bulanan otomatis dalam format PDF (Headless Chromium Worker).
- Push Notification terintegrasi (Web Push API / VAPID).
- Autoscaling berbasis beban (HPA pada API Pod, KEDA pada Worker Pod).

---

## 2. Pertimbangan Non-Fungsional

### Keamanan & Isolasi Pod
- **NetworkPolicy:** `karsa-9router-pod` terisolasi sepenuhnya di dalam cluster; hanya menerima ingress dari `backend-api` dan `worker`.
- **Enkripsi:** TLS Termination di Ingress, enkripsi at-rest untuk volume PostgreSQL dan MinIO Object Storage.
- **RBAC Ketat:** Validasi izin di setiap handler endpoint (bukan hanya di UI).
- **Auditability:** Setiap perubahan data finansial dicatat ke tabel `audit_logs`, dan seluruh keluaran AI dicatat ke `ai_insights`.

### Skalabilitas & Ketahanan (Resiliency)
- **Pod Decoupling:** Beban berat (OCR citra resolusi tinggi dan komputasi batch cron) dijalankan di `karsa-worker-pod`, sehingga latensi `karsa-backend-api-pod` tetap di bawah 200ms.
- **Graceful Shutdown:** Penanganan sinyal `SIGTERM` dengan preStop hook 10 detik untuk memastikan koneksi database dan request in-flight selesai sebelum pod diterminasi.
- **Zero Downtime Deployment:** Rolling update strategy (`maxSurge: 25%`, `maxUnavailable: 0`) pada seluruh Deployment Kubernetes.

### Ketersediaan AI & Circuit Breakers
- **Fallback Deterministik:** Bila 9Router atau provider AI timeout (>10s) atau error 5xx, sistem secara transparan beralih ke keyword search dan form manual tanpa memblokir pekerjaan pengguna.
- **Budget Protection:** Rate-limiting per user/menit dan token cap bulanan diatur di level 9Router.

---

## 3. Tech Stack Ringkas (Pod-Decomposed)

| Komponen | Teknologi | Model Deployment / Pod |
|---|---|---|
| **Frontend** | Next.js (React), PWA (Service Worker) | `karsa-frontend-pod` (Deployment + HPA) |
| **Backend API** | NestJS (TypeScript), REST & SSE | `karsa-backend-api-pod` (Deployment + HPA) |
| **Worker Queue** | NestJS, BullMQ | `karsa-worker-pod` (Deployment + KEDA/HPA) |
| **AI Gateway** | 9Router (OpenAI-compatible proxy) | `karsa-9router-pod` (Deployment HA) |
| **AI Models** | Claude 3.5 Sonnet (LLM) & OpenAI 1536 (Embedding) | Upstream via 9Router Egress |
| **Database** | PostgreSQL 16 + `pgvector` (HNSW) | `karsa-postgres` (StatefulSet + PVC) |
| **Cache & Broker** | Redis 7 (AOF Persistence) | `karsa-redis` (StatefulSet + PVC) |
| **Object Storage** | MinIO / AWS S3 / Cloudflare R2 | `karsa-minio` (StatefulSet + PVC) |
| **Orchestration** | Kubernetes (k8s manifests) / Docker Compose | Namespace `karsa-pantau` |
| **Ingress & TLS** | Nginx Ingress Controller + cert-manager | Ingress Resource dengan TLS |
