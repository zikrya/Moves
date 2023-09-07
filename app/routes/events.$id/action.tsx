import type { User } from "@prisma/client";
import type { ActionArgs } from "@remix-run/node";
import { redirect, typedjson } from "remix-typedjson";
import type Stripe from "stripe";
import { prisma } from "~/db.server";
import { requireUser } from "~/session.server";
import stripe from "~/stripe.server";
import type { ItemState } from "./useCart";

export const action = async ({ params, request }: ActionArgs) => {
  try {
    const eventId = params.id as string;
    const [event, user] = await Promise.all([
      prisma.event.findUniqueOrThrow({
        where: { id: eventId },
        include: {
          prices: {
            include: { _count: true },
          },
        },
      }),
      requireStripeCustomerId(request),
    ]);

    const items = (await request.json()) as ItemState[];
    const lineItems = items.map((item) => {
      const price = event.prices.find((price) => price.id === item.id);
      if (!price)
        throw new Error(
          `Invalid ticket type ${item.id} for event “${event.title}” (${event.id}).`
        );
      if (price.limit) {
        if (price._count.tickets >= price.limit) {
          throw new Error(`Ticket “${price.name}” is sold out.`);
        }
        if (price._count.tickets + item.quantity > price.limit) {
          throw new Error(
            `${item.quantity} tickets of type “${
              price.name
            }” were requested, but only ${
              price.limit - price._count.tickets
            } are available.`
          );
        }
      }
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: event.title,
            description: price.name,
          },
          unit_amount: price.price * 100,
        },
        quantity: item.quantity,
      } as Stripe.Checkout.SessionCreateParams.LineItem;
    });
    const checkoutSession = await stripe.checkout.sessions.create({
      success_url: `${process.env.WEBSITE_URL}/api/checkout/callback/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.WEBSITE_URL}/events/${eventId}`,
      mode: "payment",
      client_reference_id: user.id,
      customer: user.stripeCustomerId,
      allow_promotion_codes: true,
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: {
        eventId,
        items: JSON.stringify(items),
      },
    });
    return redirect(checkoutSession.url!);
  } catch (error) {
    return typedjson(
      { message: (error as Error).message ?? "Sorry, something went wrong." },
      { status: 500 }
    );
  }
};

const requireStripeCustomerId = async (request: ActionArgs["request"]) => {
  const user = await requireUser(request);
  if (user.stripeCustomerId) {
    return user as User & { stripeCustomerId: string };
  }
  const customer = await stripe.customers.create({ email: user.email });
  return (await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  })) as User & { stripeCustomerId: string };
};
