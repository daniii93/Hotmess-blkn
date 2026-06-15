import type { AdminMetric } from "../types";

export const summarizeAdminMetrics = (metrics: AdminMetric[]): AdminMetric[] =>
  metrics.filter((metric) => metric.value !== null && metric.value !== undefined);

export type AdminDashboardSnapshot = {
  revenueTodayCents: number;
  revenueWeekCents: number;
  revenueMonthCents: number;
  ticketsSold: number;
  activeEvents: number;
  soldOutEvents: number;
  waitlistTotal: number;
  pendingVerifications: number;
  newUsers: number;
  scannerActivity: number;
  addonRevenueCents: number;
  hotelRevenueCents: number;
};

export const createAdminDashboardMetrics = (snapshot: AdminDashboardSnapshot): AdminMetric[] => [
  { label: "Umsatz heute", value: snapshot.revenueTodayCents },
  { label: "Umsatz Woche", value: snapshot.revenueWeekCents },
  { label: "Umsatz Monat", value: snapshot.revenueMonthCents },
  { label: "Tickets verkauft", value: snapshot.ticketsSold },
  { label: "Aktive Events", value: snapshot.activeEvents },
  { label: "Ausverkaufte Events", value: snapshot.soldOutEvents },
  { label: "Wartelisten gesamt", value: snapshot.waitlistTotal },
  { label: "Offene Verifikationen", value: snapshot.pendingVerifications },
  { label: "Neue Nutzer", value: snapshot.newUsers },
  { label: "Scanner Aktivität", value: snapshot.scannerActivity },
  { label: "Add-on Umsatz", value: snapshot.addonRevenueCents },
  { label: "Hotel Umsatz", value: snapshot.hotelRevenueCents },
];
