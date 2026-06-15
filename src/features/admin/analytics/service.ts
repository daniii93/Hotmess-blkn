export type AdminAnalyticsSnapshot = {
  revenueCents: number;
  ticketSales: number;
  addonSalesCents: number;
  hotelMarginCents: number;
  tableMarginCents: number;
  drinkPackageMarginCents: number;
  genderSplit: Record<"female" | "male" | "diverse", number>;
  waitlistConversion: number;
  checkoutConversion: number;
  splitPaymentCompletion: number;
  scannerThroughput: number;
  noShowRate: number;
  communityActivity: number;
};

export const createAdminAnalyticsSnapshot = (
  snapshot: AdminAnalyticsSnapshot,
): AdminAnalyticsSnapshot => snapshot;
