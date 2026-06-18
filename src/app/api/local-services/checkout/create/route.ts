import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({ orderId: z.string().uuid() });

export async function POST(request: Request) {
  try {
    const { orderId } = schema.parse(await request.json());
    const supabase = createSupabaseAdminClient();
    await supabase.from("local_service_orders").update({ status: "in_progress", payment_id: `manual_${Date.now()}` }).eq("id", orderId);
    await supabase.from("local_service_payments").insert({ order_id: orderId, amount_cents: 0, type: "deposit", status: "paid" });
    return NextResponse.json({ ok: true, redirectTo: `/local-services/orders/${orderId}` });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Checkout konnte nicht erstellt werden." }, { status: 400 });
  }
}
