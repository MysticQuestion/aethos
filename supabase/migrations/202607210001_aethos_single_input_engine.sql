-- Single-input engine: calculation runs, reconciliation, ephemeral decision casts.

CREATE TABLE IF NOT EXISTS aethos_calculation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  profile_id UUID REFERENCES aethos_profiles(id) ON DELETE CASCADE,
  system_key TEXT NOT NULL,
  method_key TEXT NOT NULL,
  engine_version TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  normalized_utc TIMESTAMPTZ NULL,
  timezone TEXT NULL,
  latitude NUMERIC NULL,
  longitude NUMERIC NULL,
  birth_time_confidence TEXT NULL,
  geocode_quality TEXT NULL,
  output_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence NUMERIC NOT NULL DEFAULT 1.0,
  withheld JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aethos_calc_runs_profile
  ON aethos_calculation_runs(profile_id, system_key, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_aethos_calc_runs_input_hash
  ON aethos_calculation_runs(input_hash);

CREATE TABLE IF NOT EXISTS aethos_reconciliation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  profile_id UUID REFERENCES aethos_profiles(id) ON DELETE CASCADE,
  theme TEXT NOT NULL,
  axis TEXT NOT NULL,
  net_alignment NUMERIC NOT NULL,
  contradiction_index NUMERIC NOT NULL,
  classification TEXT NOT NULL,
  vectors JSONB NOT NULL DEFAULT '[]'::jsonb,
  engine_version TEXT NOT NULL DEFAULT '0.1.0',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aethos_recon_runs_profile
  ON aethos_reconciliation_runs(profile_id, created_at DESC);

-- Ephemeral Decision Lens (I Ching etc.) — does not rewrite natal baseline permanently.
CREATE TABLE IF NOT EXISTS aethos_decision_casts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  profile_id UUID REFERENCES aethos_profiles(id) ON DELETE SET NULL,
  cast_system TEXT NOT NULL DEFAULT 'i_ching',
  user_question TEXT NOT NULL,
  method_key TEXT NOT NULL,
  engine_version TEXT NOT NULL,
  cast_seed TEXT NOT NULL,
  primary_hexagram INTEGER NULL,
  relating_hexagram INTEGER NULL,
  changing_lines JSONB NOT NULL DEFAULT '[]'::jsonb,
  cast_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  synthesis_text TEXT NULL,
  weight NUMERIC NOT NULL DEFAULT 0.95,
  expires_at TIMESTAMPTZ NOT NULL,
  journal_entry_id UUID NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aethos_decision_casts_profile
  ON aethos_decision_casts(profile_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_aethos_decision_casts_expires
  ON aethos_decision_casts(expires_at);

ALTER TABLE aethos_calculation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE aethos_reconciliation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE aethos_decision_casts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own calculation runs"
  ON aethos_calculation_runs FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users manage own reconciliation runs"
  ON aethos_reconciliation_runs FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users manage own decision casts"
  ON aethos_decision_casts FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
