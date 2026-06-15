import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  referral_code: string;
  attribution_method: "link" | "qr" | "landing";
  event_id?: string;
  ip_hash?: string;
};

serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const body = (await request.json()) as Body;
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  const { data: partner } = await supabase.from("partners").select("id").eq("referral_code", body.referral_code).maybeSingle();
  if (!partner) return json({ tracked: false }, 404);
  await supabase.from("partner_link_clicks").insert({ partner_id: partner.id, attribution_method: body.attribution_method, event_id: body.event_id ?? null, ip_hash: body.ip_hash ?? null });
  return json({ tracked: true, partner_id: partner.id });
});

function json(payload: unknown, status = 200) { return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } }); }
