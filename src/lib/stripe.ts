import Stripe from "stripe";

export const stripe = new Stripe(
  process.env.STRIPE_API_KEY || "api_key_placeholder"
);

export { Stripe };
