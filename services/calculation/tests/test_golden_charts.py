"""Swiss / Moshier golden chart suite.

Fails the build if any planet longitude drifts beyond the fixture tolerance when
AETHOS_CALC_PROVIDER=swiss (default for this module).
"""

from __future__ import annotations

import json
import math
import os
from pathlib import Path

import pytest

from app.models.astrology import Planet
from app.models.requests import NatalChartRequest
from app.providers import get_provider, reset_provider_cache
from app.services.natal_service import create_natal_chart, normalize_birth_datetime

FIXTURE_PATH = Path(__file__).parent / "fixtures" / "golden_charts.json"

pytestmark = pytest.mark.golden


def _angular_delta(a: float, b: float) -> float:
    """Smallest absolute difference on a 360° circle."""
    return abs((a - b + 180) % 360 - 180)


def _load_suite() -> dict:
    with FIXTURE_PATH.open(encoding="utf-8") as handle:
        return json.load(handle)


@pytest.fixture(scope="module", autouse=True)
def _swiss_moshier_env():
    previous = {
        "AETHOS_CALC_PROVIDER": os.environ.get("AETHOS_CALC_PROVIDER"),
        "AETHOS_SWISS_EPHEMERIS_MODE": os.environ.get("AETHOS_SWISS_EPHEMERIS_MODE"),
        "AETHOS_ALLOW_DEMO_FALLBACK": os.environ.get("AETHOS_ALLOW_DEMO_FALLBACK"),
    }
    os.environ["AETHOS_CALC_PROVIDER"] = "swiss"
    os.environ["AETHOS_SWISS_EPHEMERIS_MODE"] = "moshier"
    os.environ["AETHOS_ALLOW_DEMO_FALLBACK"] = "false"
    reset_provider_cache()
    yield
    for key, value in previous.items():
        if value is None:
            os.environ.pop(key, None)
        else:
            os.environ[key] = value
    reset_provider_cache()


@pytest.fixture(scope="module")
def swiss_provider():
    provider = get_provider()
    status = provider.status()
    if status.get("status") != "available" or status.get("calculationMode") != "swiss":
        pytest.skip(f"Swiss provider unavailable for golden suite: {status}")
    return provider


@pytest.fixture(scope="module")
def golden_suite() -> dict:
    assert FIXTURE_PATH.exists(), "golden_charts.json missing — run scripts/generate_golden_charts.py"
    return _load_suite()


def test_golden_fixture_schema(golden_suite):
    assert golden_suite["schemaVersion"] == 1
    assert golden_suite["ephemerisMode"] == "moshier"
    assert len(golden_suite["charts"]) >= 5
    names = {chart["name"] for chart in golden_suite["charts"]}
    assert {
        "modern_us_chart",
        "european_chart",
        "southern_hemisphere_chart",
        "historical_dst_sensitive_chart",
        "unknown_birth_time_chart",
    }.issubset(names)


@pytest.mark.parametrize(
    "chart_name",
    [
        "modern_us_chart",
        "european_chart",
        "southern_hemisphere_chart",
        "historical_dst_sensitive_chart",
        "unknown_birth_time_chart",
    ],
)
def test_golden_chart_body_longitudes(chart_name, golden_suite, swiss_provider):
    chart = next(item for item in golden_suite["charts"] if item["name"] == chart_name)
    payload = dict(chart["input"])
    expected = chart["expected"]
    tol = float(chart["reference"]["toleranceDegrees"])

    request = NatalChartRequest.model_validate(payload)
    response = create_natal_chart(request)

    assert response.calculationMetadata.calculationMode.value == "swiss"
    assert response.normalizedUtc == expected["normalizedUtc"]

    utc = normalize_birth_datetime(request)
    jd = swiss_provider.planet_position(Planet.sun, utc).julianDay
    assert abs(jd - expected["julianDay"]) < 1e-5

    by_body = {pos.body.value: pos for pos in response.planetaryPositions}
    failures: list[str] = []
    for body_name, exp in expected["bodies"].items():
        pos = by_body[body_name]
        delta = _angular_delta(pos.longitude, exp["longitude"])
        if delta > tol:
            failures.append(f"{body_name}: Δlon={delta:.6f}° > {tol}° (got {pos.longitude}, exp {exp['longitude']})")
        if pos.retrograde != exp["retrograde"]:
            failures.append(f"{body_name}: retrograde got {pos.retrograde}, exp {exp['retrograde']}")
        speed_delta = abs(pos.speedLongitude - exp["speedLongitude"])
        if speed_delta > max(tol, 0.01):
            failures.append(
                f"{body_name}: Δspeed={speed_delta:.6f} > {max(tol, 0.01)} "
                f"(got {pos.speedLongitude}, exp {exp['speedLongitude']})"
            )

    assert not failures, "Golden chart drift:\n" + "\n".join(failures)


@pytest.mark.parametrize(
    "chart_name",
    [
        "modern_us_chart",
        "european_chart",
        "southern_hemisphere_chart",
        "historical_dst_sensitive_chart",
    ],
)
def test_golden_chart_angles_and_houses(chart_name, golden_suite):
    chart = next(item for item in golden_suite["charts"] if item["name"] == chart_name)
    payload = dict(chart["input"])
    expected = chart["expected"]
    angle_tol = float(chart["reference"].get("angleToleranceDegrees", 0.05))

    request = NatalChartRequest.model_validate(payload)
    response = create_natal_chart(request)

    assert response.houses, "houses required when birth time known"
    assert expected["angles"] is not None
    assert response.angles.ascendant is not None
    assert response.angles.midheaven is not None

    asc_delta = _angular_delta(float(response.angles.ascendant), expected["angles"]["ascendant"])
    mc_delta = _angular_delta(float(response.angles.midheaven), expected["angles"]["midheaven"])
    assert asc_delta <= angle_tol, f"ASC Δ={asc_delta:.6f}°"
    assert mc_delta <= angle_tol, f"MC Δ={mc_delta:.6f}°"

    assert len(response.houses) == 12
    for house, exp_lon in zip(response.houses, expected["houseCusps"], strict=True):
        delta = _angular_delta(house.longitude, exp_lon)
        assert delta <= angle_tol, f"house {house.house} Δ={delta:.6f}°"


def test_unknown_birth_time_golden_withholds_houses(golden_suite):
    chart = next(item for item in golden_suite["charts"] if item["name"] == "unknown_birth_time_chart")
    request = NatalChartRequest.model_validate(chart["input"])
    response = create_natal_chart(request)
    assert response.houses == []
    assert chart["expected"]["housesEmpty"] is True
    assert any("Birth time unknown" in warning for warning in response.warnings)


def test_demo_provider_must_not_satisfy_golden_tolerance(golden_suite):
    """Safety: demo math must not accidentally pass as Swiss accuracy."""
    previous_provider = os.environ.get("AETHOS_CALC_PROVIDER")
    os.environ["AETHOS_CALC_PROVIDER"] = "demo"
    reset_provider_cache()
    try:
        chart = next(item for item in golden_suite["charts"] if item["name"] == "modern_us_chart")
        request = NatalChartRequest.model_validate(chart["input"])
        response = create_natal_chart(request)
        assert response.calculationMetadata.calculationMode.value == "demo"
        sun = next(pos for pos in response.planetaryPositions if pos.body.value == "sun")
        delta = _angular_delta(sun.longitude, chart["expected"]["bodies"]["sun"]["longitude"])
        assert delta > 0.5, "Demo positions unexpectedly match Moshier golden sun — check provider routing"
    finally:
        if previous_provider is None:
            os.environ.pop("AETHOS_CALC_PROVIDER", None)
        else:
            os.environ["AETHOS_CALC_PROVIDER"] = previous_provider
        reset_provider_cache()
