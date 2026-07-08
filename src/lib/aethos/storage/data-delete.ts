import { clearLocalSegment } from "./local-store";

export function deleteLocalAethosData() {
  clearLocalSegment("all");
}

export function deleteProfileData() {
  clearLocalSegment("profile");
}

export function deleteJournalData() {
  clearLocalSegment("journal");
}

export function deleteReportData() {
  clearLocalSegment("reports");
}
