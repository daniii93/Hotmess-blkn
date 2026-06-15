import { createHmac } from "node:crypto";
import { getServerEnv } from "../../config/env";

export const signQrPayload = (payload: string): string => {
  const secret = getServerEnv().qrHmacSecret;

  return createHmac("sha256", secret).update(payload).digest("hex");
};

export const createSignedQrToken = (payload: string): string => {
  const signature = signQrPayload(payload);

  return `${payload}.${signature}`;
};

