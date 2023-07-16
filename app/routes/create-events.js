import { PrismaClient } from '@prisma/client';
import { json } from '@remix-run/node';
import { getSession } from '../session.server';

const prisma = new PrismaClient();

export const action = async ({ request }) => {
  const session = await getSession(request);
  if (!session.userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { eventName, eventDescription } = await request.json();

  try {
    // Create event
    const event = await prisma.event.create({
      data: {
        title: eventName,
        description: eventDescription,
        user: {
          connect: { id: session.userId },
        },
      },
    });

    return json({ success: true });
  } catch (error) {
    console.error('Error creating event:', error);
    return json({ error: 'Error creating event' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
};
