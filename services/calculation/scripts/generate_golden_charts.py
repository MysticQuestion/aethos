#!/usr/bin/env python3
"""Regenerate tests/fixtures/golden_charts.json from pyswisseph.

Usage:
  pip install pyswisseph
  python scripts/generate_golden_charts.py

Default mode is Moshier (no ephemeris files). For licensed Swiss files:
  AETHOS_SWISS_EPHEMERIS_MODE=files AETHOS_SWISS_EPHEMERIS_PATH=/path/to/ephe \\
    python scripts/generate_golden_charts.py
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import swisseph as swe

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "tests" / "fixtures" / "golden_charts.json"

CASES = [
    ("modern_us_chart", "1992-04-18", "14:30:00", "America/Los_Angeles", 34.0522, -118.2437),
    ("european_chart", "1985-07-21", "09:15:00", "Europe/Paris", 48.8566, 2.3522),
    ("southern_hemisphere_chart", "1978-11-03", "06:45:00", "Australia/Sydney", -33.8688, 151.2093),
    ("historical_dst_sensitive_chart", "1969-07-20", "22:17:00", "America/New_York", 28.3922, -80.6077),
    ("unknown_birth_time_chart", "2000-01-01", None, "America/Chicago", 41.8781, -87.6298),
]

PLANETS = {
    "sun": swe.SUN,
    "moon": swe.MOON,
    "mercury": swe.MERCURY,
    "venus": swe.VENUS,
    "mars": swe.MARS,
    "jupiter": swe.JUPITER,
    "saturn": swe.SATURN,
}


def main() -> None:
    mode = os.environ.get("AETHOS_SWISS_EPHEMERIS_MODE", "moshier").strip().lower()
    path = os.environ.get("AETHOS_SWISS_EPHEMERIS_PATH")
    if mode == "files":
        if not path:
            raise SystemExit("files mode requires AETHOS_SWISS_EPHEMERIS_PATH")
        swe.set_ephe_path(path)
        flag = swe.FLG_SWIEPH
        source = "pyswisseph Swiss files (FLG_SWIEPH)"
        status = "verified_swiss_files_reference"
    else:
        if path and Path(path).exists():
            swe.set_ephe_path(path)
        flag = swe.FLG_MOSEPH
        source = "pyswisseph Moshier (FLG_MOSEPH)"
        status = "verified_moshier_reference"

    charts = []
    for name, date, time, tz, lat, lon in CASES:
        y, m, d = map(int, date.split("-"))
        if time:
            hh, mm, ss = map(int, time.split(":"))
            local = datetime(y, m, d, hh, mm, ss, tzinfo=ZoneInfo(tz))
            birth_time_known = True
        else:
            local = datetime(y, m, d, 12, 0, 0, tzinfo=ZoneInfo(tz))
            birth_time_known = False
        utc = local.astimezone(timezone.utc)
        jd = swe.julday(
            utc.year,
            utc.month,
            utc.day,
            utc.hour + utc.minute / 60 + utc.second / 3600,
        )
        bodies = {}
        for pname, pid in PLANETS.items():
            vals, _flags = swe.calc_ut(jd, pid, flag | swe.FLG_SPEED)
            bodies[pname] = {
                "longitude": round(float(vals[0]), 6),
                "latitude": round(float(vals[1]), 6),
                "speedLongitude": round(float(vals[3]), 6),
                "retrograde": float(vals[3]) < 0,
            }
        angles = None
        houses = None
        if birth_time_known:
            cusps, ascmc = swe.houses(jd, lat, lon, b"P")
            cl = list(cusps)
            house_longs = [round(float(x), 6) for x in (cl[1:13] if len(cl) >= 13 else cl[:12])]
            angles = {
                "ascendant": round(float(ascmc[0]), 6),
                "midheaven": round(float(ascmc[1]), 6),
            }
            houses = house_longs

        charts.append(
            {
                "name": name,
                "status": status,
                "reference": {
                    "source": source,
                    "note": "Regenerate after pyswisseph or ephemeris asset upgrades. CI uses moshier mode.",
                    "toleranceDegrees": 0.02 if birth_time_known else 0.05,
                    "angleToleranceDegrees": 0.05,
                    "sweVersion": getattr(swe, "__version__", "unknown"),
                },
                "input": {
                    "localBirthDate": date,
                    "localBirthTime": time,
                    "birthTimeKnown": birth_time_known,
                    "timezone": tz,
                    "latitude": lat,
                    "longitude": lon,
                    "houseSystem": "placidus" if birth_time_known else "whole_sign",
                    "zodiacMode": "tropical",
                    "requestedBodies": list(PLANETS.keys()),
                },
                "expected": {
                    "normalizedUtc": utc.isoformat(),
                    "julianDay": round(float(jd), 8),
                    "bodies": bodies,
                    "angles": angles,
                    "houseCusps": houses,
                    "housesEmpty": not birth_time_known,
                },
            }
        )

    payload = {
        "schemaVersion": 1,
        "suite": "aethos-swiss-golden-charts",
        "generatedBy": "scripts/generate_golden_charts.py",
        "ephemerisMode": mode if mode in {"moshier", "files"} else "moshier",
        "failurePolicy": (
            "Any body longitude delta > toleranceDegrees fails the build when "
            "AETHOS_CALC_PROVIDER=swiss."
        ),
        "charts": charts,
    }
    OUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {OUT} ({len(charts)} charts, mode={mode})")


if __name__ == "__main__":
    main()
