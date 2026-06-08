import type { CommunityEvent } from "../../types";
import { platformConfig } from "../config/platform";

export const communityEvents: CommunityEvent[] = [
  {
    id: "community-predrinks-innsbruck",
    title: "Passport Pre-Drinks",
    slug: "passport-pre-drinks-innsbruck",
    city: "Innsbruck",
    venue: "Partner Bar",
    address: "Member-only address",
    startDate: "2026-09-12T19:30:00+02:00",
    endDate: "2026-09-12T21:30:00+02:00",
    eventType: "pre_drinks",
    shortDescription: "A members-first pre-drink before the Innsbruck chapter.",
    longDescription: "Hosted arrivals, partner welcome benefit and a softer social entry into the evening.",
    heroImage: platformConfig.assets.community,
    galleryImages: [platformConfig.assets.community, platformConfig.assets.waitlist],
    memberOnly: true,
    capacity: 60,
    registrationRequired: true,
    registrationUrl: "/community/events",
    partnerIds: ["midnight-bar"],
    sponsorIds: [],
    ambassadorIds: ["ambassador-innsbruck"],
    dressCode: "Elevated evening casual",
    safetyNotes: ["Member check-in required."],
    faq: [{ question: "Can non-members join?", answer: "Selected guests can join by host approval." }],
    status: "published",
  },
];
