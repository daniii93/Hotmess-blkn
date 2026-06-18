import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile } from "@/features/events/live-service";

const schema = z.object({ orderId: z.string().uuid(), reason: z.string().min(10).max(2000) });

export async function POST(request: Request) {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });
    const input = schema.parse(await request.json());
    const supabase = createSupabaseAdminClient();
    await supabase.from("local_service_disputes").insert({ order_id: input.orderId, opened_by: profile.id, reason: input.reason, status: "open" });
    await supabase.from("local_service_orders").update({ status: "disputed" }).eq("id", input.orderId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Streitfall konnte nicht erstellt werden." }, { status: 400 });
  }
}
