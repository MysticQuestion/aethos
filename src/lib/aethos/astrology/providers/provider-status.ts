import { serverEphemerisProvider } from "./server-ephemeris-provider";

export async function getActiveProviderStatus() {
  return serverEphemerisProvider.getProviderStatus();
}

export function isSwissEphemerisConfigured() {
  return Boolean(process.env.AETHOS_EPHEMERIS_SERVICE_URL);
}
