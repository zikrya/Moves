import type { LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import { useState } from "react";
import PriceForm from "~/components/PriceForm";
import { requireUserId } from "~/session.server";
import { prisma } from "../db.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: params.id },
    include: {
      tickets: true,
      prices: true,
      user: true,
    },
  });

  if (event.userId !== userId) {
    throw new Response("You do not have access to this event", {
      status: 401,
      statusText: "Unauthorized",
    });
  }

  return json({ event });
};

export default function EditEventPage() {
  const { event } = useLoaderData<typeof loader>();
  const [isPriceFormOpen, setIsPriceFormOpen] = useState(false);

  return (
    <div>
      <h1 className="mt-8 text-center text-4xl font-extrabold">
        {event.title}
      </h1>
      <p className="text-md text-center">Edit Price</p>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {event.prices.map((price, index) => (
            <div key={index} className="mt-10 lg:mt-0">
              <h3 className="text-lg font-medium leading-6">{price.name}</h3>
              <div className="mt-8">
                <div className="flex items-center">
                  <span className="text-lg font-bold">
                    ${price.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-purple-600 px-5 py-3 text-base font-medium text-white hover:bg-indigo-700"
          onClick={() => setIsPriceFormOpen(true)}
        >
          Add Price
        </button>
        <PriceForm
          eventId={event.id}
          isOpen={isPriceFormOpen}
          onClose={() => setIsPriceFormOpen(false)}
        />
        <Link
          to="/events"
          className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-purple-600 px-5 py-3 text-base font-medium text-white hover:bg-indigo-700"
        >
          Done
        </Link>
        <Link
          to={`/events/${event.id}/scan`}
          className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-purple-600 px-5 py-3 text-base font-medium text-white hover:bg-indigo-700"
        >
          Scan Tickets
        </Link>
      </div>
    </div>
  );
}
