-- 002_multi_tenant_saas.sql
-- B2B Multi-Tenancy Architecture & Subscription Engine Migration

-- 1. Organizations Table (Tenants)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, suspended, trial
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Organization Members Table (Multi-tenant User Association)
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'pm',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_org_user UNIQUE (organization_id, user_id)
);

-- 3. Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE, -- TRIAL, STARTER, PRO, ENTERPRISE
  name TEXT NOT NULL,
  description TEXT,
  price_monthly NUMERIC(14, 2) NOT NULL DEFAULT 0,
  price_yearly NUMERIC(14, 2) NOT NULL DEFAULT 0,
  max_projects INT NOT NULL DEFAULT 1,
  max_users INT NOT NULL DEFAULT 3,
  max_storage_gb INT NOT NULL DEFAULT 5,
  ai_quota_per_month INT NOT NULL DEFAULT 50,
  features JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'trialing', -- trialing, active, past_due, canceled, expired
  billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- monthly, yearly
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '14 days'),
  trial_ends_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '14 days'),
  canceled_at TIMESTAMPTZ,
  payment_gateway_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Subscription Invoices Table
CREATE TABLE IF NOT EXISTS subscription_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  amount NUMERIC(14, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, failed, canceled
  payment_method TEXT,
  payment_proof_url TEXT,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Add organization_id column to existing entities
ALTER TABLE projects ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE ai_insights ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE rab_item_history ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON subscriptions(organization_id);

-- 7. Seed Default Subscription Plans
INSERT INTO subscription_plans (code, name, description, price_monthly, price_yearly, max_projects, max_users, max_storage_gb, ai_quota_per_month, features)
VALUES 
(
  'TRIAL',
  'Free Trial (14 Hari)',
  'Akses evaluasi penuh untuk mengevaluasi sistem budgeting dan monitoring PLTS.',
  0,
  0,
  1,
  3,
  2,
  50,
  '{"ocr": true, "evm": true, "export_pdf": false, "custom_ahsp": false}'::jsonb
),
(
  'STARTER',
  'Starter EPC',
  'Cocok untuk kontraktor PLTS skala kecil hingga 3 proyek aktif berjalan simultan.',
  1500000,
  15000000,
  3,
  5,
  10,
  150,
  '{"ocr": true, "evm": true, "export_pdf": true, "custom_ahsp": false}'::jsonb
),
(
  'PRO',
  'Professional Developer',
  'Untuk kontraktor dan pengembang PLTS skala menengah dengan multi-tim lapangan.',
  4500000,
  45000000,
  15,
  25,
  50,
  1000,
  '{"ocr": true, "evm": true, "export_pdf": true, "custom_ahsp": true, "anomaly_detection": true}'::jsonb
),
(
  'ENTERPRISE',
  'Enterprise Solar Utility',
  'Skalabilitas tanpa batas untuk korporasi pengembang PLTS utilitas (GW scale).',
  12000000,
  120000000,
  999,
  999,
  500,
  5000,
  '{"ocr": true, "evm": true, "export_pdf": true, "custom_ahsp": true, "anomaly_detection": true, "dedicated_support": true, "sla_999": true}'::jsonb
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  max_projects = EXCLUDED.max_projects,
  max_users = EXCLUDED.max_users,
  features = EXCLUDED.features;

-- 8. Migrate Existing Data to Default Organization "PT Karsa Solar Nusantara"
DO $$
DECLARE
  v_default_org_id UUID;
  v_pro_plan_id UUID;
  v_user RECORD;
BEGIN
  -- Insert default org if not exists
  INSERT INTO organizations (name, slug, status)
  VALUES ('PT Karsa Solar Nusantara', 'karsa-solar', 'active')
  ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_default_org_id;

  -- Get Pro Plan ID
  SELECT id INTO v_pro_plan_id FROM subscription_plans WHERE code = 'PRO' LIMIT 1;

  -- Ensure Pro subscription exists for default org
  INSERT INTO subscriptions (organization_id, plan_id, status, billing_cycle, current_period_start, current_period_end)
  VALUES (v_default_org_id, v_pro_plan_id, 'active', 'yearly', now(), now() + INTERVAL '365 days')
  ON CONFLICT DO NOTHING;

  -- Map all existing users to default org
  FOR v_user IN SELECT id, role FROM users LOOP
    INSERT INTO organization_members (organization_id, user_id, role, is_active)
    VALUES (v_default_org_id, v_user.id, v_user.role, true)
    ON CONFLICT (organization_id, user_id) DO NOTHING;
  END LOOP;

  -- Backfill existing projects without organization_id
  UPDATE projects SET organization_id = v_default_org_id WHERE organization_id IS NULL;
  UPDATE ai_insights SET organization_id = v_default_org_id WHERE organization_id IS NULL;
  UPDATE rab_item_history SET organization_id = v_default_org_id WHERE organization_id IS NULL;

END $$;
