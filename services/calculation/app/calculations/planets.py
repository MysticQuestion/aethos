from datetime import datetime, timezone
from hashlib import sha256
from app.calculations.stations import is_retrograde
from app.calculations.zodiac import decimal_to_zodiac, normalize_longitude
from app.models.astrology import CalculationMode, CelestialPosition, Planet, ProviderMetadata

PLANET_OFFSETS: dict[Planet, float] = {
    Planet.sun: 0,
    Planet.moon: 27.3,
    Planet.mercury: 48,
    Planet.venus: 76,
    Planet.mars: 112,
    Planet.jupiter: 154,
    Planet.saturn: 196,
    Planet.uranus: 238,
    Planet.neptune: 281,
    Planet.pluto: 318,
}


def stable_seed(payload: str) -> int:
    return int(sha256(payload.encode("utf-8")).hexdigest()[:12], 16)


def julian_day(dt: datetime) -> float:
    utc = dt.astimezone(timezone.utc)
    year = utc.year
    month = utc.month
    day = utc.day + (utc.hour + utc.minute / 60 + utc.second / 3600) / 24
    if month <= 2:
        year -= 1
        month += 12
    a = year // 100
    b = 2 - a + a // 4
    return int(365.25 * (year + 4716)) + int(30.6001 * (month + 1)) + day + b - 1524.5


def demo_position(body: Planet, dt: datetime, provider_id: str, provider_version: str) -> CelestialPosition:
    seed = stable_seed(f"{body.value}:{dt.isoformat()}")
    longitude = normalize_longitude((seed % 3600000) / 10000 + PLANET_OFFSETS[body])
    latitude = ((seed // 17) % 160000) / 10000 - 8
    distance = 0.3 + ((seed // 29) % 30000) / 10000
    speed_longitude = (((seed // 41) % 2400) - 800) / 1000
    speed_latitude = (((seed // 53) % 200) - 100) / 1000
    speed_distance = (((seed // 67) % 200) - 100) / 10000
    return CelestialPosition(
        body=body,
        julianDay=julian_day(dt),
        longitude=longitude,
        latitude=latitude,
        distanceAu=distance,
        speedLongitude=speed_longitude,
        speedLatitude=speed_latitude,
        speedDistance=speed_distance,
        retrograde=is_retrograde(speed_longitude),
        stationary=abs(speed_longitude) <= 0.0001,
        zodiacPosition=decimal_to_zodiac(longitude),
        providerMetadata=ProviderMetadata(
            providerId=provider_id,
            providerVersion=provider_version,
            calculationMode=CalculationMode.demo,
            ephemerisSource="deterministic-demo-provider",
            warnings=["Demo provider active. Values are deterministic samples, not verified astronomical positions."],
        ),
    )
