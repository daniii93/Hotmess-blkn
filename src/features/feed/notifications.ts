import type { FeedNotificationType } from "./types";

export type FeedNotification = {
  userId: string;
  type: FeedNotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
};

export const createFeedNotification = (notification: FeedNotification): FeedNotification => notification;

export const shouldPushFeedNotification = (type: FeedNotificationType): boolean =>
  ["follow", "follow_request", "comment", "chat_message", "event_update"].includes(type);
