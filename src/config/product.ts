import type { CorePrincipleKey, PaymentProvider, ProductPriority, SellableProduct, TargetMarket } from "../types/product";

export const productIdentity = {
  name: "HotMess",
  legalBrand: "HOTMESS BLKN",
  positioningKey: "product.positioning.exclusiveMembersClub",
  brandCoreKey: "product.brandCore.notForEveryone",
  targetAudienceKey: "product.targetAudience.exYugoslavDiaspora",
  targetMarkets: ["DE", "AT", "CH", "IT"] as const satisfies readonly TargetMarket[],
};

export const corePrinciples = [
  {
    key: "curated",
    labelKey: "product.principles.curated.label",
    ruleKeys: [
      "product.principles.curated.verifiedUsersOnly",
      "product.principles.curated.adminCreatesEvents",
      "product.principles.curated.noExternalOrganizersInMvp",
      "product.principles.curated.adminControlsAddonsHotelsTablesCodes",
    ],
  },
  {
    key: "balanced",
    labelKey: "product.principles.balanced.label",
    ruleKeys: [
      "product.principles.balanced.eventSpecificGenderQuotas",
      "product.principles.balanced.genderSpecificWaitlist",
      "product.principles.balanced.promoteNextUserAfterExpiry",
    ],
  },
  {
    key: "safe",
    labelKey: "product.principles.safe.label",
    ruleKeys: [
      "product.principles.safe.personalizedTickets",
      "product.principles.safe.profilePhotoAtEntry",
      "product.principles.safe.hmacSignedQr",
      "product.principles.safe.notTransferable",
      "product.principles.safe.singleScanOnly",
    ],
  },
] as const satisfies readonly {
  key: CorePrincipleKey;
  labelKey: string;
  ruleKeys: readonly string[];
}[];

export const productPriorities = [
  "events",
  "ticketing",
  "addons",
  "entryControl",
  "community",
  "chat",
  "futureSocial",
] as const satisfies readonly ProductPriority[];

export const paymentProviders = ["stripe", "paypal"] as const satisfies readonly PaymentProvider[];

export const sellableProducts = [
  "ticket",
  "vipTicket",
  "hotelRoom",
  "tableReservation",
  "drinkPackage",
  "bottleServiceUpgrade",
  "fastLane",
  "birthdayPackage",
  "fruitPlatter",
  "discountCode",
  "vipCode",
] as const satisfies readonly SellableProduct[];

export const addonDependencyRules = [
  {
    key: "validTicketRequiredForEveryAddon",
    errorMessageKey: "addons.errors.validTicketRequired",
    appliesTo: [
      "hotelRoom",
      "tableReservation",
      "drinkPackage",
      "fruitPlatter",
      "bottleServiceUpgrade",
      "fastLane",
      "birthdayPackage",
    ],
  },
  {
    key: "fruitPlatterRequiresTable",
    errorMessageKey: "addons.errors.tableRequired",
    appliesTo: ["fruitPlatter"],
  },
  {
    key: "birthdayPackageRequiresTable",
    errorMessageKey: "addons.errors.tableRequired",
    appliesTo: ["birthdayPackage"],
  },
  {
    key: "bottleServiceRequiresTableAndDrinkPackage",
    errorMessageKey: "addons.errors.tableAndDrinkPackageRequired",
    appliesTo: ["bottleServiceUpgrade"],
  },
] as const;

