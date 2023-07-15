import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getUser } from "~/session.server";

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchUserStatus = async () => {
      const user = await getUser();
      setIsLoggedIn(Boolean(user));
    };

    fetchUserStatus();
  }, [location]);

  return (
    <UserContext.Provider value={{ isLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}
