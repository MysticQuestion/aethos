export type Planet =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto";

export type ZodiacSign =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

export type HouseSystem = "whole_sign" | "placidus" | "koch" | "equal";
export type ZodiacMode = "tropical" | "sidereal";
export type AspectType = "conjunction" | "sextile" | "square" | "trine" | "opposition";
export type CalculationMode = "demo" | "server" | "external" | "swiss";
export type TimingTheme =
  | "Agency"
  | "Inner Life"
  | "Structure"
  | "Expression"
  | "Relational Patterns"
  | "Material Stability"
  | "Conflict"
  | "Renewal"
  | "Visibility"
  | "Rest"
  | "Decision Pressure";

export type ZodiacPosition = {
  sign: ZodiacSign;
  signIndex: number;
  degree: number;
  minute: number;
  second: number;
  longitude: number;
  formatted: string;
};

export type PlanetarySpeed = {
  longitudePerDay: number;
  latitudePerDay?: number;
};

export type CelestialPosition = {
  body: Planet;
  longitude: number;
  latitude: number;
  distanceAu?: number;
  speed: PlanetarySpeed;
  zodiac: ZodiacPosition;
  isRetrograde: boolean;
  calculatedAt: string;
  providerId: string;
  calculationMode: CalculationMode;
  warnings: string[];
};

export type HouseCusp = {
  house: number;
  longitude: number;
  zodiac: ZodiacPosition;
};

export type NatalChartInput = {
  birthDate: string;
  birthTime?: string;
  birthTimeKnown: boolean;
  birthLocationLabel?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  houseSystem: HouseSystem;
  zodiacMode: ZodiacMode;
  calculationMode: CalculationMode;
};

export type CalculationMetadataV2 = {
  calculationId: string;
  providerId: string;
  providerVersion: string;
  calculationMode: CalculationMode;
  generatedAt: string;
  inputHash: string;
  timezone: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  houseSystem?: HouseSystem;
  zodiacMode?: ZodiacMode;
  ephemerisSource?: string;
  warnings: string[];
};

export type NatalChart = {
  id: string;
  input: NatalChartInput;
  positions: CelestialPosition[];
  houses: HouseCusp[];
  aspects: Aspect[];
  metadata: CalculationMetadataV2;
};

export type Aspect = {
  id: string;
  bodyA: Planet;
  bodyB: Planet;
  type: AspectType;
  orb: number;
  exactAngle: number;
  applying: boolean;
};

export type TransitEvent = {
  id: string;
  eventType: "transit_aspect" | "station" | "retrograde";
  transitBody: Planet;
  natalTarget?: Planet;
  aspectType?: AspectType;
  orb?: number;
  exactAt: string;
  startsAt: string;
  endsAt: string;
  themeContributions: Partial<Record<TimingTheme, number>>;
  rationale: string;
  metadata: CalculationMetadataV2;
};

export type RetrogradeEvent = {
  id: string;
  body: Planet;
  startsAt: string;
  endsAt: string;
  stationType: "station_retrograde" | "station_direct";
  metadata: CalculationMetadataV2;
};

export type AstroTimingWindow = {
  id: string;
  title: string;
  primaryTheme: TimingTheme;
  secondaryThemes: TimingTheme[];
  startDate: string;
  peakDate: string;
  endDate: string;
  sourceEvents: TransitEvent[];
  intensityScore: number;
  confidenceScore: number;
  interpretiveSummary: string;
  suggestedReflection: string;
  recommendedActionExperiment:
    | "observe"
    | "initiate"
    | "pause"
    | "repair"
    | "complete"
    | "rest"
    | "communicate"
    | "decide_later";
  responsibleUseNote: string;
  calculationMetadata: CalculationMetadataV2;
};

export type DateRange = {
  startDate: string;
  endDate: string;
};

export type OrbConfig = Partial<Record<AspectType, number>>;

export type ProviderStatus = {
  activeProvider: string;
  calculationMode: CalculationMode;
  serverConfigured: boolean;
  swissEphemerisAvailable: boolean;
  warnings: string[];
  requiredEnvVars: string[];
};

export type EphemerisProvider = {
  id: string;
  label: string;
  mode: "demo" | "swiss" | "external";
  version: string;
  getPlanetPosition(input: NatalChartInput & { body: Planet; date: string }): Promise<CelestialPosition>;
  getPlanetPositions(input: NatalChartInput & { bodies: Planet[]; date: string }): Promise<CelestialPosition[]>;
  getHouses?(input: NatalChartInput): Promise<HouseCusp[]>;
  getProviderStatus(): Promise<ProviderStatus>;
};
