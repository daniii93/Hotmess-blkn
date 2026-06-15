import { timingSafeEqual } from "node:crypto";
import { signQrPayload } from "./sign";

export type QrVerificationResult =
  | { ok: true; payload: string }
  | { ok: false; reason: "malformed" | "invalid_signature" };

export const verifySignedQrToken = (token: string): QrVerificationResult => {
  const separatorIndex = token.lastIndexOf(".");

  if (separatorIndex <= 0) {
    return { ok: false, reason: "malformed" };
  }

  const payload = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  const expected = signQrPayload(payload);
  const signatureBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  if (signatureBuffer.length !== expectedBuffer.length) {
    return { ok: false, reason: "invalid_signature" };
  }

  return timingSafeEqual(signatureBuffer, expectedBuffer)
    ? { ok: true, payload }
    : { ok: false, reason: "invalid_signature" };
};

