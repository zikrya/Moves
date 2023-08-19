import type { Price } from "@prisma/client";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import { useState } from "react";
import { prisma } from "~/db.server";
import { useEnv, useOptionalUser } from "~/utils";
import { Palette } from 'react-palette';

type PriceWithCount = SerializeFrom<Price & { _count: { tickets: number } }>;

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
  return json({ event, coordinates });
};

const isSoldOut = (price: PriceWithCount) =>
  price.quantity ? price._count.tickets >= price.quantity : false;

export default function Event() {
  const user = useOptionalUser();
  const { event, coordinates } = useLoaderData<typeof loader>();
  const { MAPS_API_KEY } = useEnv();
  const fetcher = useFetcher();
  const [showMap, setShowMap] = useState(false);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: MAPS_API_KEY,
  });
  const formattedStartsAt = new Date(event.startsAt).toLocaleString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  const formattedEndsAt = new Date(event.endsAt).toLocaleString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  const handleCheckout = (price: PriceWithCount) => {
    if (!isSoldOut(price)) {
      fetcher.submit(
        { priceId: price.id },
        {
          method: "POST",
          action: "/api/checkout",
        }
      );
    }
  };

  return (
    <Palette src={"/green-vibes-1-tropical-foliage-decor-art-anitas-and-bellas-art.jpeg"}>
      {({ data, loading, error }) => (
        <>
          <div
            className="blurred-background"
            style={{
              backgroundImage: `url(${"/green-vibes-1-tropical-foliage-decor-art-anitas-and-bellas-art.jpeg"})`,
            }}
          ></div>
          <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
            {user?.id === event.userId && (
              <Link
                to={`/events/${event.id}/edit`}
                className="your-component-btn 0 mt-4 flex w-full items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium underline sm:mt-0 sm:w-auto"
                style={{ color: `${data.darkVibrant}`}}
              >
                Edit Event
              </Link>
            )}
            <div className="your-component-container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="lg:order-2">
                <h1 className="your-component-title mt-2 text-3xl font-extrabold leading-8 tracking-tight text-white sm:text-4xl">
                  {event.title}
                </h1>
                <p className="your-component-date mt-2 text-lg text-white">
                  {formattedStartsAt}
                </p>

                <div className="mt-4 border-t-2 pt-4" style={{ borderColor: `${data.vibrant}`, boxShadow: `0 0 60px ${data.vibrant}80` }}>
                  <p className="text-white">{event.refund}</p>
                </div>

                <div className="items-center sm:flex-row">
                  <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
                    <div
                      className="inline-block transform overflow-hidden rounded-lg bg-black px-4 pb-4 pt-5 text-left align-bottom transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
                      style={{ boxShadow: `0 0 200px ${data.vibrant}80` }}
                    >
                      {event.prices &&
                        event.prices.map((price) => (
                          <div key={price.id}>
                            <p className="mt-2 text-sm text-white">
                              <span className="font-medium">Ticket Type: </span>
                              {price.name}
                            </p>
                            <p className="mt-2 text-sm text-white">
                              <span className="font-medium">Price: </span>$
                              {price.price}
                            </p>
                            <button
                              onClick={() => handleCheckout(price)}
                              disabled={isSoldOut(price)}
                              style={{
                                backgroundColor: isSoldOut(price)
                                  ? 'gray'
                                  : (fetcher.state === "submitting"
                                  ? data.vibrant
                                  : data.vibrant)
                              }}
                              className="flex w-full items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium text-white"
                            >
                              {isSoldOut(price)
                                ? "Sold Out"
                                : fetcher.state === "submitting"
                                ? "Processing..."
                                : "Buy Ticket"}
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:order-1">
                <img
                  src="/green-vibes-1-tropical-foliage-decor-art-anitas-and-bellas-art.jpeg"
                  alt={event.title}
                  className="h-56 w-full rounded-lg object-cover lg:h-auto"
                />
              </div>
            </div>
            <div className="mx-auto my-6 max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex">
                <Link
                  to={`https://www.google.com/maps/search/?api=1&query=${
                    event.location ? encodeURIComponent(event.location) : ""
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr-4"
                  style={{ color: `${data.vibrant}` }}
                >
                  {event.location}
                </Link>
                {coordinates && isLoaded && (
                  <>
                    <button
                      onClick={() => setShowMap((prev) => !prev)}
                      className="btn btn-primary mt-2 text-purple-600"
                    >
                      {showMap ? "Hide Map" : "Show Map"}
                    </button>
                    {showMap && (
                      <div className="h-[300px] w-[400px]">
                        <GoogleMap
                          mapContainerStyle={{
                            width: "400px",
                            height: "300px",
                          }}
                          center={coordinates}
                          zoom={10}
                        >
                          <Marker position={coordinates} />
                        </GoogleMap>
                      </div>
                    )}
                  </>
                )}
                <div className="my-auto h-6 border-l" style={{ borderColor: `${data.vibrant}`}}></div>
                <p className="ml-4 text-white">
                  {formattedStartsAt}
                  <br />- {formattedEndsAt}
                </p>
              </div>
              <p className="your-component-description mt-4 max-w-2xl text-xl text-white">
                {event.description}
              </p>
            </div>
          </div>
        </>
      )}
    </Palette>
  );
}
