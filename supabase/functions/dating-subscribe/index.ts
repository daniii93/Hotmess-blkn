import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  user_id: string;
  tier: "plus" | "gold" | "platinum";
  plan: "1week" | "1month" | "6months" | "12months";
  price_cents: number;
  payment_method: "stripe" | "paypal";
  payment_id?: string;
};

serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const body = (await request.json()) as Body;
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  const { data, error } = await supabase.rpc("apply_dating_subscription", {
    p_user_id: body.user_id,
    p_tier: body.tier,
    p_plan: body.plan,
    p_price_cents: body.price_cents,
    p_payment_method: body.payment_method,
    p_payment_id: body.payment_id ?? null,
  });
  if (error) return json({ error: error.message }, 500);
  return json(data);
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}
