# 02 — Arsitektur Sistem (Cloud-Native & Pod-Based)

## 1. Gambaran Umum & Topologi Pod

Sistem mengadopsi arsitektur **Cloud-Native terdistribusi berbasis Kubernetes Pods**. Pemisahan komponen dilakukan secara granular antara web server, core API, async worker, dan AI proxy gateway guna menjamin skalabilitas independen, keandalan komputasi finansial, dan isolasi beban kerja AI yang intensif.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              KUBERNETES CLUSTER (karsa-pantau)                         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  [Ingress Controller (Nginx / Traefik / Caddy)]                                        │
│     │                                                                                  │
│     ├── /                     ──► [Pod: karsa-frontend (Next.js PWA)]                  │
│     └── /api/v1/*             ──► [Pod: karsa-backend-api (NestJS REST & SSE)]         │
│                                           │                 │                          │
│                                           ▼                 ▼                          │
│                                   [Pod: karsa-postgres]  [Pod: karsa-redis]            │
│                                   (PG16 + pgvector)      (BullMQ Broker)               │
│                                                             ▲                          │
│                                                             │                          │
│  [Pod: karsa-worker (Async Processing)] ────────────────────┘                          │
│  (OCR Vision, Anomaly Cron, EVM, PDF Gen)                                              │
│     │                                                                                  │
│     ▼                                                                                  │
│  [Pod: karsa-9router (AI Gateway - ClusterIP)] ──► [Anthropic Claude & Vector Provider]│
│                                                                                        │
│  [Pod: karsa-minio (Object Storage S3-Compatible)]                                     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

Semua request AI dari backend API dan background worker **wajib melewati 9Router Pod**. Backend tidak pernah memanggil provider AI secara langsung. Hal ini memberikan kontrol terpusat untuk audit token, rate-limiting, circuit breaking, dan failover model.

---

## 2. Dekomposisi Layanan ke dalam Kubernetes Pod

### 2.1 `karsa-frontend-pod` (PWA Client App)
- **Framework & Runtime:** Next.js (React 18/19), Node.js LTS (Alpine standalone output).
- **Peran:** Melayani Server-Side Rendering (SSR) untuk dashboard finansial data-heavy, melayani static bundle, Service Worker (`sw.js`), dan Web App Manifest.
- **State & Sync:** TanStack React Query untuk caching client-side, normalisasi data proyek, dan automatic background refetching.
- **PWA & Offline Capability:**
  - Cache first untuk app shell, UI assets, dan skema form.
  - Read-only cache untuk data proyek & RAB terakhir yang dibuka.
  - Push Notification (Web Push API + VAPID) untuk alert anomali biaya dan notifikasi approval pending.
- **Offline-First Mutating Protocol:**
  - Saat offline, Supervisor tetap dapat membuat entri *actual* dan log *manpower*.
  - Entri diberi Primary Key berbasis **UUIDv7** (time-ordered) langsung di client dan disimpan ke antrean IndexedDB (`sync_queue`).
  - Request dilengkapi header `Idempotency-Key: <uuidv7>` untuk mencegah entri ganda saat koneksi pulih di area minim sinyal.
  - Jika terjadi validasi gagal di server saat sync, entri masuk ke tab `staged_discrepancies` untuk ditinjau oleh PM.
- **Scaling:** HPA (Horizontal Pod Autoscaler) target CPU 70% (min 2, max 5 replika).

### 2.2 `karsa-backend-api-pod` (Core Business & Financial Engine)
- **Framework & Runtime:** NestJS (TypeScript), Fastify/Express engine.
- **Peran:** Melayani REST API `/api/v1/*` dan Server-Sent Events (SSE) `/ai/chat`.
- **Domain Modules:**
  - `auth`: Otentikasi JWT (access & refresh token) + RBAC guard.
  - `projects`: Manajemen portofolio proyek PLTS dan milestone progres.
  - `rab`: Penyusunan RAB berhierarki WBS, kalkulasi subtotal/total deterministik, dan approval workflow.
  - `actuals`: Validasi & pencatatan realisasi pengeluaran terhadap item RAB aktif.
  - `manpower`: Log kehadiran tim lapangan dan rekapitulasi produktivitas harian.
  - `progress`: Pencatatan progres fisik mingguan untuk kurva S & EVM.
- **Aturan Eksekusi:** Request path utama bersifat *lightweight*. Semua kalkulasi berat, pemrosesan gambar OCR, atau agregasi berkala dialihkan ke antrean Redis/BullMQ.
- **Health Check:** Liveness `/api/v1/health/liveness`, Readiness `/api/v1/health/readiness` (memvalidasi koneksi ke Postgres & Redis).
- **Scaling:** HPA target CPU 75% / RPS 500 (min 2, max 10 replika).

### 2.3 `karsa-worker-pod` (Background Task & Async Processing)
- **Framework & Runtime:** NestJS Headless Worker / BullMQ Consumer.
- **Peran:** Mengonsumsi dan mengeksekusi job asinkronus tanpa membuka port HTTP publik:
  - `queue-ocr`: Mengirim gambar bukti/nota ke 9Router (Claude Vision) untuk ekstraksi JSON terstruktur.
  - `queue-anomaly`: Cron job harian yang memindai variance biaya seluruh proyek PLTS dan meminta rangkuman naratif anomali dari AI.
  - `queue-forecast`: Agregasi metrik EVM harian (PV, EV, AC, CPI, SPI, EAC) dan penyusunan narasi tren proyek.
  - `queue-reports`: Kompilasi laporan mingguan berformat PDF menggunakan Headless Chromium.
  - `queue-notifications`: Pengiriman Web Push notification dan rekap email.
- **Resource Limits:** Limit memori lebih tinggi (hingga 2Gi) untuk menangani buffer citra resolusi tinggi dan rendering PDF.
- **Scaling:** KEDA / HPA berbasis kedalaman antrean (*queue length*) di Redis (min 1, max 5 replika).

### 2.4 `karsa-9router-pod` (AI Proxy & Gateway)
- **Image:** 9Router (Self-Hosted OpenAI-Compatible Proxy Gateway).
- **Peran:**
  - Endpoint tunggal bagi internal cluster untuk semua panggilan LLM dan Embedding.
  - Mengelola API Key upstream provider (Anthropic Claude 3.5, OpenAI/Voyage Embedding) yang disimpan di secret Kubernetes.
  - Logging konsumsi token, per-project rate-limiting, dan fallback model otomatis.
- **Isolasi Keamanan:** Dijaga oleh Kubernetes `NetworkPolicy`. Port `20128` hanya menerima ingress dari `karsa-backend-api` dan `karsa-worker`, serta menolak semua akses eksternal langsung.
- **Replicas:** 2 replika (ClusterIP Service).

---

## 3. Stateful Storage & Data Persistence

1. **PostgreSQL 16 + pgvector (`karsa-postgres` StatefulSet)**
   - Database transaksional utama dengan ACID compliance untuk data finansial.
   - Ekstensi `pgvector` aktif untuk pencarian cosine similarity item RAB historis.
   - Menggunakan index `HNSW` (*Hierarchical Navigable Small World*) untuk efisiensi dan stabilitas latensi tinggi tanpa perlu reindex berkala.
   - Persistent Volume Claim (PVC) dialokasikan pada StorageClass SSD/NVMe dengan retention policy `Retain`.

2. **Redis 7 (`karsa-redis` StatefulSet)**
   - Message broker dan job persistence untuk BullMQ.
   - Cache data agregasi dashboard dan distributed lock (Redlock) untuk operasi transaksional krusial (misal saat approval status transition).
   - Mode AOF (*Append-Only File*) diaktifkan pada PVC untuk mencegah kehilangan job antrean saat restart.

3. **MinIO / Cloud Object Storage (`karsa-minio` StatefulSet)**
   - Penyimpanan objek S3-compatible untuk foto nota, faktur, dan lampiran kontrak.
   - Pada deployment lokal/on-prem menggunakan MinIO StatefulSet dengan PVC; pada deployment managed cloud (AWS/GCP/Cloudflare) dapat diarahkan langsung ke AWS S3 / Cloudflare R2 tanpa mengubah kode aplikasi.

---

## 4. Jaringan, Keamanan, & Ingress Routing

- **Ingress Controller:**
  - TLS termination otomatis via `cert-manager` (Let's Encrypt).
  - Routing `/api/v1/*` diteruskan ke `karsa-backend-api-svc:3001`.
  - Routing default `/*` diteruskan ke `karsa-frontend-svc:3000`.
  - Dukungan streaming: Buffering dinonaktifkan (`proxy-buffering: off`) dan timeout diperpanjang untuk endpoint SSE `/ai/chat`.
- **Zero-Trust Network Policies:**
  - Pod frontend tidak memiliki akses jaringan langsung ke Postgres, Redis, maupun 9Router.
  - 9Router Pod hanya dapat diakses oleh API dan Worker pod.
- **Graceful Termination:**
  - Semua pod backend dan worker mengimplementasikan penanganan sinyal `SIGTERM` dengan lifecycle hook `preStop` (sleep 10s) untuk menyelesaikan koneksi in-flight sebelum container dimatikan.
