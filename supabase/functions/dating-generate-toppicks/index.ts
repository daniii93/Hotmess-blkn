import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  const { data: profiles, error } = await supabase.from("dating_profiles").select("user_id,tier").eq("is_active", true).limit(1000);
  if (error) return json({ error: error.message }, 500);

  const rows = (profiles ?? []).flatMap((profile, index, all) => {
    const candidates = all.filter((candidate) => candidate.user_id !== profile.user_id).slice(0, profile.tier === "free" ? 1 : 10);
    return candidates.map((candidate) => ({
      user_id: profile.user_id,
      target_id: candidate.user_id,
      picked_user_id: candidate.user_id,
      is_premium_pick: profile.tier !== "free",
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }));
  });

  if (rows.length > 0) await supabase.from("dating_top_picks").insert(rows);
  return json({ generated: rows.length });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}
