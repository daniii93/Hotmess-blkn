type PromoteWaitlistRequest = {
  eventId: string;
  gender: "female" | "male" | "diverse";
};

Deno.serve(async (request) => {
  const payload = (await request.json().catch(() => ({}))) as Partial<PromoteWaitlistRequest>;

  if (!payload.eventId || !payload.gender) {
    return Response.json({ error: "eventId and gender are required" }, { status: 400 });
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
  const role = String(userData.user?.user_metadata?.role ?? "");

  if (userError || role !== "admin") {
    return Response.json({ error: "Admin access required" }, { status: 403 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase.rpc("promote_waitlist_for_event", {
    p_event_id: payload.eventId,
    p_gender: payload.gender,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 409 });
  }

  return Response.json(data);
});
