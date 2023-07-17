import { Form, Link, useActionData } from '@remix-run/react';
import { json, redirect } from '@remix-run/server-runtime';
import { requireUserId } from '../session.server';
import { prisma } from "../db.server";

export const loader = async ({ request }) => {
  await requireUserId(request);
  return {};
};

export const action = async ({ request }) => {
  const userId = await requireUserId(request);
  const { title, description } = Object.fromEntries(await request.formData());
  try {
    const event = await prisma.event.create({
      data: {
        title,
        description,
        user: {
          connect: { id: userId },
        },
      },
    });
    console.log('Event created', event);
    return redirect(`/events/${event.id}`);
  } catch (error) {
    console.error('Error creating event:', error);
    return json({ error: `Error creating event: ${error}` }, { status: 500 });
  }
}

export default function Host() {
  const actionData = useActionData();

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Create Event</h1>
      {actionData?.error && (
        <div className="bg-red-500 text-white p-4 rounded mb-4">
          {actionData.error}
        </div>
      )}
      <Form method="POST">
        <label htmlFor="title" className="block mb-2">Event Name</label>
        <input
          id="title"
          name="title"
          className="block border p-2 rounded mb-4 w-full"
        />
        <label htmlFor="description" className="block mb-2">Event Description</label>
        <textarea
          id="description"
          name="description"
          className="block border p-2 rounded mb-4 w-full"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create Event</button>
      </Form>
      <Link to="/events" className="inline-block mt-4 px-4 py-2 bg-red-600 text-white rounded">Back to Events</Link>
    </div>
  );
}
