import type { AppOffer } from "../../types";

export const appOffers: AppOffer[] = [
  {
    id: "app-offer-hotel-stay",
    title: "Signature Stay Benefit",
    partnerId: "signature-city-stay",
    city: "Innsbruck",
    description: "Hotel benefit shown as app offer card.",
    code: "HOTMESSSTAY",
    validFrom: "2026-06-01",
    validUntil: "2026-12-31",
    tierRequired: "plus",
    status: "active",
  },
  {
    id: "app-offer-welcome-drink",
    title: "Welcome Drink",
    partnerId: "midnight-bar",
    city: "Innsbruck",
    description: "Partner bar benefit for selected community evenings.",
    code: "PLUSDRINK",
    validFrom: "2026-06-01",
    validUntil: "2026-12-31",
    tierRequired: "plus",
    status: "active",
  },
];
