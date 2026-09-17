-- 006_performance_indexes.sql
-- Optimasi performa: indeks komposit dan relasi untuk query frekuensi tinggi

-- 1. Akselerasi query RAB aktif per proyek (findActiveByProject, recalculate)
CREATE INDEX IF NOT EXISTS idx_rab_project_status 
  ON rab(project_id, status);

-- 2. Akselerasi lookup bukti transaksi/lampiran nota belanja realisasi
CREATE INDEX IF NOT EXISTS idx_attachments_actual_entry_id 
  ON attachments(actual_entry_id);

CREATE INDEX IF NOT EXISTS idx_attachments_project_id 
  ON attachments(project_id);

-- 3. Akselerasi penghitungan kuota AI per organisasi bulanan (ai_insights)
CREATE INDEX IF NOT EXISTS idx_ai_insights_org_created 
  ON ai_insights(organization_id, created_at DESC);

-- 4. Akselerasi pelaporan log tenaga kerja lapangan per proyek & tanggal
CREATE INDEX IF NOT EXISTS idx_manpower_logs_project_date 
  ON manpower_logs(project_id, log_date DESC);

-- 5. Akselerasi query riwayat realisasi biaya berdasarkan tanggal
CREATE INDEX IF NOT EXISTS idx_actual_entries_date 
  ON actual_entries(entry_date DESC);

-- 6. Akselerasi audit kasbon lapangan per pemohon (SoD tracking)
CREATE INDEX IF NOT EXISTS idx_petty_cash_created_by 
  ON petty_cash_transactions(created_by);
