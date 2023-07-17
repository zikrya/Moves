import { redirect, type LoaderArgs } from "@remix-run/node";
import { prisma } from "~/db.server";
import stripe from "~/stripe.server";

export const loader = async ({ params }: LoaderArgs) => {
  const sessionId = params.sessionId!;

  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
  const eventId = checkoutSession.metadata?.eventId as string;
  const priceId = checkoutSession.metadata?.priceId as string;
  const stripePaymentId = checkoutSession.payment_intent as string;
  const stripeCustomerId = checkoutSession.customer as string;

  if (checkoutSession.payment_status !== "paid") {
    return new Response("Payment failed", { status: 400 });
  }

  const ticket = await prisma.ticket.create({
    data: {
      stripePaymentId,
      event: { connect: { id: eventId } },
      price: { connect: { id: priceId } },
      user: { connect: { stripeCustomerId } },
    },
  });

  console.log("Created ticket:", ticket);

  return redirect(`/tickets/${ticket.id}`);
};
