import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  job_id: string;
  applicant_id: string;
  cover_message?: string;
  cv_url?: string;
};

serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const body = (await request.json()) as Body;
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

  const { data: job } = await supabase
    .from("job_listings")
    .select("posted_by,owner_id,title")
    .eq("id", body.job_id)
    .maybeSingle();

  if (!job) return json({ error: "Job wurde nicht gefunden." }, 404);
  const ownerId = job.posted_by ?? job.owner_id;

  const { data: conversation } = await supabase
    .from("conversations")
    .insert({ type: "direct", created_by: body.applicant_id, last_message_at: new Date().toISOString() })
    .select("id")
    .single();

  if (conversation) {
    await supabase.from("conversation_members").insert([
      { conversation_id: conversation.id, user_id: body.applicant_id, role: "member" },
      { conversation_id: conversation.id, user_id: ownerId, role: "member" },
    ]);

    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: body.applicant_id,
      type: "text",
      body: `Bewerbung für ${job.title}: ${body.cover_message ?? "Profil liegt bei."}`,
      content: `Bewerbung für ${job.title}: ${body.cover_message ?? "Profil liegt bei."}`,
    });
  }

  const { data, error } = await supabase
    .from("job_applications")
    .insert({
      job_id: body.job_id,
      applicant_id: body.applicant_id,
      cover_message: body.cover_message ?? null,
      cv_url: body.cv_url ?? null,
      conversation_id: conversation?.id ?? null,
    })
    .select("id")
    .single();

  if (error) return json({ error: error.message }, 409);

  await supabase.rpc("increment_job_applications", { p_job_id: body.job_id }).then(() => undefined);
  await supabase.from("notifications").insert({
    user_id: ownerId,
    type: "job_application",
    category: "business",
    title: "Neue Bewerbung",
    body: `Eine neue Bewerbung ist für ${job.title} eingegangen.`,
    reference_id: body.job_id,
    reference_type: "job",
  });

  return json({ application_id: data.id, conversation_id: conversation?.id ?? null });
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json" } });
}
