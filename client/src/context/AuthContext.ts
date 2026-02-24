import { createContext } from "react";

export const AuthContext = createContext<{
  isLoggedIn: boolean;
  userId: bigint | null;
  setUserId: (value: bigint | null) => void;
  setIsLoggedIn: (value: boolean) => void;
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
}>({
  isLoggedIn: false,
  userId: null,
  setUserId: () => {},
  setIsLoggedIn: () => {},
  isAdmin: false,
  setIsAdmin: () => {},
});
