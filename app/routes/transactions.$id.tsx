import type { LoaderArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const transaction = await prisma.transaction.findUniqueOrThrow({
    where: { id: params.id },
    include: {
      tickets: { include: { price: true } },
      event: true,
      _count: true,
    },
  });
  if (transaction.userId !== userId) {
    throw new Error("You do not have permission to view this transaction.");
  }
  return typedjson({ transaction });
};

export default function TransactionPage() {
  const { transaction } = useTypedLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-prose">
      <h1 className="text-xl font-bold">Thank you!</h1>
      <p>
        Your purchase of {transaction._count.tickets} tickets for{" "}
        {transaction.event.title} was successful.
      </p>

      <h2 className="mt-8 text-lg font-bold">Tickets</h2>
      <ul>
        {transaction.tickets.map((ticket) => (
          <li key={ticket.id}>
            <Link to={`/tickets/${ticket.id}`}>{ticket.price.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
