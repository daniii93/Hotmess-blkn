import { getEnv } from "../../config/env";

export const getPayPalClientConfig = () => ({
  clientId: getEnv("PAYPAL_CLIENT_ID"),
});

