import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile } from "@/features/events/live-service";

type ProfileRow = {
  id: string;
  first_name: string | null;
  username: string | null;
  city: string | null;
  avatar_url: string | null;
  verification_status: string | null;
  business_enabled?: boolean | null;
};

export type BusinessProfile = {
  user_id: string;
  is_active: boolean;
  career_status: string;
  headline: string | null;
  company: string | null;
  position: string | null;
  industry: string | null;
  experience_years: number | null;
  bio: string | null;
  photo_url: string | null;
  skills: string[] | null;
  languages: string[] | null;
  website_url: string | null;
  linkedin_url: string | null;
  looking_for_tags: string[] | null;
  offering_tags: string[] | null;
  open_to_work: boolean | null;
  open_to_hire: boolean | null;
  tier: string | null;
  premium_until: string | null;
  is_verified_business: boolean | null;
  daily_suggestions_seen: number | null;
  connection_requests_today: number | null;
};

export type BusinessMe = {
  userId: string;
  businessEnabled: boolean;
  verified: boolean;
  isBanned: boolean;
  baseName: string;
  city: string | null;
  profile: BusinessProfile | null;
};

export type BusinessCandidate = {
  userId: string;
  username: string | null;
  name: string;
  city: string | null;
  verified: boolean;
  photoUrl: string | null;
  headline: string;
  company: string | null;
  position: string | null;
  industry: string | null;
  lookingFor: string[];
  offering: string[];
  skills: string[];
  tier: string;
  sharedEvent: { id: string; title: string; slug: string } | null;
  matchReason: string;
};

export type BusinessMatch = {
  id: string;
  conversationId: string | null;
  matchedAt: string;
  matchReason: string | null;
  person: BusinessCandidate;
};

export type JobListing = {
  id: string;
  title: string;
  company: string;
  category: string;
  employmentType: string;
  description: string;
  requirements: string | null;
  city: string | null;
  location: string | null;
  isRemote: boolean;
  salaryMinCents: number | null;
  salaryMaxCents: number | null;
  salaryPeriod: string | null;
  eventId: string | null;
  isFeatured: boolean;
  status: string;
  applicationsCount: number;
  postedBy: string | null;
};

export const getBusinessMe = async (): Promise<BusinessMe | null> => {
  const profile = await getCurrentUserProfile();
  if (!profile) return null;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("business_profiles").select("*").eq("user_id", profile.id).maybeSingle();
  if (error) throw new Error(error.message);

  return {
    userId: profile.id,
    businessEnabled: Boolean(profile.business_enabled),
    verified: profile.verification_status === "verified",
    isBanned: Boolean(profile.is_banned),
    baseName: profile.first_name ?? profile.username ?? "HotMess",
    city: profile.city ?? null,
    profile: data as BusinessProfile | null,
  };
};

const getProfileMap = async (userIds: string[]) => {
  if (userIds.length === 0) return new Map<string, ProfileRow>();
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,first_name,username,city,avatar_url,verification_status,business_enabled")
    .in("id", userIds);
  if (error) throw new Error(error.message);
  return new Map((data ?? []).map((profile) => [profile.id, profile as ProfileRow]));
};

const getSharedEvents = async (currentUserId: string, candidateIds: string[]) => {
  const map = new Map<string, BusinessCandidate["sharedEvent"]>();
  if (candidateIds.length === 0) return map;
  const supabase = createSupabaseAdminClient();
  const { data: myEvents } = await supabase.from("event_attendees").select("event_id").eq("user_id", currentUserId).eq("status", "going");
  const eventIds = (myEvents ?? []).map((item) => item.event_id);
  if (eventIds.length === 0) return map;

  const { data: rows } = await supabase.from("event_attendees").select("event_id,user_id").in("event_id", eventIds).in("user_id", candidateIds).eq("status", "going");
  const sharedEventIds = [...new Set((rows ?? []).map((row) => row.event_id))];
  if (sharedEventIds.length === 0) return map;
  const { data: events } = await supabase.from("events").select("id,title,slug").in("id", sharedEventIds);
  const eventMap = new Map((events ?? []).map((event) => [event.id, event]));
  for (const row of rows ?? []) {
    const event = eventMap.get(row.event_id);
    if (event && !map.has(row.user_id)) map.set(row.user_id, { id: event.id, title: event.title, slug: event.slug });
  }
  return map;
};

const buildReason = (me: BusinessProfile | null, candidate: BusinessProfile) => {
  const mineLooking = new Set(me?.looking_for_tags ?? []);
  const mineOffering = new Set(me?.offering_tags ?? []);
  const overlap = [
    ...(candidate.offering_tags ?? []).filter((tag) => mineLooking.has(tag)),
    ...(candidate.looking_for_tags ?? []).filter((tag) => mineOffering.has(tag)),
  ];
  return overlap.length ? `Passend: ${[...new Set(overlap)].slice(0, 3).join(", ")}` : "Gemeinsames Business-Interesse";
};

const mapCandidate = (
  business: BusinessProfile,
  profile: ProfileRow | undefined,
  sharedEvent: BusinessCandidate["sharedEvent"] = null,
  me: BusinessProfile | null = null,
): BusinessCandidate => ({
  userId: business.user_id,
  username: profile?.username ?? null,
  name: profile?.first_name || profile?.username || "HotMess",
  city: profile?.city ?? null,
  verified: profile?.verification_status === "verified",
  photoUrl: business.photo_url ?? profile?.avatar_url ?? null,
  headline: business.headline || business.position || business.career_status,
  company: business.company,
  position: business.position,
  industry: business.industry,
  lookingFor: business.looking_for_tags ?? [],
  offering: business.offering_tags ?? [],
  skills: business.skills ?? [],
  tier: business.tier ?? "free",
  sharedEvent,
  matchReason: buildReason(me, business),
});

export const getBusinessSuggestions = async (eventOnly = false): Promise<BusinessCandidate[]> => {
  const me = await getBusinessMe();
  if (!me?.businessEnabled || !me.verified || me.isBanned || !me.profile) return [];
  const supabase = createSupabaseAdminClient();

  const { data: swipes } = await supabase.from("business_swipes").select("swiped_id,target_id").eq("swiper_id", me.userId);
  const swipedIds = new Set((swipes ?? []).map((item) => item.swiped_id ?? item.target_id).filter(Boolean));

  let eventUsers: Set<string> | null = null;
  if (eventOnly) {
    const { data: myEvents } = await supabase.from("event_attendees").select("event_id").eq("user_id", me.userId).eq("status", "going");
    const eventIds = (myEvents ?? []).map((item) => item.event_id);
    if (eventIds.length === 0) return [];
    const { data } = await supabase.from("event_attendees").select("user_id").in("event_id", eventIds).eq("status", "going");
    eventUsers = new Set((data ?? []).map((item) => item.user_id));
  }

  const { data, error } = await supabase.from("business_profiles").select("*").eq("is_active", true).neq("user_id", me.userId).limit(80);
  if (error) throw new Error(error.message);
  const profiles = ((data ?? []) as BusinessProfile[]).filter((profile) => {
    if (swipedIds.has(profile.user_id)) return false;
    if (eventUsers && !eventUsers.has(profile.user_id)) return false;
    return true;
  });

  const profileMap = await getProfileMap(profiles.map((profile) => profile.user_id));
  const sharedEvents = await getSharedEvents(me.userId, profiles.map((profile) => profile.user_id));

  return profiles
    .filter((profile) => profileMap.get(profile.user_id)?.business_enabled)
    .map((profile) => mapCandidate(profile, profileMap.get(profile.user_id), sharedEvents.get(profile.user_id) ?? null, me.profile))
    .sort((a, b) => Number(Boolean(b.sharedEvent)) - Number(Boolean(a.sharedEvent)) || (b.tier === "plus" ? 1 : 0) - (a.tier === "plus" ? 1 : 0))
    .slice(0, 20);
};

export const getBusinessMatches = async (): Promise<BusinessMatch[]> => {
  const me = await getBusinessMe();
  if (!me?.businessEnabled) return [];
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("business_matches")
    .select("id,user_a_id,user_b_id,user_a,user_b,conversation_id,match_reason,matched_at,created_at,is_active")
    .or(`user_a_id.eq.${me.userId},user_b_id.eq.${me.userId},user_a.eq.${me.userId},user_b.eq.${me.userId}`)
    .eq("is_active", true)
    .order("matched_at", { ascending: false });
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const otherIds = rows.map((match) => (match.user_a_id ?? match.user_a) === me.userId ? match.user_b_id ?? match.user_b : match.user_a_id ?? match.user_a).filter(Boolean) as string[];
  const profileMap = await getProfileMap(otherIds);
  const sharedEvents = await getSharedEvents(me.userId, otherIds);
  const { data: businessRows } = await supabase.from("business_profiles").select("*").in("user_id", otherIds);
  const businessMap = new Map(((businessRows ?? []) as BusinessProfile[]).map((profile) => [profile.user_id, profile]));

  return rows
    .map((match) => {
      const otherId = ((match.user_a_id ?? match.user_a) === me.userId ? match.user_b_id ?? match.user_b : match.user_a_id ?? match.user_a) as string;
      const business = businessMap.get(otherId);
      if (!business) return null;
      return {
        id: match.id,
        conversationId: match.conversation_id,
        matchedAt: match.matched_at ?? match.created_at,
        matchReason: match.match_reason,
        person: mapCandidate(business, profileMap.get(otherId), sharedEvents.get(otherId) ?? null, me.profile),
      };
    })
    .filter(Boolean) as BusinessMatch[];
};

export const getJobListings = async (): Promise<JobListing[]> => {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("job_listings")
    .select("id,title,company,category,employment_type,type,description,requirements,city,location,is_remote,salary_min_cents,salary_max_cents,salary_period,event_id,is_featured,status,applications_count,posted_by,owner_id")
    .eq("status", "open")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);

  return (data ?? []).map((job: any) => ({
    id: job.id,
    title: job.title,
    company: job.company,
    category: job.category,
    employmentType: job.employment_type ?? job.type,
    description: job.description,
    requirements: job.requirements,
    city: job.city,
    location: job.location,
    isRemote: Boolean(job.is_remote),
    salaryMinCents: job.salary_min_cents,
    salaryMaxCents: job.salary_max_cents,
    salaryPeriod: job.salary_period,
    eventId: job.event_id,
    isFeatured: Boolean(job.is_featured),
    status: job.status,
    applicationsCount: job.applications_count ?? 0,
    postedBy: job.posted_by ?? job.owner_id,
  }));
};

export const getJobListing = async (id: string): Promise<JobListing | null> => {
  const jobs = await getJobListings();
  return jobs.find((job) => job.id === id) ?? null;
};
