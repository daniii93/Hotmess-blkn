import "server-only";

import { getCurrentUserProfile, getCurrentUserTickets, getPublishedEvents } from "@/features/events/live-service";
import { getLocalServiceMe } from "@/features/local-services/service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getBusinessMatches,
  getBusinessMe,
  getBusinessSuggestions,
  getJobListings,
  type BusinessMe,
  type BusinessProfile,
} from "./live-service";

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

const safeRows = async <T>(fallback: T[], loader: () => Promise<T[]>): Promise<T[]> => {
  try {
    return await loader();
  } catch {
    return fallback;
  }
};

const getProfileCompletion = (profile: BusinessProfile | null) => {
  if (!profile) return 0;
  const checks = [
    Boolean(profile.career_status),
    Boolean(profile.headline),
    Boolean(profile.industry),
    Boolean(profile.bio),
    Boolean(profile.company || profile.position),
    Boolean((profile.looking_for_tags ?? []).length),
    Boolean((profile.offering_tags ?? []).length),
    Boolean((profile.skills ?? []).length),
    Boolean((profile.languages ?? []).length),
    Boolean(profile.photo_url),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

const getCoffeeChatCount = async (userId: string | null | undefined) => {
  if (!userId) return 0;
  return safeCount("coffee_chats", (query) =>
    query.or(`proposed_by.eq.${userId},recipient_id.eq.${userId}`).in("status", ["proposed", "confirmed"]),
  );
};

const getGroupCount = async (userId: string | null | undefined) => {
  if (!userId) return 0;
  return safeCount("business_group_members", (query) => query.eq("user_id", userId));
};

const getRecommendationsCount = async (userId: string | null | undefined) => {
  if (!userId) return 0;
  return safeCount("business_recommendations", (query) => query.eq("to_user_id", userId).eq("is_approved", true));
};

const getProfileViewCount = async (userId: string | null | undefined) => {
  if (!userId) return 0;
  return safeCount("business_profile_views", (query) => query.eq("viewed_user_id", userId));
};

const getJobApplicationCount = async (userId: string | null | undefined) => {
  if (!userId) return 0;
  return safeCount("job_applications", (query) => query.eq("applicant_id", userId));
};

const getOwnJobCount = async (userId: string | null | undefined) => {
  if (!userId) return 0;
  return safeCount("job_listings", (query) => query.or(`posted_by.eq.${userId},owner_id.eq.${userId}`).in("status", ["open", "paused"]));
};

const getSavedJobCount = async (userId: string | null | undefined) => {
  if (!userId) return 0;
  return safeCount("saved_jobs", (query) => query.eq("user_id", userId));
};

const getJobAlertCount = async (userId: string | null | undefined) => {
  if (!userId) return 0;
  return safeCount("job_alerts", (query) => query.eq("user_id", userId).eq("is_active", true));
};

const getBusinessModules = async (me: BusinessMe | null) => {
  if (!me?.userId) return [];
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("business_profiles")
    .select("id,business_profile_modules(module_key,is_active)")
    .or(`user_id.eq.${me.userId},owner_user_id.eq.${me.userId}`)
    .maybeSingle();

  return ((data as any)?.business_profile_modules ?? [])
    .filter((module: any) => module.is_active)
    .map((module: any) => String(module.module_key));
};

const getOpenGroups = async () =>
  safeRows([], async () => {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("business_groups")
      .select("id,name,description,industry,city,member_count,is_private")
      .eq("is_private", false)
      .order("member_count", { ascending: false })
      .limit(6);
    if (error) throw new Error(error.message);
    return (data ?? []).map((group: any) => ({
      id: group.id as string,
      name: String(group.name ?? "Business Gruppe"),
      description: group.description as string | null,
      industry: group.industry as string | null,
      city: group.city as string | null,
      memberCount: Number(group.member_count ?? 0),
      isPrivate: Boolean(group.is_private),
    }));
  });

const getActiveSubscription = async (userId: string | null | undefined) => {
  if (!userId) return null;
  return safe(null, async () => {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("business_subscriptions")
      .select("plan,expires_at,is_active")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data
      ? {
          plan: String(data.plan ?? "plus"),
          expiresAt: data.expires_at as string | null,
          active: Boolean(data.is_active),
        }
      : null;
  });
};

export const getBusinessHubData = async () => {
  const profile = await safe(null, getCurrentUserProfile);
  const userId = profile?.id ?? null;

  const [
    me,
    suggestions,
    eventSuggestions,
    matches,
    jobs,
    tickets,
    events,
    localMe,
    groups,
    coffeeChatCount,
    groupCount,
    recommendationCount,
    profileViewCount,
    jobApplicationCount,
    ownJobCount,
    savedJobCount,
    jobAlertCount,
  ] = await Promise.all([
    safe(null, getBusinessMe),
    safe([], () => getBusinessSuggestions(false)),
    safe([], () => getBusinessSuggestions(true)),
    safe([], getBusinessMatches),
    safe([], getJobListings),
    safe([], getCurrentUserTickets),
    safe([], getPublishedEvents),
    safe(null, getLocalServiceMe),
    getOpenGroups(),
    getCoffeeChatCount(userId),
    getGroupCount(userId),
    getRecommendationsCount(userId),
    getProfileViewCount(userId),
    getJobApplicationCount(userId),
    getOwnJobCount(userId),
    getSavedJobCount(userId),
    getJobAlertCount(userId),
  ]);

  const [modules, subscription] = await Promise.all([
    safe([], () => getBusinessModules(me)),
    getActiveSubscription(userId),
  ]);

  const eventConnections = tickets.length
    ? tickets.slice(0, 4).map((ticket) => ({
        title: ticket.event?.title ?? "HotMess Event",
        href: ticket.event?.slug ? `/events/${ticket.event.slug}` : "/events",
        text: ticket.event ? `${ticket.event.venueName ?? "Event"} - Business Kontakte vor Ort` : "Ticket vorhanden",
      }))
    : events.slice(0, 4).map((event) => ({
        title: event.title,
        href: `/events/${event.slug}`,
        text: `${event.city} - Business Networking rund ums Event`,
      }));

  return {
    profile,
    verified: profile?.verification_status === "verified",
    me,
    profileCompletion: getProfileCompletion(me?.profile ?? null),
    suggestions: suggestions.slice(0, 6),
    eventSuggestions: eventSuggestions.slice(0, 4),
    matches: matches.slice(0, 5),
    jobs: jobs.slice(0, 6),
    featuredJobs: jobs.filter((job) => job.isFeatured).slice(0, 3),
    eventJobs: jobs.filter((job) => Boolean(job.eventId)).slice(0, 3),
    eventConnections,
    localMe,
    groups,
    modules,
    subscription,
    counts: {
      coffeeChats: coffeeChatCount,
      groups: groupCount,
      recommendations: recommendationCount,
      profileViews: profileViewCount,
      jobApplications: jobApplicationCount,
      ownJobs: ownJobCount,
      savedJobs: savedJobCount,
      jobAlerts: jobAlertCount,
    },
  };
};

export type BusinessHubData = Awaited<ReturnType<typeof getBusinessHubData>>;
