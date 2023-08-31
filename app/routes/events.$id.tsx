import type { Price } from "@prisma/client";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import { useEffect, useState } from "react";
import { prisma } from "~/db.server";
import { useEnv, useOptionalUser } from "~/utils";
import { Palette } from "react-palette";

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

  useEffect(() => {
    const blurredBackground = document.querySelector(
      ".blurred-background"
    ) as HTMLElement;
    if (blurredBackground) {
      blurredBackground.style.filter = "none";
      blurredBackground.style.backgroundColor = "your-color-here";
    }
  }, []);

  return (
    <Palette src={"/image-nightlife.jpg"}>
      {({ data, loading, error }) => (
        <>
          <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
            {/* TOP HALF */}
            <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
              <div className="relative lg:w-1/2">
                <div
                  className="blurred-background lg:h-[1000vh]"
                  style={{
                    backgroundImage: `url(${"/image-nightlife.jpg"})`,
                  }}
                ></div>
                <img
                  src="/image-nightlife.jpg"
                  alt={event.title}
                  className="h-56 w-full object-cover lg:h-auto lg:rounded-lg"
                />
                <br />
                <br />
                {user?.id === event.userId && (
                  <Link
                    to={`/events/${event.id}/edit`}
                    className="absolute bottom-0 left-0 mt-4 flex w-full items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium underline sm:mt-0 sm:w-auto"
                    style={{ color: `${data.darkVibrant}` }}
                  >
                    Edit Event
                  </Link>
                )}
              </div>
              <div className="mt-20 flex h-full flex-col justify-end lg:mt-32 lg:w-1/2 lg:pl-8">
                <h1 className="text-3xl font-extrabold leading-8 tracking-tight text-white sm:text-4xl">
                  {event.title}
                </h1>
                <p className="mt-2 text-lg text-white">{formattedStartsAt}</p>
                <div
                  className="mt-8 inline-block transform overflow-hidden rounded-lg bg-black px-4 pb-4 pt-5 text-left align-bottom transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
                  style={{ boxShadow: `0 0 200px ${data.vibrant}80` }}
                >
                  {event.prices &&
                    event.prices.map((price) => (
                      <div key={price.id} className="mb-4">
                        <p className="text-sm text-white">
                          <span className="font-medium">Ticket Type: </span>
                          {price.name}
                        </p>
                        <p className="text-sm text-white">
                          <span className="font-medium">Price: </span> $
                          {price.price}
                        </p>
                        <button
                          onClick={() => handleCheckout(price)}
                          disabled={isSoldOut(price)}
                          style={{
                            backgroundColor: isSoldOut(price)
                              ? "gray"
                              : fetcher.state === "submitting"
                              ? data.vibrant
                              : data.vibrant,
                          }}
                          className="mt-2 flex w-full items-center justify-center rounded-md border border-transparent px-8 py-3 text-base font-medium text-white"
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

            <div className="mt-4 flex justify-center">
              <div
                className="w-1/2 border-t-2 pt-4"
                style={{ borderColor: `${data.vibrant}` }}
              ></div>
            </div>

            {/* BOTTOM HALF with a black background */}
            <div className="contain mx-auto my-6 max-w-7xl bg-black px-4 sm:px-6 lg:px-8">
              <div className="your-component-container">
                <div className="flex items-center lg:order-1">
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
                  <div
                    className="my-auto h-6 border-l"
                    style={{ borderColor: `${data.vibrant}` }}
                  ></div>
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
          </div>
        </>
      )}
    </Palette>
  );
}
