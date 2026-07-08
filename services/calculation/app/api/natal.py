from fastapi import APIRouter
from app.models.requests import NatalChartRequest
from app.models.responses import NatalChartResponse
from app.services.natal_service import create_natal_chart

router = APIRouter(prefix="/v1")


@router.post("/natal-chart", response_model=NatalChartResponse)
def natal_chart(request: NatalChartRequest) -> NatalChartResponse:
    return create_natal_chart(request)
