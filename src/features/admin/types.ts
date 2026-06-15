export type AdminMetric = {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "flat";
};

export type AdminAction =
  | "manage_events"
  | "manage_tickets"
  | "manage_users"
  | "manage_reports"
  | "manage_scanner"
  | "view_analytics"
  | "manage_orders"
  | "manage_addons"
  | "manage_hotels"
  | "manage_discounts"
  | "manage_broadcasts";

export type AdminNavigationItem =
  | "dashboard"
  | "events"
  | "sales"
  | "users"
  | "verification"
  | "tickets"
  | "orders"
  | "addons"
  | "hotels"
  | "discount_codes"
  | "scanners"
  | "moderation"
  | "broadcast"
  | "analytics"
  | "settings";

export type AdminAuditAction =
  | "admin_login"
  | "event_created"
  | "event_published"
  | "event_cancelled"
  | "ticket_cancelled"
  | "ticket_resent"
  | "user_blocked"
  | "user_role_changed"
  | "verification_approved"
  | "verification_rejected"
  | "discount_code_created"
  | "scanner_access_created"
  | "broadcast_sent"
  | "post_deleted"
  | "message_deleted";

export type AdminAuditEntry = {
  actorId: string;
  entityType: string;
  entityId: string;
  action: AdminAuditAction;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  createdAt: string;
};
