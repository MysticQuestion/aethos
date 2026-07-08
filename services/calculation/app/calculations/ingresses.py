from datetime import datetime, timedelta, timezone
from app.calculations.planets import demo_position
from app.models.astrology import Planet


def detect_ingresses(start: datetime, end: datetime, bodies: list[Planet], provider_id: str, provider_version: str, interval_hours: int = 24) -> list[dict]:
    events: list[dict] = []
    current = start.astimezone(timezone.utc)
    end_utc = end.astimezone(timezone.utc)
    while current < end_utc:
        next_dt = min(current + timedelta(hours=interval_hours), end_utc)
        for body in bodies:
            before = demo_position(body, current, provider_id, provider_version)
            after = demo_position(body, next_dt, provider_id, provider_version)
            if before.zodiacPosition.sign != after.zodiacPosition.sign:
                events.append(
                    {
                        "body": body,
                        "fromSign": before.zodiacPosition.sign.value,
                        "toSign": after.zodiacPosition.sign.value,
                        "estimatedAt": next_dt.isoformat(),
                        "refinedAt": None,
                        "longitude": after.longitude,
                    }
                )
        current = next_dt
    return events
