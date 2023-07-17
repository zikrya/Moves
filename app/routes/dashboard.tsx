import { json, type LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      events: {
        orderBy: {
          createdAt: "desc",
        },
      },
      tickets: {
        include: {
          price: true,
          event: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
  return json(user);
};

export default function DashboardPage() {
  const user = useLoaderData<typeof loader>();

  // In the future, the dashboard will be for hosts only and show events, sales, etc.
  // We’ll add a separate place for attendees to show their tickets and account info.
  // For now, we’ll just dump everything here.

  return (
    <div>
      <h1>Dashboard</h1>
      <h2>My Events</h2>
      {!user.events.length && <p>You don't have any events yet.</p>}
      <ul className="list-inside list-disc">
        {user.events.map((event) => (
          <li key={event.id}>
            <Link
              to={`/events/${event.id}`}
              className="text-blue-600 hover:underline"
            >
              {event.title}
            </Link>
          </li>
        ))}
      </ul>
      <h2>My Tickets</h2>
      {!user.tickets.length && <p>You don't have any tickets yet.</p>}
      <ul className="list-inside list-disc">
        {user.tickets.map((ticket) => (
          <li key={ticket.id}>
            <Link
              to={`/tickets/${ticket.id}`}
              className="text-blue-600 hover:underline"
            >
              {ticket.event.title} - {ticket.price.name} - {ticket.price.price}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
