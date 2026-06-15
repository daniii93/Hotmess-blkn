import { calculateCheckoutTotals, calculateDiscountCents, validateCheckoutCart } from "../../src/features/checkout/service";
import { getAddonEligibility } from "../../src/features/addons/service";
import { getHotelInventoryStatus } from "../../src/features/hotels/service";
import { canCreateGroupBooking, createSplitPaymentLinks } from "../../src/features/group-booking/service";

describe("checkout core", () => {
  it("requires at least one ticket", () => {
    const result = validateCheckoutCart([
      { id: "fast-lane", title: "Fast Lane", itemType: "fast_lane", quantity: 1, unitPriceCents: 2500 },
    ]);

    expect(result.valid).toBe(false);
  });

  it("requires table and drink package for bottle service", () => {
    expect(getAddonEligibility({ hasTicket: true, addonType: "bottle_service", hasTable: true, hasDrinkPackage: false }).eligible).toBe(false);
    expect(getAddonEligibility({ hasTicket: true, addonType: "bottle_service", hasTable: true, hasDrinkPackage: true }).eligible).toBe(true);
  });

  it("calculates discount and checkout total", () => {
    const discount = calculateDiscountCents(10000, {
      code: "VIP20",
      type: "percent",
      value: 20,
      validFrom: "2026-01-01T00:00:00.000Z",
      validUntil: "2027-01-01T00:00:00.000Z",
      usedCount: 0,
    }, new Date("2026-06-01T00:00:00.000Z"));

    const totals = calculateCheckoutTotals([
      { id: "ticket", title: "Standard", itemType: "ticket", quantity: 1, unitPriceCents: 10000 },
    ], discount);

    expect(discount).toBe(2000);
    expect(totals.totalCents).toBeGreaterThan(8000);
  });

  it("marks hotel inventory sold out when no rooms are left", () => {
    expect(getHotelInventoryStatus({
      eventId: "event",
      hotelId: "hotel",
      roomType: "suite",
      totalRooms: 1,
      reservedRooms: 1,
      confirmedRooms: 0,
      priceCents: 20000,
      options: [],
    })).toBe("sold_out");
  });

  it("requires verified group members and creates split payment links", () => {
    const members = [
      { userId: "a", email: "a@example.com", verified: true, amountCents: 10000, paid: false },
      { userId: "b", email: "b@example.com", verified: true, amountCents: 15000, paid: false },
    ];

    expect(canCreateGroupBooking(members)).toBe(true);
    expect(createSplitPaymentLinks(members, new Date("2026-06-01T00:00:00.000Z"))).toHaveLength(2);
  });
});
