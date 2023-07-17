import type { LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { json } from '@remix-run/server-runtime';
import { prisma } from '../db.server';

export const loader = async ({ params }: LoaderArgs) => {
    const event = await prisma.event.findUniqueOrThrow({
        where: { id: params.id },
    });
    return json({ event });
};

export default function Event() {
    const { event } = useLoaderData<typeof loader>();

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">{event.title}</h1>
            <p>{event.description}</p>
        </div>
    );
}