import { json, type ActionArgs } from "@remix-run/node";
import { prisma } from "~/db.server";
import { requireUserId } from "~/session.server";

export const action = async ({ params, request }: ActionArgs) => {
  const userId = await requireUserId(request);

  const eventId = params.id as string;
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const price = Number(formData.get("price") as string);
  const limit = Number(formData.get("limit") as string);

  const event = await prisma.event.findUniqueOrThrow({
    where: { id: eventId },
    select: { userId: true },
  });

  if (event.userId !== userId) {
    throw new Response("You do not have access to this event", {
      status: 401,
      statusText: "Unauthorized",
    });
  }

  await prisma.price.create({
    data: {
      name,
      price,
      limit,
      event: {
        connect: {
          id: eventId,
        },
      },
    },
  });

  return json({ success: true }, { status: 201 });
};
