import { NextResponse } from "next/server";
import { activatePaidOrder } from "@/features/payments/activation";
import { capturePayPalOrder } from "@/lib/paypal/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPublicEnv } from "@/config/env";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("order_id");
  const paypalOrderId = url.searchParams.get("token");
  const appUrl = getPublicEnv().appUrl || url.origin;

  if (!orderId || !paypalOrderId) {
    return NextResponse.redirect(`${appUrl}/checkout/success?error=paypal`);
  }

  try {
    const capture = await capturePayPalOrder(paypalOrderId);
    const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? paypalOrderId;
    await activatePaidOrder({ orderId, provider: "paypal", paymentId: captureId, providerOrderId: paypalOrderId });
    return NextResponse.redirect(`${appUrl}/checkout/success?order=${orderId}`);
  } catch (error) {
    const supabase = createSupabaseAdminClient();
    await supabase.from("orders").update({ status: "failed" }).eq("id", orderId).eq("status", "pending");
    return NextResponse.redirect(`${appUrl}/checkout/success?order=${orderId}&error=paypal`);
  }
}
