import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestUserProfile } from "@/features/events/live-service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  swipedId: z.string().uuid(),
  direction: z.enum(["skip", "interested", "priority"]),
  contextNote: z.string().max(240).optional(),
  matchedViaEventId: z.string().uuid().optional().nullable(),
});

export async function POST(request: Request) {
  const profile = await getRequestUserProfile(request);
  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });
  if (!profile.business_enabled) return NextResponse.json({ error: "Business ist nicht aktiviert." }, { status: 403 });
  if (profile.verification_status !== "verified") return NextResponse.json({ error: "Bitte verifiziere dich vor Business." }, { status: 403 });
  if (profile.is_banned) return NextResponse.json({ error: "Dieses Konto ist gesperrt." }, { status: 403 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Business-Interesse ist ungueltig." }, { status: 400 });
  const input = parsed.data;
  if (input.swipedId === profile.id) return NextResponse.json({ error: "Du kannst dich nicht selbst vernetzen." }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data: businessProfile } = await supabase
    .from("business_profiles")
    .select("tier,daily_suggestions_seen,connection_requests_today")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!businessProfile) return NextResponse.json({ error: "Business-Profil fehlt." }, { status: 404 });
  if (businessProfile.tier === "free" && businessProfile.daily_suggestions_seen >= 25) return NextResponse.json({ error: "Dein heutiges Vorschlagslimit ist erreicht." }, { status: 429 });
  if (input.direction === "priority" && businessProfile.tier !== "plus") return NextResponse.json({ error: "Priority benoetigt Business Plus." }, { status: 403 });

  const { error: insertError } = await supabase.from("business_swipes").insert({
    swiper_id: profile.id,
    swiped_id: input.swipedId,
    target_id: input.swipedId,
    direction: input.direction,
    action: input.direction === "priority" ? "priority_connect" : input.direction === "interested" ? "interest" : "skip",
    context_note: input.contextNote ?? null,
  });
  if (insertError) return NextResponse.json({ error: "Dieses Profil wurde bereits bewertet." }, { status: 409 });

  await supabase
    .from("business_profiles")
    .update({
      daily_suggestions_seen: Number(businessProfile.daily_suggestions_seen ?? 0) + 1,
      connection_requests_today: input.direction === "skip" ? Number(businessProfile.connection_requests_today ?? 0) : Number(businessProfile.connection_requests_today ?? 0) + 1,
    })
    .eq("user_id", profile.id);

  if (input.direction === "skip") return NextResponse.json({ matched: false });

  const { data: reverse } = await supabase
    .from("business_swipes")
    .select("id")
    .eq("swiper_id", input.swipedId)
    .eq("swiped_id", profile.id)
    .in("direction", ["interested", "priority"])
    .maybeSingle();
  if (!reverse) return NextResponse.json({ matched: false });

  const [userA, userB] = [profile.id, input.swipedId].sort();
  const { data: conversationId, error: conversationError } = await supabase.rpc("create_or_get_direct_conversation", { p_user_a: userA, p_user_b: userB });
  if (conversationError) return NextResponse.json({ error: conversationError.message }, { status: 500 });
  const { data: reason } = await supabase.rpc("business_match_reason", { p_user_a: userA, p_user_b: userB });

  const { data: match, error: matchError } = await supabase
    .from("business_matches")
    .upsert(
      {
        user_a_id: userA,
        user_b_id: userB,
        user_a: userA,
        user_b: userB,
        conversation_id: conversationId,
        matched_via_event_id: input.matchedViaEventId ?? null,
        match_reason: reason ?? "Beidseitiges Business-Interesse",
        is_active: true,
      },
      { onConflict: "user_a_id,user_b_id" },
    )
    .select("id,conversation_id")
    .single();
  if (matchError) return NextResponse.json({ error: matchError.message }, { status: 500 });

  await supabase.from("notifications").insert([
    { user_id: profile.id, actor_id: input.swipedId, type: "business_match", category: "business", title: "Business Match", body: "Ihr koennt jetzt im HotMess-Chat schreiben.", reference_id: match.id, reference_type: "business_match" },
    { user_id: input.swipedId, actor_id: profile.id, type: "business_match", category: "business", title: "Business Match", body: "Ihr koennt jetzt im HotMess-Chat schreiben.", reference_id: match.id, reference_type: "business_match" },
  ]);

  return NextResponse.json({ matched: true, matchId: match.id, conversationId: match.conversation_id });
}
