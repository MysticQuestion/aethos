from fastapi import APIRouter
from app.models.requests import AstrocartographyRequest, RelocationChartRequest
from app.models.responses import AstrocartographyResponse, RelocationChartResponse
from app.services.astrocartography_service import create_astrocartography, create_relocation_chart

router = APIRouter(prefix="/v1")


@router.post("/astrocartography", response_model=AstrocartographyResponse)
def astrocartography(request: AstrocartographyRequest) -> AstrocartographyResponse:
    return create_astrocartography(request)


@router.post("/relocation-chart", response_model=RelocationChartResponse)
def relocation_chart(request: RelocationChartRequest) -> RelocationChartResponse:
    return create_relocation_chart(request)
