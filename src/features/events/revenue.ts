import type { RevenueSourceType } from "../payments/types";

export type EventRevenueBreakdown = {
  ticketCents: number;
  vipCents: number;
  hotelCents: number;
  tableCents: number;
  addonCents: number;
  totalCents: number;
};

export type EventRevenueTransaction = {
  sourceType: RevenueSourceType | "hotel" | "table" | "addon";
  amountCents: number;
  paymentStatus: "paid" | "pending" | "failed" | "refunded" | "cancelled";
};

export const calculateEventRevenueBreakdown = (
  transactions: EventRevenueTransaction[],
): EventRevenueBreakdown => {
  const paid = transactions.filter((transaction) => transaction.paymentStatus === "paid");
  const sum = (types: Array<EventRevenueTransaction["sourceType"]>) =>
    paid
      .filter((transaction) => types.includes(transaction.sourceType))
      .reduce((total, transaction) => total + transaction.amountCents, 0);

  const ticketCents = sum(["ticket"]);
  const vipCents = sum(["vip"]);
  const hotelCents = sum(["hotel", "hotel_package"]);
  const tableCents = sum(["table"]);
  const addonCents = sum(["addon", "drink_package"]);

  return {
    ticketCents,
    vipCents,
    hotelCents,
    tableCents,
    addonCents,
    totalCents: ticketCents + vipCents + hotelCents + tableCents + addonCents,
  };
};
