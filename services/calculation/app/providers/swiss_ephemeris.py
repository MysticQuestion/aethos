from datetime import datetime, timezone
from pathlib import Path
from app.calculations.houses import calculate_demo_houses
from app.calculations.stations import is_retrograde
from app.calculations.zodiac import decimal_to_zodiac
from app.config import get_settings
from app.models.astrology import CalculationMode, CelestialPosition, HouseCusp, Planet, ProviderMetadata
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
        julday = swe.julday(dt.year, dt.month, dt.day, dt.hour + dt.minute / 60 + dt.second / 3600)
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

    def houses(self, request: NatalChartRequest, seed_longitude: float) -> tuple[list[HouseCusp], object, list[str]]:
        if not request.birthTimeKnown:
            return calculate_demo_houses(seed_longitude, request.houseSystem, False)
        return calculate_demo_houses(seed_longitude, request.houseSystem, True)


def swiss_utc(dt: datetime) -> datetime:
    return dt.astimezone(timezone.utc)
