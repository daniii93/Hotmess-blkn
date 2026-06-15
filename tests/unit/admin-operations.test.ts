import { createAdminDashboardMetrics } from "../../src/features/admin/dashboard/service";
import { requiresTicketActionConfirmation } from "../../src/features/admin/tickets/service";
import { canResendOrderConfirmation } from "../../src/features/admin/orders/service";
import { calculateHotelMarginCents } from "../../src/features/admin/hotels/service";
import { canSendBroadcast } from "../../src/features/admin/broadcast/service";
import { canScannerAccessEvent, shouldMarkTicketUsed } from "../../src/features/scanner/service";

describe("admin operations", () => {
  it("creates dashboard metrics for the required KPI set", () => {
    expect(createAdminDashboardMetrics({
      revenueTodayCents: 100,
      revenueWeekCents: 200,
      revenueMonthCents: 300,
      ticketsSold: 4,
      activeEvents: 2,
      soldOutEvents: 1,
      waitlistTotal: 8,
      pendingVerifications: 3,
      newUsers: 5,
      scannerActivity: 6,
      addonRevenueCents: 70,
      hotelRevenueCents: 80,
    })).toHaveLength(12);
  });

  it("requires confirmation for critical ticket actions", () => {
    expect(requiresTicketActionConfirmation("mark_used")).toBe(true);
    expect(requiresTicketActionConfirmation("resend")).toBe(false);
  });

  it("allows confirmation resend only for paid orders", () => {
    expect(canResendOrderConfirmation({ paymentStatus: "paid" })).toBe(true);
    expect(canResendOrderConfirmation({ paymentStatus: "failed" })).toBe(false);
  });

  it("calculates hotel margin", () => {
    expect(calculateHotelMarginCents({ salePriceCents: 30000, costPriceCents: 22000 })).toBe(8000);
  });

  it("validates broadcast drafts", () => {
    expect(canSendBroadcast({ channels: ["push"], segment: "all_users", title: "Update", body: "Tonight" })).toBe(true);
    expect(canSendBroadcast({ channels: [], segment: "all_users", title: "Update", body: "Tonight" })).toBe(false);
  });

  it("restricts scanner access to assigned active events", () => {
    expect(canScannerAccessEvent({ scannerEventIds: ["event-1"], eventId: "event-1" })).toBe(true);
    expect(canScannerAccessEvent({ scannerEventIds: ["event-1"], eventId: "event-2" })).toBe(false);
    expect(shouldMarkTicketUsed("ok")).toBe(true);
  });
});
