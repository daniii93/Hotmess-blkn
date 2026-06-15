import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  swiper_id: string;
  swiped_id: string;
  direction: "skip" | "interested" | "priority";
  context_note?: string;
  matched_via_event_id?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const body = (await request.json()) as Body;
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

  const { data: profile } = await supabase
    .from("profiles")
    .select("verification_status,is_banned,business_enabled")
    .eq("id", body.swiper_id)
    .maybeSingle();

  if (!profile?.business_enabled) return json({ error: "Business ist nicht aktiviert." }, 403);
  if (profile.verification_status !== "verified") return json({ error: "Bitte verifiziere dich vor Business." }, 403);
  if (profile.is_banned) return json({ error: "Dieses Konto ist gesperrt." }, 403);

  const { data: businessProfile } = await supabase
    .from("business_profiles")
    .select("tier,daily_suggestions_seen,connection_requests_today,looking_for_tags,offering_tags")
    .eq("user_id", body.swiper_id)
    .maybeSingle();

  if (!businessProfile) return json({ error: "Business-Profil fehlt." }, 404);
  if (businessProfile.tier === "free" && businessProfile.daily_suggestions_seen >= 25) {
    return json({ error: "Dein heutiges Vorschlagslimit ist erreicht." }, 429);
  }
  if (body.direction === "priority" && businessProfile.tier !== "plus") {
    return json({ error: "Priority-Interesse benötigt Business Plus." }, 403);
  }

  const { error: insertError } = await supabase.from("business_swipes").insert({
    swiper_id: body.swiper_id,
    swiped_id: body.swiped_id,
    target_id: body.swiped_id,
    direction: body.direction,
    action: body.direction === "priority" ? "priority_connect" : body.direction === "interested" ? "interest" : "skip",
    context_note: body.context_note ?? null,
  });

  if (insertError) return json({ error: insertError.message }, 409);

  await supabase
    .from("business_profiles")
    .update({
      daily_suggestions_seen: Number(businessProfile.daily_suggestions_seen ?? 0) + 1,
      connection_requests_today:
        body.direction === "skip"
          ? Number(businessProfile.connection_requests_today ?? 0)
          : Number(businessProfile.connection_requests_today ?? 0) + 1,
    })
    .eq("user_id", body.swiper_id);

  if (body.direction === "skip") return json({ matched: false });

  const { data: reverse } = await supabase
    .from("business_swipes")
    .select("id")
    .eq("swiper_id", body.swiped_id)
    .eq("swiped_id", body.swiper_id)
    .in("direction", ["interested", "priority"])
    .maybeSingle();

  if (!reverse) return json({ matched: false });

  const [userA, userB] = [body.swiper_id, body.swiped_id].sort();
  const { data: conversation } = await supabase
    .from("conversations")
    .insert({ type: "direct", created_by: body.swiper_id, last_message_at: new Date().toISOString() })
    .select("id")
    .single();

  if (conversation) {
    await supabase.from("conversation_members").insert([
      { conversation_id: conversation.id, user_id: body.swiper_id, role: "member" },
      { conversation_id: conversation.id, user_id: body.swiped_id, role: "member" },
    ]);
  }

  const reason = buildMatchReason(businessProfile.looking_for_tags ?? [], businessProfile.offering_tags ?? []);
  const { data: match, error: matchError } = await supabase
    .from("business_matches")
    .insert({
      user_a_id: userA,
      user_b_id: userB,
      user_a: userA,
      user_b: userB,
      conversation_id: conversation?.id ?? null,
      matched_via_event_id: body.matched_via_event_id ?? null,
      match_reason: reason,
    })
    .select("id,conversation_id")
    .single();

  if (matchError) return json({ error: matchError.message }, 500);
  return json({ matched: true, match_id: match.id, conversation_id: match.conversation_id, match_reason: reason });
});

function buildMatchReason(lookingFor: string[], offering: string[]) {
  const combined = [...lookingFor, ...offering].filter(Boolean).slice(0, 3);
  return combined.length > 0 ? `Gemeinsame Business-Ziele: ${combined.join(", ")}` : "Beidseitiges Business-Interesse";
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
