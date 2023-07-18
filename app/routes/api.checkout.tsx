// In the future, you’ll be able to buy tickets without leaving our website or signing in.
// For now, we’ll just redirect to Stripe Checkout.

import { redirect, type ActionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";
import stripe from "~/stripe.server";

invariant(process.env.WEBSITE_URL, "Missing WEBSITE_URL environment variable");

export const action = async ({ request }: ActionArgs) => {
  const priceId = await request
    .formData()
    .then((data) => data.get("priceId") as string);
  const userId = await requireUserId(request); // TODO: Allow anonymous checkout.

  const stripeCustomerId = await prisma.user
    .findUniqueOrThrow({ where: { id: userId } })
    .then(async (user) => {
      if (user.stripeCustomerId) return user.stripeCustomerId;
      const customer = await stripe.customers.create({ email: user.email });
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id },
      });
      return customer.id;
    });

  const { event, ...price } = await prisma.price.findUniqueOrThrow({
    where: { id: priceId },
    include: {
      event: true,
      _count: true
    },
  });

  if (price.quantity && price._count.tickets >= price.quantity) {
    throw new Error("The event is sold out");
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    success_url: `${process.env.WEBSITE_URL}/api/checkout/callback/{CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.WEBSITE_URL}/events/${event.id}`,
    mode: "payment",
    client_reference_id: userId,
    customer: stripeCustomerId,
    allow_promotion_codes: true,
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: event.title,
            description: price.name,
          },
          unit_amount: price.price * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      eventId: event.id,
      priceId: price.id,
    },
  });

  return redirect(checkoutSession.url!);
};
