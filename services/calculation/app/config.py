from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="AETHOS_", env_file=".env", extra="ignore")

    service_version: str = "0.1.0"
    calc_provider: str = Field(default="demo", description="demo or swiss")
    swiss_ephemeris_path: str | None = None
    allow_demo_fallback: bool = True
    max_standard_days: int = 365 * 5
    max_fine_days: int = 120


@lru_cache
def get_settings() -> Settings:
    return Settings()
