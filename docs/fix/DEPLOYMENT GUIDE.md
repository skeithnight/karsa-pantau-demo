# DEPLOYMENT_GUIDE.md — Panduan Deployment Produksi

Melengkapi `SETUP.md` (setup lokal) dan `02-arsitektur-sistem.md` §7. Dokumen ini mencakup dua target: DigitalOcean dan GCP — pilih salah satu sesuai kebutuhan, bukan keduanya sekaligus.

## 1. Opsi A — DigitalOcean

### 1.1 Droplet (lebih sederhana, cocok tahap awal)
- Satu/beberapa Droplet, jalankan lewat `docker-compose.prod.yml`
- Caddy sebagai reverse proxy + auto TLS (Let's Encrypt)
- Managed Database (DigitalOcean Managed PostgreSQL) direkomendasikan alih-alih Postgres di container yang sama — memudahkan backup otomatis
- Cocok untuk MVP/fase awal sebelum trafik besar

### 1.2 DOKS (DigitalOcean Kubernetes) — untuk skala lebih besar / multi-tenant SaaS
- Deploy manifest dari folder `k8s/` ke namespace `karsa-pantau`
- Komponen: `karsa-frontend-pod`, `karsa-backend-api-pod`, `karsa-worker-pod`, `karsa-9router-pod`, StatefulSet untuk `karsa-postgres`, `karsa-redis`, `karsa-minio`
- Ingress: Nginx Ingress Controller + cert-manager untuk TLS otomatis
- Secret (DB credential, JWT secret, 9Router API key) disimpan sebagai Kubernetes Secret, bukan ConfigMap biasa

### 1.3 App Platform (`.do/` folder di repo)
- Alternatif tanpa kelola Kubernetes langsung — cocok bila tim kecil dan ingin CI/CD otomatis dari GitHub
- Konfigurasi ada di `.do/app.yaml` (atau sejenis) di root repo

## 2. Opsi B — GCP

### 2.1 GKE (Google Kubernetes Engine)
- Sama seperti DOKS secara konsep — deploy manifest `k8s/` ke cluster GKE
- Gunakan Cloud SQL (PostgreSQL) sebagai managed database, aktifkan ekstensi pgvector
- Gunakan Memorystore (Redis) untuk queue, alih-alih self-hosted Redis
- Secret Manager GCP untuk kredensial, terintegrasi ke Pod lewat Secret Manager CSI driver

### 2.2 Cloud Run (serverless, lebih sederhana)
- Cocok untuk `backend` dan `frontend` bila trafik tidak konstan — auto-scale ke nol saat idle
- **Catatan:** worker (BullMQ) kurang cocok di Cloud Run karena butuh proses long-running — tetap jalankan worker di GKE/Compute Engine/VM biasa
- Cloud SQL + Memorystore tetap dipakai sebagai database & queue

## 3. Checklist Sebelum Deploy Produksi

- [ ] Semua environment variable produksi sudah diisi (lihat `SETUP.md` §2), disimpan di secret manager platform, bukan file `.env`
- [ ] Provider Anthropic & OpenAI sudah didaftarkan di instance 9Router **produksi** (terpisah dari staging)
- [ ] Migrasi database sudah dijalankan di database produksi
- [ ] TLS aktif di semua endpoint publik (frontend, backend API)
- [ ] Push notification (VAPID key) dikonfigurasi untuk domain produksi
- [ ] Backup database terjadwal aktif (snapshot otomatis di managed DB)
- [ ] Test E2E kritikal (lihat `TESTING.md` §4) lulus di staging sebelum promote ke produksi

## 4. Strategi Rollback

- Deployment memakai versi image yang di-tag (bukan `latest`) — rollback berarti redeploy tag versi sebelumnya
- Migrasi database yang bersifat destruktif (drop kolom/tabel) harus dipisah jadi PR/rilis tersendiri setelah kode yang bergantung padanya sudah stabil minimal satu siklus rilis — supaya rollback kode tidak macet karena skema DB sudah berubah

## 5. Perbedaan Konfigurasi Antar Environment

| Aspek | Staging | Production |
|---|---|---|
| 9Router instance | Terpisah, provider key staging (kuota lebih kecil) | Instance sendiri, provider key produksi |
| Database | Bisa satu instance kecil | Managed DB dengan backup otomatis |
| Domain | `staging.karsapantau.com` (contoh) | `karsapantau.com` |
| Data | Boleh data dummy/sample | Data nyata — akses dibatasi ketat |
