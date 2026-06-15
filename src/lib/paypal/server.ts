import { getServerEnv } from "../../config/env";

export const getPayPalServerConfig = () => {
  const env = getServerEnv();

  return {
    clientId: env.paypalClientId,
    clientSecret: env.paypalClientSecret,
    webhookId: env.paypalWebhookId,
  };
};

