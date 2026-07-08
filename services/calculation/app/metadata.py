from datetime import datetime, timezone
from hashlib import sha256
from uuid import uuid4
import json
from app.config import get_settings
from app.models.astrology import CalculationMode, Coordinates, HouseSystem, ZodiacMode
from app.models.metadata import CalculationMetadata


def canonical_json(payload: object) -> str:
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)


def create_input_hash(payload: object) -> str:
    return sha256(canonical_json(payload).encode("utf-8")).hexdigest()


def create_metadata(
    *,
    provider_id: str,
    provider_version: str,
    calculation_mode: CalculationMode,
    source_input: object,
    timezone_name: str,
    normalized_utc: str | None = None,
    coordinates: Coordinates | None = None,
    house_system: HouseSystem | None = None,
    zodiac_mode: ZodiacMode | None = None,
    ephemeris_source: str | None = None,
    warnings: list[str] | None = None,
) -> CalculationMetadata:
    return CalculationMetadata(
        calculationId=f"calc-{uuid4()}",
        providerId=provider_id,
        providerVersion=provider_version,
        serviceVersion=get_settings().service_version,
        generatedAt=datetime.now(timezone.utc).isoformat(),
        inputHash=create_input_hash(source_input),
        timezone=timezone_name,
        normalizedUtc=normalized_utc,
        coordinates=coordinates,
        houseSystem=house_system,
        zodiacMode=zodiac_mode,
        calculationMode=calculation_mode,
        ephemerisSource=ephemeris_source,
        warnings=warnings or [],
    )
