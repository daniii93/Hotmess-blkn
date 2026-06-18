import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile } from "@/features/events/live-service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentUserProfile();
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("local_service_provider_profiles").update({ verification_status: "rejected", updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await supabase.from("local_service_audit").insert({ actor_id: admin?.id ?? null, action: "provider_rejected", target_type: "local_service_provider", target_id: id, reason: body.reason ?? null });
  return NextResponse.json({ ok: true });
}
