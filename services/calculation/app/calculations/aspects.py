from app.calculations.zodiac import normalize_longitude
from app.models.astrology import Aspect, AspectType, CelestialPosition
from app.models.requests import OrbConfig

ASPECT_ANGLES: dict[AspectType, float] = {
    AspectType.conjunction: 0,
    AspectType.semisextile: 30,
    AspectType.sextile: 60,
    AspectType.square: 90,
    AspectType.trine: 120,
    AspectType.quincunx: 150,
    AspectType.opposition: 180,
}


def shortest_angular_distance(a: float, b: float) -> float:
    diff = abs(normalize_longitude(a) - normalize_longitude(b))
    return 360 - diff if diff > 180 else diff


def calculate_aspect(body_a: CelestialPosition, body_b: CelestialPosition, orb_config: OrbConfig) -> Aspect | None:
    separation = shortest_angular_distance(body_a.longitude, body_b.longitude)
    candidates: list[tuple[AspectType, float, float, float]] = []
    for aspect_type, exact_angle in ASPECT_ANGLES.items():
        orb = abs(separation - exact_angle)
        max_orb = orb_config.for_aspect(aspect_type)
        if orb <= max_orb:
            candidates.append((aspect_type, exact_angle, orb, max_orb))
    if not candidates:
        return None
    aspect_type, exact_angle, orb, max_orb = sorted(candidates, key=lambda item: item[2])[0]
    exactness = max(0.0, 1.0 - orb / max_orb) if max_orb else 1.0
    return Aspect(
        bodyA=body_a.body.value,
        bodyB=body_b.body.value,
        aspectType=aspect_type,
        exactAngle=exact_angle,
        actualSeparation=round(separation, 6),
        orb=round(orb, 6),
        maximumOrb=max_orb,
        withinOrb=True,
        applyingSeparating="applying" if abs(body_a.speedLongitude) >= abs(body_b.speedLongitude) else "separating",
        exactnessScore=round(exactness, 6),
    )


def calculate_aspects(positions: list[CelestialPosition], orb_config: OrbConfig) -> list[Aspect]:
    aspects: list[Aspect] = []
    for index, body_a in enumerate(positions):
        for body_b in positions[index + 1 :]:
            aspect = calculate_aspect(body_a, body_b, orb_config)
            if aspect:
                aspects.append(aspect)
    return aspects
