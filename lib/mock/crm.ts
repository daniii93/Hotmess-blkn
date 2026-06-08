import type { AutomationRule, CustomerProfile, LoyaltyAccount, LoyaltyTransaction, Referral, Reward } from "../../types";

export const customerProfiles: CustomerProfile[] = [
  {
    id: "customer-1",
    userId: "1",
    lifecycleStage: "passport_black",
    loyaltyLevel: "black",
    loyaltyScore: 6840,
    eventScore: 92,
    travelScore: 78,
    communityScore: 84,
    membershipScore: 96,
  },
  {
    id: "customer-2",
    userId: "2",
    lifecycleStage: "passport_plus",
    loyaltyLevel: "gold",
    loyaltyScore: 3120,
    eventScore: 74,
    travelScore: 68,
    communityScore: 52,
    membershipScore: 81,
  },
];

export const loyaltyAccounts: LoyaltyAccount[] = [
  { id: "loyalty-1", userId: "1", pointsBalance: 6840, level: "black", nextRewardId: "reward-welcome-gift", updatedAt: "2026-06-02" },
  { id: "loyalty-2", userId: "2", pointsBalance: 3120, level: "gold", nextRewardId: "reward-fast-lane", updatedAt: "2026-06-02" },
];

export const loyaltyTransactions: LoyaltyTransaction[] = [
  { id: "ltx-register", userId: "1", type: "registration", points: 150, description: "Passport profile created", createdAt: "2026-05-01" },
  { id: "ltx-ticket", userId: "1", type: "ticket_purchase", points: 420, description: "Ticket purchase", createdAt: "2026-05-09" },
  { id: "ltx-referral", userId: "1", type: "referral", points: 500, description: "Referral converted", createdAt: "2026-05-24" },
];

export const rewards: Reward[] = [
  { id: "reward-early-access", title: "Early Access Window", pointsRequired: 700, levelRequired: "member", description: "Priority signal before public allocation opens.", status: "available" },
  { id: "reward-fast-lane", title: "Fast Lane Moment", pointsRequired: 3000, levelRequired: "gold", description: "Prepared fast lane benefit for a selected HotMess chapter.", status: "limited" },
  { id: "reward-welcome-gift", title: "Welcome Gift", pointsRequired: 5200, levelRequired: "black", description: "Limited gift layer for Black and high-score members.", status: "limited" },
];

export const referrals: Referral[] = [
  { id: "ref-1", userId: "1", code: "HOTMESS-BLACK", referredUserId: "2", status: "converted", rewardGranted: true },
  { id: "ref-2", userId: "1", code: "HOTMESS-BLACK", status: "invited", rewardGranted: false },
];

export const automationRules: AutomationRule[] = [
  { id: "auto-register", trigger: "registration", action: "welcome_email", enabled: true, status: "draft" },
  { id: "auto-event-purchase", trigger: "event_purchase", action: "hotel_recommendation", enabled: true, status: "draft" },
  { id: "auto-hotel-booking", trigger: "hotel_booking", action: "package_recommendation", enabled: true, status: "draft" },
  { id: "auto-event-attended", trigger: "event_attended", action: "next_event_recommendation", enabled: true, status: "draft" },
  { id: "auto-upgrade", trigger: "membership_upgrade", action: "benefits_mail", enabled: true, status: "draft" },
  { id: "auto-birthday", trigger: "birthday", action: "birthday_benefit", enabled: false, status: "paused" },
  { id: "auto-inactive", trigger: "inactivity", action: "reactivation", enabled: false, status: "paused" },
  { id: "auto-referral", trigger: "referral_success", action: "bonus_points", enabled: true, status: "draft" },
];
