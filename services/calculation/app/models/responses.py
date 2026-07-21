from pydantic import BaseModel, Field
from .astrology import Angles, Aspect, CelestialPosition, HouseCusp, Planet, AspectType, StationType, ZodiacPosition
from .metadata import CalculationMetadata


class HealthResponse(BaseModel):
    status: str
    providerStatus: str
    providerId: str
    providerVersion: str
    calculationMode: str
    ephemerisPathStatus: str
    timestamp: str


class NatalChartResponse(BaseModel):
    normalizedUtc: str
    planetaryPositions: list[CelestialPosition]
    houses: list[HouseCusp]
    angles: Angles
    aspects: list[Aspect]
    calculationMetadata: CalculationMetadata
    warnings: list[str]


class TransitEvent(BaseModel):
    eventId: str
    transitBody: Planet
    natalTarget: Planet
    aspectType: AspectType
    startsAt: str
    exactAt: str
    endsAt: str
    minimumOrb: float
    maximumOrb: float
    applyingAtStart: bool
    themeInputs: dict[str, float] = Field(default_factory=dict)
    calculationMetadata: CalculationMetadata


class IngressEvent(BaseModel):
    body: Planet
    fromSign: str
    toSign: str
    estimatedAt: str
    refinedAt: str | None = None
    longitude: float
    calculationMetadata: CalculationMetadata


class StationEvent(BaseModel):
    body: Planet
    stationType: StationType
    estimatedAt: str
    refinedAt: str | None = None
    longitude: float
    zodiacPosition: ZodiacPosition
    speedBefore: float
    speedAtStationEstimate: float
    speedAfter: float
    calculationMetadata: CalculationMetadata


class TransitsResponse(BaseModel):
    transitEvents: list[TransitEvent]
    eventWindows: list[dict]
    calculationMetadata: CalculationMetadata
    warnings: list[str]


class EventsResponse(BaseModel):
    ingressEvents: list[IngressEvent] = Field(default_factory=list)
    stationEvents: list[StationEvent] = Field(default_factory=list)
    calculationMetadata: CalculationMetadata
    warnings: list[str]


class TimingPrimitive(BaseModel):
    id: str
    eventType: str
    sourceBody: str
    targetBody: str | None = None
    aspectType: str | None = None
    startsAt: str
    peaksAt: str
    endsAt: str
    exactnessScore: float = Field(ge=0, le=1)
    intensityInputs: dict[str, float]
    sourceData: dict
    calculationMetadata: CalculationMetadata


class TimingPrimitivesResponse(BaseModel):
    timingPrimitives: list[TimingPrimitive]
    calculationMetadata: CalculationMetadata
    warnings: list[str]


class AstroCartographyLine(BaseModel):
    lineId: str
    body: Planet
    lineType: str  # ASC | DSC | MC | IC
    geographicLongitude: float = Field(ge=-180, le=180)
    sampleLatitude: float = Field(ge=-90, le=90)
    residualOrbDegrees: float = Field(ge=0)
    methodKey: str
    notes: list[str] = Field(default_factory=list)


class AstrocartographyResponse(BaseModel):
    normalizedUtc: str
    lines: list[AstroCartographyLine]
    withheld: list[str] = Field(default_factory=list)
    calculationMetadata: CalculationMetadata
    warnings: list[str]
    responsibleUseNote: str


class RelocationChartResponse(NatalChartResponse):
    relocationLabel: str | None = None
