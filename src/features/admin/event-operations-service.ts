import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type EventOperationsSnapshot = {
  eventId: string;
  title: string;
  checkin: {
    expected: number;
    checkedIn: number;
    waitlist: number;
  };
  tables: Array<{ id: string; label: string; persons: number; status: string }>;
  drinks: Array<{ id: string; packageName: string; service: string; status: string; preferredTime: string }>;
  birthdays: Array<{ id: string; person: string; time: string; surprise: boolean; status: string }>;
  hotelCodes: Array<{ id: string; code: string; status: string; commission: number }>;
  hotmessTime: Array<{ id: string; label: string; gross: number; split: string; status: string }>;
  settlement: {
    tickets: number;
    addons: number;
    hotel: number;
    hotmessTime: number;
    other: number;
    costs: number;
    net: number;
    status: string;
  };
};

const safeRows = async <T>(table: string, select: string, configure?: (query: any) => any): Promise<T[]> => {
  const supabase = createSupabaseAdminClient();
  let query = supabase.from(table).select(select);
  if (configure) query = configure(query);
  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as T[];
};

const safeSingle = async <T>(table: string, select: string, configure?: (query: any) => any): Promise<T | null> => {
  const supabase = createSupabaseAdminClient();
  let query = supabase.from(table).select(select);
  if (configure) query = configure(query);
  const { data, error } = await query.maybeSingle();
  if (error) return null;
  return (data ?? null) as T | null;
};

const centsToEuro = (cents: number | null | undefined) => Math.round(Number(cents ?? 0) / 100);

export const getEventOperationsSnapshot = async (eventRef: string): Promise<EventOperationsSnapshot> => {
  const event =
    (await safeSingle<any>("events", "id,title,slug", (q) => q.eq("id", eventRef))) ??
    (await safeSingle<any>("events", "id,title,slug", (q) => q.eq("slug", eventRef))) ??
    { id: eventRef, title: "Event", slug: eventRef };

  const eventId = event.id;
  const [tickets, waitlist, tables, eventTables, drinks, drinkPackages, birthdays, hotelCodes, blocks, settlement] = await Promise.all([
    safeRows<any>("tickets", "id,status", (q) => q.eq("event_id", eventId).in("status", ["valid", "used"])),
    safeRows<any>("waitlist", "id", (q) => q.eq("event_id", eventId).eq("status", "waiting")),
    safeRows<any>("table_bookings", "id,event_table_id,table_id,persons_count,status", (q) => q.eq("event_id", eventId).order("created_at", { ascending: true })),
    safeRows<any>("event_tables", "id,name,label,table_type", (q) => q.eq("event_id", eventId)),
    safeRows<any>("drink_package_bookings", "id,package_id,drink_package_id,service_type,preferred_time,status", (q) => q.eq("event_id", eventId).order("created_at", { ascending: true })),
    safeRows<any>("drink_packages", "id,name", (q) => q.eq("event_id", eventId)),
    safeRows<any>("birthday_package_bookings", "id,birthday_person_id,announcement_time,is_surprise,status", (q) => q.eq("event_id", eventId).order("created_at", { ascending: true })),
    safeRows<any>("hotel_codes", "id,code,status,commission_cents", (q) => q.eq("event_id", eventId).order("created_at", { ascending: false })),
    safeRows<any>("hotmess_time_blocks", "id,label,gross_sales_cents,hotmess_share_cents,partner_share_cents,status", (q) => q.eq("event_id", eventId).order("starts_at", { ascending: true })),
    safeSingle<any>("event_settlements", "ticket_revenue_cents,addon_revenue_cents,hotel_commission_cents,hotmess_time_revenue_cents,other_revenue_cents,cost_cents,net_profit_cents,status", (q) => q.eq("event_id", eventId)),
  ]);

  const tableById = new Map(eventTables.map((table) => [table.id, table]));
  const drinkById = new Map(drinkPackages.map((pkg) => [pkg.id, pkg]));
  const checkedIn = tickets.filter((ticket) => ticket.status === "used").length;
  const expected = tickets.length;
  const hotelCommission = hotelCodes.reduce((sum, code) => sum + centsToEuro(code.commission_cents) * 100, 0);
  const timeRevenue = blocks.reduce((sum, block) => sum + Number(block.hotmess_share_cents ?? 0), 0);
  const ticketRevenue = Number(settlement?.ticket_revenue_cents ?? 0);
  const addonRevenue = Number(settlement?.addon_revenue_cents ?? 0);
  const otherRevenue = Number(settlement?.other_revenue_cents ?? 0);
  const costs = Number(settlement?.cost_cents ?? 0);
  const hotelRevenue = Number(settlement?.hotel_commission_cents ?? hotelCommission);
  const hotmessTimeRevenue = Number(settlement?.hotmess_time_revenue_cents ?? timeRevenue);

  return {
    eventId,
    title: event.title ?? "Event",
    checkin: { expected, checkedIn, waitlist: waitlist.length },
    tables: tables.map((booking) => {
      const table = tableById.get(booking.event_table_id ?? booking.table_id);
      return {
        id: booking.id,
        label: table?.label ?? table?.name ?? "Tisch",
        persons: Number(booking.persons_count ?? 1),
        status: booking.status ?? "confirmed",
      };
    }),
    drinks: drinks.map((booking) => {
      const pkg = drinkById.get(booking.package_id ?? booking.drink_package_id);
      return {
        id: booking.id,
        packageName: pkg?.name ?? "Getraenkepaket",
        service: booking.service_type ?? "discreet",
        status: booking.status ?? "confirmed",
        preferredTime: booking.preferred_time ?? "-",
      };
    }),
    birthdays: birthdays.map((booking) => ({
      id: booking.id,
      person: booking.birthday_person_id ?? "Geburtstagsgast",
      time: booking.announcement_time ?? "-",
      surprise: Boolean(booking.is_surprise),
      status: booking.status ?? "confirmed",
    })),
    hotelCodes: hotelCodes.map((code) => ({
      id: code.id,
      code: code.code,
      status: code.status ?? "issued",
      commission: centsToEuro(code.commission_cents),
    })),
    hotmessTime: blocks.map((block) => ({
      id: block.id,
      label: block.label,
      gross: centsToEuro(block.gross_sales_cents),
      split: `${centsToEuro(block.hotmess_share_cents)} EUR / ${centsToEuro(block.partner_share_cents)} EUR`,
      status: block.status ?? "open",
    })),
    settlement: {
      tickets: centsToEuro(ticketRevenue),
      addons: centsToEuro(addonRevenue),
      hotel: centsToEuro(hotelRevenue),
      hotmessTime: centsToEuro(hotmessTimeRevenue),
      other: centsToEuro(otherRevenue),
      costs: centsToEuro(costs),
      net: centsToEuro(ticketRevenue + addonRevenue + hotelRevenue + hotmessTimeRevenue + otherRevenue - costs),
      status: settlement?.status ?? "draft",
    },
  };
};

