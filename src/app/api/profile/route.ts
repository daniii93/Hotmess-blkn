import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildUsernameCandidates, normalizeUsername, USERNAME_REGEX, usernameRuleText } from "@/lib/username";

const profileUpdateSchema = z.object({
  firstName: z.string().min(2).max(40).optional(),
  lastName: z.string().min(2).max(40).optional(),
  username: z.string().min(3).max(30).regex(/^[a-z0-9._]+$/).optional(),
  pronouns: z.array(z.string().min(1).max(24)).max(4).optional(),
  bio: z.string().max(150).nullable().optional(),
  avatarUrl: z.string().url().or(z.literal("")).nullable().optional(),
  coverImageUrl: z.string().url().or(z.literal("")).nullable().optional(),
  profileMusicUrl: z.string().url().or(z.literal("")).nullable().optional(),
  profileMusicTitle: z.string().max(80).nullable().optional(),
  profileMusicArtist: z.string().max(80).nullable().optional(),
  city: z.string().max(80).nullable().optional(),
  country: z.enum(["AT", "DE", "CH", "IT"]).nullable().optional(),
  gender: z.enum(["female", "male", "diverse"]).optional(),
  isPrivate: z.boolean().optional(),
  showFollowers: z.boolean().optional(),
  showFollowing: z.boolean().optional(),
  showEventCount: z.boolean().optional(),
  showOnlineStatus: z.boolean().optional(),
  showProfileVisits: z.boolean().optional(),
  datingEnabled: z.boolean().optional(),
  businessEnabled: z.boolean().optional(),
  aiCreatorLabel: z.boolean().optional(),
  links: z.array(z.object({
    label: z.string().min(1).max(40),
    url: z.string().url(),
  })).max(5).optional(),
});

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const isBlockedUntil = (lastChangedAt: string | null | undefined, days: number) => {
  if (!lastChangedAt) return null;
  const nextAllowed = addDays(new Date(lastChangedAt), days);
  return nextAllowed > new Date() ? nextAllowed : null;
};

async function getFreeUsernameSuggestions(username: string, currentUserId?: string) {
  const admin = createSupabaseAdminClient();
  const candidates = buildUsernameCandidates(username);
  if (!candidates.length) return [];
  const [{ data: profileRows }, { data: cooldownRows }] = await Promise.all([
    admin.from("profiles").select("id,username").in("username", candidates),
    admin.from("released_usernames").select("username,cooldown_until").in("username", candidates),
  ]);
  const taken = new Set((profileRows ?? []).filter((row) => row.id !== currentUserId).map((row) => row.username));
  const cooled = new Set((cooldownRows ?? []).filter((row) => row.cooldown_until && new Date(row.cooldown_until) > new Date()).map((row) => row.username));
  return candidates.filter((candidate) => !taken.has(candidate) && !cooled.has(candidate)).slice(0, 6);
}

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const url = new URL(request.url);
  const username = normalizeUsername(url.searchParams.get("username") ?? "");

  if (!username || !USERNAME_REGEX.test(username)) {
    return NextResponse.json({
      available: false,
      reason: "ungueltig",
      message: usernameRuleText,
      suggestions: await getFreeUsernameSuggestions(username || "hotmess", user.id),
    });
  }

  const [{ data }, { data: released }] = await Promise.all([
    supabase.from("profiles").select("id").eq("username", username).maybeSingle(),
    supabase.from("released_usernames").select("cooldown_until").eq("username", username).maybeSingle(),
  ]);
  const inCooldown = Boolean(released?.cooldown_until && new Date(released.cooldown_until) > new Date());
  const available = (!data || data.id === user.id) && !inCooldown;
  return NextResponse.json({
    available,
    reason: available ? null : inCooldown ? "cooldown" : "vergeben",
    message: available ? "Benutzername ist verfuegbar." : inCooldown ? "Dieser Benutzername ist vor kurzem freigegeben worden und noch kurz geschuetzt." : "Benutzername ist vergeben.",
    suggestions: available ? [] : await getFreeUsernameSuggestions(username, user.id),
  });
}

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });

  const parsed = profileUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ungueltige Profildaten." }, { status: 400 });

  const input = parsed.data;
  const update: Record<string, unknown> = {};

  const { data: current, error: currentError } = await supabase
    .from("profiles")
    .select("first_name,last_name,username,gender,name_changed_at,username_changed_at,gender_changed_at,is_official_partner")
    .eq("id", user.id)
    .maybeSingle();

  if (currentError || !current) return NextResponse.json({ error: "Profil nicht gefunden." }, { status: 404 });

  const nameChanged = (input.firstName !== undefined && input.firstName !== current.first_name) || (input.lastName !== undefined && input.lastName !== current.last_name);
  const usernameChanged = input.username !== undefined && input.username.toLowerCase() !== current.username;
  const genderChanged = input.gender !== undefined && input.gender !== current.gender;

  const nameBlockedUntil = nameChanged ? isBlockedUntil(current.name_changed_at, 30) : null;
  if (nameBlockedUntil) {
    return NextResponse.json({ error: `Du kannst deinen Namen wieder ab ${nameBlockedUntil.toLocaleDateString("de-DE")} aendern.` }, { status: 429 });
  }

  const usernameBlockedUntil = usernameChanged ? isBlockedUntil(current.username_changed_at, 30) : null;
  if (usernameBlockedUntil) {
    return NextResponse.json({ error: `Du kannst deinen Benutzernamen wieder ab ${usernameBlockedUntil.toLocaleDateString("de-DE")} aendern.` }, { status: 429 });
  }

  if (usernameChanged && input.username) {
    const normalizedUsername = normalizeUsername(input.username);
    if (!USERNAME_REGEX.test(normalizedUsername)) {
      return NextResponse.json({ error: usernameRuleText }, { status: 400 });
    }

    const [{ data: taken }, { data: released }] = await Promise.all([
      supabase.from("profiles").select("id").eq("username", normalizedUsername).neq("id", user.id).maybeSingle(),
      supabase.from("released_usernames").select("cooldown_until").eq("username", normalizedUsername).maybeSingle(),
    ]);
    const inCooldown = Boolean(released?.cooldown_until && new Date(released.cooldown_until) > new Date());
    if (taken || inCooldown) {
      return NextResponse.json({ error: inCooldown ? "Dieser Benutzername ist vor kurzem freigegeben worden und noch kurz geschuetzt." : "Dieser Benutzername ist bereits vergeben.", suggestions: await getFreeUsernameSuggestions(normalizedUsername, user.id) }, { status: 409 });
    }

    const { count: followerCount } = await supabase
      .from("follows")
      .select("follower_id", { count: "exact", head: true })
      .eq("following_id", user.id);

    if ((followerCount ?? 0) > 10000 || current.is_official_partner) {
      const admin = createSupabaseAdminClient();
      const { error: requestError } = await admin.from("username_change_requests").insert({
        user_id: user.id,
        old_username: current.username,
        new_username: normalizedUsername,
        status: "pending",
      });
      if (requestError) return NextResponse.json({ error: requestError.message }, { status: 400 });
      return NextResponse.json({ ok: true, review: true, message: "Deine Benutzername-Aenderung wurde zur Admin-Pruefung eingereicht." });
    }

    input.username = normalizedUsername;
  }

  const genderBlockedUntil = genderChanged ? isBlockedUntil(current.gender_changed_at, 90) : null;
  if (genderBlockedUntil) {
    return NextResponse.json({ error: `Du kannst dein Geschlecht wieder ab ${genderBlockedUntil.toLocaleDateString("de-DE")} aendern.` }, { status: 429 });
  }

  if (input.firstName !== undefined) update.first_name = input.firstName;
  if (input.lastName !== undefined) update.last_name = input.lastName;
  if (input.username !== undefined) update.username = input.username.toLowerCase();
  if (input.pronouns !== undefined) update.pronouns = input.pronouns;
  if (input.bio !== undefined) update.bio = input.bio || null;
  if (input.avatarUrl !== undefined) update.avatar_url = input.avatarUrl;
  if (input.coverImageUrl !== undefined) update.cover_image_url = input.coverImageUrl;
  if (input.profileMusicUrl !== undefined) update.profile_music_url = input.profileMusicUrl;
  if (input.profileMusicTitle !== undefined) update.profile_music_title = input.profileMusicTitle;
  if (input.profileMusicArtist !== undefined) update.profile_music_artist = input.profileMusicArtist;
  if (input.city !== undefined) update.city = input.city;
  if (input.country !== undefined) update.country = input.country;
  if (input.gender !== undefined) update.gender = input.gender;
  if (input.isPrivate !== undefined) update.is_private = input.isPrivate;
  if (input.showFollowers !== undefined) update.show_followers = input.showFollowers;
  if (input.showFollowing !== undefined) update.show_following = input.showFollowing;
  if (input.showEventCount !== undefined) update.show_event_count = input.showEventCount;
  if (input.showOnlineStatus !== undefined) update.show_online_status = input.showOnlineStatus;
  if (input.showProfileVisits !== undefined) update.show_profile_visits = input.showProfileVisits;
  if (input.datingEnabled !== undefined) update.dating_enabled = input.datingEnabled;
  if (input.businessEnabled !== undefined) update.business_enabled = input.businessEnabled;
  if (input.aiCreatorLabel !== undefined) update.ai_creator_label = input.aiCreatorLabel;
  if (nameChanged) update.name_changed_at = new Date().toISOString();
  if (usernameChanged) update.username_changed_at = new Date().toISOString();
  if (genderChanged) update.gender_changed_at = new Date().toISOString();

  const { error } = await supabase.from("profiles").update(update).eq("id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (usernameChanged) {
    const admin = createSupabaseAdminClient();
    await admin.from("released_usernames").upsert({
      username: current.username,
      released_at: new Date().toISOString(),
      cooldown_until: addDays(new Date(), 14).toISOString(),
    });
    await admin.from("username_change_requests").insert({
      user_id: user.id,
      old_username: current.username,
      new_username: input.username,
      status: "auto",
    });
  }

  if (input.links !== undefined) {
    const { error: deleteError } = await supabase.from("profile_links").delete().eq("user_id", user.id);
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 });

    if (input.links.length) {
      const { error: linksError } = await supabase.from("profile_links").insert(
        input.links.map((link, index) => ({
          user_id: user.id,
          label: link.label,
          url: link.url,
          sort_order: index,
        })),
      );
      if (linksError) return NextResponse.json({ error: linksError.message }, { status: 400 });
    }
  }

  if (input.username || input.firstName || input.lastName) {
    await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        username: input.username ?? user.user_metadata.username,
        first_name: input.firstName ?? user.user_metadata.first_name,
        last_name: input.lastName ?? user.user_metadata.last_name,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
