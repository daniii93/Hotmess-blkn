import type {
  TicketAvailability,
  TicketInventory,
  TicketLifecycleStatus,
  TicketPayload,
  TicketPurchaseEligibility,
} from "./types";

export const getRemainingTickets = ({ capacity, sold, reserved }: TicketInventory): number =>
  Math.max(0, capacity - sold - reserved);

export const getTicketAvailability = (inventory: TicketInventory): TicketAvailability => {
  const remaining = getRemainingTickets(inventory);

  if (remaining === 0) return "sold_out";
  if (remaining <= Math.max(3, Math.ceil(inventory.capacity * 0.1))) return "few_left";
  return "available";
};

export const getTicketPurchaseEligibility = (params: {
  userVerified: boolean;
  requiresMembership: boolean;
  hasRequiredMembership: boolean;
  inventory: TicketInventory;
  eventPublished: boolean;
}): TicketPurchaseEligibility => {
  if (!params.eventPublished) return { allowed: false, reason: "event_unavailable" };
  if (!params.userVerified) return { allowed: false, reason: "unverified" };
  if (params.requiresMembership && !params.hasRequiredMembership) {
    return { allowed: false, reason: "membership_required" };
  }
  if (getTicketAvailability(params.inventory) === "sold_out") {
    return { allowed: false, reason: "sold_out" };
  }

  return { allowed: true };
};

export const canTransitionTicketStatus = (
  current: TicketLifecycleStatus,
  next: TicketLifecycleStatus,
): boolean => {
  const allowed: Record<TicketLifecycleStatus, TicketLifecycleStatus[]> = {
    reserved: ["paid", "expired", "cancelled"],
    paid: ["valid", "cancelled"],
    valid: ["used", "cancelled"],
    used: [],
    expired: [],
    cancelled: [],
  };

  return allowed[current].includes(next);
};

export const buildTicketReferencePayload = (ticket: TicketPayload): Omit<TicketPayload, "holderName"> => ({
  ticketId: ticket.ticketId,
  eventId: ticket.eventId,
  userId: ticket.userId,
  gender: ticket.gender,
  ticketType: ticket.ticketType,
  status: ticket.status,
});

export const isValidEventChatTicket = (ticket?: Pick<TicketPayload, "status"> | null): boolean =>
  ticket?.status === "valid";

export const isEventSoldOut = (capacityTotal: number, soldByGender: Record<string, number>): boolean => {
  const sold = Object.values(soldByGender).reduce((sum, count) => sum + count, 0);
  return sold >= capacityTotal;
};
