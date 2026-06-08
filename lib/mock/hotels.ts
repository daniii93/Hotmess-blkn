import type { Hotel } from "../../types";
import { platformConfig } from "../config/platform";

export const hotels: Hotel[] = [
  {
    id: "signature-city-stay",
    title: "Signature City Stay",
    slug: "signature-city-stay",
    city: "Innsbruck",
    address: "Innsbruck city center",
    description: "A host-hotel style stay for private arrivals, late checkout requests and Passport-led travel notes.",
    heroImage: platformConfig.assets.packages,
    galleryImages: [platformConfig.assets.packages, platformConfig.assets.community],
    partnerStatus: "active",
    shuttleActive: true,
    fastLaneActive: false,
    bookingUrl: "/hotels/signature-city-stay",
    membershipBenefits: ["Late checkout request", "Passport room note"],
    partnerIds: ["signature-city-stay"],
    status: "published",
  },
  {
    id: "late-checkout-vienna",
    title: "Late Checkout Vienna",
    slug: "late-checkout-vienna",
    city: "Vienna",
    address: "Vienna inner district",
    description: "A refined partner stay with member code placeholders and next-day recovery benefits.",
    heroImage: platformConfig.assets.waitlist,
    galleryImages: [platformConfig.assets.waitlist, platformConfig.assets.editorial],
    partnerStatus: "active",
    shuttleActive: false,
    fastLaneActive: true,
    bookingUrl: "/hotels/late-checkout-vienna",
    membershipBenefits: ["Member code", "Black priority request"],
    partnerIds: ["late-checkout-vienna"],
    status: "published",
  },
];
