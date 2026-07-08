from fastapi import APIRouter
from app.models.requests import EventRequest, TimingPrimitiveRequest
from app.models.responses import EventsResponse, TimingPrimitivesResponse
from app.services.timing_event_service import generate_timing_primitives
from app.services.transit_service import generate_events

router = APIRouter(prefix="/v1")


@router.post("/events", response_model=EventsResponse)
def events(request: EventRequest) -> EventsResponse:
    return generate_events(request)


@router.post("/timing-primitives", response_model=TimingPrimitivesResponse)
def timing_primitives(request: TimingPrimitiveRequest) -> TimingPrimitivesResponse:
    return generate_timing_primitives(request)
