import type { Event, GalleryItem, Hotel } from "../../types";
import { SITE_URL } from "./metadata";

export type JsonLd = {
  "@context": "https://schema.org";
  "@type": string;
  [key: string]: unknown;
};

const absoluteUrl = (pathOrUrl: string): string => {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  return `${SITE_URL}/${pathOrUrl.replace(/^\/+/, "")}`;
};

export const buildOrganizationSchema = (): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "HOTMESS BLKN",
  url: SITE_URL,
  logo: absoluteUrl("/assets/hero.png"),
  sameAs: ["https://www.instagram.com/hotmess.blkn.clubbing/"],
});

export const buildWebSiteSchema = (): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "HOTMESS BLKN",
  url: SITE_URL,
  description: "Curated nights. Private weekends. A community beyond the event.",
});

export const buildEventSchema = (event: Event): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "Event",
  name: event.title,
  description: event.shortDescription,
  startDate: event.startDate,
  endDate: event.endDate,
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  image: [absoluteUrl(event.heroImage)],
  location: {
    "@type": "Place",
    name: event.venue,
    address: event.address,
  },
  organizer: {
    "@type": "Organization",
    name: "HOTMESS BLKN",
    url: SITE_URL,
  },
});

export const buildHotelSchema = (hotel: Hotel): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "Hotel",
  name: hotel.title,
  description: hotel.description,
  image: absoluteUrl(hotel.heroImage),
  address: hotel.address,
});

export const buildBreadcrumbSchema = (items: Array<{ name: string; url: string }>): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.url),
  })),
});

export const buildGalleryBreadcrumbSchema = (item: GalleryItem): JsonLd =>
  buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Gallery", url: "/gallery" },
    { name: item.title, url: `/gallery/${item.slug}` },
  ]);
