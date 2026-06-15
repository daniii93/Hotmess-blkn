export type PaymentProvider = "stripe" | "paypal";

export type PaymentStatus = "pending" | "processing" | "paid" | "failed" | "cancelled" | "refunded";

export type RevenueSourceType =
  | "ticket"
  | "hotel_package"
  | "drink_package"
  | "membership"
  | "package"
  | "vip"
  | "partner"
  | "hotel"
  | "table"
  | "fast_lane"
  | "birthday"
  | "bottle_service";

export type TaxCountry = "AT" | "DE" | "CH" | "IT";

export type InvoiceIdentity = {
  orderNumber: string;
  invoiceNumber: string;
};
