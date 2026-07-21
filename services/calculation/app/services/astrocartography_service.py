"""Astrocartography scaffold: planetary ASC/DSC/MC/IC lines via geographic search.

Method (research scaffold, not full Jim Lewis A*C*G product parity):
- Fix birth moment (UTC).
- For each body + line type, sample geographic longitudes and pick the longitude
  where the relocated angle is closest to the planet's ecliptic longitude.
- ASC/DSC are optimized at sample latitudes; MC/IC use natal latitude.

Unknown birth time → full withhold (lines empty).
"""

from __future__ import annotations

from app.calculations.zodiac import normalize_longitude
from app.metadata import create_metadata
from app.models.astrology import CalculationMode, Planet
from app.models.requests import AstrocartographyRequest, NatalChartRequest, RelocationChartRequest
from app.models.responses import (
    AstroCartographyLine,
    AstrocartographyResponse,
    NatalChartResponse,
    RelocationChartResponse,
)
from app.providers import get_provider
from app.providers.base import CalculationProvider
from app.services.natal_service import create_natal_chart, normalize_birth_datetime

RESPONSIBLE_USE = (
    "Astrocartography and relocation lines are reflective location-context markers, "
    "not commands to move, invest, or make medical/legal decisions. Treat map lines as "
    "symbolic infrastructure for journaling and practitioner discussion — matching the "
    "ethical framing used by professional chart services for locational tools."
)


def angular_distance(a: float, b: float) -> float:
    return abs((a - b + 180.0) % 360.0 - 180.0)


def _angle_for_line(
    provider: CalculationProvider,
    request_template: NatalChartRequest,
    geo_lat: float,
    geo_lon: float,
    line_type: str,
    seed_longitude: float,
) -> float | None:
    probe = request_template.model_copy(
        update={
            "latitude": geo_lat,
            "longitude": geo_lon,
            "birthTimeKnown": True,
        }
    )
    houses, angles, _warnings = provider.houses(probe, seed_longitude)
    if line_type == "ASC":
        return angles.ascendant
    if line_type == "DSC":
        if angles.descendant is not None:
            return angles.descendant
        if angles.ascendant is not None:
            return normalize_longitude(float(angles.ascendant) + 180.0)
        return None
    if line_type == "MC":
        return angles.midheaven
    if line_type == "IC":
        if angles.ic is not None:
            return angles.ic
        if angles.midheaven is not None:
            return normalize_longitude(float(angles.midheaven) + 180.0)
        return None
    return None


def _best_longitude_for_line(
    provider: CalculationProvider,
    natal_request: NatalChartRequest,
    planet_lon: float,
    line_type: str,
    sample_latitude: float,
    step: float,
) -> tuple[float, float]:
    """Return (geographic_longitude, residual_orb_degrees)."""
    best_lon = 0.0
    best_orb = 999.0
    lon = -180.0
    while lon < 180.0 - 1e-9:
        angle = _angle_for_line(provider, natal_request, sample_latitude, lon, line_type, planet_lon)
        if angle is not None:
            orb = angular_distance(float(angle), planet_lon)
            if orb < best_orb:
                best_orb = orb
                best_lon = lon
        lon += step
    return best_lon, best_orb


def create_astrocartography(request: AstrocartographyRequest) -> AstrocartographyResponse:
    warnings: list[str] = []
    withheld: list[str] = []
    natal_request = request.to_natal_request()
    provider = get_provider()
    provider_status = provider.status()
    warnings.extend(provider_status.get("warnings", []))

    normalized_utc = normalize_birth_datetime(natal_request)

    if not request.birthTimeKnown or request.localBirthTime is None:
        withheld.extend(
            [
                "All ASC/DSC/MC/IC lines",
                "Relocation angle emphasis",
            ]
        )
        metadata = create_metadata(
            provider_id=provider.provider_id,
            provider_version=provider.provider_version,
            calculation_mode=CalculationMode(provider.calculation_mode),
            source_input=request.model_dump(mode="json"),
            timezone_name=request.timezone,
            normalized_utc=normalized_utc.isoformat(),
            coordinates=natal_request.coordinates,
            house_system=request.houseSystem,
            zodiac_mode=request.zodiacMode,
            ephemeris_source=None,
            warnings=warnings
            + ["Birth time unknown or missing: astrocartography lines are withheld."],
        )
        return AstrocartographyResponse(
            normalizedUtc=normalized_utc.isoformat(),
            lines=[],
            withheld=withheld,
            calculationMetadata=metadata,
            warnings=metadata.warnings,
            responsibleUseNote=RESPONSIBLE_USE,
        )

    sample_lats = list(request.sampleLatitudes) if request.sampleLatitudes else [request.latitude]
    # Always include natal latitude once.
    if request.latitude not in sample_lats:
        sample_lats = [request.latitude, *sample_lats]

    positions = [provider.planet_position(body, normalized_utc) for body in request.requestedBodies]
    lines: list[AstroCartographyLine] = []
    step = float(request.longitudeStepDegrees)

    for pos in positions:
        for line_type in request.lineTypes:
            # MC/IC: single sample at natal latitude (weak lat dependence).
            if line_type in {"MC", "IC"}:
                lats = [request.latitude]
            else:
                lats = sample_lats

            for lat in lats:
                geo_lon, residual = _best_longitude_for_line(
                    provider,
                    natal_request,
                    pos.longitude,
                    line_type,
                    float(lat),
                    step,
                )
                method = (
                    f"geo_search_{provider.calculation_mode}_step_{step:g}"
                    if provider.calculation_mode == "swiss"
                    else f"geo_search_demo_step_{step:g}"
                )
                notes = []
                if provider.calculation_mode == "demo":
                    notes.append("Demo house angles: lines are structural placeholders, not survey-grade ACG.")
                if residual > step:
                    notes.append(
                        f"Residual orb {residual:.3f}° exceeds sample step {step:g}°; refine with smaller step."
                    )
                lines.append(
                    AstroCartographyLine(
                        lineId=f"{pos.body.value}-{line_type}-lat{lat:.2f}",
                        body=pos.body,
                        lineType=line_type,
                        geographicLongitude=round(geo_lon, 4),
                        sampleLatitude=round(float(lat), 4),
                        residualOrbDegrees=round(residual, 4),
                        methodKey=method,
                        notes=notes,
                    )
                )

    if provider.calculation_mode == "demo":
        warnings.append(
            "Demo provider active. Astrocartography lines are deterministic scaffolds, not astronomical ACG."
        )
    else:
        warnings.append(
            "Scaffold method: longitude grid search against relocated angles. "
            "Not a full paran/crossing engine; map UI may be layered later."
        )

    ephemeris_source = positions[0].providerMetadata.ephemerisSource if positions else None
    metadata = create_metadata(
        provider_id=provider.provider_id,
        provider_version=provider.provider_version,
        calculation_mode=CalculationMode(provider.calculation_mode),
        source_input=request.model_dump(mode="json"),
        timezone_name=request.timezone,
        normalized_utc=normalized_utc.isoformat(),
        coordinates=natal_request.coordinates,
        house_system=request.houseSystem,
        zodiac_mode=request.zodiacMode,
        ephemeris_source=ephemeris_source,
        warnings=warnings,
    )

    return AstrocartographyResponse(
        normalizedUtc=normalized_utc.isoformat(),
        lines=lines,
        withheld=withheld,
        calculationMetadata=metadata,
        warnings=warnings,
        responsibleUseNote=RESPONSIBLE_USE,
    )


def create_relocation_chart(request: RelocationChartRequest) -> RelocationChartResponse:
    natal: NatalChartResponse = create_natal_chart(request)
    return RelocationChartResponse(
        **natal.model_dump(),
        relocationLabel=f"{request.latitude:.4f},{request.longitude:.4f}",
    )
