import "server-only";

import { getBusinessMe } from "@/features/business/live-service";
import { getCurrentUserProfile, getCurrentUserTickets, getPublishedEvents } from "@/features/events/live-service";
import { getLocalServiceCategories, getLocalServiceMe } from "@/features/local-services/service";
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

const isCurrent = (value: string | null | undefined) => !value || new Date(value).getTime() > Date.now();

export type BenefitPartner = {
  id: string;
  name: string;
  city: string | null;
  kind: string;
  status: string;
};

export type BenefitMaterial = {
  title: string;
  type: string;
  description: string | null;
  eventId: string | null;
};

export type HotelBenefit = {
  id: string;
  name: string;
  city: string;
  externalUrl: string | null;
  active: boolean;
};

export type BenefitDiscount = {
  id: string;
  eventId: string | null;
  expiresAt: string | null;
  kind: string;
};

export const getBenefitsData = async () => {
  const profile = await safe(null, getCurrentUserProfile);
  const [
    events,
    tickets,
    businessMe,
    localMe,
    localCategories,
    hotelPartners,
    myHotelCodes,
    activeDiscounts,
    partnerMaterials,
    partners,
    verifiedProviders,
    tableBookingCount,
    drinkBookingCount,
    birthdayBookingCount,
  ] = await Promise.all([
    safe([], getPublishedEvents),
    safe([], getCurrentUserTickets),
    safe(null, getBusinessMe),
    safe(null, getLocalServiceMe),
    safe([], getLocalServiceCategories),
    safeRows<any>("hotel_partners", "id,name,city,external_url,active", (query) => query.eq("active", true).limit(6)),
    profile?.id
      ? safeRows<any>("hotel_codes", "id,code,status,event_id,hotel_partner_id,created_at", (query) =>
          query.eq("user_id", profile.id).neq("status", "void").order("created_at", { ascending: false }).limit(4),
        )
      : Promise.resolve([]),
    safeRows<any>("discount_codes", "id,event_id,type,value,active,expires_at", (query) => query.eq("active", true).limit(20)),
    safeRows<any>("partner_materials", "title,type,description,event_id,is_active", (query) => query.eq("is_active", true).limit(6)),
    safeRows<any>("partners", "id,first_name,last_name,business_name,status", (query) => query.eq("status", "active").limit(6)),
    safeCount("local_service_provider_profiles", (query) => query.eq("verification_status", "verified")),
    safeCount("table_bookings", (query) => query.in("status", ["confirmed", "completed"])),
    safeCount("drink_package_bookings", (query) => query.in("status", ["confirmed", "delivered"])),
    safeCount("birthday_packages", (query) => query.in("status", ["confirmed", "completed"])),
  ]);

  const upcomingEvents = events
    .filter((event) => new Date(event.dateStart).getTime() >= Date.now() || event.status === "published")
    .slice(0, 4);

  const eventBenefits = upcomingEvents
    .map((event) => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      city: event.city,
      tables: event.tables.length,
      drinkPackages: event.drinkPackages.length,
      birthdayPackages: event.birthdayPackages.length,
      ticketTypes: event.ticketTypes.length,
      hasBenefits: event.tables.length + event.drinkPackages.length + event.birthdayPackages.length > 0,
    }))
    .filter((event) => event.hasBenefits)
    .slice(0, 4);

  const discounts = activeDiscounts
    .filter((discount) => isCurrent(discount.expires_at))
    .map((discount) => ({
      id: String(discount.id),
      eventId: discount.event_id as string | null,
      expiresAt: discount.expires_at as string | null,
      kind: String(discount.type ?? "member"),
    })) satisfies BenefitDiscount[];

  const hotelBenefits = hotelPartners.map((hotel) => ({
    id: String(hotel.id),
    name: String(hotel.name ?? "Partnerhotel"),
    city: String(hotel.city ?? "HotMess Stadt"),
    externalUrl: hotel.external_url as string | null,
    active: Boolean(hotel.active),
  })) satisfies HotelBenefit[];

  const partnerBenefits = partners.map((partner) => ({
    id: String(partner.id),
    name: String(partner.business_name ?? (`${partner.first_name ?? ""} ${partner.last_name ?? ""}`.trim() || "HotMess Partner")),
    city: null,
    kind: "Partnerprogramm",
    status: String(partner.status ?? "active"),
  })) satisfies BenefitPartner[];

  const materials = partnerMaterials.map((material) => ({
    title: String(material.title ?? "Partner Material"),
    type: String(material.type ?? "material"),
    description: material.description as string | null,
    eventId: material.event_id as string | null,
  })) satisfies BenefitMaterial[];

  const myBenefits = [
    ...tickets.slice(0, 3).map((ticket) => ({
      title: ticket.event?.title ?? "HotMess Ticket",
      text: ticket.hasFastlane ? "Fast-Lane Vorteil auf deinem Ticket" : `Ticketstatus: ${ticket.status}`,
      href: "/tickets",
    })),
    ...myHotelCodes.map((code) => ({
      title: "Hotelcode vorhanden",
      text: `Status: ${code.status ?? "issued"}`,
      href: "/tickets",
    })),
  ].slice(0, 5);

  return {
    profile,
    verified: profile?.verification_status === "verified",
    isAdmin: profile?.role === "admin",
    businessEnabled: Boolean(profile?.business_enabled),
    datingEnabled: Boolean(profile?.dating_enabled),
    businessMe,
    localMe,
    localCategories: localCategories.slice(0, 6),
    hotelBenefits,
    discounts,
    partnerBenefits,
    materials,
    eventBenefits,
    upcomingEvents,
    myBenefits,
    counts: {
      tickets: tickets.length,
      activeDiscounts: discounts.length,
      hotels: hotelBenefits.length,
      partners: partnerBenefits.length,
      verifiedProviders,
      tableBookings: tableBookingCount,
      addonBookings: drinkBookingCount + birthdayBookingCount,
    },
  };
};

export type BenefitsData = Awaited<ReturnType<typeof getBenefitsData>>;
