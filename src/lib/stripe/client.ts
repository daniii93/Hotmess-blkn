import { getPublicEnv } from "../../config/env";

export const getStripePublishableKey = (): string => getPublicEnv().stripePublishableKey;

