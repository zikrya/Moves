import { XCircleIcon } from "@heroicons/react/20/solid";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Palette } from "react-palette";
import { useTypedActionData, useTypedLoaderData } from "remix-typedjson";
import { useMapsApiLoader } from "~/maps.client";
import { useOptionalUser } from "~/utils";
import { action } from "./action";
import { loader } from "./loader";
import { useCart } from "./useCart";

export { action, loader };

export default function EventPage() {
  const user = useOptionalUser();
  const { event, coordinates } = useTypedLoaderData<typeof loader>();
  const actionData = useTypedActionData<typeof action>();
  const { allItems, cart, checkout, state } = useCart();
  const [showMap, setShowMap] = useState(false);
  const maps = useMapsApiLoader();
  const [isErrorShown, setIsErrorShown] = useState(false);

  useEffect(() => {
    if (actionData?.message) {
      setIsErrorShown(true);
    }
  }, [actionData]);

  const formattedStartsAt = event.startsAt.toLocaleString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  const formattedEndsAt = event.endsAt.toLocaleString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  return (
    <Palette src={event.imageURL!}>
      {({ data, loading, error }) => (
        <>
          <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8">
            {/* TOP HALF */}
            <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
              <div className="relative lg:w-1/2">
                <div
                  className="blurred-background lg:h-[1000vh]"
                  style={{
                    backgroundImage: `url(${event.imageURL!})`,
                  }}
                ></div>
                <img
                  src={event.imageURL!}
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
                  {allItems.map((price) => (
                    <div
                      key={price.id}
                      className="mb-4 flex w-full flex-row justify-between"
                    >
                      <p className="block text-sm text-white">
                        <span className="font-medium">{price.name}: </span>$
                        {price.price}
                      </p>
                      <div className="flex flex-row justify-between gap-2 text-white">
                        {price.isAvailable ? (
                          <>
                            <button
                              className="h-8 w-8 rounded-full"
                              style={{ backgroundColor: data.vibrant }}
                              onClick={() => cart.remove(price.id)}
                              disabled={price.quantity === 0}
                              aria-label="Remove Ticket"
                            >
                              -
                            </button>
                            <p>{price.quantity}</p>
                            <button
                              className="h-8 w-8 rounded-full"
                              style={{ backgroundColor: data.vibrant }}
                              onClick={() => cart.add(price.id)}
                              aria-label="Add Ticket"
                            >
                              +
                            </button>
                          </>
                        ) : (
                          <p>Sold Out</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {cart.quantity > 0 && (
                    <div>
                      <p className="text-lg font-bold text-white">Cart</p>
                      {cart.items.map((item) => (
                        <div
                          key={item.id}
                          className="mb-4 flex flex-row justify-between text-sm text-white"
                        >
                          <p className="font-medium">
                            {item.name}:{" "}
                            <span className="font-normal text-gray-400">
                              {item.quantity}
                            </span>
                          </p>
                          <div className="flex flex-col items-end">
                            <p>${item.price * item.quantity}</p>
                            {item.quantity > 1 && (
                              <p className="text-gray-400">
                                ${item.price} each
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      <p className="text-sm text-white">
                        <span className="font-medium">Total: </span> $
                        {cart.total}
                      </p>
                      <button
                        onClick={checkout}
                        disabled={state === "loading"}
                        className="rounded p-3 text-white"
                        style={{ backgroundColor: data.vibrant }}
                      >
                        {state === "loading" ? "Loading..." : "Checkout"}
                      </button>
                    </div>
                  )}
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
                    to={`https://www.google.com/maps/search/?api=1&query=${event.location ? encodeURIComponent(event.location) : ""
                      }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mr-4"
                    style={{ color: `${data.vibrant}` }}
                  >
                    {event.location}
                  </Link>
                  {coordinates && maps.isLoaded && (
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
          <div
            className={
              "sticky bottom-0 left-0 right-0 flex flex-row justify-between bg-red-600 p-3 shadow-sm" +
              (isErrorShown ? "" : " opacity-0")
            }
          >
            <div>
              <p className="text-white">
                <span className="font-bold">Error:</span>{" "}
                {actionData?.message ?? "Sorry, something went wrong."}
              </p>
            </div>
            <div>
              <button onClick={() => setIsErrorShown(false)}>
                <XCircleIcon className="h-6 w-6 text-white" title="Close" />
              </button>
            </div>
          </div>
        </>
      )}
    </Palette>
  );
}
