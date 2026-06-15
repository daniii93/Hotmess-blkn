import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type PaymentWebhookBody = {
  order_id?: string;
  payment_id?: string;
  type?: string;
};

serve(async (request) => {
  const body = (await request.json().catch(() => ({}))) as PaymentWebhookBody;
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

  if (!body.order_id) {
    return json({ received: true, skipped: "Keine order_id im Test-Payload." });
  }

  const { error } = await supabase.rpc("mark_order_paid_and_activate_tickets", {
    p_order_id: body.order_id,
    p_payment_id: body.payment_id ?? null,
    p_provider: "stripe",
  });

  if (error) return json({ error: error.message }, 500);
  return json({ received: true, order_id: body.order_id });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
