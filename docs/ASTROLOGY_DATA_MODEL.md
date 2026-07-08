# Astrology Data Model

Core response models are defined under `services/calculation/app/models`.

## CelestialPosition

- `body`
- `julianDay`
- `longitude`
- `latitude`
- `distanceAu`
- `speedLongitude`
- `speedLatitude`
- `speedDistance`
- `retrograde`
- `stationary`
- `zodiacPosition`
- `providerMetadata`

## ZodiacPosition

- `sign`
- `signIndex`
- `degree`
- `minute`
- `second`
- `formatted`

## Aspect

- `bodyA`
- `bodyB`
- `aspectType`
- `exactAngle`
- `actualSeparation`
- `orb`
- `maximumOrb`
- `withinOrb`
- `applyingSeparating`
- `exactnessScore`

## CalculationMetadata

- `calculationId`
- `providerId`
- `providerVersion`
- `serviceVersion`
- `generatedAt`
- `inputHash`
- `timezone`
- `normalizedUtc`
- `coordinates`
- `houseSystem`
- `zodiacMode`
- `calculationMode`
- `ephemerisSource`
- `warnings`

The service preserves floating-point values internally. User-facing rounding belongs in presentation layers.
