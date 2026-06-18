import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserProfile } from "@/features/events/live-service";

const schema = z.object({
  orderId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  punctuality: z.number().int().min(1).max(5),
  quality: z.number().int().min(1).max(5),
  communication: z.number().int().min(1).max(5),
  valueForMoney: z.number().int().min(1).max(5),
  comment: z.string().max(1200).optional().default(""),
});

export async function POST(request: Request) {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });
    const input = schema.parse(await request.json());
    const supabase = createSupabaseAdminClient();
    const { data: order } = await supabase.from("local_service_orders").select("provider_id,status,customer_id").eq("id", input.orderId).maybeSingle();
    if (!order || order.customer_id !== profile.id || !["approved_by_customer", "paid_out"].includes(order.status)) {
      return NextResponse.json({ error: "Bewertung ist erst nach abgeschlossenem Auftrag moeglich." }, { status: 400 });
    }
    const { error } = await supabase.from("local_service_reviews").upsert({
      order_id: input.orderId,
      reviewer_id: profile.id,
      provider_id: order.provider_id,
      rating: input.rating,
      punctuality: input.punctuality,
      quality: input.quality,
      communication: input.communication,
      value_for_money: input.valueForMoney,
      comment: input.comment,
    }, { onConflict: "order_id,reviewer_id" });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Bewertung konnte nicht gespeichert werden." }, { status: 400 });
  }
}
