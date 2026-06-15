import { decideGenderBalance } from "../../src/features/gender-balance/service";

describe("gender balance service", () => {
  it("rejects a full quota bucket", () => {
    const decision = decideGenderBalance(
      "female",
      100,
      { female: 45, male: 10, diverse: 0 },
      { enabled: true, quotas: { female: 45, male: 45, diverse: 10 }, waitlistWhenFull: true },
    );

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("quota_full");
  });
});
