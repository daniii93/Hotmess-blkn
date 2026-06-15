import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPublicEnv } from "@/config/env";
import { getEventBySlug, getRequestUserProfile } from "@/features/events/live-service";
import { createStripeServerClient } from "@/lib/stripe/server";
import { createPayPalOrder } from "@/lib/paypal/server";

const checkoutSchema = z.object({
  ticketTypeId: z.string().uuid(),
  paymentProvider: z.enum(["stripe", "paypal"]).default("stripe"),
  addons: z
    .object({
      tableId: z.string().uuid().optional(),
      drinkPackageId: z.string().uuid().optional(),
      birthdayPackageId: z.string().uuid().optional(),
      fastlane: z.boolean().default(false),
      hotmessGirlsService: z.boolean().default(false),
    })
    .default({ fastlane: false, hotmessGirlsService: false }),
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
  if (ticketType.quantityTotal !== null && ticketType.quantitySold >= ticketType.quantityTotal) {
    return NextResponse.json({ error: "Dieser Tickettyp ist ausverkauft." }, { status: 409 });
  }

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
  const selectedTable = parsed.data.addons.tableId ? event.tables.find((item) => item.id === parsed.data.addons.tableId) : null;
  const selectedDrink = parsed.data.addons.drinkPackageId
    ? event.drinkPackages.find((item) => item.id === parsed.data.addons.drinkPackageId)
    : null;
  const selectedBirthday = parsed.data.addons.birthdayPackageId
    ? event.birthdayPackages.find((item) => item.id === parsed.data.addons.birthdayPackageId)
    : null;

  if (parsed.data.addons.tableId && !selectedTable) return NextResponse.json({ error: "Tisch nicht gefunden." }, { status: 404 });
  if (parsed.data.addons.drinkPackageId && !selectedDrink) return NextResponse.json({ error: "Getraenkepaket nicht gefunden." }, { status: 404 });
  if (parsed.data.addons.birthdayPackageId && !selectedBirthday) return NextResponse.json({ error: "Geburtstagspaket nicht gefunden." }, { status: 404 });
  if (selectedDrink?.requiresTable && !selectedTable) {
    return NextResponse.json({ error: "Dieses Getraenkepaket braucht einen Tisch." }, { status: 400 });
  }
  if (selectedBirthday && !selectedTable) {
    return NextResponse.json({ error: "Geburtstagspaket braucht einen Tisch." }, { status: 400 });
  }

  const items = [
    { type: "ticket", ticket_type_id: ticketType.id, user_id: profile.id, price_cents: ticketType.priceCents },
    ...(selectedTable ? [{ type: "table", table_id: selectedTable.id, price_cents: selectedTable.priceCents }] : []),
    ...(selectedDrink
      ? [
          {
            type: "drinks",
            package_id: selectedDrink.id,
            service: parsed.data.addons.hotmessGirlsService ? "hotmess_girls" : "discreet",
            price_cents: selectedDrink.priceCents,
          },
        ]
      : []),
    ...(parsed.data.addons.fastlane ? [{ type: "fastlane", user_id: profile.id, price_cents: 1200 }] : []),
    ...(selectedBirthday
      ? [{ type: "birthday", birthday_package_id: selectedBirthday.id, person_id: profile.id, surprise: false, price_cents: selectedBirthday.priceCents }]
      : []),
  ];
  const totalCents = items.reduce((sum, item) => sum + item.price_cents, 0);
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: profile.id,
      event_id: event.id,
      status: "pending",
      provider: parsed.data.paymentProvider,
      items,
      amount_cents: totalCents,
      subtotal_cents: totalCents,
      total_cents: totalCents,
      currency: ticketType.currency,
    })
    .select("id")
    .single();

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 400 });

  const { error: ticketError } = await supabase
    .from("tickets")
    .update({
      order_id: order.id,
      status: "reserved",
    })
    .eq("id", ticketId);

  if (ticketError) return NextResponse.json({ error: ticketError.message }, { status: 400 });

  const appUrl = getPublicEnv().appUrl || new URL(request.url).origin;
  const successUrl = `${appUrl}/checkout/success?order=${order.id}`;
  const cancelUrl = `${appUrl}/events/${event.slug}/checkout?cancelled=1`;

  if (parsed.data.paymentProvider === "paypal") {
    const paypalOrder = await createPayPalOrder({
      orderId: order.id,
      totalCents,
      currency: ticketType.currency,
      returnUrl: `${appUrl}/api/paypal/capture?order_id=${order.id}`,
      cancelUrl,
    });

    await supabase
      .from("orders")
      .update({ provider_session_id: paypalOrder.paypalOrderId, provider_order_id: paypalOrder.paypalOrderId, payment_method: "paypal" })
      .eq("id", order.id);

    return NextResponse.json({ ok: true, orderId: order.id, ticketId, checkoutUrl: paypalOrder.approveUrl });
  }

  const stripe = createStripeServerClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: profile.email,
    metadata: { order_id: order.id },
    payment_intent_data: { metadata: { order_id: order.id } },
    line_items: items.map((item) => ({
      quantity: 1,
      price_data: {
        currency: ticketType.currency.toLowerCase(),
        unit_amount: item.price_cents,
        product_data: {
          name:
            item.type === "ticket"
              ? `${event.title} · ${ticketType.name}`
              : item.type === "table"
                ? `Tisch · ${selectedTable?.name ?? "HotMess"}`
                : item.type === "drinks"
                  ? `Getraenkepaket · ${selectedDrink?.name ?? "HotMess"}`
                  : item.type === "fastlane"
                    ? "Fast-Lane"
                    : `Geburtstag · ${selectedBirthday?.name ?? "HotMess"}`,
        },
      },
    })),
  });

  await supabase
    .from("orders")
    .update({ provider_session_id: session.id, payment_method: "stripe" })
    .eq("id", order.id);

  return NextResponse.json({ ok: true, orderId: order.id, ticketId, checkoutUrl: session.url });
}
