from datetime import datetime
from app.calculations.houses import calculate_demo_houses
from app.calculations.planets import demo_position
from app.models.astrology import CalculationMode, CelestialPosition, HouseCusp, Planet
from app.models.requests import NatalChartRequest
from app.providers.base import CalculationProvider


class DemoProvider(CalculationProvider):
    provider_id = "aethos-demo-calculation-provider"
    provider_version = "0.1.0"
    calculation_mode = CalculationMode.demo.value

    def status(self) -> dict:
        return {
            "status": "available",
            "providerId": self.provider_id,
            "providerVersion": self.provider_version,
            "calculationMode": self.calculation_mode,
            "ephemerisPathStatus": "not_required",
            "warnings": ["Demo provider active. Outputs are deterministic samples, not verified astronomical data."],
        }

    def planet_position(self, body: Planet, dt: datetime) -> CelestialPosition:
        return demo_position(body, dt, self.provider_id, self.provider_version)

    def houses(self, request: NatalChartRequest, seed_longitude: float) -> tuple[list[HouseCusp], object, list[str]]:
        return calculate_demo_houses(seed_longitude, request.houseSystem, request.birthTimeKnown)
