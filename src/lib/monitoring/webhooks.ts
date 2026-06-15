export type WebhookProvider = "stripe" | "paypal" | "stripe_identity";

export type WebhookSafetyResult = {
  provider: WebhookProvider;
  signatureVerified: boolean;
  idempotencyKey: string;
  auditLogged: boolean;
};

export const isWebhookSafeToProcess = (result: WebhookSafetyResult): boolean =>
  result.signatureVerified && result.idempotencyKey.length > 0 && result.auditLogged;
