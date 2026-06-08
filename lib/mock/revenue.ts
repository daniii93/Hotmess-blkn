import type { CommissionPayout, CommissionRule, PartnerMetric, ReferralCampaign, RevenueTransaction, SponsorPlacement } from "../../types";

export const revenueTransactions: RevenueTransaction[] = [
  { id: "rev-ticket-1", sourceType: "tickets", sourceId: "hm-innsbruck-2026", amount: 18420, currency: "EUR", cityId: "innsbruck", createdAt: "2026-05-18" },
  { id: "rev-package-1", sourceType: "packages", sourceId: "vip-weekend-innsbruck", amount: 22800, currency: "EUR", cityId: "innsbruck", createdAt: "2026-05-22" },
  { id: "rev-sponsor-1", sourceType: "sponsoring", sourceId: "black-room-sponsor", amount: 14500, currency: "EUR", cityId: "milan", createdAt: "2026-05-28" },
];

export const commissionRules: CommissionRule[] = [
  { id: "com-hotel", type: "hotel", percentage: 10, active: true },
  { id: "com-package", type: "package", percentage: 15, active: true },
  { id: "com-referral", type: "referral", percentage: 5, active: true },
  { id: "com-ambassador", type: "ambassador", fixedAmount: 4, active: true },
  { id: "com-partner", type: "partner_revenue_share", percentage: 12, active: true },
];

export const commissionPayouts: CommissionPayout[] = [
  { id: "pay-1", ruleId: "com-hotel", recipientId: "signature-city-stay", amount: 642, currency: "EUR", status: "pending" },
  { id: "pay-2", ruleId: "com-ambassador", recipientId: "city-ambassador-innsbruck", amount: 188, currency: "EUR", status: "approved" },
];

export const sponsorPlacements: SponsorPlacement[] = [
  { id: "sp-1", sponsorId: "black-room-sponsor", placementType: "vip_area", cityId: "milan", eventId: "milan-fashion-after-dark", startDate: "2026-09-01", endDate: "2026-12-31", value: 14500, status: "sold" },
  { id: "sp-2", sponsorId: "signature-wellness", placementType: "welcome_bag", cityId: "innsbruck", eventId: "innsbruck-private-weekend", startDate: "2026-08-01", endDate: "2026-10-31", value: 3500, status: "active" },
];

export const partnerMetrics: PartnerMetric[] = [
  { id: "pm-1", partnerId: "signature-city-stay", views: 12840, clicks: 940, leads: 42, bookings: 7, redemptions: 18 },
  { id: "pm-2", partnerId: "midnight-bar", views: 8210, clicks: 610, leads: 31, bookings: 4, redemptions: 22 },
];

export const referralCampaigns: ReferralCampaign[] = [
  { id: "ref-camp-black", name: "Black Circle Referral", code: "HOTMESS-BLACK", rewardType: "points", rewardValue: 500, status: "active" },
  { id: "ref-camp-hotel", name: "Host Hotel Invite", code: "HOSTCITY", rewardType: "hotel_benefit", rewardValue: 1, status: "active" },
];
