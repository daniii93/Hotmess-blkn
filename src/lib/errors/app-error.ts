import { ErrorCode } from "./error-codes";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly messageKey: string;
  readonly details?: unknown;

  constructor(code: ErrorCode, messageKey: string, details?: unknown) {
    super(messageKey);
    this.name = "AppError";
    this.code = code;
    this.messageKey = messageKey;
    this.details = details;
  }
}

