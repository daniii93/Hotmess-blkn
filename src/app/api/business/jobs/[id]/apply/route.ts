import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserProfile } from "@/features/events/live-service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  coverMessage: z.string().max(1500).optional().default(""),
  cvUrl: z.string().url().optional().or(z.literal("")).default(""),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentUserProfile();
  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });
  if (!profile.business_enabled) return NextResponse.json({ error: "Business ist nicht aktiviert." }, { status: 403 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bewerbung ist ungueltig." }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data: job } = await supabase.from("job_listings").select("id,title,posted_by,owner_id,status").eq("id", id).maybeSingle();
  if (!job || job.status !== "open") return NextResponse.json({ error: "Job wurde nicht gefunden." }, { status: 404 });
  const ownerId = job.posted_by ?? job.owner_id;
  if (!ownerId) return NextResponse.json({ error: "Inserent fehlt." }, { status: 400 });

  const { data: conversationId, error: conversationError } = await supabase.rpc("create_or_get_direct_conversation", { p_user_a: profile.id, p_user_b: ownerId });
  if (conversationError) return NextResponse.json({ error: conversationError.message }, { status: 500 });

  const message = `Bewerbung fuer ${job.title}: ${parsed.data.coverMessage || "Profil liegt bei."}`;
  await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: profile.id, type: "text", body: message, content: message });

  const { data: application, error } = await supabase
    .from("job_applications")
    .insert({ job_id: id, applicant_id: profile.id, cover_message: parsed.data.coverMessage, cv_url: parsed.data.cvUrl || null, conversation_id: conversationId })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: "Du hast dich bereits beworben." }, { status: 409 });

  await supabase.rpc("increment_job_applications", { p_job_id: id }).then(() => undefined);
  await supabase.from("notifications").insert({ user_id: ownerId, actor_id: profile.id, type: "job_application", category: "business", title: "Neue Bewerbung", body: `Eine neue Bewerbung ist fuer ${job.title} eingegangen.`, reference_id: id, reference_type: "job" });

  return NextResponse.json({ applicationId: application.id, conversationId });
}

