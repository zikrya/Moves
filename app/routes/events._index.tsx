import type { LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Link } from "react-router-dom";
import { prisma } from "../db.server";
import { requireUserId } from "../session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);

  const events = await prisma.event.findMany({
    where: { userId },
    include: { tickets: true, prices: true }, // Include tickets and prices
    orderBy: { createdAt: "desc" },
  });
  return { events };
};

export default function Events() {
  const { events } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-purple-50">
      <div className="p-4">
        <h1 className="mb-4 text-2xl">Events</h1>
        <div className="grid grid-cols-3 gap-4">
          {events.map((event) => (
            <Link
              to={`/events/${event.id}`}
              key={event.id}
              className="block rounded border p-4 shadow"
            >
              <h2 className="text-xl">{event.title}</h2>
              <p>{event.description}</p>
              {/* List tickets and prices */}
              {event.tickets.map((ticket) => (
                <div key={ticket.id}>
                  <p>
                    <strong>Ticket ID:</strong> {ticket.id}
                  </p>
                </div>
              ))}
              {event.prices.map((price) => (
                <div key={price.id}>
                  <p>
                    <strong>Price:</strong> ${price.price}
                  </p>
                </div>
              ))}
            </Link>
          ))}
        </div>
        <Link
          to="/events/new"
          className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white"
        >
          Create Event
        </Link>
      </div>
    </div>
  );
}
