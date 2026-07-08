# Database Schema

The working SQL schema is maintained in `supabase/schema.sql`.

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

RLS is enabled for user-owned profile records and child records. RLS is authorization, not zero-knowledge encryption. Journal confidentiality requires separate encryption design.
