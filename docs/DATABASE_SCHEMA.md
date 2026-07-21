# Database Schema

The initial local schema is maintained in `supabase/schema.sql`.

The production-oriented backend data-layer migration is:

- `supabase/migrations/202607080001_aethos_backend_ephemeris_data_layer.sql`

Primary tables:

- `profiles`
- `birth_intakes`
- `consent_logs`
- `calculation_runs`
- `semantic_fragments`
- `reconciliation_runs`
- `insight_cards`
- `timing_windows`
- `reports`
- `journal_entries`

Production `aethos_*` tables:

- `aethos_profiles`
- `aethos_birth_intakes`
- `aethos_natal_charts`
- `aethos_transit_events`
- `aethos_timing_windows`
- `aethos_journal_entries`
- `aethos_reports`
- `aethos_action_experiments`
- `aethos_calculation_runs` (single-input engine)
- `aethos_reconciliation_runs`
- `aethos_decision_casts` (ephemeral Decision Lens)

See also `docs/SINGLE_INPUT_SCHEMA.md` and migration `202607210001_aethos_single_input_engine.sql`.

RLS is enabled for user-owned profile records and child records. RLS is authorization, not zero-knowledge encryption. Journal confidentiality requires separate encryption design.
