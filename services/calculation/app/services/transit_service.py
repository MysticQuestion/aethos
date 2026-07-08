from datetime import datetime, timedelta, timezone
from app.calculations.aspects import calculate_aspect
from app.calculations.ingresses import detect_ingresses
from app.calculations.stations import detect_station
from app.metadata import create_metadata
from app.models.astrology import AspectType, CalculationMode, CelestialPosition, Planet, StationType
from app.models.requests import EventRequest, TransitRequest
from app.models.responses import EventsResponse, IngressEvent, StationEvent, TransitEvent, TransitsResponse
from app.providers import get_provider
from app.services.validation import validate_date_range


def _positions_from_natal_payload(payload: dict) -> list[CelestialPosition]:
    raw_positions = payload.get("planetaryPositions") or payload.get("positions") or []
    return [CelestialPosition.model_validate(item) for item in raw_positions]


def _event_id(*parts: object) -> str:
    return "evt-" + "-".join(str(part).replace(" ", "_") for part in parts)


def generate_transits(request: TransitRequest) -> TransitsResponse:
    validate_date_range(request.startDatetime, request.endDatetime, request.intervalHours)
    provider = get_provider()
    provider_status = provider.status()
    natal_positions = _positions_from_natal_payload(request.natalChart)
    current = request.startDatetime.astimezone(timezone.utc)
    end = request.endDatetime.astimezone(timezone.utc)
    events: list[TransitEvent] = []
    best_hits: dict[tuple[Planet, Planet, str], tuple[float, datetime, bool]] = {}

    while current <= end:
        for transit_body in request.requestedTransitBodies:
            transit_position = provider.planet_position(transit_body, current)
            for natal_position in natal_positions:
                if natal_position.body not in request.natalTargetBodies:
                    continue
                aspect = calculate_aspect(transit_position, natal_position, request.orbConfig)
                if not aspect:
                    continue
                key = (transit_body, natal_position.body, aspect.aspectType.value)
                existing = best_hits.get(key)
                if existing is None or aspect.orb < existing[0]:
                    best_hits[key] = (aspect.orb, current, aspect.applyingSeparating == "applying")
        current += timedelta(hours=request.intervalHours)

    metadata = create_metadata(
        provider_id=provider.provider_id,
        provider_version=provider.provider_version,
        calculation_mode=CalculationMode(provider.calculation_mode),
        source_input=request.model_dump(mode="json"),
        timezone_name="UTC",
        normalized_utc=request.startDatetime.astimezone(timezone.utc).isoformat(),
        warnings=list(provider_status.get("warnings", [])),
    )

    for (transit_body, natal_target, aspect_type_value), (minimum_orb, exact_dt, applying) in best_hits.items():
        aspect_type = AspectType(aspect_type_value)
        events.append(
            TransitEvent(
                eventId=_event_id(transit_body.value, natal_target.value, aspect_type.value, exact_dt.date()),
                transitBody=transit_body,
                natalTarget=natal_target,
                aspectType=aspect_type,
                startsAt=(exact_dt - timedelta(days=5)).isoformat(),
                exactAt=exact_dt.isoformat(),
                endsAt=(exact_dt + timedelta(days=5)).isoformat(),
                minimumOrb=round(minimum_orb, 6),
                maximumOrb=request.orbConfig.for_aspect(aspect_type),
                applyingAtStart=applying,
                themeInputs={"calculationOnly": 1.0},
                calculationMetadata=metadata,
            )
        )

    return TransitsResponse(
        transitEvents=events,
        eventWindows=[{"eventId": event.eventId, "startsAt": event.startsAt, "peaksAt": event.exactAt, "endsAt": event.endsAt} for event in events],
        calculationMetadata=metadata,
        warnings=list(provider_status.get("warnings", [])) + ["Exact transit times are scan-derived in demo mode and should not be presented as high-precision hits."],
    )


def generate_events(request: EventRequest) -> EventsResponse:
    validate_date_range(request.startDatetime, request.endDatetime, request.intervalHours)
    provider = get_provider()
    status = provider.status()
    metadata = create_metadata(
        provider_id=provider.provider_id,
        provider_version=provider.provider_version,
        calculation_mode=CalculationMode(provider.calculation_mode),
        source_input=request.model_dump(mode="json"),
        timezone_name="UTC",
        normalized_utc=request.startDatetime.astimezone(timezone.utc).isoformat(),
        warnings=list(status.get("warnings", [])),
    )
    ingresses: list[IngressEvent] = []
    stations: list[StationEvent] = []

    if "ingress" in request.eventTypes:
        for event in detect_ingresses(request.startDatetime, request.endDatetime, request.requestedBodies, provider.provider_id, provider.provider_version, request.intervalHours):
            ingresses.append(IngressEvent(**event, calculationMetadata=metadata))

    if "retrograde_station" in request.eventTypes or "direct_station" in request.eventTypes:
        current = request.startDatetime.astimezone(timezone.utc)
        end = request.endDatetime.astimezone(timezone.utc)
        while current < end:
            next_dt = min(current + timedelta(hours=request.intervalHours), end)
            for body in request.requestedBodies:
                before = provider.planet_position(body, current)
                after = provider.planet_position(body, next_dt)
                station_type = detect_station(before.speedLongitude, after.speedLongitude)
                if station_type and station_type.value in request.eventTypes:
                    stations.append(
                        StationEvent(
                            body=body,
                            stationType=station_type,
                            estimatedAt=next_dt.isoformat(),
                            refinedAt=None,
                            longitude=after.longitude,
                            zodiacPosition=after.zodiacPosition,
                            speedBefore=before.speedLongitude,
                            speedAtStationEstimate=after.speedLongitude,
                            speedAfter=after.speedLongitude,
                            calculationMetadata=metadata,
                        )
                    )
            current = next_dt
    return EventsResponse(ingressEvents=ingresses, stationEvents=stations, calculationMetadata=metadata, warnings=list(status.get("warnings", [])))
