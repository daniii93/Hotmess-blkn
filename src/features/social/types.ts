export type FollowStatus = "pending" | "accepted" | "rejected";

export type SocialRelationshipStatus = "none" | FollowStatus | "blocked";

export type SocialAction = "follow" | "unfollow" | "block" | "unblock";

export type ModerationReason = "spam" | "harassment" | "fake_profile" | "inappropriate_content";

export type CommunityAuditAction =
  | "post_created"
  | "post_deleted"
  | "comment_deleted"
  | "profile_suspended"
  | "message_deleted";

export type SocialGraphSnapshot = {
  followerCount: number;
  followingCount: number;
  mutualFriendIds: string[];
  mutualEventIds: string[];
};
