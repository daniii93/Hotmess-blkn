export type AuditEventName =
  | "login"
  | "logout"
  | "verification_started"
  | "verification_approved"
  | "verification_rejected"
  | "ticket_purchased"
  | "ticket_scanned"
  | "ticket_cancelled"
  | "ticket_resent"
  | "discount_code_created"
  | "user_blocked"
  | "user_role_changed"
  | "post_deleted"
  | "message_deleted"
  | "broadcast_sent"
  | "admin_login"
  | "event_created"
  | "event_published"
  | "event_cancelled"
  | "scanner_access_created";

export const auditEventLabels: Readonly<Record<AuditEventName, string>> = {
  login: "Login",
  logout: "Logout",
  verification_started: "Verifikation gestartet",
  verification_approved: "Verifikation bestaetigt",
  verification_rejected: "Verifikation abgelehnt",
  ticket_purchased: "Ticket gekauft",
  ticket_scanned: "Ticket gescannt",
  ticket_cancelled: "Ticket storniert",
  ticket_resent: "Ticket erneut gesendet",
  discount_code_created: "Rabattcode erstellt",
  user_blocked: "Nutzer blockiert",
  user_role_changed: "Nutzerrolle geaendert",
  post_deleted: "Beitrag geloescht",
  message_deleted: "Nachricht geloescht",
  broadcast_sent: "Broadcast gesendet",
  admin_login: "Admin Login",
  event_created: "Event erstellt",
  event_published: "Event veroeffentlicht",
  event_cancelled: "Event abgesagt",
  scanner_access_created: "Scanner-Zugang erstellt",
};
