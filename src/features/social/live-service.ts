import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile } from "@/features/events/live-service";

export type FeedAuthor = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  city: string | null;
};

export type SocialPost = {
  id: string;
  author: FeedAuthor;
  eventId: string | null;
  type: string;
  content: string | null;
  mediaUrls: string[];
  hashtags: string[];
  locationLabel: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  likedByMe: boolean;
};

export type SocialStory = {
  id: string;
  author: FeedAuthor;
  mediaUrl: string | null;
  textOverlay: string | null;
  type: string;
  createdAt: string;
};

export type FriendActivityItem = {
  id: string;
  actor: FeedAuthor;
  activityType: string;
  referenceLabel: string | null;
  eventId: string | null;
  createdAt: string;
};

export type ConversationSummary = {
  id: string;
  type: string;
  name: string;
  preview: string | null;
  lastMessageAt: string;
  unreadCount: number;
};

export type ChatMessage = {
  id: string;
  sender: FeedAuthor | null;
  senderId: string | null;
  type: string;
  content: string | null;
  mine: boolean;
  createdAt: string;
  replyToId: string | null;
  edited: boolean;
  editedAt: string | null;
  transcript: string | null;
  isDeletedForAll: boolean;
  isPinned: boolean;
  reactions: Array<{ userId: string; emoji: string }>;
};

export type ChatMember = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  role: "member" | "admin";
  nickname: string | null;
  joinedAt: string | null;
  mine: boolean;
};

export type ChatThreadMeta = {
  id: string;
  type: string;
  name: string;
  avatarUrl: string | null;
  memberCount: number;
  isGroupLike: boolean;
  currentUserRole: "member" | "admin" | null;
  callsEnabled: boolean;
  isMuted: boolean;
  members: ChatMember[];
};

export type NotificationItem = {
  id: string;
  type: string;
  category: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

const authorSelect = "id,first_name,last_name,username,avatar_url,city";

const mapAuthor = (profile: any): FeedAuthor => ({
  id: profile.id,
  name: `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || profile.username,
  username: profile.username,
  avatarUrl: profile.avatar_url,
  city: profile.city,
});

export const getFeedPosts = async (): Promise<SocialPost[]> => {
  const profile = await getCurrentUserProfile();
  if (!profile) return [];

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id,user_id,author_id,event_id,type,content,body,media_urls,image_url,hashtags,location_label,likes_count,comments_count,created_at,
      profiles!posts_user_id_fkey(${authorSelect}),
      likes(user_id)
    `,
    )
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) throw new Error(error.message);

  return (data ?? []).map((post: any) => {
    const author = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
    return {
      id: post.id,
      author: mapAuthor(author),
      eventId: post.event_id,
      type: post.type,
      content: post.content ?? post.body,
      mediaUrls: post.media_urls?.length ? post.media_urls : post.image_url ? [post.image_url] : [],
      hashtags: post.hashtags ?? [],
      locationLabel: post.location_label,
      likesCount: post.likes_count ?? 0,
      commentsCount: post.comments_count ?? 0,
      createdAt: post.created_at,
      likedByMe: (post.likes ?? []).some((like: any) => like.user_id === profile.id),
    };
  });
};

export const getStoryBar = async (): Promise<SocialStory[]> => {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("stories")
    .select(`id,user_id,media_url,text_overlay,type,created_at,profiles!stories_user_id_fkey(${authorSelect})`)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return (data ?? []).map((story: any) => ({
    id: story.id,
    author: mapAuthor(Array.isArray(story.profiles) ? story.profiles[0] : story.profiles),
    mediaUrl: story.media_url,
    textOverlay: story.text_overlay,
    type: story.type,
    createdAt: story.created_at,
  }));
};

export const getFriendActivity = async (): Promise<FriendActivityItem[]> => {
  const profile = await getCurrentUserProfile();
  if (!profile) return [];

  const supabase = createSupabaseAdminClient();
  const { data: friendRows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", profile.id);
  const friendIds = (friendRows ?? []).map((row) => row.following_id);

  if (friendIds.length === 0) return [];

  const { data, error } = await supabase
    .from("friend_activity")
    .select(`id,actor_id,user_id,activity_type,type,reference_label,event_id,created_at,profiles!friend_activity_actor_id_fkey(${authorSelect})`)
    .in("actor_id", friendIds)
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) throw new Error(error.message);

  return (data ?? []).map((item: any) => ({
    id: item.id,
    actor: mapAuthor(Array.isArray(item.profiles) ? item.profiles[0] : item.profiles),
    activityType: item.activity_type ?? item.type,
    referenceLabel: item.reference_label,
    eventId: item.event_id,
    createdAt: item.created_at,
  }));
};

export const getConversations = async (): Promise<ConversationSummary[]> => {
  const profile = await getCurrentUserProfile();
  if (!profile) return [];

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("conversation_members")
    .select("unread_count,conversations(id,type,name,last_message_preview,last_message_at,event_id)")
    .eq("user_id", profile.id)
    .is("left_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => {
    const conversation = Array.isArray(row.conversations) ? row.conversations[0] : row.conversations;
    return {
      id: conversation.id,
      type: conversation.type,
      name: conversation.name ?? (conversation.type === "event" ? "Event-Chat" : "Direktnachricht"),
      preview: conversation.last_message_preview,
      lastMessageAt: conversation.last_message_at,
      unreadCount: row.unread_count ?? 0,
    };
  });
};

export const getChatMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  const profile = await getCurrentUserProfile();
  if (!profile) return [];

  const supabase = createSupabaseAdminClient();
  await supabase.rpc("mark_conversation_read", { p_conversation_id: conversationId, p_user_id: profile.id });

  const { data, error } = await supabase
    .from("messages")
    .select(`id,sender_id,type,content,body,created_at,reply_to_id,edited,edited_at,transcript,is_deleted_for_all,is_pinned,profiles!messages_sender_id_fkey(${authorSelect}),message_reactions(user_id,emoji)`)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) throw new Error(error.message);

  return (data ?? []).map((message: any) => ({
    id: message.id,
    senderId: message.sender_id,
    sender: message.profiles ? mapAuthor(Array.isArray(message.profiles) ? message.profiles[0] : message.profiles) : null,
    type: message.type,
    content: message.is_deleted_for_all ? null : message.content ?? message.body,
    mine: message.sender_id === profile.id,
    createdAt: message.created_at,
    replyToId: message.reply_to_id,
    edited: Boolean(message.edited),
    editedAt: message.edited_at,
    transcript: message.transcript,
    isDeletedForAll: Boolean(message.is_deleted_for_all),
    isPinned: Boolean(message.is_pinned),
    reactions: (message.message_reactions ?? []).map((reaction: any) => ({ userId: reaction.user_id, emoji: reaction.emoji })),
  }));
};

export const getChatThreadMeta = async (conversationId: string): Promise<ChatThreadMeta | null> => {
  const profile = await getCurrentUserProfile();
  if (!profile) return null;

  const supabase = createSupabaseAdminClient();
  const [{ data: membership }, conversationResult, { data: memberRows }] = await Promise.all([
    supabase
      .from("conversation_members")
      .select("role,is_muted,muted")
      .eq("conversation_id", conversationId)
      .eq("user_id", profile.id)
      .is("left_at", null)
      .maybeSingle(),
    supabase.from("conversations").select("id,type,name,avatar_url,calls_enabled").eq("id", conversationId).maybeSingle(),
    supabase
      .from("conversation_members")
      .select(`user_id,role,nickname,joined_at,profiles(${authorSelect})`)
      .eq("conversation_id", conversationId)
      .is("left_at", null)
      .order("joined_at", { ascending: true })
      .limit(250),
  ]);

  let conversation: any = conversationResult.data;
  if (conversationResult.error && /calls_enabled/i.test(conversationResult.error.message)) {
    const retry = await supabase.from("conversations").select("id,type,name,avatar_url").eq("id", conversationId).maybeSingle();
    conversation = retry.data;
  } else if (conversationResult.error) {
    throw new Error(conversationResult.error.message);
  }

  if (!conversation || (!membership && profile.role !== "admin")) return null;

  const members = (memberRows ?? []).map((row: any) => {
    const memberProfile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const author = mapAuthor(memberProfile);
    return {
      id: row.user_id,
      name: row.nickname || author.name,
      username: author.username,
      avatarUrl: author.avatarUrl,
      role: row.role === "admin" ? "admin" : "member",
      nickname: row.nickname,
      joinedAt: row.joined_at,
      mine: row.user_id === profile.id,
    } satisfies ChatMember;
  });

  const isGroupLike = conversation.type === "group" || conversation.type === "event";
  return {
    id: conversation.id,
    type: conversation.type,
    name: conversation.name ?? (conversation.type === "event" ? "Event-Chat" : isGroupLike ? "Gruppenchat" : "Direktnachricht"),
    avatarUrl: conversation.avatar_url ?? null,
    memberCount: members.length,
    isGroupLike,
    currentUserRole: membership?.role === "admin" ? "admin" : membership ? "member" : profile.role === "admin" ? "admin" : null,
    callsEnabled: Boolean(conversation.calls_enabled),
    isMuted: Boolean((membership as any)?.is_muted ?? (membership as any)?.muted),
    members,
  };
};

export const getNotifications = async (): Promise<NotificationItem[]> => {
  const profile = await getCurrentUserProfile();
  if (!profile) return [];

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id,type,category,title,body,is_read,created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return (data ?? []).map((item) => ({
    id: item.id,
    type: item.type,
    category: item.category,
    title: item.title,
    body: item.body,
    isRead: item.is_read,
    createdAt: item.created_at,
  }));
};

export const getExploreData = async () => {
  const supabase = createSupabaseAdminClient();
  const [{ data: profiles }, { data: hashtags }, { data: events }] = await Promise.all([
    supabase.from("profiles").select(`${authorSelect}`).eq("is_banned", false).limit(8),
    supabase.from("trending_hashtags").select("hashtag,post_count").order("trend_score", { ascending: false }).limit(12),
    supabase.from("events").select("id,slug,title,city,date_start,starts_at").in("status", ["published", "sold_out"]).limit(6),
  ]);

  return {
    people: (profiles ?? []).map(mapAuthor),
    hashtags: hashtags ?? [],
    events: events ?? [],
  };
};
