import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserProfile } from "@/features/events/live-service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  type: z.enum(["warning", "temp_ban", "perm_ban", "shadowban", "feature_block"]),
  scope: z.string().max(40).optional().default("all"),
  reason: z.string().min(3).max(500),
  expiresAt: z.string().datetime().optional().nullable(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await getCurrentUserProfile();
  if (!admin || admin.role !== "admin") return NextResponse.json({ error: "Admin-Zugriff erforderlich." }, { status: 403 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ungueltige Sanktion." }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data: before } = await supabase.from("profiles").select("id,is_banned,email").eq("id", id).maybeSingle();
  const { data: sanction, error } = await supabase
    .from("user_sanctions")
    .insert({
      user_id: id,
      type: parsed.data.type,
      scope: parsed.data.scope,
      reason: parsed.data.reason,
      issued_by: admin.id,
      expires_at: parsed.data.expiresAt,
      is_active: true,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (parsed.data.type === "perm_ban" || parsed.data.type === "temp_ban") {
    await supabase.from("profiles").update({ is_banned: true }).eq("id", id);
  }
  const { data: after } = await supabase.from("profiles").select("id,is_banned,email").eq("id", id).maybeSingle();

  await supabase.from("admin_audit").insert({
    admin_id: admin.id,
    action: "sanction_user",
    target_type: "user",
    target_id: id,
    before_state: before,
    after_state: { profile: after, sanction },
    reason: parsed.data.reason,
  });

  return NextResponse.json({ ok: true, sanctionId: sanction.id });
}

