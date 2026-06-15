export type AddonType =
  | "drink_package"
  | "fruit_platter"
  | "fast_lane"
  | "table"
  | "birthday"
  | "hotel"
  | "bottle_service";

export type AddonEligibility = {
  eligible: boolean;
  reason?: "sold_out" | "requires_ticket" | "requires_table" | "requires_table_and_drink_package" | "members_only";
};

export type TableType = "standard" | "vip" | "premium";

export type EventTable = {
  id: string;
  eventId: string;
  type: TableType;
  tableNumber: string;
  capacity: number;
  minimumSpendCents: number;
  priceCents: number;
  status: "available" | "reserved" | "confirmed" | "blocked";
};
