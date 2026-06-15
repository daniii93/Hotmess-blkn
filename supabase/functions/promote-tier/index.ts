import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const { partner_id } = await request.json() as { partner_id: string };
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  const { data: balance } = await supabase.from("partner_balances").select("own_tickets_sold").eq("partner_id", partner_id).maybeSingle();
  const { data: tiers } = await supabase.from("partner_tiers").select("tier,required_own_sales").order("tier", { ascending: false });
  const next = (tiers ?? []).find((tier) => Number(balance?.own_tickets_sold ?? 0) >= tier.required_own_sales);
  if (!next) return json({ promoted: false });
  await supabase.from("partners").update({ tier: next.tier, tier_since: new Date().toISOString().slice(0, 10) }).eq("id", partner_id);
  await supabase.from("partner_notifications").insert({ partner_id, type: "tier_up", title: "Neue Karrierestufe erreicht", body: `Du bist jetzt Stufe ${next.tier}.` });
  return json({ promoted: true, tier: next.tier });
});

function json(payload: unknown, status = 200) { return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } }); }
