import { useLoaderData } from "@remix-run/react";
import { Link } from "react-router-dom";
import { prisma } from "../db.server";

export const loader = async () => {
  const events = await prisma.event.findMany({
    include: { tickets: true, prices: true },
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
        <h1 className="relative mb-4 inline-block text-2xl text-white after:absolute after:bottom-0 after:left-1/4 after:h-[1px] after:w-1/2 after:bg-indigo-500 after:content-['']">
          Featured Events
        </h1>
      </div>

      {/* Carousel */}
      <div className="mb-8 overflow-hidden">
        <div className="flex space-x-4">
          {carouselEvents.map((event) => (
            <Link
              to={`/events/${event.id}`}
              key={event.id}
              className="relative block h-60 w-full max-w-xl transform rounded border border-black bg-cover bg-center p-4 shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-xl"
              style={{ backgroundImage: `url('/image-nightlife.jpg')` }}
            >
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black p-4 opacity-60">
                <h2 className="text-xl text-white">{event.title}</h2>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="text-center">
          <h1 className="relative mb-4 inline-block text-2xl text-white after:absolute after:bottom-0 after:left-1/4 after:h-[1px] after:w-1/2 after:bg-indigo-500 after:content-['']">
            Events
          </h1>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {events.map((event) => (
            <Link
              to={`/events/${event.id}`}
              key={event.id}
              className="relative block h-60 transform rounded rounded-md border border-black bg-cover bg-center p-4 shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-xl"
              style={{ backgroundImage: `url('/image-nightlife.jpg')` }}
            >
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black p-4 opacity-60">
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
