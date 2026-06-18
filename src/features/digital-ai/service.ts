import "server-only";

import { getBenefitsData } from "@/features/benefits/service";
import { getBusinessMe } from "@/features/business/live-service";
import { getCreatorData } from "@/features/creator/service";
import { getCurrentUserProfile, getCurrentUserTickets, getPublishedEvents } from "@/features/events/live-service";
import { getLocalServiceCategories, getLocalServiceMe } from "@/features/local-services/service";
import { getFeedPosts } from "@/features/social/live-service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const digitalTerms = [
  "ki",
  "ai",
  "digital",
  "software",
  "saas",
  "automation",
  "automatisierung",
  "web",
  "website",
  "crm",
  "marketing",
  "daten",
  "app",
  "no-code",
  "nocode",
  "chatbot",
  "tool",
  "it",
  "prozess",
  "content",
  "analytics",
];

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

const normalize = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const hasDigitalSignal = (...values: unknown[]) => {
  const haystack = normalize(values.flat().join(" "));
  return digitalTerms.some((term) => haystack.includes(normalize(term)));
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

type ProviderRow = {
  id: string;
  business_profile_id: string;
  verification_status: string | null;
  rating_avg: number | null;
  rating_count: number | null;
  trust_score: number | null;
};

type GroupRow = {
  id: string;
  name: string | null;
  description: string | null;
  industry: string | null;
  city: string | null;
  member_count: number | null;
  is_private: boolean | null;
};

const displayName = (profile: PublicProfile | undefined) =>
  profile ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || profile.username || "Digital Anbieter" : "Digital Anbieter";

export type DigitalProvider = {
  businessProfileId: string;
  userId: string;
  username: string;
  name: string;
  city: string | null;
  avatarUrl: string | null;
  headline: string;
  company: string | null;
  industry: string | null;
  expertise: string[];
  verifiedBusiness: boolean;
  verifiedProvider: boolean;
  ratingAvg: number | null;
  ratingCount: number;
  trustScore: number | null;
  trustSignals: string[];
};

export const getDigitalAiData = async () => {
  const profile = await safe(null, getCurrentUserProfile);
  const [
    businessMe,
    localMe,
    benefits,
    creator,
    localCategories,
    events,
    tickets,
    posts,
    businessRows,
    providerRows,
    groups,
    reviewsCount,
    completedOrders,
    purchasedLeads,
    partnerMaterials,
  ] = await Promise.all([
    safe(null, getBusinessMe),
    safe(null, getLocalServiceMe),
    safe(null, getBenefitsData),
    safe(null, getCreatorData),
    safe([], getLocalServiceCategories),
    safe([], getPublishedEvents),
    safe([], getCurrentUserTickets),
    safe([], getFeedPosts),
    safeRows<BusinessRow>("business_profiles", "id,user_id,headline,company,position,industry,bio,photo_url,skills,offering_tags,is_verified_business,is_active", (query) =>
      query.eq("is_active", true).limit(40),
    ),
    safeRows<ProviderRow>("local_service_provider_profiles", "id,business_profile_id,verification_status,rating_avg,rating_count,trust_score", (query) =>
      query.eq("verification_status", "verified").order("trust_score", { ascending: false }).limit(40),
    ),
    safeRows<GroupRow>("business_groups", "id,name,description,industry,city,member_count,is_private", (query) =>
      query.eq("is_private", false).limit(20),
    ),
    safeCount("local_service_reviews"),
    safeCount("local_service_orders", (query) => query.in("status", ["completed", "approved", "paid"])),
    safeCount("local_service_leads", (query) => query.in("status", ["purchased", "converted"])),
    safeRows<any>("partner_materials", "id,title,type,description,event_id,is_active", (query) => query.eq("is_active", true).limit(12)),
  ]);

  const providerMap = new Map(providerRows.map((provider) => [provider.business_profile_id, provider]));
  const candidateBusinessRows = businessRows.filter((business) =>
    hasDigitalSignal(business.headline, business.company, business.position, business.industry, business.bio, business.skills ?? [], business.offering_tags ?? []),
  );
  const userIds = [...new Set(candidateBusinessRows.map((row) => row.user_id).filter(Boolean))];
  const publicProfiles = userIds.length
    ? await safeRows<PublicProfile>("profiles", "id,first_name,last_name,username,avatar_url,city,verification_status,is_banned", (query) =>
        query.in("id", userIds).eq("is_banned", false),
      )
    : [];
  const profileMap = new Map(publicProfiles.map((item) => [item.id, item]));

  const providers = candidateBusinessRows
    .map((business): DigitalProvider | null => {
      const publicProfile = profileMap.get(business.user_id);
      if (!publicProfile || publicProfile.verification_status !== "verified") return null;
      const provider = providerMap.get(business.id);
      const expertise = [...(business.skills ?? []), ...(business.offering_tags ?? [])].filter(Boolean).slice(0, 5);
      const verifiedBusiness = Boolean(business.is_verified_business);
      const verifiedProvider = provider?.verification_status === "verified";
      return {
        businessProfileId: business.id,
        userId: business.user_id,
        username: publicProfile.username ?? business.user_id,
        name: displayName(publicProfile),
        city: publicProfile.city,
        avatarUrl: business.photo_url ?? publicProfile.avatar_url,
        headline: business.headline || business.position || business.industry || "Digitaler Anbieter",
        company: business.company,
        industry: business.industry,
        expertise,
        verifiedBusiness,
        verifiedProvider,
        ratingAvg: provider?.rating_avg ?? null,
        ratingCount: Number(provider?.rating_count ?? 0),
        trustScore: provider?.trust_score ?? null,
        trustSignals: [
          "Person verifiziert",
          verifiedBusiness ? "Business geprueft" : null,
          verifiedProvider ? "Dienstleister geprueft" : null,
          expertise.length ? "Expertise hinterlegt" : null,
          provider?.rating_count ? `${provider.rating_count} echte Bewertungen` : null,
        ].filter(Boolean) as string[],
      };
    })
    .filter(Boolean)
    .sort((a, b) => Number(b?.verifiedProvider) - Number(a?.verifiedProvider) || Number(b?.verifiedBusiness) - Number(a?.verifiedBusiness))
    .slice(0, 10) as DigitalProvider[];

  const digitalCategories = localCategories
    .filter((category) => hasDigitalSignal(category.name, category.slug, category.description, category.businessKeywords))
    .slice(0, 8);

  const digitalEvents = events
    .filter((event) => hasDigitalSignal(event.title, event.subtitle, event.description, event.category, event.city))
    .slice(0, 4);

  const digitalPosts = posts
    .filter((post) => hasDigitalSignal(post.content, post.hashtags ?? []))
    .slice(0, 4);

  const digitalGroups = groups
    .filter((group) => hasDigitalSignal(group.name, group.description, group.industry))
    .slice(0, 5)
    .map((group) => ({
      id: String(group.id),
      name: String(group.name ?? "Digital Community"),
      description: group.description,
      city: group.city,
      memberCount: Number(group.member_count ?? 0),
    }));

  const digitalMaterials = partnerMaterials
    .filter((material) => hasDigitalSignal(material.title, material.description, material.type))
    .map((material) => ({
      id: String(material.id),
      title: String(material.title ?? "Digital Material"),
      type: String(material.type ?? "material"),
      description: material.description as string | null,
      eventId: material.event_id as string | null,
    }))
    .slice(0, 6);

  return {
    profile,
    verified: profile?.verification_status === "verified",
    isAdmin: profile?.role === "admin",
    businessMe,
    localMe,
    benefits,
    creator,
    providers,
    digitalCategories,
    digitalEvents,
    digitalPosts,
    digitalGroups,
    digitalMaterials,
    tickets: tickets.slice(0, 3),
    counts: {
      providers: providers.length,
      verifiedProviders: providerRows.length,
      digitalCategories: digitalCategories.length,
      digitalEvents: digitalEvents.length,
      digitalPosts: digitalPosts.length,
      digitalGroups: digitalGroups.length,
      reviews: reviewsCount,
      completedOrders,
      purchasedLeads,
      benefits: benefits?.counts.activeDiscounts ?? 0,
      creatorExperts: creator?.counts.businessExperts ?? 0,
      userTickets: tickets.length,
    },
  };
};

export type DigitalAiData = Awaited<ReturnType<typeof getDigitalAiData>>;
