import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserProfile } from "@/features/events/live-service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const profileSchema = z.object({
  displayName: z.string().min(1).max(40).optional(),
  bio: z.string().max(300).optional().default(""),
  relationshipGoal: z.enum(["casual", "dates", "relationship", "open"]).optional().nullable(),
  interests: z.array(z.string().min(1).max(40)).max(12).optional().default([]),
  languages: z.array(z.string().min(1).max(20)).max(8).optional().default([]),
  lookingFor: z.array(z.enum(["women", "men", "everyone"])).min(1).optional().default(["everyone"]),
  prefAgeMin: z.coerce.number().int().min(18).max(99).optional().default(18),
  prefAgeMax: z.coerce.number().int().min(18).max(99).optional().default(99),
  prefDistanceKm: z.coerce.number().int().min(1).max(500).optional().default(50),
  prefOnlyEventAttendees: z.boolean().optional().default(false),
  prefOnlyVerified: z.boolean().optional().default(true),
  showEventHistory: z.boolean().optional().default(false),
  photos: z.array(z.string().url()).max(6).optional().default([]),
  isActive: z.boolean().optional().default(true),
});

export async function POST(request: Request) {
  const profile = await getCurrentUserProfile();
  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });
  if (profile.is_banned) return NextResponse.json({ error: "Dieses Konto ist gesperrt." }, { status: 403 });
  if (profile.verification_status !== "verified") {
    return NextResponse.json({ error: "Dating ist nur fuer verifizierte Nutzer moeglich." }, { status: 403 });
  }

  const parsed = profileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dating-Profil ist ungueltig." }, { status: 400 });

  const input = parsed.data;
  const displayName = input.displayName || profile.first_name || profile.username || "HotMess";
  const supabase = createSupabaseAdminClient();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ dating_enabled: true })
    .eq("id", profile.id);

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 });

  const { error } = await supabase.from("dating_profiles").upsert(
    {
      user_id: profile.id,
      is_active: input.isActive,
      display_name: displayName,
      bio: input.bio,
      relationship_goal: input.relationshipGoal,
      interests: input.interests,
      languages: input.languages,
      photos: input.photos,
      photo_urls: input.photos,
      show_event_history: input.showEventHistory,
      looking_for: input.lookingFor,
      pref_age_min: Math.min(input.prefAgeMin, input.prefAgeMax),
      pref_age_max: Math.max(input.prefAgeMin, input.prefAgeMax),
      pref_distance_km: input.prefDistanceKm,
      pref_only_event_attendees: input.prefOnlyEventAttendees,
      pref_only_verified: input.prefOnlyVerified,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

