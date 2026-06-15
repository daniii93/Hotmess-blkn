type SplitPaymentRequest = {
  splitPaymentId: string;
  providerReference?: string;
};

Deno.serve(async (request) => {
  const payload = (await request.json().catch(() => ({}))) as Partial<SplitPaymentRequest>;

  if (!payload.splitPaymentId) {
    return Response.json({ error: "splitPaymentId is required" }, { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json({ status: "prepared", message: "Supabase environment is not configured." }, { status: 503 });
  }

  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase
    .from("split_payments")
    .update({ status: "paid", payment_reference: payload.providerReference ?? null, updated_at: new Date().toISOString() })
    .eq("id", payload.splitPaymentId)
    .select("id,status,order_id")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 409 });
  }

  return Response.json(data);
});
