import type { GenderBalanceConfig } from "../gender-balance/types";
import type { TicketTypeConfig } from "../ticketing/types";

export type EventCategory = "club" | "rooftop" | "dinner" | "festival" | "travel" | "private";

export type EventStatus = "draft" | "published" | "sold_out" | "cancelled" | "completed";

export type HotmessEvent = {
  id: string;
  title: string;
  slug: string;
  city: string;
  venueId?: string;
  category: EventCategory;
  shortDescription: string;
  longDescription?: string;
  heroImage?: string;
  capacityTotal: number;
  genderBalance?: GenderBalanceConfig;
  ticketTypes?: TicketTypeConfig[];
  startAt: string;
  endAt?: string;
  doorsOpenAt?: string;
  dressCode?: string;
  status: EventStatus;
};

export type EventPublishReadiness = {
  ready: boolean;
  missingFields: string[];
};

export type EventLifecycleAction = "publish" | "sell_out" | "cancel" | "complete";

export type EventKpiSnapshot = {
  ticketsSold: number;
  ticketsUsed: number;
  noShows: number;
  waitlistSize: number;
  conversionRate: number;
  revenueCents: number;
};

export type EventDiscoveryFilter = {
  city?: string;
  category?: EventCategory;
  fromDate?: string;
  toDate?: string;
  onlyAvailable?: boolean;
  vipAvailable?: boolean;
};
