# 03 — Skema Database (Enterprise & WBS-Enhanced)

## 1. Entity Relationship (Komprehensif)

```
projects (1)──(N) rab (1)──(N) rab_items (1)──(N) actual_entries
   │                               │                      │
   │                               └──(N) schedules       └──(N) attachments
   │                               │
   │                               └──(N) rab_item_history (embedding HNSW)
   │
   ├──(N) project_progress_logs (Kurva S & EVM)
   ├──(N) manpower_logs
   ├──(N) ai_insights
   └──(N) audit_logs
```

---

## 2. Tabel Utama

### `users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | Default `gen_random_uuid()` |
| name | text NOT NULL | |
| email | text NOT NULL UNIQUE | |
| password_hash | text NOT NULL | Argon2id / bcrypt |
| role | enum('admin', 'pm', 'estimator', 'approver', 'supervisor') | |
| created_at | timestamptz NOT NULL DEFAULT now() | |
| updated_at | timestamptz NOT NULL DEFAULT now() | |

### `projects`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| name | text NOT NULL | Misal "PLTS Cirata Terapung 50MW" |
| location | text NOT NULL | Koordinat / Kabupaten, Provinsi |
| capacity_mw | numeric(8, 3) NOT NULL | Kapasitas daya terpasang (MWp) |
| target_cod_date | date | Commercial Operation Date target |
| status | enum('planning', 'ongoing', 'completed', 'on_hold') NOT NULL DEFAULT 'planning' |
| created_by | uuid NOT NULL FK → users(id) |
| created_at | timestamptz NOT NULL DEFAULT now() |
| updated_at | timestamptz NOT NULL DEFAULT now() |

### `rab` (Contract Budget Baseline & Change Orders)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| project_id | uuid NOT NULL FK → projects(id) |
| version | int NOT NULL DEFAULT 1 | Nomor revisi (1 = Baseline Kontrak Awal) |
| baseline_type | enum('ORIGINAL_CONTRACT', 'VARIATION_ORDER') NOT NULL DEFAULT 'ORIGINAL_CONTRACT' |
| status | enum('draft', 'submitted', 'approved', 'rejected') NOT NULL DEFAULT 'draft' |
| total_amount | numeric(18, 2) NOT NULL DEFAULT 0 | Agregat sum subtotal seluruh rab_items aktif |
| notes | text | Catatan revisi atau justifikasi perubahan |
| submitted_at | timestamptz | |
| approved_by | uuid FK → users(id), nullable | |
| approved_at | timestamptz, nullable | |
| rejection_note | text, nullable | Wajib diisi bila status `rejected` |

### `rab_items` (Work Breakdown Structure)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| rab_id | uuid NOT NULL FK → rab(id) ON DELETE CASCADE |
| parent_id | uuid FK → rab_items(id), nullable | Untuk hierarki sub-pekerjaan WBS |
| wbs_code | text NOT NULL | Kode hierarki WBS (mis. "1.0", "1.1", "1.1.01") |
| item_code | text NOT NULL | Kode unik item persisten lintas versi revisi RAB |
| work_package | enum('CIVIL', 'ELECTRICAL_DC', 'ELECTRICAL_AC', 'SCADA_MONITORING', 'TESTING_COMMISSIONING', 'OVERHEAD_PERMITS') NOT NULL |
| category | enum('material', 'upah', 'alat', 'overhead') NOT NULL | Jenis unsur biaya |
| description | text NOT NULL | Spesifikasi item (mis. "Panel Surya Mono 550Wp Tier 1") |
| volume | numeric(12, 4) NOT NULL | Kuantitas pekerjaan |
| unit | text NOT NULL | Satuan (unit, Wp, meter, mandays, lot) |
| unit_price | numeric(18, 2) NOT NULL | Harga satuan Rupiah |
| subtotal | numeric(18, 2) GENERATED ALWAYS AS (volume * unit_price) STORED | Nilai anggaran item |
| weight_pct | numeric(6, 3) NOT NULL DEFAULT 0 | Bobot item terhadap total RAB (sum seluruh item = 100%) |
| embedding | vector(1536) | Vektor representasi deskripsi (OpenAI 1536-dim) |

### `rab_item_schedules` (Perencanaan Kurva S)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| rab_item_id | uuid NOT NULL FK → rab_items(id) ON DELETE CASCADE |
| period_week | int NOT NULL | Periode minggu ke-N sejak SPK |
| planned_progress_pct | numeric(6, 3) NOT NULL | Target kumulatif progres item pada minggu tersebut |
| planned_value | numeric(18, 2) NOT NULL | `planned_progress_pct * subtotal` (PV item) |

### `rab_item_history` (Repository Knowledge Base Harga)
Tabel riwayat item pekerjaan dari proyek-proyek masa lalu yang telah berstatus `approved` / `completed`.
- Kolom: sama seperti `rab_items` + `source_project_id uuid`, `recorded_at timestamptz`.
- Memiliki index vector HNSW untuk semantic lookup ultra-cepat.

### `actual_entries` (Realisasi Biaya Lapangan)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | Mendukung client-generated UUIDv7 |
| rab_item_id | uuid NOT NULL FK → rab_items(id) |
| item_code | text NOT NULL | Fallback relasi persisten ke item pekerjaan |
| idempotency_key | text UNIQUE | Kunci idempotensi mencegah duplikasi offline sync |
| entry_date | date NOT NULL | Tanggal transaksi pengeluaran |
| qty | numeric(12, 4) NOT NULL | Kuantitas realisasi |
| actual_unit_price | numeric(18, 2) NOT NULL | Harga satuan riil di nota |
| total_actual_amount | numeric(18, 2) GENERATED ALWAYS AS (qty * actual_unit_price) STORED |
| vendor | text NOT NULL | Nama supplier / subkontraktor |
| invoice_number | text | Nomor faktur/nota |
| description | text | Keterangan pembelian / peruntukan |
| entered_by | uuid NOT NULL FK → users(id) | Supervisor pembuat entri |
| source | enum('manual', 'ocr') NOT NULL DEFAULT 'manual' |
| is_discrepancy | boolean NOT NULL DEFAULT false | Ditandai jika overbudget melampaui batas toleransi |

### `project_progress_logs` (Kurva S & EVM Tracking)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| project_id | uuid NOT NULL FK → projects(id) |
| period_week | int NOT NULL | Minggu ke-N |
| log_date | date NOT NULL | Tanggal pelaporan progres |
| planned_progress_pct | numeric(6, 3) NOT NULL | Rencana progres kumulatif (PV %) |
| actual_progress_pct | numeric(6, 3) NOT NULL | Realisasi progres fisik kumulatif (EV %) |
| earned_value | numeric(18, 2) NOT NULL | `actual_progress_pct * total_rab` |
| actual_cost | numeric(18, 2) NOT NULL | Kumulatif total_actual_amount hingga tanggal ini |
| cpi | numeric(6, 4) NOT NULL | EV / AC (Cost Performance Index) |
| spi | numeric(6, 4) NOT NULL | EV / PV (Schedule Performance Index) |
| eac | numeric(18, 2) NOT NULL | Estimate at Completion |
| notes | text | Ringkasan kendala lapangan (cuaca, izin, material delay) |
| reported_by | uuid NOT NULL FK → users(id) |

### `manpower_logs` (Produktivitas Tenaga Kerja)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| project_id | uuid NOT NULL FK → projects(id) |
| rab_item_id | uuid FK → rab_items(id), nullable | Relasi ke paket pekerjaan upah terkait |
| team_name | text NOT NULL | Mis. "Tim Piling & Racking", "Tim String Cabling" |
| planned_headcount | int NOT NULL | Alokasi target personel |
| actual_headcount | int NOT NULL | Realisasi hadir di lokasi |
| output_unit_installed | numeric(12, 2) | Mis. "120 panel terpasang", "50 titik ramming" |
| log_date | date NOT NULL |
| entered_by | uuid NOT NULL FK → users(id) |

### `attachments` (Bukti & Faktur)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| actual_entry_id | uuid FK → actual_entries(id), nullable | Nullable sebelum draft actual disimpan |
| project_id | uuid NOT NULL FK → projects(id) |
| file_url | text NOT NULL | S3 Object Key / URI MinIO |
| file_name | text NOT NULL |
| mime_type | text NOT NULL | image/jpeg, image/png, application/pdf |
| file_size_bytes | bigint NOT NULL |
| uploaded_by | uuid NOT NULL FK → users(id) |
| uploaded_at | timestamptz NOT NULL DEFAULT now() |

### `ai_insights` (Audit Trail AI)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| project_id | uuid NOT NULL FK → projects(id) |
| type | enum('anomaly', 'forecast', 'chat_response', 'ocr_extract') NOT NULL |
| input_context | jsonb NOT NULL | Snapshot data yang dikirim ke LLM |
| output | jsonb NOT NULL | Jawaban terstruktur / narasi dari Claude |
| tokens_used | int | Total prompt + completion tokens |
| model_used | text NOT NULL | Mis. `claude-3-5-sonnet-20241022` |
| latency_ms | int | Durasi eksekusi gateway |
| created_at | timestamptz NOT NULL DEFAULT now() |

### `audit_logs` (Sistem Audit Trail Finansial & Master)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| user_id | uuid NOT NULL FK → users(id) |
| action | enum('CREATE', 'UPDATE', 'DELETE', 'SUBMIT', 'APPROVE', 'REJECT') NOT NULL |
| entity_name | text NOT NULL | `rab`, `rab_items`, `actual_entries`, `projects` |
| entity_id | uuid NOT NULL | ID entitas yang dimodifikasi |
| old_values | jsonb | State sebelum perubahan |
| new_values | jsonb | State sesudah perubahan |
| ip_address | text |
| user_agent | text |
| timestamp | timestamptz NOT NULL DEFAULT now() |

---

## 3. Catatan Indexing & Optimasi Database

```sql
-- 1. Index Komposit untuk Analisis Variance dan Riwayat Realisasi
CREATE INDEX idx_actual_entries_item_date ON actual_entries(rab_item_id, entry_date);
CREATE INDEX idx_actual_entries_item_code ON actual_entries(item_code);
CREATE INDEX idx_actual_entries_idempotency ON actual_entries(idempotency_key);

-- 2. HNSW Vector Indexing untuk Semantic Search Ultra Cepat (pgvector v0.5+)
CREATE INDEX idx_rab_items_embedding_hnsw 
ON rab_items USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX idx_rab_history_embedding_hnsw 
ON rab_item_history USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 3. Query Dashboard & Alert Index
CREATE INDEX idx_ai_insights_project_type_time ON ai_insights(project_id, type, created_at DESC);
CREATE INDEX idx_progress_logs_project_week ON project_progress_logs(project_id, period_week);
CREATE INDEX idx_rab_project_version ON rab(project_id, version);
CREATE INDEX idx_rab_pending_approvals ON rab(status) WHERE status = 'submitted';
```
