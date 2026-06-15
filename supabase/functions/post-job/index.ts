import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  posted_by: string;
  title: string;
  company: string;
  category: string;
  employment_type: "fulltime" | "parttime" | "freelance" | "internship" | "gig";
  description: string;
  city: string;
  paid_single_listing?: boolean;
  is_featured?: boolean;
  event_id?: string;
};

serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const body = (await request.json()) as Body;
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

  const { data: profile } = await supabase
    .from("business_profiles")
    .select("tier,premium_until")
    .eq("user_id", body.posted_by)
    .maybeSingle();

  const hasPlus = profile?.tier === "plus" && (!profile.premium_until || new Date(profile.premium_until).getTime() > Date.now());
  if (!hasPlus && !body.paid_single_listing) {
    return json({ error: "Jobs ausschreiben benötigt Business Plus oder ein bezahltes Einzel-Inserat." }, 403);
  }

  const { data, error } = await supabase
    .from("job_listings")
    .insert({
      posted_by: body.posted_by,
      owner_id: body.posted_by,
      title: body.title,
      company: body.company,
      category: body.category,
      employment_type: body.employment_type,
      type: body.employment_type,
      description: body.description,
      city: body.city,
      is_featured: body.is_featured ?? false,
      event_id: body.event_id ?? null,
      status: "open",
      active: true,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select("id")
    .single();

  if (error) return json({ error: error.message }, 500);
  return json({ job_id: data.id, status: "open" });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}
