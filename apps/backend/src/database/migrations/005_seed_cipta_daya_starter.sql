-- ============================================================================
-- 005_seed_cipta_daya_starter.sql: Starter EPC PT Cipta Daya Engineering & Admin User
-- ============================================================================

DO $$
DECLARE
  v_org_id UUID;
  v_plan_id UUID;
  v_user_id UUID;
  v_proj_karawang_id UUID := 'cd100000-0000-0000-0000-000000000001';
  v_proj_cikarang_id UUID := 'cd200000-0000-0000-0000-000000000002';
  v_rab1_id UUID;
  v_rab2_id UUID;
  v_item_civ UUID;
  v_item_trf UUID;
  v_item_mdp UUID;
  v_item_cbl_mv UUID;
  v_item_cbl_lv UUID;
  v_item_scada UUID;
  v_item_lab UUID;
  v_item_comm UUID;
  v_item_hse UUID;
  v_hashed_pw TEXT;
BEGIN
  -- 1. Siapkan Password Hash untuk 'Password123!'
  -- Menggunakan pgcrypto crypt dengan salt blowfish
  v_hashed_pw := crypt('Password123!', gen_salt('bf', 10));

  -- 2. Ambil Plan STARTER (Starter EPC)
  SELECT id INTO v_plan_id FROM subscription_plans WHERE code = 'STARTER' LIMIT 1;
  IF v_plan_id IS NULL THEN
    SELECT id INTO v_plan_id FROM subscription_plans LIMIT 1;
  END IF;

  -- 3. Buat atau Dapatkan Organisasi: PT Cipta Daya Engineering
  SELECT id INTO v_org_id FROM organizations WHERE slug = 'cipta-daya-engineering' LIMIT 1;
  IF v_org_id IS NULL THEN
    INSERT INTO organizations (name, slug, logo_url, status)
    VALUES (
      'PT Cipta Daya Engineering',
      'cipta-daya-engineering',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=128&q=80',
      'active'
    )
    RETURNING id INTO v_org_id;
  ELSE
    UPDATE organizations
    SET name = 'PT Cipta Daya Engineering', status = 'active'
    WHERE id = v_org_id;
  END IF;

  -- 4. Pastikan Langganan Paket STARTER Aktif (Starter EPC)
  IF NOT EXISTS (SELECT 1 FROM subscriptions WHERE organization_id = v_org_id) THEN
    INSERT INTO subscriptions (
      organization_id, plan_id, status, billing_cycle,
      current_period_start, current_period_end, trial_ends_at
    ) VALUES (
      v_org_id, v_plan_id, 'active', 'yearly',
      now(), now() + INTERVAL '365 days', now() + INTERVAL '365 days'
    );
  ELSE
    UPDATE subscriptions
    SET plan_id = v_plan_id, status = 'active', current_period_end = now() + INTERVAL '365 days'
    WHERE organization_id = v_org_id;
  END IF;

  -- 5. Buat atau Update Akun Admin: syafakhosyiah27@gmail.com
  SELECT id INTO v_user_id FROM users WHERE LOWER(email) = 'syafakhosyiah27@gmail.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    INSERT INTO users (name, email, password_hash, role)
    VALUES (
      'Syafak Hosyiah',
      'syafakhosyiah27@gmail.com',
      v_hashed_pw,
      'admin'
    )
    RETURNING id INTO v_user_id;
  ELSE
    UPDATE users
    SET name = 'Syafak Hosyiah', password_hash = v_hashed_pw, role = 'admin'
    WHERE id = v_user_id;
  END IF;

  -- 6. Daftarkan User sebagai Member & Admin Organisasi PT Cipta Daya Engineering
  INSERT INTO organization_members (organization_id, user_id, role, is_active)
  VALUES (v_org_id, v_user_id, 'admin', true)
  ON CONFLICT (organization_id, user_id)
  DO UPDATE SET role = 'admin', is_active = true;

  -- ============================================================================
  -- 7. SEED PROYEK EPC 1: EPC Gardu Distribusi & Sistem Kelistrikan Pabrik Karawang
  -- ============================================================================
  IF NOT EXISTS (SELECT 1 FROM projects WHERE id = v_proj_karawang_id) THEN
    INSERT INTO projects (
      id, name, location, capacity_mw, target_cod_date, status, created_by, organization_id
    ) VALUES (
      v_proj_karawang_id,
      'EPC Gardu Distribusi & Sistem Kelistrikan Pabrik Karawang',
      'Kawasan Industri Surya Cipta, Karawang, Jawa Barat',
      2.500,
      CURRENT_DATE + INTERVAL '90 days',
      'ongoing',
      v_user_id,
      v_org_id
    );
  ELSE
    UPDATE projects
    SET name = 'EPC Gardu Distribusi & Sistem Kelistrikan Pabrik Karawang',
        organization_id = v_org_id,
        status = 'ongoing'
    WHERE id = v_proj_karawang_id;
  END IF;

  -- RAB Baseline Proyek 1 (Rp 5.850.000.000)
  SELECT id INTO v_rab1_id FROM rab WHERE project_id = v_proj_karawang_id LIMIT 1;
  IF v_rab1_id IS NULL THEN
    INSERT INTO rab (
      project_id, version, baseline_type, status, total_amount, notes,
      submitted_at, approved_by, approved_at
    ) VALUES (
      v_proj_karawang_id,
      1,
      'ORIGINAL_CONTRACT',
      'approved',
      5850000000.00,
      'RAB Kontrak Utama EPC Gardu Distribusi & MEP Listrik Disetujui Direksi PT Cipta Daya Engineering',
      now() - INTERVAL '40 days',
      v_user_id,
      now() - INTERVAL '38 days'
    ) RETURNING id INTO v_rab1_id;

    -- WBS 1.1: Sipil Pondasi Gardu & Trafo
    INSERT INTO rab_items (rab_id, wbs_code, item_code, work_package, category, description, volume, unit, unit_price, weight_pct)
    VALUES (
      v_rab1_id, '1.1', 'CIV-01', 'CIVIL', 'material',
      'Pekerjaan Sipil Pondasi Transformator & Gardu Beton Bertulang K-300',
      65, 'm3', 1650000.00, 1.833
    ) RETURNING id INTO v_item_civ;

    -- WBS 2.1: Transformator 2000 kVA
    INSERT INTO rab_items (rab_id, wbs_code, item_code, work_package, category, description, volume, unit, unit_price, weight_pct)
    VALUES (
      v_rab1_id, '2.1', 'EL-TRF-01', 'ELECTRICAL_AC', 'alat',
      'Oil-Immersed Distribution Transformer 2000 kVA 20kV/400V Dyn5 Trafoindo',
      2, 'unit', 680000000.00, 23.248
    ) RETURNING id INTO v_item_trf;

    -- WBS 2.2: MDP Panel 3200A
    INSERT INTO rab_items (rab_id, wbs_code, item_code, work_package, category, description, volume, unit, unit_price, weight_pct)
    VALUES (
      v_rab1_id, '2.2', 'EL-MDP-01', 'ELECTRICAL_AC', 'alat',
      'Main Distribution Panel (MDP) 3200A Form 4b with ACB Masterpact Schneider',
      2, 'set', 450000000.00, 15.385
    ) RETURNING id INTO v_item_mdp;

    -- WBS 2.3: Kabel Tegangan Menengah MV 24kV
    INSERT INTO rab_items (rab_id, wbs_code, item_code, work_package, category, description, volume, unit, unit_price, weight_pct)
    VALUES (
      v_rab1_id, '2.3', 'EL-CBL-MV', 'ELECTRICAL_AC', 'material',
      'Medium Voltage Cable N2XSY 3x120 mm2 24kV Supreme / Kabelindo',
      1200, 'meter', 485000.00, 9.949
    ) RETURNING id INTO v_item_cbl_mv;

    -- WBS 2.4: Kabel Tegangan Rendah LV 0.6/1kV
    INSERT INTO rab_items (rab_id, wbs_code, item_code, work_package, category, description, volume, unit, unit_price, weight_pct)
    VALUES (
      v_rab1_id, '2.4', 'EL-CBL-LV', 'ELECTRICAL_AC', 'material',
      'Low Voltage Power Cable NYY 4x300 mm2 0.6/1kV Tray Installation',
      2800, 'meter', 520000.00, 24.889
    ) RETURNING id INTO v_item_cbl_lv;

    -- WBS 3.1: SCADA & Power Quality Meter
    INSERT INTO rab_items (rab_id, wbs_code, item_code, work_package, category, description, volume, unit, unit_price, weight_pct)
    VALUES (
      v_rab1_id, '3.1', 'INST-SCADA-01', 'SCADA_MONITORING', 'alat',
      'Power Quality Analyzer, Digital Energy Meter Class 0.2s & IoT Telemetry Gateway',
      1, 'lot', 285000000.00, 4.872
    ) RETURNING id INTO v_item_scada;

    -- WBS 4.1: Upah Mandor & Teknisi MV
    INSERT INTO rab_items (rab_id, wbs_code, item_code, work_package, category, description, volume, unit, unit_price, weight_pct)
    VALUES (
      v_rab1_id, '4.1', 'LAB-MEP-01', 'CIVIL', 'upah',
      'Upah Teknisi Bersertifikat Tegangan Menengah & Mandor Instalasi Kabel Tray',
      1500, 'mandays', 280000.00, 7.179
    ) RETURNING id INTO v_item_lab;

    -- WBS 5.1: Testing Commissioning & SLO
    INSERT INTO rab_items (rab_id, wbs_code, item_code, work_package, category, description, volume, unit, unit_price, weight_pct)
    VALUES (
      v_rab1_id, '5.1', 'TEST-COMM-01', 'TESTING_COMMISSIONING', 'upah',
      'Pengujian Hi-Pot 50kV, Kalibrasi Relay Proteksi & Sertifikat Layak Operasi (SLO)',
      1, 'lot', 320000000.00, 5.470
    ) RETURNING id INTO v_item_comm;

    -- WBS 6.1: HSE K3 & Manajemen Proyek
    INSERT INTO rab_items (rab_id, wbs_code, item_code, work_package, category, description, volume, unit, unit_price, weight_pct)
    VALUES (
      v_rab1_id, '6.1', 'MGT-HSE-01', 'OVERHEAD_PERMITS', 'overhead',
      'HSE / K3 Kelistrikan, APD Arc Flash, Manajemen Proyek & Asuransi CAR',
      1, 'lot', 419750000.00, 7.175
    ) RETURNING id INTO v_item_hse;

    -- Input Realisasi Biaya Aktual (Actual Entries)
    INSERT INTO actual_entries (rab_item_id, item_code, entry_date, qty, actual_unit_price, vendor, invoice_number, description, entered_by)
    VALUES
      (v_item_civ, 'CIV-01', CURRENT_DATE - INTERVAL '25 days', 65, 1650000.00, 'PT Adhimix RMC Indonesia', 'INV-ADH-9912', 'Pengecoran plat beton gardu 65 m3 K-300', v_user_id),
      (v_item_trf, 'EL-TRF-01', CURRENT_DATE - INTERVAL '20 days', 1, 680000000.00, 'PT Trafoindo Prima Perkasa', 'INV-TRF-8812', 'Pengiriman unit 1 Trafo 2000 kVA ke site Karawang', v_user_id),
      (v_item_cbl_lv, 'EL-CBL-LV', CURRENT_DATE - INTERVAL '12 days', 1200, 520000.00, 'PT Supreme Cable Manufacturing Tbk', 'INV-SC-2026/089', 'Pengiriman termin 1 kabel NYY 4x300mm2', v_user_id),
      (v_item_lab, 'LAB-MEP-01', CURRENT_DATE - INTERVAL '7 days', 500, 280000.00, 'Mandor Borongan Listrik H. Sukirman', 'KWT-LAB-01', 'Upah termin 1 mandor penarikan kabel bawah tanah', v_user_id);

    -- Progress Logs Kurva S (EVM)
    INSERT INTO project_progress_logs (
      project_id, period_week, log_date, planned_progress_pct, actual_progress_pct,
      earned_value, actual_cost, cpi, spi, eac, notes, reported_by
    ) VALUES
      (v_proj_karawang_id, 1, CURRENT_DATE - INTERVAL '28 days', 4.0, 5.0, 292500000.00, 107250000.00, 2.727, 1.250, 2145000000.00, 'Mobilisasi dan galian pondasi gardu selesai mendahului jadwal', v_user_id),
      (v_proj_karawang_id, 2, CURRENT_DATE - INTERVAL '21 days', 10.0, 12.0, 702000000.00, 350000000.00, 2.005, 1.200, 2917500000.00, 'Pengecoran gardu selesai, persiapan instalasi kabel tray', v_user_id),
      (v_proj_karawang_id, 3, CURRENT_DATE - INTERVAL '14 days', 18.0, 20.0, 1170000000.00, 787250000.00, 1.486, 1.111, 3936250000.00, 'Unit 1 trafo 2000 kVA tiba di site & diposisikan ke bantalan beton', v_user_id),
      (v_proj_karawang_id, 4, CURRENT_DATE - INTERVAL '7 days', 28.0, 31.0, 1813500000.00, 1411250000.00, 1.285, 1.107, 4552500000.00, 'Penarikan kabel LV NYY 4x300mm2 mencapai 1.200 meter pertama', v_user_id),
      (v_proj_karawang_id, 5, CURRENT_DATE, 38.0, 41.5, 2427750000.00, 1551250000.00, 1.565, 1.092, 3738000000.00, 'Terminasi kabel trafo berjalan baik. Proyek under-budget dan ahead of schedule.', v_user_id);

    -- Laporan Harian Lapangan (Daily Site Log)
    INSERT INTO daily_site_logs (
      project_id, log_date, weather_morning, weather_afternoon, weather_evening,
      work_hours_effective, work_hours_lost, manpower_data, equipment_data,
      work_progress_summary, issues_and_delays, created_by
    ) VALUES (
      v_proj_karawang_id,
      CURRENT_DATE,
      'cerah', 'cerah', 'berawan',
      8.0, 0.0,
      '[{"role": "Mandor Listrik", "count": 2}, {"role": "Teknisi MV", "count": 6}, {"role": "Helper", "count": 8}]'::jsonb,
      '[{"name": "Crane Truck 5 Ton", "status": "aktif"}, {"name": "Cable Drum Jack", "status": "aktif"}]'::jsonb,
      'Penarikan kabel LV sepanjang 400 meter di area gardu utama. Kondisi cuaca mendukung dan safety induction dipatuhi.',
      'Aman, tidak ada kendala material maupun kecelakaan kerja (Zero Incident).',
      v_user_id
    ) ON CONFLICT (project_id, log_date) DO NOTHING;

    -- Kasbon Lapangan (Petty Cash)
    INSERT INTO petty_cash_transactions (
      project_id, transaction_type, amount, recipient_name, purpose,
      cost_category, status, approved_by, disbursed_at, settlement_amount,
      settlement_notes, created_by
    ) VALUES (
      v_proj_karawang_id, 'kasbon_request', 4500000.00, 'Ahmad Fauzi (Site Engineer)',
      'BBM Genset uji beban kabel, sewa alat ukur Megger 5kV & konsumsi lembur teknisi',
      'overhead', 'settled', v_user_id, now() - INTERVAL '3 days', 4350000.00,
      'Struk BBM Pertamina & nota sewa alat lengkap. Sisa kasbon Rp 150.000 disetor kembali ke kas proyek.',
      v_user_id
    );

  END IF;

  -- ============================================================================
  -- 8. SEED PROYEK EPC 2: EPC PLTS Atap 850 kWp Kawasan Industri Cikarang
  -- ============================================================================
  IF NOT EXISTS (SELECT 1 FROM projects WHERE id = v_proj_cikarang_id) THEN
    INSERT INTO projects (
      id, name, location, capacity_mw, target_cod_date, status, created_by, organization_id
    ) VALUES (
      v_proj_cikarang_id,
      'EPC PLTS Atap 850 kWp Kawasan Industri Cikarang',
      'Kawasan Industri GIIC Cikarang, Jawa Barat',
      0.850,
      CURRENT_DATE + INTERVAL '120 days',
      'ongoing',
      v_user_id,
      v_org_id
    );
  ELSE
    UPDATE projects
    SET name = 'EPC PLTS Atap 850 kWp Kawasan Industri Cikarang',
        organization_id = v_org_id,
        status = 'ongoing'
    WHERE id = v_proj_cikarang_id;
  END IF;

  -- RAB Baseline Proyek 2 (Rp 3.825.000.000)
  SELECT id INTO v_rab2_id FROM rab WHERE project_id = v_proj_cikarang_id LIMIT 1;
  IF v_rab2_id IS NULL THEN
    INSERT INTO rab (
      project_id, version, baseline_type, status, total_amount, notes,
      submitted_at, approved_by, approved_at
    ) VALUES (
      v_proj_cikarang_id,
      1,
      'ORIGINAL_CONTRACT',
      'approved',
      3825000000.00,
      'RAB Kontrak EPC PLTS Rooftop 850 kWp Disetujui',
      now() - INTERVAL '15 days',
      v_user_id,
      now() - INTERVAL '14 days'
    ) RETURNING id INTO v_rab2_id;

    -- Items RAB Proyek 2
    INSERT INTO rab_items (rab_id, wbs_code, item_code, work_package, category, description, volume, unit, unit_price, weight_pct)
    VALUES
      (v_rab2_id, '1.1', 'PV-550W-TIER1', 'ELECTRICAL_DC', 'material', 'Modul Surya Tier-1 Monofacial 550 Wp (1.545 unit)', 1545, 'unit', 1580000.00, 63.82),
      (v_rab2_id, '1.2', 'INV-110KW', 'ELECTRICAL_AC', 'alat', 'String Inverter On-Grid 110 kW 3-Phase IP66 (8 unit)', 8, 'unit', 78000000.00, 16.31),
      (v_rab2_id, '2.1', 'MNT-ROOF-ALU', 'CIVIL', 'material', 'Aluminium Rail & L-Foot Rooftop Clamp (850 kWp)', 850, 'kWp', 420000.00, 9.33),
      (v_rab2_id, '3.1', 'INST-CBL-COMM', 'TESTING_COMMISSIONING', 'upah', 'Instalasi Kabel Surya 4mm2, Panel ACDB, Testing & Komisioning', 1, 'paket', 402650000.00, 10.54);

    -- Progress Log Proyek 2
    INSERT INTO project_progress_logs (
      project_id, period_week, log_date, planned_progress_pct, actual_progress_pct,
      earned_value, actual_cost, cpi, spi, eac, notes, reported_by
    ) VALUES
      (v_proj_cikarang_id, 1, CURRENT_DATE - INTERVAL '7 days', 5.0, 6.0, 229500000.00, 180000000.00, 1.275, 1.200, 3000000000.00, 'Struktur mounting rooftop mulai dipasang di atap pabrik', v_user_id),
      (v_proj_cikarang_id, 2, CURRENT_DATE, 12.0, 14.5, 554625000.00, 420000000.00, 1.320, 1.208, 2897727272.00, 'Pemasangan rail aluminium 50% selesai', v_user_id);
  END IF;

  -- 9. Riwayat Harga Vendor untuk Katalog PT Cipta Daya Engineering
  INSERT INTO rab_item_history (source_project_id, item_code, work_package, category, description, unit, unit_price, organization_id)
  VALUES
    (v_proj_karawang_id, 'EL-TRF-01', 'ELECTRICAL_AC', 'alat', 'Oil-Immersed Distribution Transformer 2000 kVA 20kV/400V', 'unit', 680000000.00, v_org_id),
    (v_proj_karawang_id, 'EL-MDP-01', 'ELECTRICAL_AC', 'alat', 'Main Distribution Panel (MDP) 3200A Form 4b', 'set', 450000000.00, v_org_id),
    (v_proj_karawang_id, 'EL-CBL-MV', 'ELECTRICAL_AC', 'material', 'Medium Voltage Cable N2XSY 3x120 mm2 24kV', 'meter', 485000.00, v_org_id),
    (v_proj_karawang_id, 'EL-CBL-LV', 'ELECTRICAL_AC', 'material', 'Low Voltage Power Cable NYY 4x300 mm2 0.6/1kV', 'meter', 520000.00, v_org_id),
    (v_proj_cikarang_id, 'PV-550W-TIER1', 'ELECTRICAL_DC', 'material', 'Modul Surya Tier-1 Monofacial 550 Wp', 'unit', 1580000.00, v_org_id),
    (v_proj_cikarang_id, 'INV-110KW', 'ELECTRICAL_AC', 'alat', 'String Inverter On-Grid 110 kW 3-Phase IP66', 'unit', 78000000.00, v_org_id)
  ON CONFLICT DO NOTHING;

END $$;
