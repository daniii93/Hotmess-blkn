import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (request) => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  const token = (request.headers.get("authorization") ?? "").replace("Bearer ", "");
  const { data: { user } } = await supabase.auth.getUser(token);

  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  await supabase.from("account_audit").insert({ user_id: user.id, action: "data_export", detail: { status: "requested" } });

  return Response.json({ requested: true });
});
