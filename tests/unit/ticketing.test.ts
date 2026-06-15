import { getRemainingTickets, getTicketAvailability } from "../../src/features/ticketing/service";

describe("ticketing service", () => {
  it("calculates remaining tickets", () => {
    expect(getRemainingTickets({ capacity: 100, sold: 40, reserved: 5 })).toBe(55);
  });

  it("marks zero inventory as sold out", () => {
    expect(getTicketAvailability({ capacity: 10, sold: 10, reserved: 0 })).toBe("sold_out");
  });
});
