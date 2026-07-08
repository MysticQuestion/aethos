export function detectRetrograde(speedInLongitude: number): boolean {
  return speedInLongitude < 0;
}

export function detectStation(previousSpeed: number, currentSpeed: number): "station_retrograde" | "station_direct" | null {
  if (previousSpeed > 0 && currentSpeed <= 0) return "station_retrograde";
  if (previousSpeed < 0 && currentSpeed >= 0) return "station_direct";
  if (Math.abs(currentSpeed) < 0.01) return previousSpeed < 0 ? "station_direct" : "station_retrograde";
  return null;
}
