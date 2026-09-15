-- ============================================================================
-- 005_seed_cipta_daya_starter.sql: Starter EPC PT Cipta Daya Engineering & Admin User
-- Clean production account onboarding (0 dummy projects, 0 mock entries)
-- ============================================================================

DO $$
DECLARE
  v_org_id UUID;
  v_plan_id UUID;
  v_user_id UUID;
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

  -- Clean: Clean any historical seeded projects if they were previously created for this org
  DELETE FROM actual_entries WHERE rab_item_id IN (
    SELECT ri.id FROM rab_items ri
    JOIN rab r ON ri.rab_id = r.id
    JOIN projects p ON r.project_id = p.id
    WHERE p.organization_id = v_org_id
  );
  DELETE FROM manpower_logs WHERE project_id IN (SELECT id FROM projects WHERE organization_id = v_org_id);
  DELETE FROM attachments WHERE project_id IN (SELECT id FROM projects WHERE organization_id = v_org_id);
  DELETE FROM ai_insights WHERE project_id IN (SELECT id FROM projects WHERE organization_id = v_org_id);
  DELETE FROM rab_items WHERE rab_id IN (SELECT r.id FROM rab r JOIN projects p ON r.project_id = p.id WHERE p.organization_id = v_org_id);
  DELETE FROM rab WHERE project_id IN (SELECT id FROM projects WHERE organization_id = v_org_id);
  DELETE FROM daily_site_logs WHERE project_id IN (SELECT id FROM projects WHERE organization_id = v_org_id);
  DELETE FROM petty_cash_transactions WHERE project_id IN (SELECT id FROM projects WHERE organization_id = v_org_id);
  DELETE FROM rab_item_history WHERE organization_id = v_org_id;
  DELETE FROM project_progress_logs WHERE project_id IN (SELECT id FROM projects WHERE organization_id = v_org_id);
  DELETE FROM projects WHERE organization_id = v_org_id;

END $$;
