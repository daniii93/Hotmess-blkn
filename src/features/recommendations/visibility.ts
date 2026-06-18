export const canRecommendVerifiedOnly = (verificationStatus: string | null | undefined, isBanned?: boolean | null) =>
  verificationStatus === "verified" && !isBanned;

export const shouldSuppressRecommendation = (score: number) => score <= -100;
