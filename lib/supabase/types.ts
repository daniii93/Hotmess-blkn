import type { MembershipSlug } from "../../types";
import type { UserRole } from "../auth/roles";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type SupabaseStatus = "draft" | "published" | "archived";

export type BaseRow = {
  id: string;
  created_at: string;
  updated_at: string;
};

export type ProfileRow = BaseRow & {
  auth_user_id: string;
  role: UserRole;
  name: string;
  email: string;
  city: string | null;
  birthday: string | null;
  interests: string[] | null;
  preferred_cities: string[] | null;
  avatar_url: string | null;
  newsletter_consent: boolean;
  status: "active" | "paused" | "archived";
};

export type MembershipTierRow = BaseRow & {
  name: string;
  slug: MembershipSlug;
  price_monthly: number;
  price_yearly: number;
  description: string;
  benefits: string[] | null;
  event_benefits: string[] | null;
  hotel_benefits: string[] | null;
  package_benefits: string[] | null;
  community_benefits: string[] | null;
  app_benefits: string[] | null;
  partner_benefits: string[] | null;
  badge_label: string;
  priority: number;
  status: "active" | "hidden" | "archived";
};

export type MembershipRow = BaseRow & {
  profile_id: string;
  tier_id: string;
  status: "active" | "trialing" | "cancelled" | "expired";
  started_at: string;
  renews_at: string | null;
  stripe_subscription_id: string | null;
};

export type EventRow = BaseRow & {
  title: string;
  slug: string;
  city: string;
  venue: string;
  address: string;
  start_date: string;
  end_date: string;
  doors_open: string;
  category: string;
  short_description: string;
  long_description: string;
  hero_image: string;
  gallery_images: string[] | null;
  promo_video: string | null;
  dress_code: string;
  lineup: string[] | null;
  hosts: string[] | null;
  timetable: JsonValue[] | null;
  ticket_status: "available" | "few_tickets" | "vip_available" | "passport_early_access" | "request" | "sold_out";
  ticket_provider: string | null;
  ticket_url: string;
  tickets: JsonValue[] | null;
  vip_available: boolean;
  vip_description: string | null;
  table_service_available: boolean;
  hotel_ids: string[] | null;
  package_ids: string[] | null;
  partner_ids: string[] | null;
  sponsor_ids: string[] | null;
  membership_access: string;
  app_enabled: boolean;
  safety_notes: string[] | null;
  faq: JsonValue[] | null;
  status: "draft" | "published" | "sold_out" | "archived";
};

export type TicketTypeRow = BaseRow & {
  event_id: string;
  title: string;
  price_from: number;
  benefits: string[] | null;
  availability: string;
  requires_membership: boolean;
  status: EventRow["ticket_status"];
  cta_label: string;
  external_url: string | null;
};

export type HotelRow = BaseRow & {
  title: string;
  slug: string;
  city: string;
  address: string;
  description: string;
  hero_image: string;
  gallery_images: string[] | null;
  partner_status: "lead" | "active" | "paused" | "archived";
  shuttle_active: boolean;
  fast_lane_active: boolean;
  booking_url: string | null;
  membership_benefits: string[] | null;
  partner_ids: string[] | null;
  status: SupabaseStatus;
};

export type PackageRow = BaseRow & {
  title: string;
  slug: string;
  city: string;
  start_date: string;
  end_date: string;
  package_type: "basic" | "travel" | "vip" | "signature";
  short_description: string;
  long_description: string;
  hero_image: string;
  gallery_images: string[] | null;
  promo_video: string | null;
  price_from: number;
  availability_status: "available" | "few_left" | "sold_out" | "request_only";
  included_items: JsonValue[] | null;
  excluded_items: string[] | null;
  itinerary: JsonValue[] | null;
  event_ids: string[] | null;
  hotel_ids: string[] | null;
  partner_offer_ids: string[] | null;
  sponsor_ids: string[] | null;
  membership_benefits: string[] | null;
  vip_included: boolean;
  shuttle_included: boolean;
  welcome_bag_included: boolean;
  concierge_included: boolean;
  booking_url: string | null;
  inquiry_email: string;
  faq: JsonValue[] | null;
  status: SupabaseStatus;
};

export type CommunityEventRow = BaseRow & {
  title: string;
  slug: string;
  city: string;
  venue: string;
  address: string;
  start_date: string;
  end_date: string;
  event_type: string;
  short_description: string;
  long_description: string;
  hero_image: string;
  gallery_images: string[] | null;
  member_only: boolean;
  capacity: number;
  registration_required: boolean;
  registration_url: string | null;
  partner_ids: string[] | null;
  sponsor_ids: string[] | null;
  ambassador_ids: string[] | null;
  dress_code: string | null;
  safety_notes: string[] | null;
  faq: JsonValue[] | null;
  status: SupabaseStatus;
};

export type PartnerRow = BaseRow & {
  name: string;
  slug: string;
  category: "hotel" | "bar" | "club" | "restaurant" | "fashion" | "travel" | "transport" | "wellness" | "lifestyle" | "vip_sponsor" | "welcome_bag";
  city: string;
  description: string;
  logo: string;
  hero_image: string;
  website_url: string;
  contact_name: string;
  contact_email: string;
  partner_type: "standard" | "premium" | "signature";
  visibility_level: string;
  active_placements: string[] | null;
  offers: string[] | null;
  assigned_events: string[] | null;
  assigned_hotels: string[] | null;
  assigned_packages: string[] | null;
  membership_benefits: string[] | null;
  app_placements: string[] | null;
  notes: string;
  status: "lead" | "active" | "paused" | "archived";
};

export type PartnerOfferRow = BaseRow & {
  partner_id: string;
  title: string;
  description: string;
  code: string | null;
  valid_from: string | null;
  valid_until: string | null;
  tier_required: MembershipSlug | null;
  city: string | null;
  status: "draft" | "active" | "expired" | "hidden";
};

export type GalleryItemRow = BaseRow & {
  title: string;
  slug: string;
  city: string;
  event_id: string;
  event_name: string;
  event_date: string;
  media_type: "photos" | "video" | "aftermovie";
  cover_image: string;
  images: string[] | null;
  video_url: string | null;
  video_length: string | null;
  description: string;
  photographer: string | null;
  partner_ids: string[] | null;
  sponsor_ids: string[] | null;
  visibility: "public" | "members_only" | "hidden";
  status: SupabaseStatus;
};

export type AppOfferRow = BaseRow & {
  title: string;
  partner_id: string;
  city: string;
  description: string;
  code: string;
  valid_from: string;
  valid_until: string;
  tier_required: MembershipSlug;
  status: "draft" | "active" | "expired" | "hidden";
};

export type InquiryRow = BaseRow & {
  type: "package" | "hotel" | "vip_table" | "partner" | "ambassador" | "general";
  related_id: string | null;
  subject: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  message: string | null;
  related_event_id: string | null;
  related_hotel_id: string | null;
  related_package_id: string | null;
  related_partner_id: string | null;
  metadata: JsonValue | null;
  internal_notes: string | null;
  status: "new" | "contacted" | "in_progress" | "converted" | "lost" | "archived";
};

export type UserSavedEventRow = BaseRow & {
  profile_id: string;
  event_id: string;
  status: "saved" | "visited" | "recommended";
  reminder_enabled: boolean;
};

export type UserSavedHotelRow = BaseRow & {
  profile_id: string;
  hotel_id: string;
  status: "saved" | "booked" | "recommended";
};

export type UserSavedPackageRow = BaseRow & {
  profile_id: string;
  package_id: string;
  status: "saved" | "inquiry" | "booked";
  vip_interest: boolean;
};

export type UserTicketRow = BaseRow & {
  profile_id: string;
  event_id: string;
  ticket_type: string;
  qr_code: string;
  status: "active" | "used" | "cancelled" | "expired";
};

export type BenefitRedemptionRow = BaseRow & {
  profile_id: string;
  benefit_id: string;
  code: string | null;
  status: "available" | "redeemed" | "expired";
  redeemed_at: string | null;
};
