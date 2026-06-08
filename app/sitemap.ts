import { events } from "../lib/mock/events";
import { galleryItems } from "../lib/mock/gallery";
import { hotels } from "../lib/mock/hotels";
import { packages } from "../lib/mock/packages";
import { SITE_URL } from "../lib/seo/metadata";

type SitemapEntry = {
  url: string;
  lastModified: Date;
  changeFrequency: "weekly" | "monthly";
  priority: number;
};

const staticRoutes = [
  "/",
  "/events",
  "/tickets",
  "/hotels",
  "/travel",
  "/packages",
  "/community",
  "/membership",
  "/app",
  "/partners",
  "/partners/referrals",
  "/partners/analytics",
  "/partners/campaigns",
  "/gallery",
  "/contact",
];

export default function sitemap(): SitemapEntry[] {
  const now = new Date();
  const detailRoutes = [
    ...events.map((event) => `/events/${event.slug}`),
    ...hotels.map((hotel) => `/hotels/${hotel.slug}`),
    ...packages.map((item) => `/packages/${item.slug}`),
    ...galleryItems.map((item) => `/gallery/${item.slug}`),
  ];

  return [...staticRoutes, ...detailRoutes].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : route.includes("/events/") || route.includes("/packages/") ? 0.85 : 0.7,
  }));
}
