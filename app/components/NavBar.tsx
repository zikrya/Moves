import { Link, NavLink, useFetcher, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useOptionalUser } from "../utils";

const NAV_LINKS = [
  { title: "Events", href: "/events" },
  { title: "Host", href: "/host" },
  { title: "Dashboard", href: "/dashboard" },
  { title: "Sign Up", href: "/join" },
];

const NavBar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="flex items-center justify-between p-6 lg:px-8 bg-gray-600" aria-label="Global">
      <MobileMenu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />

      <div className="flex lg:flex-1">
        <NavLink to="/" className="-m-1.5 p-1.5">
          <h1 className="text-2xl font-mono text-white">Moves</h1>
        </NavLink>
      </div>
      <div className="flex lg:hidden">
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
        >
          <span className="sr-only">Open main menu</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>
      <div className="hidden lg:flex lg:gap-x-12">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className="text-sm font-semibold leading-6 text-white"
          >
            {link.title}
          </Link>
        ))}
      </div>
      <div className="hidden lg:flex lg:flex-1 lg:justify-end">
        {isAuthenticated ? (
          <button
            onClick={logout}
            className="text-sm font-semibold leading-6 text-white"
          >
            Log out <span aria-hidden="true">&rarr;</span>
          </button>
        ) : (
          <Link to="/login" className="text-sm font-semibold leading-6 text-white">
            Log in <span aria-hidden="true">&rarr;</span>
          </Link>
        )}
      </div>
    </nav>
  );
}

const MobileMenu = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (isOpen: boolean) => void }) => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <aside className="bg-white absolute inset-x-0 top-0 z-50">
      <div className={isOpen ? "lg:hidden" : "hidden"} role="dialog" aria-modal="true">
        <div className="fixed inset-0 z-50"></div>
        <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link to="/" className="-m-1.5 p-1.5">
              <h1 className="text-2xl font-mono text-white">Moves</h1>
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.href}
                    to={link.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    {link.title}
                  </NavLink>
                ))}
              </div>
              <div className="py-6">
                {isAuthenticated ? (
                  <button
                    onClick={logout}
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    Log out
                  </button>
                ) : (
                  <Link to="/login" className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">Log in</Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside >
  );
};

const useAuth = () => {
  const user = useOptionalUser();
  const fetcher = useFetcher();

  const isAuthenticated = user != null;
  const logout = () => {
    fetcher.submit(null, { action: "/logout", method: "POST" });
  };

  return { user, isAuthenticated, logout };
};

export default NavBar;