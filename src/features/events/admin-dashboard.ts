import type { EventKpiSnapshot } from "./types";
import type { GenderBalanceCounts } from "../gender-balance/types";

export type AdminEventDashboardSnapshot = {
  eventId: string;
  sales: EventKpiSnapshot;
  genderBalance: GenderBalanceCounts;
  waitlistSize: number;
  scannerReady: boolean;
  addonsEnabled: boolean;
  revenueCents: number;
};

export const createAdminEventDashboardSnapshot = (
  snapshot: AdminEventDashboardSnapshot,
): AdminEventDashboardSnapshot => snapshot;
