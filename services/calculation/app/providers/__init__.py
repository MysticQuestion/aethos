from app.config import get_settings
from app.providers.demo import DemoProvider
from app.providers.swiss_ephemeris import SwissEphemerisProvider


def get_provider():
    settings = get_settings()
    if settings.calc_provider == "swiss":
        swiss = SwissEphemerisProvider()
        if swiss.status()["status"] == "available":
            return swiss
        if not settings.allow_demo_fallback:
            return swiss
    return DemoProvider()


def reset_provider_cache() -> None:
    """Clear settings cache so tests can switch provider env vars mid-session."""
    get_settings.cache_clear()
