import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile } from "@/features/events/live-service";

type ProfileRow = {
  id: string;
  first_name: string | null;
  username: string | null;
  city: string | null;
  date_of_birth: string | null;
  gender: string | null;
  avatar_url: string | null;
  verification_status: string | null;
  dating_enabled?: boolean | null;
};

type DatingProfileRow = {
  user_id: string;
  is_active: boolean;
  display_name: string | null;
  bio: string | null;
  relationship_goal: string | null;
  interests: string[] | null;
  languages: string[] | null;
  photos: string[] | null;
  photo_urls?: string[] | null;
  show_event_history: boolean | null;
  looking_for: string[] | null;
  pref_age_min: number | null;
  pref_age_max: number | null;
  pref_distance_km: number | null;
  pref_only_event_attendees: boolean | null;
  pref_only_verified: boolean | null;
  tier: string | null;
  premium_until: string | null;
  superlikes_remaining: number | null;
  swipes_today: number | null;
  boosts_remaining: number | null;
  rewinds_remaining: number | null;
  first_impressions_remaining: number | null;
};

export type DatingMe = {
  userId: string;
  datingEnabled: boolean;
  verified: boolean;
  isBanned: boolean;
  baseName: string;
  city: string | null;
  gender: string | null;
  datingProfile: DatingProfileRow | null;
};

export type DatingCandidate = {
  userId: string;
  displayName: string;
  age: number | null;
  city: string | null;
  distanceLabel: string;
  verified: boolean;
  photoUrl: string | null;
  bio: string | null;
  relationshipGoal: string | null;
  interests: string[];
  languages: string[];
  tier: string;
  sharedEvent: { id: string; title: string; slug: string } | null;
  superLikedMe: boolean;
};

export type DatingMatch = {
  id: string;
  conversationId: string | null;
  matchedAt: string;
  matchedViaEvent: { id: string; title: string; slug: string } | null;
  person: DatingCandidate;
};

export type DatingLike = DatingCandidate & {
  likedAt: string;
  direction: string;
};

export const getDatingMe = async (): Promise<DatingMe | null> => {
  const profile = await getCurrentUserProfile();
  if (!profile) return null;

  const supabase = createSupabaseAdminClient();
  const { data: datingProfile, error } = await supabase
    .from("dating_profiles")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return {
    userId: profile.id,
    datingEnabled: Boolean(profile.dating_enabled),
    verified: profile.verification_status === "verified",
    isBanned: Boolean(profile.is_banned),
    baseName: profile.first_name ?? "HotMess",
    city: profile.city ?? null,
    gender: profile.gender ?? null,
    datingProfile: datingProfile as DatingProfileRow | null,
  };
};

const calculateAge = (birthdate: string | null): number | null => {
  if (!birthdate) return null;
  const date = new Date(birthdate);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDelta = now.getMonth() - date.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < date.getDate())) age -= 1;
  return age;
};

const wantsGender = (lookingFor: string[] | null | undefined, gender: string | null | undefined) => {
  const desired = lookingFor?.length ? lookingFor : ["everyone"];
  if (desired.includes("everyone")) return true;
  if (gender === "female") return desired.includes("women");
  if (gender === "male") return desired.includes("men");
  return desired.includes("everyone");
};

const mapCandidate = (
  datingProfile: DatingProfileRow,
  profile: ProfileRow | undefined,
  sharedEvent: DatingCandidate["sharedEvent"] = null,
  superLikedMe = false,
): DatingCandidate => {
  const photos = datingProfile.photos?.length ? datingProfile.photos : datingProfile.photo_urls ?? [];
  return {
    userId: datingProfile.user_id,
    displayName: datingProfile.display_name || profile?.first_name || profile?.username || "HotMess",
    age: calculateAge(profile?.date_of_birth ?? null),
    city: profile?.city ?? null,
    distanceLabel: profile?.city ? profile.city : "In deiner Naehe",
    verified: profile?.verification_status === "verified",
    photoUrl: photos[0] ?? profile?.avatar_url ?? null,
    bio: datingProfile.bio,
    relationshipGoal: datingProfile.relationship_goal,
    interests: datingProfile.interests ?? [],
    languages: datingProfile.languages ?? [],
    tier: datingProfile.tier ?? "free",
    sharedEvent,
    superLikedMe,
  };
};

const getProfileMap = async (userIds: string[]) => {
  if (userIds.length === 0) return new Map<string, ProfileRow>();
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,first_name,username,city,date_of_birth,gender,avatar_url,verification_status,dating_enabled")
    .in("id", userIds);

  if (error) throw new Error(error.message);
  return new Map((data ?? []).map((profile) => [profile.id, profile as ProfileRow]));
};

const getSharedEvents = async (currentUserId: string, candidateIds: string[]) => {
  const map = new Map<string, DatingCandidate["sharedEvent"]>();
  if (candidateIds.length === 0) return map;

  const supabase = createSupabaseAdminClient();
  const { data: myPools } = await supabase.from("event_dating_pool").select("event_id").eq("user_id", currentUserId);
  const eventIds = (myPools ?? []).map((item) => item.event_id);
  if (eventIds.length === 0) return map;

  const { data: poolRows } = await supabase
    .from("event_dating_pool")
    .select("event_id,user_id")
    .in("event_id", eventIds)
    .in("user_id", candidateIds)
    .eq("is_visible", true);

  const sharedEventIds = [...new Set((poolRows ?? []).map((row) => row.event_id))];
  if (sharedEventIds.length === 0) return map;

  const { data: events } = await supabase.from("events").select("id,title,slug").in("id", sharedEventIds);
  const eventMap = new Map((events ?? []).map((event) => [event.id, event]));
  for (const row of poolRows ?? []) {
    const event = eventMap.get(row.event_id);
    if (event && !map.has(row.user_id)) map.set(row.user_id, { id: event.id, title: event.title, slug: event.slug });
  }

  return map;
};

export const getDatingCandidates = async (eventOnly = false): Promise<DatingCandidate[]> => {
  const me = await getDatingMe();
  if (!me?.datingEnabled || !me.verified || me.isBanned || !me.datingProfile) return [];

  const supabase = createSupabaseAdminClient();
  const { data: swipes } = await supabase.from("dating_swipes").select("swiped_id,target_id").eq("swiper_id", me.userId);
  const swipedIds = new Set((swipes ?? []).map((item) => item.swiped_id ?? item.target_id).filter(Boolean));

  const { data: blocks } = await supabase
    .from("blocks")
    .select("blocker_id,blocked_id")
    .or(`blocker_id.eq.${me.userId},blocked_id.eq.${me.userId}`);
  const blockedIds = new Set<string>();
  for (const block of blocks ?? []) {
    blockedIds.add(block.blocker_id === me.userId ? block.blocked_id : block.blocker_id);
  }

  let allowedEventUserIds: Set<string> | null = null;
  if (eventOnly || me.datingProfile.pref_only_event_attendees) {
    const { data: myPools } = await supabase.from("event_dating_pool").select("event_id").eq("user_id", me.userId);
    const eventIds = (myPools ?? []).map((item) => item.event_id);
    if (eventIds.length === 0) return [];
    const { data: poolRows } = await supabase.from("event_dating_pool").select("user_id").in("event_id", eventIds).eq("is_visible", true);
    allowedEventUserIds = new Set((poolRows ?? []).map((item) => item.user_id));
  }

  const { data: datingProfiles, error } = await supabase
    .from("dating_profiles")
    .select("*")
    .eq("is_active", true)
    .neq("user_id", me.userId)
    .limit(80);

  if (error) throw new Error(error.message);

  const candidateProfiles = ((datingProfiles ?? []) as DatingProfileRow[]).filter((candidate) => {
    if (swipedIds.has(candidate.user_id) || blockedIds.has(candidate.user_id)) return false;
    if (allowedEventUserIds && !allowedEventUserIds.has(candidate.user_id)) return false;
    return true;
  });

  const profileMap = await getProfileMap(candidateProfiles.map((candidate) => candidate.user_id));
  const sharedEvents = await getSharedEvents(me.userId, candidateProfiles.map((candidate) => candidate.user_id));

  const { data: inboundSuperLikes } = await supabase
    .from("dating_swipes")
    .select("swiper_id")
    .eq("swiped_id", me.userId)
    .eq("direction", "super");
  const superLikeIds = new Set((inboundSuperLikes ?? []).map((item) => item.swiper_id));

  return candidateProfiles
    .filter((candidate) => {
      const profile = profileMap.get(candidate.user_id);
      if (!profile?.dating_enabled) return false;
      if (me.datingProfile?.pref_only_verified && profile.verification_status !== "verified") return false;
      if (!wantsGender(me.datingProfile?.looking_for, profile.gender)) return false;
      if (!wantsGender(candidate.looking_for, me.gender)) return false;
      return true;
    })
    .map((candidate) => mapCandidate(candidate, profileMap.get(candidate.user_id), sharedEvents.get(candidate.user_id) ?? null, superLikeIds.has(candidate.user_id)))
    .sort((a, b) => Number(b.superLikedMe) - Number(a.superLikedMe) || (b.tier === "platinum" ? 1 : 0) - (a.tier === "platinum" ? 1 : 0))
    .slice(0, 20);
};

export const getDatingLikes = async (): Promise<DatingLike[]> => {
  const me = await getDatingMe();
  if (!me?.datingEnabled || !me.datingProfile) return [];

  const supabase = createSupabaseAdminClient();
  const { data: inbound } = await supabase
    .from("dating_swipes")
    .select("swiper_id,direction,created_at")
    .eq("swiped_id", me.userId)
    .in("direction", ["right", "super"])
    .order("created_at", { ascending: false });

  const userIds = (inbound ?? []).map((item) => item.swiper_id);
  const [profileMap, sharedEvents] = await Promise.all([getProfileMap(userIds), getSharedEvents(me.userId, userIds)]);
  const { data: datingProfiles } = await supabase.from("dating_profiles").select("*").in("user_id", userIds);
  const datingMap = new Map(((datingProfiles ?? []) as DatingProfileRow[]).map((profile) => [profile.user_id, profile]));

  return (inbound ?? [])
    .map((item) => {
      const datingProfile = datingMap.get(item.swiper_id);
      if (!datingProfile) return null;
      return {
        ...mapCandidate(datingProfile, profileMap.get(item.swiper_id), sharedEvents.get(item.swiper_id) ?? null, item.direction === "super"),
        likedAt: item.created_at,
        direction: item.direction,
      };
    })
    .filter(Boolean) as DatingLike[];
};

export const getDatingMatches = async (): Promise<DatingMatch[]> => {
  const me = await getDatingMe();
  if (!me?.datingEnabled) return [];

  const supabase = createSupabaseAdminClient();
  const { data: matches, error } = await supabase
    .from("dating_matches")
    .select("id,user_a_id,user_b_id,user_a,user_b,conversation_id,matched_via_event_id,matched_at,created_at,is_active")
    .or(`user_a_id.eq.${me.userId},user_b_id.eq.${me.userId},user_a.eq.${me.userId},user_b.eq.${me.userId}`)
    .eq("is_active", true)
    .order("matched_at", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = matches ?? [];
  const otherIds = rows
    .map((match) => (match.user_a_id ?? match.user_a) === me.userId ? match.user_b_id ?? match.user_b : match.user_a_id ?? match.user_a)
    .filter(Boolean) as string[];
  const [profileMap, sharedEvents] = await Promise.all([getProfileMap(otherIds), getSharedEvents(me.userId, otherIds)]);
  const { data: datingProfiles } = await supabase.from("dating_profiles").select("*").in("user_id", otherIds);
  const datingMap = new Map(((datingProfiles ?? []) as DatingProfileRow[]).map((profile) => [profile.user_id, profile]));

  return rows
    .map((match) => {
      const otherId = ((match.user_a_id ?? match.user_a) === me.userId ? match.user_b_id ?? match.user_b : match.user_a_id ?? match.user_a) as string;
      const datingProfile = datingMap.get(otherId);
      if (!datingProfile) return null;
      return {
        id: match.id,
        conversationId: match.conversation_id,
        matchedAt: match.matched_at ?? match.created_at,
        matchedViaEvent: sharedEvents.get(otherId) ?? null,
        person: mapCandidate(datingProfile, profileMap.get(otherId), sharedEvents.get(otherId) ?? null),
      };
    })
    .filter(Boolean) as DatingMatch[];
};
