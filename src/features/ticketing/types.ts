export type TicketKind = "standard" | "vip";

export type TicketTypeConfig = {
  id: string;
  kind: TicketKind;
  title: string;
  priceCents: number;
  capacity: number;
};

export type TicketInventory = {
  capacity: number;
  sold: number;
  reserved: number;
};

export type TicketAvailability = "available" | "few_left" | "sold_out" | "waitlist";

export type TicketPurchaseEligibility = {
  allowed: boolean;
  reason?: "unverified" | "sold_out" | "membership_required" | "event_unavailable";
};

export type TicketLifecycleStatus = "reserved" | "paid" | "valid" | "used" | "expired" | "cancelled";

export type TicketPayload = {
  ticketId: string;
  eventId: string;
  userId: string;
  holderName: string;
  gender: "female" | "male" | "diverse";
  ticketType: TicketKind;
  status: TicketLifecycleStatus;
};
