export type ScannerAccessConfig = {
  scannerUserId: string;
  eventId: string;
  validUntil: string;
  active: boolean;
};

export const isScannerAccessActive = (access: ScannerAccessConfig, now = new Date()): boolean =>
  access.active && new Date(access.validUntil).getTime() > now.getTime();
