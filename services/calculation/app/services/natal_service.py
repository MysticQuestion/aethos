from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from app.calculations.aspects import calculate_aspects
from app.metadata import create_metadata
from app.models.astrology import CalculationMode
from app.models.requests import NatalChartRequest, OrbConfig
from app.models.responses import NatalChartResponse
from app.providers import get_provider


def normalize_birth_datetime(request: NatalChartRequest) -> datetime:
    local_time = request.localBirthTime if request.birthTimeKnown and request.localBirthTime else datetime.min.time().replace(hour=12)
    local_dt = datetime.combine(request.localBirthDate, local_time, tzinfo=ZoneInfo(request.timezone))
    return local_dt.astimezone(timezone.utc)


def create_natal_chart(request: NatalChartRequest) -> NatalChartResponse:
    provider = get_provider()
    provider_status = provider.status()
    normalized_utc = normalize_birth_datetime(request)
    positions = [provider.planet_position(body, normalized_utc) for body in request.requestedBodies]
    seed = positions[0].longitude if positions else 0
    houses, angles, house_warnings = provider.houses(request, seed)
    aspects = calculate_aspects(positions, OrbConfig())
    warnings = list(provider_status.get("warnings", [])) + house_warnings
    metadata = create_metadata(
        provider_id=provider.provider_id,
        provider_version=provider.provider_version,
        calculation_mode=CalculationMode(provider.calculation_mode),
        source_input=request.model_dump(mode="json"),
        timezone_name=request.timezone,
        normalized_utc=normalized_utc.isoformat(),
        coordinates=request.coordinates,
        house_system=request.houseSystem,
        zodiac_mode=request.zodiacMode,
        ephemeris_source=positions[0].providerMetadata.ephemerisSource if positions else None,
        warnings=warnings,
    )
    return NatalChartResponse(
        normalizedUtc=normalized_utc.isoformat(),
        planetaryPositions=positions,
        houses=houses,
        angles=angles,
        aspects=aspects,
        calculationMetadata=metadata,
        warnings=warnings,
    )
