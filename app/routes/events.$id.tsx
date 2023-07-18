import type { LoaderArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import { prisma } from "../db.server";

export const loader = async ({ params }: LoaderArgs) => {
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: params.id },
    include: {
      tickets: true,  // Updated to include all tickets
      prices: true,  // Updated to include all prices
      user: true,
    },
  });

  const ticketsCounts = await Promise.all(event.prices.map(async (price) => {
    return {
      id: price.id,
      count: await prisma.ticket.count({
        where: {
          priceId: price.id,  // Count tickets per price
        },
      }),
    };
  }));

  return json({ event, ticketsCounts });
};

export default function Event() {
  const { event, ticketsCounts } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const handleCheckout = (priceId: string) => {
    if (!isSoldOut(priceId)) {
      fetcher.submit(
        { priceId },
        {
          method: "POST",
          action: "/api/checkout",
        }
      );
    }
  };

  const isSoldOut = (priceId: string) =>
    ticketsCounts.find((tc) => tc.id === priceId).count >=
    event.prices.find((price) => price.id === priceId).numOfTics;

  return (
    <div className="bg-purple-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h1 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {event.title}
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-700 lg:mx-auto">
            {event.description}
          </p>
        </div>

        <div className="mt-10">
          <div className="rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-8 bg-white sm:p-10 sm:pb-6">
              {event.imageURL && (
                <img
                  src={event.imageURL}
                  className="h-56 w-full object-cover mb-8"
                  alt={event.title}
                />
              )}
              <div className="sm:flex sm:items-start sm:justify-between">
                <div className="sm:flex sm:space-x-5">
                  <div className="mt-4 text-center sm:mt-0 sm:text-left">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Location: </span>
                      {event.location}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      <span className="font-medium">Date: </span>
                      {event.date}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      <span className="font-medium">Host: </span>
                      {event.user.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-8 bg-gray-50 sm:p-10 sm:pt-6">
              {event.prices && event.prices.map((type) => (
                <div key={type.id}>
                  <p className="mt-2 text-sm text-gray-500">
                    <span className="font-medium">Ticket Type: </span>
                    {type.name}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    <span className="font-medium">Price: </span>
                    ${type.price}
                  </p>
                  <button
                    onClick={() => handleCheckout(type.id)}
                    disabled={isSoldOut(type.id)}
                    className={`w-full border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium ${
                      isSoldOut(type.id)
                        ? "bg-gray-400 text-gray-700"
                        : fetcher.state === "submitting"
                        ? "bg-blue-400"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {isSoldOut(type.id)
                      ? "Sold Out"
                      : fetcher.state === "submitting"
                      ? "Processing..."
                      : "Buy Ticket"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

