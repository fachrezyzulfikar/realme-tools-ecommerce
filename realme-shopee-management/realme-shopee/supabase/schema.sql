-- ============================================================
-- REALME SHOPEE STORES MANAGEMENT SYSTEM - SURABAYA
-- Supabase PostgreSQL Schema
-- Created by Fachrezy Zulfikar
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: stores
-- ============================================================
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed stores
INSERT INTO stores (id, name) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Realme Surabaya'),
  ('11111111-0000-0000-0000-000000000002', 'Holyfon'),
  ('11111111-0000-0000-0000-000000000003', 'Devilmimi'),
  ('11111111-0000-0000-0000-000000000004', 'Optima'),
  ('11111111-0000-0000-0000-000000000005', 'Top Gadget'),
  ('11111111-0000-0000-0000-000000000006', 'Prime Gadget'),
  ('11111111-0000-0000-0000-000000000007', 'Storm Bytes')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TABLE: user_profiles (extends Supabase Auth)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- TABLE: ads_reports
-- ============================================================
CREATE TABLE IF NOT EXISTS ads_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  impressions BIGINT DEFAULT 0,
  products_sold INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  revenue NUMERIC(15, 2) DEFAULT 0,
  ctr NUMERIC(6, 4) DEFAULT 0,
  ad_spend NUMERIC(15, 2) DEFAULT 0,
  orders INTEGER DEFAULT 0,
  roas NUMERIC(10, 4) DEFAULT 0,
  best_roas_product_name TEXT DEFAULT '',
  best_roas_value NUMERIC(10, 4) DEFAULT 0,
  lowest_conversion_product_name TEXT DEFAULT '',
  lowest_conversion_cost NUMERIC(15, 2) DEFAULT 0,
  notes TEXT DEFAULT '',
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_ads_reports_store_id ON ads_reports(store_id);
CREATE INDEX IF NOT EXISTS idx_ads_reports_week_start ON ads_reports(week_start DESC);
CREATE INDEX IF NOT EXISTS idx_ads_reports_created_by ON ads_reports(created_by);

-- RLS
ALTER TABLE ads_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read ads_reports" ON ads_reports FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert ads_reports" ON ads_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update ads_reports" ON ads_reports FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete ads_reports" ON ads_reports FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- TABLE: notes
-- ============================================================
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '',
  datetime TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}',
  participants TEXT[] DEFAULT '{}',
  content TEXT DEFAULT '',
  action_items JSONB DEFAULT '[]',
  additional_notes TEXT DEFAULT '',
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for full-text search
CREATE INDEX IF NOT EXISTS idx_notes_title_search ON notes USING gin(to_tsvector('indonesian', title || ' ' || content));
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);

-- RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read notes" ON notes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert notes" ON notes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update notes" ON notes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete notes" ON notes FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- TABLE: reminders
-- ============================================================
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT '',
  datetime TIMESTAMPTZ NOT NULL,
  tags TEXT[] DEFAULT '{}',
  participants TEXT[] DEFAULT '{}',
  content TEXT DEFAULT '',
  action_items JSONB DEFAULT '[]',
  additional_notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_datetime ON reminders(datetime ASC);
CREATE INDEX IF NOT EXISTS idx_reminders_tags ON reminders USING gin(tags);

-- RLS
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read reminders" ON reminders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert reminders" ON reminders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update reminders" ON reminders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete reminders" ON reminders FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================================
-- TABLE: activity_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  changed_by UUID REFERENCES auth.users(id),
  changed_by_name TEXT DEFAULT '',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  changes JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_table_record ON activity_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_changed_by ON activity_logs(changed_by);

-- RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read activity_logs" ON activity_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert activity_logs" ON activity_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ads_reports_updated_at BEFORE UPDATE ON ads_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- REALTIME SUBSCRIPTIONS (enable for live updates)
-- ============================================================
-- Run these in Supabase Dashboard > Database > Replication
-- ALTER PUBLICATION supabase_realtime ADD TABLE ads_reports;
-- ALTER PUBLICATION supabase_realtime ADD TABLE notes;
-- ALTER PUBLICATION supabase_realtime ADD TABLE reminders;
-- ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;
