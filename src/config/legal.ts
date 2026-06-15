import type { LegalRuleKey, ProductRule } from "../types/product";

export const minimumAge = 18;

export const legalRules = [
  {
    key: "accountRequired",
    labelKey: "legal.rules.accountRequired.label",
    descriptionKey: "legal.rules.accountRequired.description",
    enforcedIn: ["frontend", "checkout", "api", "database"],
  },
  {
    key: "minimumAge",
    labelKey: "legal.rules.minimumAge.label",
    descriptionKey: "legal.rules.minimumAge.description",
    enforcedIn: ["frontend", "api", "database", "admin"],
  },
  {
    key: "verificationRequiredForTicketPurchase",
    labelKey: "legal.rules.verificationRequiredForTicketPurchase.label",
    descriptionKey: "legal.rules.verificationRequiredForTicketPurchase.description",
    enforcedIn: ["frontend", "checkout", "api", "database", "admin"],
  },
  {
    key: "nonTransferableTickets",
    labelKey: "legal.rules.nonTransferableTickets.label",
    descriptionKey: "legal.rules.nonTransferableTickets.description",
    enforcedIn: ["frontend", "checkout", "api", "database"],
  },
  {
    key: "noResale",
    labelKey: "legal.rules.noResale.label",
    descriptionKey: "legal.rules.noResale.description",
    enforcedIn: ["frontend", "checkout"],
  },
  {
    key: "noRefund",
    labelKey: "legal.rules.noRefund.label",
    descriptionKey: "legal.rules.noRefund.description",
    enforcedIn: ["frontend", "checkout", "admin"],
  },
  {
    key: "singleUseQr",
    labelKey: "legal.rules.singleUseQr.label",
    descriptionKey: "legal.rules.singleUseQr.description",
    enforcedIn: ["api", "database", "admin"],
  },
  {
    key: "noPermanentIdStorage",
    labelKey: "legal.rules.noPermanentIdStorage.label",
    descriptionKey: "legal.rules.noPermanentIdStorage.description",
    enforcedIn: ["api", "database", "admin"],
  },
  {
    key: "legalPagesVisible",
    labelKey: "legal.rules.legalPagesVisible.label",
    descriptionKey: "legal.rules.legalPagesVisible.description",
    enforcedIn: ["frontend"],
  },
  {
    key: "necessaryCookiesOnly",
    labelKey: "legal.rules.necessaryCookiesOnly.label",
    descriptionKey: "legal.rules.necessaryCookiesOnly.description",
    enforcedIn: ["frontend"],
  },
] as const satisfies readonly (ProductRule & { key: LegalRuleKey })[];

export const checkoutNoticeKeys = [
  "checkout.notices.personalizedNonTransferableTickets",
  "checkout.notices.profilePhotoCheckedAtEntry",
  "checkout.notices.noRefundAfterPurchase",
] as const;

