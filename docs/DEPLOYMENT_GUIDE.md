# DEPLOYMENT_GUIDE.md — Panduan Produksi DigitalOcean Droplet (Docker Compose + Caddy)

Panduan operasional komprehensif untuk men-deploy sistem **Karsa Pantau** (Sistem Budgeting & Monitoring Proyek Konstruksi PLTS) ke satu unit **DigitalOcean Droplet**.

---

## 1. Mengapa Pilihan Droplet Sangat Tepat?

1. **Hemat Biaya Maksimal**: Hanya **~$24 – $48 / bulan** untuk seluruh stack (Frontend PWA, Backend API, Worker BullMQ, PostgreSQL 16 + pgvector, Redis 7, MinIO, 9Router AI Gateway, dan Caddy SSL).
2. **Setup Sangat Cepat & Minim Kompleksitas**: Tidak memerlukan manajemen cluster Kubernetes. Semua layanan berjalan terisolasi di jaringan internal Docker.
3. **Latensi Sangat Rendah ke Indonesia**: Droplet di Datacenter **Singapura (`sgp1`)** memberikan latensi hanya **12 – 18 ms** ke Indonesia.
4. **HTTPS Otomatis Zero-Config**: Menggunakan **Caddy Server** bawaan yang otomatis menerbitkan dan memperbarui sertifikat SSL Let's Encrypt tanpa perlu konfigurasi certbot manual.

---

## 2. Rekomendasi Spesifikasi Droplet DigitalOcean

| Kebutuhan | Tipe Droplet | Spesifikasi | Biaya Bulanan | Kapan Dipilih? |
|---|---|---|---|---|
| **Rekomendasi Utama** | **Regular / Premium Intel** | **8 GB RAM, 4 vCPUs, 160 GB NVMe** (`s-4vcpu-8gb`) | **$48 / bulan** | Sangat ideal untuk beban produksi penuh + AI background OCR processing. |
| **Opsi Budget MVP** | **Basic Droplet** | **4 GB RAM, 2 vCPUs, 80 GB SSD** (`s-2vcpu-4gb`) | **$24 / bulan** | Cukup untuk tahap awal / pilot proyek (1-3 proyek aktif). |

- **Sistem Operasi**: Ubuntu 24.04 LTS (x64)
- **Region**: Singapore (`sgp1`)
- **Autentikasi**: SSH Key (Sangat disarankan)

---

## 3. Langkah Demi Langkah Deployment ke Droplet

### Langkah 1: Buat Droplet di DigitalOcean
1. Masuk ke [DigitalOcean Cloud Console](https://cloud.digitalocean.com).
2. Klik tombol hijau **Create** → **Droplets**.
3. Pilih:
   - **Region**: Singapore (`sgp1`).
   - **OS**: Ubuntu 24.04 LTS.
   - **Size**: 8 GB RAM / 4 vCPUs ($48/mo) atau 4 GB RAM / 2 vCPUs ($24/mo).
   - **Authentication**: Masukkan SSH Key komputer Anda.
   - **Backups**: Centang *Enable Backups* (Opsional: +$4.80/bln untuk proteksi snapshot mingguan otomatis).
4. Klik **Create Droplet**. Catat **Alamat IP Publik** Droplet yang baru dibuat (contoh: `159.65.130.45`).

---

### Langkah 2: Arahkan Domain DNS ke IP Droplet
Di penyedia domain Anda (Cloudflare, Niagahoster, Rumahweb, dll.):
- Buat **A-Record**:
  - **Name/Host**: `app` (atau `@` untuk domain utama)
  - **IPv4 Address**: Masukkan IP Droplet Anda (contoh: `159.65.130.45`)
  - **TTL**: Auto / 300 detik

> [!NOTE]
> Caddy Server akan otomatis mendeteksi domain ini dan membuatkan sertifikat SSL resmi dari Let's Encrypt saat pertama kali domain diakses via browser.

---

### Langkah 3: Eksekusi Deployment di Server Droplet
Masuk ke Droplet melalui terminal SSH:

```bash
# 1. Login ke Droplet
ssh root@<IP_DROPLET_ANDA>

# 2. Clone repository Karsa Pantau
git clone https://github.com/dwikicode/karsa-pantau.git /opt/karsa-pantau
cd /opt/karsa-pantau

# 3. Sesuaikan konfigurasi domain dan API Key AI
cp .env.production.example .env
nano .env
```

**Variabel penting yang perlu disesuaikan di `.env`:**
```bash
DOMAIN=app.karsapantau.id               # Ganti dengan domain asli Anda
SSL_EMAIL=admin@karsapantau.id          # Email untuk notifikasi sertifikat SSL

# Kunci Provider AI (Wajib diisi untuk fitur pencarian harga & deteksi anomali)
ANTHROPIC_API_KEY=sk-ant-api03-...     # Claude 3.5 Sonnet
OPENAI_API_KEY=sk-proj-...             # OpenAI Embedding 1536 dim
```

---

### Langkah 4: Jalankan Script Otomatisasi Turnkey
Jalankan script deployment satu perintah:

```bash
chmod +x scripts/deploy-droplet.sh
./scripts/deploy-droplet.sh
```

**Apa yang dikerjakan oleh script ini secara otomatis?**
1. Memeriksa & menginstal Docker Engine dan Docker Compose Plugin.
2. Mengamankan Droplet dengan UFW Firewall (hanya membuka port 22 SSH, 80 HTTP, dan 443 HTTPS; memblokir akses luar langsung ke port PostgreSQL dan Redis).
3. Melakukan build container produksi multi-stage untuk Frontend Next.js Standalone dan Backend API.
4. Menjalankan seluruh stack via [docker-compose.prod.yml](file:///Users/dwiki.nugraha/dwikicode/karsa-pantau/docker-compose.prod.yml).
5. Menunggu database PostgreSQL 16 + pgvector siap.
6. Menjalankan migrasi DDL skema database ([001_initial_schema.sql](file:///Users/dwiki.nugraha/dwikicode/karsa-pantau/apps/backend/src/database/migrations/001_initial_schema.sql)).
7. Melakukan seeding data awal (5 demo roles dan proyek contoh PLTS Cirata 50MW).
8. Menguji liveness probe backend.

---

## 4. Arsitektur Kontainer di dalam Droplet

```
               [ Internet: Browser & Mobile PWA ]
                                │
                        Port 80 / 443 (HTTPS)
                                ▼
                     ┌─────────────────────┐
                     │   karsa-caddy       │ (Automatic SSL / Reverse Proxy)
                     └──────────┬──────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        │ Path: /                                       │ Path: /api/v1/*
        ▼                                               ▼
┌─────────────────────────┐                   ┌─────────────────────────┐
│ karsa-frontend          │                   │ karsa-backend-api       │
│ (Next.js 14 Standalone) │                   │ (NestJS REST & SSE)     │
│ Port 3000 (Internal)    │                   │ Port 3001 (Internal)    │
└─────────────────────────┘                   └────────────┬────────────┘
                                                           │
        ┌──────────────────────────────────────────────────┼─────────────────────────────────┐
        │                                                  │                                 │
        ▼                                                  ▼                                 ▼
┌─────────────────────────┐                    ┌─────────────────────────┐       ┌─────────────────────────┐
│ karsa-postgres          │                    │ karsa-redis             │       │ karsa-nine-router       │
│ (Postgres 16 + pgvector)│                    │ (Redis 7 AOF Queue)     │       │ (AI Gateway ClusterIP)  │
│ Port 5432 (Internal)    │                    │ Port 6379 (Internal)    │       │ Port 20128 (Internal)   │
└─────────────────────────┘                    └───────────┬─────────────┘       └─────────────────────────┘
                                                           │
                                                           ▼
                                               ┌─────────────────────────┐
                                               │ karsa-worker            │
                                               │ (BullMQ OCR/Async Pod)  │
                                               └─────────────────────────┘
```

---

## 5. Operasional Harian & Pemeliharaan Droplet

### Melihat Status & Log Layanan
```bash
cd /opt/karsa-pantau

# Periksa status seluruh container
docker compose -f docker-compose.prod.yml ps

# Melihat live logs API backend
docker compose -f docker-compose.prod.yml logs -f backend

# Melihat live logs access log Caddy HTTPS
docker compose -f docker-compose.prod.yml logs -f caddy
```

### Melakukan Update Kode (Deploy Ulang Versi Baru)
```bash
cd /opt/karsa-pantau

# 1. Tarik perubahan kode terbaru dari Git
git pull origin main

# 2. Jalankan ulang script deploy (akan otomatis rebuild yang berubah tanpa downtime berarti)
./scripts/deploy-droplet.sh
```

### Backup Database Manual / Otomatis
```bash
# Membuat dump file PostgreSQL terkompresi
docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U karsa_user karsa_db | gzip > /opt/backup_karsa_$(date +%Y%m%d_%H%M%S).sql.gz

# Menjadwalkan backup harian otomatis (tambahkan ke crontab: crontab -e)
0 2 * * * docker compose -f /opt/karsa-pantau/docker-compose.prod.yml exec -T postgres pg_dump -U karsa_user karsa_db | gzip > /opt/backups/karsa_db_$(date +\%Y\%m\%d).sql.gz
```

---

## 6. Alternatif Jika Ingin Scale Up di Masa Depan

Bila sistem telah berkembang ke ratusan proyek aktif dengan ribuan pekerja harian di lapangan:
- **Tingkat 1 (Vertikal Scaling)**: Naikkan ukuran Droplet langsung melalui dashboard DigitalOcean (Resize ke 16GB / 32GB RAM dalam 1 menit).
- **Tingkat 2 (Horizontal DOKS)**: Beralih ke cluster Kubernetes menggunakan script yang sudah kami siapkan di [scripts/deploy-doks.sh](file:///Users/dwiki.nugraha/dwikicode/karsa-pantau/scripts/deploy-doks.sh) dan manifes di folder [k8s/](file:///Users/dwiki.nugraha/dwikicode/karsa-pantau/k8s).
