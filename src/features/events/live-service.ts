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
  ticket_types(id,name,description,price_cents,currency,quantity_total,quantity_sold,is_active,active)
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
    .select("id,email,first_name,last_name,gender,avatar_url,role,verification_status,is_banned")
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
    .select("id,email,first_name,last_name,gender,avatar_url,role,verification_status,is_banned")
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
