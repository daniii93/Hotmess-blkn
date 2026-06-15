export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiError = {
  ok: false;
  error: {
    code: string;
    messageKey: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export const apiSuccess = <T>(data: T): ApiSuccess<T> => ({
  ok: true,
  data,
});

export const apiError = (code: string, messageKey: string, details?: unknown): ApiError => ({
  ok: false,
  error: {
    code,
    messageKey,
    ...(details === undefined ? {} : { details }),
  },
});

