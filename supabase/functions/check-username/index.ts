import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (request) => {
  const { username } = await request.json() as { username?: string };
  const normalized = username?.toLowerCase().trim() ?? "";

  if (!/^[a-z0-9._]{3,30}$/.test(normalized)) {
    return Response.json({ available: false, reason: "invalid" }, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data } = await supabase.from("profiles").select("id").eq("username", normalized).maybeSingle();

  return Response.json({ available: data === null });
});
