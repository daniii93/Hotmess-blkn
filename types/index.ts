export type EntityStatus = "draft" | "published" | "archived";
export type Visibility = "public" | "members_only" | "hidden";
export type MembershipSlug = "free" | "plus" | "black";

export type {
  ChatItem,
  ChatMessage,
  ChatMembershipTier,
  ChatParticipant,
  ChatProfile,
  ChatType,
} from "./chat";

export type {
  FeatureFlagKey,
  FeatureFlags,
  FeatureState,
} from "../src/types/features";

export type {
  Permission,
  RoleDefinition,
  UserRole,
  VerificationStatus,
} from "../src/types/roles";

export type {
  CorePrincipleKey,
  GenderQuota,
  JourneyDefinition,
  JourneyStep,
  LegalRuleKey,
  PaymentProvider,
  ProductPriority,
  ProductRule,
  ScanResult,
  SellableProduct,
  TargetMarket,
} from "../src/types/product";

export type {
  BookingStatus,
  EventStatus as MasterplanEventStatus,
  OrderStatus,
  ScanResult as MasterplanScanResult,
  TicketStatus,
  VerificationStatus as MasterplanVerificationStatus,
  WaitlistStatus,
} from "../src/types/status";

export type {
  ApiError,
  ApiResponse,
  ApiSuccess,
} from "../src/types/api";

export type {
  AuditAction,
  AuditActor,
  AuditEvent,
} from "../src/types/audit";

export type FAQItem = {
  question: string;
  answer: string;
};

export type MediaItem = {
  id: string;
  type: "image" | "video";
  url: string;
  alt?: string;
  caption?: string;
  sortOrder?: number;
};

export type TicketType = {
  id: string;
  title: string;
  priceFrom: number;
  benefits: string[];
  availability: string;
  requiresMembership: boolean;
  status: "available" | "few_tickets" | "vip_available" | "passport_early_access" | "request" | "sold_out";
  ctaLabel: string;
  externalUrl?: string;
};

export type TimetableItem = {
  time: string;
  title: string;
  description: string;
};

export type Event = {
  id: string;
  title: string;
  slug: string;
  city: string;
  venue: string;
  address: string;
  startDate: string;
  endDate: string;
  doorsOpen: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  heroImage: string;
  galleryImages: string[];
  promoVideo?: string;
  dressCode: string;
  lineup: string[];
  hosts: string[];
  timetable: TimetableItem[];
  ticketStatus: TicketType["status"];
  ticketProvider?: string;
  ticketUrl: string;
  tickets: TicketType[];
  vipAvailable: boolean;
  vipDescription?: string;
  tableServiceAvailable: boolean;
  hotelIds: string[];
  packageIds: string[];
  partnerIds: string[];
  sponsorIds: string[];
  membershipAccess: string;
  appEnabled: boolean;
  safetyNotes: string[];
  faq: FAQItem[];
  status: EventStatus;
};

export type EventStatus = "draft" | "published" | "sold_out" | "archived";

export type EventPartnerPlacement = {
  partnerId: string;
  eventId: string;
  name: string;
  benefits: string;
  visibility: string;
  logoPlacement: string;
  eventPagePlacement: string;
  appPlacement: string;
  discountCode?: string;
  clicks: number;
  leads: number;
};

export type Hotel = {
  id: string;
  title: string;
  slug: string;
  city: string;
  address: string;
  description: string;
  heroImage: string;
  galleryImages: string[];
  partnerStatus: "lead" | "active" | "paused" | "archived";
  shuttleActive: boolean;
  fastLaneActive: boolean;
  bookingUrl?: string;
  membershipBenefits: string[];
  partnerIds: string[];
  status: EntityStatus;
};

export type PackageType = "basic" | "travel" | "vip" | "signature";

export type PackageIncludedItem = {
  id: string;
  title: string;
  description: string;
};

export type PackageItineraryItem = {
  id: string;
  packageId: string;
  day: string;
  time: string;
  title: string;
  description: string;
  location: string;
  relatedEventId?: string | null;
  relatedPartnerId?: string | null;
};

export type Package = {
  id: string;
  title: string;
  slug: string;
  city: string;
  startDate: string;
  endDate: string;
  packageType: PackageType;
  shortDescription: string;
  longDescription: string;
  heroImage: string;
  galleryImages: string[];
  promoVideo?: string;
  priceFrom: number;
  availabilityStatus: "available" | "few_left" | "sold_out" | "request_only";
  includedItems: PackageIncludedItem[];
  excludedItems: string[];
  itinerary: PackageItineraryItem[];
  eventIds: string[];
  hotelIds: string[];
  partnerOfferIds: string[];
  sponsorIds: string[];
  membershipBenefits: string[];
  vipIncluded: boolean;
  shuttleIncluded: boolean;
  welcomeBagIncluded: boolean;
  conciergeIncluded: boolean;
  bookingUrl?: string;
  inquiryEmail: string;
  faq: FAQItem[];
  status: EntityStatus;
};

export type PackagePartnerPlacement = {
  partnerId: string;
  name: string;
  partnerType: string;
  packageTypes: PackageType[];
  contribution: string;
  visibility: string;
  upgradeOptions: string[];
  clicks: number;
  leads: number;
  bookings: number;
};

export type PackageInquiry = {
  id: string;
  packageId: string;
  name: string;
  email: string;
  phone?: string;
  numberOfGuests: number;
  preferredHotel?: string;
  vipInterest: boolean;
  message?: string;
  status: "new" | "contacted" | "converted" | "lost";
};

export type CommunityEvent = {
  id: string;
  title: string;
  slug: string;
  city: string;
  venue: string;
  address: string;
  startDate: string;
  endDate: string;
  eventType: "pre_drinks" | "brunch" | "shopping_night" | "travel_meetup" | "afterwork" | "city_social" | "partner_bar_night" | "member_only";
  shortDescription: string;
  longDescription: string;
  heroImage: string;
  galleryImages: string[];
  memberOnly: boolean;
  capacity: number;
  registrationRequired: boolean;
  registrationUrl?: string;
  partnerIds: string[];
  sponsorIds: string[];
  ambassadorIds: string[];
  dressCode?: string;
  safetyNotes: string[];
  faq: FAQItem[];
  status: EntityStatus;
};

export type MembershipTier = {
  id: string;
  name: string;
  slug: MembershipSlug;
  priceMonthly: number;
  priceYearly: number;
  description: string;
  benefits: string[];
  eventBenefits: string[];
  hotelBenefits: string[];
  packageBenefits: string[];
  communityBenefits: string[];
  appBenefits: string[];
  partnerBenefits: string[];
  badgeLabel: string;
  priority: number;
  status: "active" | "hidden" | "archived";
};

export type UserMembership = {
  id: string;
  userId: string;
  tierId: string;
  status: "active" | "trialing" | "cancelled" | "expired";
  startedAt: string;
  renewsAt?: string;
  stripeSubscriptionId?: string | null;
};

export type MembershipBenefit = {
  id: string;
  tierId: string;
  title: string;
  description: string;
  category: "event" | "hotel" | "package" | "community" | "app" | "partner";
  partnerId?: string | null;
  code?: string;
  validFrom?: string;
  validUntil?: string;
  redemptionLimit?: number;
};

export type MembershipRedemption = {
  id: string;
  userId: string;
  benefitId: string;
  redeemedAt: string;
  status: "reserved" | "redeemed" | "cancelled" | "expired";
};

export type Partner = {
  id: string;
  name: string;
  slug: string;
  category: "hotel" | "bar" | "club" | "restaurant" | "fashion" | "travel" | "transport" | "wellness" | "lifestyle" | "vip_sponsor" | "welcome_bag";
  city: string;
  description: string;
  logo: string;
  heroImage: string;
  websiteUrl: string;
  contactName: string;
  contactEmail: string;
  partnerType: "standard" | "premium" | "signature";
  visibilityLevel: string;
  activePlacements: string[];
  offers: string[];
  assignedEvents: string[];
  assignedHotels: string[];
  assignedPackages: string[];
  membershipBenefits: string[];
  appPlacements: string[];
  notes: string;
  status: "lead" | "active" | "paused" | "archived";
};

export type PartnerOffer = {
  id: string;
  partnerId: string;
  title: string;
  description: string;
  code?: string;
  validFrom?: string;
  validUntil?: string;
  tierRequired?: MembershipSlug;
  city?: string;
  status: "draft" | "active" | "expired" | "hidden";
};

export type PartnerPlacement = {
  id: string;
  partnerId: string;
  placementType: "website" | "app" | "event" | "package" | "hotel" | "membership" | "community";
  relatedId?: string;
  visibilityLevel: string;
  startDate?: string;
  endDate?: string;
  status: "draft" | "active" | "paused" | "archived";
};

export type PartnerApplication = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  city: string;
  category: string;
  interests: string[];
  budgetRange?: string;
  message: string;
  status: "new" | "contacted" | "accepted" | "rejected";
};

export type PartnerMetric = {
  id: string;
  partnerId: string;
  placementId: string;
  views: number;
  clicks: number;
  leads: number;
  redemptions: number;
};

export type GalleryItem = {
  id: string;
  title: string;
  slug: string;
  city: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  mediaType: "photos" | "video" | "aftermovie";
  coverImage: string;
  images: string[];
  videoUrl?: string;
  videoLength?: string;
  description: string;
  photographer?: string;
  partnerIds: string[];
  sponsorIds: string[];
  visibility: Visibility;
  status: EntityStatus;
};

export type GalleryMedia = {
  id: string;
  galleryId: string;
  mediaType: "image" | "video";
  url: string;
  caption?: string;
  sortOrder: number;
};

export type GalleryPartnerPlacement = {
  id: string;
  galleryId: string;
  partnerId: string;
  placementType: "cover_credit" | "event_archive" | "campaign_story" | "app_story";
  visibility: string;
  status: "draft" | "active" | "archived";
};

export type UserProfile = {
  id: string;
  userId: string;
  name: string;
  email: string;
  city: string;
  birthday?: string;
  interests: string[];
  preferredCities: string[];
  avatarUrl?: string;
  newsletterConsent: boolean;
  createdAt: string;
};

export type UserSavedEvent = {
  id: string;
  userId: string;
  eventId: string;
  status: "saved" | "visited" | "recommended";
  reminderEnabled: boolean;
};

export type UserSavedHotel = {
  id: string;
  userId: string;
  hotelId: string;
  status: "saved" | "booked" | "recommended";
};

export type UserSavedPackage = {
  id: string;
  userId: string;
  packageId: string;
  status: "saved" | "inquiry" | "booked";
  vipInterest: boolean;
};

export type UserTicket = {
  id: string;
  userId: string;
  eventId: string;
  ticketType: string;
  qrCode: string;
  status: "active" | "used" | "cancelled" | "expired";
};

export type UserBenefit = {
  id: string;
  userId: string;
  benefitId: string;
  code?: string;
  status: "available" | "redeemed" | "expired";
};

export type UserNotificationPreference = {
  id: string;
  userId: string;
  language: string;
  notifications: boolean;
  eventReminders: boolean;
  hotelUpdates: boolean;
  partnerOffers: boolean;
  newsletter: boolean;
};

export type AppOffer = {
  id: string;
  title: string;
  partnerId: string;
  city: string;
  description: string;
  code: string;
  validFrom: string;
  validUntil: string;
  tierRequired: MembershipSlug;
  status: "draft" | "active" | "expired" | "hidden";
};

export type AppFeature = {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  status: "active" | "draft" | "hidden";
};

export type AppPushMessage = {
  id: string;
  title: string;
  body: string;
  city?: string;
  eventId?: string | null;
  scheduledAt?: string;
  status: "draft" | "scheduled" | "sent";
};

export type Inquiry = {
  id: string;
  type: InquiryType;
  status: InquiryStatus;
  relatedId?: string;
  subject: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  message?: string;
  relatedEventId?: string;
  relatedHotelId?: string;
  relatedPackageId?: string;
  relatedPartnerId?: string;
  metadata?: Record<string, string | number | boolean | string[]>;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
};

export type InquiryType = "package" | "hotel" | "vip_table" | "partner" | "ambassador" | "general";

export type InquiryStatus = "new" | "contacted" | "in_progress" | "converted" | "lost" | "archived";

export type InquiryNote = {
  id: string;
  inquiryId: string;
  authorId: string;
  note: string;
  createdAt: string;
};

export type CustomerJourneyStage =
  | "visitor"
  | "registered"
  | "attendee"
  | "repeat_attendee"
  | "member"
  | "passport_plus"
  | "passport_black"
  | "ambassador"
  | "vip";

export type LoyaltyLevel = "member" | "silver" | "gold" | "black" | "ambassador";

export type CustomerProfile = {
  id: string;
  userId: string;
  lifecycleStage: CustomerJourneyStage;
  loyaltyLevel: LoyaltyLevel;
  loyaltyScore: number;
  eventScore: number;
  travelScore: number;
  communityScore: number;
  membershipScore: number;
};

export type LoyaltyAccount = {
  id: string;
  userId: string;
  pointsBalance: number;
  level: LoyaltyLevel;
  nextRewardId?: string;
  updatedAt: string;
};

export type LoyaltyTransaction = {
  id: string;
  userId: string;
  type:
    | "registration"
    | "ticket_purchase"
    | "event_attendance"
    | "hotel_booking"
    | "package_booking"
    | "membership_upgrade"
    | "community_attendance"
    | "referral"
    | "partner_redemption";
  points: number;
  description: string;
  createdAt: string;
};

export type Reward = {
  id: string;
  title: string;
  pointsRequired: number;
  levelRequired: LoyaltyLevel;
  description: string;
  status: "available" | "limited" | "hidden" | "archived";
};

export type Referral = {
  id: string;
  userId: string;
  code: string;
  referredUserId?: string;
  status: "invited" | "registered" | "converted" | "expired";
  rewardGranted: boolean;
};

export type ReferralReward = {
  id: string;
  referralId: string;
  rewardId: string;
  points: number;
  status: "pending" | "granted" | "expired";
};

export type AutomationRule = {
  id: string;
  trigger:
    | "registration"
    | "event_purchase"
    | "hotel_booking"
    | "event_attended"
    | "membership_upgrade"
    | "birthday"
    | "inactivity"
    | "referral_success";
  action:
    | "welcome_email"
    | "hotel_recommendation"
    | "package_recommendation"
    | "next_event_recommendation"
    | "benefits_mail"
    | "birthday_benefit"
    | "reactivation"
    | "bonus_points";
  enabled: boolean;
  status: "draft" | "active" | "paused" | "archived";
};

export type RevenueSource =
  | "tickets"
  | "hotels"
  | "packages"
  | "memberships"
  | "partner_offers"
  | "sponsoring"
  | "referrals"
  | "vip_services"
  | "concierge";

export type RevenueTransaction = {
  id: string;
  sourceType: RevenueSource;
  sourceId: string;
  amount: number;
  currency: "EUR";
  cityId?: string;
  userId?: string;
  createdAt: string;
};

export type CommissionRule = {
  id: string;
  type: "hotel" | "package" | "referral" | "ambassador" | "partner_revenue_share";
  percentage?: number;
  fixedAmount?: number;
  active: boolean;
};

export type CommissionPayout = {
  id: string;
  ruleId: string;
  recipientId: string;
  amount: number;
  currency: "EUR";
  status: "pending" | "approved" | "scheduled" | "paid" | "cancelled";
};

export type SponsorPlacement = {
  id: string;
  sponsorId: string;
  placementType: "event" | "city" | "package" | "membership" | "app" | "welcome_bag" | "vip_area";
  cityId?: string;
  eventId?: string;
  startDate: string;
  endDate: string;
  value: number;
  status: "proposal" | "active" | "sold" | "archived";
};

export type PartnerMetric = {
  id: string;
  partnerId: string;
  views: number;
  clicks: number;
  leads: number;
  bookings: number;
  redemptions: number;
};

export type ReferralCampaign = {
  id: string;
  name: string;
  code: string;
  rewardType: "points" | "hotel_benefit" | "fast_lane" | "partner_offer" | "cash";
  rewardValue: number;
  status: "draft" | "active" | "paused" | "archived";
};

export type ConciergeProfile = {
  id: string;
  userId: string;
  preferredCities: string[];
  membershipTier: string;
  loyaltyLevel: string;
  travelStyle?: string;
};

export type ConciergeRequest = {
  id: string;
  userId: string;
  category: "travel" | "hotel" | "package" | "vip" | "event" | "membership" | "general";
  message: string;
  status: "new" | "in_progress" | "resolved" | "archived";
  assignedTo?: string;
  createdAt: string;
};

export type Recommendation = {
  id: string;
  type: "event" | "hotel" | "package" | "benefit" | "community" | "city";
  title: string;
  description: string;
  relatedId: string;
  score: number;
  cityId?: string;
};

export type PromptTemplate = {
  id: string;
  category: string;
  title: string;
  content: string;
  active: boolean;
};

export type AuditLog = {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  createdAt: string;
};

export type UserConsent = {
  id: string;
  userId: string;
  type: "marketing" | "newsletter" | "analytics" | "cookies";
  granted: boolean;
  createdAt: string;
};

export type PrivacyRequest = {
  id: string;
  userId: string;
  type: "export" | "delete" | "rectify";
  status: "new" | "processing" | "completed" | "rejected";
  createdAt: string;
};

export type CityOperator = {
  id: string;
  cityId: string;
  userId: string;
  role: "city_operator" | "city_manager" | "city_ambassador_lead" | "community_lead" | "partner_manager";
  status: "candidate" | "active" | "paused" | "archived";
  startedAt: string;
};

export type CityPerformance = {
  cityId: string;
  members: number;
  events: number;
  hotels: number;
  packages: number;
  revenue: number;
  growthScore: number;
  communityScore: number;
  partnerScore: number;
  experienceScore: number;
};

export type ExpansionMarket = {
  id: string;
  city: string;
  country: string;
  priority: "low" | "medium" | "high";
  marketPotential: number;
  competitionLevel: "low" | "medium" | "high";
  status: "watchlist" | "research" | "candidate" | "launching" | "active";
};

export type BusinessUnit = {
  id: string;
  name: string;
  slug: string;
  description: string;
  ownerId: string;
  status: "planned" | "prepared" | "active" | "paused";
};

export type PlatformMetric = {
  id: string;
  category: string;
  value: string;
  period: string;
};

export type PlatformGoal = {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  dueDate: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "blocked" | "completed";
  dueDate: string;
  category: string;
};

export type SupportTicket = {
  id: string;
  userId: string;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "archived";
  assignedTo: string;
  messages: string[];
  createdAt: string;
};

export type LaunchChecklistItem = {
  id: string;
  category: string;
  title: string;
  completed: boolean;
  ownerId: string;
  dueDate: string;
};
