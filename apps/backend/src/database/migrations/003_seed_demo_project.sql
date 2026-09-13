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
      v_rab_id, '1.1', 'PV-550W-BIFACIAL', 'PROCUREMENT_PV', 'MATERIAL',
      'Modul Surya Tier-1 Monocrystalline Bifacial 550 Wp (910 unit)',
      910, 'unit', 1650000.00, 61.248
    ) RETURNING id INTO v_item_modul;

    -- Item 2: Inverter String On-Grid 100 kW
    INSERT INTO rab_items (rab_id, wbs_code, item_code, work_package, category, description, volume, unit, unit_price, weight_pct)
    VALUES (
      v_rab_id, '1.2', 'INV-100KW-STRING', 'PROCUREMENT_INVERTER', 'EQUIPMENT',
      'String Inverter On-Grid 100 kW 3-Phase IP66 (5 unit)',
      5, 'unit', 75000000.00, 15.297
    ) RETURNING id INTO v_item_inverter;

    -- Item 3: Struktur Mounting Rooftop Aluminium & Rel Rail
    INSERT INTO rab_items (rab_id, wbs_code, item_code, work_package, category, description, volume, unit, unit_price, weight_pct)
    VALUES (
      v_rab_id, '2.1', 'MOUNT-ROOF-ALU', 'CIVIL_MOUNTING', 'MATERIAL',
      'Struktur Mounting Aluminium AL6005-T5 Roof Clamp & Rail (500 kWp)',
      500, 'kWp', 450000.00, 9.178
    ) RETURNING id INTO v_item_mounting;

    -- Item 4: Pengkabelan DC/AC, Panel Distribusi & Komisioning
    INSERT INTO rab_items (rab_id, wbs_code, item_code, work_package, category, description, volume, unit, unit_price, weight_pct)
    VALUES (
      v_rab_id, '3.1', 'ELEC-ACDC-COMM', 'ELECTRICAL_INTERCONNECTION', 'SUBCONTRACTOR',
      'Instalasi Kabel DC Surya 4mm2, Kabel AC XLPE, Panel ACDB, Grounding & Testing Komisioning',
      1, 'paket', 350000000.00, 14.277
    ) RETURNING id INTO v_item_kabel;

    -- 5. Masukkan Entri Realisasi Biaya Lapangan (Actual Entries)
    INSERT INTO actual_entries (project_id, rab_item_id, amount, entry_date, description, payment_status, receipt_file_url, created_by, idempotency_key)
    VALUES 
    (
      v_project_id, v_item_modul, 750000000.00, now() - INTERVAL '45 days',
      'Down Payment 50% Pengadaan Modul Surya 910 unit (Invoice Trina Solar #TS-2026-891)',
      'PAID', 'https://storage.karsapantau.com/receipts/demo-pv-invoice.pdf', v_user_id, 'demo-act-1'
    ),
    (
      v_project_id, v_item_inverter, 375000000.00, now() - INTERVAL '30 days',
      'Pelunasan Pembelian 5 Unit Inverter Sungrow 100 kW (Surat Jalan #SG-9921)',
      'PAID', 'https://storage.karsapantau.com/receipts/demo-inv-invoice.pdf', v_user_id, 'demo-act-2'
    ),
    (
      v_project_id, v_item_mounting, 225000000.00, now() - INTERVAL '20 days',
      'Pembayaran Material Rel Rail & Clamp Aluminium Rooftop (Kuitansi Logam #LM-412)',
      'PAID', 'https://storage.karsapantau.com/receipts/demo-mount-invoice.pdf', v_user_id, 'demo-act-3'
    ),
    (
      v_project_id, v_item_kabel, 150000000.00, now() - INTERVAL '10 days',
      'Termin 1 Jasa Elektrikal & Pengkabelan DC Lapangan',
      'APPROVED', 'https://storage.karsapantau.com/receipts/demo-elec-invoice.pdf', v_user_id, 'demo-act-4'
    )
    ON CONFLICT (idempotency_key) DO NOTHING;

    -- 6. Masukkan Log Kurva S Mingguan (Period Week 1 - 6)
    INSERT INTO project_progress_logs (project_id, period_week, planned_progress_pct, actual_progress_pct, log_date, notes)
    VALUES
    (v_project_id, 1, 5.0, 5.5, (now() - INTERVAL '50 days')::date, 'Mobilisasi tim & pengiriman material mounting tahap 1'),
    (v_project_id, 2, 15.0, 16.0, (now() - INTERVAL '43 days')::date, 'Pemasangan roof clamp dan rail selesai 80%'),
    (v_project_id, 3, 30.0, 28.5, (now() - INTERVAL '36 days')::date, 'Kedatangan modul solar bifacial di site cikarang'),
    (v_project_id, 4, 48.0, 46.0, (now() - INTERVAL '29 days')::date, 'Pemasangan modul solar dan perakitan inverter 100 kW'),
    (v_project_id, 5, 65.0, 64.0, (now() - INTERVAL '22 days')::date, 'Pengkabelan string DC combiner dan penarikan kabel AC'),
    (v_project_id, 6, 75.0, 74.0, (now() - INTERVAL '15 days')::date, 'Pemasangan ACDB panel dan grounding sistem proteksi petir')
    ON CONFLICT (project_id, period_week) DO UPDATE SET
      planned_progress_pct = EXCLUDED.planned_progress_pct,
      actual_progress_pct = EXCLUDED.actual_progress_pct;

  END IF;

END $$;
