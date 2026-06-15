export type VerificationAdminAction = "approve" | "reject" | "request_more_info";

export type PendingVerificationRow = {
  userId: string;
  name: string;
  birthDate: string;
  gender: "female" | "male" | "diverse";
  profilePhotoUrl: string;
  provider: "stripe_identity" | "manual_review";
  status: "pending" | "verified" | "rejected";
  createdAt: string;
};

export const getVerificationDecisionStatus = (
  action: VerificationAdminAction,
): "pending" | "verified" | "rejected" => {
  if (action === "approve") return "verified";
  if (action === "reject") return "rejected";
  return "pending";
};
