import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  match_id: string;
  event_id?: string;
  user_id: string;
  status: "accepted" | "declined" | "later";
};

serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const body = (await request.json()) as Body;
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

  const { data: match } = await supabase
    .from("dating_matches")
    .select("id,user_a_id,user_b_id,matched_via_event_id")
    .eq("id", body.match_id)
    .maybeSingle();

  if (!match) return json({ error: "Match wurde nicht gefunden." }, 404);
  if (body.user_id !== match.user_a_id && body.user_id !== match.user_b_id) return json({ error: "Kein Zugriff auf dieses Match." }, 403);

  const eventId = body.event_id ?? match.matched_via_event_id;
  const { data: existing } = await supabase.from("dating_room_consents").select("*").eq("match_id", body.match_id).maybeSingle();
  const field = body.user_id === match.user_a_id ? "user_a_status" : "user_b_status";

  if (existing) {
    const { data } = await supabase
      .from("dating_room_consents")
      .update({ [field]: body.status })
      .eq("id", existing.id)
      .select("*")
      .single();
    return json({ consent: data, hotel_link_unlocked: data.user_a_status === "accepted" && data.user_b_status === "accepted" });
  }

  const { data, error } = await supabase
    .from("dating_room_consents")
    .insert({
      match_id: body.match_id,
      event_id: eventId,
      requested_by: body.user_id,
      user_a_id: match.user_a_id,
      user_b_id: match.user_b_id,
      [field]: body.status,
    })
    .select("*")
    .single();

  if (error) return json({ error: error.message }, 500);
  return json({ consent: data, hotel_link_unlocked: false });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}
