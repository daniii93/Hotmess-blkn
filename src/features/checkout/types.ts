export type CheckoutLineItem = {
  id: string;
  title: string;
  itemType: "ticket" | "hotel" | "table" | "drink_package" | "fast_lane" | "birthday" | "bottle_service" | "addon";
  quantity: number;
  unitPriceCents: number;
};

export type CheckoutTotals = {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  feesCents: number;
  totalCents: number;
  currency: "EUR";
};

export type DiscountType = "percent" | "fixed" | "vip_unlock";

export type DiscountCode = {
  code: string;
  type: DiscountType;
  value: number;
  validFrom: string;
  validUntil: string;
  maxUses?: number;
  usedCount: number;
};

export type CheckoutValidation = {
  valid: boolean;
  errors: string[];
};
