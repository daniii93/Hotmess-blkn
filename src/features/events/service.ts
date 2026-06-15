import type {
  EventDiscoveryFilter,
  EventKpiSnapshot,
  EventLifecycleAction,
  EventPublishReadiness,
  HotmessEvent,
} from "./types";
import { isGenderBalanceConfigValid } from "../gender-balance/service";
import { isEventSoldOut } from "../ticketing/service";

const REQUIRED_PUBLISH_FIELDS: Array<keyof HotmessEvent> = [
  "title",
  "slug",
  "city",
  "category",
  "shortDescription",
  "venueId",
  "heroImage",
  "capacityTotal",
  "genderBalance",
  "ticketTypes",
  "startAt",
];

export const getEventPublishReadiness = (event: Partial<HotmessEvent>): EventPublishReadiness => {
  const missingFields = REQUIRED_PUBLISH_FIELDS.filter((field) => {
    const value = event[field];
    return Array.isArray(value) ? value.length === 0 : !value;
  });

  if (event.startAt && new Date(event.startAt).getTime() <= Date.now()) {
    missingFields.push("startAt");
  }

  if (event.genderBalance && !isGenderBalanceConfigValid(event.genderBalance)) {
    missingFields.push("genderBalance");
  }

  return {
    ready: missingFields.length === 0,
    missingFields,
  };
};

export const canPublishEvent = (event: Partial<HotmessEvent>): boolean =>
  getEventPublishReadiness(event).ready;

export const isUpcomingEvent = (event: Pick<HotmessEvent, "startAt">, now = new Date()): boolean =>
  new Date(event.startAt).getTime() > now.getTime();

export const canTransitionEvent = (
  event: Pick<HotmessEvent, "status" | "startAt" | "endAt">,
  action: EventLifecycleAction,
  now = new Date(),
): boolean => {
  if (action === "publish") return event.status === "draft" && new Date(event.startAt).getTime() > now.getTime();
  if (action === "sell_out") return event.status === "published";
  if (action === "cancel") return event.status === "published" || event.status === "draft";
  if (action === "complete") {
    const endAt = event.endAt ?? event.startAt;
    return event.status === "published" && new Date(endAt).getTime() <= now.getTime();
  }

  return false;
};

export const getNextEventStatus = (
  event: Pick<HotmessEvent, "status" | "startAt" | "endAt">,
  action: EventLifecycleAction,
  now = new Date(),
): HotmessEvent["status"] => {
  if (!canTransitionEvent(event, action, now)) return event.status;
  if (action === "publish") return "published";
  if (action === "sell_out") return "sold_out";
  if (action === "cancel") return "cancelled";
  return "completed";
};

export const shouldMarkSoldOut = (event: Pick<HotmessEvent, "capacityTotal">, soldByGender: Record<string, number>): boolean =>
  isEventSoldOut(event.capacityTotal, soldByGender);

export const calculateEventKpis = (input: {
  ticketsSold: number;
  ticketsUsed: number;
  waitlistSize: number;
  revenueCents: number;
  ticketViews?: number;
}): EventKpiSnapshot => {
  const noShows = Math.max(0, input.ticketsSold - input.ticketsUsed);
  const ticketViews = input.ticketViews ?? input.ticketsSold;

  return {
    ticketsSold: input.ticketsSold,
    ticketsUsed: input.ticketsUsed,
    noShows,
    waitlistSize: input.waitlistSize,
    conversionRate: ticketViews > 0 ? input.ticketsSold / ticketViews : 0,
    revenueCents: input.revenueCents,
  };
};

export const filterEventsForDiscovery = (
  events: HotmessEvent[],
  filter: EventDiscoveryFilter,
): HotmessEvent[] =>
  events.filter((event) => {
    if (filter.city && event.city !== filter.city) return false;
    if (filter.category && event.category !== filter.category) return false;
    if (filter.fromDate && new Date(event.startAt) < new Date(filter.fromDate)) return false;
    if (filter.toDate && new Date(event.startAt) > new Date(filter.toDate)) return false;
    if (filter.onlyAvailable && event.status !== "published") return false;
    if (filter.vipAvailable && !event.ticketTypes?.some((ticketType) => ticketType.kind === "vip")) return false;
    return true;
  });
