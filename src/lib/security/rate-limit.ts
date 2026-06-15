export type RateLimitDecision = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export const evaluateFixedWindowRateLimit = (params: {
  currentCount: number;
  limit: number;
  resetAt: number;
  now?: number;
}): RateLimitDecision => {
  const now = params.now ?? Date.now();

  if (now >= params.resetAt) {
    return { allowed: true, remaining: params.limit - 1, resetAt: params.resetAt };
  }

  const remaining = Math.max(0, params.limit - params.currentCount - 1);

  return {
    allowed: params.currentCount < params.limit,
    remaining,
    resetAt: params.resetAt,
  };
};
