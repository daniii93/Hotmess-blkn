export type AdminOrderAction = "view" | "resend_confirmation" | "check_payment_status" | "resend_split_payment_links";

export type AdminOrderRow = {
  orderId: string;
  paymentStatus: "pending" | "processing" | "paid" | "failed" | "cancelled" | "refunded";
  stripePaymentId?: string;
  paypalPaymentId?: string;
  invoiceNumber?: string;
  totalCents: number;
  splitPaymentStatus?: "none" | "pending" | "partial" | "paid" | "expired";
};

export const canResendOrderConfirmation = (order: Pick<AdminOrderRow, "paymentStatus">): boolean =>
  order.paymentStatus === "paid";
