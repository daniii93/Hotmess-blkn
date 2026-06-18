export type NavItemKey = "discover" | "events" | "connect" | "business" | "services" | "benefits" | "creator" | "digitalAi";

export type NavItem = {
  key: NavItemKey;
  href: string;
  label: string;
  icon: "compass" | "calendar" | "send" | "briefcase" | "wrench" | "gift" | "sparkles" | "bot";
  badge: null | "new" | "count" | "dot";
  aliases?: readonly string[];
};

export const navItems = [
  { key: "discover", href: "/discover", label: "Discover", icon: "compass", badge: null, aliases: ["/feed", "/watch", "/explore", "/explore/people"] },
  { key: "events", href: "/events", label: "Events", icon: "calendar", badge: null, aliases: ["/tickets"] },
  { key: "connect", href: "/chat", label: "Connect", icon: "send", badge: "count", aliases: ["/friends", "/dating", "/business/coffee", "/business/groups"] },
  { key: "business", href: "/business", label: "Business", icon: "briefcase", badge: null, aliases: [] },
  { key: "services", href: "/services", label: "Dienste", icon: "wrench", badge: null, aliases: ["/local-services", "/checkout/local-services"] },
  { key: "benefits", href: "/benefits", label: "Benefits", icon: "gift", badge: null, aliases: [] },
  { key: "creator", href: "/creator", label: "Creator", icon: "sparkles", badge: null, aliases: [] },
  { key: "digitalAi", href: "/digital-ai", label: "Digital & AI", icon: "bot", badge: null, aliases: [] },
] as const satisfies readonly NavItem[];

export const getNavItemForPath = (pathname: string): NavItem | undefined => {
  const normalized = pathname === "/" ? "/feed" : pathname;
  return navItems
    .flatMap((item) => [item.href, ...(item.aliases ?? [])].map((path) => ({ item, path })))
    .sort((a, b) => b.path.length - a.path.length)
    .find(({ path }) => normalized === path || normalized.startsWith(`${path}/`))
    ?.item;
};
