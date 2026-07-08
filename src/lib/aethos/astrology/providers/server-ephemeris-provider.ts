import type { EphemerisProvider, ProviderStatus } from "../types";
import { demoEphemerisProvider } from "./demo-ephemeris-provider";

export const serverEphemerisProvider: EphemerisProvider = {
  ...demoEphemerisProvider,
  id: "aethos-server-contract",
  label: "Aethos server ephemeris contract",
  mode: "demo",
  version: "0.3.0-contract",
  async getProviderStatus(): Promise<ProviderStatus> {
    const demoStatus = await demoEphemerisProvider.getProviderStatus();
    return {
      ...demoStatus,
      activeProvider: this.id,
      warnings: [
        ...demoStatus.warnings,
        "Server contract route is active, but no real Swiss Ephemeris sidecar is configured."
      ],
      requiredEnvVars: ["AETHOS_EPHEMERIS_SERVICE_URL", "AETHOS_EPHEMERIS_SERVICE_TOKEN"]
    };
  }
};
