import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "@remix-run/react";

import { getUser } from "~/session.server";
import stylesheet from "~/tailwind.css";
import NavBar from "./components/NavBar";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  {
    rel: "stylesheet",
    href: "https://api.fontshare.com/css?f[]=general-sans@400,500,600,700&display=swap",
  },
];

export const loader = async ({ request }: LoaderArgs) => {
  return json({
    user: await getUser(request),
    ENV: {
      NODE_ENV: process.env.NODE_ENV,
      MAPS_API_KEY: process.env.MAPS_API_KEY,
    },
  });
};

export default function App() {
  const location = useLocation();
  const showNavBar = location.pathname !== "/";

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        {showNavBar && <NavBar />}
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
