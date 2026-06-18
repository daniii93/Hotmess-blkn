import "server-only";

import { getBusinessMe, getBusinessSuggestions, getJobListings } from "@/features/business/live-service";
import { getCurrentUserProfile, getCurrentUserTickets, getPublishedEvents } from "@/features/events/live-service";
import { getLocalServiceCategories, getLocalServiceMe, getMyLocalServiceOrders, getMyLocalServiceProjects, getProviderLeads } from "@/features/local-services/service";
import { getExploreData, getFeedPosts, getFriendActivity, getStoryBar } from "@/features/social/live-service";

const safe = async <T>(fallback: T, loader: () => Promise<T>): Promise<T> => {
  try {
    return await loader();
  } catch {
    return fallback;
  }
};

export const getDiscoverData = async () => {
  const profile = await safe(null, getCurrentUserProfile);

  const [
    events,
    tickets,
    posts,
    stories,
    friendActivity,
    explore,
    businessMe,
    businessSuggestions,
    jobs,
    localMe,
    localCategories,
    localProjects,
    localOrders,
    providerLeads,
  ] = await Promise.all([
    safe([], getPublishedEvents),
    safe([], getCurrentUserTickets),
    safe([], getFeedPosts),
    safe([], getStoryBar),
    safe([], getFriendActivity),
    safe({ people: [], hashtags: [], events: [] }, getExploreData),
    safe(null, getBusinessMe),
    safe([], () => getBusinessSuggestions(false)),
    safe([], getJobListings),
    safe(null, getLocalServiceMe),
    safe([], getLocalServiceCategories),
    safe([], getMyLocalServiceProjects),
    safe([], getMyLocalServiceOrders),
    safe([], getProviderLeads),
  ]);

  const now = Date.now();
  const upcomingEvents = events
    .filter((event) => new Date(event.dateStart).getTime() >= now || event.status === "published")
    .slice(0, 4);
  const trendingPosts = [...posts]
    .sort((a, b) => b.likesCount + b.commentsCount * 2 - (a.likesCount + a.commentsCount * 2))
    .slice(0, 4);
  const verifiedPeople = explore.people.slice(0, 6);
  const unreadTickets = tickets.slice(0, 2);

  return {
    profile,
    events: upcomingEvents,
    tickets: unreadTickets,
    posts: trendingPosts,
    stories: stories.slice(0, 8),
    friendActivity: friendActivity.slice(0, 5),
    people: verifiedPeople,
    hashtags: explore.hashtags.slice(0, 8),
    businessMe,
    businessSuggestions: businessSuggestions.slice(0, 4),
    jobs: jobs.slice(0, 3),
    localMe,
    localCategories: localCategories.slice(0, 8),
    localProjects: localProjects.slice(0, 3),
    localOrders: localOrders.slice(0, 2),
    providerLeads: providerLeads.slice(0, 3),
  };
};

export type DiscoverData = Awaited<ReturnType<typeof getDiscoverData>>;
