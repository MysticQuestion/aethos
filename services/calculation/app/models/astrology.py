from enum import StrEnum
from pydantic import BaseModel, Field


class Planet(StrEnum):
    sun = "sun"
    moon = "moon"
    mercury = "mercury"
    venus = "venus"
    mars = "mars"
    jupiter = "jupiter"
    saturn = "saturn"
    uranus = "uranus"
    neptune = "neptune"
    pluto = "pluto"


class ZodiacSign(StrEnum):
    aries = "Aries"
    taurus = "Taurus"
    gemini = "Gemini"
    cancer = "Cancer"
    leo = "Leo"
    virgo = "Virgo"
    libra = "Libra"
    scorpio = "Scorpio"
    sagittarius = "Sagittarius"
    capricorn = "Capricorn"
    aquarius = "Aquarius"
    pisces = "Pisces"


class HouseSystem(StrEnum):
    placidus = "placidus"
    whole_sign = "whole_sign"


class ZodiacMode(StrEnum):
    tropical = "tropical"
    sidereal = "sidereal"


class AspectType(StrEnum):
    conjunction = "conjunction"
    semisextile = "semisextile"
    sextile = "sextile"
    square = "square"
    trine = "trine"
    quincunx = "quincunx"
    opposition = "opposition"


class CalculationMode(StrEnum):
    demo = "demo"
    swiss = "swiss"
    server = "server"


class StationType(StrEnum):
    retrograde_station = "retrograde_station"
    direct_station = "direct_station"


class Coordinates(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)


class ZodiacPosition(BaseModel):
    sign: ZodiacSign
    signIndex: int = Field(ge=0, le=11)
    degree: int = Field(ge=0, le=29)
    minute: int = Field(ge=0, le=59)
    second: float = Field(ge=0, lt=60)
    formatted: str


class ProviderMetadata(BaseModel):
    providerId: str
    providerVersion: str
    calculationMode: CalculationMode
    ephemerisSource: str | None = None
    warnings: list[str] = Field(default_factory=list)


class CelestialPosition(BaseModel):
    body: Planet
    julianDay: float
    longitude: float
    latitude: float
    distanceAu: float
    speedLongitude: float
    speedLatitude: float
    speedDistance: float
    retrograde: bool
    stationary: bool
    zodiacPosition: ZodiacPosition
    providerMetadata: ProviderMetadata


class HouseCusp(BaseModel):
    house: int = Field(ge=1, le=12)
    longitude: float
    zodiacPosition: ZodiacPosition


class Angles(BaseModel):
    ascendant: float | None = None
    midheaven: float | None = None
    descendant: float | None = None
    ic: float | None = None


class Aspect(BaseModel):
    bodyA: str
    bodyB: str
    aspectType: AspectType
    exactAngle: float
    actualSeparation: float
    orb: float
    maximumOrb: float
    withinOrb: bool
    applyingSeparating: str | None = None
    exactnessScore: float = Field(ge=0, le=1)
