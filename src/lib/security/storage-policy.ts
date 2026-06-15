export type StorageAccessDecision = {
  allowed: boolean;
  reason?: "unauthenticated" | "wrong_owner" | "admin_required" | "unsupported_type";
};

export const canUploadMedia = (params: {
  authenticated: boolean;
  adminOnly?: boolean;
  isAdmin?: boolean;
  supportedType: boolean;
}): StorageAccessDecision => {
  if (!params.authenticated) return { allowed: false, reason: "unauthenticated" };
  if (!params.supportedType) return { allowed: false, reason: "unsupported_type" };
  if (params.adminOnly && !params.isAdmin) return { allowed: false, reason: "admin_required" };
  return { allowed: true };
};
