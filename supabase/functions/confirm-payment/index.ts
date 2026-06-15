type ConfirmPaymentRequest = {
  orderId: string;
  providerReference: string;
  provider: "stripe" | "paypal";
  payload?: Record<string, unknown>;
};

Deno.serve(async (request) => {
  const payload = (await request.json().catch(() => ({}))) as Partial<ConfirmPaymentRequest>;

  if (!payload.orderId || !payload.providerReference || !payload.provider) {
    return Response.json({ error: "orderId, provider and providerReference are required" }, { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json({ status: "prepared", message: "Supabase environment is not configured." }, { status: 503 });
  }

  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase.rpc("confirm_order_payment", {
    p_order_id: payload.orderId,
    p_provider: payload.provider,
    p_provider_event_id: payload.providerReference,
    p_payload: payload.payload ?? {},
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 409 });
  }

  return Response.json(data);
});
