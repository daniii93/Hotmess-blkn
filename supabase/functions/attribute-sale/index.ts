import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  referral_code?: string;
  partner_id?: string;
  order_id: string;
  ticket_id: string;
  event_id: string;
  buyer_user_id: string;
  attribution_method: "code" | "link" | "qr" | "landing";
  ticket_revenue_cents: number;
};

serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const body = (await request.json()) as Body;
  const supabase = client();

  const partnerQuery = supabase.from("partners").select("id,tier,sponsor_id").eq("status", "active");
  const { data: partner } = body.partner_id
    ? await partnerQuery.eq("id", body.partner_id).maybeSingle()
    : await partnerQuery.eq("referral_code", body.referral_code ?? "").maybeSingle();

  if (!partner) return json({ attributed: false, reason: "Partner nicht gefunden oder nicht aktiv." }, 404);

  const { data: tier } = await supabase.from("partner_tiers").select("own_commission_pct").eq("tier", partner.tier).maybeSingle();
  const ownPct = Number(tier?.own_commission_pct ?? 0);
  const ownCommission = Math.floor(body.ticket_revenue_cents * ownPct / 100);

  const { data: ownReferral, error } = await supabase.from("partner_referrals").insert({
    partner_id: partner.id,
    order_id: body.order_id,
    ticket_id: body.ticket_id,
    event_id: body.event_id,
    buyer_user_id: body.buyer_user_id,
    attribution_method: body.attribution_method,
    ticket_revenue_cents: body.ticket_revenue_cents,
    commission_pct: ownPct,
    commission_cents: ownCommission,
    commission_type: "own",
    source_partner_id: partner.id,
  }).select("id").single();

  if (error) return json({ error: error.message }, 500);
  await supabase.rpc("apply_partner_referral_balance", { p_partner_id: partner.id, p_commission_cents: ownCommission, p_commission_type: "own" });
  await notify(supabase, partner.id, "sale", "Verkauf erfasst", `+${formatEuro(ownCommission)} Provision aus Ticketverkauf.`);

  let overrideReferralId: string | null = null;
  if (partner.sponsor_id) {
    const { data: sponsor } = await supabase.from("partners").select("id,tier").eq("id", partner.sponsor_id).eq("status", "active").maybeSingle();
    const { data: sponsorTier } = sponsor ? await supabase.from("partner_tiers").select("team_override_pct").eq("tier", sponsor.tier).maybeSingle() : { data: null };
    const overridePct = Number(sponsorTier?.team_override_pct ?? 0);
    if (sponsor && overridePct > 0) {
      const overrideCommission = Math.floor(body.ticket_revenue_cents * overridePct / 100);
      const { data: override } = await supabase.from("partner_referrals").insert({
        partner_id: sponsor.id,
        order_id: body.order_id,
        ticket_id: body.ticket_id,
        event_id: body.event_id,
        buyer_user_id: body.buyer_user_id,
        attribution_method: body.attribution_method,
        ticket_revenue_cents: body.ticket_revenue_cents,
        commission_pct: overridePct,
        commission_cents: overrideCommission,
        commission_type: "team_override",
        source_partner_id: partner.id,
      }).select("id").single();
      overrideReferralId = override?.id ?? null;
      await supabase.rpc("apply_partner_referral_balance", { p_partner_id: sponsor.id, p_commission_cents: overrideCommission, p_commission_type: "team_override" });
      await notify(supabase, sponsor.id, "team_sale", "Team-Verkauf erfasst", `+${formatEuro(overrideCommission)} Team-Override aus echtem Ticketverkauf.`);
    }
  }

  return json({ attributed: true, referral_id: ownReferral.id, override_referral_id: overrideReferralId });
});

function client() { return createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""); }
async function notify(supabase: ReturnType<typeof client>, partnerId: string, type: string, title: string, body: string) { await supabase.from("partner_notifications").insert({ partner_id: partnerId, type, title, body }); }
function formatEuro(cents: number) { return `${(cents / 100).toFixed(2).replace(".", ",")} EUR`; }
function json(payload: unknown, status = 200) { return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } }); }
