import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  const { data, error } = await supabase
    .from("business_subscriptions")
    .select("id,user_id,expires_at,auto_renew")
    .eq("is_active", true);

  if (error) return json({ error: error.message }, 500);

  const now = Date.now();
  const expiring = (data ?? []).filter((subscription) => new Date(subscription.expires_at).getTime() - now < 3 * 24 * 60 * 60 * 1000);

  return json({ checked: data?.length ?? 0, expiring: expiring.length, payment: "prepared" });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}
