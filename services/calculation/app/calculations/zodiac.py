from math import floor
from app.models.astrology import ZodiacPosition, ZodiacSign

SIGNS: list[ZodiacSign] = [
    ZodiacSign.aries,
    ZodiacSign.taurus,
    ZodiacSign.gemini,
    ZodiacSign.cancer,
    ZodiacSign.leo,
    ZodiacSign.virgo,
    ZodiacSign.libra,
    ZodiacSign.scorpio,
    ZodiacSign.sagittarius,
    ZodiacSign.capricorn,
    ZodiacSign.aquarius,
    ZodiacSign.pisces,
]


def normalize_longitude(value: float) -> float:
    return value % 360.0


def decimal_to_zodiac(longitude: float) -> ZodiacPosition:
    normalized = normalize_longitude(longitude)
    sign_index = floor(normalized / 30.0)
    degree_float = normalized % 30.0
    degree = floor(degree_float)
    minute_float = (degree_float - degree) * 60.0
    minute = floor(minute_float)
    second = (minute_float - minute) * 60.0
    if second >= 59.9995:
        second = 0.0
        minute += 1
    if minute >= 60:
        minute = 0
        degree += 1
    if degree >= 30:
        degree = 0
        sign_index = (sign_index + 1) % 12
    sign = SIGNS[sign_index]
    return ZodiacPosition(
        sign=sign,
        signIndex=sign_index,
        degree=degree,
        minute=minute,
        second=round(second, 3),
        formatted=f"{degree}° {minute}' {round(second, 2)}\" {sign.value}",
    )
