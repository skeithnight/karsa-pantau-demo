-- 004_daily_logs_and_petty_cash.sql
-- Migrasi untuk Modul Daily Site Log (Laporan Harian Lapangan) & Kasbon Lapangan (Petty Cash)

-- 1. Tabel Daily Site Logs
CREATE TABLE IF NOT EXISTS daily_site_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  weather_morning TEXT NOT NULL DEFAULT 'cerah',
  weather_afternoon TEXT NOT NULL DEFAULT 'cerah',
  weather_evening TEXT NOT NULL DEFAULT 'cerah',
  work_hours_effective NUMERIC(4, 1) NOT NULL DEFAULT 8.0,
  work_hours_lost NUMERIC(4, 1) NOT NULL DEFAULT 0.0,
  manpower_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  equipment_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  work_progress_summary TEXT NOT NULL,
  issues_and_delays TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_project_log_date UNIQUE (project_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_site_logs_project_date 
  ON daily_site_logs(project_id, log_date DESC);

-- 2. Tabel Petty Cash Transactions
CREATE TABLE IF NOT EXISTS petty_cash_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL DEFAULT 'kasbon_request',
  amount NUMERIC(15, 2) NOT NULL,
  recipient_name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  cost_category TEXT NOT NULL DEFAULT 'overhead',
  status TEXT NOT NULL DEFAULT 'submitted',
  approved_by UUID REFERENCES users(id),
  disbursed_at TIMESTAMPTZ,
  receipt_url TEXT,
  geotag JSONB,
  settlement_amount NUMERIC(15, 2),
  settlement_notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_petty_cash_project_status 
  ON petty_cash_transactions(project_id, status, created_at DESC);

-- 3. Seed Demo Data untuk Proyek Komersial Cikarang (de300000-0000-0000-0000-000000000500)
DO $$
DECLARE
  v_project_id UUID := 'de300000-0000-0000-0000-000000000500';
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM users WHERE role = 'supervisor' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM users LIMIT 1;
  END IF;

  IF EXISTS (SELECT 1 FROM projects WHERE id = v_project_id) AND v_user_id IS NOT NULL THEN
    -- Seed Laporan Harian H-2 (Hujan Lebat -> Rain Delay EOT)
    INSERT INTO daily_site_logs (
      project_id, log_date, weather_morning, weather_afternoon, weather_evening,
      work_hours_effective, work_hours_lost, manpower_data, equipment_data,
      work_progress_summary, issues_and_delays, created_by
    ) VALUES (
      v_project_id,
      CURRENT_DATE - INTERVAL '2 days',
      'cerah', 'hujan_lebat', 'hujan_lebat',
      4.0, 4.0,
      '[
        {"role": "Mandor Utama", "count": 2},
        {"role": "Tukang Besi & Batu", "count": 14},
        {"role": "Kenek / Helper", "count": 8},
        {"role": "Operator Alat Berat", "count": 3}
      ]'::jsonb,
      '[
        {"name": "Excavator PC200", "status": "beroperasi", "hours": 4},
        {"name": "Mobile Crane 25T", "status": "standby", "hours": 0},
        {"name": "Genset Silent 50kVA", "status": "beroperasi", "hours": 8}
      ]'::jsonb,
      'Pekerjaan pembesian sloof dan pemasangan bekisting kolom lantai 1 zona barat.',
      'Hujan deras disertai angin kencang mulai pukul 13.00 WIB menyebabkan genangan pada galian pit fondasi. Pekerjaan pengecoran ditunda demi standar K3 dan mutu beton. Potensi klaim Extension of Time (EOT) 0.5 hari kerja.',
      v_user_id
    ) ON CONFLICT (project_id, log_date) DO NOTHING;

    -- Seed Laporan Harian H-1 (Cerah -> Optimal)
    INSERT INTO daily_site_logs (
      project_id, log_date, weather_morning, weather_afternoon, weather_evening,
      work_hours_effective, work_hours_lost, manpower_data, equipment_data,
      work_progress_summary, issues_and_delays, created_by
    ) VALUES (
      v_project_id,
      CURRENT_DATE - INTERVAL '1 day',
      'cerah', 'cerah', 'berawan',
      8.0, 0.0,
      '[
        {"role": "Mandor Utama", "count": 2},
        {"role": "Tukang Besi & Batu", "count": 18},
        {"role": "Kenek / Helper", "count": 10},
        {"role": "Operator Alat Berat", "count": 3}
      ]'::jsonb,
      '[
        {"name": "Excavator PC200", "status": "beroperasi", "hours": 7.5},
        {"name": "Mobile Crane 25T", "status": "beroperasi", "hours": 6.0},
        {"name": "Genset Silent 50kVA", "status": "beroperasi", "hours": 8.0}
      ]'::jsonb,
      'Pengecoran kolom K1 zona barat volume 24 m3 selesai 100%. Dilanjutkan perakitan scaffolding lantai 2.',
      'Aktivitas berjalan lancar tanpa kendala cuaca. Pasokan ready-mix tiba tepat waktu.',
      v_user_id
    ) ON CONFLICT (project_id, log_date) DO NOTHING;

    -- Seed Laporan Harian Hari Ini (Ongoing)
    INSERT INTO daily_site_logs (
      project_id, log_date, weather_morning, weather_afternoon, weather_evening,
      work_hours_effective, work_hours_lost, manpower_data, equipment_data,
      work_progress_summary, issues_and_delays, created_by
    ) VALUES (
      v_project_id,
      CURRENT_DATE,
      'cerah', 'berawan', 'cerah',
      8.0, 0.0,
      '[
        {"role": "Mandor Utama", "count": 2},
        {"role": "Tukang Besi & Batu", "count": 16},
        {"role": "Kenek / Helper", "count": 8},
        {"role": "Operator Alat Berat", "count": 2}
      ]'::jsonb,
      '[
        {"name": "Excavator PC200", "status": "beroperasi", "hours": 5.0},
        {"name": "Mobile Crane 25T", "status": "standby", "hours": 0.0},
        {"name": "Genset Silent 50kVA", "status": "beroperasi", "hours": 8.0}
      ]'::jsonb,
      'Pemasangan pipa conduit MEP lantai 1 dan perapihan galian drainase perimeter.',
      'Material pipa conduit PVC 20mm tercukupi di gudang site.',
      v_user_id
    ) ON CONFLICT (project_id, log_date) DO NOTHING;

    -- Seed Transaksi Kasbon Lapangan (Petty Cash)
    -- 1. Kasbon Bensin & Solar Genset (Sudah Disettle)
    INSERT INTO petty_cash_transactions (
      project_id, transaction_type, amount, recipient_name, purpose,
      cost_category, status, approved_by, disbursed_at,
      settlement_amount, settlement_notes, created_by, created_at
    ) VALUES (
      v_project_id, 'kasbon_request', 1250000, 'Mandor Sugiarto',
      'Pembelian darurat Solar Dexlite 80 Liter untuk Genset Silent 50kVA lembur malam',
      'equipment', 'settled', v_user_id, CURRENT_TIMESTAMP - INTERVAL '3 days',
      1200000, 'Pembelian 80L solar @Rp 15.000 = Rp 1.200.000. Nota SPBU terlampir. Sisa uang kembali Rp 50.000 dikembalikan ke kasir site.',
      v_user_id, CURRENT_TIMESTAMP - INTERVAL '3 days'
    );

    -- 2. Kasbon Paku & Kawat Bendrat (Dicairkan, Menunggu Settlement)
    INSERT INTO petty_cash_transactions (
      project_id, transaction_type, amount, recipient_name, purpose,
      cost_category, status, approved_by, disbursed_at,
      created_by, created_at
    ) VALUES (
      v_project_id, 'kasbon_request', 850000, 'Supervisor Budi Santoso',
      'Beli kawat bendrat 2 rol dan paku usuk 7cm di Toko Besi Sumber Makmur (stok gudang habis)',
      'material', 'disbursed', v_user_id, CURRENT_TIMESTAMP - INTERVAL '1 day',
      v_user_id, CURRENT_TIMESTAMP - INTERVAL '1 day'
    );

    -- 3. Kasbon Konsumsi Lembur Mandor (Menunggu Approval PM)
    INSERT INTO petty_cash_transactions (
      project_id, transaction_type, amount, recipient_name, purpose,
      cost_category, status,
      created_by, created_at
    ) VALUES (
      v_project_id, 'kasbon_request', 450000, 'Mandor Sugiarto',
      'Uang makan malam & kopi 15 orang pekerja lembur persiapan cor balok',
      'overhead', 'submitted',
      v_user_id, CURRENT_TIMESTAMP - INTERVAL '4 hours'
    );
  END IF;
END $$;
