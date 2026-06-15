import { NextResponse } from "next/server";
import { getServerEnv } from "@/config/env";
import { createStripeServerClient } from "@/lib/stripe/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { activatePaidOrder } from "@/features/payments/activation";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  const secret = getServerEnv().stripeWebhookSecret;

  if (!signature || !secret) {
    return NextResponse.json({ error: "Stripe Webhook ist nicht konfiguriert." }, { status: 400 });
  }

  const stripe = createStripeServerClient();
  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Webhook Signatur ungueltig." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

    if (orderId && paymentIntent) {
      await activatePaidOrder({ orderId, provider: "stripe", paymentId: paymentIntent });
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;

    if (orderId) {
      const supabase = createSupabaseAdminClient();
      await supabase.from("orders").update({ status: "expired" }).eq("id", orderId).eq("status", "pending");
      await supabase.from("tickets").update({ status: "expired" }).eq("order_id", orderId).eq("status", "reserved");
    }
  }

  return NextResponse.json({ received: true });
}
