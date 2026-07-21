from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

from app.calculations.houses import calculate_demo_houses
from app.calculations.stations import is_retrograde
from app.calculations.zodiac import decimal_to_zodiac, normalize_longitude
from app.config import get_settings
from app.models.astrology import Angles, CalculationMode, CelestialPosition, HouseCusp, HouseSystem, Planet, ProviderMetadata
from app.models.requests import NatalChartRequest
from app.providers.base import CalculationProvider

PLANET_TO_SWISS = {
    Planet.sun: "SUN",
    Planet.moon: "MOON",
    Planet.mercury: "MERCURY",
    Planet.venus: "VENUS",
    Planet.mars: "MARS",
    Planet.jupiter: "JUPITER",
    Planet.saturn: "SATURN",
    Planet.uranus: "URANUS",
    Planet.neptune: "NEPTUNE",
    Planet.pluto: "PLUTO",
}

HOUSE_SYSTEM_CODES = {
    HouseSystem.placidus: b"P",
    HouseSystem.whole_sign: b"W",
}


class SwissEphemerisProvider(CalculationProvider):
    provider_id = "swiss-ephemeris"
    provider_version = "placeholder"
    calculation_mode = CalculationMode.swiss.value

    def __init__(self) -> None:
        self._available = False
        self._swisseph = None
        self._status_warning = "pyswisseph is not installed."
        try:
            import swisseph as swe  # type: ignore

            path = get_settings().swiss_ephemeris_path
            if not path:
                self._status_warning = "AETHOS_SWISS_EPHEMERIS_PATH is not configured."
                return
            if not Path(path).exists():
                self._status_warning = "Configured ephemeris path does not exist."
                return
            swe.set_ephe_path(path)
            self._swisseph = swe
            self.provider_version = getattr(swe, "__version__", "unknown")
            self._available = True
            self._status_warning = ""
        except Exception as exc:
            self._status_warning = f"Swiss Ephemeris unavailable: {exc.__class__.__name__}."

    def status(self) -> dict:
        return {
            "status": "available" if self._available else "unavailable",
            "providerId": self.provider_id,
            "providerVersion": self.provider_version,
            "calculationMode": self.calculation_mode,
            "ephemerisPathStatus": "configured" if self._available else "unavailable",
            "warnings": [] if self._available else [self._status_warning],
        }

    def planet_position(self, body: Planet, dt: datetime) -> CelestialPosition:
        if not self._available or self._swisseph is None:
            raise RuntimeError(self._status_warning)
        swe = self._swisseph
        utc = swiss_utc(dt)
        julday = swe.julday(
            utc.year,
            utc.month,
            utc.day,
            utc.hour + utc.minute / 60 + utc.second / 3600 + utc.microsecond / 3_600_000_000,
        )
        planet_id = getattr(swe, PLANET_TO_SWISS[body])
        values, _flags = swe.calc_ut(julday, planet_id, swe.FLG_SWIEPH | swe.FLG_SPEED)
        longitude, latitude, distance, speed_longitude, speed_latitude, speed_distance = values[:6]
        return CelestialPosition(
            body=body,
            julianDay=float(julday),
            longitude=float(longitude),
            latitude=float(latitude),
            distanceAu=float(distance),
            speedLongitude=float(speed_longitude),
            speedLatitude=float(speed_latitude),
            speedDistance=float(speed_distance),
            retrograde=is_retrograde(float(speed_longitude)),
            stationary=abs(float(speed_longitude)) <= 0.0001,
            zodiacPosition=decimal_to_zodiac(float(longitude)),
            providerMetadata=ProviderMetadata(
                providerId=self.provider_id,
                providerVersion=self.provider_version,
                calculationMode=CalculationMode.swiss,
                ephemerisSource="swiss-ephemeris-server",
                warnings=[],
            ),
        )

    def houses(self, request: NatalChartRequest, seed_longitude: float) -> tuple[list[HouseCusp], Angles, list[str]]:
        if not request.birthTimeKnown:
            return [], Angles(), ["Birth time unknown: houses and angles are disabled."]

        if not self._available or self._swisseph is None:
            return calculate_demo_houses(seed_longitude, request.houseSystem, True)

        swe = self._swisseph
        local_time = (
            request.localBirthTime
            if request.birthTimeKnown and request.localBirthTime
            else datetime.min.time().replace(hour=12)
        )
        local_dt = datetime.combine(request.localBirthDate, local_time, tzinfo=ZoneInfo(request.timezone))
        utc = swiss_utc(local_dt)
        julday = swe.julday(
            utc.year,
            utc.month,
            utc.day,
            utc.hour + utc.minute / 60 + utc.second / 3600 + utc.microsecond / 3_600_000_000,
        )
        hsys = HOUSE_SYSTEM_CODES.get(request.houseSystem, b"P")
        try:
            cusps_raw, ascmc = swe.houses(julday, float(request.latitude), float(request.longitude), hsys)
        except Exception as exc:
            cusps, angles, warnings = calculate_demo_houses(seed_longitude, request.houseSystem, True)
            return cusps, angles, [*warnings, f"Swiss houses failed ({exc.__class__.__name__}); demo house fallback used."]

        # pyswisseph returns 12 or 13 cusp values depending on version; houses 1-12 are indices 1..12 or 0..11.
        values = list(cusps_raw)
        if len(values) >= 13:
            house_longitudes = values[1:13]
        else:
            house_longitudes = values[:12]

        cusps = [
            HouseCusp(
                house=index + 1,
                longitude=normalize_longitude(float(lon)),
                zodiacPosition=decimal_to_zodiac(float(lon)),
            )
            for index, lon in enumerate(house_longitudes)
        ]
        asc = float(ascmc[0]) if len(ascmc) > 0 else float(house_longitudes[0])
        mc = float(ascmc[1]) if len(ascmc) > 1 else normalize_longitude(asc + 90)
        angles = Angles(
            ascendant=normalize_longitude(asc),
            midheaven=normalize_longitude(mc),
            descendant=normalize_longitude(asc + 180),
            ic=normalize_longitude(mc + 180),
        )
        return cusps, angles, [f"Swiss Ephemeris {request.houseSystem.value} houses."]


def swiss_utc(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)
