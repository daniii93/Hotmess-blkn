import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile } from "@/features/events/live-service";
import type { GraphRelationship } from "./types";

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

const safe = async <T>(fallback: T, loader: () => Promise<T>): Promise<T> => {
  try {
    return await loader();
  } catch {
    return fallback;
  }
};

export const getGraphData = async () => {
  const profile = await safe(null, getCurrentUserProfile);
  const userId = profile?.id ?? null;

  const [
    follows,
    tickets,
    attendees,
    businessProfiles,
    providers,
    projects,
    orders,
    reviews,
    groupMembers,
    partners,
    jobs,
    applications,
    conversations,
  ] = await Promise.all([
    userId ? safeCount("follows", (query) => query.eq("follower_id", userId)) : Promise.resolve(0),
    userId ? safeCount("tickets", (query) => query.eq("user_id", userId).neq("status", "cancelled")) : Promise.resolve(0),
    safeCount("event_attendees"),
    safeCount("business_profiles", (query) => query.eq("is_active", true)),
    safeCount("local_service_provider_profiles", (query) => query.eq("verification_status", "verified")),
    userId ? safeCount("local_service_projects", (query) => query.eq("customer_id", userId)) : Promise.resolve(0),
    userId ? safeCount("local_service_orders", (query) => query.or(`customer_id.eq.${userId},provider_id.eq.${userId}`)) : Promise.resolve(0),
    safeCount("local_service_reviews"),
    safeCount("business_group_members"),
    safeCount("partners", (query) => query.eq("status", "active")),
    safeCount("job_listings", (query) => query.eq("status", "open")),
    userId ? safeCount("job_applications", (query) => query.eq("applicant_id", userId)) : Promise.resolve(0),
    userId ? safeCount("conversation_members", (query) => query.eq("user_id", userId).is("left_at", null)) : Promise.resolve(0),
  ]);

  const relationships: GraphRelationship[] = [
    { type: "follows", from: "user", to: "user", count: follows, publicSafe: false, note: "Nur eigene Follow-Zahlen im privaten Kontext." },
    { type: "has_ticket", from: "user", to: "ticket", count: tickets, publicSafe: false, note: "Wallet- und Event-Kontext, nie fremde Tickets." },
    { type: "attended_event", from: "user", to: "event", count: attendees, publicSafe: true, note: "Nur aggregiert fuer Transparenz und Empfehlungen." },
    { type: "owns_business_profile", from: "user", to: "business_profile", count: businessProfiles, publicSafe: true, note: "Aktive Business-Profile als Plattformsignal." },
    { type: "provider_for_category", from: "service_provider", to: "service_project", count: providers, publicSafe: true, note: "Nur verifizierte Anbieter oeffentlich sichtbar." },
    { type: "created_project", from: "user", to: "service_project", count: projects, publicSafe: false, note: "Eigene Auftraege fuer Wallet und Services." },
    { type: "completed_order", from: "service_provider", to: "service_project", count: orders, publicSafe: false, note: "Eigene Orders privat, aggregiert fuer Admin." },
    { type: "reviewed", from: "user", to: "service_provider", count: reviews, publicSafe: true, note: "Bewertungen nur nach Sichtbarkeitsregeln." },
    { type: "member_of_community", from: "user", to: "community", count: groupMembers, publicSafe: true, note: "Private Gruppen bleiben geschuetzt." },
    { type: "partner_offer", from: "partner", to: "benefit", count: partners, publicSafe: true, note: "Aktive Partner als Benefit-Grundlage." },
    { type: "applied_for_job", from: "user", to: "job", count: applications, publicSafe: false, note: "Bewerbungen nie oeffentlich." },
    { type: "recommended", from: "user", to: "conversation", count: conversations, publicSafe: false, note: "Chatdaten werden nicht fuer oeffentliche Empfehlungen genutzt." },
    { type: "trusted_signal", from: "business_profile", to: "job", count: jobs, publicSafe: true, note: "Offene Jobs nur im Business-Kontext." },
  ];

  return {
    profile,
    relationships,
    empty: "Noch nicht genuegend Beziehungen vorhanden, um sinnvolle Verbindungen abzuleiten.",
  };
};

export type GraphData = Awaited<ReturnType<typeof getGraphData>>;
