import type {
  GenderBalanceConfig,
  GenderBalanceCounts,
  GenderCapacity,
  GenderBalanceDecision,
  GenderBucket,
} from "./types";

export const normalizeGenderBucket = (gender?: string): GenderBucket => {
  if (gender === "female" || gender === "male" || gender === "diverse") return gender;
  return "diverse";
};

export const isGenderBalanceConfigValid = (config: GenderBalanceConfig): boolean => {
  const total = Object.values(config.quotas).reduce((sum, value) => sum + value, 0);
  return config.enabled && total === 100 && Object.values(config.quotas).every((value) => value >= 0);
};

export const calculateGenderCapacities = (
  capacityTotal: number,
  config: GenderBalanceConfig,
): GenderCapacity => {
  const female = Math.floor((capacityTotal * config.quotas.female) / 100);
  const male = Math.floor((capacityTotal * config.quotas.male) / 100);

  return {
    female,
    male,
    diverse: Math.max(0, capacityTotal - female - male),
  };
};

export const decideGenderBalance = (
  gender: string | undefined,
  capacity: number,
  counts: GenderBalanceCounts,
  config: GenderBalanceConfig,
): GenderBalanceDecision => {
  const bucket = normalizeGenderBucket(gender);

  if (!config.enabled) return { allowed: true, bucket, reason: "balanced_disabled" };

  const capacities = calculateGenderCapacities(capacity, config);
  const bucketCapacity = capacities[bucket];

  if ((counts[bucket] ?? 0) >= bucketCapacity) {
    return { allowed: false, bucket, reason: "quota_full" };
  }

  return { allowed: true, bucket };
};
