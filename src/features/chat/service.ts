import type { ChatMessageStatus, ChatParticipantState, ChatSendPermission } from "./types";

const STATUS_RANK: Record<ChatMessageStatus, number> = {
  sent: 1,
  delivered: 2,
  seen: 3,
};

export const progressMessageStatus = (
  current: ChatMessageStatus,
  next: ChatMessageStatus,
): ChatMessageStatus => (STATUS_RANK[next] > STATUS_RANK[current] ? next : current);

export const canSendChatMessage = (params: {
  participant?: ChatParticipantState;
  safetyStatus: "clear" | "warned" | "restricted" | "suspended" | "banned";
  chatStatus: "active" | "read_only" | "blocked" | "suspended";
}): ChatSendPermission => {
  if (!params.participant || params.participant.deletedForUser) return { allowed: false, reason: "not_participant" };
  if (params.participant.blocked || params.chatStatus === "blocked") return { allowed: false, reason: "blocked" };
  if (params.chatStatus === "read_only") return { allowed: false, reason: "read_only" };
  if (params.safetyStatus === "suspended" || params.chatStatus === "suspended") {
    return { allowed: false, reason: "suspended" };
  }
  if (params.safetyStatus === "banned") return { allowed: false, reason: "banned" };

  return { allowed: true };
};

export const canAccessEventChat = (ticket?: { status: string } | null): boolean =>
  ticket?.status === "valid";

export const createEventChatTitle = (eventTitle: string): string => `${eventTitle} Chat`;

export const isSupportedEventChatReaction = (reaction: string): boolean =>
  ["like", "heart", "fire", "party"].includes(reaction);

export const canCreatePoll = (input: { question: string; options: string[] }): boolean =>
  input.question.trim().length > 0 &&
  input.options.filter((option) => option.trim().length > 0).length >= 2;
