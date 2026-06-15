import { featureFlags } from "../../config/features";
import type { FeatureFlagKey } from "../../types/features";
import type { UserRole, VerificationStatus } from "../../types/roles";
import { AppError } from "../errors/app-error";
import { ErrorCode } from "../errors/error-codes";
import { can } from "./can";

export type AuthContext = {
  userId?: string;
  role: UserRole;
  verificationStatus?: VerificationStatus;
};

export const requireAuth = (context: AuthContext): void => {
  if (!context.userId || context.role === "guest") {
    throw new AppError(ErrorCode.AUTH_REQUIRED, "errors.auth.required");
  }
};

export const requireVerified = (context: AuthContext): void => {
  requireAuth(context);

  if (context.verificationStatus !== "verified") {
    throw new AppError(ErrorCode.VERIFICATION_REQUIRED, "errors.verification.required");
  }
};

export const requireAdmin = (context: AuthContext): void => {
  requireAuth(context);

  if (context.role !== "admin") {
    throw new AppError(ErrorCode.ROLE_FORBIDDEN, "errors.role.forbidden");
  }
};

export const requireScanner = (context: AuthContext): void => {
  requireAuth(context);

  if (context.role !== "scanner" && context.role !== "admin") {
    throw new AppError(ErrorCode.SCANNER_ACCESS_DENIED, "errors.scanner.accessDenied");
  }
};

export const requireFeature = (feature: FeatureFlagKey): void => {
  const state = featureFlags[feature];

  if (state === "disabled" || state === "hidden" || state === "future") {
    throw new AppError(ErrorCode.FEATURE_DISABLED, "errors.feature.disabled", { feature, state });
  }
};

export const requireTicketForAddon = (hasValidTicket: boolean): void => {
  if (!hasValidTicket) {
    throw new AppError(ErrorCode.ADDON_REQUIRES_TICKET, "addons.errors.validTicketRequired");
  }
};

export const requireTicket = (hasValidTicket: boolean): void => {
  if (!hasValidTicket) {
    throw new AppError(ErrorCode.TICKET_REQUIRED, "errors.ticket.required");
  }
};

export const requireTicketForEventChat = (hasValidTicket: boolean): void => {
  if (!hasValidTicket) {
    throw new AppError(ErrorCode.TICKET_REQUIRED, "errors.ticket.requiredForEventChat");
  }
};

export const requireAddonEligibility = (eligible: boolean, reason?: string): void => {
  if (!eligible) {
    throw new AppError(ErrorCode.ADDON_REQUIRES_TICKET, "addons.errors.notEligible", { reason });
  }
};

export const requirePermission = (context: AuthContext, permission: Parameters<typeof can>[1]): void => {
  requireAuth(context);

  if (!can(context.role, permission)) {
    throw new AppError(ErrorCode.ROLE_FORBIDDEN, "errors.role.forbidden", { permission });
  }
};
