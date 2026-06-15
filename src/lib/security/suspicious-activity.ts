export type SuspiciousActivitySignal =
  | "failed_login"
  | "rate_limit_exceeded"
  | "ip_velocity"
  | "verification_retry"
  | "scanner_mismatch";

export type SuspiciousActivityDecision = {
  flagged: boolean;
  score: number;
  phase: 2;
  signals: SuspiciousActivitySignal[];
};

const signalWeights: Readonly<Record<SuspiciousActivitySignal, number>> = {
  failed_login: 20,
  rate_limit_exceeded: 35,
  ip_velocity: 25,
  verification_retry: 20,
  scanner_mismatch: 30,
};

export const evaluateSuspiciousActivity = (
  signals: SuspiciousActivitySignal[],
): SuspiciousActivityDecision => {
  const score = signals.reduce((sum, signal) => sum + signalWeights[signal], 0);

  return {
    flagged: score >= 50,
    score,
    phase: 2,
    signals,
  };
};
