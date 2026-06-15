export type EmailTemplateKey =
  | "welcome_member"
  | "verify_email"
  | "verification_started"
  | "verification_approved"
  | "verification_rejected"
  | "password_reset"
  | "ticket_confirmation"
  | "hotel_confirmation"
  | "table_confirmation"
  | "drink_package_confirmation"
  | "fast_lane_confirmation"
  | "birthday_package_confirmation"
  | "waitlist_position"
  | "waitlist_promotion"
  | "split_payment_link"
  | "split_payment_reminder"
  | "group_fully_paid"
  | "event_reminder_24h"
  | "event_cancelled"
  | "qr_ticket_resend"
  | "membership_confirmation"
  | "moderation_warning";

export const emailSubjects: Record<EmailTemplateKey, string> = {
  welcome_member: "Willkommen bei HOTMESS",
  verify_email: "Bestätige deine E-Mail-Adresse",
  verification_started: "Deine Verifikation wurde gestartet",
  verification_approved: "Deine Verifikation ist bestätigt",
  verification_rejected: "Deine Verifikation wurde abgelehnt",
  password_reset: "Passwort zurücksetzen",
  ticket_confirmation: "Dein HOTMESS Ticket",
  hotel_confirmation: "Deine Hotelbuchung ist bestätigt",
  table_confirmation: "Deine Tischbuchung ist bestätigt",
  drink_package_confirmation: "Dein Getränkepaket ist bestätigt",
  fast_lane_confirmation: "Deine Fast Lane ist bestätigt",
  birthday_package_confirmation: "Dein Geburtstagspaket ist bestätigt",
  waitlist_position: "Dein Platz auf der HOTMESS Warteliste",
  waitlist_promotion: "Dein HOTMESS Platz ist frei",
  split_payment_link: "Dein Split-Payment-Link",
  split_payment_reminder: "Erinnerung an deine Split-Payment-Zahlung",
  group_fully_paid: "Eure HOTMESS Gruppe ist vollständig bezahlt",
  event_reminder_24h: "Dein HOTMESS Event startet morgen",
  event_cancelled: "Dein HOTMESS Event wurde abgesagt",
  qr_ticket_resend: "Dein HOTMESS QR Ticket",
  membership_confirmation: "Dein HOTMESS Passport ist aktiv",
  moderation_warning: "Hinweis zu deinem HOTMESS Konto",
};

export const hotmessEmailTheme = {
  background: "#050505",
  surface: "#111111",
  ivory: "#f7f1e8",
  champagne: "#d8b46a",
  red: "#9d1f2e",
  footer: "HOTMESS - Erlebnisse. Begegnungen. Erinnerungen.",
} as const;
