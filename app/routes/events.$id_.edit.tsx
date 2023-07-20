import type { LoaderArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState } from "react";
import PriceForm from "~/components/PriceForm";
import { requireUserId } from "~/session.server";
import { prisma } from "../db.server";
import { json } from "@remix-run/server-runtime";

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
    <div className="blue-back">
      <h1 className="text-4xl text-center font-extrabold text-white mt-8">{event.title}</h1>
      <p className="text-md text-center text-white">{event.description}</p>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {event.prices.map((price, index) => (
            <div key={index} className="mt-10 lg:mt-0">
              <h3 className="text-lg leading-6 font-medium text-white">{price.name}</h3>
              <div className="mt-8">
                <div className="flex items-center">
                  <span className="font-bold text-lg text-white">
                    ${price.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-indigo-700"
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
          className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-indigo-700"
        >
          Done
        </Link>
      </div>
    </div>
  );

}


