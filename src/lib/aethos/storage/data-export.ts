import { loadExtendedLocalState, saveExtendedLocalState } from "./local-store";

export type AethosExportPackage = {
  exportVersion: "aethos-export-v1";
  exportedAt: string;
  storageMode: "local_demo";
  data: ReturnType<typeof loadExtendedLocalState>;
};

export function exportAethosData(): AethosExportPackage {
  return {
    exportVersion: "aethos-export-v1",
    exportedAt: new Date().toISOString(),
    storageMode: "local_demo",
    data: loadExtendedLocalState()
  };
}

export function importAethosData(payload: AethosExportPackage) {
  if (payload.exportVersion !== "aethos-export-v1") {
    throw new Error("Unsupported Aethos export version.");
  }
  saveExtendedLocalState(payload.data);
}
