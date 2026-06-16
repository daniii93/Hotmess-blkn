export type NavItemKey = "home" | "watch" | "inbox" | "explore" | "profile";

export type NavItem = {
  key: NavItemKey;
  href: string;
  label: string;
  icon: "home" | "heart" | "send" | "search" | "avatar";
  badge: null | "new" | "count" | "dot";
};

export const navItems = [
  { key: "home", href: "/feed", label: "Start", icon: "home", badge: null },
  { key: "watch", href: "/dating", label: "Dating", icon: "heart", badge: null },
  { key: "inbox", href: "/chat", label: "Nachrichten", icon: "send", badge: "count" },
  { key: "explore", href: "/explore", label: "Entdecken", icon: "search", badge: null },
  { key: "profile", href: "/profile", label: "Profil", icon: "avatar", badge: "dot" },
] as const satisfies readonly NavItem[];

export const getNavItemForPath = (pathname: string): NavItem | undefined => {
  const normalized = pathname === "/" ? "/feed" : pathname;
  return [...navItems]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => normalized === item.href || normalized.startsWith(`${item.href}/`));
};
