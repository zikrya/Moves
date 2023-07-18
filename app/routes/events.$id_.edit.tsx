import type { LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
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
      <h1>Edit Event</h1>
      <pre>{JSON.stringify(event, null, 2)}</pre>
      <button
        className="rounded bg-blue-600 px-4 py-2 text-white"
        onClick={() => setIsPriceFormOpen(true)}
      >
        Add Price
      </button>
      <PriceForm
        eventId={event.id}
        isOpen={isPriceFormOpen}
        onClose={() => setIsPriceFormOpen(false)}
      />
    </div>
  );
}
