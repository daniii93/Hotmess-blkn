import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { LiveEvent } from "./live-service";

export type EventTransparencyMode = "full" | "partial" | "minimal";

export type EventGenderTransparency = {
  label: string;
  count: number;
  percent: number;
};

export type EventTransparencySummary = {
  mode: EventTransparencyMode;
  capacity: number;
  sold: number;
  reserved: number;
  available: number;
  waitlist: number;
  soldPercent: number;
  lastTicketActivityAt: string | null;
  gender: EventGenderTransparency[] | null;
  trustItems: string[];
};

const ticketSoldStatuses = ["paid", "valid", "used"] as const;
const ticketReservedStatuses = ["reserved"] as const;
const waitlistOpenStatuses = ["waiting", "promoted"] as const;

const sumTicketCapacity = (event: LiveEvent) =>
  event.ticketTypes.reduce((total, ticketType) => total + Number(ticketType.quantityTotal ?? 0), 0);

const sumTicketSold = (event: LiveEvent) =>
  event.ticketTypes.reduce((total, ticketType) => total + Number(ticketType.quantitySold ?? 0), 0);

const genderCapacity = (event: LiveEvent) => {
  const config = event.genderConfig;
  if (!config) return 0;
  return Number(config.capacityFemale ?? 0) + Number(config.capacityMale ?? 0) + Number(config.capacityDiverse ?? 0);
};

const genderSold = (event: LiveEvent) => {
  const config = event.genderConfig;
  if (!config) return 0;
  return Number(config.soldFemale ?? 0) + Number(config.soldMale ?? 0) + Number(config.soldDiverse ?? 0);
};

const buildGender = (event: LiveEvent): EventGenderTransparency[] | null => {
  const config = event.genderConfig;
  if (!config) return null;

  const rows = [
    { label: "Frauen", count: Number(config.soldFemale ?? 0) },
    { label: "Maenner", count: Number(config.soldMale ?? 0) },
    { label: "Divers", count: Number(config.soldDiverse ?? 0) },
  ].filter((row) => row.count > 0 || row.label !== "Divers" || Number(config.capacityDiverse ?? 0) > 0);

  const total = rows.reduce((sum, row) => sum + row.count, 0);
  if (total <= 0) return null;

  return rows.map((row) => ({
    ...row,
    percent: Math.round((row.count / total) * 100),
  }));
};

const countRows = async (table: string, apply: (query: any) => any) => {
  try {
    const supabase = createSupabaseAdminClient();
    const { count, error } = await apply(supabase.from(table).select("id", { count: "exact", head: true }));
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
};

const latestTicketActivity = async (eventId: string) => {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("tickets")
      .select("created_at")
      .eq("event_id", eventId)
      .in("status", [...ticketSoldStatuses, ...ticketReservedStatuses])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return null;
    return data?.created_at ?? null;
  } catch {
    return null;
  }
};

export const buildEventTransparency = (
  event: LiveEvent,
  extra: { reserved?: number; waitlist?: number; lastTicketActivityAt?: string | null } = {},
): EventTransparencySummary => {
  const capacity = Number(event.capacityTotal ?? 0) || genderCapacity(event) || sumTicketCapacity(event);
  const sold = genderSold(event) || sumTicketSold(event);
  const reserved = Number(extra.reserved ?? 0);
  const waitlist = Number(extra.waitlist ?? 0);
  const available = capacity > 0 ? Math.max(0, capacity - sold - reserved) : 0;
  const soldPercent = capacity > 0 ? Math.min(100, Math.round((sold / capacity) * 100)) : 0;
  const gender = buildGender(event);

  const trustItems = [
    "Echte Ticketzahlen aus HotMess",
    capacity > 0 ? "Kapazitaet offen ausgewiesen" : null,
    waitlist > 0 ? "Warteliste transparent sichtbar" : "Warteliste wird nur bei echten Eintraegen gezeigt",
    gender ? "Teilnehmerstruktur nur aggregiert" : null,
    event.status === "completed" ? "Event bereits erfolgreich durchgefuehrt" : "Verifizierter HotMess Event",
  ].filter(Boolean) as string[];

  return {
    mode: "full",
    capacity,
    sold,
    reserved,
    available,
    waitlist,
    soldPercent,
    lastTicketActivityAt: extra.lastTicketActivityAt ?? null,
    gender,
    trustItems,
  };
};

export const getEventTransparency = async (event: LiveEvent): Promise<EventTransparencySummary> => {
  const [reserved, waitlist, lastTicketActivityAt] = await Promise.all([
    countRows("tickets", (query) => query.eq("event_id", event.id).in("status", ticketReservedStatuses)),
    countRows("waitlist", (query) => query.eq("event_id", event.id).in("status", waitlistOpenStatuses)),
    latestTicketActivity(event.id),
  ]);

  return buildEventTransparency(event, { reserved, waitlist, lastTicketActivityAt });
};

export const getEventTransparencyMap = async (events: LiveEvent[]) => {
  const summaries = await Promise.all(events.map(async (event) => [event.id, await getEventTransparency(event)] as const));
  return new Map(summaries);
};
