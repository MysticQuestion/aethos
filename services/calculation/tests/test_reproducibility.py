from app.metadata import create_input_hash


def test_canonical_hash_is_order_independent():
    assert create_input_hash({"b": 2, "a": 1}) == create_input_hash({"a": 1, "b": 2})


def test_demo_chart_reproducible_except_request_metadata(client, natal_payload):
    one = client.post("/v1/natal-chart", json=natal_payload).json()
    two = client.post("/v1/natal-chart", json=natal_payload).json()
    assert one["planetaryPositions"] == two["planetaryPositions"]
    assert one["calculationMetadata"]["inputHash"] == two["calculationMetadata"]["inputHash"]
    assert one["calculationMetadata"]["calculationId"] != two["calculationMetadata"]["calculationId"]
