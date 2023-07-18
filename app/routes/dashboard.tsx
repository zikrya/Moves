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
    <div className="min-h-screen bg-purple-50 px-4 py-5">
      <h1 className="mb-10 text-4xl font-semibold">Dashboard</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-2xl font-semibold">My Events</h2>
          {!user.events.length && (
            <p className="text-gray-600">You don't have any events yet.</p>
          )}
          {user.events.map((event) => (
            <div
              key={event.id}
              className="mb-4 rounded-lg bg-white px-5 py-6 shadow"
            >
              <Link
                to={`/events/${event.id}`}
                className="text-lg font-medium text-blue-600 hover:text-blue-800"
              >
                {event.title}
              </Link>
            </div>
          ))}
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-semibold">My Tickets</h2>
          {!user.tickets.length && (
            <p className="text-gray-600">You don't have any tickets yet.</p>
          )}
          {user.tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="mb-4 rounded-lg bg-white px-5 py-6 shadow"
            >
              <Link
                to={`/tickets/${ticket.id}`}
                className="text-lg font-medium text-blue-600 hover:text-blue-800"
              >
                {ticket.event.title} - {ticket.price.name} -{" "}
                {ticket.price.price}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
