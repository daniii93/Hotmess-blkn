import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  const soon = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("coffee_chats")
    .select("id,proposed_by,recipient_id,confirmed_time,location")
    .eq("status", "confirmed")
    .gte("confirmed_time", now)
    .lte("confirmed_time", soon);

  if (error) return json({ error: error.message }, 500);
  return json({ reminders: data?.length ?? 0, notification: "prepared" });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}
