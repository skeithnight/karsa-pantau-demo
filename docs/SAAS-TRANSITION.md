# SAAS-TRANSITION.md — Transisi Karsa Pantau ke Model SaaS

Dokumen ini melengkapi spesifikasi di `AGENTS.md` dkk (single-tenant/internal) dengan perubahan yang dibutuhkan untuk menjadikan Karsa Pantau produk SaaS multi-tenant, dijual ke banyak perusahaan kontraktor/EPC PLTS.

## 1. Ringkasan & Tujuan

Dari: sistem internal satu perusahaan, satu database, satu set proyek.
Menjadi: platform yang bisa dipakai banyak perusahaan (tenant) secara independen, dengan model langganan berbayar.

## 2. Perubahan Model Bisnis

| Aspek | Sebelum (internal) | Sesudah (SaaS) |
|---|---|---|
| Pengguna | 1 perusahaan | Banyak perusahaan (tenant) |
| Akses | Invite manual oleh admin | Self-service signup + trial |
| Monetisasi | Tidak ada | Langganan bulanan/tahunan per tier |
| Data | Satu ruang data | Terisolasi per tenant |
| Biaya AI | Ditanggung internal | Perlu metering & kuota per tenant |

## 3. Arsitektur Multi-Tenancy

**Strategi isolasi yang direkomendasikan:** *shared database, kolom `tenant_id`* (bukan database-per-tenant) untuk efisiensi biaya di tahap awal, dengan opsi upgrade ke database terpisah untuk tenant Enterprise di kemudian hari.

- Tabel baru `tenants` (id, nama perusahaan, plan, status langganan, dibuat pada)
- Semua tabel inti (`projects`, `rab`, `rab_items`, `actual_entries`, `manpower_logs`, `ai_insights`) mendapat kolom `tenant_id` (FK ke `tenants`)
- **Row-Level Security (RLS)** PostgreSQL diaktifkan di level database — setiap query otomatis dibatasi `tenant_id` sesuai sesi user, sebagai lapisan pertahanan kedua selain filter di application layer
- Middleware backend melakukan *tenant resolution* dari subdomain (`acme.karsapantau.com`) atau header `X-Tenant-Id`, lalu inject ke context request sebelum query database

## 4. Onboarding & Signup

1. Signup mandiri (form: nama perusahaan, email admin, password) → membuat record `tenants` + user pertama dengan role `tenant_owner`
2. Trial otomatis aktif (mis. 14 hari) tanpa perlu kartu kredit di awal
3. Tenant owner mengundang anggota tim (Estimator, PM, Approver, Supervisor) lewat email invite
4. Onboarding checklist di dalam app: buat proyek pertama, isi RAB pertama, undang tim

## 5. Billing & Subscription

- **Payment gateway:** Midtrans (dominan di Indonesia, mendukung VA/QRIS/kartu) — bisa ditambah Stripe belakangan untuk ekspansi luar negeri
- **Model tagihan:** langganan bulanan/tahunan (diskon untuk tahunan)
- **Metering yang perlu dilacak per tenant:**
  - Jumlah proyek aktif
  - Jumlah user
  - Kuota request AI (search, chat, OCR) — karena ini komponen biaya variabel terbesar (token Claude via 9Router)
- **Dunning:** notifikasi otomatis saat pembayaran gagal, grace period sebelum akun di-downgrade ke read-only

## 6. Usulan Tier Harga

| Tier | Proyek aktif | Fitur AI | Target pengguna |
|---|---|---|---|
| **Starter** | 1 proyek | Tanpa AI (atau kuota sangat terbatas) | Kontraktor kecil, coba-coba |
| **Pro** | Sampai 10 proyek | Semantic search, anomaly detection, chat assistant (kuota bulanan) | Kontraktor menengah |
| **Enterprise** | Unlimited | Semua fitur AI + OCR + forecast, kuota custom, SLA, opsi integrasi ERP | EPC besar, multi-proyek nasional |

Harga nominal perlu divalidasi lewat riset pasar (lihat §12) — struktur di atas adalah kerangka tier, bukan angka final.

## 7. Perubahan Role & Permission

Tambahan role baru di atas role operasional yang sudah ada (lihat `01-ringkasan-dan-alur-bisnis.md`):
- **Tenant Owner** — kelola billing, invite/hapus user, upgrade/downgrade plan
- **Tenant Admin** (opsional) — kelola user & proyek tanpa akses billing, untuk perusahaan besar yang mau pisah tanggung jawab

## 8. Keamanan & Kontrol Biaya AI

- RLS + filter `tenant_id` wajib di setiap query — audit berkala lewat automated test yang mencoba akses data lintas tenant (harus selalu gagal)
- Rate limiting per tenant untuk request AI, terutama di tier Starter — mencegah satu tenant menghabiskan kuota/biaya tak terkendali
- Setiap catatan `ai_insights` disertai `tenant_id` agar biaya token bisa diagregasi & ditagih ulang secara akurat per tenant
- Data residency: pertimbangkan lokasi server/database bila ada calon klien dengan syarat kepatuhan data lokal

## 9. Migrasi dari Single-Tenant ke Multi-Tenant

1. Tambahkan kolom `tenant_id` (nullable dulu) ke semua tabel terkait lewat migration
2. Buat satu record `tenants` untuk perusahaan yang sudah pakai versi internal, backfill semua data existing dengan `tenant_id` tersebut
3. Set kolom `tenant_id` jadi `NOT NULL` setelah backfill selesai
4. Aktifkan RLS setelah semua data terisi `tenant_id` dengan benar — uji di staging sebelum diaktifkan di production

## 10. Perubahan Arsitektur Teknis (tambahan dari `02-arsitektur-sistem.md`)

- Middleware tenant resolution di backend (baca subdomain/header sebelum semua request diproses)
- Modul billing baru (`modules/billing/`) — webhook handler dari Midtrans, update status `tenants.plan`/`tenants.status`
- Job queue tambahan: cron cek langganan yang akan/sudah expired, kirim reminder & lakukan downgrade otomatis

## 11. Roadmap Transisi (fase)

**Fase A — Fondasi multi-tenant (belum ada billing):**
Tabel `tenants`, kolom `tenant_id` di semua tabel, RLS aktif, middleware tenant resolution. Akses masih invite-only oleh tim internal.

**Fase B — Self-service:**
Signup mandiri, trial otomatis, onboarding flow.

**Fase C — Billing:**
Integrasi Midtrans, tier plan aktif, metering AI usage, dunning flow.

**Fase D — Enterprise readiness:**
SSO (opsional), opsi dedicated database untuk tenant besar, SLA, custom integrasi ERP klien.

## 12. Metrik SaaS yang Perlu Dipantau

- MRR (Monthly Recurring Revenue) & pertumbuhannya
- Churn rate per tier
- Activation rate (persentase signup yang benar-benar bikin proyek & RAB pertama)
- Biaya AI (token cost) per tenant vs pendapatan dari tenant tersebut — penting untuk validasi margin tiap tier

## 13. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Biaya token AI membengkak tanpa kontrol | Kuota & rate limit ketat per tier, monitoring biaya per tenant real-time |
| Kebocoran data lintas tenant | RLS + automated test isolasi + audit log akses |
| Kompleksitas migrasi data existing | Migrasi bertahap (§9), testing menyeluruh di staging sebelum production |
| Harga tier tidak sesuai daya beli pasar kontraktor lokal | Validasi harga lewat wawancara calon pelanggan sebelum finalisasi tier (lihat §6) |
