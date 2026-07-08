def test_natal_endpoint_returns_demo_chart(client, natal_payload):
    response = client.post("/v1/natal-chart", json=natal_payload)
    assert response.status_code == 200
    body = response.json()
    assert body["normalizedUtc"].endswith("+00:00")
    assert len(body["planetaryPositions"]) == len(natal_payload["requestedBodies"])
    assert body["calculationMetadata"]["calculationMode"] == "demo"
    assert body["houses"]


def test_unknown_birth_time_disables_houses(client, natal_payload):
    natal_payload["birthTimeKnown"] = False
    natal_payload["localBirthTime"] = None
    response = client.post("/v1/natal-chart", json=natal_payload)
    assert response.status_code == 200
    body = response.json()
    assert body["houses"] == []
    assert any("Birth time unknown" in warning for warning in body["warnings"])


def test_timezone_abbreviation_rejected(client, natal_payload):
    natal_payload["timezone"] = "PST"
    response = client.post("/v1/natal-chart", json=natal_payload)
    assert response.status_code == 422
