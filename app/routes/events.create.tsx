import { Autocomplete } from '@react-google-maps/api';
import { useMapsApiLoader } from '~/maps.client';

export default function Example() {
    const maps = useMapsApiLoader();

    return (
        <div className="isolate bg-gray-900 px-6 py-24 sm:py-32 lg:px-8 h-full">
            <div
                className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]"
                aria-hidden="true"
            >
                <div
                    className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-pink-600 to-indigo-400 opacity-30 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                />
            </div>
            <div className="flex flex-col h-full justify-center">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold text-white sm:text-4xl">Create an Event</h2>
                    <p className="mt-2 text-lg leading-8 text-gray-200">
                        Please provide the following information about your event.
                    </p>
                </div>
                <form action="#" method="POST" className="mx-auto mt-16 w-full max-w-xl sm:mt-20">
                    <div className="mx-auto w-full max-w-xl lg:max-w-lg">
                        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label htmlFor="name" className="block text-sm font-semibold leading-6 text-white">
                                    Event Name
                                </label>
                                <div className="mt-2.5">
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        className="block w-full rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="summary" className="block text-sm font-semibold leading-6 text-white">
                                    Short Description
                                </label>
                                <div className="mt-2.5">
                                    <input
                                        type="text"
                                        name="summary"
                                        id="summary"
                                        className="block w-full rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="location" className="block text-sm font-semibold leading-6 text-white">
                                    Location
                                </label>
                                <div className="mt-2.5">
                                    {maps.isLoaded ?
                                        <Autocomplete>
                                            <input
                                                type="text"
                                                name="location"
                                                id="location"
                                                placeholder=""
                                                className="block w-full rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                            />
                                        </Autocomplete>
                                        :
                                        <input
                                            type="text"
                                            name="location"
                                            id="location"
                                            className="block w-full rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                        />
                                    }
                                </div>
                            </div>
                            <div>
                                <label htmlFor="startsAt" className="block text-sm font-semibold leading-6 text-white">
                                    Starts At
                                </label>
                                <div className="mt-2.5">
                                    <input
                                        id="startsAt"
                                        name="startsAt"
                                        type="datetime-local"
                                        className="block w-full rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="endsAt" className="block text-sm font-semibold leading-6 text-white">
                                    Ends At
                                </label>
                                <div className="mt-2.5">
                                    <input
                                        id="endsAt"
                                        name="endsAt"
                                        type="datetime-local"
                                        className="block w-full rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-8">
                            <button
                                type="submit"
                                className="block w-full rounded-md bg-indigo-500 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
