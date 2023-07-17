import type { LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/server-runtime';
import { prisma } from '../db.server';

export const loader = async ({ params }: LoaderArgs) => {
    const event = await prisma.event.findUniqueOrThrow({
        where: { id: params.id },
    });
    return json({ event });
};

export default function Event() {
    const { event } = useLoaderData<typeof loader>();

    return (
        <div className="bg-gray-200 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full bg-white p-8 rounded-lg space-y-6 shadow-md">
            <h1 className="text-3xl text-center font-bold text-gray-800 mb-4">{event.title}</h1>
            {event.imageUrl && (
              <img
                src={event.imageUrl}
                className="mt-4 object-cover w-full h-56 rounded-lg shadow-lg"
                alt={event.title}
              />
            )}
            <p className="text-gray-700">{event.description}</p>
            <div className="flex flex-wrap justify-between mt-4">
              <p className="text-sm text-gray-600">
                <span className="font-bold">Location: </span>
                {event.location}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-bold">Date: </span>
                {event.date}
              </p>
            </div>
            <div className="mt-6">
              <a
                href={event.ticketLink}
                className="block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-center"
              >
                Get Tickets
              </a>
            </div>
          </div>
        </div>
      );

}