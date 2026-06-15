import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type SplitPayer = {
  payer_id: string;
  covers_user_ids: string[];
  amount_cents: number;
};

type GroupCheckoutBody = {
  order_id: string;
  assigned_by: string;
  split_payers: SplitPayer[];
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const body = (await request.json()) as GroupCheckoutBody;
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const rows = body.split_payers.map((payer) => ({
    order_id: body.order_id,
    payer_id: payer.payer_id,
    covers_user_ids: payer.covers_user_ids,
    assigned_by: body.assigned_by,
    amount_cents: payer.amount_cents,
    status: "pending",
    expires_at: expiresAt,
  }));

  const { data, error } = await supabase.from("order_split_payments").insert(rows).select("id,payer_id,expires_at");
  if (error) return json({ error: "Split-Zahlungen konnten nicht erstellt werden.", details: error.message }, 500);

  return json({ split_payments: data, expires_at: expiresAt });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
