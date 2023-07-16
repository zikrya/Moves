import { useLoaderData } from '@remix-run/react';
import { Link } from 'react-router-dom';
import { prisma } from '../db.server';
import { requireUserId } from '../session.server';

export const loader = async ({ request }) => {
  const userId = await requireUserId(request);

  const events = await prisma.event.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return { events };
};

export default function Events() {
  const { events } = useLoaderData();

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Events</h1>
      <div className="grid grid-cols-3 gap-4">
        {events.map((event) => (
          <Link to={`/event/${event.id}`} key={event.id} className="block border p-4 rounded shadow">
            <h2 className="text-xl">{event.title}</h2>
            <p>{event.description}</p>
          </Link>
        ))}
      </div>
      <Link to="/host" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        Create Event
      </Link>
    </div>
  );
}


