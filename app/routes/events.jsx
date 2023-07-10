import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Events() {
  const [events, setEvents] = useState([
    { id: 1, name: 'Event 1', description: 'This is event 1.' },
    { id: 2, name: 'Event 2', description: 'This is event 2.' },
  ]);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Events</h1>
      <div className="grid grid-cols-3 gap-4">
        {events.map((event) => (
          <Link to={`/event/${event.id}`} key={event.id} className="block border p-4 rounded shadow">
            <h2 className="text-xl">{event.name}</h2>
            <p>{event.description}</p>
          </Link>
        ))}
      </div>
      <Link to="/host" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded">Create Event</Link>
    </div>
  );
}
