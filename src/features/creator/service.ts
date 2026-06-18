import "server-only";

import { getBusinessMe } from "@/features/business/live-service";
import { getCurrentUserProfile, getCurrentUserTickets, getPublishedEvents } from "@/features/events/live-service";
import { getLocalServiceCategories, getLocalServiceMe } from "@/features/local-services/service";
import { getFeedPosts } from "@/features/social/live-service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const safe = async <T>(fallback: T, loader: () => Promise<T>): Promise<T> => {
  try {
    return await loader();
  } catch {
    return fallback;
  }
};

const safeRows = async <T>(table: string, select: string, configure?: (query: any) => any): Promise<T[]> => {
  try {
    const supabase = createSupabaseAdminClient();
    let query = supabase.from(table).select(select);
    if (configure) query = configure(query);
    const { data, error } = await query;
    if (error) return [];
    return (data ?? []) as T[];
  } catch {
    return [];
  }
};

const safeCount = async (table: string, configure?: (query: any) => any) => {
  try {
    const supabase = createSupabaseAdminClient();
    let query = supabase.from(table).select("id", { count: "exact", head: true });
    if (configure) query = configure(query);
    const { count, error } = await query;
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
};

type PublicProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  avatar_url: string | null;
  city: string | null;
  verification_status: string | null;
  is_banned?: boolean | null;
};

type BusinessRow = {
  id: string;
  user_id: string;
  headline: string | null;
  company: string | null;
  position: string | null;
  industry: string | null;
  bio: string | null;
  photo_url: string | null;
  skills: string[] | null;
  offering_tags: string[] | null;
  is_verified_business: boolean | null;
  is_active: boolean | null;
};

export type CreatorExpert = {
  userId: string;
  username: string;
  name: string;
  city: string | null;
  avatarUrl: string | null;
  headline: string;
  company: string | null;
  industry: string | null;
  expertise: string[];
  verifiedPerson: boolean;
  verifiedBusiness: boolean;
  trustSignals: string[];
};

const displayName = (profile: PublicProfile | undefined) =>
  profile ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || profile.username || "HotMess Creator" : "HotMess Creator";

export const getCreatorData = async () => {
  const profile = await safe(null, getCurrentUserProfile);
  const [businessMe, localMe, localCategories, events, tickets, posts, businessRows, providers, reviewsCount, completedOrders, groups] =
    await Promise.all([
      safe(null, getBusinessMe),
      safe(null, getLocalServiceMe),
      safe([], getLocalServiceCategories),
      safe([], getPublishedEvents),
      safe([], getCurrentUserTickets),
      safe([], getFeedPosts),
      safeRows<BusinessRow>("business_profiles", "id,user_id,headline,company,position,industry,bio,photo_url,skills,offering_tags,is_verified_business,is_active", (query) =>
        query.eq("is_active", true).limit(12),
      ),
      safeRows<any>("local_service_provider_profiles", "id,business_profile_id,verification_status,rating_avg,rating_count,trust_score", (query) =>
        query.eq("verification_status", "verified").order("trust_score", { ascending: false }).limit(12),
      ),
      safeCount("local_service_reviews"),
      safeCount("local_service_orders", (query) => query.in("status", ["completed", "approved", "paid"])),
      safeRows<any>("business_groups", "id,name,description,industry,city,member_count,is_private", (query) =>
        query.eq("is_private", false).order("member_count", { ascending: false }).limit(6),
      ),
    ]);

  const userIds = [...new Set(businessRows.map((row) => row.user_id).filter(Boolean))];
  const profiles = userIds.length
    ? await safeRows<PublicProfile>("profiles", "id,first_name,last_name,username,avatar_url,city,verification_status,is_banned", (query) =>
        query.in("id", userIds).eq("is_banned", false),
      )
    : [];
  const profileMap = new Map(profiles.map((item) => [item.id, item]));

  const providerBusinessIds = new Set(providers.map((provider) => provider.business_profile_id).filter(Boolean));

  const experts = businessRows
    .map((business): CreatorExpert | null => {
      const publicProfile = profileMap.get(business.user_id);
      if (!publicProfile || publicProfile.verification_status !== "verified") return null;
      const expertise = [...(business.skills ?? []), ...(business.offering_tags ?? [])].filter(Boolean).slice(0, 4);
      const verifiedBusiness = Boolean(business.is_verified_business);
      const trustSignals = [
        publicProfile.verification_status === "verified" ? "Person verifiziert" : null,
        verifiedBusiness ? "Business geprueft" : null,
        providerBusinessIds.has(business.id) ? "Dienstleister geprueft" : null,
        expertise.length ? "Expertise hinterlegt" : null,
      ].filter(Boolean) as string[];

      return {
        userId: business.user_id,
        username: publicProfile.username ?? business.user_id,
        name: displayName(publicProfile),
        city: publicProfile.city,
        avatarUrl: business.photo_url ?? publicProfile.avatar_url,
        headline: business.headline || business.position || business.industry || "Verifizierter Experte",
        company: business.company,
        industry: business.industry,
        expertise,
        verifiedPerson: true,
        verifiedBusiness,
        trustSignals,
      };
    })
    .filter(Boolean)
    .slice(0, 8) as CreatorExpert[];

  const creatorEvents = events
    .filter((event) => {
      const haystack = `${event.title} ${event.subtitle ?? ""} ${event.description ?? ""} ${event.category}`.toLowerCase();
      return ["workshop", "seminar", "masterclass", "training", "business", "creator", "coaching"].some((term) => haystack.includes(term));
    })
    .slice(0, 4);

  const expertPosts = posts
    .filter((post) => {
      const haystack = `${post.content ?? ""} ${(post.hashtags ?? []).join(" ")}`.toLowerCase();
      return ["business", "coaching", "kurs", "guide", "wissen", "creator", "ki", "marketing", "training"].some((term) => haystack.includes(term));
    })
    .slice(0, 4);

  return {
    profile,
    verified: profile?.verification_status === "verified",
    isAdmin: profile?.role === "admin",
    businessMe,
    localMe,
    experts,
    localCategories: localCategories.slice(0, 6),
    creatorEvents,
    events: events.slice(0, 4),
    tickets: tickets.slice(0, 3),
    expertPosts,
    groups: groups.map((group) => ({
      id: String(group.id),
      name: String(group.name ?? "Community Programm"),
      description: group.description as string | null,
      industry: group.industry as string | null,
      city: group.city as string | null,
      memberCount: Number(group.member_count ?? 0),
    })),
    counts: {
      businessExperts: experts.length,
      verifiedProviders: providers.length,
      reviews: reviewsCount,
      completedOrders,
      groups: groups.length,
      creatorEvents: creatorEvents.length,
      expertPosts: expertPosts.length,
    },
  };
};

export type CreatorData = Awaited<ReturnType<typeof getCreatorData>>;
