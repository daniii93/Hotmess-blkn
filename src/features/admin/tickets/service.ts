export type AdminTicketAction = "search" | "cancel" | "resend" | "manual_validate" | "mark_used";

export type AdminTicketRow = {
  ticketId: string;
  status: "valid" | "used" | "cancelled" | "expired";
  name: string;
  photoUrl?: string;
  gender: "female" | "male" | "diverse";
  eventTitle: string;
  ticketType: string;
  qrStatus: "signed" | "missing" | "invalid";
  scanStatus: "not_scanned" | "used";
  purchasedAt: string;
  paymentMethod: "stripe" | "paypal" | "manual";
};

export const requiresTicketActionConfirmation = (action: AdminTicketAction): boolean =>
  action === "cancel" || action === "mark_used" || action === "manual_validate";
