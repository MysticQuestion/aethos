import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture()
def natal_payload() -> dict:
    return {
        "localBirthDate": "1992-04-18",
        "localBirthTime": "14:30:00",
        "birthTimeKnown": True,
        "timezone": "America/Los_Angeles",
        "latitude": 34.0522,
        "longitude": -118.2437,
        "houseSystem": "whole_sign",
        "zodiacMode": "tropical",
        "requestedBodies": ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"],
    }
