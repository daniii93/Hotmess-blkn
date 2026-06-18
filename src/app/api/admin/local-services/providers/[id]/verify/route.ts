import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile } from "@/features/events/live-service";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentUserProfile();
  const { id } = await params;
  const supabase = createSupabaseAdminClient();
  const { data: provider, error: providerError } = await supabase.from("local_service_provider_profiles").select("id,business_profile_id").eq("id", id).maybeSingle();
  if (providerError || !provider) return NextResponse.json({ error: "Anbieter nicht gefunden." }, { status: 404 });
  const { error } = await supabase.from("local_service_provider_profiles").update({ verification_status: "verified", updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await supabase.from("business_profile_modules").upsert({
    business_profile_id: provider.business_profile_id,
    module_key: "local_services",
    is_active: true,
    approved_at: new Date().toISOString(),
    approved_by: admin?.id ?? null,
  }, { onConflict: "business_profile_id,module_key" });
  await supabase.from("local_service_audit").insert({ actor_id: admin?.id ?? null, action: "provider_verified", target_type: "local_service_provider", target_id: id });
  return NextResponse.json({ ok: true });
}
