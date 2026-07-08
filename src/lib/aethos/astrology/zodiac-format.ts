import type { ZodiacPosition, ZodiacSign } from "./types";

export const ZODIAC_SIGNS: ZodiacSign[] = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces"
];

export function normalizeLongitude(value: number): number {
  return ((value % 360) + 360) % 360;
}

export function decimalToZodiac(longitude: number): ZodiacPosition {
  const normalized = normalizeLongitude(longitude);
  const signIndex = Math.floor(normalized / 30);
  const sign = ZODIAC_SIGNS[signIndex];
  const degreeDecimal = normalized % 30;
  const degree = Math.floor(degreeDecimal);
  const minuteDecimal = (degreeDecimal - degree) * 60;
  const minute = Math.floor(minuteDecimal);
  const second = Math.round((minuteDecimal - minute) * 60);

  return {
    sign,
    signIndex,
    degree,
    minute,
    second,
    longitude: Number(normalized.toFixed(6)),
    formatted: `${degree}° ${minute}' ${second}" ${sign}`
  };
}

export function zodiacToDecimal(sign: ZodiacSign, degree: number, minute = 0, second = 0): number {
  const signIndex = ZODIAC_SIGNS.indexOf(sign);
  if (signIndex < 0) {
    throw new Error(`Unknown zodiac sign: ${sign}`);
  }

  return normalizeLongitude(signIndex * 30 + degree + minute / 60 + second / 3600);
}
