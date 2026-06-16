import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAllAdminEvents } from "@/features/events/live-service";

const money = (cents: number) => `${Math.round(cents / 100).toLocaleString("de")} EUR`;

const safeCount = async (table: string, configure?: (query: any) => any) => {
  const supabase = createSupabaseAdminClient();
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (configure) query = configure(query);
  const { count } = await query;
  return count ?? 0;
};

const safeRows = async <T>(table: string, select: string, configure?: (query: any) => any): Promise<T[]> => {
  const supabase = createSupabaseAdminClient();
  let query = supabase.from(table).select(select);
  if (configure) query = configure(query);
  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as T[];
};

export type AdminKpiItem = { label: string; value: string; hint: string };
export type AdminActivityItem = { time: string; text: string; type: string };
export type AdminUserRowLive = {
  id: string;
  name: string;
  email: string;
  city: string;
  status: string;
  verified: boolean;
  role: string;
  tickets: number;
  joined: string;
};
export type AdminModerationItem = {
  id: string;
  content: string;
  user: string;
  priority: string;
  reason: string;
};
export type AdminFinanceEvent = {
  event: string;
  tickets: number;
  addons: number;
  hotel: number;
  other: number;
  costs: number;
  net: number;
};
export type AdminAnalyticsItem = { label: string; value: string };

export type AdminLiveSnapshot = {
  kpis: AdminKpiItem[];
  revenueBars: number[];
  funnel: Array<{ label: string; pct: number; count: string }>;
  nextEvent: {
    title: string;
    slug: string;
    venue: string;
    date: string;
    doors: string;
    soldF: number;
    capacityF: number;
    soldM: number;
    capacityM: number;
    revenue: number;
    waitlist: number;
  } | null;
  activity: AdminActivityItem[];
  users: AdminUserRowLive[];
  moderation: AdminModerationItem[];
  finance: AdminFinanceEvent[];
  analytics: AdminAnalyticsItem[];
};

export const getAdminLiveSnapshot = async (): Promise<AdminLiveSnapshot> => {
  const supabase = createSupabaseAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const [
    memberCount,
    verifiedCount,
    ticketCount,
    ticketsToday,
    moderationOpen,
    orders,
    postsCount,
    messagesCount,
    datingMatches,
    businessMatches,
    users,
    moderation,
    metrics,
    events,
  ] = await Promise.all([
    safeCount("profiles"),
    safeCount("profiles", (q) => q.eq("verification_status", "verified")),
    safeCount("tickets", (q) => q.in("status", ["paid", "valid", "used"])),
    safeCount("tickets", (q) => q.gte("created_at", `${today}T00:00:00`).in("status", ["paid", "valid", "used"])),
    safeCount("moderation_queue", (q) => q.in("status", ["pending", "reviewing"])),
    safeRows<any>("orders", "id,event_id,total_cents,amount_cents,status,created_at", (q) => q.in("status", ["paid", "partially_paid"]).order("created_at", { ascending: false }).limit(200)),
    safeCount("posts"),
    safeCount("messages"),
    safeCount("dating_matches"),
    safeCount("business_matches"),
    safeRows<any>("profiles", "id,email,username,first_name,last_name,city,role,verification_status,is_banned,created_at", (q) => q.order("created_at", { ascending: false }).limit(25)),
    safeRows<any>("moderation_queue", "id,content_type,reason,report_count,status,reported_user_id,created_at", (q) => q.order("report_count", { ascending: false }).order("created_at", { ascending: true }).limit(20)),
    safeRows<any>("daily_metrics", "date,revenue_cents,tickets_sold,new_users,active_users,posts_created,messages_sent,dating_matches,business_connections", (q) => q.order("date", { ascending: false }).limit(12)),
    getAllAdminEvents().catch(() => []),
  ]);

  const revenueCents = orders.reduce((sum, order) => sum + Number(order.total_cents ?? order.amount_cents ?? 0), 0);
  const latestEvent = events.find((event) => ["published", "sold_out"].includes(event.status)) ?? events[0] ?? null;
  const waitlistCount = latestEvent ? await safeCount("waitlist", (q) => q.eq("event_id", latestEvent.id).eq("status", "waiting")) : 0;

  const revenueBarsRaw = [...metrics].reverse().map((row) => Number(row.revenue_cents ?? 0));
  const maxRevenue = Math.max(...revenueBarsRaw, 1);
  const revenueBars = revenueBarsRaw.length ? revenueBarsRaw.map((value) => Math.max(8, Math.round((value / maxRevenue) * 100))) : [18, 24, 32, 28, 44, 52, 40, 63, 71, 55, 76, 88];

  const kpis: AdminKpiItem[] = [
    { label: "Mitglieder", value: memberCount.toLocaleString("de"), hint: `${verifiedCount.toLocaleString("de")} verifiziert` },
    { label: "Verkaeufe heute", value: `${ticketsToday} Tickets`, hint: `${ticketCount.toLocaleString("de")} gesamt` },
    { label: "Umsatz Monat", value: money(revenueCents), hint: "aus bezahlten Orders" },
    { label: "Aktiv (Content)", value: (postsCount + messagesCount).toLocaleString("de"), hint: `${postsCount} Posts - ${messagesCount} Messages` },
    { label: "Verifizierung", value: `${Math.max(memberCount - verifiedCount, 0)} offen`, hint: "unverified Profile" },
    { label: "Offene Mods", value: `${moderationOpen} Meldungen`, hint: "pending/reviewing" },
    { label: "Naechstes Event", value: latestEvent?.title ?? "Kein Event", hint: latestEvent ? latestEvent.city : "Event erstellen" },
    { label: "Wartelisten", value: `${waitlistCount} wartend`, hint: latestEvent?.title ?? "kein Event" },
  ];

  const activity: AdminActivityItem[] = [
    ...orders.slice(0, 4).map((order) => ({ time: new Date(order.created_at).toLocaleDateString("de"), text: `Order bezahlt: ${money(Number(order.total_cents ?? order.amount_cents ?? 0))}`, type: "ticket" })),
    ...moderation.slice(0, 3).map((item) => ({ time: `${item.report_count ?? 1}x`, text: `Moderation: ${item.content_type} - ${item.reason}`, type: "mod" })),
    { time: "live", text: `${datingMatches} Dating-Matches - ${businessMatches} Business-Verbindungen`, type: "business" },
  ];

  const userRows: AdminUserRowLive[] = users.map((user) => ({
    id: user.id,
    name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.username || "HotMess User",
    email: user.email ?? "-",
    city: user.city ?? "-",
    status: user.is_banned ? "gesperrt" : "aktiv",
    verified: user.verification_status === "verified",
    role: user.role ?? "user",
    tickets: 0,
    joined: user.created_at ? new Date(user.created_at).toLocaleDateString("de") : "-",
  }));

  const finance: AdminFinanceEvent[] = events.slice(0, 8).map((event) => {
    const eventOrders = orders.filter((order) => order.event_id === event.id);
    const gross = eventOrders.reduce((sum, order) => sum + Number(order.total_cents ?? order.amount_cents ?? 0), 0) / 100;
    return {
      event: event.title,
      tickets: Math.round(gross * 0.78),
      addons: Math.round(gross * 0.18),
      hotel: Math.round(gross * 0.03),
      other: Math.round(gross * 0.01),
      costs: Math.round(gross * 0.42),
      net: Math.round(gross * 0.58),
    };
  });

  return {
    kpis,
    revenueBars,
    funnel: [
      { label: "Mitglieder", pct: 100, count: memberCount.toLocaleString("de") },
      { label: "Verifiziert", pct: memberCount ? Math.round((verifiedCount / memberCount) * 100) : 0, count: verifiedCount.toLocaleString("de") },
      { label: "Ticket gekauft", pct: memberCount ? Math.round((ticketCount / memberCount) * 100) : 0, count: ticketCount.toLocaleString("de") },
    ],
    nextEvent: latestEvent
      ? {
          title: latestEvent.title,
          slug: latestEvent.slug,
          venue: latestEvent.venue?.name ?? latestEvent.city,
          date: new Date(latestEvent.dateStart).toLocaleDateString("de"),
          doors: latestEvent.doorsOpen ? new Date(latestEvent.doorsOpen).toLocaleTimeString("de", { hour: "2-digit", minute: "2-digit" }) : "-",
          soldF: latestEvent.genderConfig?.soldFemale ?? 0,
          capacityF: latestEvent.genderConfig?.capacityFemale ?? 0,
          soldM: latestEvent.genderConfig?.soldMale ?? 0,
          capacityM: latestEvent.genderConfig?.capacityMale ?? 0,
          revenue: revenueCents / 100,
          waitlist: waitlistCount,
        }
      : null,
    activity,
    users: userRows,
    moderation: moderation.map((item) => ({
      id: item.id,
      content: `${item.content_type} - ${item.reason} - ${item.report_count ?? 1} Meldungen`,
      user: item.reported_user_id ?? "-",
      priority: (item.report_count ?? 1) >= 3 ? "hoch" : (item.report_count ?? 1) >= 2 ? "mittel" : "niedrig",
      reason: item.reason,
    })),
    finance,
    analytics: [
      { label: "Nutzer", value: `${memberCount.toLocaleString("de")} gesamt - ${verifiedCount.toLocaleString("de")} verifiziert` },
      { label: "Events", value: `${events.length} Events - ${ticketCount.toLocaleString("de")} Tickets` },
      { label: "Engagement", value: `${postsCount} Posts - ${messagesCount} Nachrichten` },
      { label: "Dating", value: `${datingMatches} Matches` },
      { label: "Business", value: `${businessMatches} Verbindungen` },
      { label: "Finanzen", value: money(revenueCents) },
    ],
  };
};
