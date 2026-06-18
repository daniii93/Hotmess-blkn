export type WalletItemType =
  | "ticket"
  | "event_addon"
  | "hotel_code"
  | "benefit"
  | "membership"
  | "local_service_order"
  | "refund"
  | "discount_code";

export type WalletItem = {
  id: string;
  type: WalletItemType;
  title: string;
  text: string;
  href: string;
  status: string;
  amountCents?: number | null;
  currency?: string | null;
  createdAt?: string | null;
};
