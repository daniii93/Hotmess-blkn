import { apiError, type ApiError } from "../../types/api";
import { AppError } from "./app-error";
import { ErrorCode } from "./error-codes";

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof AppError) {
    return apiError(error.code, error.messageKey, error.details);
  }

  return apiError(ErrorCode.INTERNAL_ERROR, "errors.unknown", {
    reason: error instanceof Error ? error.message : "Unknown error",
  });
};
