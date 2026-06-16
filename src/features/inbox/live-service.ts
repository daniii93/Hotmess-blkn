import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile } from "@/features/events/live-service";

export type InboxAuthor = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  city: string | null;
  hasStory: boolean;
};

export type InboxConversation = {
  id: string;
  type: "direct" | "group" | "event" | string;
  name: string;
  avatarUrl: string | null;
  participants: InboxAuthor[];
  preview: string;
  timeLabel: string;
  lastMessageAt: string;
  unreadCount: number;
  isMuted: boolean;
  isArchived: boolean;
  isEventChat: boolean;
  seenLabel: string | null;
};

export type InboxNote = {
  user: InboxAuthor;
  text: string;
  createdAt: string;
  expiresAt: string;
  mine: boolean;
};

export type MessageRequestItem = {
  id: string;
  conversationId: string | null;
  from: InboxAuthor | null;
  preview: string;
  createdAt: string;
  timeLabel: string;
};

export type InboxData = {
  viewer: InboxAuthor;
  conversations: InboxConversation[];
  notes: InboxNote[];
  requestCount: number;
};

const profileSelect = "id,first_name,last_name,username,avatar_url,city";

const initialsName = (profile: any) =>
  `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() || profile?.username || "HotMess";

const relativeTime = (value: string | null | undefined) => {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} Std.`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Gestern";
  return `${days} Tage`;
};

const mediaPreview = (type: string | null | undefined, content: string | null | undefined) => {
  if (content?.trim()) return content.trim();
  if (type === "image") return "Hat ein Foto gesendet";
  if (type === "video") return "Hat ein Reel gesendet";
  if (type === "voice") return "Hat eine Sprachnachricht gesendet";
  if (type === "event_card") return "Hat ein Event gesendet";
  if (type === "poll") return "Hat eine Umfrage gesendet";
  if (type === "location") return "Hat einen Standort gesendet";
  return "Neue Nachricht";
};

const mapAuthor = (profile: any, storyIds: Set<string> = new Set()): InboxAuthor => ({
  id: profile.id,
  name: initialsName(profile),
  username: profile.username,
  avatarUrl: profile.avatar_url,
  city: profile.city,
  hasStory: storyIds.has(profile.id),
});

const fetchStoryIds = async (userIds: string[]) => {
  if (userIds.length === 0) return new Set<string>();
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("stories")
    .select("user_id")
    .in("user_id", userIds)
    .gt("expires_at", new Date().toISOString());

  return new Set((data ?? []).map((row) => row.user_id as string));
};

export const getInboxData = async (): Promise<InboxData | null> => {
  const profile = await getCurrentUserProfile();
  if (!profile) return null;

  const supabase = createSupabaseAdminClient();

  const { data: memberships, error } = await supabase
    .from("conversation_members")
    .select("conversation_id,unread_count,last_read_at,is_muted,muted,is_archived,conversations(id,type,name,avatar_url,last_message_preview,last_message_at,event_id)")
    .eq("user_id", profile.id)
    .is("left_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const conversationIds = (memberships ?? []).map((row) => row.conversation_id);
  const [{ data: allMembers }, { data: lastMessages }, { count: requestCount }, { data: follows }, { data: notes }] = await Promise.all([
    conversationIds.length
      ? supabase
          .from("conversation_members")
          .select(`conversation_id,user_id,profiles(${profileSelect})`)
          .in("conversation_id", conversationIds)
          .is("left_at", null)
      : Promise.resolve({ data: [] as any[] }),
    conversationIds.length
      ? supabase
          .from("messages")
          .select("id,conversation_id,sender_id,type,content,body,created_at")
          .in("conversation_id", conversationIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as any[] }),
    supabase
      .from("message_requests")
      .select("id", { count: "exact", head: true })
      .eq("to_user_id", profile.id)
      .eq("status", "pending"),
    supabase.from("follows").select("following_id").eq("follower_id", profile.id),
    supabase
      .from("user_notes")
      .select(`user_id,text,created_at,expires_at,profiles(${profileSelect})`)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false }),
  ]);

  const followingIds = new Set([profile.id, ...((follows ?? []).map((row) => row.following_id) as string[])]);
  const visibleNotes = (notes ?? []).filter((note: any) => followingIds.has(note.user_id));
  const participantProfiles = (allMembers ?? []).map((row: any) => (Array.isArray(row.profiles) ? row.profiles[0] : row.profiles)).filter(Boolean);
  const noteProfiles = visibleNotes.map((note: any) => (Array.isArray(note.profiles) ? note.profiles[0] : note.profiles)).filter(Boolean);
  const storyIds = await fetchStoryIds([
    profile.id,
    ...participantProfiles.map((item: any) => item.id),
    ...noteProfiles.map((item: any) => item.id),
  ]);

  const membersByConversation = new Map<string, InboxAuthor[]>();
  for (const row of allMembers ?? []) {
    const memberProfile = Array.isArray((row as any).profiles) ? (row as any).profiles[0] : (row as any).profiles;
    if (!memberProfile) continue;
    const current = membersByConversation.get((row as any).conversation_id) ?? [];
    current.push(mapAuthor(memberProfile, storyIds));
    membersByConversation.set((row as any).conversation_id, current);
  }

  const lastMessageByConversation = new Map<string, any>();
  for (const message of lastMessages ?? []) {
    if (!lastMessageByConversation.has((message as any).conversation_id)) {
      lastMessageByConversation.set((message as any).conversation_id, message);
    }
  }

  const conversations = (memberships ?? [])
    .filter((membership: any) => !membership.is_archived)
    .map((membership: any) => {
      const conversation = Array.isArray(membership.conversations) ? membership.conversations[0] : membership.conversations;
      const participants = (membersByConversation.get(membership.conversation_id) ?? []).filter((item) => item.id !== profile.id);
      const lastMessage = lastMessageByConversation.get(membership.conversation_id);
      const unreadCount = Number(membership.unread_count ?? 0);
      const previewBase = mediaPreview(lastMessage?.type, lastMessage?.content ?? lastMessage?.body ?? conversation?.last_message_preview);
      const mine = lastMessage?.sender_id === profile.id;
      const name =
        conversation?.type === "direct"
          ? participants[0]?.name ?? "Nicht verfuegbares Konto"
          : conversation?.name ?? (conversation?.type === "event" ? "Event-Chat" : "Gruppenchat");

      return {
        id: membership.conversation_id,
        type: conversation?.type ?? "direct",
        name,
        avatarUrl: conversation?.avatar_url ?? participants[0]?.avatarUrl ?? null,
        participants,
        preview: unreadCount > 1 ? `${unreadCount} neue Nachrichten` : mine ? `Du: ${previewBase}` : previewBase,
        timeLabel: relativeTime(lastMessage?.created_at ?? conversation?.last_message_at),
        lastMessageAt: lastMessage?.created_at ?? conversation?.last_message_at ?? new Date(0).toISOString(),
        unreadCount,
        isMuted: Boolean(membership.is_muted ?? membership.muted),
        isArchived: Boolean(membership.is_archived),
        isEventChat: conversation?.type === "event",
        seenLabel: mine && unreadCount === 0 ? `Vor ${relativeTime(membership.last_read_at ?? lastMessage?.created_at)} gesehen` : null,
      } satisfies InboxConversation;
    })
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  const viewer = mapAuthor(profile, storyIds);
  const noteItems = visibleNotes.map((note: any) => {
    const noteProfile = Array.isArray(note.profiles) ? note.profiles[0] : note.profiles;
    return {
      user: mapAuthor(noteProfile, storyIds),
      text: note.text,
      createdAt: note.created_at,
      expiresAt: note.expires_at,
      mine: note.user_id === profile.id,
    } satisfies InboxNote;
  });

  return {
    viewer,
    conversations,
    notes: noteItems,
    requestCount: requestCount ?? 0,
  };
};

export const getMessageRequests = async (): Promise<MessageRequestItem[] | null> => {
  const profile = await getCurrentUserProfile();
  if (!profile) return null;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("message_requests")
    .select("id,conversation_id,from_user_id,requester_id,first_message,created_at")
    .eq("to_user_id", profile.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  const fromIds = [...new Set((data ?? []).map((row: any) => row.from_user_id ?? row.requester_id).filter(Boolean))];
  const [{ data: fromProfiles }, storyIds] = await Promise.all([
    fromIds.length ? supabase.from("profiles").select(profileSelect).in("id", fromIds) : Promise.resolve({ data: [] as any[] }),
    fetchStoryIds(fromIds),
  ]);
  const profilesById = new Map((fromProfiles ?? []).map((item: any) => [item.id, item]));

  return (data ?? []).map((row: any) => {
    const requestProfile = profilesById.get(row.from_user_id ?? row.requester_id);
    return {
      id: row.id,
      conversationId: row.conversation_id,
      from: requestProfile ? mapAuthor(requestProfile, storyIds) : null,
      preview: row.first_message || "Neue Chat-Anfrage",
      createdAt: row.created_at,
      timeLabel: relativeTime(row.created_at),
    };
  });
};

export const markConversationRead = async (conversationId: string) => {
  const profile = await getCurrentUserProfile();
  if (!profile) return;
  const supabase = createSupabaseAdminClient();
  await supabase.rpc("mark_conversation_read", { p_conversation_id: conversationId, p_user_id: profile.id });
};
