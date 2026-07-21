# Single-input engine schema

One intake → many system calculations. Raw outputs are versioned and reconcilable.

## Canonical intake (application)

Matches `AethosBirthIntake` in `src/lib/aethos/types.ts`:

```json
{
  "displayName": "Avery",
  "birthDate": "1992-04-18",
  "birthTime": "14:22",
  "birthTimeConfidence": "exact",
  "birthPlace": {
    "city": "Los Angeles",
    "region": "CA",
    "country": "United States",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "timezone": "America/Los_Angeles"
  },
  "fullBirthName": "Avery Morgan Vale",
  "primaryIntention": "self_understanding",
  "systemsEnabled": {
    "westernAstrology": true,
    "numerology": true,
    "vedicAstrology": true,
    "humanDesign": true,
    "bazi": true,
    "iChing": false
  },
  "consent": {
    "nonDeterministicDisclaimerAccepted": true,
    "aiReflectionAllowed": false,
    "journalAnalysisAllowed": false,
    "practitionerSharingAllowed": false
  }
}
```

## Normalization record

Stored with every calculation run:

| Field | Purpose |
| --- | --- |
| `normalized_utc` | Instant used for ephemeris |
| `timezone` | IANA |
| `latitude` / `longitude` | Chart angles + cartography |
| `birth_time_confidence` | exact \| approximate \| unknown |
| `geocode_quality` | high \| medium \| low \| missing |
| `input_hash` | Reproducibility key |
| `engine_version` | Method version stamp |

## Calculation artifacts

| Artifact | Contents |
| --- | --- |
| `aethos_calculation_runs` | system_key, method_key, input_hash, output_json, confidence |
| `aethos_natal_charts` | chart_data + calculation_metadata |
| `aethos_reconciliation_runs` | theme, axis, net_alignment, contradiction_index, vectors |
| `aethos_decision_casts` | I Ching Decision Lens: question, hexagram, expires_at, journal link |

## Rules

1. Prose is never the source of truth — JSON is.  
2. Re-running with same `input_hash` + `engine_version` must reproduce raw math.  
3. Ephemeral decision casts do not mutate natal `profile_snapshot` vectors permanently.  
4. Export packages intake + raw outputs + reconciliation + journal (see privacy docs).
