import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { useRef, useState } from "react";
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
      include: { event: true, user: true, price: true },
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
    if (ticket.usedAt) {
      return json(
        { valid: false, message: `Ticket already used at ${ticket.usedAt.toDateString()}` },
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
  const result = useActionData<typeof action>();
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = useSubmit();
  const lastTicketIdRef = useRef<string>();

  const handleStartCamera = () => {
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
    if (lastTicketIdRef.current === ticketId) {
      return;
    }
    lastTicketIdRef.current = ticketId;
    submit({ ticketId }, { method: "POST" });
    setError(null);
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
            scanDelay={100}
          />
          <button onClick={() => setIsActive(false)}>Stop Scanner</button>
        </>
      ) : (
        <button onClick={handleStartCamera}>Start Scanner</button>
      )}
      {result && (
        <div>
          <p className="text-2xl font-bold">
            {result.valid ? "Valid Ticket" : "Invalid Ticket"}
          </p>
          <p>{"message" in result && result.message}</p>
          {"ticket" in result && (
            <div>
              <p className="text-gray-700">
                <span className="font-bold">Email: </span>
                {result.ticket.user.email}
              </p>
              <p className="text-gray-700">
                <span className="font-bold">Price: </span>
                {result.ticket.price.name} - ${result.ticket.price.price}
              </p>
              <p className="text-gray-700">
                <span className="font-bold">Purchase Date: </span>
                {new Date(result.ticket.createdAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
