from datetime import datetime
from fastapi import HTTPException
from app.config import get_settings


def validate_date_range(start: datetime, end: datetime, interval_hours: int) -> None:
    if end <= start:
        raise HTTPException(status_code=400, detail={"error": "invalid_date_range", "message": "End datetime must be after start datetime."})
    days = (end - start).total_seconds() / 86400
    settings = get_settings()
    if interval_hours <= 6 and days > settings.max_fine_days:
        raise HTTPException(status_code=400, detail={"error": "range_too_large", "message": f"Fine scans are limited to {settings.max_fine_days} days."})
    if days > settings.max_standard_days:
        raise HTTPException(status_code=400, detail={"error": "range_too_large", "message": f"Standard scans are limited to {settings.max_standard_days} days."})
