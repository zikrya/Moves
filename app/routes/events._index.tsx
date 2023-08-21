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

  const carouselEvents = events.slice(0, 5);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900">
      {/* Gradient Background */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>
      <br />
      <div className="text-center">
    <h1 className="mb-4 text-2xl text-white inline-block relative after:content-[''] after:absolute after:h-[1px] after:w-1/2 after:bg-indigo-500 after:bottom-0 after:left-1/4">Featured Events</h1>
</div>

{/* Carousel */}
<div className="mb-8 overflow-hidden">
    <div className="flex space-x-4">
      {carouselEvents.map((event) => (
        <Link
            to={`/events/${event.id}`}
            key={event.id}
            className="relative block rounded border border-black p-4 shadow-md hover:shadow-xl transform hover:scale-105 transition-transform duration-300 h-60 bg-cover bg-center rounded-md max-w-xl w-full"
            style={{ backgroundImage: `url('/image-nightlife.jpg')` }}
        >
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black opacity-60">
                <h2 className="text-xl text-white">{event.title}</h2>
            </div>
        </Link>
      ))}
    </div>
</div>

      <div className="p-4">
      <div className="text-center">
    <h1 className="mb-4 text-2xl text-white inline-block relative after:content-[''] after:absolute after:h-[1px] after:w-1/2 after:bg-indigo-500 after:bottom-0 after:left-1/4">Events</h1>
</div>
        <div className="grid grid-cols-3 gap-4">
          {events.map((event) => (
            <Link
                to={`/events/${event.id}`}
                key={event.id}
                className="relative block rounded border border-black p-4 shadow-md hover:shadow-xl transform hover:scale-105 transition-transform duration-300 h-60 bg-cover bg-center rounded-md"
                style={{ backgroundImage: `url('/image-nightlife.jpg')` }}
            >
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black opacity-60">
                    <h2 className="text-xl text-white">{event.title}</h2>
                </div>

                {/* List tickets and prices */}
                {event.tickets.map((ticket) => (
                    <div key={ticket.id} className="hidden">
                        <p>
                            <strong>Ticket ID:</strong> {ticket.id}
                        </p>
                    </div>
                ))}
            </Link>
          ))}
        </div>
        <Link
          to="/events/new"
          className="mt-4 inline-block rounded bg-purple-600 px-4 py-2 text-white"
        >
          Create Event
        </Link>
      </div>
    </div>
  );
}

