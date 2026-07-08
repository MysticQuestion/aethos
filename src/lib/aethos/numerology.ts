import type { AethosBirthIntake, NumerologyResult } from "./types";

const PYTHAGOREAN: Record<string, number> = {
  A: 1,
  J: 1,
  S: 1,
  B: 2,
  K: 2,
  T: 2,
  C: 3,
  L: 3,
  U: 3,
  D: 4,
  M: 4,
  V: 4,
  E: 5,
  N: 5,
  W: 5,
  F: 6,
  O: 6,
  X: 6,
  G: 7,
  P: 7,
  Y: 7,
  H: 8,
  Q: 8,
  Z: 8,
  I: 9,
  R: 9
};

const VOWELS = new Set(["A", "E", "I", "O", "U"]);
const MASTER_NUMBERS = new Set([11, 22, 33]);

export function reduceNumber(value: number): number {
  let next = value;
  while (next > 9 && !MASTER_NUMBERS.has(next)) {
    next = String(next)
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);
  }
  return next;
}

function numericDateParts(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day };
}

function sumName(name: string, filter?: "vowels" | "consonants") {
  return name
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .split("")
    .filter((letter) => {
      if (!filter) return true;
      const isVowel = VOWELS.has(letter);
      return filter === "vowels" ? isVowel : !isVowel;
    })
    .reduce((sum, letter) => sum + (PYTHAGOREAN[letter] ?? 0), 0);
}

export function calculateNumerology(intake: AethosBirthIntake, today = new Date()): NumerologyResult {
  const { year, month, day } = numericDateParts(intake.birthDate);
  const currentYear = today.getUTCFullYear();
  const currentMonth = today.getUTCMonth() + 1;
  const currentDay = today.getUTCDate();

  const lifePath = reduceNumber(year + month + day);
  const birthDay = reduceNumber(day);
  const personalYear = reduceNumber(currentYear + month + day);
  const personalMonth = reduceNumber(personalYear + currentMonth);
  const personalDay = reduceNumber(personalMonth + currentDay);

  const symbolicKeys = [`num_life_path_${lifePath}`, `num_birth_day_${birthDay}`];

  const result: NumerologyResult = {
    lifePath,
    birthDay,
    personalYear,
    personalMonth,
    personalDay,
    symbolicKeys,
    metadata: {
      systemKey: "numerology",
      methodKey: "pythagorean_v1",
      engineVersion: "aethos-kernel-0.2.0",
      inputCompleteness: "date_only",
      restrictedOutputs: [],
      notes: [
        "Pythagorean numerology is symbolic, deterministic, and non-predictive.",
        "Name-derived numbers are omitted unless a full birth name is provided."
      ]
    }
  };

  if (intake.fullBirthName) {
    result.expressionNumber = reduceNumber(sumName(intake.fullBirthName));
    result.soulUrge = reduceNumber(sumName(intake.fullBirthName, "vowels"));
    result.personalityNumber = reduceNumber(sumName(intake.fullBirthName, "consonants"));
    result.symbolicKeys.push(`num_expression_${result.expressionNumber}`);
  }

  return result;
}
