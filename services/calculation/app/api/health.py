from datetime import datetime, timezone
from fastapi import APIRouter
from app.models.responses import HealthResponse
from app.providers import get_provider

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    provider = get_provider()
    status = provider.status()
    return HealthResponse(
        status="ok",
        providerStatus=status["status"],
        providerId=status["providerId"],
        providerVersion=status["providerVersion"],
        calculationMode=status["calculationMode"],
        ephemerisPathStatus=status["ephemerisPathStatus"],
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
