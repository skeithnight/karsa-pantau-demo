-- 001_initial_schema.sql
-- Enterprise Database Schema for Karsa Pantau (PLTS Construction Budgeting & Monitoring)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Enums
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'pm', 'estimator', 'approver', 'supervisor');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('planning', 'ongoing', 'completed', 'on_hold');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE rab_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE baseline_type AS ENUM ('ORIGINAL_CONTRACT', 'VARIATION_ORDER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE work_package AS ENUM (
    'CIVIL',
    'ELECTRICAL_DC',
    'ELECTRICAL_AC',
    'SCADA_MONITORING',
    'TESTING_COMMISSIONING',
    'OVERHEAD_PERMITS'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE cost_category AS ENUM ('material', 'upah', 'alat', 'overhead');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE actual_source AS ENUM ('manual', 'ocr');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE ai_insight_type AS ENUM ('anomaly', 'forecast', 'chat_response', 'ocr_extract');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'SUBMIT', 'APPROVE', 'REJECT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'supervisor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity_mw NUMERIC(8, 3) NOT NULL,
  target_cod_date DATE,
  status project_status NOT NULL DEFAULT 'planning',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. RAB Table
CREATE TABLE IF NOT EXISTS rab (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  baseline_type baseline_type NOT NULL DEFAULT 'ORIGINAL_CONTRACT',
  status rab_status NOT NULL DEFAULT 'draft',
  total_amount NUMERIC(18, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  rejection_note TEXT,
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. RAB Items Table (Work Breakdown Structure)
CREATE TABLE IF NOT EXISTS rab_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rab_id UUID NOT NULL REFERENCES rab(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES rab_items(id) ON DELETE SET NULL,
  wbs_code TEXT NOT NULL,
  item_code TEXT NOT NULL,
  work_package work_package NOT NULL,
  category cost_category NOT NULL,
  description TEXT NOT NULL,
  volume NUMERIC(12, 4) NOT NULL,
  unit TEXT NOT NULL,
  unit_price NUMERIC(18, 2) NOT NULL,
  subtotal NUMERIC(18, 2) GENERATED ALWAYS AS (volume * unit_price) STORED,
  weight_pct NUMERIC(6, 3) NOT NULL DEFAULT 0,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. RAB Item History Table (for Vector Search)
CREATE TABLE IF NOT EXISTS rab_item_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  item_code TEXT NOT NULL,
  work_package work_package NOT NULL,
  category cost_category NOT NULL,
  description TEXT NOT NULL,
  unit TEXT NOT NULL,
  unit_price NUMERIC(18, 2) NOT NULL,
  embedding vector(1536),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Actual Entries Table
CREATE TABLE IF NOT EXISTS actual_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rab_item_id UUID NOT NULL REFERENCES rab_items(id),
  item_code TEXT NOT NULL,
  idempotency_key TEXT UNIQUE,
  entry_date DATE NOT NULL,
  qty NUMERIC(12, 4) NOT NULL,
  actual_unit_price NUMERIC(18, 2) NOT NULL,
  total_actual_amount NUMERIC(18, 2) GENERATED ALWAYS AS (qty * actual_unit_price) STORED,
  vendor TEXT NOT NULL,
  invoice_number TEXT,
  description TEXT,
  entered_by UUID NOT NULL REFERENCES users(id),
  source actual_source NOT NULL DEFAULT 'manual',
  is_discrepancy BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Project Progress Logs Table (Kurva S & EVM)
CREATE TABLE IF NOT EXISTS project_progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  period_week INT NOT NULL,
  log_date DATE NOT NULL,
  planned_progress_pct NUMERIC(6, 3) NOT NULL,
  actual_progress_pct NUMERIC(6, 3) NOT NULL,
  earned_value NUMERIC(18, 2) NOT NULL,
  actual_cost NUMERIC(18, 2) NOT NULL,
  cpi NUMERIC(6, 4) NOT NULL,
  spi NUMERIC(6, 4) NOT NULL,
  eac NUMERIC(18, 2) NOT NULL,
  notes TEXT,
  reported_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Manpower Logs Table
CREATE TABLE IF NOT EXISTS manpower_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  rab_item_id UUID REFERENCES rab_items(id) ON DELETE SET NULL,
  team_name TEXT NOT NULL,
  planned_headcount INT NOT NULL,
  actual_headcount INT NOT NULL,
  output_unit_installed NUMERIC(12, 2),
  log_date DATE NOT NULL,
  entered_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Attachments Table
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actual_entry_id UUID REFERENCES actual_entries(id) ON DELETE SET NULL,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. AI Insights Table (Audit Trail)
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type ai_insight_type NOT NULL,
  input_context JSONB NOT NULL,
  output JSONB NOT NULL,
  tokens_used INT,
  model_used TEXT NOT NULL,
  latency_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action audit_action NOT NULL,
  entity_name TEXT NOT NULL,
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_rab_project_version ON rab(project_id, version);
CREATE INDEX IF NOT EXISTS idx_rab_pending_approvals ON rab(status) WHERE status = 'submitted';
CREATE INDEX IF NOT EXISTS idx_rab_items_rab_id ON rab_items(rab_id);
CREATE INDEX IF NOT EXISTS idx_rab_items_wbs_code ON rab_items(wbs_code);
CREATE INDEX IF NOT EXISTS idx_actual_entries_item_date ON actual_entries(rab_item_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_actual_entries_idempotency ON actual_entries(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_progress_logs_project_week ON project_progress_logs(project_id, period_week);
CREATE INDEX IF NOT EXISTS idx_ai_insights_project_type ON ai_insights(project_id, type, created_at DESC);

-- HNSW Vector Indexes
CREATE INDEX IF NOT EXISTS idx_rab_items_embedding_hnsw 
ON rab_items USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_rab_history_embedding_hnsw 
ON rab_item_history USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
