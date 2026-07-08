from app.models.requests import TimingPrimitiveRequest, TransitRequest
from app.models.responses import TimingPrimitive, TimingPrimitivesResponse
from app.services.transit_service import generate_transits


def generate_timing_primitives(request: TimingPrimitiveRequest) -> TimingPrimitivesResponse:
    transits = generate_transits(
        TransitRequest(
            natalChart=request.natalChart,
            startDatetime=request.startDatetime,
            endDatetime=request.endDatetime,
            orbConfig=request.orbConfig,
        )
    )
    primitives = [
        TimingPrimitive(
            id=f"prim-{event.eventId}",
            eventType="exact_transit_aspect",
            sourceBody=event.transitBody.value,
            targetBody=event.natalTarget.value,
            aspectType=event.aspectType.value,
            startsAt=event.startsAt,
            peaksAt=event.exactAt,
            endsAt=event.endsAt,
            exactnessScore=max(0.0, min(1.0, 1.0 - event.minimumOrb / event.maximumOrb)),
            intensityInputs={"orb": event.minimumOrb, "maximumOrb": event.maximumOrb},
            sourceData=event.model_dump(mode="json"),
            calculationMetadata=event.calculationMetadata,
        )
        for event in transits.transitEvents
    ]
    return TimingPrimitivesResponse(
        timingPrimitives=primitives,
        calculationMetadata=transits.calculationMetadata,
        warnings=transits.warnings,
    )
