import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProfilePost = {
  id: string;
  type: string;
  content: string | null;
  mediaUrl: string | null;
  isPinned: boolean;
  createdAt: string;
};

export type ProfilePerson = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  verified: boolean;
};

export type ProfileViewModel = {
  viewerId: string;
  profile: {
    id: string;
    email: string | null;
    username: string;
    firstName: string;
    lastName: string;
    fullName: string;
    avatarUrl: string | null;
    coverImageUrl: string | null;
    bio: string | null;
    city: string | null;
    country: string | null;
    gender: "female" | "male" | "diverse";
    isPrivate: boolean;
    showFollowers: boolean;
    showFollowing: boolean;
    showEventCount: boolean;
    verificationStatus: string;
    profileMusicUrl: string | null;
    profileMusicTitle: string | null;
    profileMusicArtist: string | null;
    datingEnabled: boolean;
    businessEnabled: boolean;
    role: string;
  };
  isOwnProfile: boolean;
  relationship: "none" | "requested" | "following" | "friends" | "blocked" | "blocked_by";
  canViewContent: boolean;
  counts: {
    posts: number;
    followers: number | null;
    following: number | null;
    events: number | null;
  };
  posts: ProfilePost[];
  reels: ProfilePost[];
  shared: ProfilePost[];
  tagged: ProfilePost[];
  followers: ProfilePerson[];
  following: ProfilePerson[];
};

type ProfileRow = {
  id: string;
  email?: string | null;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  cover_image_url: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  gender: "female" | "male" | "diverse";
  is_private: boolean;
  show_followers: boolean;
  show_following: boolean;
  show_event_count: boolean;
  events_visited: number;
  verification_status: string;
  profile_music_url: string | null;
  profile_music_title: string | null;
  profile_music_artist: string | null;
  dating_enabled: boolean;
  business_enabled: boolean;
  role: string;
};

const profileSelect = [
  "id",
  "email",
  "username",
  "first_name",
  "last_name",
  "avatar_url",
  "cover_image_url",
  "bio",
  "city",
  "country",
  "gender",
  "is_private",
  "show_followers",
  "show_following",
  "show_event_count",
  "events_visited",
  "verification_status",
  "profile_music_url",
  "profile_music_title",
  "profile_music_artist",
  "dating_enabled",
  "business_enabled",
  "role",
].join(",");

const mapPerson = (row: any): ProfilePerson => ({
  id: row.id,
  name: `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() || row.username,
  username: row.username,
  avatarUrl: row.avatar_url ?? null,
  verified: row.verification_status === "verified",
});

const mapPost = (row: any): ProfilePost => ({
  id: row.id,
  type: row.type ?? "photo",
  content: row.content ?? row.body ?? null,
  mediaUrl: row.media_urls?.[0] ?? row.image_url ?? null,
  isPinned: Boolean(row.is_pinned),
  createdAt: row.created_at,
});

const count = async (query: PromiseLike<{ count: number | null }>) => {
  const result = await query;
  return result.count ?? 0;
};

export async function getProfileView(username?: string): Promise<ProfileViewModel | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: viewer, error: viewerError } = await supabase
    .from("profiles")
    .select(profileSelect)
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (viewerError || !viewer) return null;

  const profileQuery = supabase.from("profiles").select(profileSelect);
  const { data: target, error: targetError } = username
    ? await profileQuery.eq("username", username).maybeSingle<ProfileRow>()
    : await profileQuery.eq("id", viewer.id).maybeSingle<ProfileRow>();

  if (targetError || !target) return null;

  const isOwnProfile = viewer.id === target.id;

  const [{ data: followsTarget }, { data: targetFollowsViewer }, { data: request }, { data: blocked }, { data: blockedBy }] = await Promise.all([
    supabase.from("follows").select("following_id").eq("follower_id", viewer.id).eq("following_id", target.id).maybeSingle(),
    supabase.from("follows").select("following_id").eq("follower_id", target.id).eq("following_id", viewer.id).maybeSingle(),
    supabase.from("follow_requests").select("id,status").eq("from_user_id", viewer.id).eq("to_user_id", target.id).eq("status", "pending").maybeSingle(),
    supabase.from("blocks").select("blocked_id").eq("blocker_id", viewer.id).eq("blocked_id", target.id).maybeSingle(),
    supabase.from("blocks").select("blocked_id").eq("blocker_id", target.id).eq("blocked_id", viewer.id).maybeSingle(),
  ]);

  const relationship: ProfileViewModel["relationship"] = blocked
    ? "blocked"
    : blockedBy
      ? "blocked_by"
      : followsTarget && targetFollowsViewer
        ? "friends"
        : followsTarget
          ? "following"
          : request
            ? "requested"
            : "none";

  const canViewContent = isOwnProfile || !target.is_private || relationship === "following" || relationship === "friends" || viewer.role === "admin";

  const [postsCount, followersCount, followingCount] = await Promise.all([
    count(supabase.from("posts").select("id", { count: "exact", head: true }).eq("user_id", target.id).eq("is_archived", false)),
    count(supabase.from("follows").select("follower_id", { count: "exact", head: true }).eq("following_id", target.id)),
    count(supabase.from("follows").select("following_id", { count: "exact", head: true }).eq("follower_id", target.id)),
  ]);

  const [{ data: posts }, { data: followers }, { data: following }] = await Promise.all([
    canViewContent
      ? supabase
          .from("posts")
          .select("id,type,content,body,media_urls,image_url,is_pinned,created_at,mentions")
          .eq("user_id", target.id)
          .eq("is_archived", false)
          .order("is_pinned", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(60)
      : Promise.resolve({ data: [] }),
    target.show_followers || isOwnProfile
      ? supabase.from("follows").select("profiles!follows_follower_id_fkey(id,first_name,last_name,username,avatar_url,verification_status)").eq("following_id", target.id).limit(50)
      : Promise.resolve({ data: [] }),
    target.show_following || isOwnProfile
      ? supabase.from("follows").select("profiles!follows_following_id_fkey(id,first_name,last_name,username,avatar_url,verification_status)").eq("follower_id", target.id).limit(50)
      : Promise.resolve({ data: [] }),
  ]);

  const allPosts = ((posts ?? []) as any[]).map(mapPost);
  const videoPosts = allPosts.filter((post) => post.type === "video");
  const taggedPosts = ((posts ?? []) as any[]).filter((post) => Array.isArray(post.mentions) && post.mentions.includes(target.id)).map(mapPost);

  return {
    viewerId: viewer.id,
    profile: {
      id: target.id,
      email: target.email ?? null,
      username: target.username,
      firstName: target.first_name,
      lastName: target.last_name,
      fullName: `${target.first_name} ${target.last_name}`.trim(),
      avatarUrl: target.avatar_url,
      coverImageUrl: target.cover_image_url,
      bio: target.bio,
      city: target.city,
      country: target.country,
      gender: target.gender,
      isPrivate: target.is_private,
      showFollowers: target.show_followers,
      showFollowing: target.show_following,
      showEventCount: target.show_event_count,
      verificationStatus: target.verification_status,
      profileMusicUrl: target.profile_music_url,
      profileMusicTitle: target.profile_music_title,
      profileMusicArtist: target.profile_music_artist,
      datingEnabled: target.dating_enabled,
      businessEnabled: target.business_enabled,
      role: target.role,
    },
    isOwnProfile,
    relationship,
    canViewContent,
    counts: {
      posts: postsCount,
      followers: target.show_followers || isOwnProfile ? followersCount : null,
      following: target.show_following || isOwnProfile ? followingCount : null,
      events: target.show_event_count || isOwnProfile ? target.events_visited : null,
    },
    posts: allPosts,
    reels: videoPosts,
    shared: [],
    tagged: taggedPosts,
    followers: ((followers ?? []) as any[]).map((row) => mapPerson(Array.isArray(row.profiles) ? row.profiles[0] : row.profiles)).filter(Boolean),
    following: ((following ?? []) as any[]).map((row) => mapPerson(Array.isArray(row.profiles) ? row.profiles[0] : row.profiles)).filter(Boolean),
  };
}
