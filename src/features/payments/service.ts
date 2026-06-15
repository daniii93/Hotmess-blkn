import type { PaymentStatus } from "./types";

const PAID_STATUSES: PaymentStatus[] = ["paid"];

export const isPaidPaymentStatus = (status: PaymentStatus): boolean => PAID_STATUSES.includes(status);

export const toEuro = (amountCents: number): string =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amountCents / 100);

export const getVatRate = (country: "AT" | "DE" | "CH" | "IT"): number => {
  const rates = {
    AT: 0.2,
    DE: 0.19,
    CH: 0.081,
    IT: 0.22,
  } as const;

  return rates[country];
};

export const calculateTaxCents = (grossCents: number, country: "AT" | "DE" | "CH" | "IT"): number => {
  const rate = getVatRate(country);
  return Math.round(grossCents - grossCents / (1 + rate));
};

export const createInvoiceIdentity = (orderId: string, now = new Date()): { orderNumber: string; invoiceNumber: string } => {
  const datePart = now.toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = orderId.slice(0, 8).toUpperCase();

  return {
    orderNumber: `HM-${datePart}-${suffix}`,
    invoiceNumber: `INV-${datePart}-${suffix}`,
  };
};
