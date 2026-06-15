import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  admin_id: string;
  payout_id: string;
  action: "approved" | "paid" | "rejected";
  payment_reference?: string;
  rejection_reason?: string;
};

serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const body = (await request.json()) as Body;
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  const { data: admin } = await supabase.from("profiles").select("role").eq("id", body.admin_id).maybeSingle();
  if (admin?.role !== "admin") return json({ error: "Admin-Zugriff erforderlich." }, 403);

  const { data: payout } = await supabase.from("partner_payouts").select("*").eq("id", body.payout_id).maybeSingle();
  if (!payout) return json({ error: "Auszahlung nicht gefunden." }, 404);

  const update = body.action === "approved"
    ? { status: "approved", approved_by: body.admin_id, approved_at: new Date().toISOString() }
    : body.action === "paid"
      ? { status: "paid", paid_at: new Date().toISOString(), payment_reference: body.payment_reference ?? null }
      : { status: "rejected", rejection_reason: body.rejection_reason ?? "Abgelehnt" };

  await supabase.from("partner_payouts").update(update).eq("id", body.payout_id);
  if (body.action === "paid") {
    const { data: balance } = await supabase
      .from("partner_balances")
      .select("available_cents,paid_total_cents")
      .eq("partner_id", payout.partner_id)
      .maybeSingle();

    await supabase.from("partner_balances").update({
      available_cents: Math.max(0, Number(balance?.available_cents ?? 0) - Number(payout.amount_cents)),
      paid_total_cents: Number(balance?.paid_total_cents ?? 0) + Number(payout.amount_cents),
    }).eq("partner_id", payout.partner_id);
    await supabase.rpc("log_admin_action", { p_admin_id: body.admin_id, p_action: "partner_payout_paid", p_target_type: "partner_payout", p_target_id: body.payout_id, p_before_state: payout, p_after_state: update, p_reason: "Partner-Auszahlung" });
  }

  return json({ payout_id: body.payout_id, status: body.action });
});

function json(payload: unknown, status = 200) { return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } }); }
