
import type { LoaderFunction } from '@remix-run/node';
import { json } from "@remix-run/server-runtime";
import { prisma } from "../db.server";

export let loader: LoaderFunction = async ({ params }) => {
  const ticketId = params.ticketId;

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: true,
        price: true,
        user: true,
      },
    });

    if (!ticket) {
      return json({ message: 'Ticket not found' }, { status: 404 });
    }

    if (ticket && ticket.event && ticket.user) {
      return json({ message: 'Ticket is valid', ticket });
    } else {
      return json({ message: 'Ticket is invalid' }, { status: 400 });
    }
  } catch (error) {
    console.error('Validation failed:', error);
    return json({ message: 'Internal server error' }, { status: 500 });
  }
};

export default function Validate() {
  return null;
}
