import { Link } from "@remix-run/react";
import { useNavigate } from "@remix-run/react";
import { useUserContext } from '../components/UserContext';
const NavBar = () => {
    const { isLoggedIn } = useUserContext();
    let navigate = useNavigate();
    const handleLogout = () => {
      navigate("/logout");
    };
    return (
        <nav className="flex items-center justify-between p-6 lg:px-8 bg-slate-300" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5">
          <h1 className="text-2xl font-mono text-black">Moves</h1>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button type="button" className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400">
            <span className="sr-only">Open main menu</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          <Link to="/events" className="text-sm font-semibold leading-6 text-white">Events</Link>
          <Link to="/host" className="text-sm font-semibold leading-6 text-white">Host</Link>
          <Link to="#" className="text-sm font-semibold leading-6 text-white">Help</Link>
          <Link to="join" className="text-sm font-semibold leading-6 text-white">Sign Up</Link>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
  {isLoggedIn ? (
    <button
      onClick={handleLogout}
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

export default NavBar;