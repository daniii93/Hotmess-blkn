import "server-only";

import { getCurrentUserProfile } from "@/features/events/live-service";
import { getLocalServiceMe } from "@/features/local-services/service";
import { getBusinessMe } from "@/features/business/live-service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const safe = async <T>(fallback: T, loader: () => Promise<T>): Promise<T> => {
  try {
    return await loader();
  } catch {
    return fallback;
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

export const getFoundationData = async () => {
  const profile = await safe(null, getCurrentUserProfile);
  const [businessMe, localMe] = await Promise.all([safe(null, getBusinessMe), safe(null, getLocalServiceMe)]);

  const [
    verifiedMembers,
    verifiedBusinesses,
    verifiedProviders,
    completedServiceOrders,
    serviceReviews,
    publishedEvents,
    activePartners,
    pendingModeration,
    activeSanctions,
    openDisputes,
    contactViolations,
    openRefunds,
    datingSubscriptions,
    businessSubscriptions,
    localSubscriptions,
    partnerMaterials,
    recentAudit,
  ] = await Promise.all([
    safeCount("profiles", (query) => query.eq("verification_status", "verified").eq("is_banned", false)),
    safeCount("business_profiles", (query) => query.eq("verification_status", "verified")),
    safeCount("local_service_provider_profiles", (query) => query.eq("verification_status", "verified")),
    safeCount("local_service_orders", (query) => query.in("status", ["completed", "approved", "paid"])),
    safeCount("local_service_reviews"),
    safeCount("events", (query) => query.in("status", ["published", "sold_out", "completed"])),
    safeCount("partners", (query) => query.eq("status", "active")),
    safeCount("moderation_queue", (query) => query.in("status", ["pending", "reviewing"])),
    safeCount("user_sanctions", (query) => query.eq("is_active", true)),
    safeCount("local_service_disputes", (query) => query.in("status", ["open", "reviewing"])),
    safeCount("local_service_contact_violations", (query) => query.in("status", ["open", "reviewing"])),
    safeCount("order_refunds", (query) => query.in("status", ["requested", "pending", "processing"])),
    safeCount("dating_subscriptions", (query) => query.eq("is_active", true)),
    safeCount("business_subscriptions", (query) => query.eq("is_active", true)),
    safeCount("local_service_subscriptions", (query) => query.eq("is_active", true)),
    safeRows<any>("partner_materials", "id,title,type,description,is_active", (query) => query.eq("is_active", true).limit(6)),
    safeRows<any>("admin_audit", "id,action,target_type,reason,created_at", (query) => query.order("created_at", { ascending: false }).limit(8)),
  ]);

  const trustSignals = [
    { label: "Verifizierte Mitglieder", value: verifiedMembers, public: true },
    { label: "Gepruefte Unternehmen", value: verifiedBusinesses, public: true },
    { label: "Freigegebene Anbieter", value: verifiedProviders, public: true },
    { label: "Abgeschlossene Auftraege", value: completedServiceOrders, public: true },
    { label: "Echte Bewertungen", value: serviceReviews, public: true },
    { label: "Transparente Events", value: publishedEvents, public: true },
    { label: "Aktive Partner", value: activePartners, public: true },
  ];

  const internalQuality = [
    { label: "Moderation offen", value: pendingModeration, href: "/admin/moderation" },
    { label: "Aktive Sanktionen", value: activeSanctions, href: "/admin/users" },
    { label: "Service-Streitfaelle", value: openDisputes, href: "/admin/local-services" },
    { label: "Kontaktverstoesse", value: contactViolations, href: "/admin/local-services" },
    { label: "Refunds offen", value: openRefunds, href: "/admin/finance" },
  ];

  const memberships = [
    { label: "Dating Premium", value: datingSubscriptions, note: "separates bestehendes Abo" },
    { label: "Business Plus", value: businessSubscriptions, note: "Business-Modul bleibt eigenstaendig" },
    { label: "Provider Plus", value: localSubscriptions, note: "Dienstleister-Abo vorbereitet" },
  ];

  const roleReadiness = [
    {
      label: "Basis-Mitglied",
      active: profile?.verification_status === "verified",
      detail: profile?.verification_status === "verified" ? "Verifiziert und aktiv" : "Verifizierung erforderlich",
      href: "/verify",
    },
    {
      label: "Dating",
      active: Boolean(profile?.dating_enabled),
      detail: profile?.dating_enabled ? "Dating aktiviert" : "Optionaler Modus",
      href: "/dating/profile",
    },
    {
      label: "Business",
      active: Boolean(profile?.business_enabled),
      detail: profile?.business_enabled ? "Business aktiviert" : "Business-Profil aktivieren",
      href: "/business/profile",
    },
    {
      label: "Dienstleister",
      active: localMe?.providerProfile?.verificationStatus === "verified",
      detail: localMe?.providerProfile?.verificationStatus === "verified" ? "Anbieter freigegeben" : "Anbieterprofil beantragen",
      href: "/local-services/company/activate",
    },
    {
      label: "Creator",
      active: Boolean(businessMe?.profile),
      detail: businessMe?.profile ? "Ueber Business/Profil vorbereitbar" : "Business als Grundlage",
      href: "/creator",
    },
    {
      label: "Digital & AI Anbieter",
      active: localMe?.providerProfile?.verificationStatus === "verified" && Boolean(businessMe?.profile),
      detail: "Ueber Business + Dienstleistungen vorbereitet",
      href: "/digital-ai",
    },
  ];

  const monetization = [
    { area: "Events", model: "Tickets, Add-ons, VIP, Tische, Hotelcodes", status: "aktiv / vorbereitet", href: "/events" },
    { area: "Dienstleistungen", model: "Lead-Kauf, Service-Gebuehr, Anbieter-Abo", status: "aktiv / vorbereitet", href: "/local-services" },
    { area: "Business", model: "Business Plus, Jobs, Featured Profile", status: "vorbereitet", href: "/business" },
    { area: "Benefits", model: "Partnerdeals, Mitgliedervorteile, Provisionen", status: "vorbereitet", href: "/benefits" },
    { area: "Creator", model: "Kurse, Coachings, digitale Produkte", status: "vorbereitet", href: "/creator" },
    { area: "Digital & AI", model: "SaaS-Provision, Tools, Setup-Leads", status: "vorbereitet", href: "/digital-ai" },
    { area: "Dating", model: "Premium, Boosts, Likes sehen", status: "vorbereitet", href: "/dating" },
  ];

  return {
    profile,
    isAdmin: profile?.role === "admin",
    businessMe,
    localMe,
    trustSignals,
    internalQuality,
    memberships,
    roleReadiness,
    monetization,
    partnerMaterials: partnerMaterials.map((material) => ({
      id: String(material.id),
      title: String(material.title ?? "Partner Material"),
      type: String(material.type ?? "material"),
      description: material.description as string | null,
    })),
    recentAudit: recentAudit.map((audit) => ({
      id: String(audit.id),
      action: String(audit.action ?? "audit"),
      targetType: audit.target_type as string | null,
      reason: audit.reason as string | null,
      createdAt: audit.created_at as string | null,
    })),
    pwa: {
      manifest: true,
      serviceWorker: true,
      safeArea: true,
      installPrompt: false,
      push: false,
      note: "Manifest und Service Worker sind vorhanden; Push und Install-Prompt werden nicht als fertig behauptet.",
    },
  };
};

export type FoundationData = Awaited<ReturnType<typeof getFoundationData>>;
