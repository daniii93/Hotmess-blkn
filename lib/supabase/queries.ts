import type {
  AppOffer,
  Event,
  GalleryItem,
  Hotel,
  MembershipTier,
  Package,
  Partner,
  UserBenefit,
  UserProfile,
  UserTicket,
} from "../../types";
import { appOffers, events, galleryItems, hotels, membershipTiers, packages, partners, userProfiles } from "../mock";
import { getSupabasePublicConfig } from "./client";
import {
  mapAppOfferRowToAppOffer,
  mapBenefitRedemptionRowToUserBenefit,
  mapEventRowToEvent,
  mapGalleryItemRowToGalleryItem,
  mapHotelRowToHotel,
  mapMembershipTierRowToMembershipTier,
  mapPackageRowToPackage,
  mapPartnerRowToPartner,
  mapProfileRowToUserProfile,
  mapUserTicketRowToUserTicket,
} from "./mappers";
import type {
  AppOfferRow,
  BenefitRedemptionRow,
  EventRow,
  GalleryItemRow,
  HotelRow,
  MembershipTierRow,
  PackageRow,
  PartnerRow,
  ProfileRow,
  UserTicketRow,
} from "./types";

type QueryParams = Record<string, string | number | boolean>;

const buildQueryString = (params: QueryParams = {}): string => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => search.set(key, String(value)));
  const query = search.toString();
  return query ? `?${query}` : "";
};

const fetchRows = async <Row>(table: string, params?: QueryParams): Promise<Row[] | null> => {
  const config = getSupabasePublicConfig();

  if (!config) {
    return null;
  }

  const response = await fetch(`${config.url}/rest/v1/${table}${buildQueryString(params)}`, {
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  return await response.json() as Row[];
};

const firstOrUndefined = <T>(items: T[]): T | undefined => items[0];

export const fetchEvents = async (): Promise<Event[]> => {
  const rows = await fetchRows<EventRow>("events", { order: "start_date.asc" });
  return rows ? rows.map(mapEventRowToEvent) : events;
};

export const fetchEventBySlug = async (slug: string): Promise<Event | undefined> => {
  const rows = await fetchRows<EventRow>("events", { slug: `eq.${slug}`, limit: 1 });
  return rows ? firstOrUndefined(rows.map(mapEventRowToEvent)) : events.find((event) => event.slug === slug);
};

export const fetchHotels = async (): Promise<Hotel[]> => {
  const rows = await fetchRows<HotelRow>("hotels", { order: "city.asc" });
  return rows ? rows.map(mapHotelRowToHotel) : hotels;
};

export const fetchHotelBySlug = async (slug: string): Promise<Hotel | undefined> => {
  const rows = await fetchRows<HotelRow>("hotels", { slug: `eq.${slug}`, limit: 1 });
  return rows ? firstOrUndefined(rows.map(mapHotelRowToHotel)) : hotels.find((hotel) => hotel.slug === slug);
};

export const fetchPackages = async (): Promise<Package[]> => {
  const rows = await fetchRows<PackageRow>("packages", { order: "start_date.asc" });
  return rows ? rows.map(mapPackageRowToPackage) : packages;
};

export const fetchPackageBySlug = async (slug: string): Promise<Package | undefined> => {
  const rows = await fetchRows<PackageRow>("packages", { slug: `eq.${slug}`, limit: 1 });
  return rows ? firstOrUndefined(rows.map(mapPackageRowToPackage)) : packages.find((item) => item.slug === slug);
};

export const fetchMembershipTiers = async (): Promise<MembershipTier[]> => {
  const rows = await fetchRows<MembershipTierRow>("membership_tiers", { order: "priority.asc" });
  return rows ? rows.map(mapMembershipTierRowToMembershipTier) : membershipTiers;
};

export const fetchPartners = async (): Promise<Partner[]> => {
  const rows = await fetchRows<PartnerRow>("partners", { order: "name.asc" });
  return rows ? rows.map(mapPartnerRowToPartner) : partners;
};

export const fetchGalleryItems = async (): Promise<GalleryItem[]> => {
  const rows = await fetchRows<GalleryItemRow>("gallery_items", { order: "event_date.desc" });
  return rows ? rows.map(mapGalleryItemRowToGalleryItem) : galleryItems;
};

export const fetchAppOffers = async (): Promise<AppOffer[]> => {
  const rows = await fetchRows<AppOfferRow>("app_offers", { status: "eq.active" });
  return rows ? rows.map(mapAppOfferRowToAppOffer) : appOffers;
};

export const fetchUserProfile = async (userId: string): Promise<UserProfile | undefined> => {
  const rows = await fetchRows<ProfileRow>("profiles", { auth_user_id: `eq.${userId}`, limit: 1 });
  return rows ? firstOrUndefined(rows.map(mapProfileRowToUserProfile)) : userProfiles.find((profile) => profile.userId === userId) ?? userProfiles[0];
};

export const fetchUserTickets = async (profileId: string): Promise<UserTicket[]> => {
  const rows = await fetchRows<UserTicketRow>("user_tickets", { profile_id: `eq.${profileId}`, order: "created_at.desc" });
  return rows ? rows.map(mapUserTicketRowToUserTicket) : [];
};

export const fetchUserBenefits = async (profileId: string): Promise<UserBenefit[]> => {
  const rows = await fetchRows<BenefitRedemptionRow>("benefit_redemptions", { profile_id: `eq.${profileId}`, order: "created_at.desc" });
  return rows ? rows.map(mapBenefitRedemptionRowToUserBenefit) : [];
};
