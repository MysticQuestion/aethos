from app.calculations.stations import detect_station, is_retrograde


def test_retrograde_detection():
    assert is_retrograde(-0.01) is True
    assert is_retrograde(0.01) is False


def test_station_detection():
    assert detect_station(0.2, -0.1).value == "retrograde_station"
    assert detect_station(-0.2, 0.1).value == "direct_station"
