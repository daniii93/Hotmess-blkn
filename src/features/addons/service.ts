import type { AddonEligibility } from "./types";

export const getAddonEligibility = (params: {
  hasTicket: boolean;
  inventory?: number;
  addonType?: string;
  hasTable?: boolean;
  hasDrinkPackage?: boolean;
  requiresMembership?: boolean;
  hasMembership?: boolean;
}): AddonEligibility => {
  if (!params.hasTicket) return { eligible: false, reason: "requires_ticket" };
  if (params.inventory !== undefined && params.inventory <= 0) return { eligible: false, reason: "sold_out" };
  if (params.addonType === "birthday" && !params.hasTable) return { eligible: false, reason: "requires_table" };
  if (params.addonType === "fruit_platter" && !params.hasTable) return { eligible: false, reason: "requires_table" };
  if (params.addonType === "bottle_service" && (!params.hasTable || !params.hasDrinkPackage)) {
    return { eligible: false, reason: "requires_table_and_drink_package" };
  }
  if (params.requiresMembership && !params.hasMembership) return { eligible: false, reason: "members_only" };

  return { eligible: true };
};
