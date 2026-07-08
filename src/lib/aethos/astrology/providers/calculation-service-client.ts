export function getCalculationServiceConfig() {
  return {
    url: process.env.AETHOS_CALCULATION_SERVICE_URL,
    allowDemoFallback: process.env.AETHOS_ALLOW_DEMO_FALLBACK !== "false"
  };
}

export async function getCalculationServiceStatus() {
  const config = getCalculationServiceConfig();
  if (!config.url) {
    return {
      configured: false,
      available: false,
      status: null,
      warning: "AETHOS_CALCULATION_SERVICE_URL is not configured."
    };
  }

  try {
    const response = await fetch(`${config.url.replace(/\/$/, "")}/health`, {
      method: "GET",
      headers: { accept: "application/json" },
      cache: "no-store"
    });
    if (!response.ok) {
      return { configured: true, available: false, status: null, warning: `Calculation service returned ${response.status}.` };
    }
    return { configured: true, available: true, status: await response.json(), warning: null };
  } catch (error) {
    return {
      configured: true,
      available: false,
      status: null,
      warning: `Calculation service unavailable: ${error instanceof Error ? error.message : "unknown error"}.`
    };
  }
}

export async function createServiceNatalChart(input: {
  birthDate: string;
  birthTime?: string;
  birthTimeKnown: boolean;
  birthLocationLabel?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  houseSystem: string;
  zodiacMode: string;
}) {
  const config = getCalculationServiceConfig();
  if (!config.url) throw new Error("AETHOS_CALCULATION_SERVICE_URL is not configured.");

  const payload = {
    localBirthDate: input.birthDate,
    localBirthTime: input.birthTime,
    birthTimeKnown: input.birthTimeKnown,
    timezone: input.timezone ?? "America/Los_Angeles",
    latitude: input.latitude ?? 0,
    longitude: input.longitude ?? 0,
    houseSystem: input.houseSystem === "placidus" ? "placidus" : "whole_sign",
    zodiacMode: input.zodiacMode,
    requestedBodies: ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"]
  };

  const response = await fetch(`${config.url.replace(/\/$/, "")}/v1/natal-chart`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Calculation service natal-chart request failed with ${response.status}.`);
  }

  return response.json();
}
