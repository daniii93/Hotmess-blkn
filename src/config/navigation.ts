export type NavigationItem = Readonly<{
  href: string;
  labelKey: string;
}>;

export const appNavigation = [
  { href: "/feed", labelKey: "feed" },
  { href: "/explore", labelKey: "explore" },
  { href: "/events", labelKey: "events" },
  { href: "/friends", labelKey: "friends" },
  { href: "/chat", labelKey: "chat" },
  { href: "/notifications", labelKey: "notifications" },
  { href: "/profile", labelKey: "profile" },
  { href: "/create", labelKey: "create" },
] as const satisfies readonly NavigationItem[];

export const datingNavigation = [
  { href: "/dating", labelKey: "discover" },
  { href: "/dating/likes", labelKey: "likes" },
  { href: "/dating/matches", labelKey: "matches" },
  { href: "/dating/profile", labelKey: "profile" },
] as const satisfies readonly NavigationItem[];

export const businessNavigation = [
  { href: "/business", labelKey: "network" },
  { href: "/business/jobs", labelKey: "jobs" },
  { href: "/business/coffee", labelKey: "coffee" },
  { href: "/business/groups", labelKey: "groups" },
  { href: "/business/profile", labelKey: "profile" },
] as const satisfies readonly NavigationItem[];

export const adminNavigation = [
  { href: "/admin", labelKey: "dashboard" },
  { href: "/admin/events", labelKey: "events" },
  { href: "/admin/users", labelKey: "users" },
  { href: "/admin/codes", labelKey: "codes" },
  { href: "/admin/scanners", labelKey: "scanners" },
  { href: "/admin/hotel", labelKey: "hotel" },
  { href: "/admin/moderation", labelKey: "moderation" },
  { href: "/admin/broadcast", labelKey: "broadcast" },
] as const satisfies readonly NavigationItem[];
