CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS aethos_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  display_name TEXT,
  primary_intention TEXT,
  preferred_systems JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aethos_birth_intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  profile_id UUID REFERENCES aethos_profiles(id) ON DELETE CASCADE,
  birth_date DATE NOT NULL,
  birth_time TIME NULL,
  birth_time_known BOOLEAN NOT NULL DEFAULT false,
  birth_location_label TEXT,
  latitude NUMERIC NULL,
  longitude NUMERIC NULL,
  timezone TEXT NULL,
  original_input JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aethos_natal_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  profile_id UUID REFERENCES aethos_profiles(id) ON DELETE CASCADE,
  birth_intake_id UUID REFERENCES aethos_birth_intakes(id) ON DELETE SET NULL,
  calculation_metadata JSONB NOT NULL,
  chart_data JSONB NOT NULL,
  data_quality_warnings JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aethos_transit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  profile_id UUID REFERENCES aethos_profiles(id) ON DELETE CASCADE,
  natal_chart_id UUID REFERENCES aethos_natal_charts(id) ON DELETE CASCADE,
  calculation_metadata JSONB NOT NULL,
  event_type TEXT,
  transit_body TEXT,
  natal_target TEXT,
  aspect_type TEXT,
  orb NUMERIC NULL,
  exact_at TIMESTAMPTZ NULL,
  starts_at TIMESTAMPTZ NULL,
  ends_at TIMESTAMPTZ NULL,
  theme_contributions JSONB DEFAULT '{}'::jsonb,
  event_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aethos_timing_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  profile_id UUID REFERENCES aethos_profiles(id) ON DELETE CASCADE,
  natal_chart_id UUID REFERENCES aethos_natal_charts(id) ON DELETE SET NULL,
  calculation_metadata JSONB NOT NULL,
  title TEXT,
  primary_theme TEXT,
  secondary_themes JSONB DEFAULT '[]'::jsonb,
  starts_at TIMESTAMPTZ,
  peaks_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  intensity_score NUMERIC,
  confidence_score NUMERIC,
  source_event_ids JSONB DEFAULT '[]'::jsonb,
  interpretive_summary TEXT,
  suggested_reflection TEXT,
  recommended_action_experiment TEXT,
  responsible_use_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aethos_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  profile_id UUID REFERENCES aethos_profiles(id) ON DELETE CASCADE,
  mood NUMERIC NULL,
  stress NUMERIC NULL,
  focus NUMERIC NULL,
  sleep_quality NUMERIC NULL,
  social_connection NUMERIC NULL,
  conflict_level NUMERIC NULL,
  creativity NUMERIC NULL,
  decision_pressure NUMERIC NULL,
  body_energy NUMERIC NULL,
  clarity NUMERIC NULL,
  free_text TEXT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  linked_timing_window_ids JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aethos_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  profile_id UUID REFERENCES aethos_profiles(id) ON DELETE CASCADE,
  report_type TEXT,
  report_version TEXT,
  calculation_metadata JSONB,
  source_timing_window_ids JSONB DEFAULT '[]'::jsonb,
  source_journal_entry_ids JSONB DEFAULT '[]'::jsonb,
  report_markdown TEXT,
  report_json JSONB,
  responsible_use_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aethos_action_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  profile_id UUID REFERENCES aethos_profiles(id) ON DELETE CASCADE,
  timing_window_id UUID REFERENCES aethos_timing_windows(id) ON DELETE SET NULL,
  experiment_type TEXT,
  intention TEXT,
  status TEXT,
  outcome_note TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aethos_profiles_user_id ON aethos_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_aethos_birth_intakes_profile_id ON aethos_birth_intakes(profile_id);
CREATE INDEX IF NOT EXISTS idx_aethos_natal_charts_profile_id ON aethos_natal_charts(profile_id);
CREATE INDEX IF NOT EXISTS idx_aethos_transit_events_natal_chart_id ON aethos_transit_events(natal_chart_id);
CREATE INDEX IF NOT EXISTS idx_aethos_transit_events_exact_at ON aethos_transit_events(exact_at);
CREATE INDEX IF NOT EXISTS idx_aethos_timing_windows_profile_id ON aethos_timing_windows(profile_id);
CREATE INDEX IF NOT EXISTS idx_aethos_timing_windows_dates ON aethos_timing_windows(starts_at, peaks_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_aethos_journal_entries_profile_created ON aethos_journal_entries(profile_id, created_at);
CREATE INDEX IF NOT EXISTS idx_aethos_reports_profile_id ON aethos_reports(profile_id);
CREATE INDEX IF NOT EXISTS idx_aethos_action_experiments_timing_window_id ON aethos_action_experiments(timing_window_id);

ALTER TABLE aethos_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE aethos_birth_intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE aethos_natal_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE aethos_transit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE aethos_timing_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE aethos_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE aethos_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE aethos_action_experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own Aethos profiles"
  ON aethos_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own Aethos child records"
  ON aethos_birth_intakes FOR ALL
  USING (profile_id IN (SELECT id FROM aethos_profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM aethos_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users manage own Aethos charts"
  ON aethos_natal_charts FOR ALL
  USING (profile_id IN (SELECT id FROM aethos_profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM aethos_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users manage own Aethos transit events"
  ON aethos_transit_events FOR ALL
  USING (profile_id IN (SELECT id FROM aethos_profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM aethos_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users manage own Aethos timing windows"
  ON aethos_timing_windows FOR ALL
  USING (profile_id IN (SELECT id FROM aethos_profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM aethos_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users manage own Aethos journal entries"
  ON aethos_journal_entries FOR ALL
  USING (profile_id IN (SELECT id FROM aethos_profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM aethos_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users manage own Aethos reports"
  ON aethos_reports FOR ALL
  USING (profile_id IN (SELECT id FROM aethos_profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM aethos_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users manage own Aethos action experiments"
  ON aethos_action_experiments FOR ALL
  USING (profile_id IN (SELECT id FROM aethos_profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM aethos_profiles WHERE user_id = auth.uid()));
