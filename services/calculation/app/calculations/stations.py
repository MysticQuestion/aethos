from app.models.astrology import StationType


def is_retrograde(speed_longitude: float) -> bool:
    return speed_longitude < 0


def detect_station(previous_speed: float, current_speed: float) -> StationType | None:
    if previous_speed > 0 >= current_speed:
        return StationType.retrograde_station
    if previous_speed < 0 <= current_speed:
        return StationType.direct_station
    if abs(current_speed) <= 0.0001:
        return StationType.direct_station if previous_speed < 0 else StationType.retrograde_station
    return None
