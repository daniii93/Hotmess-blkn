import "server-only";

import crypto from "node:crypto";
import { getServerEnv } from "@/config/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
export { formatEventDate, formatMoney } from "./format";

export type LiveTicketType = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  quantityTotal: number | null;
  quantitySold: number;
  isActive: boolean;
};

export type LiveEventTable = {
  id: string;
  name: string;
  minPersons: number;
  maxPersons: number;
  priceCents: number;
  quantityTotal: number;
  quantitySold: number;
  isActive: boolean;
};

export type LiveDrinkPackage = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  requiresTable: boolean;
  allowsGirlsService: boolean;
  quantityAvailable: number | null;
  quantitySold: number;
  isActive: boolean;
};

export type LiveBirthdayPackage = {
  id: string;
  name: string;
  priceCents: number;
  isActive: boolean;
};

export type LiveEvent = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  city: string;
  category: string;
  status: string;
  dateStart: string;
  dateEnd: string | null;
  doorsOpen: string | null;
  coverImageUrl: string | null;
  capacityTotal: number;
  venue: {
    name: string;
    address: string | null;
    city: string;
    country: string;
    mapsUrl: string | null;
  } | null;
  genderConfig: {
    capacityFemale: number;
    capacityMale: number;
    capacityDiverse: number;
    soldFemale: number;
    soldMale: number;
    soldDiverse: number;
    tolerance: number;
  } | null;
  ticketTypes: LiveTicketType[];
  tables: LiveEventTable[];
  drinkPackages: LiveDrinkPackage[];
  birthdayPackages: LiveBirthdayPackage[];
};

type EventRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  city: string;
  category: string;
  status: string;
  date_start: string | null;
  starts_at: string;
  date_end: string | null;
  ends_at: string | null;
  doors_open: string | null;
  cover_image_url: string | null;
  hero_image_url: string | null;
  capacity_total: number;
  venue: { name: string; address: string | null; city: string; country: string; maps_url: string | null } | null;
  event_gender_config: {
    capacity_female: number;
    capacity_male: number;
    capacity_diverse: number;
    sold_female: number;
    sold_male: number;
    sold_diverse: number;
    tolerance: number;
  } | null;
  ticket_types: Array<{
    id: string;
    name: string;
    description: string | null;
    price_cents: number;
    currency: string;
    quantity_total: number | null;
    quantity_sold: number;
    is_active: boolean;
    active: boolean;
  }>;
  event_tables: Array<{
    id: string;
    name: string;
    min_persons: number;
    max_persons: number;
    price_cents: number;
    quantity_total: number;
    quantity_sold: number;
    active: boolean;
  }>;
  drink_packages: Array<{
    id: string;
    name: string;
    description: string | null;
    price_cents: number;
    requires_table: boolean;
    allows_girls_service: boolean;
    hotmess_girls_service_available: boolean;
    quantity_available: number | null;
    quantity_sold: number;
    active: boolean;
  }>;
  birthday_packages: Array<{
    id: string;
    name: string;
    price_cents: number;
    active: boolean;
  }>;
};

const firstRelation = <T>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
};

const eventSelect = `
  id, slug, title, subtitle, description, city, category, status,
  date_start, starts_at, date_end, ends_at, doors_open,
  cover_image_url, hero_image_url, capacity_total,
  venue:venues(name,address,city,country,maps_url),
  event_gender_config(capacity_female,capacity_male,capacity_diverse,sold_female,sold_male,sold_diverse,tolerance),
  ticket_types(id,name,description,price_cents,currency,quantity_total,quantity_sold,is_active,active),
  event_tables(id,name,min_persons,max_persons,price_cents,quantity_total,quantity_sold,active),
  drink_packages(id,name,description,price_cents,requires_table,allows_girls_service,hotmess_girls_service_available,quantity_available,quantity_sold,active),
  birthday_packages(id,name,price_cents,active)
`;

const mapEvent = (row: EventRow): LiveEvent => {
  const venue = firstRelation(row.venue);
  const genderConfig = firstRelation(row.event_gender_config);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    city: row.city,
    category: row.category,
    status: row.status,
    dateStart: row.date_start ?? row.starts_at,
    dateEnd: row.date_end ?? row.ends_at,
    doorsOpen: row.doors_open,
    coverImageUrl: row.cover_image_url ?? row.hero_image_url,
    capacityTotal: row.capacity_total,
    venue: venue
      ? {
          name: venue.name,
          address: venue.address,
          city: venue.city,
          country: venue.country,
          mapsUrl: venue.maps_url,
        }
      : null,
    genderConfig: genderConfig
      ? {
          capacityFemale: genderConfig.capacity_female,
          capacityMale: genderConfig.capacity_male,
          capacityDiverse: genderConfig.capacity_diverse,
          soldFemale: genderConfig.sold_female,
          soldMale: genderConfig.sold_male,
          soldDiverse: genderConfig.sold_diverse,
          tolerance: genderConfig.tolerance,
        }
      : null,
    ticketTypes: (row.ticket_types ?? [])
      .filter((ticketType) => ticketType.is_active ?? ticketType.active)
      .sort((a, b) => a.price_cents - b.price_cents)
      .map((ticketType) => ({
        id: ticketType.id,
        name: ticketType.name,
        description: ticketType.description,
        priceCents: ticketType.price_cents,
        currency: ticketType.currency,
        quantityTotal: ticketType.quantity_total,
        quantitySold: ticketType.quantity_sold,
        isActive: ticketType.is_active ?? ticketType.active,
      })),
    tables: (row.event_tables ?? [])
      .filter((table) => table.active)
      .map((table) => ({
        id: table.id,
        name: table.name,
        minPersons: table.min_persons,
        maxPersons: table.max_persons,
        priceCents: table.price_cents,
        quantityTotal: table.quantity_total,
        quantitySold: table.quantity_sold,
        isActive: table.active,
      })),
    drinkPackages: (row.drink_packages ?? [])
      .filter((item) => item.active)
      .map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        priceCents: item.price_cents,
        requiresTable: item.requires_table,
        allowsGirlsService: item.allows_girls_service ?? item.hotmess_girls_service_available,
        quantityAvailable: item.quantity_available,
        quantitySold: item.quantity_sold,
        isActive: item.active,
      })),
    birthdayPackages: (row.birthday_packages ?? [])
      .filter((item) => item.active)
      .map((item) => ({
        id: item.id,
        name: item.name,
        priceCents: item.price_cents,
        isActive: item.active,
      })),
  };
};

export const getPublishedEvents = async (): Promise<LiveEvent[]> => {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("events")
    .select(eventSelect)
    .in("status", ["published", "sold_out", "completed"])
    .order("date_start", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as EventRow[]).map(mapEvent);
};

export const getAllAdminEvents = async (): Promise<LiveEvent[]> => {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("events").select(eventSelect).order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as EventRow[]).map(mapEvent);
};

export const getEventBySlug = async (slug: string): Promise<LiveEvent | null> => {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("events").select(eventSelect).eq("slug", slug).maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapEvent(data as unknown as EventRow) : null;
};

export const getCurrentUserProfile = async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,email,first_name,last_name,username,city,date_of_birth,gender,avatar_url,role,verification_status,is_banned,dating_enabled,business_enabled")
    .eq("id", user.id)
    .single();

  if (error) throw new Error(error.message);
  return profile;
};

export const getRequestUserProfile = async (request: Request) => {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;

  if (!token) return getCurrentUserProfile();

  const supabase = createSupabaseAdminClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,email,first_name,last_name,username,city,date_of_birth,gender,avatar_url,role,verification_status,is_banned,dating_enabled,business_enabled")
    .eq("id", user.id)
    .single();

  if (error) throw new Error(error.message);
  return profile;
};

export type UserTicket = {
  id: string;
  status: string;
  qrToken: string | null;
  holderName: string | null;
  holderGender: string | null;
  holderPhotoUrl: string | null;
  hasFastlane: boolean;
  scannedAt: string | null;
  event: {
    title: string;
    slug: string;
    dateStart: string;
    venueName: string | null;
  } | null;
  ticketType: {
    name: string;
    priceCents: number;
    currency: string;
  } | null;
};

export type UserWaitlistEntry = {
  id: string;
  eventId: string;
  userId: string;
  gender: string;
  position: number;
  status: string;
  promotedUntil: string | null;
  ticketTypeId: string | null;
};

export const getCurrentUserWaitlistEntry = async (eventId: string): Promise<UserWaitlistEntry | null> => {
  const profile = await getCurrentUserProfile();
  if (!profile) return null;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("waitlist")
    .select("id,event_id,user_id,gender,position,status,promoted_until,ticket_type_id")
    .eq("event_id", eventId)
    .eq("user_id", profile.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data
    ? {
        id: data.id,
        eventId: data.event_id,
        userId: data.user_id,
        gender: data.gender,
        position: data.position,
        status: data.status,
        promotedUntil: data.promoted_until,
        ticketTypeId: data.ticket_type_id,
      }
    : null;
};

export const getCurrentUserTickets = async (): Promise<UserTicket[]> => {
  const profile = await getCurrentUserProfile();
  if (!profile) return [];

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("tickets")
    .select(`
      id,status,qr_token,holder_name,holder_gender,holder_photo_url,has_fastlane,scanned_at,
      events(title,slug,date_start,starts_at,venues(name)),
      ticket_types(name,price_cents,currency)
    `)
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((ticket: any) => ({
    id: ticket.id,
    status: ticket.status,
    qrToken: ticket.qr_token,
    holderName: ticket.holder_name,
    holderGender: ticket.holder_gender,
    holderPhotoUrl: ticket.holder_photo_url,
    hasFastlane: ticket.has_fastlane,
    scannedAt: ticket.scanned_at,
    event: ticket.events
      ? {
          title: ticket.events.title,
          slug: ticket.events.slug,
          dateStart: ticket.events.date_start ?? ticket.events.starts_at,
          venueName: firstRelation(ticket.events.venues)?.name ?? null,
        }
      : null,
    ticketType: ticket.ticket_types
      ? {
          name: ticket.ticket_types.name,
          priceCents: ticket.ticket_types.price_cents,
          currency: ticket.ticket_types.currency,
        }
      : null,
  }));
};

export const signQrToken = (ticketId: string, eventId: string, userId: string) => {
  const secret = getServerEnv().qrHmacSecret || "hotmess-dev-qr-secret";
  const payload = Buffer.from(JSON.stringify({ tid: ticketId, eid: eventId, uid: userId, iat: Date.now() })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
};
