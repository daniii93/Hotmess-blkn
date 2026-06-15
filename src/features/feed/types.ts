export type PostType = "text" | "image" | "event" | "announcement";

export type FeedVisibility = "members" | "followers" | "event_attendees" | "private";

export type FeedPost = {
  id: string;
  authorId: string;
  type: PostType;
  eventId?: string;
  content?: string;
  imageUrl?: string;
  visibility: FeedVisibility;
  createdAt: string;
};

export type FeedRankingSignal = {
  postId: string;
  isFollowedAuthor: boolean;
  sharesEvent: boolean;
  recencyScore: number;
  engagementScore: number;
};

export type EventPostTrigger = "event_published" | "event_sold_out" | "event_cancelled";

export type FeedNotificationType =
  | "like"
  | "comment"
  | "follow"
  | "follow_request"
  | "chat_message"
  | "event_update";

export type FriendActivityType = "follow" | "event_attendance" | "ticket_purchase";

export type FriendActivity = {
  id: string;
  type: FriendActivityType;
  actorId: string;
  actorName: string;
  targetUserId?: string;
  targetUserName?: string;
  eventId?: string;
  eventTitle?: string;
  createdAt: string;
  visible: boolean;
};

export type CommunityKpiSnapshot = {
  dau: number;
  mau: number;
  posts: number;
  comments: number;
  likes: number;
  chatMessages: number;
  newFollows: number;
};
