import os

import pytest

from app.providers import reset_provider_cache


@pytest.fixture()
def acg_payload() -> dict:
    return {
        "localBirthDate": "1992-04-18",
        "localBirthTime": "14:30:00",
        "birthTimeKnown": True,
        "timezone": "America/Los_Angeles",
        "latitude": 34.0522,
        "longitude": -118.2437,
        "houseSystem": "placidus",
        "zodiacMode": "tropical",
        "requestedBodies": ["sun", "moon", "mars"],
        "lineTypes": ["ASC", "DSC", "MC", "IC"],
        "longitudeStepDegrees": 2.0,
        "sampleLatitudes": [34.0522],
    }


def test_astrocartography_withholds_without_birth_time(client, acg_payload):
    acg_payload["birthTimeKnown"] = False
    acg_payload["localBirthTime"] = None
    response = client.post("/v1/astrocartography", json=acg_payload)
    assert response.status_code == 200
    body = response.json()
    assert body["lines"] == []
    assert any("ASC" in item or "lines" in item.lower() for item in body["withheld"])
    assert "reflective" in body["responsibleUseNote"].lower() or "not commands" in body["responsibleUseNote"].lower()


def test_astrocartography_returns_lines_for_known_time(client, acg_payload):
    response = client.post("/v1/astrocartography", json=acg_payload)
    assert response.status_code == 200
    body = response.json()
    assert body["normalizedUtc"].endswith("+00:00")
    assert len(body["lines"]) == 3 * 4  # 3 bodies × 4 line types
    types = {line["lineType"] for line in body["lines"]}
    assert types == {"ASC", "DSC", "MC", "IC"}
    for line in body["lines"]:
        assert -180 <= line["geographicLongitude"] <= 180
        assert line["residualOrbDegrees"] >= 0
        assert line["methodKey"]


def test_astrocartography_reproducible(client, acg_payload):
    a = client.post("/v1/astrocartography", json=acg_payload).json()
    b = client.post("/v1/astrocartography", json=acg_payload).json()
    assert a["lines"] == b["lines"]


def test_astrocartography_rejects_bad_line_type(client, acg_payload):
    acg_payload["lineTypes"] = ["VERTEX"]
    response = client.post("/v1/astrocartography", json=acg_payload)
    assert response.status_code == 422


def test_relocation_chart_endpoint(client, natal_payload):
    natal_payload["latitude"] = 40.7128
    natal_payload["longitude"] = -74.0060
    natal_payload["timezone"] = "America/New_York"
    natal_payload["houseSystem"] = "placidus"
    response = client.post("/v1/relocation-chart", json=natal_payload)
    assert response.status_code == 200
    body = response.json()
    assert "relocationLabel" in body
    assert body["houses"]


def test_swiss_astrocartography_if_available(client, acg_payload):
    previous = {
        "AETHOS_CALC_PROVIDER": os.environ.get("AETHOS_CALC_PROVIDER"),
        "AETHOS_SWISS_EPHEMERIS_MODE": os.environ.get("AETHOS_SWISS_EPHEMERIS_MODE"),
        "AETHOS_ALLOW_DEMO_FALLBACK": os.environ.get("AETHOS_ALLOW_DEMO_FALLBACK"),
    }
    os.environ["AETHOS_CALC_PROVIDER"] = "swiss"
    os.environ["AETHOS_SWISS_EPHEMERIS_MODE"] = "moshier"
    os.environ["AETHOS_ALLOW_DEMO_FALLBACK"] = "false"
    reset_provider_cache()
    try:
        response = client.post("/v1/astrocartography", json=acg_payload)
        if response.status_code != 200:
            pytest.skip("Swiss path unavailable")
        body = response.json()
        mode = body["calculationMetadata"]["calculationMode"]
        if mode != "swiss":
            pytest.skip("Provider fell back from swiss")
        assert len(body["lines"]) >= 4
        sun_mc = next(
            line
            for line in body["lines"]
            if line["body"] == "sun" and line["lineType"] == "MC"
        )
        # Residual should be small with 2° sampling under Swiss houses.
        assert sun_mc["residualOrbDegrees"] < 3.0
    finally:
        for key, value in previous.items():
            if value is None:
                os.environ.pop(key, None)
            else:
                os.environ[key] = value
        reset_provider_cache()
