import { redirect, type LoaderArgs } from "@remix-run/node";
import { prisma } from "~/db.server";
import stripe from "~/stripe.server";
import type { ItemState } from "./events.$id/useCart";
import type { Prisma } from "@prisma/client";

export const loader = async ({ params }: LoaderArgs) => {
  const sessionId = params.sessionId!;

  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
  const eventId = checkoutSession.metadata?.eventId as string;
  const stripePaymentId = checkoutSession.payment_intent as string;
  const userId = checkoutSession.client_reference_id as string;
  const items = JSON.parse(
    checkoutSession.metadata?.items as string
  ) as ItemState[];

  if (checkoutSession.payment_status !== "paid") {
    return new Response("Payment failed", { status: 400 });
  }

  const tickets: Prisma.TicketCreateManyTransactionInput[] = [];

  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) {
      tickets.push({
        priceId: item.id,
        userId,
        eventId,
      });
    }
  }

  const transaction = await prisma.transaction.create({
    data: {
      stripePaymentId,
      event: { connect: { id: eventId } },
      user: { connect: { id: userId } },
      tickets: {
        createMany: {
          data: tickets,
        },
      },
    },
  });

  return redirect(`/transactions/${transaction.id}`);
};
