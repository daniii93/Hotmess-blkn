export type GroupBookingMember = {
  userId?: string;
  email: string;
  verified?: boolean;
  amountCents?: number;
  paid: boolean;
};

export type GroupBookingStatus = "draft" | "awaiting_payments" | "paid" | "expired" | "cancelled";

export type SplitPaymentLink = {
  memberEmail: string;
  amountCents: number;
  expiresAt: string;
};
