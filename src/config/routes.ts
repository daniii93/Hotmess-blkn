export type AccessZone = "public" | "app" | "dating" | "business" | "scanner" | "admin";

export type RouteDefinition = Readonly<{
  href: string;
  pageKey: string;
  zone: AccessZone;
  navKey?: string;
  dynamic?: boolean;
}>;

export const publicRoutes = [
  { href: "/", pageKey: "landing", zone: "public", navKey: "landing" },
  { href: "/event/[slug]/preview", pageKey: "eventPreview", zone: "public", navKey: "eventPreview", dynamic: true },
  { href: "/login", pageKey: "login", zone: "public", navKey: "login" },
  { href: "/register", pageKey: "register", zone: "public", navKey: "register" },
  { href: "/register/check-email", pageKey: "checkEmail", zone: "public" },
  { href: "/reset-password", pageKey: "resetPassword", zone: "public" },
  { href: "/impressum", pageKey: "impressum", zone: "public", navKey: "impressum" },
  { href: "/agb", pageKey: "agb", zone: "public", navKey: "agb" },
  { href: "/datenschutz", pageKey: "datenschutz", zone: "public", navKey: "datenschutz" },
  { href: "/partner", pageKey: "partner", zone: "public", navKey: "partner" },
] as const satisfies readonly RouteDefinition[];

export const appRoutes = [
  { href: "/feed", pageKey: "feed", zone: "app", navKey: "feed" },
  { href: "/feed/stories/[id]", pageKey: "story", zone: "app", dynamic: true },
  { href: "/create", pageKey: "create", zone: "app", navKey: "create" },
  { href: "/explore", pageKey: "explore", zone: "app", navKey: "explore" },
  { href: "/events", pageKey: "events", zone: "app", navKey: "events" },
  { href: "/events/[slug]", pageKey: "eventDetail", zone: "app", dynamic: true },
  { href: "/events/[slug]/checkout", pageKey: "checkout", zone: "app", dynamic: true },
  { href: "/events/[slug]/waitlist", pageKey: "waitlist", zone: "app", dynamic: true },
  { href: "/tickets", pageKey: "tickets", zone: "app" },
  { href: "/connect", pageKey: "connect", zone: "app", navKey: "connect" },
  { href: "/friends", pageKey: "friends", zone: "app", navKey: "friends" },
  { href: "/friends/requests", pageKey: "friendRequests", zone: "app" },
  { href: "/chat", pageKey: "chat", zone: "app", navKey: "chat" },
  { href: "/chat/[id]", pageKey: "chatThread", zone: "app", dynamic: true },
  { href: "/notifications", pageKey: "notifications", zone: "app", navKey: "notifications" },
  { href: "/u/[username]", pageKey: "userProfile", zone: "app", dynamic: true },
  { href: "/profile", pageKey: "profile", zone: "app", navKey: "profile" },
  { href: "/profile/edit", pageKey: "profileEdit", zone: "app" },
  { href: "/settings", pageKey: "settings", zone: "app" },
  { href: "/onboarding", pageKey: "onboarding", zone: "app" },
  { href: "/verify", pageKey: "verify", zone: "app" },
] as const satisfies readonly RouteDefinition[];

export const datingRoutes = [
  { href: "/dating", pageKey: "dating", zone: "dating", navKey: "discover" },
  { href: "/dating/likes", pageKey: "datingLikes", zone: "dating", navKey: "likes" },
  { href: "/dating/matches", pageKey: "datingMatches", zone: "dating", navKey: "matches" },
  { href: "/dating/profile", pageKey: "datingProfile", zone: "dating", navKey: "profile" },
  { href: "/dating/filters", pageKey: "datingFilters", zone: "dating" },
  { href: "/dating/premium", pageKey: "datingPremium", zone: "dating" },
] as const satisfies readonly RouteDefinition[];

export const businessRoutes = [
  { href: "/business", pageKey: "business", zone: "business", navKey: "network" },
  { href: "/business/matches", pageKey: "businessMatches", zone: "business" },
  { href: "/business/coffee", pageKey: "businessCoffee", zone: "business", navKey: "coffee" },
  { href: "/business/jobs", pageKey: "businessJobs", zone: "business", navKey: "jobs" },
  { href: "/business/jobs/[id]", pageKey: "businessJobDetail", zone: "business", dynamic: true },
  { href: "/business/jobs/manage", pageKey: "businessJobsManage", zone: "business" },
  { href: "/business/profile", pageKey: "businessProfile", zone: "business", navKey: "profile" },
  { href: "/business/groups", pageKey: "businessGroups", zone: "business", navKey: "groups" },
  { href: "/business/premium", pageKey: "businessPremium", zone: "business" },
] as const satisfies readonly RouteDefinition[];

export const scannerRoutes = [
  { href: "/scanner", pageKey: "scanner", zone: "scanner" },
] as const satisfies readonly RouteDefinition[];

export const adminRoutes = [
  { href: "/admin", pageKey: "admin", zone: "admin", navKey: "dashboard" },
  { href: "/admin/events", pageKey: "adminEvents", zone: "admin", navKey: "events" },
  { href: "/admin/events/[id]/sales", pageKey: "adminEventSales", zone: "admin", dynamic: true },
  { href: "/admin/events/[id]/operations", pageKey: "adminEventOperations", zone: "admin", dynamic: true },
  { href: "/admin/events/[id]/settlement", pageKey: "adminEventSettlement", zone: "admin", dynamic: true },
  { href: "/admin/users", pageKey: "adminUsers", zone: "admin", navKey: "users" },
  { href: "/admin/users/verifications", pageKey: "adminUserVerifications", zone: "admin" },
  { href: "/admin/codes", pageKey: "adminCodes", zone: "admin", navKey: "codes" },
  { href: "/admin/scanners", pageKey: "adminScanners", zone: "admin", navKey: "scanners" },
  { href: "/admin/hotel", pageKey: "adminHotel", zone: "admin", navKey: "hotel" },
  { href: "/admin/finance", pageKey: "adminFinance", zone: "admin", navKey: "finance" },
  { href: "/admin/partners", pageKey: "adminPartners", zone: "admin", navKey: "partners" },
  { href: "/admin/partners-program", pageKey: "adminPartnersProgram", zone: "admin", navKey: "partnersProgram" },
  { href: "/admin/moderation", pageKey: "adminModeration", zone: "admin", navKey: "moderation" },
  { href: "/admin/broadcast", pageKey: "adminBroadcast", zone: "admin", navKey: "broadcast" },
  { href: "/admin/analytics", pageKey: "adminAnalytics", zone: "admin", navKey: "analytics" },
  { href: "/admin/settings", pageKey: "adminSettings", zone: "admin", navKey: "settings" },
] as const satisfies readonly RouteDefinition[];

export const allRoutes = [
  ...publicRoutes,
  ...appRoutes,
  ...datingRoutes,
  ...businessRoutes,
  ...scannerRoutes,
  ...adminRoutes,
] as const satisfies readonly RouteDefinition[];
