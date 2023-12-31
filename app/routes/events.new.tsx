import type { Prisma } from "@prisma/client";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { json, redirect } from "@remix-run/server-runtime";
import { useRef, useState } from "react";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);
  return {};
};

export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);
  const {
    title,
    description,
    location,
    imageURL,
    startsAt,
    endsAt,
    refund,
    terms,
  } = Object.fromEntries(await request.formData()) as Record<
    keyof Prisma.EventCreateWithoutUserInput,
    string
  >;

  try {
    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        imageURL,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        refund,
        terms,
        user: {
          connect: { id: userId },
        },
      },
    });
    console.log("Event created", event);
    return redirect(`/events/${event.id}/edit`);
  } catch (error) {
    console.error("Error creating event:", error);
    return json({ error: `Error creating event: ${error}` }, { status: 500 });
  }
};

function ImageButton() {
  const [urls, setUrls] = useState<{ get: string; put: string }>();
  const [ready, setReady] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setReady(false);
    const { get, put } =
      urls ??
      (await fetch("/api/images", { method: "POST" }).then((res) =>
        res.json()
      ));
    setUrls({ get, put });
    await fetch(put, { method: "PUT", body: file });
    setReady(true);
  };

  return (
    <>
      <input
        type="file"
        name="image"
        itemType="image/*"
        className="hidden"
        ref={imageInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          upload(file).catch((err) => alert(err.message));
        }}
      />
      <div>
        <button
          type="button"
          className="mt-4 flex w-full justify-center rounded-md border border-transparent bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => imageInputRef.current?.click()}
        >
          Change photo
        </button>
        <p className="mt-2 text-xs leading-5 text-gray-400">
          JPG, GIF or PNG. 5 MB max.
        </p>
      </div>

      {ready && urls?.get && (
        <>
          <img src={urls.get} alt="" />
          <input type="url" name="imageURL" value={urls.get} />
        </>
      )}
    </>
  );
}

export default function NewEventForm() {
  const actionData = useActionData();

  return (
    <div className=" flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div
        className="blurred-background lg:h-[1200px]"
        style={{
          backgroundImage: `url(${"/FEATUR1-11-1024x576.jpeg"})`,
        }}
      ></div>
      <div className="w-full max-w-md rounded-lg bg-black p-8">
        <h2 className="mb-8 text-center text-3xl font-extrabold text-indigo-500">
          Create Event
        </h2>
        {actionData?.error && (
          <div className="mb-4 rounded bg-red-500 p-4 text-white">
            {actionData.error}
          </div>
        )}
        <Form method="POST" className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-indigo-500"
            >
              Event Name
            </label>
            <input
              id="title"
              name="title"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 shadow-sm"
            />
          </div>
          <ImageButton />
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-indigo-500"
            >
              Event Overview
            </label>
            <textarea
              id="terms"
              name="terms"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-indigo-500"
            >
              Event Description
            </label>
            <textarea
              id="description"
              name="description"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-indigo-500"
            >
              Event Location
            </label>
            <input
              id="location"
              name="location"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="startsAt"
              className="block text-sm font-medium text-indigo-500"
            >
              Starts At
            </label>
            <input
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="endsAt"
              className="block text-sm font-medium text-indigo-500"
            >
              Ends At
            </label>
            <input
              id="endsAt"
              name="endsAt"
              type="datetime-local"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 shadow-sm"
            />
          </div>
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-indigo-500"
            >
              Refund Policy
            </label>
            <input
              id="refund"
              name="refund"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 shadow-sm"
            />
          </div>
          <div>
            <button
              type="submit"
              className="mt-4 flex w-full justify-center rounded-md border border-transparent bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create Event
            </button>
          </div>
        </Form>
        <Link
          to="/events"
          className="mt-4 flex justify-center text-center text-sm text-gray-500 hover:text-gray-600"
        >
          Back to Events
        </Link>
      </div>
    </div>
  );
}
