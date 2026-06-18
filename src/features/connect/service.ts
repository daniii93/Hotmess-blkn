import "server-only";

import { getBusinessMatches, getBusinessMe, getBusinessSuggestions } from "@/features/business/live-service";
import { getDatingLikes, getDatingMatches, getDatingMe } from "@/features/dating/live-service";
import { getCurrentUserProfile, getCurrentUserTickets, getPublishedEvents } from "@/features/events/live-service";
import { getInboxData } from "@/features/inbox/live-service";
import { getLocalServiceMe } from "@/features/local-services/service";
import { getExploreData } from "@/features/social/live-service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const safe = async <T>(fallback: T, loader: () => Promise<T>): Promise<T> => {
  try {
    return await loader();
  } catch {
    return fallback;
  }
};

const safeCount = async (table: string, apply: (query: any) => any) => {
  try {
    const supabase = createSupabaseAdminClient();
    const { count, error } = await apply(supabase.from(table).select("id", { count: "exact", head: true }));
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
};

const getFollowStats = async (userId: string | null | undefined) => {
  if (!userId) return { following: 0, followers: 0, followRequests: 0, closeFriends: 0 };

  const [following, followers, followRequests, closeFriends] = await Promise.all([
    safeCount("follows", (query) => query.eq("follower_id", userId)),
    safeCount("follows", (query) => query.eq("following_id", userId)),
    safeCount("follow_requests", (query) => query.eq("to_user_id", userId).eq("status", "pending")),
    safeCount("close_friends", (query) => query.eq("user_id", userId)),
  ]);

  return { following, followers, followRequests, closeFriends };
};

const getGroupCount = async (userId: string | null | undefined) => {
  if (!userId) return 0;
  return safeCount("business_group_members", (query) => query.eq("user_id", userId));
};

const getCoffeeChatCount = async (userId: string | null | undefined) => {
  if (!userId) return 0;
  return safeCount("coffee_chats", (query) => query.or(`proposed_by.eq.${userId},recipient_id.eq.${userId}`).in("status", ["proposed", "confirmed"]));
};

export const getConnectData = async () => {
  const profile = await safe(null, getCurrentUserProfile);
  const userId = profile?.id ?? null;

  const [
    inbox,
    followStats,
    datingMe,
    datingMatches,
    datingLikes,
    businessMe,
    businessMatches,
    businessSuggestions,
    tickets,
    events,
    explore,
    localMe,
    groupCount,
    coffeeChatCount,
  ] = await Promise.all([
    safe(null, getInboxData),
    getFollowStats(userId),
    safe(null, getDatingMe),
    safe([], getDatingMatches),
    safe([], getDatingLikes),
    safe(null, getBusinessMe),
    safe([], getBusinessMatches),
    safe([], () => getBusinessSuggestions(false)),
    safe([], getCurrentUserTickets),
    safe([], getPublishedEvents),
    safe({ people: [], hashtags: [], events: [] }, getExploreData),
    safe(null, getLocalServiceMe),
    getGroupCount(userId),
    getCoffeeChatCount(userId),
  ]);

  const unreadMessages = inbox?.conversations.reduce((sum, item) => sum + item.unreadCount, 0) ?? 0;
  const upcomingTickets = tickets.filter((ticket) => ticket.event && ticket.status !== "used").slice(0, 4);
  const eventConnections = upcomingTickets.length
    ? upcomingTickets.map((ticket) => ({
        title: ticket.event?.title ?? "HotMess Event",
        href: ticket.event?.slug ? `/events/${ticket.event.slug}` : "/events",
        text: ticket.event ? `${ticket.status} - ${ticket.event.venueName ?? "Event"}` : ticket.status,
      }))
    : events.slice(0, 4).map((event) => ({
        title: event.title,
        href: `/events/${event.slug}`,
        text: `${event.city} - Event als Verbindungsanlass`,
      }));

  return {
    profile,
    verified: profile?.verification_status === "verified",
    inbox,
    unreadMessages,
    chatRequests: inbox?.requestCount ?? 0,
    conversations: inbox?.conversations.slice(0, 4) ?? [],
    notes: inbox?.notes.slice(0, 5) ?? [],
    followStats,
    datingMe,
    datingMatches: datingMatches.slice(0, 4),
    datingLikes: datingLikes.slice(0, 4),
    businessMe,
    businessMatches: businessMatches.slice(0, 4),
    businessSuggestions: businessSuggestions.slice(0, 4),
    tickets: upcomingTickets,
    eventConnections,
    people: explore.people.slice(0, 6),
    localMe,
    groupCount,
    coffeeChatCount,
  };
};

export type ConnectData = Awaited<ReturnType<typeof getConnectData>>;
