import "server-only";

import { getBenefitsData } from "@/features/benefits/service";
import { getCurrentUserProfile, getCurrentUserTickets } from "@/features/events/live-service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { WalletItem } from "./types";

const safe = async <T>(fallback: T, loader: () => Promise<T>): Promise<T> => {
  try {
    return await loader();
  } catch {
    return fallback;
  }
};

const safeRows = async <T>(table: string, select: string, configure?: (query: any) => any): Promise<T[]> => {
  try {
    const supabase = createSupabaseAdminClient();
    let query = supabase.from(table).select(select);
    if (configure) query = configure(query);
    const { data, error } = await query;
    if (error) return [];
    return (data ?? []) as T[];
  } catch {
    return [];
  }
};

export const getWalletData = async () => {
  const profile = await safe(null, getCurrentUserProfile);
  const userId = profile?.id ?? null;
  const [tickets, benefits] = await Promise.all([
    safe([], getCurrentUserTickets),
    safe(null, getBenefitsData),
  ]);

  const [hotelCodes, tableBookings, drinkBookings, birthdayBookings, localOrders, refunds, datingSubs, businessSubs, localSubs] = userId
    ? await Promise.all([
        safeRows<any>("hotel_codes", "id,code,status,event_id,created_at", (query) => query.eq("user_id", userId).order("created_at", { ascending: false }).limit(8)),
        safeRows<any>("table_bookings", "id,status,total_price_cents,event_id,created_at", (query) => query.eq("user_id", userId).limit(8)),
        safeRows<any>("drink_package_bookings", "id,status,total_price_cents,event_id,created_at", (query) => query.eq("user_id", userId).limit(8)),
        safeRows<any>("birthday_package_bookings", "id,status,total_price_cents,event_id,created_at", (query) => query.eq("user_id", userId).limit(8)),
        safeRows<any>("local_service_orders", "id,status,total_amount_cents,created_at", (query) => query.eq("customer_id", userId).order("created_at", { ascending: false }).limit(8)),
        safeRows<any>("order_refunds", "id,status,amount_cents,created_at", (query) => query.eq("user_id", userId).order("created_at", { ascending: false }).limit(8)),
        safeRows<any>("dating_subscriptions", "id,tier,is_active,expires_at,created_at", (query) => query.eq("user_id", userId).eq("is_active", true).limit(2)),
        safeRows<any>("business_subscriptions", "id,is_active,expires_at,created_at", (query) => query.eq("user_id", userId).eq("is_active", true).limit(2)),
        safeRows<any>("local_service_subscriptions", "id,is_active,expires_at,created_at", (query) => query.eq("user_id", userId).eq("is_active", true).limit(2)),
      ])
    : [[], [], [], [], [], [], [], [], []];

  const items: WalletItem[] = [
    ...tickets.map((ticket) => ({
      id: `ticket:${ticket.id}`,
      type: "ticket" as const,
      title: ticket.event?.title ?? "HotMess Ticket",
      text: ticket.ticketType?.name ?? "Ticket",
      href: "/tickets",
      status: ticket.status,
      amountCents: ticket.ticketType?.priceCents ?? null,
      currency: ticket.ticketType?.currency ?? "EUR",
      createdAt: null,
    })),
    ...hotelCodes.map((code) => ({
      id: `hotel:${code.id}`,
      type: "hotel_code" as const,
      title: "Hotelcode",
      text: `Code ${code.code ?? "ausgestellt"}`,
      href: "/benefits#hotels",
      status: String(code.status ?? "issued"),
      createdAt: code.created_at as string | null,
    })),
    ...tableBookings.map((booking) => ({
      id: `table:${booking.id}`,
      type: "event_addon" as const,
      title: "Tischbuchung",
      text: "Event Add-on in deiner Wallet.",
      href: "/tickets",
      status: String(booking.status ?? "confirmed"),
      amountCents: booking.total_price_cents ?? null,
      currency: "EUR",
      createdAt: booking.created_at as string | null,
    })),
    ...drinkBookings.map((booking) => ({
      id: `drink:${booking.id}`,
      type: "event_addon" as const,
      title: "Drink Package",
      text: "Event Add-on in deiner Wallet.",
      href: "/tickets",
      status: String(booking.status ?? "confirmed"),
      amountCents: booking.total_price_cents ?? null,
      currency: "EUR",
      createdAt: booking.created_at as string | null,
    })),
    ...birthdayBookings.map((booking) => ({
      id: `birthday:${booking.id}`,
      type: "event_addon" as const,
      title: "Birthday Package",
      text: "Event Add-on in deiner Wallet.",
      href: "/tickets",
      status: String(booking.status ?? "confirmed"),
      amountCents: booking.total_price_cents ?? null,
      currency: "EUR",
      createdAt: booking.created_at as string | null,
    })),
    ...localOrders.map((order) => ({
      id: `service-order:${order.id}`,
      type: "local_service_order" as const,
      title: "Dienstleistungsauftrag",
      text: "Auftrag und Angebotsstatus.",
      href: `/local-services/orders/${order.id}`,
      status: String(order.status ?? "open"),
      amountCents: order.total_amount_cents ?? null,
      currency: "EUR",
      createdAt: order.created_at as string | null,
    })),
    ...refunds.map((refund) => ({
      id: `refund:${refund.id}`,
      type: "refund" as const,
      title: "Rueckerstattung",
      text: "Refund-Status fuer berechtigte Bestellung.",
      href: "/tickets",
      status: String(refund.status ?? "requested"),
      amountCents: refund.amount_cents ?? null,
      currency: "EUR",
      createdAt: refund.created_at as string | null,
    })),
    ...datingSubs.map((sub) => ({
      id: `dating-sub:${sub.id}`,
      type: "membership" as const,
      title: `Dating ${sub.tier ?? "Premium"}`,
      text: sub.expires_at ? `Aktiv bis ${new Date(sub.expires_at).toLocaleDateString("de-DE")}` : "Aktive Dating-Mitgliedschaft.",
      href: "/dating/premium",
      status: "active",
      createdAt: sub.created_at as string | null,
    })),
    ...businessSubs.map((sub) => ({
      id: `business-sub:${sub.id}`,
      type: "membership" as const,
      title: "Business Plus",
      text: sub.expires_at ? `Aktiv bis ${new Date(sub.expires_at).toLocaleDateString("de-DE")}` : "Aktive Business-Mitgliedschaft.",
      href: "/business/premium",
      status: "active",
      createdAt: sub.created_at as string | null,
    })),
    ...localSubs.map((sub) => ({
      id: `local-sub:${sub.id}`,
      type: "membership" as const,
      title: "Provider Plus",
      text: sub.expires_at ? `Aktiv bis ${new Date(sub.expires_at).toLocaleDateString("de-DE")}` : "Aktive Anbieter-Mitgliedschaft.",
      href: "/local-services/company/dashboard",
      status: "active",
      createdAt: sub.created_at as string | null,
    })),
    ...(benefits?.myBenefits ?? []).map((benefit, index) => ({
      id: `benefit:${index}`,
      type: "benefit" as const,
      title: benefit.title,
      text: benefit.text,
      href: benefit.href,
      status: "available",
      createdAt: null,
    })),
  ];

  return {
    profile,
    items,
    counts: {
      tickets: tickets.length,
      addons: tableBookings.length + drinkBookings.length + birthdayBookings.length,
      hotelCodes: hotelCodes.length,
      serviceOrders: localOrders.length,
      memberships: datingSubs.length + businessSubs.length + localSubs.length,
      refunds: refunds.length,
      benefits: benefits?.myBenefits.length ?? 0,
    },
    empty: "Noch keine Wallet-Inhalte. Tickets, Benefits, Buchungen und Auftraege erscheinen hier, sobald du sie nutzt.",
  };
};

export type WalletData = Awaited<ReturnType<typeof getWalletData>>;
