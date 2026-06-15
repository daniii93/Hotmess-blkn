import type { ScannerCheckResult } from "./types";

export const getScannerResultLabel = (result: ScannerCheckResult): string => {
  const labels: Record<ScannerCheckResult, string> = {
    ok: "Check-in erfolgreich",
    already_used: "Ticket wurde bereits verwendet",
    invalid: "Ticket ist ungültig",
    wrong_event: "Ticket gehört zu einem anderen Event",
    cancelled: "Ticket wurde storniert",
    expired: "Ticket ist abgelaufen",
  };

  return labels[result];
};

export const canScannerAccessEvent = (params: {
  scannerEventIds: string[];
  eventId: string;
  validUntil?: string;
  now?: Date;
}): boolean => {
  const now = params.now ?? new Date();
  if (params.validUntil && new Date(params.validUntil).getTime() <= now.getTime()) return false;
  return params.scannerEventIds.includes(params.eventId);
};

export const shouldMarkTicketUsed = (result: ScannerCheckResult): boolean => result === "ok";
