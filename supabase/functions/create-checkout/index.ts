import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type CheckoutBody = {
  user_id: string;
  event_id: string;
  items: Array<{ type: string; price_cents: number; user_id?: string }>;
  payment_method: "stripe" | "paypal";
  discount_code?: string;
  is_group_order?: boolean;
  payment_split?: boolean;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const body = (await request.json()) as CheckoutBody;
  const subtotal = body.items.reduce((sum, item) => sum + Math.max(0, item.price_cents), 0);
  const total = subtotal;
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: body.user_id,
      event_id: body.event_id,
      items: body.items,
      subtotal_cents: subtotal,
      discount_cents: 0,
      discount_code: body.discount_code ?? null,
      total_cents: total,
      amount_cents: total,
      currency: "EUR",
      payment_method: body.payment_method,
      provider: body.payment_method,
      is_group_order: body.is_group_order ?? false,
      payment_split: body.payment_split ?? false,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) return json({ error: "Order konnte nicht erstellt werden.", details: error.message }, 500);

  return json({
    order_id: order.id,
    payment_method: body.payment_method,
    checkout_url: null,
    mode: "prepared",
  });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
