export type RealtimeChannelName =
  | "chat_messages"
  | "chat_reactions"
  | "chat_polls"
  | "post_reactions"
  | "post_comments"
  | "follows"
  | "notifications";

export type RealtimeChannelConfig = {
  channel: RealtimeChannelName;
  table: string;
  event: "INSERT" | "UPDATE" | "DELETE" | "*";
  requiresAuth: boolean;
};

export const communityRealtimeChannels: readonly RealtimeChannelConfig[] = [
  { channel: "chat_messages", table: "chat_messages", event: "*", requiresAuth: true },
  { channel: "chat_reactions", table: "chat_reactions", event: "*", requiresAuth: true },
  { channel: "chat_polls", table: "chat_polls", event: "*", requiresAuth: true },
  { channel: "post_reactions", table: "post_reactions", event: "*", requiresAuth: true },
  { channel: "post_comments", table: "post_comments", event: "*", requiresAuth: true },
  { channel: "follows", table: "follows", event: "*", requiresAuth: true },
  { channel: "notifications", table: "notifications", event: "*", requiresAuth: true },
];
