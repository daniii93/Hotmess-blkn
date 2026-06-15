import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  partner_id: string;
  amount_cents: number;
  invoice_url?: string;
};

serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const body = (await request.json()) as Body;
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

  const { data: partner } = await supabase.from("partners").select("tax_id,iban_encrypted,has_business_license").eq("id", body.partner_id).maybeSingle();
  const { data: balance } = await supabase.from("partner_balances").select("available_cents").eq("partner_id", body.partner_id).maybeSingle();
  if (!partner?.tax_id || !partner.iban_encrypted) return json({ error: "Geschaeftsdaten und IBAN sind fuer Auszahlungen erforderlich." }, 400);
  if ((balance?.available_cents ?? 0) < body.amount_cents || body.amount_cents < 5000) return json({ error: "Betrag ist nicht auszahlbar oder unter Mindestbetrag." }, 400);

  const { data, error } = await supabase.from("partner_payouts").insert({
    partner_id: body.partner_id,
    amount_cents: body.amount_cents,
    invoice_url: body.invoice_url ?? null,
  }).select("id,status").single();
  if (error) return json({ error: error.message }, 500);
  return json(data);
});

function json(payload: unknown, status = 200) { return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } }); }
