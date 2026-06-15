import type { CheckoutLineItem, CheckoutTotals, CheckoutValidation, DiscountCode } from "./types";
import { calculateTaxCents } from "../payments/service";

export const calculateCheckoutTotals = (
  lineItems: CheckoutLineItem[],
  discountCents = 0,
  taxCountry: "AT" | "DE" | "CH" | "IT" = "AT",
  feeRate = 0.025,
): CheckoutTotals => {
  const subtotalCents = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPriceCents,
    0,
  );
  const discountedSubtotal = Math.max(0, subtotalCents - discountCents);
  const taxCents = calculateTaxCents(discountedSubtotal, taxCountry);
  const feesCents = Math.round(discountedSubtotal * feeRate);

  return {
    subtotalCents,
    discountCents,
    taxCents,
    feesCents,
    totalCents: discountedSubtotal + feesCents,
    currency: "EUR",
  };
};

export const validateCheckoutCart = (lineItems: CheckoutLineItem[]): CheckoutValidation => {
  const errors: string[] = [];
  const ticketQuantity = lineItems
    .filter((item) => item.itemType === "ticket")
    .reduce((sum, item) => sum + item.quantity, 0);

  if (ticketQuantity < 1) errors.push("Mindestens ein Ticket ist erforderlich.");

  const hasTable = lineItems.some((item) => item.itemType === "table");
  const hasDrinkPackage = lineItems.some((item) => item.itemType === "drink_package");

  if (lineItems.some((item) => item.itemType === "birthday") && !hasTable) {
    errors.push("Geburtstagspakete benötigen eine Tischbuchung.");
  }

  if (lineItems.some((item) => item.itemType === "bottle_service") && (!hasTable || !hasDrinkPackage)) {
    errors.push("Bottle Service benötigt Tischbuchung und Getränkepaket.");
  }

  return { valid: errors.length === 0, errors };
};

export const calculateDiscountCents = (
  subtotalCents: number,
  discount: DiscountCode | null,
  now = new Date(),
): number => {
  if (!discount) return 0;
  if (now < new Date(discount.validFrom) || now > new Date(discount.validUntil)) return 0;
  if (discount.maxUses !== undefined && discount.usedCount >= discount.maxUses) return 0;
  if (discount.type === "vip_unlock") return 0;
  if (discount.type === "fixed") return Math.min(subtotalCents, discount.value);
  return Math.round(subtotalCents * (discount.value / 100));
};
