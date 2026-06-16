import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const profileUpdateSchema = z.object({
  firstName: z.string().min(2).max(40).optional(),
  lastName: z.string().min(2).max(40).optional(),
  username: z.string().min(3).max(30).regex(/^[a-z0-9._]+$/).optional(),
  bio: z.string().max(150).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  coverImageUrl: z.string().url().nullable().optional(),
  profileMusicUrl: z.string().url().nullable().optional(),
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
});

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

  if (input.firstName !== undefined) update.first_name = input.firstName;
  if (input.lastName !== undefined) update.last_name = input.lastName;
  if (input.username !== undefined) update.username = input.username.toLowerCase();
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

  const { error } = await supabase.from("profiles").update(update).eq("id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

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
