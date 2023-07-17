import { prisma } from '../db.server';
import { json } from '@remix-run/server-runtime';
import { useLoaderData } from '@remix-run/react';

export const loader = async ({ params }) => {
    const event = await prisma.event.findUniqueOrThrow({
        where: { id: params.id },
    });
    return json({ event });
};

export default function Event() {
    const { event } = useLoaderData();

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">{event.title}</h1>
            <p>{event.description}</p>
        </div>
    );
}