from datetime import datetime, timezone
from app.calculations.aspects import calculate_aspect, shortest_angular_distance
from app.calculations.planets import demo_position
from app.models.astrology import Planet
from app.models.requests import OrbConfig


def test_wraparound_distance():
    assert shortest_angular_distance(359, 1) == 2
    assert shortest_angular_distance(5, 355) == 10
    assert shortest_angular_distance(179, 1) == 178


def test_calculate_aspect_wraparound_conjunction():
    a = demo_position(Planet.sun, datetime(2026, 1, 1, tzinfo=timezone.utc), "test", "1")
    b = a.model_copy(update={"body": Planet.moon, "longitude": (a.longitude + 1) % 360})
    aspect = calculate_aspect(a, b, OrbConfig())
    assert aspect is not None
    assert aspect.aspectType.value == "conjunction"
    assert aspect.withinOrb is True
