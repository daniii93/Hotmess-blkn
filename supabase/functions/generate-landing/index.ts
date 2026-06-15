import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const { partner_id, event_slug } = await request.json() as { partner_id: string; event_slug: string };
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  const { data: partner } = await supabase.from("partners").select("referral_slug").eq("id", partner_id).maybeSingle();
  if (!partner) return json({ error: "Partner nicht gefunden." }, 404);
  return json({ url: `https://partner.hotmess.app/${partner.referral_slug}/${event_slug}`, status: "prepared" });
});

function json(payload: unknown, status = 200) { return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } }); }
