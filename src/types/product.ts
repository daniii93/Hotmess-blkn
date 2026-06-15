import type { UserRole, VerificationStatus } from "./roles";

export type TargetMarket = "DE" | "AT" | "CH" | "IT";

export type CorePrincipleKey = "curated" | "balanced" | "safe";

export type ProductPriority =
  | "events"
  | "ticketing"
  | "addons"
  | "entryControl"
  | "community"
  | "chat"
  | "futureSocial";

export type GenderQuota = "female" | "male" | "diverse";

export type PaymentProvider = "stripe" | "paypal";

export type SellableProduct =
  | "ticket"
  | "vipTicket"
  | "hotelRoom"
  | "tableReservation"
  | "drinkPackage"
  | "bottleServiceUpgrade"
  | "fastLane"
  | "birthdayPackage"
  | "fruitPlatter"
  | "discountCode"
  | "vipCode";

export type ScanResult = "ok" | "already_used" | "invalid" | "wrong_event" | "cancelled" | "expired";

export type LegalRuleKey =
  | "accountRequired"
  | "minimumAge"
  | "verificationRequiredForTicketPurchase"
  | "nonTransferableTickets"
  | "noResale"
  | "noRefund"
  | "singleUseQr"
  | "noPermanentIdStorage"
  | "legalPagesVisible"
  | "necessaryCookiesOnly";

export type ProductRule = Readonly<{
  key: string;
  labelKey: string;
  descriptionKey: string;
  enforcedIn: readonly ("frontend" | "checkout" | "api" | "database" | "admin")[];
}>;

export type JourneyStep = Readonly<{
  key: string;
  labelKey: string;
  requiredRole?: UserRole;
  requiredVerificationStatus?: VerificationStatus;
  requiresValidTicket?: boolean;
}>;

export type JourneyDefinition = Readonly<{
  key: string;
  labelKey: string;
  steps: readonly JourneyStep[];
}>;

