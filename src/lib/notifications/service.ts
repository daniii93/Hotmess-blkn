import type { NotificationChannel, NotificationIntent, NotificationPreference, NotificationTarget } from "./types";

export type NotificationRequest = {
  userId: string;
  intent: NotificationIntent;
  channels: NotificationChannel[];
  title: string;
  body: string;
  target?: NotificationTarget;
  data?: Record<string, unknown>;
};

export const createNotificationRequest = (request: NotificationRequest): NotificationRequest => request;

export const shouldSendPushNotification = (
  intent: NotificationIntent,
  preferences: NotificationPreference,
): boolean => {
  if (!preferences.pushEnabled) return false;
  if (intent === "chat" && !preferences.chatMessages) return false;
  if ((intent === "event_reminder" || intent === "event_cancelled") && !preferences.eventUpdates) return false;
  if (intent === "waitlist_promotion" && !preferences.waitlistUpdates) return false;
  if (intent === "admin_broadcast" && !preferences.marketingEnabled) return false;
  return true;
};

export const getNotificationTargetPath = (target: NotificationTarget, id: string): string => {
  const paths: Record<NotificationTarget, string> = {
    ticket: `/account/tickets/${id}`,
    event: `/events/${id}`,
    checkout: `/checkout/${id}`,
    chat: `/chat/${id}`,
    profile: `/profile/${id}`,
    admin: `/admin/${id}`,
  };

  return paths[target];
};
