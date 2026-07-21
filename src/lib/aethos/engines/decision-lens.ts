/**
 * I Ching Decision Lens — ephemeral cast for a tactical question.
 * Does not permanently rewrite natal baseline vectors (Systems Codex).
 */

export type CoinLine = 6 | 7 | 8 | 9; // 6/9 changing, 7/8 stable (traditional 3-coin values)

export type DecisionCast = {
  id: string;
  systemKey: "i_ching";
  methodKey: "three_coin_scaffold_v0";
  engineVersion: string;
  userQuestion: string;
  castAt: string;
  expiresAt: string;
  /** Ephemeral weight for situational overlay only */
  ephemeralWeight: number;
  lines: Array<{ position: number; value: CoinLine; changing: boolean }>;
  primaryHexagram: number;
  relatingHexagram: number | null;
  changingLines: number[];
  upperTrigram: string;
  lowerTrigram: string;
  synthesis: string;
  responsibleUseNote: string;
  math: {
    seed: string;
    lineValues: CoinLine[];
    primaryBinary: string;
    relatingBinary: string | null;
  };
};

const TRIGRAMS = ["Heaven", "Lake", "Fire", "Thunder", "Wind", "Water", "Mountain", "Earth"] as const;

const HEXAGRAM_NAMES: Record<number, string> = {
  1: "The Creative",
  2: "The Receptive",
  3: "Difficulty at the Beginning",
  4: "Youthful Folly",
  23: "Splitting Apart",
  24: "Return",
  29: "The Abysmal",
  30: "The Clinging",
  51: "The Arousing",
  52: "Keeping Still",
  63: "After Completion",
  64: "Before Completion"
};

const DECAY_HOURS = 72;

export function castDecisionLens(userQuestion: string, entropy?: string): DecisionCast {
  const question = userQuestion.trim();
  if (question.length < 4) {
    throw new Error("Decision Lens requires a specific question (at least a few words).");
  }

  const castAt = new Date();
  // When entropy is provided, cast is fully deterministic (tests + reproducible lab mode).
  const seed = entropy
    ? `${question}|${entropy}`
    : `${question}|${castAt.toISOString()}|${Math.random().toString(36).slice(2)}`;
  let h = hashSeed(seed);

  const lineValues: CoinLine[] = [];
  for (let i = 0; i < 6; i += 1) {
    // Three-coin scaffold: sum of 2 or 3 per coin → 6–9
    const c1 = (h % 2) + 2;
    h = hashSeed(`${h}-a-${i}`);
    const c2 = (h % 2) + 2;
    h = hashSeed(`${h}-b-${i}`);
    const c3 = (h % 2) + 2;
    h = hashSeed(`${h}-c-${i}`);
    lineValues.push((c1 + c2 + c3) as CoinLine);
  }

  const lines = lineValues.map((value, index) => ({
    position: index + 1,
    value,
    changing: value === 6 || value === 9
  }));

  const primaryBits = lineValues.map((v) => (v === 7 || v === 9 ? 1 : 0));
  const relatingBits = lineValues.map((v) => {
    if (v === 9) return 0;
    if (v === 6) return 1;
    return v === 7 ? 1 : 0;
  });

  const primaryHexagram = bitsToHexagram(primaryBits);
  const changingLines = lines.filter((l) => l.changing).map((l) => l.position);
  const relatingHexagram = changingLines.length ? bitsToHexagram(relatingBits) : null;

  const lower = bitsToTrigram(primaryBits.slice(0, 3));
  const upper = bitsToTrigram(primaryBits.slice(3, 6));

  const primaryName = HEXAGRAM_NAMES[primaryHexagram] ?? `Hexagram ${primaryHexagram}`;
  const relatingName =
    relatingHexagram != null ? HEXAGRAM_NAMES[relatingHexagram] ?? `Hexagram ${relatingHexagram}` : null;

  const expiresAt = new Date(castAt.getTime() + DECAY_HOURS * 60 * 60 * 1000);

  const synthesis = buildSynthesis({
    question,
    primaryHexagram,
    primaryName,
    relatingHexagram,
    relatingName,
    changingLines,
    upper,
    lower
  });

  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `cast-${Date.now()}`,
    systemKey: "i_ching",
    methodKey: "three_coin_scaffold_v0",
    engineVersion: "0.1.0-research",
    userQuestion: question,
    castAt: castAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    ephemeralWeight: 0.95,
    lines,
    primaryHexagram,
    relatingHexagram,
    changingLines,
    upperTrigram: upper,
    lowerTrigram: lower,
    synthesis,
    responsibleUseNote:
      "Decision Lens is a reflective tactical overlay for a specific question. It is not medical, legal, financial, or guaranteed predictive advice. It does not permanently rewrite your natal baseline. After 72 hours it decays; the cast archives into journal memory.",
    math: {
      seed: hashSeed(seed).toString(16),
      lineValues,
      primaryBinary: primaryBits.join(""),
      relatingBinary: relatingHexagram != null ? relatingBits.join("") : null
    }
  };
}

export function isCastExpired(cast: DecisionCast, now = new Date()): boolean {
  return now.getTime() >= new Date(cast.expiresAt).getTime();
}

export function decisionCastToJournalBody(cast: DecisionCast): string {
  return [
    `Decision Lens cast (${cast.methodKey})`,
    `Question: ${cast.userQuestion}`,
    `Primary: Hexagram ${cast.primaryHexagram} — ${HEXAGRAM_NAMES[cast.primaryHexagram] ?? "Unnamed"}`,
    cast.relatingHexagram != null
      ? `Relating: Hexagram ${cast.relatingHexagram}${cast.changingLines.length ? ` (changing lines ${cast.changingLines.join(", ")})` : ""}`
      : "No changing lines",
    "",
    cast.synthesis,
    "",
    cast.responsibleUseNote,
    "",
    `Expires: ${cast.expiresAt}`,
    `Math seed: ${cast.math.seed}`
  ].join("\n");
}

function buildSynthesis(input: {
  question: string;
  primaryHexagram: number;
  primaryName: string;
  relatingHexagram: number | null;
  relatingName: string | null;
  changingLines: number[];
  upper: string;
  lower: string;
}): string {
  const changeClause =
    input.relatingHexagram != null && input.relatingName
      ? ` Changing lines at ${input.changingLines.join(", ")} point toward a related situation (${input.relatingName}, #${input.relatingHexagram}) rather than a permanent identity rewrite.`
      : " No changing lines — treat this as a relatively stable situational pattern for the question window.";

  return (
    `Regarding your question (“${input.question}”): the cast yields ${input.primaryName} (#${input.primaryHexagram}) — ${input.upper} over ${input.lower}.` +
    changeClause +
    " Hold this as a short-horizon Decision Lens against your baseline profile and current timing climate: notice where the situation asks for patience, preparation, or decisive action without treating the hexagram as a command."
  );
}

function bitsToTrigram(bits: number[]): string {
  const idx = bits[0] * 4 + bits[1] * 2 + bits[2];
  return TRIGRAMS[idx] ?? "Earth";
}

/** Map 6 bottom-to-top yin/yang bits to hexagram number 1–64 (King Wen scaffold via binary index). */
function bitsToHexagram(bits: number[]): number {
  const n = bits.reduce((acc, b, i) => acc + b * 2 ** i, 0);
  return (n % 64) + 1;
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
