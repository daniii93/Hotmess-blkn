export type SecurityRole = "guest" | "member" | "passport_plus" | "passport_black" | "admin" | "partner" | "sponsor" | "city_operator" | "city_manager" | "city_ambassador_lead" | "community_lead" | "partner_manager";

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
  | "view_partner_metrics"
  | "manage_city"
  | "view_city_reports"
  | "manage_security"
  | "manage_operations";

export const rolePermissions: Record<SecurityRole, Permission[]> = {
  guest: [],
  member: ["view_account", "view_member_benefits", "view_ticket_wallet"],
  passport_plus: ["view_account", "view_member_benefits", "view_ticket_wallet"],
  passport_black: ["view_account", "view_member_benefits", "view_ticket_wallet"],
  admin: ["access_admin", "manage_events", "manage_hotels", "manage_packages", "manage_community", "manage_membership", "manage_partners", "manage_gallery", "view_partner_metrics", "manage_security", "manage_operations"],
  partner: ["access_partner_portal", "manage_partner_profile", "view_partner_metrics"],
  sponsor: ["access_partner_portal", "view_partner_metrics"],
  city_operator: ["access_admin", "manage_city", "manage_events", "manage_hotels", "manage_community", "manage_partners", "view_city_reports"],
  city_manager: ["access_admin", "manage_city", "view_city_reports"],
  city_ambassador_lead: ["access_admin", "manage_community", "view_city_reports"],
  community_lead: ["access_admin", "manage_community", "view_city_reports"],
  partner_manager: ["access_admin", "manage_partners", "view_partner_metrics"],
};
