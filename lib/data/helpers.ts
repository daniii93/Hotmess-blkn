import type { Event, GalleryItem, Hotel, MembershipTier, Package, Partner } from "../../types";
import { events, galleryItems, hotels, membershipTiers, packages, partners } from "../mock";

const bySlug = <T extends { slug: string }>(items: T[], slug: string): T | undefined =>
  items.find((item) => item.slug === slug);

const byCity = <T extends { city: string }>(items: T[], city: string): T[] =>
  items.filter((item) => item.city.toLowerCase() === city.toLowerCase());

const isFutureDate = (value: string, now: Date = new Date()): boolean => new Date(value).getTime() >= now.getTime();

export const getEventBySlug = (slug: string): Event | undefined => bySlug(events, slug);

export const getHotelBySlug = (slug: string): Hotel | undefined => bySlug(hotels, slug);

export const getPackageBySlug = (slug: string): Package | undefined => bySlug(packages, slug);

export const getGalleryBySlug = (slug: string): GalleryItem | undefined => bySlug(galleryItems, slug);

export const getPartnerBySlug = (slug: string): Partner | undefined => bySlug(partners, slug);

export const getEventsByCity = (city: string): Event[] => byCity(events, city);

export const getPackagesByCity = (city: string): Package[] => byCity(packages, city);

export const getHotelsByCity = (city: string): Hotel[] => byCity(hotels, city);

export const getActiveMembershipTiers = (): MembershipTier[] =>
  membershipTiers
    .filter((tier) => tier.status === "active")
    .sort((a, b) => a.priority - b.priority);

export const getFeaturedPartners = (): Partner[] =>
  partners.filter((partner) => partner.status === "active" && ["premium", "signature"].includes(partner.partnerType));

export const getUpcomingEvents = (now: Date = new Date()): Event[] =>
  events
    .filter((event) => event.status === "published" && isFutureDate(event.startDate, now))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

export const getFeaturedPackages = (): Package[] =>
  packages.filter((item) => item.status === "published" && ["vip", "signature"].includes(item.packageType));
