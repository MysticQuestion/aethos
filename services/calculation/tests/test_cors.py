from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_mystic_sage_origin_is_allowed() -> None:
    response = client.options(
        "/v1/natal-chart",
        headers={
            "Origin": "https://mysticsage.xyz",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "https://mysticsage.xyz"


def test_unknown_origin_is_not_allowed() -> None:
    response = client.options(
        "/v1/natal-chart",
        headers={
            "Origin": "https://untrusted.example",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert "access-control-allow-origin" not in response.headers
