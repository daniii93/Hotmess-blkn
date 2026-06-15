import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  sponsor_code?: string;
  preferred_code?: string;
  agreed_terms: boolean;
};

serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const body = (await request.json()) as Body;
  if (!body.agreed_terms) return json({ error: "Partnervertrag muss akzeptiert werden." }, 400);

  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  const sponsor = body.sponsor_code
    ? await supabase.from("partners").select("id").eq("referral_code", body.sponsor_code).maybeSingle()
    : { data: null };
  const code = normalizeCode(body.preferred_code || `${body.first_name}${new Date().getFullYear()}`);

  const { data, error } = await supabase.from("partners").insert({
    email: body.email,
    first_name: body.first_name,
    last_name: body.last_name,
    phone: body.phone ?? null,
    sponsor_id: sponsor.data?.id ?? null,
    referral_code: code,
    referral_slug: code.toLowerCase(),
    agreed_terms_at: new Date().toISOString(),
    status: "active",
    tier_since: new Date().toISOString().slice(0, 10),
  }).select("id,referral_code,referral_slug").single();

  if (error) return json({ error: error.message }, 409);
  await supabase.from("partner_balances").insert({ partner_id: data.id });
  return json(data);
});

function normalizeCode(input: string) { return input.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 16); }
function json(payload: unknown, status = 200) { return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } }); }
