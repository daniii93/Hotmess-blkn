import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  const { data, error } = await supabase
    .from("dating_matches")
    .select("id,matched_via_event_id,user_a_id,user_b_id")
    .not("matched_via_event_id", "is", null)
    .eq("is_active", true);

  if (error) return json({ error: error.message }, 500);
  return json({ prompts_prepared: data?.length ?? 0, message: "Habt ihr euch beim Event getroffen?" });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}
