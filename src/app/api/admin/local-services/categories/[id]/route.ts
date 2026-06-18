import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const input = await request.json().catch(() => ({}));
  const update: Record<string, unknown> = {};
  if ("name" in input) update.name = input.name;
  if ("description" in input) update.description = input.description;
  if ("icon" in input) update.icon = input.icon;
  if ("minLeadPriceCents" in input) update.min_lead_price_cents = input.minLeadPriceCents;
  if ("maxLeadPriceCents" in input) update.max_lead_price_cents = input.maxLeadPriceCents;
  if ("commissionRate" in input) update.commission_rate = input.commissionRate;
  if ("requiredDocuments" in input) update.required_documents = input.requiredDocuments;
  if ("isActive" in input) update.is_active = input.isActive;
  const { error } = await createSupabaseAdminClient().from("local_service_categories").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
