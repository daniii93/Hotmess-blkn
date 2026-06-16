import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const schema = z.object({
  partnerId: z.string().uuid(),
  amountCents: z.number().int().min(5000),
  invoiceUrl: z.string().url().optional(),
});

const client = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "", {
    auth: { autoRefreshToken: false, persistSession: false },
  });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ungueltiger Auszahlungsantrag." }, { status: 400 });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)) {
    return NextResponse.json({ error: "Supabase ist im Partner-Projekt noch nicht konfiguriert." }, { status: 503 });
  }

  const supabase = client();
  const { data: partner } = await supabase.from("partners").select("tax_id,iban_encrypted,has_business_license").eq("id", parsed.data.partnerId).maybeSingle();
  const { data: balance } = await supabase.from("partner_balances").select("available_cents").eq("partner_id", parsed.data.partnerId).maybeSingle();

  if (!partner?.tax_id || !partner.iban_encrypted) {
    return NextResponse.json({ error: "Geschaeftsdaten und IBAN sind fuer Auszahlungen erforderlich." }, { status: 400 });
  }
  if (Number(balance?.available_cents ?? 0) < parsed.data.amountCents) {
    return NextResponse.json({ error: "Betrag ist nicht auszahlbar." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("partner_payouts")
    .insert({ partner_id: parsed.data.partnerId, amount_cents: parsed.data.amountCents, invoice_url: parsed.data.invoiceUrl ?? null })
    .select("id,status")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

