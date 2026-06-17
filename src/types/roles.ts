export type UserRole = "guest" | "user" | "scanner" | "admin";

export type Permission =
  | "view_public"
  | "view_app"
  | "buy_ticket"
  | "book_addon"
  | "use_chat"
  | "scan_ticket"
  | "manage_orders"
  | "manage_discount_codes"
  | "manage_scanners"
  | "moderate_content"
  | "view_admin"
  | "view_public_landing"
  | "view_event_preview"
  | "view_legal_pages"
  | "start_login"
  | "start_registration"
  | "view_feed"
  | "create_post"
  | "view_profiles"
  | "follow_users"
  | "view_events"
  | "buy_tickets"
  | "book_addons"
  | "use_event_chat"
  | "scan_tickets"
  | "select_scanner_event"
  | "view_scan_result"
  | "mark_ticket_used"
  | "create_events"
  | "manage_events"
  | "manage_users"
  | "manage_tickets"
  | "manage_addons"
  | "manage_hotels"
  | "manage_scanner_access"
  | "manage_discount_codes"
  | "moderate_posts"
  | "view_bookings"
  | "view_revenue"
  | "send_broadcasts";

export type RoleDefinition = Readonly<{
  role: UserRole;
  labelKey: string;
  descriptionKey: string;
  permissions: readonly Permission[];
}>;

export type VerificationStatus = "pending" | "verified" | "rejected" | "suspended" | "unverified";
