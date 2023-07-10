import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Host() {
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Creating event with name ${eventName} and description ${eventDescription}`);
    setEventName('');
    setEventDescription('');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Create Event</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="eventName" className="block mb-2">Event Name</label>
        <input
          id="eventName"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="block border p-2 rounded mb-4 w-full"
        />
        <label htmlFor="eventDescription" className="block mb-2">Event Description</label>
        <textarea
          id="eventDescription"
          value={eventDescription}
          onChange={(e) => setEventDescription(e.target.value)}
          className="block border p-2 rounded mb-4 w-full"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create Event</button>
      </form>
      <Link to="/events" className="inline-block mt-4 px-4 py-2 bg-red-600 text-white rounded">Back to Events</Link>
    </div>
  );
}
