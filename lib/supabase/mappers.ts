import type {
  AppOffer,
  Event,
  FAQItem,
  GalleryItem,
  Hotel,
  MembershipTier,
  Package,
  PackageIncludedItem,
  PackageItineraryItem,
  Partner,
  TicketType,
  TimetableItem,
  UserBenefit,
  UserProfile,
  UserTicket,
} from "../../types";
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
  TicketTypeRow,
  UserTicketRow,
} from "./types";

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};

const asString = (value: unknown, fallback = ""): string => typeof value === "string" ? value : fallback;
const asNumber = (value: unknown, fallback = 0): number => typeof value === "number" ? value : fallback;
const asBoolean = (value: unknown, fallback = false): boolean => typeof value === "boolean" ? value : fallback;

const mapStringList = (value: string[] | null): string[] => value ?? [];

const mapFaq = (items: unknown[] | null): FAQItem[] =>
  (items ?? []).map((item) => {
    const row = asRecord(item);
    return {
      question: asString(row.question),
      answer: asString(row.answer),
    };
  });

const mapTimetable = (items: unknown[] | null): TimetableItem[] =>
  (items ?? []).map((item) => {
    const row = asRecord(item);
    return {
      time: asString(row.time),
      title: asString(row.title),
      description: asString(row.description),
    };
  });

const mapTicketTypes = (items: unknown[] | null): TicketType[] =>
  (items ?? []).map((item) => {
    const row = asRecord(item);
    return {
      id: asString(row.id),
      title: asString(row.title),
      priceFrom: asNumber(row.priceFrom ?? row.price_from),
      benefits: Array.isArray(row.benefits) ? row.benefits.map((benefit) => asString(benefit)).filter(Boolean) : [],
      availability: asString(row.availability),
      requiresMembership: asBoolean(row.requiresMembership ?? row.requires_membership),
      status: asString(row.status, "available") as TicketType["status"],
      ctaLabel: asString(row.ctaLabel ?? row.cta_label, "Tickets ansehen"),
      externalUrl: asString(row.externalUrl ?? row.external_url) || undefined,
    };
  });

export const mapTicketTypeRowToTicketType = (row: TicketTypeRow): TicketType => ({
  id: row.id,
  title: row.title,
  priceFrom: row.price_from,
  benefits: row.benefits ?? [],
  availability: row.availability,
  requiresMembership: row.requires_membership,
  status: row.status,
  ctaLabel: row.cta_label,
  externalUrl: row.external_url ?? undefined,
});

export const mapEventRowToEvent = (row: EventRow): Event => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  city: row.city,
  venue: row.venue,
  address: row.address,
  startDate: row.start_date,
  endDate: row.end_date,
  doorsOpen: row.doors_open,
  category: row.category,
  shortDescription: row.short_description,
  longDescription: row.long_description,
  heroImage: row.hero_image,
  galleryImages: mapStringList(row.gallery_images),
  promoVideo: row.promo_video ?? undefined,
  dressCode: row.dress_code,
  lineup: mapStringList(row.lineup),
  hosts: mapStringList(row.hosts),
  timetable: mapTimetable(row.timetable),
  ticketStatus: row.ticket_status,
  ticketProvider: row.ticket_provider ?? undefined,
  ticketUrl: row.ticket_url,
  tickets: mapTicketTypes(row.tickets),
  vipAvailable: row.vip_available,
  vipDescription: row.vip_description ?? undefined,
  tableServiceAvailable: row.table_service_available,
  hotelIds: mapStringList(row.hotel_ids),
  packageIds: mapStringList(row.package_ids),
  partnerIds: mapStringList(row.partner_ids),
  sponsorIds: mapStringList(row.sponsor_ids),
  membershipAccess: row.membership_access,
  appEnabled: row.app_enabled,
  safetyNotes: mapStringList(row.safety_notes),
  faq: mapFaq(row.faq),
  status: row.status,
});

export const mapHotelRowToHotel = (row: HotelRow): Hotel => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  city: row.city,
  address: row.address,
  description: row.description,
  heroImage: row.hero_image,
  galleryImages: mapStringList(row.gallery_images),
  partnerStatus: row.partner_status,
  shuttleActive: row.shuttle_active,
  fastLaneActive: row.fast_lane_active,
  bookingUrl: row.booking_url ?? undefined,
  membershipBenefits: mapStringList(row.membership_benefits),
  partnerIds: mapStringList(row.partner_ids),
  status: row.status,
});

export const mapPackageRowToPackage = (row: PackageRow): Package => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  city: row.city,
  startDate: row.start_date,
  endDate: row.end_date,
  packageType: row.package_type,
  shortDescription: row.short_description,
  longDescription: row.long_description,
  heroImage: row.hero_image,
  galleryImages: mapStringList(row.gallery_images),
  promoVideo: row.promo_video ?? undefined,
  priceFrom: row.price_from,
  availabilityStatus: row.availability_status,
  includedItems: (row.included_items ?? []).map((item) => {
    const value = asRecord(item);
    return { id: asString(value.id), title: asString(value.title), description: asString(value.description) } satisfies PackageIncludedItem;
  }),
  excludedItems: mapStringList(row.excluded_items),
  itinerary: (row.itinerary ?? []).map((item) => {
    const value = asRecord(item);
    return {
      id: asString(value.id),
      packageId: asString(value.packageId ?? value.package_id, row.id),
      day: asString(value.day),
      time: asString(value.time),
      title: asString(value.title),
      description: asString(value.description),
      location: asString(value.location),
      relatedEventId: asString(value.relatedEventId ?? value.related_event_id) || null,
      relatedPartnerId: asString(value.relatedPartnerId ?? value.related_partner_id) || null,
    } satisfies PackageItineraryItem;
  }),
  eventIds: mapStringList(row.event_ids),
  hotelIds: mapStringList(row.hotel_ids),
  partnerOfferIds: mapStringList(row.partner_offer_ids),
  sponsorIds: mapStringList(row.sponsor_ids),
  membershipBenefits: mapStringList(row.membership_benefits),
  vipIncluded: row.vip_included,
  shuttleIncluded: row.shuttle_included,
  welcomeBagIncluded: row.welcome_bag_included,
  conciergeIncluded: row.concierge_included,
  bookingUrl: row.booking_url ?? undefined,
  inquiryEmail: row.inquiry_email,
  faq: mapFaq(row.faq),
  status: row.status,
});

export const mapPartnerRowToPartner = (row: PartnerRow): Partner => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  category: row.category,
  city: row.city,
  description: row.description,
  logo: row.logo,
  heroImage: row.hero_image,
  websiteUrl: row.website_url,
  contactName: row.contact_name,
  contactEmail: row.contact_email,
  partnerType: row.partner_type,
  visibilityLevel: row.visibility_level,
  activePlacements: mapStringList(row.active_placements),
  offers: mapStringList(row.offers),
  assignedEvents: mapStringList(row.assigned_events),
  assignedHotels: mapStringList(row.assigned_hotels),
  assignedPackages: mapStringList(row.assigned_packages),
  membershipBenefits: mapStringList(row.membership_benefits),
  appPlacements: mapStringList(row.app_placements),
  notes: row.notes,
  status: row.status,
});

export const mapMembershipTierRowToMembershipTier = (row: MembershipTierRow): MembershipTier => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  priceMonthly: row.price_monthly,
  priceYearly: row.price_yearly,
  description: row.description,
  benefits: mapStringList(row.benefits),
  eventBenefits: mapStringList(row.event_benefits),
  hotelBenefits: mapStringList(row.hotel_benefits),
  packageBenefits: mapStringList(row.package_benefits),
  communityBenefits: mapStringList(row.community_benefits),
  appBenefits: mapStringList(row.app_benefits),
  partnerBenefits: mapStringList(row.partner_benefits),
  badgeLabel: row.badge_label,
  priority: row.priority,
  status: row.status,
});

export const mapGalleryItemRowToGalleryItem = (row: GalleryItemRow): GalleryItem => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  city: row.city,
  eventId: row.event_id,
  eventName: row.event_name,
  eventDate: row.event_date,
  mediaType: row.media_type,
  coverImage: row.cover_image,
  images: mapStringList(row.images),
  videoUrl: row.video_url ?? undefined,
  videoLength: row.video_length ?? undefined,
  description: row.description,
  photographer: row.photographer ?? undefined,
  partnerIds: mapStringList(row.partner_ids),
  sponsorIds: mapStringList(row.sponsor_ids),
  visibility: row.visibility,
  status: row.status,
});

export const mapAppOfferRowToAppOffer = (row: AppOfferRow): AppOffer => ({
  id: row.id,
  title: row.title,
  partnerId: row.partner_id,
  city: row.city,
  description: row.description,
  code: row.code,
  validFrom: row.valid_from,
  validUntil: row.valid_until,
  tierRequired: row.tier_required,
  status: row.status,
});

export const mapProfileRowToUserProfile = (row: ProfileRow): UserProfile => ({
  id: row.id,
  userId: row.auth_user_id,
  name: row.name,
  email: row.email,
  city: row.city ?? "",
  birthday: row.birthday ?? undefined,
  interests: mapStringList(row.interests),
  preferredCities: mapStringList(row.preferred_cities),
  avatarUrl: row.avatar_url ?? undefined,
  newsletterConsent: row.newsletter_consent,
  createdAt: row.created_at,
});

export const mapUserTicketRowToUserTicket = (row: UserTicketRow): UserTicket => ({
  id: row.id,
  userId: row.profile_id,
  eventId: row.event_id,
  ticketType: row.ticket_type,
  qrCode: row.qr_code,
  status: row.status,
});

export const mapBenefitRedemptionRowToUserBenefit = (row: BenefitRedemptionRow): UserBenefit => ({
  id: row.id,
  userId: row.profile_id,
  benefitId: row.benefit_id,
  code: row.code ?? undefined,
  status: row.status,
});
