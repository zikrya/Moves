import type { LoaderArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";
import { prisma } from "~/db.server";

export const loader = async ({ params }: LoaderArgs) => {
  const event = await prisma.event.findUniqueOrThrow({
    where: { id: params.id },
    include: {
      prices: {
        include: {
          _count: true,
        },
      },
      user: true,
    },
  });
  const coordinates = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      event.location!
    )}&key=${process.env.MAPS_API_KEY}`
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "OK") {
        return data.results[0].geometry.location as {
          lat: number;
          lng: number;
        };
      }
      throw new Error(data.status);
    })
    .catch((err) => {
      console.error(`Geocoding failed for location "${event.location}"`, err);
      return null;
    });
  return typedjson({ event, coordinates });
};
