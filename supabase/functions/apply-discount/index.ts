type ApplyDiscountRequest = {
  code: string;
  subtotalCents: number;
};

Deno.serve(async (request) => {
  const payload = (await request.json().catch(() => ({}))) as Partial<ApplyDiscountRequest>;

  if (!payload.code || typeof payload.subtotalCents !== "number") {
    return Response.json({ error: "code and subtotalCents are required" }, { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json({ status: "prepared", message: "Supabase environment is not configured." }, { status: 503 });
  }

  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase.rpc("preview_discount_cents", {
    p_code: payload.code,
    p_subtotal_cents: payload.subtotalCents,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 409 });
  }

  return Response.json({ discountCents: data });
});
