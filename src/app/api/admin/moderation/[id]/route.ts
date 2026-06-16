import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserProfile } from "@/features/events/live-service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  status: z.enum(["actioned", "dismissed"]),
  actionTaken: z.enum(["removed", "warned", "banned", "none"]),
  reason: z.string().min(3).max(500),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await getCurrentUserProfile();
  if (!admin || admin.role !== "admin") return NextResponse.json({ error: "Admin-Zugriff erforderlich." }, { status: 403 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ungueltige Moderationsaktion." }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data: before } = await supabase.from("moderation_queue").select("*").eq("id", id).maybeSingle();
  const update = {
    status: parsed.data.status,
    action_taken: parsed.data.actionTaken,
    reviewed_by: admin.id,
    reviewed_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("moderation_queue").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const { data: after } = await supabase.from("moderation_queue").select("*").eq("id", id).maybeSingle();

  await supabase.from("admin_audit").insert({
    admin_id: admin.id,
    action: "moderate_content",
    target_type: before?.content_type ?? "moderation",
    target_id: before?.content_id ?? id,
    before_state: before,
    after_state: after,
    reason: parsed.data.reason,
  });

  return NextResponse.json({ ok: true });
}

