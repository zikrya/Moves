import type { LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import { prisma } from "~/db.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const ticketId = params.id;
  const ticket = await prisma.ticket.findUniqueOrThrow({
    where: { id: ticketId },
    include: {
      event: true,
      price: true,
      user: true,
    },
  });

  return json(ticket);
};

export default function TicketVerification() {
  const { event, price } = useLoaderData();

  return (
    <div>
      <h1>Ticket Verification</h1>
      <p>Event: {event.title}</p>
      <p>
        Price: {price.name} - ${price.price}
      </p>
      <p>Location: {event.location}</p>
    </div>
  );
}
