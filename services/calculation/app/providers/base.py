from abc import ABC, abstractmethod
from datetime import datetime
from app.models.astrology import CelestialPosition, HouseCusp, Planet
from app.models.requests import NatalChartRequest


class CalculationProvider(ABC):
    provider_id: str
    provider_version: str
    calculation_mode: str

    @abstractmethod
    def status(self) -> dict:
        raise NotImplementedError

    @abstractmethod
    def planet_position(self, body: Planet, dt: datetime) -> CelestialPosition:
        raise NotImplementedError

    @abstractmethod
    def houses(self, request: NatalChartRequest, seed_longitude: float) -> tuple[list[HouseCusp], object, list[str]]:
        raise NotImplementedError
