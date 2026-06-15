import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  job_id: string;
};

serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const body = (await request.json()) as Body;
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

  const { data: job } = await supabase.from("job_listings").select("title,category,city,employment_type").eq("id", body.job_id).maybeSingle();
  if (!job) return json({ error: "Job wurde nicht gefunden." }, 404);

  const { data: alerts } = await supabase.from("job_alerts").select("user_id,categories,cities,employment_types").eq("is_active", true);
  const matching = (alerts ?? []).filter((alert) => {
    const categoryMatch = !alert.categories?.length || alert.categories.includes(job.category);
    const cityMatch = !alert.cities?.length || alert.cities.includes(job.city);
    const typeMatch = !alert.employment_types?.length || alert.employment_types.includes(job.employment_type);
    return categoryMatch && cityMatch && typeMatch;
  });

  if (matching.length > 0) {
    await supabase.from("notifications").insert(
      matching.map((alert) => ({
        user_id: alert.user_id,
        type: "job_alert",
        category: "business",
        title: "Neuer passender Job",
        body: job.title,
        reference_id: body.job_id,
        reference_type: "job",
      })),
    );
  }

  return json({ notified: matching.length });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}
