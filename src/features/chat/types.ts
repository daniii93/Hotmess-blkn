export type ChatType = "direct" | "concierge" | "partner" | "event";

export type ChatMessageStatus = "sent" | "delivered" | "seen";

export type ChatParticipantState = {
  pinned: boolean;
  muted: boolean;
  deletedForUser: boolean;
  blocked: boolean;
  unreadCount: number;
};

export type ChatSendPermission = {
  allowed: boolean;
  reason?: "not_participant" | "blocked" | "read_only" | "suspended" | "banned";
};

export type EventChatReaction = "like" | "heart" | "fire" | "party";

export type EventChatPoll = {
  id: string;
  chatId: string;
  authorId: string;
  question: string;
  options: string[];
  createdAt: string;
};
