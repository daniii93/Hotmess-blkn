export type HotmessEnvironment = "development" | "staging" | "production";

export type EnvironmentProviderKeys = {
  supabaseProject: string;
  stripeKeys: string;
  paypalKeys: string;
  resendKey: string;
  oneSignalApp: string;
  appUrl: string;
  qrSecret: string;
};

export const requiredEnvironmentKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "PAYPAL_CLIENT_ID",
  "PAYPAL_CLIENT_SECRET",
  "RESEND_API_KEY",
  "QR_HMAC_SECRET",
  "NEXT_PUBLIC_APP_URL",
] as const;

export const environments: readonly HotmessEnvironment[] = ["development", "staging", "production"];

export const isProductionEnvironment = (environment: HotmessEnvironment): boolean =>
  environment === "production";
