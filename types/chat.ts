export type ChatType = "direct" | "concierge" | "partner";

export type ChatMembershipTier =
  | "free"
  | "plus"
  | "black"
  | "ambassador"
  | "concierge"
  | "partner";

export type ChatItem = {
  id: string;
  type: ChatType;
  memberId: string;
  name: string;
  username: string;
  avatar: string;
  membershipTier: ChatMembershipTier;
  lastMessage: string;
  timestamp: string;
  lastActivity: number;
  unread: boolean;
  unreadCount?: number;
  online?: boolean;
  pinned?: boolean;
  muted?: boolean;
};

export type ChatMessage = {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  replyToMessageId?: string;
  messageType?: "text" | "image" | "video" | "audio" | "system";
  mediaUrl?: string;
  mediaVisibility?: "keep" | "once" | "replay";
  status?: "sent" | "delivered" | "seen";
  deliveredAt?: string;
  seenAt?: string;
  editedAt?: string;
  scheduledAt?: string;
  reactions?: ChatReaction[];
};

export type ChatReaction = {
  id: string;
  messageId: string;
  userId: string;
  emoji: "❤️" | "👍" | "😂" | "🔥" | "😍" | "👏" | string;
  createdAt: string;
};

export type ChatParticipant = {
  id: string;
  chatId: string;
  userId: string;
  role: ChatMembershipTier;
  unreadCount: number;
  lastReadAt: string | null;
  pinned: boolean;
  muted: boolean;
};

export type ChatProfile = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  membershipTier: ChatMembershipTier;
  city?: string;
  onlineStatus?: boolean;
};

export type ChatScreenshotEvent = {
  id: string;
  conversationId: string;
  userId: string;
  messageId?: string;
  contentId: string;
  clientEventId: string;
  capturedAt: string;
  createdAt: string;
};

export type ChatScreenshotEventPayload = {
  conversation_id: number;
  content_id: string;
  captured_at: string;
  client_event_id: string;
};
