"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import type { ProfileViewModel } from "@/features/profile/live-service";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type ProfileRow = {
  id: string;
  email: string | null;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  cover_image_url: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  gender: "female" | "male" | "diverse";
  pronouns: string[] | null;
  is_private: boolean;
  show_followers: boolean;
  show_following: boolean;
  show_event_count: boolean;
  events_visited: number;
  verification_status: string;
  profile_music_url: string | null;
  profile_music_title: string | null;
  profile_music_artist: string | null;
  ai_creator_label: boolean | null;
  name_changed_at: string | null;
  username_changed_at: string | null;
  gender_changed_at: string | null;
  dating_enabled: boolean;
  business_enabled: boolean;
  role: string;
};

type SaveStatus = "checking" | "logged_out" | "loaded" | "error";

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
  "pronouns",
  "is_private",
  "show_followers",
  "show_following",
  "show_event_count",
  "events_visited",
  "verification_status",
  "profile_music_url",
  "profile_music_title",
  "profile_music_artist",
  "ai_creator_label",
  "name_changed_at",
  "username_changed_at",
  "gender_changed_at",
  "dating_enabled",
  "business_enabled",
  "role",
].join(",");

const syncServerSession = async (supabase: ReturnType<typeof createSupabaseBrowserClient>) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return false;

  const response = await fetch("/api/auth/sync", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    }),
  }).catch(() => null);

  return Boolean(response?.ok);
};

const mapPost = (row: any) => ({
  id: row.id,
  type: row.type ?? "photo",
  content: row.content ?? row.body ?? null,
  mediaUrl: row.media_urls?.[0] ?? row.image_url ?? null,
  isPinned: Boolean(row.is_pinned),
  gridPosition: row.grid_position ?? null,
  createdAt: row.created_at,
});

const buildModel = (userId: string, profile: ProfileRow, posts: any[], links: any[]): ProfileViewModel => {
  const allPosts = posts.map(mapPost);

  return {
    viewerId: userId,
    profile: {
      id: profile.id,
      email: profile.email,
      username: profile.username,
      firstName: profile.first_name,
      lastName: profile.last_name,
      fullName: `${profile.first_name} ${profile.last_name}`.trim(),
      avatarUrl: profile.avatar_url,
      coverImageUrl: profile.cover_image_url,
      bio: profile.bio,
      city: profile.city,
      country: profile.country,
      gender: profile.gender,
      pronouns: profile.pronouns ?? [],
      isPrivate: profile.is_private,
      showFollowers: profile.show_followers,
      showFollowing: profile.show_following,
      showEventCount: profile.show_event_count,
      verificationStatus: profile.verification_status,
      profileMusicUrl: profile.profile_music_url,
      profileMusicTitle: profile.profile_music_title,
      profileMusicArtist: profile.profile_music_artist,
      aiCreatorLabel: Boolean(profile.ai_creator_label),
      nameChangedAt: profile.name_changed_at,
      usernameChangedAt: profile.username_changed_at,
      genderChangedAt: profile.gender_changed_at,
      datingEnabled: profile.dating_enabled,
      businessEnabled: profile.business_enabled,
      role: profile.role,
    },
    isOwnProfile: true,
    relationship: "friends",
    canViewContent: true,
    counts: {
      posts: allPosts.length,
      followers: null,
      following: null,
      events: profile.events_visited ?? null,
    },
    posts: allPosts,
    reels: allPosts.filter((post) => post.type === "video"),
    shared: [],
    tagged: posts.filter((post) => Array.isArray(post.mentions) && post.mentions.includes(profile.id)).map(mapPost),
    followers: [],
    following: [],
    links: links.map((link) => ({
      id: link.id,
      label: link.label,
      url: link.url,
      sortOrder: link.sort_order,
    })),
  };
};

export function ProfileEditAuthGateway() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [status, setStatus] = useState<SaveStatus>("checking");
  const [model, setModel] = useState<ProfileViewModel | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!active) return;

        if (!user) {
          setStatus("logged_out");
          return;
        }

        await syncServerSession(supabase);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select(profileSelect)
          .eq("id", user.id)
          .maybeSingle<ProfileRow>();

        if (!active) return;

        if (profileError || !profile) {
          setStatus("error");
          return;
        }

        const [{ data: posts }, { data: links }] = await Promise.all([
          supabase
            .from("posts")
            .select("id,type,content,body,media_urls,image_url,is_pinned,grid_position,created_at,mentions")
            .eq("user_id", user.id)
            .eq("is_archived", false)
            .order("grid_position", { ascending: true, nullsFirst: false })
            .order("is_pinned", { ascending: false })
            .order("created_at", { ascending: false })
            .limit(60),
          supabase
            .from("profile_links")
            .select("id,label,url,sort_order")
            .eq("user_id", user.id)
            .order("sort_order", { ascending: true })
            .limit(5),
        ]);

        if (!active) return;

        setModel(buildModel(user.id, profile, posts ?? [], links ?? []));
        setStatus("loaded");
      } catch {
        if (active) setStatus("error");
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [supabase]);

  if (status === "loaded" && model) return <ProfileEditForm model={model} />;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-4 pb-28 pt-6">
      <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
        <p className="hm-label">Profil bearbeiten</p>
        <h1 className="hm-display mt-2 text-4xl text-hm-ink">Session pruefen</h1>
        {status === "checking" ? (
          <div className="mt-5 flex items-center gap-3 rounded-card bg-hm-champagne/45 px-4 py-3 text-sm font-semibold text-hm-ink">
            <Loader2 className="h-4 w-4 animate-spin" />
            Deine Anmeldung wird mit dem Server synchronisiert.
          </div>
        ) : (
          <p className="mt-4 text-sm leading-6 text-hm-inkSoft">
            {status === "logged_out"
              ? "Melde dich ein, damit du dein Profil bearbeiten kannst."
              : "Deine Session wurde erkannt, aber dein Profil konnte nicht gelesen werden. Bitte oeffne dein Profil oder die Einstellungen erneut."}
          </p>
        )}
        {status !== "checking" ? (
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-white" href="/login?returnTo=/profile/edit">
              Einloggen
            </Link>
            <Link className="rounded-pill border border-hm-gold/30 px-5 py-3 text-sm font-bold text-hm-ink" href="/profile">
              Zurueck zum Profil
            </Link>
            <Link className="rounded-pill border border-hm-gold/30 px-5 py-3 text-sm font-bold text-hm-ink" href="/settings">
              Zurueck zu Einstellungen
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
