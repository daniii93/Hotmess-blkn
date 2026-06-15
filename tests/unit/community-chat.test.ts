import { canAccessEventChat, canCreatePoll } from "../../src/features/chat/service";

describe("event chat service", () => {
  it("allows event chat only with a valid ticket", () => {
    expect(canAccessEventChat({ status: "valid" })).toBe(true);
    expect(canAccessEventChat({ status: "cancelled" })).toBe(false);
  });

  it("requires at least two poll options", () => {
    expect(canCreatePoll({ question: "Treffpunkt?", options: ["Hotel", "Venue"] })).toBe(true);
    expect(canCreatePoll({ question: "Treffpunkt?", options: ["Hotel"] })).toBe(false);
  });
});
