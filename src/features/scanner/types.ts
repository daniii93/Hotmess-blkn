export type ScannerCheckResult = "ok" | "already_used" | "invalid" | "wrong_event" | "cancelled" | "expired";

export type ScannerSession = {
  id: string;
  scannerUserId: string;
  eventId: string;
  startedAt: string;
};

export type ScannerTicketResult = {
  result: ScannerCheckResult;
  ticketId?: string;
  eventId?: string;
  photoUrl?: string;
  name?: string;
  gender?: "female" | "male" | "diverse";
  ticketStatus?: string;
  fastLane?: boolean;
  scannedAt?: string;
  scannedBy?: string;
  offline?: boolean;
};
