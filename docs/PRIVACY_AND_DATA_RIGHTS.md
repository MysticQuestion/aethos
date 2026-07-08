# Privacy and Data Rights

Aethos is designed to support local export and deletion workflows.

Implemented locally:

- Export local Aethos data as JSON
- Clear profile and birth data
- Clear journal entries
- Clear reports
- Clear timing windows
- Delete all local Aethos data

Sensitive data:

- birth date/time/location
- journal entries
- timing windows
- reports

Local mode:

- Data stays in this browser.
- Clearing browser storage may delete data.

Supabase mode:

- Requires public Supabase anon configuration.
- Production requires auth and RLS.
- Service role keys must never be exposed client-side.

This documentation does not claim GDPR or CCPA compliance.
