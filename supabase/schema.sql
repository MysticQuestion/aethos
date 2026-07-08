CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE birth_intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_time_confidence TEXT NOT NULL CHECK (
    birth_time_confidence IN ('exact', 'approximate', 'unknown')
  ),
  birth_city TEXT,
  birth_region TEXT,
  birth_country TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  timezone TEXT,
  full_birth_name TEXT,
  chosen_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  consent_value BOOLEAN NOT NULL,
  consent_version TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE calculation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  system_key TEXT NOT NULL,
  method_key TEXT NOT NULL,
  engine_version TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  output_json JSONB NOT NULL,
  confidence NUMERIC NOT NULL DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE semantic_fragments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbolic_key TEXT UNIQUE NOT NULL,
  source_system TEXT NOT NULL,
  source_object TEXT NOT NULL,
  axis TEXT NOT NULL,
  themes TEXT[] NOT NULL,
  direction NUMERIC NOT NULL,
  default_weight NUMERIC NOT NULL,
  confidence_sensitivity TEXT NOT NULL,
  fragments JSONB NOT NULL,
  interpretation_limits TEXT[],
  version TEXT NOT NULL DEFAULT '0.2',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reconciliation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  theme TEXT NOT NULL,
  axis TEXT NOT NULL,
  net_alignment NUMERIC NOT NULL,
  contradiction_index NUMERIC NOT NULL,
  classification TEXT NOT NULL,
  vectors JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE insight_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reconciliation_run_id UUID REFERENCES reconciliation_runs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  confidence_label TEXT NOT NULL,
  classification TEXT NOT NULL,
  engine_drawer_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE timing_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  theme TEXT NOT NULL,
  confidence TEXT NOT NULL,
  summary TEXT NOT NULL,
  reflection_prompt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  title TEXT NOT NULL,
  output_markdown TEXT NOT NULL,
  output_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL,
  encrypted_body TEXT,
  plaintext_body TEXT,
  encryption_mode TEXT NOT NULL DEFAULT 'standard',
  semantic_tags TEXT[],
  vector_tags JSONB,
  ai_analysis_allowed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (
    NOT (
      encryption_mode = 'private'
      AND plaintext_body IS NOT NULL
    )
  ),
  CHECK (
    NOT (
      encryption_mode = 'private'
      AND ai_analysis_allowed = true
    )
  )
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE birth_intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE timing_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profiles"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own profiles"
  ON profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage child profile records"
  ON birth_intakes FOR ALL
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage consent logs"
  ON consent_logs FOR ALL
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can read calculation runs"
  ON calculation_runs FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can read reconciliation runs"
  ON reconciliation_runs FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can read insight cards"
  ON insight_cards FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage timing windows"
  ON timing_windows FOR ALL
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage reports"
  ON reports FOR ALL
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage journal entries"
  ON journal_entries FOR ALL
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
