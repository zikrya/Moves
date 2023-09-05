import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import type { OnResultFunction } from "react-qr-reader";
import { QrReader } from "react-qr-reader";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const id = params.id as string;
  const event = await prisma.event.findUniqueOrThrow({ where: { id } });
  if (event.userId !== userId) {
    throw new Response("You don't have permission to view this event.", {
      status: 403,
    });
  }
  return json(event);
};

export const action = async ({ params, request }: ActionArgs) => {
  await requireUserId(request);

  const eventId = params.id as string;
  const ticketId = await request
    .formData()
    .then((data) => data.get("ticketId") as string);

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { event: true, user: true },
    });

    if (!ticket) {
      return json(
        { valid: false, message: "Invalid ticket ID" },
        { status: 404 }
      );
    }
    if (ticket.eventId !== eventId) {
      return json(
        { valid: false, message: "Ticket does not belong to this event" },
        { status: 400 }
      );
    }
    if (ticket.validatedAt) {
      return json(
        { valid: false, message: "Ticket already validated" },
        { status: 400 }
      );
    }
    return json({ valid: true, ticket });
  } catch (error) {
    console.error("Validation failed:", error);
    return json(
      { valid: false, message: "Internal server error" },
      { status: 500 }
    );
  }
};

export default function ScanPage() {
  const event = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestPermission = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => {
        setIsActive(true);
      })
      .catch((error) => {
        setError("Media error: " + error.message);
      });
  };

  const handleResult: OnResultFunction = (result, error) => {
    if (error) {
      setError(error.message);
      return;
    }
    const ticketId = result?.getText()?.split("/").pop();
    if (!ticketId) {
      setError("Invalid QR code");
      return;
    }
    setError(null);
    const data = { ticketId };
    fetcher.submit(data, { action: "/api/validate" });
  };

  return (
    <div className="mx-auto max-w-prose">
      <h1 className="mt-8 text-center text-4xl font-extrabold">
        {event.title}: Scan Tickets
      </h1>
      {isActive ? (
        <>
          <QrReader
            onResult={handleResult}
            constraints={{ height: 400, width: 400 }}
          />
          <button onClick={() => setIsActive(false)}>Stop Scanner</button>
        </>
      ) : (
        <button onClick={handleRequestPermission}>Start Scanner</button>
      )}
      {fetcher.data && (
        <div>
          <p>{fetcher.data.valid ? "Valid Ticket" : "Invalid Ticket"}</p>
          <p>{"message" in fetcher.data && fetcher.data.message}</p>
          {"ticket" in fetcher.data && (
            <div>
              <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">
                User
              </h2>
              <p className="text-gray-700">
                <span className="font-bold">Email: </span>
                {fetcher.data.ticket.user.email}
              </p>
            </div>
          )}
        </div>
      )}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
