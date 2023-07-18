import type { LoaderArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import { prisma } from "../db.server";

export const loader = async ({ params }: LoaderArgs) => {
  // TODO: Handle multiple prices.

  const { prices, ...event } = await prisma.event.findUniqueOrThrow({
    where: { id: params.id },
    include: {
      prices: { include: { _count: true } },
      user: true,
    },
  });

  const price = prices[0];
  const isSoldOut = price.quantity
    ? price._count.tickets >= price.quantity
    : false;

  return json({ event, price, isSoldOut });
};

export default function Event() {
  const { event, price, isSoldOut } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const handleCheckout = () => {
    if (isSoldOut) return;
    fetcher.submit(
      { priceId: price.id },
      {
        method: "POST",
        action: "/api/checkout",
      }
    );
  };

  return (
    <div className="min-h-screen bg-purple-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h1 className="mt-2 text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl">
            {event.title}
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-700 lg:mx-auto">
            {event.description}
          </p>
        </div>

        <div className="mt-10">
          <div className="overflow-hidden rounded-lg shadow-lg">
            <div className="bg-white px-6 py-8 sm:p-10 sm:pb-6">
              {event.imageURL && (
                <img
                  src={event.imageURL}
                  className="mb-8 h-56 w-full object-cover"
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
                      <span className="font-medium">Price: </span>${price.price}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      <span className="font-medium">Host: </span>
                      {event.user.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-8 sm:p-10 sm:pt-6">
              <div>
                <button
                  onClick={handleCheckout}
                  disabled={isSoldOut}
                  className={`flex w-full items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium ${
                    isSoldOut
                      ? "bg-gray-400 text-gray-700"
                      : fetcher.state === "submitting"
                      ? "bg-blue-400"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isSoldOut
                    ? "Sold Out"
                    : fetcher.state === "submitting"
                    ? "Processing..."
                    : "Buy Ticket"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
