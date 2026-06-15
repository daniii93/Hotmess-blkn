import Stripe from "stripe";
import { getServerEnv } from "../../config/env";

export const createStripeServerClient = () =>
  new Stripe(getServerEnv().stripeSecretKey, {
    typescript: true,
  });
