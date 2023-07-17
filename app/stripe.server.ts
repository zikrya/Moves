import { Stripe } from "stripe";
import invariant from "tiny-invariant";

invariant(
  process.env.STRIPE_SECRET_KEY,
  "Missing STRIPE_SECRET_KEY environment variable"
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export default stripe;
