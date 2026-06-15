import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type RedeemBody = {
  code: string;
  event_id: string;
  user_id: string;
  total_cents: number;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const body = (await request.json()) as RedeemBody;
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

  const { data: discount } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("code", body.code.toUpperCase())
    .eq("event_id", body.event_id)
    .eq("is_active", true)
    .maybeSingle();

  if (!discount) return json({ valid: false, error: "Code ist nicht gültig." }, 404);
  if (discount.used_by_user_id || discount.used_at) return json({ valid: false, error: "Code wurde bereits eingelöst." }, 409);
  if (discount.expires_at && new Date(discount.expires_at).getTime() < Date.now()) {
    return json({ valid: false, error: "Code ist abgelaufen." }, 409);
  }
  if (discount.assigned_to_user_id && discount.assigned_to_user_id !== body.user_id) {
    return json({ valid: false, error: "Code ist nicht für dieses Konto freigegeben." }, 403);
  }

  const type = discount.discount_type ?? discount.type;
  const value = Number(discount.discount_value ?? discount.value ?? 0);
  const discountCents =
    type === "percent"
      ? Math.round(body.total_cents * (value / 100))
      : type === "free"
        ? body.total_cents
        : Math.round(value * 100);

  return json({
    valid: true,
    code: discount.code,
    discount_cents: Math.min(body.total_cents, Math.max(0, discountCents)),
  });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
