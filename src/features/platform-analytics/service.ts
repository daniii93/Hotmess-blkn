import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PlatformMetric } from "./types";

const safeCount = async (table: string, configure?: (query: any) => any) => {
  try {
    const supabase = createSupabaseAdminClient();
    let query = supabase.from(table).select("id", { count: "exact", head: true });
    if (configure) query = configure(query);
    const { count, error } = await query;
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
};

const safeRows = async <T>(table: string, select: string, configure?: (query: any) => any): Promise<T[]> => {
  try {
    const supabase = createSupabaseAdminClient();
    let query = supabase.from(table).select(select);
    if (configure) query = configure(query);
    const { data, error } = await query;
    if (error) return [];
    return (data ?? []) as T[];
  } catch {
    return [];
  }
};

export const getPlatformAnalyticsData = async () => {
  const [
    users,
    verified,
    events,
    tickets,
    orders,
    serviceLeads,
    serviceOrders,
    businessProfiles,
    coffeeChats,
    jobs,
    applications,
    partnerClicks,
    partnerReferrals,
    posts,
    moderation,
    sanctions,
    refunds,
    dailyMetrics,
  ] = await Promise.all([
    safeCount("profiles"),
    safeCount("profiles", (query) => query.eq("verification_status", "verified")),
    safeCount("events", (query) => query.in("status", ["published", "sold_out", "completed"])),
    safeCount("tickets", (query) => query.neq("status", "cancelled")),
    safeCount("orders", (query) => query.in("status", ["paid", "completed"])),
    safeCount("local_service_leads", (query) => query.in("status", ["available", "purchased", "converted"])),
    safeCount("local_service_orders", (query) => query.in("status", ["approved", "paid", "completed"])),
    safeCount("business_profiles", (query) => query.eq("is_active", true)),
    safeCount("coffee_chats", (query) => query.in("status", ["proposed", "confirmed", "completed"])),
    safeCount("job_listings", (query) => query.eq("status", "open")),
    safeCount("job_applications"),
    safeCount("partner_link_clicks"),
    safeCount("partner_referrals", (query) => query.in("status", ["pending", "confirmed", "paid"])),
    safeCount("posts"),
    safeCount("moderation_queue", (query) => query.in("status", ["pending", "reviewing"])),
    safeCount("user_sanctions", (query) => query.eq("is_active", true)),
    safeCount("order_refunds", (query) => query.in("status", ["requested", "pending", "processing"])),
    safeRows<any>("daily_metrics", "date,new_users,active_users,tickets_sold,revenue_cents,posts_created,messages_sent,dating_matches,business_connections", (query) =>
      query.order("date", { ascending: false }).limit(14),
    ),
  ]);

  const metrics: PlatformMetric[] = [
    { label: "Mitglieder", value: users, href: "/admin/users", note: "Alle Profile im System." },
    { label: "Verifiziert", value: verified, href: "/admin/users/verifications", note: "Aktive Plattformbasis." },
    { label: "Events", value: events, href: "/admin/events", note: "Publiziert, ausverkauft oder abgeschlossen." },
    { label: "Tickets", value: tickets, href: "/admin/events", note: "Nicht stornierte Tickets." },
    { label: "Bestellungen", value: orders, href: "/admin/finance", note: "Paid/completed Orders." },
    { label: "Service Leads", value: serviceLeads, href: "/admin/local-services", note: "Dienstleistungs-Marketplace." },
    { label: "Service Orders", value: serviceOrders, href: "/admin/local-services", note: "Genehmigt, bezahlt oder abgeschlossen." },
    { label: "Business Profile", value: businessProfiles, href: "/admin/users", note: "Aktive Business-Signale." },
    { label: "Coffee Chats", value: coffeeChats, href: "/admin/analytics", note: "Business Relationship Aktivitaet." },
    { label: "Jobs", value: jobs, href: "/business/jobs", note: "Offene Job Listings." },
    { label: "Bewerbungen", value: applications, href: "/admin/analytics", note: "Nur aggregiert." },
    { label: "Partner Klicks", value: partnerClicks, href: "/admin/partners-program", note: "Partner Funnel." },
    { label: "Partner Referrals", value: partnerReferrals, href: "/admin/partners-program", note: "Provisionen ohne Fake-Umsatz." },
    { label: "Posts", value: posts, href: "/admin/analytics", note: "Social Aktivitaet." },
    { label: "Moderation offen", value: moderation, href: "/admin/moderation", note: "Admin-only Qualitaet." },
    { label: "Aktive Sanktionen", value: sanctions, href: "/admin/users", note: "Nicht oeffentlich." },
    { label: "Refunds offen", value: refunds, href: "/admin/finance", note: "Commerce Risiko." },
  ];

  return {
    metrics,
    dailyMetrics: dailyMetrics.map((row) => ({
      date: String(row.date),
      newUsers: Number(row.new_users ?? 0),
      activeUsers: Number(row.active_users ?? 0),
      ticketsSold: Number(row.tickets_sold ?? 0),
      revenueCents: Number(row.revenue_cents ?? 0),
      postsCreated: Number(row.posts_created ?? 0),
      messagesSent: Number(row.messages_sent ?? 0),
      datingMatches: Number(row.dating_matches ?? 0),
      businessConnections: Number(row.business_connections ?? 0),
    })),
    empty: "Noch nicht genuegend Daten fuer diese Auswertung vorhanden.",
  };
};

export type PlatformAnalyticsData = Awaited<ReturnType<typeof getPlatformAnalyticsData>>;
