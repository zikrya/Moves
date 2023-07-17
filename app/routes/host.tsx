import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { Form, Link, useActionData } from '@remix-run/react';
import { json, redirect } from '@remix-run/server-runtime';
import { prisma } from "../db.server";
import { requireUserId } from '../session.server';
import * as fs from 'fs/promises';
import * as path from 'path';


export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);
  return {};
};

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const location = formData.get('location') as string;
  const date = formData.get('eventDate') as string; // eventDate should match the name attribute in the form
  const price = Number(formData.get('price') as string);
  const numOfTics = Number(formData.get('numOfTics') as string);

  try {
    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        date,
        numOfTics,
        user: {
          connect: { id: userId },
        },
        prices: {
          // By defining the price as a relationship, we can support multiple prices for an event (e.g. VIP, General Admission, etc.)
          create: {
            name: "General Admission",
            price,
          }
        }
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
    <div className="bg-purple-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg p-8">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">Create Event</h2>
        {actionData?.error && (
          <div className="bg-red-500 text-white p-4 rounded mb-4">
            {actionData.error}
          </div>
        )}
        <Form method="POST" className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Event Name</label>
            <input
              id="title"
              name="title"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base text-gray-900"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Event Description</label>
            <textarea
              id="description"
              name="description"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base text-gray-900"
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Event Location</label>
            <input
              id="location"
              name="location"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base text-gray-900"
            />
          </div>
          <div>
            <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700">Event Date</label>
            <input
              id="eventDate"
              name="eventDate"
              type="date"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base text-gray-900"
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Ticket Price</label>
            <input
              id="price"
              name="price"
              type="number"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base text-gray-900"
            />
          </div>
          <div>
            <label htmlFor="numOfTics" className="block text-sm font-medium text-gray-700">Number of Tickets</label>
            <input
              id="numOfTics"
              name="numOfTics"
              type="number"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-base text-gray-900"
            />
          </div>
          <div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Create Event</button>
          </div>
        </Form>
        <Link to="/events" className="flex justify-center mt-4 text-sm text-center text-gray-500 hover:text-gray-600">Back to Events</Link>
      </div>
    </div>
  );
}
