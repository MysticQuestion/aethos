from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.api.astrocartography import router as astrocartography_router
from app.api.events import router as events_router
from app.api.health import router as health_router
from app.api.natal import router as natal_router
from app.api.transits import router as transits_router
from app.logging import structured_log_middleware

app = FastAPI(
    title="Aethos Calculation Service",
    version="0.1.0",
    description="Server-side calculation service for Aethos astrology data and timing primitives.",
)

app.middleware("http")(structured_log_middleware)
app.include_router(health_router)
app.include_router(natal_router)
app.include_router(transits_router)
app.include_router(events_router)
app.include_router(astrocartography_router)


@app.exception_handler(Exception)
async def safe_exception_handler(_request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_error",
            "message": "Calculation service error. Details are intentionally not exposed in API responses.",
            "category": exc.__class__.__name__,
        },
    )
