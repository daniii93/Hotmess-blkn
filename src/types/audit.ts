export type AuditAction =
  | "login"
  | "verification"
  | "ticket_purchase"
  | "payment"
  | "scan"
  | "admin_change"
  | "discount_code_created"
  | "addon_booked"
  | "user_banned"
  | "post_deleted"
  | "broadcast_sent";

export type AuditActor = {
  userId: string;
  role: "guest" | "user" | "scanner" | "admin";
};

export type AuditEvent = {
  id: string;
  action: AuditAction;
  actor: AuditActor;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: string;
};

