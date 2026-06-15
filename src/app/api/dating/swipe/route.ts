import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserProfile } from "@/features/events/live-service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const swipeSchema = z.object({
  swipedId: z.string().uuid(),
  direction: z.enum(["left", "right", "super"]),
  note: z.string().max(180).optional(),
  matchedViaEventId: z.string().uuid().optional().nullable(),
});

export async function POST(request: Request) {
  const profile = await getCurrentUserProfile();
  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });
  if (!profile.dating_enabled) return NextResponse.json({ error: "Dating ist nicht aktiviert." }, { status: 403 });
  if (profile.verification_status !== "verified") return NextResponse.json({ error: "Bitte verifiziere dich vor Dating." }, { status: 403 });
  if (profile.is_banned) return NextResponse.json({ error: "Dieses Konto ist gesperrt." }, { status: 403 });

  const parsed = swipeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Swipe ist ungueltig." }, { status: 400 });
  const input = parsed.data;
  if (input.swipedId === profile.id) return NextResponse.json({ error: "Du kannst dich nicht selbst liken." }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data: datingProfile, error: datingError } = await supabase
    .from("dating_profiles")
    .select("tier,swipes_today,superlikes_remaining")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (datingError) return NextResponse.json({ error: datingError.message }, { status: 400 });
  if (!datingProfile) return NextResponse.json({ error: "Dating-Profil fehlt." }, { status: 404 });
  if (datingProfile.tier === "free" && datingProfile.swipes_today >= 100) {
    return NextResponse.json({ error: "Dein heutiges Swipe-Limit ist erreicht." }, { status: 429 });
  }
  if (input.direction === "super" && datingProfile.superlikes_remaining <= 0) {
    return NextResponse.json({ error: "Keine SuperLikes verfuegbar." }, { status: 429 });
  }

  const { error: insertError } = await supabase.from("dating_swipes").insert({
    swiper_id: profile.id,
    swiped_id: input.swipedId,
    target_id: input.swipedId,
    direction: input.direction,
    action: input.direction === "left" ? "nope" : input.direction === "super" ? "superlike" : "like",
    note: input.note ?? null,
  });

  if (insertError) return NextResponse.json({ error: "Dieses Profil wurde bereits bewertet." }, { status: 409 });

  await supabase
    .from("dating_profiles")
    .update({
      swipes_today: datingProfile.swipes_today + 1,
      superlikes_remaining: input.direction === "super" ? datingProfile.superlikes_remaining - 1 : datingProfile.superlikes_remaining,
    })
    .eq("user_id", profile.id);

  if (input.direction === "left") return NextResponse.json({ matched: false });

  const { data: reverse } = await supabase
    .from("dating_swipes")
    .select("id")
    .eq("swiper_id", input.swipedId)
    .eq("swiped_id", profile.id)
    .in("direction", ["right", "super"])
    .maybeSingle();

  if (!reverse) return NextResponse.json({ matched: false });

  const [userA, userB] = [profile.id, input.swipedId].sort();
  const { data: conversationId, error: conversationError } = await supabase.rpc("create_or_get_direct_conversation", {
    p_user_a: userA,
    p_user_b: userB,
  });

  if (conversationError) return NextResponse.json({ error: conversationError.message }, { status: 500 });

  const { data: match, error: matchError } = await supabase
    .from("dating_matches")
    .upsert(
      {
        user_a_id: userA,
        user_b_id: userB,
        user_a: userA,
        user_b: userB,
        conversation_id: conversationId,
        matched_via_event_id: input.matchedViaEventId ?? null,
        is_active: true,
      },
      { onConflict: "user_a_id,user_b_id" },
    )
    .select("id,conversation_id")
    .single();

  if (matchError) return NextResponse.json({ error: matchError.message }, { status: 500 });

  await supabase.from("notifications").insert([
    {
      user_id: profile.id,
      actor_id: input.swipedId,
      type: "dating_match",
      category: "dating",
      title: "Es ist ein Match",
      body: "Ihr koennt jetzt im HotMess-Chat schreiben.",
      reference_id: match.id,
      reference_type: "dating_match",
    },
    {
      user_id: input.swipedId,
      actor_id: profile.id,
      type: "dating_match",
      category: "dating",
      title: "Es ist ein Match",
      body: "Ihr koennt jetzt im HotMess-Chat schreiben.",
      reference_id: match.id,
      reference_type: "dating_match",
    },
  ]);

  return NextResponse.json({ matched: true, matchId: match.id, conversationId: match.conversation_id });
}

