from app.calculations.zodiac import decimal_to_zodiac, normalize_longitude
from app.models.astrology import Angles, HouseCusp, HouseSystem


def calculate_demo_houses(seed_longitude: float, house_system: HouseSystem, birth_time_known: bool) -> tuple[list[HouseCusp], Angles, list[str]]:
    if not birth_time_known:
        return [], Angles(), ["Birth time unknown: houses and angles are disabled."]
    ascendant = normalize_longitude(seed_longitude)
    cusps = [
        HouseCusp(house=index + 1, longitude=normalize_longitude(ascendant + index * 30), zodiacPosition=decimal_to_zodiac(ascendant + index * 30))
        for index in range(12)
    ]
    midheaven = normalize_longitude(ascendant + 90)
    angles = Angles(
        ascendant=ascendant,
        midheaven=midheaven,
        descendant=normalize_longitude(ascendant + 180),
        ic=normalize_longitude(midheaven + 180),
    )
    return cusps, angles, [f"{house_system.value} houses are demo approximations unless Swiss Ephemeris is active."]
