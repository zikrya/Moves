import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <main>
      <div className="relative isolate overflow-hidden bg-gray-900 pb-16 pt-14 sm:pb-20">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
            <div className="hidden sm:mb-8 sm:flex sm:justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-400 ring-1 ring-white/10 hover:ring-white/20">
                <Link to="" className="font-semibold text-white"><span className="absolute inset-0" aria-hidden="true"></span>Learn More <span aria-hidden="true">&rarr;</span></Link>
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">Your Affordable Solution for Effortless Event Ticketing</h1>
              <p className="mt-6 text-lg leading-8 text-gray-300">Welcome to the new era of event management, where our platform streamlines the ticketing process, makes organizing events effortless, and all at a significantly lower cost - because we believe that exceptional service shouldn't come with a hefty price tag.</p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link to="/host" className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400">Get started</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
