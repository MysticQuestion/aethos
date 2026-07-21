-- Profile snapshot for authenticated dual-mode sync (local demo remains default).
ALTER TABLE aethos_profiles
  ADD COLUMN IF NOT EXISTS profile_snapshot JSONB DEFAULT '{}'::jsonb;

ALTER TABLE aethos_profiles
  ADD COLUMN IF NOT EXISTS is_sample BOOLEAN DEFAULT false;

-- Align journal rows with client JournalEntry shape when free-form body is used.
ALTER TABLE aethos_journal_entries
  ADD COLUMN IF NOT EXISTS entry_theme TEXT;

ALTER TABLE aethos_journal_entries
  ADD COLUMN IF NOT EXISTS mood_label TEXT;

ALTER TABLE aethos_journal_entries
  ADD COLUMN IF NOT EXISTS decision_context TEXT;

ALTER TABLE aethos_journal_entries
  ADD COLUMN IF NOT EXISTS extracted_themes JSONB DEFAULT '[]'::jsonb;

ALTER TABLE aethos_reports
  ADD COLUMN IF NOT EXISTS title TEXT;

-- One active birth intake row per profile for simple upsert sync.
CREATE UNIQUE INDEX IF NOT EXISTS idx_aethos_birth_intakes_profile_unique
  ON aethos_birth_intakes(profile_id);
