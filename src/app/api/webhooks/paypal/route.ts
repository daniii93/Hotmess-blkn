import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { activatePaidOrder } from "@/features/payments/activation";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    event_type?: string;
    resource?: {
      id?: string;
      custom_id?: string;
      supplementary_data?: { related_ids?: { order_id?: string } };
      purchase_units?: Array<{ custom_id?: string; payments?: { captures?: Array<{ id?: string }> } }>;
    };
  } | null;

  if (!payload?.event_type) return NextResponse.json({ error: "Ungueltiger PayPal Webhook." }, { status: 400 });

  const paypalOrderId = payload.resource?.supplementary_data?.related_ids?.order_id ?? payload.resource?.id;
  const orderId = payload.resource?.custom_id ?? payload.resource?.purchase_units?.[0]?.custom_id;
  const captureId = payload.resource?.id ?? payload.resource?.purchase_units?.[0]?.payments?.captures?.[0]?.id;

  if (payload.event_type === "PAYMENT.CAPTURE.COMPLETED" && orderId && captureId) {
    await activatePaidOrder({ orderId, provider: "paypal", paymentId: captureId, providerOrderId: paypalOrderId });
  }

  if ((payload.event_type === "CHECKOUT.ORDER.VOIDED" || payload.event_type === "PAYMENT.CAPTURE.DENIED") && orderId) {
    const supabase = createSupabaseAdminClient();
    await supabase.from("orders").update({ status: "failed" }).eq("id", orderId).eq("status", "pending");
    await supabase.from("tickets").update({ status: "expired" }).eq("order_id", orderId).eq("status", "reserved");
  }

  return NextResponse.json({ received: true });
}
