import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const schema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2).max(80),
  lastName: z.string().min(2).max(80),
  phone: z.string().max(40).optional(),
  sponsorCode: z.string().max(32).optional(),
  preferredCode: z.string().max(32).optional(),
  agreedTerms: z.literal(true),
});

const client = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "", {
    auth: { autoRefreshToken: false, persistSession: false },
  });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ungueltige Partner-Registrierung." }, { status: 400 });
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)) {
    return NextResponse.json({ error: "Supabase ist im Partner-Projekt noch nicht konfiguriert." }, { status: 503 });
  }

  const supabase = client();
  const sponsor = parsed.data.sponsorCode
    ? await supabase.from("partners").select("id").ilike("referral_code", parsed.data.sponsorCode).maybeSingle()
    : { data: null };
  const code = normalizeCode(parsed.data.preferredCode || `${parsed.data.firstName}${new Date().getFullYear()}`);

  const { data, error } = await supabase
    .from("partners")
    .insert({
      email: parsed.data.email,
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      phone: parsed.data.phone ?? null,
      sponsor_id: sponsor.data?.id ?? null,
      referral_code: code,
      referral_slug: code.toLowerCase(),
      agreed_terms_at: new Date().toISOString(),
      status: "active",
      tier_since: new Date().toISOString().slice(0, 10),
    })
    .select("id,referral_code,referral_slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 409 });
  await supabase.from("partner_balances").insert({ partner_id: data.id });
  return NextResponse.json(data);
}

const normalizeCode = (input: string) => input.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16);

