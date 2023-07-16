import { Link } from 'react-router-dom';
import { useLoaderData } from '@remix-run/react';
import { getSession } from '../session.server';
import { prisma } from '../db.server';

export const loader = async ({ request }) => {
  const session = await getSession(request);

  if (!session.userId) {
    return { events: [] }; // Return empty events if not authenticated
  }

  try {
    const events = await prisma.event.findMany({
      where: { userId: session.userId }, // Fetch only the events of the logged in user
    });
    return { events };
  } catch (error) {
    console.error('Error fetching events:', error);
    return { events: [] };
  } finally {
    await prisma.$disconnect();
  }
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


