-- ============================================================================
-- 003_seed_demo_project.sql: Seed Proyek Demo PLTS 500 kWp untuk Mode Eksplorasi
-- ============================================================================

DO $$
DECLARE
  v_org_id UUID;
  v_user_id UUID;
  v_project_id UUID;
  v_rab_id UUID;
  v_item_modul UUID;
  v_item_inverter UUID;
  v_item_mounting UUID;
  v_item_kabel UUID;
BEGIN
  -- 1. Ambil Default Organization dan User Admin
  SELECT id INTO v_org_id FROM organizations WHERE slug = 'karsa-solar' LIMIT 1;
  IF v_org_id IS NULL THEN
    SELECT id INTO v_org_id FROM organizations LIMIT 1;
  END IF;

  SELECT id INTO v_user_id FROM users WHERE role = 'admin' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM users LIMIT 1;
  END IF;

  -- 2. Buat atau Update Proyek Demo: "PLTS Atap Industri 500 kWp (Demo)"
  SELECT id INTO v_project_id FROM projects WHERE name = 'PLTS Atap Industri 500 kWp (Demo)' LIMIT 1;
  
  IF v_project_id IS NULL THEN
    INSERT INTO projects (id, name, location, capacity_mw, target_cod_date, status, created_by, organization_id)
    VALUES (
      'de300000-0000-0000-0000-000000000500',
      'PLTS Atap Industri 500 kWp (Demo)',
      'Kawasan Industri GIIC Cikarang, Jawa Barat',
      0.500,
      '2026-11-30',
      'ongoing',
      v_user_id,
      v_org_id
    )
    RETURNING id INTO v_project_id;
  ELSE
    UPDATE projects 
    SET organization_id = v_org_id, status = 'ongoing'
    WHERE id = v_project_id;
  END IF;

  -- 3. Buat RAB Approved
  SELECT id INTO v_rab_id FROM rab WHERE project_id = v_project_id LIMIT 1;
  
  IF v_rab_id IS NULL THEN
    INSERT INTO rab (project_id, version, baseline_type, status, total_amount, notes, submitted_at, approved_by, approved_at)
    VALUES (
      v_project_id,
      1,
      'ORIGINAL_CONTRACT',
      'approved',
      2451500000.00,
      'RAB Baseline Proyek PLTS Atap 500 kWp Industri Disetujui Direksi',
      now() - INTERVAL '60 days',
      v_user_id,
      now() - INTERVAL '58 days'
    )
    RETURNING id INTO v_rab_id;

    -- 4. RAB Items (AHSP PLTS)
    -- Item 1: Modul Surya Tier-1 Bifacial 550 Wp
    INSERT INTO rab_items (rab_id, wbs_code, item_code, work_package, category, description, volume, unit, unit_price, weight_pct)
    VALUES (
      v_rab_id, '1.1', 'PV-550W-BIFACIAL', 'ELECTRICAL_DC', 'material',
      'Modul Surya Tier-1 Monocrystalline Bifacial 550 Wp (910 unit)',
      910, 'unit', 1650000.00, 61.248
    ) RETURNING id INTO v_item_modul;

    -- Item 2: Inverter String On-Grid 100 kW
    INSERT INTO rab_items (rab_id, wbs_code, item_code, work_package, category, description, volume, unit, unit_price, weight_pct)
    VALUES (
      v_rab_id, '1.2', 'INV-100KW-STRING', 'ELECTRICAL_AC', 'alat',
      'String Inverter On-Grid 100 kW 3-Phase IP66 (5 unit)',
      5, 'unit', 75000000.00, 15.297
    ) RETURNING id INTO v_item_inverter;

    -- Item 3: Struktur Mounting Rooftop Aluminium & Rel Rail
    INSERT INTO rab_items (rab_id, wbs_code, item_code, work_package, category, description, volume, unit, unit_price, weight_pct)
    VALUES (
      v_rab_id, '2.1', 'MOUNT-ROOF-ALU', 'CIVIL', 'material',
      'Struktur Mounting Aluminium AL6005-T5 Roof Clamp & Rail (500 kWp)',
      500, 'kWp', 450000.00, 9.178
    ) RETURNING id INTO v_item_mounting;

    -- Item 4: Pengkabelan DC/AC, Panel Distribusi & Komisioning
    INSERT INTO rab_items (rab_id, wbs_code, item_code, work_package, category, description, volume, unit, unit_price, weight_pct)
    VALUES (
      v_rab_id, '3.1', 'ELEC-ACDC-COMM', 'TESTING_COMMISSIONING', 'upah',
      'Instalasi Kabel DC Surya 4mm2, Kabel AC XLPE, Panel ACDB, Grounding & Testing Komisioning',
      1, 'paket', 350000000.00, 14.277
    ) RETURNING id INTO v_item_kabel;

    -- 5. Masukkan Entri Realisasi Biaya Lapangan (Actual Entries)
    INSERT INTO actual_entries (rab_item_id, item_code, qty, actual_unit_price, vendor, invoice_number, description, entered_by, source, idempotency_key, entry_date)
    VALUES 
    (
      v_item_modul, 'PV-550W-BIFACIAL', 455, 1648351.65, 'PT Trina Solar Indonesia', 'INV-TS-2026-891',
      'Down Payment 50% Pengadaan Modul Surya 910 unit', v_user_id, 'manual', 'demo-act-1', (now() - INTERVAL '45 days')::date
    ),
    (
      v_item_inverter, 'INV-100KW-STRING', 5, 75000000.00, 'Sungrow Power Supply Ltd', 'SJ-SG-9921',
      'Pelunasan Pembelian 5 Unit Inverter Sungrow 100 kW', v_user_id, 'ocr', 'demo-act-2', (now() - INTERVAL '30 days')::date
    ),
    (
      v_item_mounting, 'MOUNT-ROOF-ALU', 500, 450000.00, 'PT Logam Aluminium Utama', 'KUIT-LM-412',
      'Pembayaran Material Rel Rail & Clamp Aluminium Rooftop', v_user_id, 'manual', 'demo-act-3', (now() - INTERVAL '20 days')::date
    ),
    (
      v_item_kabel, 'ELEC-ACDC-COMM', 0.428, 350000000.00, 'CV Sinar Elektrikal Nusantara', 'TERM-EL-01',
      'Termin 1 Jasa Elektrikal & Pengkabelan DC Lapangan', v_user_id, 'ocr', 'demo-act-4', (now() - INTERVAL '10 days')::date
    )
    ON CONFLICT (idempotency_key) DO NOTHING;

    -- 6. Masukkan Log Kurva S Mingguan (Period Week 1 - 6)
    DELETE FROM project_progress_logs WHERE project_id = v_project_id;

    INSERT INTO project_progress_logs (project_id, period_week, log_date, planned_progress_pct, actual_progress_pct, earned_value, actual_cost, cpi, spi, eac, reported_by, notes)
    VALUES
    (v_project_id, 1, (now() - INTERVAL '50 days')::date, 5.0, 5.5, 134832500, 130000000, 1.037, 1.100, 2400000000, v_user_id, 'Mobilisasi tim & pengiriman material mounting tahap 1'),
    (v_project_id, 2, (now() - INTERVAL '43 days')::date, 15.0, 16.0, 392240000, 385000000, 1.018, 1.066, 2420000000, v_user_id, 'Pemasangan roof clamp dan rail selesai 80%'),
    (v_project_id, 3, (now() - INTERVAL '36 days')::date, 30.0, 28.5, 698677500, 700000000, 0.998, 0.950, 2460000000, v_user_id, 'Kedatangan modul solar bifacial di site cikarang'),
    (v_project_id, 4, (now() - INTERVAL '29 days')::date, 48.0, 46.0, 1127690000, 1120000000, 1.006, 0.958, 2440000000, v_user_id, 'Pemasangan modul solar dan perakitan inverter 100 kW'),
    (v_project_id, 5, (now() - INTERVAL '22 days')::date, 65.0, 64.0, 1568960000, 1540000000, 1.018, 0.984, 2425000000, v_user_id, 'Pengkabelan string DC combiner dan penarikan kabel AC'),
    (v_project_id, 6, (now() - INTERVAL '15 days')::date, 75.0, 74.0, 1814110000, 1765000000, 1.028, 0.986, 2415000000, v_user_id, 'Pemasangan ACDB panel dan grounding sistem proteksi petir');

  END IF;

END $$;
