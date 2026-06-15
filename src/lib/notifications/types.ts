export type NotificationChannel = "email" | "push" | "in_app";

export type NotificationIntent =
  | "welcome"
  | "ticket_confirmation"
  | "waitlist_promotion"
  | "split_payment"
  | "event_reminder"
  | "event_cancelled"
  | "chat"
  | "follow_request"
  | "comment"
  | "admin_broadcast"
  | "verification"
  | "moderation"
  | "payment";

export type NotificationTarget =
  | "ticket"
  | "event"
  | "checkout"
  | "chat"
  | "profile"
  | "admin";

export type NotificationPreference = {
  pushEnabled: boolean;
  eventUpdates: boolean;
  chatMessages: boolean;
  waitlistUpdates: boolean;
  marketingEnabled: boolean;
  quietHours?: {
    start: string;
    end: string;
  };
};
