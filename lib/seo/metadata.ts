import type { Event, GalleryItem, Hotel, Package } from "../../types";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://hotmess-blkn.com";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/hero.png`;

export type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  robots?: "index,follow" | "noindex,nofollow";
};

export type HotMessMetadata = {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  openGraph: {
    title: string;
    description: string;
    url: string;
    siteName: "HOTMESS BLKN";
    images: string[];
    type: "website";
  };
  twitter: {
    card: "summary_large_image";
    title: string;
    description: string;
    images: string[];
  };
  robots: string;
};

const absoluteUrl = (pathOrUrl: string): string => {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  return `${SITE_URL}/${pathOrUrl.replace(/^\/+/, "")}`;
};

export const buildPageMetadata = ({
  title,
  description,
  path,
  keywords = [],
  image = DEFAULT_OG_IMAGE,
  robots = "index,follow",
}: PageMetadataInput): HotMessMetadata => {
  const fullTitle = title.includes("HOTMESS") ? title : `${title} | HOTMESS BLKN`;
  const canonical = absoluteUrl(path);
  const shareImage = absoluteUrl(image);

  return {
    title: fullTitle,
    description,
    keywords: ["HotMess", "luxury events", "membership", "travel", ...keywords],
    canonical,
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: "HOTMESS BLKN",
      images: [shareImage],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [shareImage],
    },
    robots,
  };
};

export const buildEventMetadata = (event: Event): HotMessMetadata =>
  buildPageMetadata({
    title: `${event.title} | HOTMESS Events`,
    description: event.shortDescription,
    path: `/events/${event.slug}`,
    keywords: [event.city, event.venue, "VIP access", "Passport early access"],
    image: event.heroImage,
  });

export const buildHotelMetadata = (hotel: Hotel): HotMessMetadata =>
  buildPageMetadata({
    title: `${hotel.title} | HOTMESS Hotels`,
    description: hotel.description,
    path: `/hotels/${hotel.slug}`,
    keywords: [hotel.city, "host hotel", "travel benefits"],
    image: hotel.heroImage,
  });

export const buildPackageMetadata = (item: Package): HotMessMetadata =>
  buildPageMetadata({
    title: `${item.title} | HotMess Weekends`,
    description: item.shortDescription,
    path: `/packages/${item.slug}`,
    keywords: [item.city, item.packageType, "weekend package", "concierge"],
    image: item.heroImage,
  });

export const buildGalleryMetadata = (item: GalleryItem): HotMessMetadata =>
  buildPageMetadata({
    title: `${item.title} | HOTMESS Gallery`,
    description: item.description,
    path: `/gallery/${item.slug}`,
    keywords: [item.city, item.mediaType, "aftermovie", "media archive"],
    image: item.coverImage,
  });

export const mainPageMetadata = [
  buildPageMetadata({
    title: "HOTMESS BLKN",
    description: "Curated nights. Private weekends. A community beyond the event.",
    path: "/",
    image: "/assets/hero.png",
  }),
  buildPageMetadata({
    title: "Events",
    description: "Luxury event chapters with tickets, VIP access, hotel notes and Passport early access.",
    path: "/events",
    image: "/assets/community-hero.png",
  }),
  buildPageMetadata({
    title: "Tickets",
    description: "Ticket access, VIP requests and Passport member allocation for upcoming HotMess chapters.",
    path: "/tickets",
  }),
  buildPageMetadata({
    title: "Hotels & Travel",
    description: "Host hotel benefits, travel notes and premium stay layers for HotMess weekends.",
    path: "/hotels",
    image: "/assets/packages.png",
  }),
  buildPageMetadata({
    title: "HotMess Weekends",
    description: "Your HotMess weekend starts before the door opens: event, hotel, app and VIP layers.",
    path: "/packages",
    image: "/assets/packages.png",
  }),
  buildPageMetadata({
    title: "HotMess Circle",
    description: "A private community layer for pre-drinks, brunch, travel meetups and member-only moments.",
    path: "/community",
    image: "/assets/community-hero.png",
  }),
  buildPageMetadata({
    title: "HotMess Passport",
    description: "Membership for early access, hotel benefits, partner offers and a community beyond the event.",
    path: "/membership",
    image: "/assets/waitlist.png",
  }),
  buildPageMetadata({
    title: "HotMess Guide",
    description: "A digital concierge for tickets, hotels, packages, partner offers and member benefits.",
    path: "/app",
    image: "/assets/packages.png",
  }),
  buildPageMetadata({
    title: "Partner & Sponsors",
    description: "Premium partnerships across events, hotels, packages, membership, app and community.",
    path: "/partners",
    image: "/assets/packages.png",
  }),
  buildPageMetadata({
    title: "Gallery",
    description: "A cinematic archive of HotMess aftermovies, photo stories and campaign moments.",
    path: "/gallery",
    image: "/assets/community-hero.png",
  }),
  buildPageMetadata({
    title: "Contact",
    description: "Concierge contact for packages, hotels, VIP tables, partnerships and general HotMess requests.",
    path: "/contact",
    image: "/assets/community-hero.png",
  }),
];
