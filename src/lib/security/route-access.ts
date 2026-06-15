import type { UserRole, VerificationStatus } from "../../types/roles";

export type RouteAccessLevel = "public" | "auth" | "verified" | "scanner" | "admin";

export type RouteAccessContext = {
  userId?: string;
  role: UserRole;
  verificationStatus?: VerificationStatus;
};

export const routeAccessMap: Readonly<Record<RouteAccessLevel, readonly string[]>> = {
  public: ["/", "/event-preview", "/login", "/register", "/impressum", "/datenschutz", "/agb"],
  auth: ["/feed", "/events", "/profile", "/tickets", "/chat"],
  verified: ["/checkout", "/addons", "/group-booking"],
  scanner: ["/scanner"],
  admin: ["/admin"],
};

export const canAccessRouteLevel = (
  level: RouteAccessLevel,
  context: RouteAccessContext,
): boolean => {
  if (level === "public") return true;
  if (!context.userId || context.role === "guest") return false;
  if (level === "auth") return true;
  if (level === "verified") return context.verificationStatus === "verified";
  if (level === "scanner") return context.role === "scanner" || context.role === "admin";
  return context.role === "admin";
};
