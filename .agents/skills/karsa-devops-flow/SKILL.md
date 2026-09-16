---
name: karsa-devops-flow
description: >-
  Standard operating procedure and runbook for development, deployment, and live validation in Karsa Pantau.
  Covers monorepo typecheck/build, dual-remote git push (origin and demo), DigitalOcean droplet deployment (170.64.135.11) via docker-compose.prod.yml, 9Router AI streaming SSE protocol, and live browser verification.
  Use this skill whenever developing, building, deploying, updating, or verifying features on Karsa Pantau, or when asked to deploy to production, push changes, or verify live deployment.
---

# Karsa Pantau: Development, Deployment, and Validation Workflow

Panduan standar operasional (SOP) untuk siklus pengembangan, pengujian lokal, sinkronisasi git dual-remote, *deployment* ke server produksi DigitalOcean droplet, dan verifikasi langsung (*live validation*) pada sistem **Karsa Pantau** (`https://karsapantau.com`).

---

## 1. Topologi Lingkungan Produksi

| Komponen | Spesifikasi & Detail |
|---|---|
| **Domain Produksi** | `https://karsapantau.com` (dan subdomain AI `ai.karsapantau.com`) |
| **Server Host** | DigitalOcean Droplet `170.64.135.11` (Ubuntu 24.04 x64) |
| **Akses SSH** | `ssh -o StrictHostKeyChecking=no root@170.64.135.11` |
| **Direktori Root Server** | `/opt/karsa-pantau` |
| **Docker Compose File** | `docker-compose.prod.yml` (Wajib sertakan flag `-f docker-compose.prod.yml`) |
| **Git Remotes** | - `origin`: `git@github-personal:skeithnight/karsa-pantau.git`<br>- `demo`: `git@github-personal:skeithnight/karsa-pantau-demo.git` |
| **Database** | PostgreSQL 16 + pgvector (`karsa-postgres`), port `5432`, user `karsa_user`, db `karsa_db` |
| **AI Gateway** | 9Router (`karsa-nine-router`), internal port `20128`, model `karsacombo` (`xmtp/mimo-v2.5`) |
| **Reverse Proxy** | Caddy 2.8 (`karsa-caddy`), otomatis mengelola sertifikat TLS HTTPS Let's Encrypt |

### Daftar Kontainer Produksi
- `karsa-frontend`: Next.js 14 Standalone PWA (port internal `3000`)
- `karsa-backend-api`: NestJS REST & SSE Controller (port internal `3001`)
- `karsa-worker`: NestJS + BullMQ worker async (OCR struk, anomali, embedding)
- `karsa-nine-router`: 9Router LLM gateway proxy (port internal `20128`)
- `karsa-postgres`: PostgreSQL 16 + pgvector
- `karsa-redis`: Redis 7 alpine
- `karsa-minio`: S3-compatible storage
- `karsa-caddy`: Ingress reverse proxy & TLS manager

---

## 2. Fase 1: Pengembangan Lokal & Verifikasi Build (Develop)

Struktur monorepo Karsa Pantau terdiri dari:
- `packages/shared-types`: Skema tipe TypeScript bersama (RAB, EVM, User, Subscription, AI).
- `apps/backend`: NestJS backend API & SSE streaming.
- `apps/frontend`: Next.js 14 App Router dengan TailwindCSS.

### Langkah Verifikasi Kompilasi Lokal:
Sebelum melakukan commit, pastikan seluruh paket terkompilasi bersih tanpa error:

```bash
# 1. Jika mengubah shared-types, build shared-types terlebih dahulu:
pnpm --filter @karsa/shared-types run build

# 2. Verifikasi kompilasi backend NestJS:
cd apps/backend && npm run build && cd ../..

# 3. Verifikasi kompilasi frontend Next.js 14:
cd apps/frontend && npm run build && cd ../..
```

### Aturan Koding Krusial:
1. **Zero Browser Alerts**: Jangan pernah menggunakan `window.alert()`. Gunakan toast, badge status, atau dialog modal.
2. **Finansial di Backend**: Seluruh kalkulasi finansial (total RAB, deviasi variance, CPI, SPI, EAC) dihitung oleh backend NestJS. Frontend dan AI hanya menyajikan angka dan narasi.
3. **Isolasi Tenant**: Jangan mencampur data akun demo (`karsa-solar`) dengan akun produksi riil (misal `cipta-daya-engineering`).
4. **Clean Exit**: Setiap form modal harus memiliki tombol dismiss (`✕` atau `Batal`), loading spinner saat mutasi, dan penanganan error yang jelas.

---

## 3. Fase 2: Commit & Sinkronisasi Git Dual-Remote

Repo ini memiliki **dua remote aktif** yang wajib dijaga sinkronisasinya setiap kali melakukan push:

```bash
# 1. Periksa status git
git status

# 2. Stage berkas yang telah dimodifikasi
git add <path/to/files>

# 3. Commit menggunakan pesan conventional commits
git commit -m "feat(scope): deskripsi perubahan yang jelas"

# 4. Push ke remote utama (origin)
git push origin main

# 5. Push ke remote mirror (demo)
git push demo main
```

> [!IMPORTANT]
> Jangan lewatkan `git push demo main`. Keduanya harus selalu berada pada commit SHA yang identik.

---

## 4. Fase 3: Deployment ke Droplet DigitalOcean (Deploy)

Setelah kode terdorong ke remote `origin/main`, lakukan deploy ke droplet produksi melalui SSH.

### Command Deploy Cepat (One-Liner):
```bash
ssh -o StrictHostKeyChecking=no root@170.64.135.11 "cd /opt/karsa-pantau && git pull origin main && docker compose -f docker-compose.prod.yml build <service> && docker compose -f docker-compose.prod.yml up -d --no-deps <service>"
```

### Pilihan Target `<service>`:
- **Hanya Frontend**: `docker compose -f docker-compose.prod.yml build frontend && docker compose -f docker-compose.prod.yml up -d --no-deps frontend`
- **Hanya Backend**: `docker compose -f docker-compose.prod.yml build backend && docker compose -f docker-compose.prod.yml up -d --no-deps backend`
- **Backend & Frontend**: `docker compose -f docker-compose.prod.yml build backend frontend && docker compose -f docker-compose.prod.yml up -d --no-deps backend frontend`
- **Worker**: `docker compose -f docker-compose.prod.yml build worker && docker compose -f docker-compose.prod.yml up -d --no-deps worker`

### Verifikasi Kesehatan Kontainer Pasca-Deploy:
```bash
ssh -o StrictHostKeyChecking=no root@170.64.135.11 "docker ps && docker logs --tail 30 karsa-backend-api"
```

Pastikan kontainer `karsa-backend-api` berstatus `Up ... (healthy)` dan `karsa-frontend` berstatus `Up`.

---

## 5. Fase 4: Protokol AI Gateway & Streaming SSE (9Router)

Untuk mencegah timeout pada panggilan AI Assistant atau deteksi anomali:

1. **Keep-Alive Header**:
   Pada `ai.controller.ts`, endpoint streaming `/ai/chat` wajib memanggil `res.flushHeaders()` dan mengirim komentar awal SSE:
   ```ts
   res.setHeader('Content-Type', 'text/event-stream');
   res.setHeader('Cache-Control', 'no-cache, no-transform');
   res.setHeader('Connection', 'keep-alive');
   res.setHeader('X-Accel-Buffering', 'no');
   if (typeof (res as any).flushHeaders === 'function') {
     (res as any).flushHeaders();
   }
   res.write(': keep-alive\n\n');
   ```
2. **Batas Timeout 180 Detik**:
   Pada `nine-router.service.ts`, gunakan `signal: AbortSignal.timeout(180000)` agar model reasoning tidak terputus di tengah jalan.
3. **Pembatasan Token**:
   Sertakan `max_tokens: 800` pada payload 9Router agar respon model padat dan tidak bertele-tele (durasi respon ~14-20 detik).
4. **Fallback Terstruktur**:
   Jika stream gagal, otomatis coba pemanggilan non-streaming `createChatCompletion`. Jika keduanya gagal, sajikan data proyek riil dari database tanpa klaim palsu `"[Mode Offline]"`.

---

## 6. Fase 5: Isolasi Produksi vs Sandbox Demo

Pemisahan antara akun produksi dan demo mengikuti aturan mutlak:

1. **Tenant Demo**:
   - Slug: `karsa-solar`.
   - Menampilkan `Ganti Peran Aktif (RBAC) - Demo Mode` switcher pada popover akun dan mobile drawer.
   - Mengizinkan toggle cepat peran (*Admin, PM, Estimator, Supervisor, Finance, Approver*).
2. **Tenant Produksi**:
   - Seluruh slug selain `karsa-solar` (misal `cipta-daya-engineering`).
   - `karsa_demo_mode` wajib dibersihkan (`localStorage.removeItem('karsa_demo_mode')`).
   - Seksi RBAC Demo Switcher **wajib disembunyikan total**.
   - Peran pengguna dikunci sesuai data database (`org.myRole = 'admin'`).
   - Tombol `Buka Simulasi Demo Live` pada `/docs` wajib disembunyikan.
   - Halaman `/settings/billing` tombol `Upgrade / Ubah Paket` wajib meluncurkan modal interaktif dengan opsi upgrade langsung via Virtual Account BCA.

---

## 7. Fase 6: Verifikasi Langsung Pasca-Deploy (Live Validation)

Setelah deploy selesai, jalankan checklist verifikasi live:

### 1. Uji Login Akun Produksi:
- URL: `https://karsapantau.com/login`
- Kredensial Admin Produksi: `syafakhosyiah27@gmail.com` / `Password123!`
- Kredensial Demo Sandbox: `admin@karsapantau.id` / `Password123!`

### 2. Uji Menu Popover Akun:
- Klik avatar akun di pojok kanan atas.
- Pastikan nama: `Syafak Hosyiah`, organisasi: `PT Cipta Daya Engineering`, paket: `STARTER`.
- Pastikan seksi **Demo Mode Switcher** **TIDAK MUNCUL**.

### 3. Uji Modal Upgrade Billing:
- Buka `https://karsapantau.com/settings/billing`.
- Klik `Upgrade / Ubah Paket`.
- Pastikan modal interaktif muncul di tengah layar dengan opsi Bulanan/Tahunan dan komparasi paket Starter, Pro Contractor, dan Enterprise.

### 4. Uji AI Chat Assistant:
- Buka detail proyek (`/projects/[id]`).
- Buka widget AI Assistant (tombol mengambang di kanan bawah).
- Kirim pesan pengujian: *"Halo Karsa, bagaimana strategi kontrol biaya proyek PLTS ini?"*
- Pastikan jawaban mengalir secara streaming, kontekstual sesuai nama proyek, dan **TIDAK MUNCUL** pesan `"[Mode Offline]"`.

### 5. Uji Halaman Dokumentasi:
- Buka `https://karsapantau.com/docs` dalam keadaan login produksi.
- Pastikan tombol `Buka Simulasi Demo Live` tersembunyi.

### 6. Dokumentasi & Tangkapan Layar:
- Tangkap bukti visual menggunakan tool screenshot viewport.
- Simpan berkas ke direktori artefak (`<appDataDir>/brain/<conversation-id>/...`).
- Catat ringkasan hasil uji pada dokumen `walkthrough.md`.
