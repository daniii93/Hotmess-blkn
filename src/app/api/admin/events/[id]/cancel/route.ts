import { NextResponse } from "next/server";
import { z } from "zod";
import { createStripeServerClient } from "@/lib/stripe/server";
import { refundPayPalCapture } from "@/lib/paypal/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRequestUserProfile } from "@/features/events/live-service";

const cancelSchema = z.object({
  reason: z.string().min(3).default("Event abgesagt"),
});

type CancelEventParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: CancelEventParams) {
  const profile = await getRequestUserProfile(request);
  if (!profile || profile.role !== "admin") return NextResponse.json({ error: "Admin-Zugriff erforderlich." }, { status: 403 });

  const { id } = await params;
  const parsed = cancelSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Grund fehlt." }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data: event, error: eventError } = await supabase.from("events").select("id,slug,title,status").or(`id.eq.${id},slug.eq.${id}`).maybeSingle();
  if (eventError) return NextResponse.json({ error: eventError.message }, { status: 400 });
  if (!event) return NextResponse.json({ error: "Event nicht gefunden." }, { status: 404 });

  await supabase.from("events").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", event.id);
  await supabase.from("tickets").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("event_id", event.id).in("status", ["reserved", "valid", "paid"]);
  await supabase.from("waitlist").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("event_id", event.id).in("status", ["waiting", "promoted"]);

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id,provider,payment_method,payment_id,total_cents,amount_cents,currency,status")
    .eq("event_id", event.id)
    .eq("status", "paid");

  if (ordersError) return NextResponse.json({ error: ordersError.message }, { status: 400 });

  const refunds: Array<{ orderId: string; status: string; provider: string | null; error?: string }> = [];
  const stripe = createStripeServerClient();

  for (const order of orders ?? []) {
    const provider = order.payment_method ?? order.provider;
    const amountCents = order.total_cents ?? order.amount_cents ?? 0;

    try {
      if (provider === "stripe" && order.payment_id) {
        const refund = await stripe.refunds.create({ payment_intent: order.payment_id, reason: "requested_by_customer" });
        await supabase.from("order_refunds").insert({
          order_id: order.id,
          provider: "stripe",
          provider_refund_id: refund.id,
          amount_cents: amountCents,
          status: refund.status === "succeeded" ? "succeeded" : "pending",
          reason: parsed.data.reason,
          created_by: profile.id,
        });
        refunds.push({ orderId: order.id, status: refund.status ?? "pending", provider });
      } else if (provider === "paypal" && order.payment_id) {
        const refund = await refundPayPalCapture(order.payment_id, amountCents, order.currency ?? "EUR");
        await supabase.from("order_refunds").insert({
          order_id: order.id,
          provider: "paypal",
          provider_refund_id: refund.id,
          amount_cents: amountCents,
          status: refund.status === "COMPLETED" ? "succeeded" : "pending",
          reason: parsed.data.reason,
          created_by: profile.id,
        });
        refunds.push({ orderId: order.id, status: refund.status, provider });
      } else {
        await supabase.from("order_refunds").insert({
          order_id: order.id,
          provider: "manual",
          amount_cents: amountCents,
          status: "manual_required",
          reason: parsed.data.reason,
          created_by: profile.id,
        });
        refunds.push({ orderId: order.id, status: "manual_required", provider });
      }

      await supabase.from("orders").update({ status: "refunded", refunded_at: new Date().toISOString(), refund_status: "requested" }).eq("id", order.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Refund fehlgeschlagen";
      await supabase.from("order_refunds").insert({
        order_id: order.id,
        provider: provider ?? "manual",
        amount_cents: amountCents,
        status: "failed",
        reason: parsed.data.reason,
        error_message: message,
        created_by: profile.id,
      });
      refunds.push({ orderId: order.id, status: "failed", provider, error: message });
    }
  }

  await supabase.from("admin_audit").insert({
    admin_id: profile.id,
    action: "cancel_event",
    target_type: "event",
    target_id: event.id,
    after_state: { status: "cancelled", refunds },
    reason: parsed.data.reason,
  });

  return NextResponse.json({ ok: true, eventId: event.id, refunds });
}
