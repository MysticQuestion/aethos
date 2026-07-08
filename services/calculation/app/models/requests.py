from datetime import date, datetime, time
from pydantic import BaseModel, Field, field_validator
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from .astrology import AspectType, Coordinates, HouseSystem, Planet, ZodiacMode


class OrbConfig(BaseModel):
    conjunction: float = 8
    semisextile: float = 2
    sextile: float = 4
    square: float = 6
    trine: float = 6
    quincunx: float = 3
    opposition: float = 8

    def for_aspect(self, aspect: AspectType) -> float:
        return float(getattr(self, aspect.value))


class NatalChartRequest(BaseModel):
    localBirthDate: date
    localBirthTime: time | None = None
    birthTimeKnown: bool
    timezone: str
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    houseSystem: HouseSystem = HouseSystem.whole_sign
    zodiacMode: ZodiacMode = ZodiacMode.tropical
    requestedBodies: list[Planet] = Field(default_factory=lambda: list(Planet))

    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, value: str) -> str:
        if "/" not in value:
            raise ValueError("Use an IANA timezone such as America/Los_Angeles, not an abbreviation.")
        try:
            ZoneInfo(value)
        except ZoneInfoNotFoundError as exc:
            raise ValueError("Unknown IANA timezone.") from exc
        return value

    @property
    def coordinates(self) -> Coordinates:
        return Coordinates(latitude=self.latitude, longitude=self.longitude)


class TransitRequest(BaseModel):
    natalChart: dict
    startDatetime: datetime
    endDatetime: datetime
    intervalHours: int = Field(default=24, ge=1, le=168)
    requestedTransitBodies: list[Planet] = Field(default_factory=lambda: [Planet.mercury, Planet.venus, Planet.mars, Planet.jupiter, Planet.saturn])
    natalTargetBodies: list[Planet] = Field(default_factory=lambda: [Planet.sun, Planet.moon, Planet.mercury, Planet.venus, Planet.mars])
    orbConfig: OrbConfig = Field(default_factory=OrbConfig)


class EventRequest(BaseModel):
    startDatetime: datetime
    endDatetime: datetime
    requestedBodies: list[Planet] = Field(default_factory=lambda: [Planet.mercury, Planet.venus, Planet.mars])
    eventTypes: list[str] = Field(default_factory=lambda: ["ingress", "retrograde_station", "direct_station"])
    intervalHours: int = Field(default=24, ge=1, le=168)


class TimingPrimitiveRequest(BaseModel):
    natalChart: dict
    startDatetime: datetime
    endDatetime: datetime
    enabledEventTypes: list[str] = Field(default_factory=lambda: ["exact_transit_aspect", "ingress", "station"])
    orbConfig: OrbConfig = Field(default_factory=OrbConfig)
