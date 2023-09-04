import type { LoaderArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import { requireUserId } from "~/session.server";
import { prisma } from "../db.server";
import QRCode from "react-qr-code";

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const ticket = await prisma.ticket.findUniqueOrThrow({
    where: { id: params.id },
    include: {
      event: true,
      price: true,
      user: true,
    },
  });
  if (ticket.userId !== userId && ticket.event.userId !== userId) {
    throw new Response("You don't have permission to view this ticket.", {
      status: 403,
    });
  }
  return json(ticket);
};

export default function Event() {
  const { event, price, ...ticket } = useLoaderData<typeof loader>();

  const verificationUrl = `http://localhost:3000/${ticket.id}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-200 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="text-center text-3xl font-bold text-gray-800">Ticket</h1>
        <QRCode value={verificationUrl} className="mx-auto my-4" />

        <p className="text-gray-700">
          <span className="font-bold">Price: </span>
          {price.name} - ${price.price}
        </p>
        <p className="text-gray-700">
          <span className="font-bold">Purchase Date: </span>
          {new Date(ticket.createdAt).toLocaleString()}
        </p>
        <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">
          User
        </h2>
        <p className="text-gray-700">
          <span className="font-bold">Email: </span>
          {ticket.user.email}
        </p>
        <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">
          Event
        </h2>
        <p className="text-gray-700">
          <span className="font-bold">Event: </span>
          {event.title}
        </p>
        <p className="text-gray-700">
          <span className="font-bold">Date: </span>
          {event.startsAt.toLocaleString()}
        </p>
        <p className="text-gray-700">
          <span className="font-bold">Location: </span>
          {event.location}
        </p>
      </div>
    </div>
  );
}
