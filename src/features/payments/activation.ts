import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { signQrToken } from "@/features/events/live-service";

type OrderItem = {
  type: "ticket" | "table" | "drinks" | "fastlane" | "birthday";
  price_cents: number;
  ticket_type_id?: string;
  user_id?: string;
  table_id?: string;
  package_id?: string;
  birthday_package_id?: string;
  service?: "discreet" | "hotmess_girls";
  person_id?: string;
  surprise?: boolean;
};

export const activatePaidOrder = async ({
  orderId,
  provider,
  paymentId,
  providerOrderId,
}: {
  orderId: string;
  provider: "stripe" | "paypal";
  paymentId: string;
  providerOrderId?: string | null;
}) => {
  const supabase = createSupabaseAdminClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id,user_id,event_id,status,items")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) throw new Error(orderError.message);
  if (!order) throw new Error("Order nicht gefunden.");
  if (order.status === "paid") return { orderId, alreadyPaid: true };

  const { data: event } = await supabase
    .from("events")
    .select("id,slug,hotel_partner_id")
    .eq("id", order.event_id)
    .maybeSingle();

  const { data: tickets, error: ticketError } = await supabase
    .from("tickets")
    .select("id,event_id,user_id,ticket_type_id,status")
    .eq("order_id", orderId);

  if (ticketError) throw new Error(ticketError.message);

  for (const ticket of tickets ?? []) {
    const qrToken = signQrToken(ticket.id, ticket.event_id, ticket.user_id);
    const { error } = await supabase
      .from("tickets")
      .update({
        status: "valid",
        qr_token: qrToken,
        purchased_at: new Date().toISOString(),
      })
      .eq("id", ticket.id)
      .in("status", ["reserved", "paid"]);

    if (error) throw new Error(error.message);

    await supabase
      .from("ticket_types")
      .update({ quantity_sold: await nextQuantitySold(ticket.ticket_type_id) })
      .eq("id", ticket.ticket_type_id);

    if (event?.hotel_partner_id) {
      await createHotelCode({
        ticketId: ticket.id,
        eventId: ticket.event_id,
        orderId: order.id,
        userId: ticket.user_id,
        hotelPartnerId: event.hotel_partner_id,
        eventSlug: event.slug,
      });
    }
  }

  const items = (Array.isArray(order.items) ? order.items : []) as OrderItem[];
  const tableItem = items.find((item) => item.type === "table" && item.table_id);
  let tableBookingId: string | null = null;

  if (tableItem?.table_id) {
    const { data: tableBooking, error } = await supabase
      .from("table_bookings")
      .insert({
        event_id: order.event_id,
        event_table_id: tableItem.table_id,
        table_id: tableItem.table_id,
        order_id: order.id,
        booked_by: order.user_id,
        member_ids: [order.user_id],
        persons_count: 1,
        status: "confirmed",
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    tableBookingId = tableBooking.id;
    await incrementById("event_tables", tableItem.table_id, "quantity_sold");
    await logAddonOperation(order.event_id, order.id, "table", tableBooking.id, "confirmed", "Tischbuchung bestaetigt");
  }

  for (const item of items) {
    if (item.type === "fastlane") {
      await supabase.from("tickets").update({ has_fastlane: true }).eq("order_id", order.id);
    }

    if (item.type === "drinks" && item.package_id) {
      const { error } = await supabase.from("drink_package_bookings").insert({
        package_id: item.package_id,
        drink_package_id: item.package_id,
        event_id: order.event_id,
        order_id: order.id,
        user_id: order.user_id,
        table_booking_id: tableBookingId,
        service_type: item.service ?? "discreet",
        hotmess_girls_service: item.service === "hotmess_girls",
        status: "confirmed",
      });
      if (error) throw new Error(error.message);
      await incrementById("drink_packages", item.package_id, "quantity_sold");
      await logAddonOperation(order.event_id, order.id, "drink_package", null, "confirmed", item.service === "hotmess_girls" ? "HotMess Girls Service" : "Diskreter Service");
    }

    if (item.type === "birthday" && item.birthday_package_id) {
      const { error } = await supabase.from("birthday_package_bookings").insert({
        birthday_package_id: item.birthday_package_id,
        event_id: order.event_id,
        order_id: order.id,
        table_booking_id: tableBookingId,
        booked_by: order.user_id,
        birthday_person_id: item.person_id ?? order.user_id,
        is_surprise: item.surprise ?? false,
        status: "confirmed",
      });
      if (error) throw new Error(error.message);
      await logAddonOperation(order.event_id, order.id, "birthday", null, "confirmed", item.surprise ? "Ueberraschung" : "Geburtstag");
    }
  }

  const { error: orderUpdateError } = await supabase
    .from("orders")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      payment_method: provider,
      provider,
      payment_id: paymentId,
      provider_order_id: providerOrderId ?? null,
    })
    .eq("id", order.id);

  if (orderUpdateError) throw new Error(orderUpdateError.message);

  await supabase
    .from("event_attendees")
    .upsert({ event_id: order.event_id, user_id: order.user_id, status: "going" }, { onConflict: "event_id,user_id" });

  await supabase.from("friend_activity").insert({
    user_id: order.user_id,
    type: "ticket_purchase",
    event_id: order.event_id,
    metadata: { order_id: order.id },
  });

  return { orderId, activatedTickets: tickets?.length ?? 0 };
};

const nextQuantitySold = async (ticketTypeId: string) => {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("ticket_types").select("quantity_sold").eq("id", ticketTypeId).single();
  if (error) throw new Error(error.message);
  return (data.quantity_sold ?? 0) + 1;
};

const incrementById = async (table: "event_tables" | "drink_packages", id: string, column: "quantity_sold") => {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from(table).select(column).eq("id", id).single();
  if (error) throw new Error(error.message);
  await supabase.from(table).update({ [column]: (data[column] ?? 0) + 1 }).eq("id", id);
};

const createHotelCode = async ({
  ticketId,
  eventId,
  orderId,
  userId,
  hotelPartnerId,
  eventSlug,
}: {
  ticketId: string;
  eventId: string;
  orderId: string;
  userId: string;
  hotelPartnerId: string;
  eventSlug?: string | null;
}) => {
  const supabase = createSupabaseAdminClient();
  const code = `HM-${(eventSlug ?? eventId).slice(0, 6).toUpperCase()}-${ticketId.slice(0, 6).toUpperCase()}`;
  const extended = {
    ticket_id: ticketId,
    event_id: eventId,
    order_id: orderId,
    user_id: userId,
    hotel_partner_id: hotelPartnerId,
    code,
    status: "issued",
  };
  const { error } = await supabase.from("hotel_codes").upsert(extended, { onConflict: "code" });
  if (!error) {
    await logAddonOperation(eventId, orderId, "hotel_code", null, "issued", code);
    return;
  }

  await supabase.from("hotel_codes").upsert({ ticket_id: ticketId, hotel_partner_id: hotelPartnerId, code }, { onConflict: "code" });
};

const logAddonOperation = async (
  eventId: string,
  orderId: string,
  bookingType: "table" | "drink_package" | "birthday" | "hotel_code" | "fastlane" | "hotmess_time",
  bookingId: string | null,
  status: string,
  note?: string,
) => {
  const supabase = createSupabaseAdminClient();
  await supabase.from("addon_operation_logs").insert({
    event_id: eventId,
    order_id: orderId,
    booking_type: bookingType,
    booking_id: bookingId,
    status,
    note: note ?? null,
  });
};
