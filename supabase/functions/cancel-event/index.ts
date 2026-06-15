import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type CancelEventBody = {
  event_id: string;
  admin_id: string;
  reason?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const body = (await request.json()) as CancelEventBody;
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

  const { data: admin } = await supabase.from("profiles").select("role").eq("id", body.admin_id).maybeSingle();
  if (admin?.role !== "admin") return json({ error: "Nur Admins können Events absagen." }, 403);

  await supabase.from("events").update({ status: "cancelled", published: false }).eq("id", body.event_id);
  await supabase.from("tickets").update({ status: "cancelled" }).eq("event_id", body.event_id).in("status", ["reserved", "paid", "valid"]);

  return json({
    cancelled: true,
    event_id: body.event_id,
    refunds: "prepared",
    reason: body.reason ?? null,
  });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
