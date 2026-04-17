import { createContext } from "react";

export const AuthContext = createContext<{
  isLoggedIn: boolean;
  isInitializing: boolean;
  userId: bigint | null;
  setUserId: (value: bigint | null) => void;
  setIsLoggedIn: (value: boolean) => void;
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  isSupport: boolean;
  setIsSupport: (value: boolean) => void;
}>({
  isLoggedIn: false,
  isInitializing: true,
  userId: null,
  setUserId: () => {},
  setIsLoggedIn: () => {},
  isAdmin: false,
  setIsAdmin: () => {},
  isSupport: false,
  setIsSupport: () => {},
});
