import type { UserRole } from "./roles";

export type Permission =
  | "view_account"
  | "view_member_benefits"
  | "view_ticket_wallet"
  | "access_admin"
  | "manage_events"
  | "manage_hotels"
  | "manage_packages"
  | "manage_community"
  | "manage_membership"
  | "manage_partners"
  | "manage_gallery"
  | "access_partner_portal"
  | "manage_partner_profile"
  | "view_partner_metrics";

export const rolePermissions: Record<UserRole, Permission[]> = {
  guest: [],
  member: ["view_account", "view_member_benefits", "view_ticket_wallet"],
  passport_plus: ["view_account", "view_member_benefits", "view_ticket_wallet"],
  passport_black: ["view_account", "view_member_benefits", "view_ticket_wallet"],
  admin: [
    "view_account",
    "view_member_benefits",
    "view_ticket_wallet",
    "access_admin",
    "manage_events",
    "manage_hotels",
    "manage_packages",
    "manage_community",
    "manage_membership",
    "manage_partners",
    "manage_gallery",
    "access_partner_portal",
    "manage_partner_profile",
    "view_partner_metrics",
  ],
  partner: ["access_partner_portal", "manage_partner_profile", "view_partner_metrics"],
  sponsor: ["access_partner_portal", "view_partner_metrics"],
};

export const hasPermission = (role: UserRole, permission: Permission): boolean =>
  rolePermissions[role].includes(permission);

export const hasAnyPermission = (role: UserRole, permissions: Permission[]): boolean =>
  permissions.some((permission) => hasPermission(role, permission));
