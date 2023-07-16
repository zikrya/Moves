import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useOptionalUser } from "../utils";

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const user = useOptionalUser();
  const isLoggedIn = Boolean(user);
  const location = useLocation();

  return (
    <UserContext.Provider value={{ isLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}
