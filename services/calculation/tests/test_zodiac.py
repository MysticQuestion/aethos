import pytest
from app.calculations.zodiac import decimal_to_zodiac, normalize_longitude


@pytest.mark.parametrize(
    ("longitude", "sign", "degree"),
    [
        (0, "Aries", 0),
        (29.999999, "Aries", 29),
        (30, "Taurus", 0),
        (59.999999, "Taurus", 29),
        (180, "Libra", 0),
        (359.999999, "Pisces", 29),
        (360, "Aries", 0),
        (-1, "Pisces", 29),
        (721, "Aries", 1),
    ],
)
def test_decimal_to_zodiac_boundaries(longitude: float, sign: str, degree: int):
    position = decimal_to_zodiac(longitude)
    assert position.sign.value == sign
    assert position.degree == degree


def test_normalize_longitude_range():
    for value in [-720, -1, 0, 360, 721]:
        assert 0 <= normalize_longitude(value) < 360
