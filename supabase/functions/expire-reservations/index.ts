import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  const { data, error } = await supabase.rpc("expire_ticket_reservations");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 501,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, result: data }), {
    headers: { "Content-Type": "application/json" },
  });
});
