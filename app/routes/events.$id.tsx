import type { LoaderArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import { prisma } from "../db.server";

export const loader = async ({ params }: LoaderArgs) => {
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: params.id },
    include: {
      prices: true,
      user: true,
    },
  });
  return json({ event });
};

export default function Event() {
  const { event } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const handleCheckout = () => {
    // TODO: Handle multiple prices.
    fetcher.submit(
      { priceId: event.prices[0].id },
      {
        method: "POST",
        action: "/api/checkout",
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-200 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-4 text-center text-3xl font-bold text-gray-800">
          {event.title}
        </h1>
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            className="mt-4 h-56 w-full rounded-lg object-cover shadow-lg"
            alt={event.title}
          />
        )}
        <p className="text-gray-700">{event.description}</p>
        <div className="mt-4 flex flex-wrap justify-between">
          <p className="text-sm text-gray-600">
            <span className="font-bold">Location: </span>
            {event.location}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-bold">Date: </span>
            {event.date}
          </p>
          <p className="text-sm text-gray-600">
            {/* In the future, we'll want a way to show different ticket types. */}
            <span className="font-bold">Price: </span>${event.prices[0].price}
          </p>
          <p className="text-sm text-gray-600">
            {/* In the future, we’ll want events to be associated with an organizer (e.g. Kappa Sigma). */}
            {/* We can show their name here and link to their profile page. */}
            <span className="font-bold">Host: </span>
            {event.user.email}
          </p>
        </div>
        <div className="mt-6">
          <button
            onClick={handleCheckout}
            className="block rounded-lg bg-blue-500 px-4 py-2 text-center font-semibold text-white hover:bg-blue-600"
          >
            {fetcher.state === "submitting" ? "Processing..." : "Buy Ticket"}
          </button>
        </div>
      </div>
    </div>
  );
}
