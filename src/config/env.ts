declare const process: {
  env: Record<string, string | undefined>;
};

export const requiredServerEnvKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "QR_HMAC_SECRET",
  "NEXT_PUBLIC_APP_URL",
] as const;

export const optionalServerEnvKeys = [
  "STRIPE_IDENTITY_WEBHOOK_SECRET",
  "PAYPAL_CLIENT_ID",
  "PAYPAL_CLIENT_SECRET",
  "PAYPAL_WEBHOOK_ID",
  "RESEND_API_KEY",
  "NEXT_PUBLIC_ONESIGNAL_APP_ID",
  "ONESIGNAL_REST_API_KEY",
  "DEEPL_API_KEY",
  "GIPHY_API_KEY",
  "SPOTIFY_CLIENT_ID",
  "SPOTIFY_CLIENT_SECRET",
] as const;

export type RequiredServerEnvKey = (typeof requiredServerEnvKeys)[number];
export type OptionalServerEnvKey = (typeof optionalServerEnvKeys)[number];
export type EnvKey = RequiredServerEnvKey | OptionalServerEnvKey;

export type EnvValidationResult = {
  ok: boolean;
  missing: RequiredServerEnvKey[];
  optionalMissing: OptionalServerEnvKey[];
};

export const getEnv = (key: EnvKey): string => process.env[key] ?? "";

export const getPublicEnv = () => ({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  oneSignalAppId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID ?? "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
});

export const getServerEnv = () => ({
  supabaseServiceRoleKey: getEnv("SUPABASE_SERVICE_ROLE_KEY"),
  stripeSecretKey: getEnv("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: getEnv("STRIPE_WEBHOOK_SECRET"),
  stripeIdentityWebhookSecret: getEnv("STRIPE_IDENTITY_WEBHOOK_SECRET"),
  paypalClientId: getEnv("PAYPAL_CLIENT_ID"),
  paypalClientSecret: getEnv("PAYPAL_CLIENT_SECRET"),
  paypalWebhookId: getEnv("PAYPAL_WEBHOOK_ID"),
  resendApiKey: getEnv("RESEND_API_KEY"),
  oneSignalRestApiKey: getEnv("ONESIGNAL_REST_API_KEY"),
  qrHmacSecret: getEnv("QR_HMAC_SECRET"),
  deeplApiKey: getEnv("DEEPL_API_KEY"),
  giphyApiKey: getEnv("GIPHY_API_KEY"),
  spotifyClientId: getEnv("SPOTIFY_CLIENT_ID"),
  spotifyClientSecret: getEnv("SPOTIFY_CLIENT_SECRET"),
});

export const validateEnv = (): EnvValidationResult => {
  const missing = requiredServerEnvKeys.filter((key) => getEnv(key) === "");
  const optionalMissing = optionalServerEnvKeys.filter((key) => getEnv(key) === "");

  return {
    ok: missing.length === 0,
    missing,
    optionalMissing,
  };
};
