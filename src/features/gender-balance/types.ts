export type GenderBucket = "female" | "male" | "diverse";

export type GenderBalanceConfig = {
  enabled: boolean;
  quotas: Record<GenderBucket, number>;
  waitlistWhenFull: boolean;
};

export type GenderBalanceCounts = Record<GenderBucket, number>;

export type GenderBalanceDecision = {
  allowed: boolean;
  bucket: GenderBucket;
  reason?: "quota_full" | "balanced_disabled";
};

export type GenderCapacity = Record<GenderBucket, number>;
