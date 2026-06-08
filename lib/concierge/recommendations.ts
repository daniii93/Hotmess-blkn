import { events, hotels, membershipTiers, packages } from "../mock";

export type Recommendation = {
  id: string;
  type: "event" | "hotel" | "package" | "benefit" | "community" | "city";
  title: string;
  description: string;
  relatedId: string;
  score: number;
  cityId?: string;
};

export const recommendEvents = (): Recommendation[] =>
  events.slice(0, 3).map((event) => ({ id: `rec-${event.id}`, type: "event", title: event.title, description: event.shortDescription, relatedId: event.id, score: event.ticketStatus === "few_tickets" ? 94 : 82, cityId: event.city }));

export const recommendHotels = (): Recommendation[] =>
  hotels.map((hotel) => ({ id: `rec-${hotel.id}`, type: "hotel", title: hotel.title, description: hotel.description, relatedId: hotel.id, score: hotel.fastLaneActive ? 91 : 78, cityId: hotel.city }));

export const recommendPackages = (): Recommendation[] =>
  packages.map((item) => ({ id: `rec-${item.id}`, type: "package", title: item.title, description: item.shortDescription, relatedId: item.id, score: item.packageType === "signature" ? 96 : 84, cityId: item.city }));

export const recommendBenefits = (): Recommendation[] =>
  membershipTiers.flatMap((tier) => tier.benefits.slice(0, 2).map((benefit, index) => ({ id: `rec-benefit-${tier.slug}-${index}`, type: "benefit" as const, title: benefit, description: `${tier.name} benefit`, relatedId: tier.id, score: tier.slug === "black" ? 94 : 78 })));

export const recommendCommunityEvents = (): Recommendation[] => [
  { id: "rec-community-pre-drinks", type: "community", title: "Passport Pre-Drinks", description: "Member-led arrival before the main chapter.", relatedId: "community-predrinks-innsbruck", score: 88, cityId: "Innsbruck" },
  { id: "rec-community-brunch", type: "community", title: "HotMess Brunch Circle", description: "A quieter member moment after the weekend.", relatedId: "community-brunch-vienna", score: 81, cityId: "Vienna" },
];

export const recommendCities = (): Recommendation[] => [
  { id: "rec-city-innsbruck", type: "city", title: "Innsbruck", description: "Private weekend energy, host hotels and Passport access.", relatedId: "innsbruck", score: 93, cityId: "Innsbruck" },
  { id: "rec-city-dubrovnik", type: "city", title: "Dubrovnik", description: "Signature travel, coastal hospitality and VIP layers.", relatedId: "dubrovnik", score: 89, cityId: "Dubrovnik" },
];
