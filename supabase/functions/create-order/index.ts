type CreateOrderRequest = {
  eventId: string;
  items: Array<Record<string, unknown>>;
  discountCode?: string;
  taxCountry?: "AT" | "DE" | "CH" | "IT";
};

Deno.serve(async (request) => {
  const payload = (await request.json().catch(() => ({}))) as Partial<CreateOrderRequest>;

  if (!payload.eventId || !Array.isArray(payload.items)) {
    return Response.json({ error: "eventId and items are required" }, { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = request.headers.get("Authorization");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return Response.json({ status: "prepared", message: "Supabase environment is not configured." }, { status: 503 });
  }

  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: authorization ? { Authorization: authorization } : {} },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();

  if (userError || !userData.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase.rpc("create_platform_order", {
    p_user_id: userData.user.id,
    p_event_id: payload.eventId,
    p_items: payload.items,
    p_discount_code: payload.discountCode ?? null,
    p_tax_country: payload.taxCountry ?? "AT",
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 409 });
  }

  return Response.json({ orderId: data });
});
