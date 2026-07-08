from pydantic import BaseModel, Field
from .astrology import CalculationMode, Coordinates, HouseSystem, ZodiacMode


class CalculationMetadata(BaseModel):
    calculationId: str
    providerId: str
    providerVersion: str
    serviceVersion: str
    generatedAt: str
    inputHash: str
    timezone: str
    normalizedUtc: str | None = None
    coordinates: Coordinates | None = None
    houseSystem: HouseSystem | None = None
    zodiacMode: ZodiacMode | None = None
    calculationMode: CalculationMode
    ephemerisSource: str | None = None
    warnings: list[str] = Field(default_factory=list)
