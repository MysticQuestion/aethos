from fastapi import APIRouter
from app.models.requests import TransitRequest
from app.models.responses import TransitsResponse
from app.services.transit_service import generate_transits

router = APIRouter(prefix="/v1")


@router.post("/transits", response_model=TransitsResponse)
def transits(request: TransitRequest) -> TransitsResponse:
    return generate_transits(request)
