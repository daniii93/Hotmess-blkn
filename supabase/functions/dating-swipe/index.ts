import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  swiper_id: string;
  swiped_id: string;
  direction: "left" | "right" | "super";
  note?: string;
  is_first_impression?: boolean;
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
    .select("verification_status,is_banned,dating_enabled")
    .eq("id", body.swiper_id)
    .maybeSingle();

  if (!profile?.dating_enabled) return json({ error: "Dating ist nicht aktiviert." }, 403);
  if (profile.verification_status !== "verified") return json({ error: "Bitte verifiziere dich vor Dating." }, 403);
  if (profile.is_banned) return json({ error: "Dieses Konto ist gesperrt." }, 403);

  const { data: datingProfile } = await supabase
    .from("dating_profiles")
    .select("tier,swipes_today,superlikes_remaining")
    .eq("user_id", body.swiper_id)
    .maybeSingle();

  if (!datingProfile) return json({ error: "Dating-Profil fehlt." }, 404);
  if (datingProfile.tier === "free" && datingProfile.swipes_today >= 100) {
    return json({ error: "Dein heutiges Swipe-Limit ist erreicht." }, 429);
  }
  if (body.direction === "super" && datingProfile.superlikes_remaining <= 0) {
    return json({ error: "Keine SuperLikes verfügbar." }, 429);
  }

  const { error: insertError } = await supabase.from("dating_swipes").insert({
    swiper_id: body.swiper_id,
    swiped_id: body.swiped_id,
    target_id: body.swiped_id,
    direction: body.direction,
    action: body.direction === "left" ? "nope" : body.direction === "super" ? "superlike" : "like",
    note: body.note ?? null,
    is_first_impression: body.is_first_impression ?? false,
  });

  if (insertError) return json({ error: insertError.message }, 409);

  await supabase
    .from("dating_profiles")
    .update({
      swipes_today: datingProfile.swipes_today + 1,
      superlikes_remaining: body.direction === "super" ? datingProfile.superlikes_remaining - 1 : datingProfile.superlikes_remaining,
    })
    .eq("user_id", body.swiper_id);

  if (body.direction === "left") return json({ matched: false });

  const { data: reverse } = await supabase
    .from("dating_swipes")
    .select("id")
    .eq("swiper_id", body.swiped_id)
    .eq("swiped_id", body.swiper_id)
    .in("direction", ["right", "super"])
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

  const { data: match, error: matchError } = await supabase
    .from("dating_matches")
    .insert({
      user_a_id: userA,
      user_b_id: userB,
      user_a: userA,
      user_b: userB,
      conversation_id: conversation?.id ?? null,
      matched_via_event_id: body.matched_via_event_id ?? null,
    })
    .select("id,conversation_id")
    .single();

  if (matchError) return json({ error: matchError.message }, 500);
  return json({ matched: true, match_id: match.id, conversation_id: match.conversation_id });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
