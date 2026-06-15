import type { CommunityAuditAction, ModerationReason } from "./types";

export type CommunityReport = {
  id: string;
  reporterId: string;
  targetType: "post" | "comment" | "profile" | "chat_message";
  targetId: string;
  reason: ModerationReason;
  description?: string;
  status: "new" | "in_review" | "resolved" | "dismissed";
  createdAt: string;
};

export const createCommunityReport = (
  input: Omit<CommunityReport, "id" | "status" | "createdAt">,
): CommunityReport => ({
  ...input,
  id: `${input.targetType}:${input.targetId}:${Date.now()}`,
  status: "new",
  createdAt: new Date().toISOString(),
});

export const getAuditActionForModeration = (
  targetType: CommunityReport["targetType"],
): CommunityAuditAction => {
  if (targetType === "post") return "post_deleted";
  if (targetType === "comment") return "comment_deleted";
  if (targetType === "profile") return "profile_suspended";
  return "message_deleted";
};
