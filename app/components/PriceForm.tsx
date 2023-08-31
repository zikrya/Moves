import { Dialog, Transition } from "@headlessui/react";
import { TicketIcon } from "@heroicons/react/24/outline";
import { useFetcher } from "@remix-run/react";
import React, { useEffect, useRef, useState, Fragment } from "react";

export type PriceFormProps = {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function PriceForm({
  eventId,
  isOpen,
  onClose,
}: PriceFormProps) {
  const fetcher = useFetcher();
  const cancelButtonRef = useRef(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (fetcher.data?.success) {
      setIsSubmitted(true);
    }
  }, [fetcher.data]);

  // Check for isSubmitted in your useEffect
  useEffect(() => {
    if (isSubmitted) {
      onClose();
      setIsSubmitted(false); // Reset the state back to false after closing the form
    }
  }, [isSubmitted, onClose]);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-black text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <fetcher.Form
                  method="POST"
                  action={`/api/events/${eventId}/prices`}
                >
                  <div className="bg-black px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="bg-indgio-500 mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10">
                        <TicketIcon
                          className="h-6 w-6 text-indigo-600"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 text-indigo-600"
                        >
                          Create New Price
                        </Dialog.Title>
                        <div className="my-2">
                          <p className="text-sm text-indigo-600">
                            Create a new price for this event.
                          </p>
                        </div>
                        <div className="mb-2">
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium leading-6 text-indigo-600"
                          >
                            Name
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              className="block w-full rounded-md border-0 py-1.5 text-indigo-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              placeholder="General Admission"
                              required
                            />
                          </div>
                        </div>
                        <div className="mb-2">
                          <label
                            htmlFor="price"
                            className="block text-sm font-medium leading-6 text-indigo-600"
                          >
                            Price
                          </label>
                          <div className="mt-1">
                            <input
                              type="number"
                              name="price"
                              id="price"
                              className="block w-full rounded-md border-0 py-1.5 text-indigo-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              placeholder="10"
                              required
                            />
                          </div>
                        </div>
                        <div className="mb-2">
                          <label
                            htmlFor="quantity"
                            className="block text-sm font-medium leading-6 text-indigo-600"
                          >
                            Quantity
                          </label>
                          <div className="mt-1">
                            <input
                              type="number"
                              name="quantity"
                              id="quantity"
                              className="block w-full rounded-md border-0 py-1.5 text-indigo-600 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              placeholder="50"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black bg-black px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="submit"
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                      disabled={fetcher.state === "submitting"}
                    >
                      {fetcher.state === "submitting" ? "Saving..." : "Save"}
                    </button>
                  </div>
                </fetcher.Form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
