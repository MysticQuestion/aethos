def test_transit_and_timing_primitive_endpoints(client, natal_payload):
    natal = client.post("/v1/natal-chart", json=natal_payload).json()
    transit_payload = {
        "natalChart": natal,
        "startDatetime": "2026-07-01T00:00:00Z",
        "endDatetime": "2026-08-01T00:00:00Z",
        "intervalHours": 24,
        "requestedTransitBodies": ["mercury", "venus", "mars"],
        "natalTargetBodies": ["sun", "moon", "mars"],
    }
    response = client.post("/v1/transits", json=transit_payload)
    assert response.status_code == 200
    body = response.json()
    assert "transitEvents" in body
    assert body["calculationMetadata"]["inputHash"]

    primitive_response = client.post(
        "/v1/timing-primitives",
        json={
            "natalChart": natal,
            "startDatetime": "2026-07-01T00:00:00Z",
            "endDatetime": "2026-08-01T00:00:00Z",
        },
    )
    assert primitive_response.status_code == 200
    assert "timingPrimitives" in primitive_response.json()


def test_event_endpoint_returns_typed_records(client):
    response = client.post(
        "/v1/events",
        json={
            "startDatetime": "2026-07-01T00:00:00Z",
            "endDatetime": "2026-08-01T00:00:00Z",
            "requestedBodies": ["mercury", "venus"],
            "eventTypes": ["ingress", "retrograde_station", "direct_station"],
            "intervalHours": 24,
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert "ingressEvents" in body
    assert "stationEvents" in body
