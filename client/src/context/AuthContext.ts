import { createContext } from "react";

export const AuthContext = createContext<{
  isLoggedIn: boolean;
  userId: bigint | null;
  setUserId: (value: bigint | null) => void;
  setIsLoggedIn: (value: boolean) => void;
}>({
  isLoggedIn: false,
  userId: null,
  setUserId: () => {},
  setIsLoggedIn: () => {},
});
