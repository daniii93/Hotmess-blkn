import type { VerificationStatus } from "../../types/roles";

export type VerificationProvider = "stripe_identity" | "manual_review";

export type IdentityVerificationRecord = {
  userId: string;
  status: VerificationStatus;
  provider?: VerificationProvider;
  verifiedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
};

export const createPendingVerification = (
  userId: string,
  provider: VerificationProvider,
): IdentityVerificationRecord => ({
  userId,
  provider,
  status: "pending",
});

export const approveVerification = (
  record: IdentityVerificationRecord,
  verifiedAt = new Date().toISOString(),
): IdentityVerificationRecord => ({
  ...record,
  status: "verified",
  verifiedAt,
  rejectedAt: undefined,
  rejectionReason: undefined,
});

export const rejectVerification = (
  record: IdentityVerificationRecord,
  rejectionReason: string,
  rejectedAt = new Date().toISOString(),
): IdentityVerificationRecord => ({
  ...record,
  status: "rejected",
  rejectedAt,
  rejectionReason,
});
