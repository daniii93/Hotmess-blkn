import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getEventBySlug, getRequestUserProfile, signQrToken } from "@/features/events/live-service";

const checkoutSchema = z.object({
  ticketTypeId: z.string().uuid(),
});

type CheckoutParams = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, { params }: CheckoutParams) {
  const { slug } = await params;
  const profile = await getRequestUserProfile(request);

  if (!profile) return NextResponse.json({ error: "Bitte zuerst einloggen." }, { status: 401 });
  if (profile.is_banned) return NextResponse.json({ error: "Dieses Konto ist gesperrt." }, { status: 403 });
  if (profile.verification_status !== "verified") {
    return NextResponse.json({ error: "Ticketkauf ist nur fuer verifizierte Nutzer moeglich." }, { status: 403 });
  }

  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Tickettyp fehlt." }, { status: 400 });

  const event = await getEventBySlug(slug);
  if (!event || event.status !== "published") return NextResponse.json({ error: "Event ist nicht kaufbar." }, { status: 404 });

  const ticketType = event.ticketTypes.find((item) => item.id === parsed.data.ticketTypeId);
  if (!ticketType) return NextResponse.json({ error: "Tickettyp nicht gefunden." }, { status: 404 });

  const supabase = createSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("tickets")
    .select("id,status")
    .eq("event_id", event.id)
    .eq("user_id", profile.id)
    .in("status", ["reserved", "paid", "valid", "used"])
    .maybeSingle();

  if (existing) return NextResponse.json({ error: "Du hast bereits ein Ticket fuer dieses Event." }, { status: 409 });

  const holderName = `${profile.first_name} ${profile.last_name}`.trim();
  const { data: reservation, error: reservationError } = await supabase.rpc("reserve_ticket_transaction", {
    p_event_id: event.id,
    p_ticket_type_id: ticketType.id,
    p_user_id: profile.id,
    p_gender: profile.gender,
    p_holder_name: holderName,
    p_holder_photo_url: profile.avatar_url ?? "",
  });

  if (reservationError) return NextResponse.json({ error: reservationError.message }, { status: 400 });

  if (reservation?.waitlisted) {
    return NextResponse.json({ waitlisted: true, position: reservation.position });
  }

  const ticketId = reservation.ticket_id as string;
  const items = [{ type: "ticket", ticket_type_id: ticketType.id, user_id: profile.id, price_cents: ticketType.priceCents }];
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: profile.id,
      event_id: event.id,
      status: "pending",
      provider: "stripe",
      items,
      amount_cents: ticketType.priceCents,
      subtotal_cents: ticketType.priceCents,
      total_cents: ticketType.priceCents,
      currency: ticketType.currency,
    })
    .select("id")
    .single();

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 400 });

  const qrToken = signQrToken(ticketId, event.id, profile.id);
  const { error: ticketError } = await supabase
    .from("tickets")
    .update({
      order_id: order.id,
      status: "valid",
      qr_token: qrToken,
      purchased_at: new Date().toISOString(),
    })
    .eq("id", ticketId);

  if (ticketError) return NextResponse.json({ error: ticketError.message }, { status: 400 });

  await supabase
    .from("ticket_types")
    .update({ quantity_sold: ticketType.quantitySold + 1 })
    .eq("id", ticketType.id);

  await supabase
    .from("orders")
    .update({ status: "paid", paid_at: new Date().toISOString(), payment_method: "stripe", payment_id: `test_${order.id}` })
    .eq("id", order.id);

  await supabase.from("event_attendees").upsert({ event_id: event.id, user_id: profile.id, status: "going" }, { onConflict: "event_id,user_id" });
  await supabase.from("friend_activity").insert({
    user_id: profile.id,
    type: "ticket_purchase",
    event_id: event.id,
    metadata: { order_id: order.id, ticket_id: ticketId },
  });

  return NextResponse.json({ ok: true, orderId: order.id, ticketId });
}
