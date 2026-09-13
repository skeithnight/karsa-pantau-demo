# API Specification (Enterprise Edition)

Base URL: `/api/v1`. Auth via `Authorization: Bearer <access_token>` kecuali endpoint publik/health.
Format Error: `{ "error": { "code": "string", "message": "string", "details": [] } }`.

Referensi skema data: `03-skema-database.md`. Referensi role akses: `01-ringkasan-dan-alur-bisnis.md` §4.

---

## 1. System & Health Probes (Kubernetes Pods)

| Method | Path | Deskripsi | Role |
|---|---|---|---|
| GET | `/health/liveness` | Kubernetes liveness probe (cek process node) | Publik |
| GET | `/health/readiness` | Kubernetes readiness probe (cek DB & Redis pool) | Publik |

---

## 2. Auth

| Method | Path | Deskripsi | Role |
|---|---|---|---|
| POST | `/auth/login` | Login, body `{email, password}`, return `{accessToken, refreshToken, user}` | Publik |
| POST | `/auth/refresh` | Refresh token, body `{refreshToken}`, return `{accessToken}` | Publik |
| POST | `/auth/logout` | Invalidate refresh token | Semua |
| GET | `/auth/me` | Profil user aktif dan daftar hak akses | Semua |

---

## 3. Projects

| Method | Path | Deskripsi | Role |
|---|---|---|---|
| GET | `/projects` | Daftar proyek (filter `?status&search`, pagination `?page&limit`) | Semua |
| GET | `/projects/:id` | Detail proyek, metrik ringkasan RAB, EVM & Kurva S | Semua |
| POST | `/projects` | Buat proyek baru, body `{name, location, capacityMw, targetCodDate}` | Admin, PM |
| PATCH | `/projects/:id` | Update status/detail proyek | Admin, PM |

---

## 4. RAB & WBS Management

| Method | Path | Deskripsi | Role |
|---|---|---|---|
| GET | `/projects/:id/rab` | Riwayat seluruh versi RAB proyek | Semua |
| GET | `/projects/:id/rab/active` | Versi baseline RAB yang aktif (`approved`) dengan pohon WBS lengkap | Semua |
| GET | `/rab/pending-approvals` | Daftar seluruh RAB yang berstatus `submitted` lintas proyek | Approver |
| POST | `/projects/:id/rab` | Buat draft revisi RAB baru, body `{baselineType, notes}` | Estimator |
| POST | `/rab/:id/items` | Tambah item WBS, body `{parentId, wbsCode, workPackage, category, description, volume, unit, unitPrice, weightPct}` | Estimator |
| PATCH | `/rab/:id/items/:itemId` | Edit item WBS (hanya saat RAB berstatus `draft`) | Estimator |
| DELETE | `/rab/:id/items/:itemId` | Hapus item WBS (hanya saat RAB berstatus `draft`) | Estimator |
| POST | `/rab/:id/submit` | Ajukan RAB untuk review approval (`draft` → `submitted`) | Estimator |
| POST | `/rab/:id/approve` | Setujui RAB (`submitted` → `approved`), catat baseline aktif | Approver |
| POST | `/rab/:id/reject` | Tolak RAB (`submitted` → `rejected`), body `{note}` wajib | Approver |

---

## 5. Actual Entries & Lapangan (Offline Sync Ready)

| Method | Path | Deskripsi | Role |
|---|---|---|---|
| GET | `/rab-items/:id/actuals` | Riwayat realisasi untuk item RAB tertentu | Semua |
| POST | `/rab-items/:id/actuals` | Input realisasi biaya baru.<br>Header: `Idempotency-Key: <uuidv7>` (wajib untuk sync offline).<br>Body: `{clientGeneratedId, entryDate, qty, actualUnitPrice, vendor, invoiceNumber, description, attachmentUrls}` | Site Supervisor |
| POST | `/rab-items/:id/actuals/ocr` | Upload foto nota multipart untuk ekstraksi instan Claude Vision via 9Router. Mengembalikan pre-filled JSON tanpa menyimpan ke DB. | Site Supervisor |

---

## 6. Progres Fisik, Kurva S, & EVM

| Method | Path | Deskripsi | Role |
|---|---|---|---|
| GET | `/projects/:id/progress` | Riwayat log progres fisik periodik & perbandingan PV, EV, AC | Semua |
| POST | `/projects/:id/progress` | Log progres fisik mingguan, body `{periodWeek, logDate, actualProgressPct, notes}` | PM, Supervisor |

---

## 7. Manpower

| Method | Path | Deskripsi | Role |
|---|---|---|---|
| GET | `/projects/:id/manpower` | Daftar tim, target headcount vs realisasi hari ini | Semua |
| POST | `/projects/:id/manpower` | Log absensi & output harian, body `{teamName, rabItemId, plannedHeadcount, actualHeadcount, outputUnitInstalled, logDate}` | Site Supervisor |

---

## 8. AI Services (via 9Router)

| Method | Path | Deskripsi | Role |
|---|---|---|---|
| GET | `/ai/rab-search?q=` | Vector semantic search harga satuan (HNSW) + saran Claude | Estimator |
| GET | `/projects/:id/ai/insights` | Riwayat temuan anomali, evaluasi EVM, dan log RAG | Semua |
| POST | `/projects/:id/ai/chat` | Chat Assistant proyek berbasis RAG kontekstual (Response via Server-Sent Events / SSE) | Semua |

---

## 9. Attachments & Upload

| Method | Path | Deskripsi | Role |
|---|---|---|---|
| POST | `/attachments/upload-url` | Generate Presigned PUT URL MinIO/S3 untuk upload langsung dari client | Site Supervisor |
| POST | `/attachments` | Simpan metadata lampiran yang telah di-upload | Site Supervisor |

---

## 10. Konvensi Umum API

- **Pagination:** Seluruh list endpoint mendukung query `?page=1&limit=20` dengan metadata `{data: [], total: number, page: number, limit: number}`.
- **Idempotensi:** Semua request POST dari PWA client wajib menyertakan header `Idempotency-Key`. Jika ada request duplikat dengan key yang sama dalam rentang 24 jam, server mengembalikan respon tersimpan sebelumnya.
- **Tipe Data Moneter:** Semua nilai moneter dikirim sebagai integer/numeric tanpa pemisah titik/koma (mis. `2850000.00`).
- **Audit Logging:** Setiap mutasi data finansial (RAB item, actuals, approval transition) secara otomatis mencatat `audit_logs` di database.
